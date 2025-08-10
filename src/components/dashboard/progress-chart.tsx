import { useFinanceStore } from "@/stores/finance-store";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export function ProgressChart() {
  const { getWeeklyProgress } = useFinanceStore();
  const progress = getWeeklyProgress();

  const data = [
    { name: "Atingido", value: progress.percentage },
    { name: "Restante", value: 100 - progress.percentage },
  ];

  const colors = ["#77FFC8", "#E5E7EB"];

  return (
    <Card className="bg-card-bg border border-card-border rounded-3xl" data-testid="card-progress-chart">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-foreground mb-6">
          Progresso da Meta
        </h3>
        <div className="space-y-4">
          <div className="text-center">
            <div className="relative w-48 h-48 mx-auto mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-foreground" data-testid="text-progress-percentage">
                  {progress.percentage}%
                </span>
                <span className="text-sm text-muted">
                  Atingido
                </span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Meta:</span>
                <span className="font-semibold text-foreground" data-testid="text-goal-amount">
                  {formatCurrency(progress.goal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Atual:</span>
                <span className="font-semibold text-success" data-testid="text-current-amount">
                  {formatCurrency(progress.current)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Restante:</span>
                <span className="font-semibold text-foreground" data-testid="text-remaining-amount">
                  {formatCurrency(progress.remaining)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
