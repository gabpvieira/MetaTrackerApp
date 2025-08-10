import { useState } from "react";
import { useFinanceStore } from "@/stores/finance-store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2, Calendar, ArrowUp, ArrowDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TransactionFilters {
  type: "all" | "income" | "expense";
  categoryId: string;
  startDate: string;
  endDate: string;
}

export function TransactionList() {
  const { transactions, categories, deleteTransaction } = useFinanceStore();
  const [filters, setFilters] = useState<TransactionFilters>({
    type: "all",
    categoryId: "",
    startDate: "",
    endDate: "",
  });

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    if (filters.type !== "all" && transaction.type !== filters.type) return false;
    if (filters.categoryId && transaction.categoryId !== filters.categoryId) return false;
    if (filters.startDate && transaction.date < new Date(filters.startDate)) return false;
    if (filters.endDate && transaction.date > new Date(filters.endDate)) return false;
    return true;
  }).sort((a, b) => b.date.getTime() - a.date.getTime());

  const getCategoryById = (id: string) => categories.find((cat) => cat.id === id);

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id);
  };

  return (
    <div className="space-y-6" data-testid="transaction-list">
      {/* Filters */}
      <Card className="glass-card rounded-3xl border-0">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo:
              </label>
              <Select 
                value={filters.type} 
                onValueChange={(value: any) => setFilters({ ...filters, type: value })}
              >
                <SelectTrigger className="w-32" data-testid="filter-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Categoria:
              </label>
              <Select 
                value={filters.categoryId} 
                onValueChange={(value) => setFilters({ ...filters, categoryId: value })}
              >
                <SelectTrigger className="w-40" data-testid="filter-category">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                De:
              </label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-40"
                data-testid="filter-start-date"
              />
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Até:
              </label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-40"
                data-testid="filter-end-date"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card className="glass-card rounded-3xl border-0">
        <CardContent className="p-6">
          {filteredTransactions.length > 0 ? (
            <div className="space-y-3">
              {filteredTransactions.map((transaction, index) => {
                const category = getCategoryById(transaction.categoryId);
                const isIncome = transaction.type === "income";

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-white/5 dark:bg-white/5 rounded-2xl hover:bg-white/10 transition-colors duration-200"
                    data-testid={`transaction-row-${index}`}
                  >
                    <div className="flex items-center space-x-4 flex-1">
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
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-800 dark:text-white truncate" data-testid={`transaction-description-${index}`}>
                            {transaction.description}
                          </h4>
                          {category && (
                            <Badge
                              variant="secondary"
                              className="text-xs"
                              style={{ 
                                backgroundColor: `${category.color}20`,
                                color: category.color,
                                borderColor: `${category.color}40`
                              }}
                            >
                              {category.name}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3 w-3" />
                          <span data-testid={`transaction-date-${index}`}>
                            {format(transaction.date, "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div 
                          className={`text-lg font-bold ${
                            isIncome 
                              ? "text-emerald-600 dark:text-emerald-400" 
                              : "text-red-600 dark:text-red-400"
                          }`}
                          data-testid={`transaction-amount-${index}`}
                        >
                          {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                          data-testid={`button-edit-transaction-${index}`}
                        >
                          <Edit className="h-4 w-4 text-gray-500" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                              data-testid={`button-delete-transaction-${index}`}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir Transação</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteTransaction(transaction.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Nenhuma transação encontrada
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Ajuste os filtros ou adicione uma nova transação
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
