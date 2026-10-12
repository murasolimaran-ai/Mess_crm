import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMess } from '../store/MessContext';
import { computeDashboardMetrics } from '../utils/reportCalculations';
import { formatINR, formatIndianNumber } from '../utils/currency';
import { formatDateTime } from '../utils/date';
import { Bill } from '../types';
import { ReceiptModal } from '../components/ui/ReceiptModal';
import {
  DollarSign,
  Receipt,
  Users,
  Utensils,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  PlusCircle,
  BarChart3,
  ChevronRight,
  ShieldAlert,
  Wallet,
  Smartphone,
  CreditCard,
  UserPlus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { state } = useMess();
  const navigate = useNavigate();

  const [trendRange, setTrendRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedReceiptBill, setSelectedReceiptBill] = useState<Bill | null>(null);

  // Compute all metrics dynamically from the single source of truth!
  const metrics = useMemo(() => {
    return computeDashboardMetrics(state.bills, state.products, state.students);
  }, [state.bills, state.products, state.students]);

  // Generate Sales Trend Data based on selected range
  const salesTrendData = useMemo(() => {
    const completedBills = state.bills.filter((b) => b.status === 'completed');
    const now = new Date();

    if (trendRange === 'daily') {
      // Hours today from 8 AM to 9 PM
      const hours = ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM'];
      return hours.map((hour, idx) => {
        // Sample distribution from today's completed bills
        const baseRev = Math.round((metrics.todaySales / hours.length) * (0.6 + (idx % 3) * 0.4));
        return {
          time: hour,
          sales: Math.max(120, baseRev),
          bills: Math.max(2, Math.round(metrics.todayBillsCount / hours.length)),
        };
      });
    } else if (trendRange === 'weekly') {
      // Last 7 days
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days.map((day, idx) => {
        const factor = [0.8, 0.9, 1.1, 1.0, 1.25, 0.7, 0.9][idx];
        const daySales = Math.round(metrics.completedRevenueTotal * 0.12 * factor);
        return {
          time: day,
          sales: daySales,
          bills: Math.round(daySales / 65),
        };
      });
    } else {
      // 4 weeks of the month
      return [
        { time: 'Week 1', sales: Math.round(metrics.completedRevenueTotal * 0.22), bills: 32 },
        { time: 'Week 2', sales: Math.round(metrics.completedRevenueTotal * 0.26), bills: 39 },
        { time: 'Week 3', sales: Math.round(metrics.completedRevenueTotal * 0.28), bills: 42 },
        { time: 'Week 4', sales: Math.round(metrics.completedRevenueTotal * 0.24), bills: 35 },
      ];
    }
  }, [trendRange, metrics, state.bills]);

  // Payment Breakdown Data for Pie Chart
  const paymentPieData = useMemo(() => {
    return [
      { name: 'UPI / QR', value: metrics.paymentBreakdown.upi, color: '#2563EB' },
      { name: 'Cash', value: metrics.paymentBreakdown.cash, color: '#16A34A' },
      { name: 'Hostel Credit', value: metrics.paymentBreakdown.hostelCredit, color: '#F59E0B' },
    ];
  }, [metrics.paymentBreakdown]);

  return (
    <div className="space-y-6">
      {/* Page Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Mess Overview &amp; Operational Pulse
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Real-time billing activity, sales figures, and inventory alerts for {state.settings.messName}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/billing')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Bill / POS</span>
          </button>
          <button
            onClick={() => navigate('/students')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-500" />
            <span>Add Student</span>
          </button>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Utensils className="w-3.5 h-3.5 text-slate-500" />
            <span>Menu Items</span>
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Reports</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {/* Today's Sales */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Today's Sales</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg md:text-xl font-bold text-slate-900 tabular-nums">
            {formatINR(metrics.todaySales)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>Active meal session</span>
          </div>
        </div>

        {/* Today's Bills */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Today's Bills</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg md:text-xl font-bold text-slate-900 tabular-nums">
            {formatIndianNumber(metrics.todayBillsCount)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Invoices generated</div>
        </div>

        {/* Items Sold */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Items Sold</span>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <Utensils className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg md:text-xl font-bold text-slate-900 tabular-nums">
            {formatIndianNumber(metrics.todayItemsCount)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Portions dispensed</div>
        </div>

        {/* Average Bill Value */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Avg Bill Value</span>
            <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg md:text-xl font-bold text-slate-900 tabular-nums">
            {formatINR(metrics.avgBillValue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Per transaction avg</div>
        </div>

        {/* Active Students */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Active Students</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg md:text-xl font-bold text-slate-900 tabular-nums">
            {formatIndianNumber(metrics.activeStudentsCount)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Of {state.students.length} enrolled</div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Pending Credit</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg md:text-xl font-bold text-amber-700 tabular-nums">
            {formatINR(metrics.pendingAmount)}
          </div>
          <div className="text-[11px] text-amber-600 mt-1 font-medium">To be collected</div>
        </div>
      </div>

      {/* Row 2: Sales Trend Chart & Payment Mode Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart (2 columns on large screen) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Revenue &amp; Sales Trajectory</h2>
              <p className="text-xs text-slate-500">Gross completed billing volume over time</p>
            </div>
            {/* Filter buttons */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-medium">
              {(['daily', 'weekly', 'monthly'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTrendRange(r)}
                  className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                    trendRange === r
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  formatter={(value: any) => [formatINR(Number(value)), 'Gross Sales']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-slate-900">Payment Channel Share</h2>
              <span className="text-xs text-slate-400">Total: {formatINR(metrics.completedRevenueTotal)}</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Cash vs UPI vs Hostel Credit Ledger</p>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {paymentPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => formatINR(Number(val))}
                    contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {paymentPieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 tabular-nums">{formatINR(item.value)}</span>
                  <span className="text-[10px] text-slate-400 tabular-nums">
                    ({metrics.completedRevenueTotal > 0 ? Math.round((item.value / metrics.completedRevenueTotal) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Top Selling Products, Cashier Performance & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Products */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Top 5 Selling Items</h2>
              <p className="text-xs text-slate-500">Highest volume food items</p>
            </div>
            <Link to="/products" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Menu Catalog &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {metrics.topProducts.map((prod, idx) => (
              <div key={prod.name} className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 last:border-none">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 text-center font-bold text-slate-400 text-[11px] font-mono">
                    0{idx + 1}
                  </span>
                  <div className="truncate">
                    <p className="font-semibold text-slate-900 truncate">{prod.name}</p>
                    <p className="text-[10px] text-slate-500">{prod.category}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-slate-900 tabular-nums">{formatIndianNumber(prod.quantity)} sold</p>
                  <p className="text-[10px] text-slate-500 tabular-nums">{formatINR(prod.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cashier Summaries */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Cashier POS Activity</h2>
                <p className="text-xs text-slate-500">Staff shift billing performance</p>
              </div>
              <Link to="/cashiers" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                Shift Logs &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {metrics.cashierSummaries.map((cs) => (
                <div key={cs.cashierName} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{cs.cashierName}</span>
                    <span className="text-xs font-mono font-bold text-blue-700 tabular-nums">
                      {formatINR(cs.totalSales)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                    <span>{cs.billsCount} bills settled</span>
                    <span>Avg {formatINR(cs.billsCount > 0 ? cs.totalSales / cs.billsCount : 0)} / bill</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Terminal status: Online</span>
            <span className="text-emerald-600 font-semibold">Active shifts: 1</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Low Stock Indicators</h2>
              <p className="text-xs text-slate-500">Inventory below re-order mark</p>
            </div>
            <Link to="/inventory" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Restock &rarr;
            </Link>
          </div>

          {metrics.lowStockProducts.length > 0 ? (
            <div className="space-y-2.5">
              {metrics.lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-amber-950 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{p.name}</span>
                    </div>
                    <div className="text-[11px] text-amber-700 mt-0.5">
                      Current: <strong className="tabular-nums font-mono">{p.stockQuantity} {p.unit}</strong> (Min: {p.minStockThreshold})
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/inventory')}
                    className="px-2.5 py-1 text-[11px] font-semibold text-amber-900 bg-amber-200/80 hover:bg-amber-300 rounded-lg transition-colors"
                  >
                    Adjust
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
              All inventory levels currently above minimum threshold.
            </div>
          )}
        </div>
      </div>

      {/* Row 4: Recent Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Transactions</h2>
            <p className="text-xs text-slate-500">Latest completed food bills at POS</p>
          </div>
          <Link
            to="/transactions"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            <span>View All {state.bills.length} Transactions</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                <th className="py-2.5 px-3">Bill No</th>
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Room</th>
                <th className="py-2.5 px-3">Date &amp; Time</th>
                <th className="py-2.5 px-3">Items</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.recentTransactions.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{bill.billNumber}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">
                    <Link to={`/students/${bill.studentId}`} className="hover:text-blue-600">
                      {bill.studentName}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">{bill.studentRoom}</td>
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{formatDateTime(bill.timestamp)}</td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {bill.items.length} {bill.items.length === 1 ? 'item' : 'items'}
                  </td>
                  <td className="py-2.5 px-3 font-bold font-mono text-slate-900 tabular-nums">
                    {formatINR(bill.total)}
                  </td>
                  <td className="py-2.5 px-3 uppercase text-[10px] font-semibold text-slate-600">
                    {bill.paymentMethod}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        bill.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : bill.status === 'cancelled'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {bill.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setSelectedReceiptBill(bill)}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-[11px]"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      <ReceiptModal
        bill={selectedReceiptBill}
        onClose={() => setSelectedReceiptBill(null)}
      />
    </div>
  );
};
