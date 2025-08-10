import { useSidebar } from "@/hooks/use-sidebar";
import { useTheme } from "@/components/ui/theme-provider";
import { Button } from "@/components/ui/button";
import { Menu, Sun, Moon } from "lucide-react";

export function MobileHeader() {
  const { toggle } = useSidebar();
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <div className="md:hidden glass-card fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggle}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors duration-200"
          data-testid="mobile-menu-toggle"
          aria-label="Alternar menu"
        >
          <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </Button>
        
        <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
          Finanças Semanais
        </h1>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors duration-200"
          data-testid="mobile-theme-toggle"
        >
          {isDark ? (
            <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          ) : (
            <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          )}
        </Button>
      </div>
    </div>
  );
}
