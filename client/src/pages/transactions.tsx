import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionList } from "@/components/transactions/transaction-list";

export function Transactions() {
  return (
    <div className="p-6" data-testid="transactions-page">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-white">
            Transações
          </h2>
          <TransactionForm />
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
