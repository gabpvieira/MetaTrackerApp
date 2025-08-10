import { useFinanceStore } from "@/stores/finance-store";
import { formatCurrency, getWeekRange } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, ArrowUp, TrendingUp, ArrowDown } from "lucide-react";

export function StatsCards() {
  const { 
    getWeeklyProgress, 
    getWeeklyIncome, 
    getAnnualIncome, 
    getAnnualExpenses,
    settings 
  } = useFinanceStore();

  const weeklyProgress = getWeeklyProgress();
  const weeklyIncome = getWeeklyIncome();
  const annualIncome = getAnnualIncome();
  const annualExpenses = getAnnualExpenses();

  const { label: weekLabel } = getWeekRange(new Date(), settings?.weekStartsOn as 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Weekly Goal Card */}
      <Card className="bg-card-bg border border-card-border rounded-3xl card-hover border-0" data-testid="card-weekly-goal">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs font-medium text-muted uppercase tracking-wide">
              Meta Semanal
            </span>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-foreground" data-testid="text-weekly-goal">
              {formatCurrency(weeklyProgress.goal)}
            </p>
            <Progress 
              value={weeklyProgress.percentage} 
              className="h-3 progress-bar" 
              data-testid="progress-weekly-goal"
            />
            <p className="text-sm text-muted" data-testid="text-goal-status">
              {weeklyProgress.percentage >= 100 
                ? "Meta atingida!" 
                : `Falta ${formatCurrency(weeklyProgress.remaining)} para atingir a meta`
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Income Card */}
      <Card className="bg-card-bg border border-card-border rounded-3xl card-hover border-0" data-testid="card-weekly-income">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center">
              <ArrowUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs font-medium text-muted uppercase tracking-wide">
              Receita Semanal
            </span>
          </div>
          <p className="text-3xl font-bold text-success" data-testid="text-weekly-income">
            {formatCurrency(weeklyIncome)}
          </p>
          <p className="text-sm text-muted mt-2">
            {weekLabel}
          </p>
        </CardContent>
      </Card>

      {/* Annual Income Card */}
      <Card className="bg-card-bg border border-card-border rounded-3xl card-hover border-0" data-testid="card-annual-income">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs font-medium text-muted uppercase tracking-wide">
              Receita Anual
            </span>
          </div>
          <p className="text-3xl font-bold text-success" data-testid="text-annual-income">
            {formatCurrency(annualIncome)}
          </p>
          <p className="text-sm text-muted mt-2">
            Janeiro - Dezembro {new Date().getFullYear()}
          </p>
        </CardContent>
      </Card>

      {/* Annual Expenses Card */}
      <Card className="bg-card-bg border border-card-border rounded-3xl card-hover border-0" data-testid="card-annual-expenses">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-pink-500 rounded-2xl flex items-center justify-center">
              <ArrowDown className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs font-medium text-muted uppercase tracking-wide">
              Despesa Anual
            </span>
          </div>
          <p className="text-3xl font-bold text-danger" data-testid="text-annual-expenses">
            {formatCurrency(annualExpenses)}
          </p>
          <p className="text-sm text-muted mt-2">
            Janeiro - Dezembro {new Date().getFullYear()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
