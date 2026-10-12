import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useMess } from '../../store/MessContext';
import { formatINR } from '../../utils/currency';
import {
  Search,
  Bell,
  Menu,
  Calendar,
  AlertTriangle,
  Receipt,
  User as UserIcon,
  ChevronDown,
  LogOut,
  RefreshCw,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';

interface TopbarProps {
  onMobileMenuToggle: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMobileMenuToggle }) => {
  const { currentUser, state, logout, resetDemoData } = useMess();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute Breadcrumb based on path
  const pathMap: Record<string, string> = {
    '/': 'Overview',
    '/billing': 'Billing / Point of Sale',
    '/students': 'Student Directory',
    '/products': 'Products & Menu Catalog',
    '/transactions': 'Bills & Transactions',
    '/analytics': 'Sales & Analytics',
    '/inventory': 'Inventory & Stock Management',
    '/cashiers': 'Cashiers & Shift Reconciliations',
    '/reconciliation': 'Payment Reconciliation',
    '/audit-logs': 'Immutable Audit Logs',
    '/users': 'System User Administration',
    '/settings': 'Mess Configuration & Settings',
  };

  const currentTitle = pathMap[location.pathname] || 'Dashboard';

  // Global search filtering
  const q = searchQuery.trim().toLowerCase();
  const matchingStudents = q
    ? state.students
        .filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.id.toLowerCase().includes(q) ||
            s.roomNumber.toLowerCase().includes(q)
        )
        .slice(0, 4)
    : [];

  const matchingProducts = q
    ? state.products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.code.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        )
        .slice(0, 3)
    : [];

  const matchingBills = q
    ? state.bills
        .filter((b) => b.billNumber.toLowerCase().includes(q) || b.studentName.toLowerCase().includes(q))
        .slice(0, 3)
    : [];

  // Low stock notifications
  const lowStockItems = state.products.filter(
    (p) => p.isStockTracked && p.stockQuantity <= p.minStockThreshold
  );

  const businessDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between gap-4 no-print">
      {/* Left: Mobile hamburger & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="p-2 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg md:hidden"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs md:text-sm">
          <span className="text-slate-400 font-medium">Mess ERP</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-900 truncate">{currentTitle}</span>
        </div>
      </div>

      {/* Middle: Global Search Bar */}
      <div ref={searchRef} className="relative flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student ID, name, room, dish, or bill no..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Global Search Results Dropdown */}
        {showSearchResults && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-2 text-xs divide-y divide-slate-100 z-50 max-h-96 overflow-y-auto">
            {/* Students */}
            {matchingStudents.length > 0 && (
              <div className="py-2">
                <span className="px-2 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Students ({matchingStudents.length})
                </span>
                {matchingStudents.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      navigate(`/students/${s.id}`);
                      setShowSearchResults(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-slate-900">{s.name}</span>
                      <span className="text-slate-500 ml-1.5">({s.id} · {s.roomNumber})</span>
                    </div>
                    <span className="text-[10px] text-blue-600 font-medium">View Profile →</span>
                  </button>
                ))}
              </div>
            )}

            {/* Products */}
            {matchingProducts.length > 0 && (
              <div className="py-2">
                <span className="px-2 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Food Products ({matchingProducts.length})
                </span>
                {matchingProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      navigate('/products');
                      setShowSearchResults(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-900">{p.name}</span>
                    <span className="text-slate-600 font-mono font-medium">{formatINR(p.price)}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Bills */}
            {matchingBills.length > 0 && (
              <div className="py-2">
                <span className="px-2 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Bills &amp; Invoices
                </span>
                {matchingBills.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      navigate('/transactions');
                      setShowSearchResults(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-slate-900">{b.billNumber}</span>
                      <span className="text-slate-500 ml-1.5">{b.studentName}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">{formatINR(b.total)}</span>
                  </button>
                ))}
              </div>
            )}

            {matchingStudents.length === 0 && matchingProducts.length === 0 && matchingBills.length === 0 && (
              <div className="py-4 text-center text-slate-400">
                No matching records found for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Zone: Date, Notifications, User Menu */}
      <div className="flex items-center gap-3">
        {/* Current Business Date */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{businessDate}</span>
        </div>

        {/* Notifications Icon & Popover */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl relative transition-colors"
            title="Notifications & Alerts"
          >
            <Bell className="w-5 h-5" />
            {lowStockItems.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Mess System Notifications
                </span>
                <span className="text-[10px] text-slate-500">
                  {lowStockItems.length} active alerts
                </span>
              </div>
              <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
                {lowStockItems.length > 0 ? (
                  lowStockItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-xs flex items-start gap-2.5"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-amber-900">{item.name}</div>
                        <div className="text-[11px] text-amber-700">
                          Low stock warning: Only {item.stockQuantity} {item.unit} left (threshold:{' '}
                          {item.minStockThreshold}).
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">
                    All inventory levels within safe operational thresholds.
                  </div>
                )}
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <Link
                  to="/inventory"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Manage Inventory &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Account Popover */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-semibold text-slate-900 leading-tight">
                {currentUser.name.split(' ')[0]}
              </span>
              <span className="block text-[10px] text-slate-500 uppercase font-medium">
                {currentUser.role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
              <div className="p-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  Role: {currentUser.role}
                </span>
              </div>

              {/* Quick switch between demo roles */}
              <div className="py-1">
                <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Demo Switch Account
                </span>
                {state.users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      navigate('/');
                      useMess; // context
                      window.location.reload();
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between ${
                      u.id === currentUser.id ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span>{u.name}</span>
                    <span className="text-[10px] uppercase text-slate-500 font-mono">{u.role}</span>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    resetDemoData();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset Demo Data</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
