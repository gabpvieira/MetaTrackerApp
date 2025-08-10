import { useState } from "react";
import { useFinanceStore } from "@/stores/finance-store";
import { downloadFile, parseFile } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, FileArchive } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Backup() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { exportData, importData } = useFinanceStore();
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportedData = await exportData();
      const filename = `backup-financas-${format(new Date(), "yyyy-MM-dd-HHmm", { locale: ptBR })}.json`;
      downloadFile(exportedData, filename);
      
      toast({
        title: "Backup criado com sucesso!",
        description: "Seus dados foram exportados e criptografados.",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível criar o backup.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const content = await parseFile(file);
      await importData(content);
      
      toast({
        title: "Backup restaurado com sucesso!",
        description: "Seus dados foram importados e descriptografados.",
      });
      
      // Clear the input
      event.target.value = "";
    } catch (error) {
      console.error("Import failed:", error);
      toast({
        title: "Erro ao importar",
        description: "Não foi possível restaurar o backup. Verifique se o arquivo está correto.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="p-6" data-testid="backup-page">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-foreground">
          Backup & Restauração
        </h2>
        <p className="text-muted mt-2">
          Mantenha seus dados seguros com backup regular
        </p>
      </div>

      {/* Backup Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Export */}
        <Card className="bg-card-bg border border-card-border rounded-3xl" data-testid="card-export">
          <CardContent className="p-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mb-4">
              <Download className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Exportar Dados
            </h3>
            <p className="text-muted mb-6">
              Faça backup dos seus dados em formato JSON criptografado
            </p>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl font-medium transition-all duration-200 hover:shadow-lg"
              data-testid="button-export-backup"
            >
              {isExporting ? "Exportando..." : "Exportar Backup"}
            </Button>
          </CardContent>
        </Card>

        {/* Import */}
        <Card className="bg-card-bg border border-card-border rounded-3xl" data-testid="card-import">
          <CardContent className="p-6">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Importar Dados
            </h3>
            <p className="text-muted mb-6">
              Restaure seus dados a partir de um arquivo de backup
            </p>
            <div className="space-y-3">
              <Input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
                className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-primary file:text-primary-foreground cursor-pointer"
                data-testid="input-import-file"
              />
              {isImporting && (
                <p className="text-sm text-muted">
                  Restaurando backup...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Information */}
      <Card className="bg-card-bg border border-card-border rounded-3xl">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center space-x-2">
            <FileArchive className="h-5 w-5" />
            <span>Sobre o Backup</span>
          </h3>
          <div className="space-y-4 text-sm text-muted">
            <div>
              <h4 className="font-medium text-foreground mb-2">🔒 Segurança</h4>
              <p>
                Todos os backups são criptografados usando AES-GCM antes de serem salvos. 
                Seus dados estão protegidos mesmo se o arquivo for interceptado.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2">📁 Conteúdo</h4>
              <p>
                O backup inclui todas as suas transações, categorias e configurações. 
                Nenhum dado é perdido durante o processo.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2">⚠️ Importação</h4>
              <p>
                Ao importar um backup, todos os dados atuais serão substituídos pelos dados do arquivo. 
                Certifique-se de fazer um backup dos dados atuais antes de importar.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2">📅 Frequência</h4>
              <p>
                Recomendamos fazer backups regulares, especialmente antes de grandes mudanças 
                ou quando você adiciona muitas transações importantes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
