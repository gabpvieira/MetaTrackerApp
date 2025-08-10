import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";
import { useSidebar } from "@/hooks/use-sidebar";

export default function RootLayout() {
  const { isOpen } = useSidebar();

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile Header */}
      <MobileHeader />
      
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => {}}
          data-testid="mobile-overlay"
        />
      )}

      {/* Sidebar - Mobile sliding */}
      <div
        className={`md:hidden fixed left-0 top-0 h-full w-72 bg-card-bg border border-card-border shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        data-testid="mobile-sidebar"
      >
        <Sidebar />
      </div>
      
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-72 md:flex-col">
        <div className="bg-card-bg border border-card-border h-full">
          <Sidebar />
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 pt-16 md:pt-0 px-4 md:px-8 py-6 md:py-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
