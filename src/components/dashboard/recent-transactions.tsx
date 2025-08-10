import { useFinanceStore } from "@/stores/finance-store";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUp, ArrowDown } from "lucide-react";

export function RecentTransactions() {
  const { transactions, categories, setCurrentSection } = useFinanceStore();

  // Get recent transactions (last 5)
  const recentTransactions = transactions
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const getCategoryById = (id: string) => categories.find((cat) => cat.id === id);

  return (
    <Card className="bg-card-bg border border-card-border rounded-3xl" data-testid="card-recent-transactions">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-foreground">
            Transações Recentes
          </h3>
          <Button
            onClick={() => setCurrentSection("transactions")}
            className="bg-gradient-to-r from-primary/90 to-primary/80 hover:from-primary to-primary/90 text-primary-foreground rounded-xl font-medium transition-all duration-200 hover:shadow-lg"
            data-testid="button-view-all-transactions"
          >
            Ver Todas
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((transaction, index) => {
              const category = getCategoryById(transaction.categoryId);
              const isIncome = transaction.type === "income";
              
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-card-bg border border-card-border rounded-2xl hover:bg-sidebar-hover transition-colors duration-200"
                  data-testid={`transaction-item-${index}`}
                >
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ 
                        background: category ? `linear-gradient(135deg, ${category.color}CC, ${category.color}80)` : '#6B7280' 
                      }}
                    >
                      {isIncome ? (
                        <ArrowUp className="h-5 w-5 text-white" />
                      ) : (
                        <ArrowDown className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground" data-testid={`transaction-description-${index}`}>
                        {transaction.description}
                      </p>
                      <p className="text-sm text-muted" data-testid={`transaction-meta-${index}`}>
                        {format(transaction.date, "dd/MM/yyyy", { locale: ptBR })} • {category?.name || "Sem categoria"}
                      </p>
                    </div>
                  </div>
                  <span 
                    className={`font-bold ${
                      isIncome 
                        ? "text-success" 
                        : "text-danger"
                    }`}
                    data-testid={`transaction-amount-${index}`}
                  >
                    {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted">
              Nenhuma transação registrada ainda
            </p>
            <Button
              onClick={() => setCurrentSection("transactions")}
              variant="outline"
              className="mt-4"
              data-testid="button-add-first-transaction"
            >
              Adicionar primeira transação
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
