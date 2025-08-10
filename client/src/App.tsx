import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { useFinanceStore } from "@/stores/finance-store";

// Layout components
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";

// Pages
import { Dashboard } from "@/pages/dashboard";
import { Transactions } from "@/pages/transactions";
import { Categories } from "@/pages/categories";
import { Reports } from "@/pages/reports";
import { Backup } from "@/pages/backup";
import NotFound from "@/pages/not-found";

function AppContent() {
  const { currentSection, initialize, isLoading } = useFinanceStore();

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

  const renderCurrentSection = () => {
    switch (currentSection) {
      case "dashboard":
        return <Dashboard />;
      case "transactions":
        return <Transactions />;
      case "categories":
        return <Categories />;
      case "reports":
        return <Reports />;
      case "backup":
        return <Backup />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen gradient-bg" data-testid="app-container">
      <Sidebar />
      <MobileHeader />
      
      <div className="lg:ml-64 pt-16 lg:pt-0">
        {renderCurrentSection()}
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button 
          className="w-14 h-14 bg-gradient-to-r from-primary/90 to-primary/80 text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          data-testid="fab-mobile"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="finance-ui-theme">
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
