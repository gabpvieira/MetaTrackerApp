import { useFinanceStore } from "@/stores/finance-store";
import { useTheme } from "@/components/ui/theme-provider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Home,
  ArrowLeftRight,
  Tags,
  BarChart3,
  Download,
  Sun,
  Moon,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", icon: Home, section: "dashboard" },
  { name: "Transações", icon: ArrowLeftRight, section: "transactions" },
  { name: "Categorias", icon: Tags, section: "categories" },
  { name: "Relatórios", icon: BarChart3, section: "reports" },
  { name: "Backup", icon: Download, section: "backup" },
];

export function Sidebar() {
  const { currentSection, setCurrentSection, isMobileMenuOpen, toggleMobileMenu } = useFinanceStore();
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300"
          onClick={toggleMobileMenu}
          data-testid="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-64 glass-card shadow-xl z-30 transform transition-transform duration-300 lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
        data-testid="sidebar"
      >
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-xl sidebar-gradient flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Finanças</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Semanais</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = currentSection === item.section;
              return (
                <Button
                  key={item.section}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                    isActive 
                      ? "bg-gradient-to-r from-primary/90 to-primary/80 text-primary-foreground shadow-lg" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/10"
                  )}
                  onClick={() => setCurrentSection(item.section)}
                  data-testid={`nav-${item.section}`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Button>
              );
            })}
          </nav>
        </div>

        {/* Theme toggle */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tema</span>
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4 text-gray-500" />
                <Switch
                  checked={isDark}
                  onCheckedChange={() => setTheme(isDark ? "light" : "dark")}
                  data-testid="theme-toggle"
                />
                <Moon className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
