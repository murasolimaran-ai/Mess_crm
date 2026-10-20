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
  ShieldCheck,
  FileText,
  UserCheck,
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

  interface NavItem {
    label: string;
    to: string;
    icon: React.ComponentType<{ className?: string }>;
    highlight?: boolean;
    badge?: string;
  }

  const activeShift = state.activeShift;

  const adminNavItems: NavItem[] = [
    { label: 'Overview', to: '/', icon: LayoutDashboard },
    {
      label: 'Billing / POS',
      to: '/billing',
      icon: ShoppingCart,
      highlight: true,
      badge: activeShift ? 'POS ACTIVE' : undefined,
    },
    { label: 'Students', to: '/students', icon: Users },
    { label: 'Products & Menu', to: '/products', icon: UtensilsCrossed },
    { label: 'Bills & Transactions', to: '/transactions', icon: Receipt },
    { label: 'Sales & Analytics', to: '/analytics', icon: BarChart3 },
    { label: 'Inventory', to: '/inventory', icon: Boxes },
    { label: 'Cashiers & Shifts', to: '/cashiers', icon: Clock },
    { label: 'Payment Reconciliation', to: '/reconciliation', icon: ShieldCheck },
    { label: 'Audit Logs', to: '/audit-logs', icon: FileText },
    { label: 'User Management', to: '/users', icon: UserCheck },
    { label: 'Settings', to: '/settings', icon: Settings },
  ];

  const cashierNavItems: NavItem[] = [
    {
      label: 'Billing / POS',
      to: '/billing',
      icon: ShoppingCart,
      highlight: true,
      badge: 'QUICK POS',
    },
    { label: 'My Transactions', to: '/transactions', icon: Receipt },
    { label: 'Cashier Shift Summary', to: '/cashiers', icon: Clock },
  ];

  const studentNavItems: NavItem[] = [
    {
      label: 'My Mess Account',
      to: '/student-portal',
      icon: UserCheck,
      highlight: true,
      badge: 'SELF SERVICE',
    },
  ];

  const navItems =
    currentUser.role === 'admin'
      ? adminNavItems
      : currentUser.role === 'student'
      ? studentNavItems
      : cashierNavItems;

  return (
    <>
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
                  Hostel Mess ERP
                </span>
                <span className="block text-[11px] text-blue-300 font-medium truncate">
                  Smart POS &amp; Billing
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

        {/* Current Active User Status Badge */}
        {!collapsed && (
          <div className="px-4 py-2.5 bg-blue-950/40 border-b border-blue-900/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium">Logged in as</span>
            </div>
            <span className="font-bold text-white uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-blue-900/80 text-blue-200">
              {currentUser.role}
            </span>
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onMobileClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : item.highlight
                    ? 'text-emerald-300 hover:text-white bg-emerald-950/30 border border-emerald-800/40'
                    : 'text-slate-300 hover:text-white hover:bg-blue-900/40'
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-blue-300'
                  }`}
                />
                {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold bg-emerald-600 text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info & Switch */}
        <div className="p-3 border-t border-blue-900/60 bg-blue-950/40 space-y-2">
          {!collapsed && (
            <div className="text-[11px] text-blue-200">
              <span className="font-bold text-white block truncate">{currentUser.name}</span>
              <span className="text-[10px] text-blue-400 font-mono truncate block">
                {currentUser.email}
              </span>
            </div>
          )}
          <NavLink
            to="/login"
            onClick={(e) => {
              logout();
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-950/40 transition-colors ${
              collapsed ? 'justify-center px-0' : ''
            }`}
            title="Sign Out / Switch Account"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            {!collapsed && <span>Sign Out / Switch</span>}
          </NavLink>
        </div>
      </aside>
    </>
  );
};
