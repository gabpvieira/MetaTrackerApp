export const config = { runtime: "edge" };

type InsightJSON = {
  meta: { faltante: number; prazoDias: number; moeda: "BRL" };
  rotas: {
    nome: string; alvoTotal: number;
    itens: { oferta: string; preco: number; unidades: number; canal: string }[];
    checklist: string[];
    kpis: { contatosDia: number; taxaConversaoEsperada: number };
  }[];
  combos: { descricao: string; componentes: { oferta: string; preco: number; unidades: number }[]; total: number }[];
  plano: { dia: string; blocos: string[] }[];
  scripts: { canal: string; mensagem: string }[];
  metricas?: { nome: string; valor: string }[];
  proximaAcao5Min: string;
} | null;

const OK = (data: any, init: ResponseInit = {}) =>
  new Response(JSON.stringify(data), {
    status: init.status ?? 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
      ...(init.headers || {}),
    },
  });

const ERR = (status: number, message: string, details?: any) => OK({ ok: false, error: message, details }, { status });

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return OK({ ok: true });
  if (req.method !== "POST") return ERR(405, "Method not allowed");

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const ASSISTANT_ID   = process.env.OPENAI_ASSISTANT_ID;

  if (!OPENAI_API_KEY || !ASSISTANT_ID) {
    return ERR(500, "OPENAI_API_KEY/OPENAI_ASSISTANT_ID não configurados no ambiente.");
  }

  let body: any;
  try { body = await req.json(); } catch { return ERR(400, "JSON inválido."); }

  const { threadId, faltante, prazoDias, perfil } = body || {};
  if (!threadId || typeof faltante !== "number" || typeof prazoDias !== "number" || typeof perfil !== "string") {
    return ERR(400, "Parâmetros obrigatórios: threadId, faltante (number), prazoDias (number), perfil (string).");
  }

  const openaiHeaders = {
    "Authorization": `Bearer ${OPENAI_API_KEY}`,
    "Content-Type": "application/json",
    "OpenAI-Beta": "assistants=v2"
  };

  try {
    // 1. Adicionar mensagem ao thread
    const messagePayload = {
      role: "user",
      content: `Preciso gerar R$ ${faltante} em ${prazoDias} dias. Meu perfil: ${perfil}. 

Por favor, crie um plano detalhado com:
- Rotas de monetização (Baixo/Médio/Alto risco) com checklists
- Combos de ofertas
- Plano diário estruturado
- Scripts por canal
- Próxima ação em 5 minutos

Retorne em formato JSON estruturado conforme o schema InsightJSON.`
    };

    const addMessageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: "POST",
      headers: openaiHeaders,
      body: JSON.stringify(messagePayload)
    });

    if (!addMessageResponse.ok) {
      const error = await addMessageResponse.text();
      return ERR(500, "Erro ao adicionar mensagem ao thread", error);
    }

    // 2. Criar e executar run
    const runPayload = {
      assistant_id: ASSISTANT_ID,
      instructions: "Analise a solicitação e retorne um plano detalhado em JSON seguindo exatamente o schema InsightJSON fornecido."
    };

    const createRunResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: "POST",
      headers: openaiHeaders,
      body: JSON.stringify(runPayload)
    });

    if (!createRunResponse.ok) {
      const error = await createRunResponse.text();
      return ERR(500, "Erro ao criar run", error);
    }

    const run = await createRunResponse.json();
    const runId = run.id;

    // 3. Polling até completar (máximo 60 segundos)
    let attempts = 0;
    const maxAttempts = 30; // 30 * 2s = 60s
    let runStatus = "queued";

    while (attempts < maxAttempts && !["completed", "failed", "cancelled", "expired"].includes(runStatus)) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Aguarda 2 segundos
      
      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        headers: openaiHeaders
      });

      if (!statusResponse.ok) {
        return ERR(500, "Erro ao verificar status do run");
      }

      const statusData = await statusResponse.json();
      runStatus = statusData.status;
      attempts++;
    }

    if (runStatus !== "completed") {
      return ERR(408, `Run não completou a tempo. Status: ${runStatus}`);
    }

    // 4. Buscar mensagens do thread
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages?order=desc&limit=1`, {
      headers: openaiHeaders
    });

    if (!messagesResponse.ok) {
      return ERR(500, "Erro ao buscar mensagens");
    }

    const messagesData = await messagesResponse.json();
    const lastMessage = messagesData.data[0];
    
    if (!lastMessage || lastMessage.role !== "assistant") {
      return ERR(500, "Nenhuma resposta do assistente encontrada");
    }

    const content = lastMessage.content[0]?.text?.value || "";
    
    // 5. Tentar extrair JSON da resposta
    let insightJSON: InsightJSON = null;
    try {
      // Procurar por JSON na resposta
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insightJSON = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn("Erro ao parsear JSON da resposta:", e);
    }

    return OK({
      ok: true,
      textoHumano: content,
      insightJSON,
      threadId,
      runId
    });

  } catch (error) {
    console.error("Erro na API gerar-recursos:", error);
    return ERR(500, "Erro interno do servidor", error.message);
  }
}