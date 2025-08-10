
import { createHashRouter, Navigate } from "react-router-dom";
import RootLayout from "./components/layout/root-layout";

// Import pages directly since they're already using default exports
import DashboardPage from "@/pages/dashboard";
import TransactionsPage from "@/pages/transactions";
import TransactionFormPage from "@/pages/transaction-form-page";
import CategoriesPage from "@/pages/categories";
import ReportsPage from "@/pages/reports";
import BackupPage from "@/pages/backup";



export const router = createHashRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "transacoes", element: <TransactionsPage /> },
      { path: "transacoes/nova", element: <TransactionFormPage /> },
      { path: "transacoes/:id/editar", element: <TransactionFormPage /> },
      { path: "categorias", element: <CategoriesPage /> },
      { path: "relatorios", element: <ReportsPage /> },
      { path: "backup", element: <BackupPage /> },
      { 
        path: "*", 
        element: (
          <div className="m-12 rounded-2xl bg-card-bg border border-card-border p-8 text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
        <p className="text-muted">Página não encontrada</p>
          </div>
        ) 
      },
    ],
  },
]);

export default router;
