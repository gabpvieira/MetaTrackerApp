import { useState } from "react";
import { useFinanceStore } from "@/stores/finance-store";
import { formatCurrency, downloadFile } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Download } from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { ptBR } from "date-fns/locale";

type Period = "week" | "month" | "year";

export default function Reports() {
  const { transactions, categories } = useFinanceStore();
  const [period, setPeriod] = useState<Period>("month");

  // Get date range based on period
  const getDateRange = (period: Period) => {
    const now = new Date();
    switch (period) {
      case "week":
        return { start: startOfWeek(now, { weekStartsOn: 0 }), end: endOfWeek(now, { weekStartsOn: 0 }) };
      case "month":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case "year":
        return { start: startOfYear(now), end: endOfYear(now) };
    }
  };

  const { start, end } = getDateRange(period);

  // Filter transactions by period
  const filteredTransactions = transactions.filter(
    (t) => t.date >= start && t.date <= end
  );

  // Income vs Expenses data
  const incomeExpenseData = [
    {
      name: "Receitas",
      value: filteredTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0),
    },
    {
      name: "Despesas",
      value: filteredTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
    },
  ];

  // Monthly evolution (for the current year)
  const getMonthlyData = () => {
    const months = [];
    const currentYear = new Date().getFullYear();
    
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(currentYear, i, 1);
      const monthEnd = new Date(currentYear, i + 1, 0);
      
      const monthTransactions = transactions.filter(
        (t) => t.date >= monthStart && t.date <= monthEnd
      );
      
      const income = monthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
        
      const expenses = monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      
      months.push({
        month: format(monthStart, "MMM", { locale: ptBR }),
        income,
        expenses,
        profit: income - expenses,
      });
    }
    
    return months;
  };

  const monthlyData = getMonthlyData();

  // Export CSV
  const exportCSV = () => {
    const csvData = filteredTransactions.map((transaction) => {
      const category = categories.find((cat) => cat.id === transaction.categoryId);
      return {
        Data: format(transaction.date, "dd/MM/yyyy", { locale: ptBR }),
        Descrição: transaction.description,
        Categoria: category?.name || "Sem categoria",
        Tipo: transaction.type === "income" ? "Receita" : "Despesa",
        Valor: transaction.amount,
      };
    });

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => headers.map((header) => `"${row[header as keyof typeof row]}"`).join(",")),
    ].join("\n");

    const filename = `relatorio-${period}-${format(new Date(), "yyyy-MM-dd", { locale: ptBR })}.csv`;
    downloadFile(csvContent, filename, "text/csv");
  };

  return (
    <div className="p-6" data-testid="reports-page">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-foreground">
          Relatórios
        </h2>
        <p className="text-muted mt-2">
          Análise detalhada dos seus dados financeiros
        </p>
      </div>

      {/* Filters */}
      <Card className="bg-card-bg border border-card-border rounded-3xl p-6 mb-6 border-0">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-foreground">
              Período:
            </label>
            <Select value={period} onValueChange={(value: Period) => setPeriod(value)}>
              <SelectTrigger className="w-40" data-testid="select-report-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Esta Semana</SelectItem>
                <SelectItem value="month">Este Mês</SelectItem>
                <SelectItem value="year">Este Ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button
            onClick={exportCSV}
            className="bg-gradient-to-r from-primary/90 to-primary/80 hover:from-primary to-primary/90 text-primary-foreground rounded-xl font-medium transition-all duration-200 hover:shadow-lg flex items-center space-x-2"
            data-testid="button-export-csv"
          >
            <Download className="h-4 w-4" />
            <span>Exportar CSV</span>
          </Button>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses */}
        <Card className="bg-card-bg border border-card-border rounded-3xl" data-testid="card-income-expense-chart">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              Receitas vs Despesas
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeExpenseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: "#CBD5E1" }} />
                <YAxis tick={{ fill: "#CBD5E1" }} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), ""]}
                  labelStyle={{ color: "#F8FAFC" }}
                  contentStyle={{ backgroundColor: "#1E293B", border: "1px solid #334155", borderRadius: "8px" }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#4ADE80"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Evolution */}
        <Card className="bg-card-bg border border-card-border rounded-3xl" data-testid="card-monthly-evolution-chart">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              Evolução Mensal
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" tick={{ fill: "#CBD5E1" }} />
                <YAxis tick={{ fill: "#CBD5E1" }} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), ""]}
                  labelStyle={{ color: "#F8FAFC" }}
                  contentStyle={{ backgroundColor: "#1E293B", border: "1px solid #334155", borderRadius: "8px" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#60A5FA" 
                  strokeWidth={3}
                  dot={{ fill: "#60A5FA", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card className="bg-card-bg border border-card-border rounded-3xl mt-6">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Resumo do Período
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-success" data-testid="text-period-income">
                {formatCurrency(incomeExpenseData[0].value)}
              </p>
              <p className="text-sm text-muted">Total de Receitas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-danger" data-testid="text-period-expenses">
                {formatCurrency(incomeExpenseData[1].value)}
              </p>
              <p className="text-sm text-muted">Total de Despesas</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${
                incomeExpenseData[0].value - incomeExpenseData[1].value >= 0
                  ? "text-success"
                  : "text-danger"
              }`} data-testid="text-period-balance">
                {formatCurrency(incomeExpenseData[0].value - incomeExpenseData[1].value)}
              </p>
              <p className="text-sm text-muted">Saldo</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
