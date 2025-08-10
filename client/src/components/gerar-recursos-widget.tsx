import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, Target, DollarSign, Calendar, MessageSquare, CheckCircle2, Clock } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

type InsightJSON = {
  meta: { faltante: number; prazoDias: number; moeda: "BRL" }
  rotas: {
    nome: string
    alvoTotal: number
    itens: { oferta: string; preco: number; unidades: number; canal: string }[]
    checklist: string[]
    kpis: { contatosDia: number; taxaConversaoEsperada: number }
  }[]
  combos: { descricao: string; componentes: { oferta: string; preco: number; unidades: number }[]; total: number }[]
  plano: { dia: string; blocos: string[] }[]
  scripts: { canal: string; mensagem: string }[]
  metricas?: { nome: string; valor: string }[]
  proximaAcao5Min: string
} | null

type ChecklistState = {
  [rotaIndex: number]: {
    [itemIndex: number]: boolean
  }
}

export function GerarRecursosWidget() {
  const [isLoading, setIsLoading] = useState(false)
  const [faltante, setFaltante] = useState('')
  const [prazoDias, setPrazoDias] = useState('')
  const [perfil, setPerfil] = useState('')
  const [resultado, setResultado] = useState<{
    textoHumano: string
    insightJSON: InsightJSON
  } | null>(null)
  const [checklistState, setChecklistState] = useState<ChecklistState>({})

  // Carregar estado dos checklists do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('gerar-recursos-checklist')
    if (saved) {
      try {
        setChecklistState(JSON.parse(saved))
      } catch (e) {
        console.warn('Erro ao carregar checklist do localStorage:', e)
      }
    }
  }, [])

  // Salvar estado dos checklists no localStorage
  useEffect(() => {
    if (Object.keys(checklistState).length > 0) {
      localStorage.setItem('gerar-recursos-checklist', JSON.stringify(checklistState))
    }
  }, [checklistState])

  const handleChecklistChange = (rotaIndex: number, itemIndex: number, checked: boolean) => {
    setChecklistState(prev => ({
      ...prev,
      [rotaIndex]: {
        ...prev[rotaIndex],
        [itemIndex]: checked
      }
    }))
  }

  const gerarRecursos = async () => {
    if (!faltante || !prazoDias || !perfil) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos antes de gerar recursos.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      // Criar um thread ID simples (em produção, você pode querer usar um UUID)
      const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const response = await fetch('/api/gerar-recursos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          threadId,
          faltante: parseFloat(faltante),
          prazoDias: parseInt(prazoDias),
          perfil
        })
      })

      const data = await response.json()

      if (!data.ok) {
        throw new Error(data.error || 'Erro ao gerar recursos')
      }

      setResultado({
        textoHumano: data.textoHumano,
        insightJSON: data.insightJSON
      })

      // Limpar checklist anterior
      setChecklistState({})

      toast({
        title: "Recursos gerados com sucesso!",
        description: "Seu plano personalizado foi criado."
      })

    } catch (error) {
      console.error('Erro ao gerar recursos:', error)
      toast({
        title: "Erro ao gerar recursos",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRiskColor = (nome: string) => {
    if (nome.toLowerCase().includes('baixo')) return 'bg-green-500/20 text-green-400 border-green-500/30'
    if (nome.toLowerCase().includes('médio') || nome.toLowerCase().includes('medio')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    if (nome.toLowerCase().includes('alto')) return 'bg-red-500/20 text-red-400 border-red-500/30'
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  }

  return (
    <Card className="bg-card-bg border border-card-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Target className="h-5 w-5 text-primary" />
          Gerar Recursos
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Crie um plano personalizado para atingir sua meta financeira
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulário */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="faltante" className="text-white">Valor necessário (R$)</Label>
            <Input
              id="faltante"
              type="number"
              placeholder="5000"
              value={faltante}
              onChange={(e) => setFaltante(e.target.value)}
              className="bg-input border-input-border text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prazo" className="text-white">Prazo (dias)</Label>
            <Input
              id="prazo"
              type="number"
              placeholder="30"
              value={prazoDias}
              onChange={(e) => setPrazoDias(e.target.value)}
              className="bg-input border-input-border text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="perfil" className="text-white">Perfil/Área</Label>
            <Input
              id="perfil"
              placeholder="Ex: Designer freelancer"
              value={perfil}
              onChange={(e) => setPerfil(e.target.value)}
              className="bg-input border-input-border text-white"
            />
          </div>
        </div>

        <Button 
          onClick={gerarRecursos} 
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando recursos...
            </>
          ) : (
            'Gerar Recursos'
          )}
        </Button>

        {/* Resultados */}
        {resultado && (
          <div className="space-y-6">
            <Separator className="bg-border" />
            
            {/* Próxima Ação em 5 min */}
            {resultado.insightJSON?.proximaAcao5Min && (
              <Card className="bg-primary/10 border-primary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-primary text-sm">
                    <Clock className="h-4 w-4" />
                    Próxima Ação (5 minutos)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white text-sm">{resultado.insightJSON.proximaAcao5Min}</p>
                </CardContent>
              </Card>
            )}

            {/* Rotas de Monetização */}
            {resultado.insightJSON?.rotas && resultado.insightJSON.rotas.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Rotas de Monetização
                </h3>
                <div className="grid gap-4">
                  {resultado.insightJSON.rotas.map((rota, rotaIndex) => (
                    <Card key={rotaIndex} className="bg-card-bg border border-card-border">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white text-base">{rota.nome}</CardTitle>
                          <Badge className={getRiskColor(rota.nome)}>
                            R$ {rota.alvoTotal.toLocaleString('pt-BR')}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Checklist */}
                        {rota.checklist && rota.checklist.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-white">Checklist:</h4>
                            <div className="space-y-2">
                              {rota.checklist.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`checklist-${rotaIndex}-${itemIndex}`}
                                    checked={checklistState[rotaIndex]?.[itemIndex] || false}
                                    onCheckedChange={(checked) => 
                                      handleChecklistChange(rotaIndex, itemIndex, checked as boolean)
                                    }
                                    className="border-input-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                  />
                                  <label 
                                    htmlFor={`checklist-${rotaIndex}-${itemIndex}`}
                                    className={`text-sm cursor-pointer ${
                                      checklistState[rotaIndex]?.[itemIndex] 
                                        ? 'text-muted-foreground line-through' 
                                        : 'text-white'
                                    }`}
                                  >
                                    {item}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* KPIs */}
                        {rota.kpis && (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Contatos/dia:</span>
                              <span className="ml-2 text-white font-medium">{rota.kpis.contatosDia}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Taxa conversão:</span>
                              <span className="ml-2 text-white font-medium">{(rota.kpis.taxaConversaoEsperada * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Combos */}
            {resultado.insightJSON?.combos && resultado.insightJSON.combos.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Combos Prontos
                </h3>
                <div className="grid gap-3">
                  {resultado.insightJSON.combos.map((combo, index) => (
                    <Card key={index} className="bg-card-bg border border-card-border">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-white text-sm">{combo.descricao}</p>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            R$ {combo.total.toLocaleString('pt-BR')}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {combo.componentes.map((comp, i) => (
                            <span key={i}>
                              {comp.oferta} (R$ {comp.preco} x {comp.unidades})
                              {i < combo.componentes.length - 1 ? ' + ' : ''}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Plano Diário */}
            {resultado.insightJSON?.plano && resultado.insightJSON.plano.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Plano Diário
                </h3>
                <div className="grid gap-3">
                  {resultado.insightJSON.plano.map((dia, index) => (
                    <Card key={index} className="bg-card-bg border border-card-border">
                      <CardContent className="pt-4">
                        <h4 className="text-white font-medium mb-2">{dia.dia}</h4>
                        <ul className="space-y-1">
                          {dia.blocos.map((bloco, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <CheckCircle2 className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                              {bloco}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Scripts por Canal */}
            {resultado.insightJSON?.scripts && resultado.insightJSON.scripts.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Scripts por Canal
                </h3>
                <div className="grid gap-3">
                  {resultado.insightJSON.scripts.map((script, index) => (
                    <Card key={index} className="bg-card-bg border border-card-border">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            {script.canal}
                          </Badge>
                        </div>
                        <Textarea
                          value={script.mensagem}
                          readOnly
                          className="bg-input border-input-border text-white text-sm resize-none"
                          rows={3}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Texto Humano (se não houver JSON estruturado) */}
            {!resultado.insightJSON && resultado.textoHumano && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Resposta do Assistente</h3>
                <Card className="bg-card-bg border border-card-border">
                  <CardContent className="pt-4">
                    <pre className="text-sm text-white whitespace-pre-wrap">{resultado.textoHumano}</pre>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}