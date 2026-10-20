import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useMess } from '../../store/MessContext';
import { formatINR } from '../../utils/currency';
import {
  Search,
  Bell,
  Menu,
  Calendar,
  Clock,
  User as UserIcon,
  ChevronDown,
  LogOut,
  RefreshCw,
  Utensils,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  UserCheck,
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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pathMap: Record<string, { title: string; section: string }> = {
    '/': { title: 'Admin Overview Dashboard', section: 'Overview' },
    '/billing': { title: 'High-Speed Point of Sale Billing', section: 'Billing / POS' },
    '/students': { title: 'Students Directory & Spend Ledgers', section: 'Students' },
    '/products': { title: 'Food Menu & Product Catalog', section: 'Products & Menu' },
    '/transactions': { title: 'Bills & Transaction Ledger', section: 'Bills & Transactions' },
    '/analytics': { title: 'Sales Analytics & Revenue Reports', section: 'Sales & Analytics' },
    '/inventory': { title: 'Food Inventory & Stock Valuation', section: 'Inventory' },
    '/cashiers': { title: 'Cashier Shift Logs & Cash Drawers', section: 'Cashiers & Shifts' },
    '/reconciliation': { title: 'Daily End-of-Day Payment Reconciliation', section: 'Reconciliation' },
    '/audit-logs': { title: 'Immutable System Audit Trail', section: 'Audit Logs' },
    '/users': { title: 'User Management & Role Permissions', section: 'User Management' },
    '/settings': { title: 'Mess ERP Configuration & Rules', section: 'Settings' },
    '/student-portal': { title: 'Student Dining Account & Self-Service Portal', section: 'Student Portal' },
  };

  const currentRouteMeta = pathMap[location.pathname] || {
    title: 'Hostel Mess Smart Management',
    section: 'Hostel Mess',
  };

  // Global search filtering
  const q = searchQuery.trim().toLowerCase();
  const matchingStudents = q
    ? state.students
        .filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.id.toLowerCase().includes(q) ||
            s.roomNumber.toLowerCase().includes(q) ||
            s.department.toLowerCase().includes(q)
        )
        .slice(0, 4)
    : [];

  const matchingProducts = q
    ? state.products
        .filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q))
        .slice(0, 3)
    : [];

  const matchingBills = q
    ? state.bills
        .filter(
          (b) =>
            b.billNumber.toLowerCase().includes(q) ||
            b.studentName.toLowerCase().includes(q) ||
            b.studentId.toLowerCase().includes(q)
        )
        .slice(0, 3)
    : [];

  const businessDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const lowStockCount = state.products.filter(
    (p) => p.isStockTracked && p.stockQuantity <= p.minStockThreshold
  ).length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between gap-4 no-print shadow-xs">
      {/* Left: Mobile menu button & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex flex-col">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Mess ERP</span>
            <span>/</span>
            <span className="text-slate-700 font-semibold">{currentRouteMeta.section}</span>
          </div>
          <h1 className="text-sm md:text-base font-bold text-slate-900 leading-tight">
            {currentRouteMeta.title}
          </h1>
        </div>
      </div>

      {/* Center: Global Search (Hidden for students to ensure strict privacy) */}
      {currentUser.role !== 'student' ? (
        <div ref={searchRef} className="flex-1 max-w-md relative hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search students (STU-001...), menu dishes, bills..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && searchQuery.trim().length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50 text-xs divide-y divide-slate-100">
            {matchingStudents.length === 0 &&
            matchingProducts.length === 0 &&
            matchingBills.length === 0 ? (
              <div className="p-4 text-center text-slate-500">No matching records found.</div>
            ) : (
              <>
                {matchingStudents.length > 0 && (
                  <div className="p-2">
                    <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                      Students
                    </div>
                    {matchingStudents.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setShowSearchResults(false);
                          setSearchQuery('');
                          navigate(`/students/${s.id}`);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-blue-50 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-900">{s.name}</span>
                          <span className="text-[11px] text-slate-500 ml-2 font-mono">
                            {s.id} &middot; Room {s.roomNumber}
                          </span>
                        </div>
                        <span className="text-[10px] text-blue-600 font-semibold">View Ledger</span>
                      </button>
                    ))}
                  </div>
                )}

                {matchingProducts.length > 0 && (
                  <div className="p-2">
                    <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                      Dishes &amp; Products
                    </div>
                    {matchingProducts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setShowSearchResults(false);
                          setSearchQuery('');
                          navigate('/products');
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-blue-50 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span>{p.imageEmoji}</span>
                          <span className="font-semibold text-slate-800">{p.name}</span>
                        </div>
                        <span className="font-bold font-mono text-slate-900">{formatINR(p.price)}</span>
                      </button>
                    ))}
                  </div>
                )}

                {matchingBills.length > 0 && (
                  <div className="p-2">
                    <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                      Bills
                    </div>
                    {matchingBills.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          setShowSearchResults(false);
                          setSearchQuery('');
                          navigate('/transactions');
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-blue-50 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold font-mono text-blue-600">{b.billNumber}</span>
                          <span className="text-slate-600 ml-2">{b.studentName}</span>
                        </div>
                        <span className="font-bold font-mono text-slate-900">
                          {formatINR(b.totalAmount)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Right Controls: Business Date, Notification bell, User info */}
      <div className="flex items-center gap-3">
        {/* Business Date */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-medium">{businessDate}</span>
        </div>

        {/* Notifications Icon with popover */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative focus:outline-none transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {lowStockCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-50 text-xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900">Notifications &amp; Alerts</span>
                <span className="text-[10px] text-slate-500 font-mono">Live</span>
              </div>

              {lowStockCount > 0 ? (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block">Low Stock Alert</strong>
                    <span>{lowStockCount} food items have reached minimum threshold.</span>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block">Inventory Healthy</strong>
                    <span>All tracked finished products are within safe stock margins.</span>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100">
                <Link
                  to="/inventory"
                  onClick={() => setShowNotifications(false)}
                  className="block text-center text-blue-600 font-semibold hover:underline"
                >
                  Manage Stock Inventory &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Account Menu */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors focus:outline-none"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">
                {currentUser.role}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-900 truncate">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold text-[10px] uppercase">
                  {currentUser.role} Account
                </span>
              </div>

              <div className="p-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    resetDemoData();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-amber-700 hover:bg-amber-50 flex items-center gap-2 font-medium"
                >
                  <RefreshCw className="w-4 h-4 text-amber-600" />
                  <span>Reset Demo Data</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Switch Account / Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
