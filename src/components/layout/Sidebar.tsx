import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useMess } from '../../store/MessContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  UtensilsCrossed,
  Receipt,
  BarChart3,
  Boxes,
  Clock,
  Landmark,
  FileSpreadsheet,
  ShieldAlert,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Utensils,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
}) => {
  const { currentUser, logout, state } = useMess();
  const location = useLocation();

  const isAdmin = currentUser.role === 'admin';

  interface NavItem {
    label: string;
    to: string;
    icon: React.ComponentType<{ className?: string }>;
    highlight?: boolean;
    count?: number;
  }

  // Navigation definition based on role
  const adminNavItems: NavItem[] = [
    { label: 'Overview', to: '/', icon: LayoutDashboard },
    { label: 'Billing / POS', to: '/billing', icon: ShoppingCart, highlight: true },
    { label: 'Students', to: '/students', icon: Users, count: state.students.length },
    { label: 'Products & Menu', to: '/products', icon: UtensilsCrossed, count: state.products.length },
    { label: 'Bills & Transactions', to: '/transactions', icon: Receipt, count: state.bills.length },
    { label: 'Sales & Analytics', to: '/analytics', icon: BarChart3 },
    { label: 'Inventory', to: '/inventory', icon: Boxes },
    { label: 'Cashiers & Shifts', to: '/cashiers', icon: Clock },
    { label: 'Payment Reconciliation', to: '/reconciliation', icon: Landmark },
    { label: 'Audit Logs', to: '/audit-logs', icon: ShieldAlert },
    { label: 'User Management', to: '/users', icon: Users },
    { label: 'Settings', to: '/settings', icon: Settings },
  ];

  // Cashier role has streamlined navigation
  const cashierNavItems: NavItem[] = [
    { label: 'Billing / POS', to: '/billing', icon: ShoppingCart, highlight: true },
    { label: 'My Transactions', to: '/transactions', icon: Receipt },
    { label: 'Shift Summary', to: '/cashiers', icon: Clock },
  ];

  const navItems: NavItem[] = isAdmin ? adminNavItems : cashierNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#172554] text-slate-100 border-r border-blue-950/60 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} no-print`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-blue-900/60">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <Utensils className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="block text-sm font-bold tracking-tight text-white truncate">
                  Hostel Mess POS
                </span>
                <span className="block text-[11px] text-blue-300 font-medium truncate">
                  Smart Billing System
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-blue-300 hover:text-white hover:bg-blue-900/50 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Role Tag */}
        {!collapsed && (
          <div className="px-4 py-2.5 bg-blue-950/40 border-b border-blue-900/30 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <span className="text-xs text-blue-200 truncate">{currentUser.name}</span>
            </div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isAdmin ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {currentUser.role}
            </span>
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : item.highlight
                      ? 'text-emerald-300 hover:text-white hover:bg-blue-900/50 bg-emerald-950/30 border border-emerald-800/40'
                      : 'text-slate-300 hover:text-white hover:bg-blue-900/40'
                  } ${collapsed ? 'justify-center px-0' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-blue-300'}`} />
                {!collapsed && (
                  <span className="truncate flex-1">{item.label}</span>
                )}
                {!collapsed && item.count !== undefined && !isActive && (
                  <span className="text-[11px] font-mono text-blue-300/80 bg-blue-900/60 px-1.5 py-0.5 rounded">
                    {item.count}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-3 border-t border-blue-900/60 bg-blue-950/30 space-y-1">
          <NavLink
            to="/login"
            onClick={logout}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors ${
              collapsed ? 'justify-center px-0' : ''
            }`}
            title="Log Out"
          >
            <LogOut className="w-4 h-4 shrink-0 text-rose-400" />
            {!collapsed && <span>Switch Account / Exit</span>}
          </NavLink>
        </div>
      </aside>
    </>
  );
};
