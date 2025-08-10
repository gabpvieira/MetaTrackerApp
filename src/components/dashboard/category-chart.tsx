import { useFinanceStore } from "@/stores/finance-store";
import { formatCurrency, getWeekRange } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export function CategoryChart() {
  const { categories, getCategoryTotals, settings } = useFinanceStore();

  const { start, end } = getWeekRange(new Date(), settings?.weekStartsOn as 0);
  const categoryTotals = getCategoryTotals(start, end);

  // Filter for income categories only and with positive amounts
  const incomeCategories = categories
    .filter((cat) => cat.type === "income" && categoryTotals[cat.id] > 0)
    .map((cat) => ({
      name: cat.name,
      value: categoryTotals[cat.id] || 0,
      color: cat.color,
      icon: cat.icon,
    }))
    .sort((a, b) => b.value - a.value);

  const total = incomeCategories.reduce((sum, cat) => sum + cat.value, 0);

  const chartData = incomeCategories.map((cat) => ({
    ...cat,
    percentage: total > 0 ? Math.round((cat.value / total) * 100) : 0,
  }));

  return (
    <Card className="bg-card-bg border border-card-border rounded-3xl" data-testid="card-category-chart">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-foreground mb-6">
          Receitas por Categoria
        </h3>
        {chartData.length > 0 ? (
          <div className="space-y-4">
            <div className="relative">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {chartData.map((category, index) => (
                <div key={index} className="flex items-center justify-between" data-testid={`category-item-${index}`}>
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {category.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground" data-testid={`category-amount-${index}`}>
                    {formatCurrency(category.value)} ({category.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted">
              Nenhuma receita registrada nesta semana
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
