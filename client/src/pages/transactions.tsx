import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionList } from "@/components/transactions/transaction-list";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Transactions() {
  return (
    <div className="p-6" data-testid="transactions-page">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-white">
            Transações
          </h2>
          <Link to="/transacoes/nova">
            <Button 
              className="bg-gradient-to-r from-primary/90 to-primary/80 hover:from-primary to-primary/90 text-primary-foreground rounded-2xl font-medium transition-all duration-200 hover:shadow-lg flex items-center space-x-2"
              data-testid="button-add-transaction"
            >
              <Plus className="h-4 w-4" />
              <span>Nova Transação</span>
            </Button>
          </Link>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gerencie suas receitas e despesas
        </p>
      </div>

      {/* Transaction List */}
      <TransactionList />
    </div>
  );
}
