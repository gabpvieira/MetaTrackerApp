import { useSidebar } from "@/hooks/use-sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function MobileHeader() {
  const { toggle } = useSidebar();

  return (
    <div className="md:hidden bg-card-bg border border-card-border fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggle}
          className="p-2 rounded-xl hover:bg-sidebar-hover transition-colors duration-200"
          data-testid="mobile-menu-toggle"
          aria-label="Alternar menu"
        >
          <Menu className="h-5 w-5 text-foreground" />
        </Button>
        
        <h1 className="text-lg font-semibold text-foreground">
          Finanças Semanais
        </h1>
        
        <div className="w-9 h-9"></div> {/* Espaçador para manter o título centralizado */}
      </div>
    </div>
  );
}
