import { NavLink } from "react-router-dom";
import {
  Home,
  ArrowLeftRight,
  Tags,
  BarChart3,
  Download,
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
  const itemIdle = "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-sidebar-text hover:text-foreground hover:bg-sidebar-hover";
  const itemActive = "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-foreground bg-sidebar-active border border-sidebar-border shadow-sm font-medium";

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive ? itemActive : itemIdle
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

  return (
    <div className="h-full flex flex-col bg-sidebar-bg border-r border-sidebar-border" data-testid="sidebar">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary/90 to-primary/80 flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Finanças</h1>
            <p className="text-sm text-muted-foreground">Semanais</p>
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


    </div>
  );
}
