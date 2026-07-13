import { Box, LayoutDashboard, Settings, ShoppingCart, Users, ChevronLeft, ChevronRight, Lightbulb, Store, Package } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../utils/cn';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Store,           label: 'Stores',     path: '/stores' },
  { icon: Package,         label: 'Products',   path: '/products' },
  { icon: ShoppingCart,    label: 'Orders',     path: '/orders' },
  { icon: Box,             label: 'Inventory',  path: '/inventory' },
  { icon: Users,           label: 'Employees',  path: '/employees' },
  { icon: Lightbulb,       label: 'AI Insights', path: '/insights' },
  { icon: Settings,        label: 'Settings',   path: '/settings' },
];

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  return (
    <aside
      className={cn(
        "bg-surface-900 flex flex-col justify-between border-r border-slate-800 text-slate-300 transition-all duration-300 ease-in-out relative",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex flex-col">
        {/* Logo Area */}
        <div className="flex h-16 items-center justify-center border-b border-slate-800 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white shadow-lg shadow-primary-500/30">
              <Box className="h-5 w-5" />
            </div>
            {!collapsed && (
              <span className="text-xl font-bold font-sans tracking-tight text-white whitespace-nowrap">
                RetailMind AI
              </span>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all text-sm font-medium hover:bg-slate-800 hover:text-white",
                  isActive ? "bg-primary-600/10 text-primary-500" : "text-slate-400"
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-4 top-20 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 shadow-md ring-1 ring-white/10"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
