import { NavLink } from "react-router-dom";
import { useTheme } from "@/components/ui/theme-provider";
import { Switch } from "@/components/ui/switch";
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
  { name: "Dashboard", icon: Home, to: "/dashboard" },
  { name: "Transações", icon: ArrowLeftRight, to: "/transacoes" },
  { name: "Categorias", icon: Tags, to: "/categorias" },
  { name: "Relatórios", icon: BarChart3, to: "/relatorios" },
  { name: "Backup", icon: Download, to: "/backup" },
];

// Component for navigation items
function SidebarItem({ to, icon: Icon, label }: {to: string; icon: any; label: string}) {
  const itemBase = "flex items-center gap-3 px-4 h-11 rounded-xl transition-colors select-none";
  const itemIdle = "text-slate-300 hover:text-white hover:bg-slate-700/40";
  const itemActive = "text-white bg-slate-700 border border-slate-600 shadow-sm";

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [itemBase, isActive ? itemActive : itemIdle].join(" ")
      }
      end={to === "/dashboard"}
      data-testid={`nav-${to.slice(1)}`}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium">{label}</span>
    </NavLink>
  );
}

export function Sidebar() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <div className="h-full flex flex-col" data-testid="sidebar">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary/90 to-primary/80 flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Finanças</h1>
            <p className="text-sm text-slate-400">Semanais</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navigation.map((item) => (
            <SidebarItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.name}
            />
          ))}
        </nav>
      </div>

      {/* Theme toggle */}
      <div className="mt-auto p-6">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">Tema</span>
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4 text-slate-400" />
              <Switch
                checked={isDark}
                onCheckedChange={() => setTheme(isDark ? "light" : "dark")}
                data-testid="theme-toggle"
              />
              <Moon className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
