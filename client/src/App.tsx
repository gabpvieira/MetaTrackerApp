import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { useFinanceStore } from "@/stores/finance-store";
import { useSidebar, useCloseSidebarOnRouteChange } from "@/hooks/use-sidebar";

// Layout components
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";

// Pages
import { Dashboard } from "@/pages/dashboard";
import { Transactions } from "@/pages/transactions";
import { TransactionFormPage } from "@/pages/transaction-form-page";
import { Categories } from "@/pages/categories";
import { Reports } from "@/pages/reports";
import { Backup } from "@/pages/backup";
import NotFound from "@/pages/not-found";

function AppContent() {
  const { initialize, isLoading } = useFinanceStore();
  const { isOpen, setOpen } = useSidebar();

  useCloseSidebarOnRouteChange();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-primary/90 to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-6 h-6 bg-white rounded-full" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen gradient-bg" data-testid="app-container">
        {/* Sidebar */}
        <div className="relative">
          <aside
            className={`fixed z-40 top-0 left-0 h-screen w-72
              bg-[linear-gradient(180deg,#0C1424_0%,#0B1B2B_100%)]
              border-r border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.35)]
              ${isOpen ? "translate-x-0" : "-translate-x-full"}
              md:translate-x-0
              transition-transform duration-300 will-change-transform`}
          >
            <Sidebar />
          </aside>

          {/* Mobile Overlay */}
          {isOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/50 md:hidden"
              onClick={() => setOpen(false)}
            />
          )}
        </div>

        {/* Mobile Header */}
        <MobileHeader />
        
        {/* Main Content */}
        <div className="md:ml-72 pt-16 md:pt-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transacoes" element={<Transactions />} />
            <Route path="/transacoes/nova" element={<TransactionFormPage />} />
            <Route path="/transacoes/:id/editar" element={<TransactionFormPage />} />
            <Route path="/categorias" element={<Categories />} />
            <Route path="/relatorios" element={<Reports />} />
            <Route path="/backup" element={<Backup />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="finance-ui-theme">
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
