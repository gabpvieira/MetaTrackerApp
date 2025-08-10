import { useFinanceStore } from "@/stores/finance-store";
import { formatCurrency, getWeekRange } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2, Laptop, TrendingUp, ShoppingCart, Car, Home, Heart, Coffee, Plane, Book, Music } from "lucide-react";

const iconMap = {
  "laptop-code": Laptop,
  "chart-line": TrendingUp,
  "shopping-cart": ShoppingCart,
  "car": Car,
  "home": Home,
  "heart": Heart,
  "coffee": Coffee,
  "plane": Plane,
  "book": Book,
  "music": Music,
};

export function CategoryGrid() {
  const { categories, deleteCategory, transactions, settings } = useFinanceStore();

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id);
  };

  const getCategoryStats = (categoryId: string) => {
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const monthlyTransactions = transactions.filter(
      (t) => t.categoryId === categoryId && t.date >= startOfMonth && t.date <= endOfMonth
    );

    const total = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);
    const count = monthlyTransactions.length;

    return { total, count };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="category-grid">
      {categories.length > 0 ? (
        categories.map((category, index) => {
          const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Laptop;
          const stats = getCategoryStats(category.id);

          return (
            <Card key={category.id} className="glass-card rounded-3xl card-hover border-0" data-testid={`category-card-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ 
                        background: `linear-gradient(135deg, ${category.color}CC, ${category.color}80)` 
                      }}
                    >
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white" data-testid={`category-name-${index}`}>
                        {category.name}
                      </h3>
                      <Badge 
                        variant="secondary"
                        className={`text-xs ${
                          category.type === "income" 
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                        data-testid={`category-type-${index}`}
                      >
                        {category.type === "income" ? "Receita" : "Despesa"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                      data-testid={`button-edit-category-${index}`}
                    >
                      <Edit className="h-4 w-4 text-gray-500" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                          data-testid={`button-delete-category-${index}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteCategory(category.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Transações este mês:</span>
                    <span className="font-semibold" data-testid={`category-count-${index}`}>
                      {stats.count}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total este mês:</span>
                    <span 
                      className={`font-semibold ${
                        category.type === "income" 
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                      data-testid={`category-total-${index}`}
                    >
                      {formatCurrency(stats.total)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      ) : (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Nenhuma categoria criada ainda
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Crie sua primeira categoria para começar a organizar suas transações
          </p>
        </div>
      )}
    </div>
  );
}
