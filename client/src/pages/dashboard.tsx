import { useFinanceStore } from "@/stores/finance-store";
import { getWeekRange } from "@/lib/utils";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ProgressChart } from "@/components/dashboard/progress-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { GerarRecursosWidget } from "@/components/gerar-recursos-widget";

export default function Dashboard() {
  const { settings } = useFinanceStore();
  
  const { label: weekLabel } = getWeekRange(new Date(), settings?.weekStartsOn as 0);

  return (
    <div className="p-6" data-testid="dashboard-page">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-foreground mb-2">
          Dashboard
        </h2>
        <p className="text-muted" data-testid="text-current-week">
          {weekLabel}
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Gerar Recursos Widget */}
      <div className="mb-8">
        <GerarRecursosWidget />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ProgressChart />
        <CategoryChart />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions />
    </div>
  );
}
