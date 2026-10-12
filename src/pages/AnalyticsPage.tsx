import React, { useState, useMemo } from 'react';
import { useMess } from '../store/MessContext';
import { formatINR, formatIndianNumber } from '../utils/currency';
import { formatDate, isWithinDateRange } from '../utils/date';
import { exportToCSV } from '../utils/export';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  DollarSign,
  Receipt,
  Users,
  Utensils,
  Wallet,
  RotateCcw,
  Ban,
  ArrowUpRight,
  Printer,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { state } = useMess();

  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [activeTab, setActiveTab] = useState<'revenue' | 'products' | 'students' | 'cashiers' | 'payments'>('revenue');

  // Filter bills within selected date range
  const scopedBills = useMemo(() => {
    return state.bills.filter((b) => isWithinDateRange(b.timestamp, dateStart, dateEnd));
  }, [state.bills, dateStart, dateEnd]);

  // Aggregate Metrics
  const aggregates = useMemo(() => {
    let grossSales = 0; // all attempted
    let completedSales = 0; // only completed
    let refundedSales = 0;
    let cancelledSales = 0;
    let pendingCredit = 0;
    let completedBillsCount = 0;

    const paymentModes = { cash: 0, upi: 0, hostel_credit: 0 };
    const productSales: { [name: string]: { category: string; quantity: number; revenue: number } } = {};
    const studentSales: { [id: string]: { name: string; dept: string; room: string; total: number; count: number } } = {};
    const cashierSales: { [name: string]: { gross: number; completed: number; billsCount: number; refunds: number; cancellations: number } } = {};

    scopedBills.forEach((b) => {
      grossSales += b.total;

      // Cashier baseline
      if (!cashierSales[b.cashierName]) {
        cashierSales[b.cashierName] = { gross: 0, completed: 0, billsCount: 0, refunds: 0, cancellations: 0 };
      }
      cashierSales[b.cashierName].gross += b.total;

      if (b.status === 'completed') {
        completedSales += b.total;
        completedBillsCount += 1;
        cashierSales[b.cashierName].completed += b.total;
        cashierSales[b.cashierName].billsCount += 1;

        // Payment modes
        if (b.paymentMethod === 'cash') paymentModes.cash += b.total;
        else if (b.paymentMethod === 'upi') paymentModes.upi += b.total;
        else if (b.paymentMethod === 'hostel_credit') paymentModes.hostel_credit += b.total;

        if (b.paymentStatus === 'pending') {
          pendingCredit += b.total;
        }

        // Product stats
        b.items.forEach((item) => {
          if (!productSales[item.productName]) {
            productSales[item.productName] = { category: item.category, quantity: 0, revenue: 0 };
          }
          productSales[item.productName].quantity += item.quantity;
          productSales[item.productName].revenue += item.total;
        });

        // Student stats
        if (!studentSales[b.studentId]) {
          studentSales[b.studentId] = {
            name: b.studentName,
            dept: b.studentDepartment,
            room: b.studentRoom,
            total: 0,
            count: 0,
          };
        }
        studentSales[b.studentId].total += b.total;
        studentSales[b.studentId].count += 1;
      } else if (b.status === 'refunded') {
        refundedSales += b.total;
        cashierSales[b.cashierName].refunds += b.total;
      } else if (b.status === 'cancelled') {
        cancelledSales += b.total;
        cashierSales[b.cashierName].cancellations += 1;
      }
    });

    const netSales = completedSales - refundedSales;
    const avgBillValue = completedBillsCount > 0 ? completedSales / completedBillsCount : 0;

    // Ranked Products
    const rankedProducts = Object.entries(productSales).map(([name, data]) => ({
      name,
      ...data,
    }));
    const topByQuantity = [...rankedProducts].sort((a, b) => b.quantity - a.quantity);
    const topByRevenue = [...rankedProducts].sort((a, b) => b.revenue - a.revenue);
    const lowestSelling = [...rankedProducts].sort((a, b) => a.quantity - b.quantity);

    // Category distribution
    const categoryTotals: { [cat: string]: number } = {};
    rankedProducts.forEach((p) => {
      categoryTotals[p.category] = (categoryTotals[p.category] || 0) + p.revenue;
    });
    const categoryChartData = Object.entries(categoryTotals).map(([cat, rev]) => ({
      name: cat,
      revenue: rev,
    }));

    // Ranked Students
    const rankedStudents = Object.entries(studentSales).map(([id, data]) => ({
      id,
      ...data,
    }));
    const topSpenders = [...rankedStudents].sort((a, b) => b.total - a.total).slice(0, 8);
    const frequentBuyers = [...rankedStudents].sort((a, b) => b.count - a.count).slice(0, 8);

    // Cashier rows
    const cashierSummaryList = Object.entries(cashierSales).map(([name, data]) => ({
      name,
      ...data,
      avg: data.billsCount > 0 ? data.completed / data.billsCount : 0,
    }));

    return {
      grossSales,
      completedSales,
      refundedSales,
      cancelledSales,
      netSales,
      pendingCredit,
      completedBillsCount,
      avgBillValue,
      paymentModes,
      topByQuantity,
      topByRevenue,
      lowestSelling,
      categoryChartData,
      topSpenders,
      frequentBuyers,
      cashierSummaryList,
    };
  }, [scopedBills]);

  // Export Analytics CSV
  const handleExportAnalytics = () => {
    const rows = aggregates.topByRevenue.map((p) => ({
      Product: p.name,
      Category: p.category,
      QuantitySold: p.quantity,
      GrossRevenue: p.revenue,
    }));
    exportToCSV(`mess_analytics_report_${Date.now()}`, rows);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Sales &amp; Financial Analytics
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Audit-grade reporting &middot; Timezone: Asia/Kolkata (IST) &middot; Filtered transactions: {scopedBills.length}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              className="text-xs border-none focus:outline-none text-slate-700"
            />
            <span className="text-slate-400">&ndash;</span>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              className="text-xs border-none focus:outline-none text-slate-700"
            />
          </div>

          <button
            onClick={handleExportAnalytics}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Completed Sales</span>
          <div className="text-lg md:text-xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
            {formatINR(aggregates.completedSales)}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Valid revenue</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Net Realized</span>
          <div className="text-lg md:text-xl font-bold text-blue-700 mt-1 font-mono tabular-nums">
            {formatINR(aggregates.netSales)}
          </div>
          <span className="text-[11px] text-slate-400">After refunds</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Refunds Total</span>
          <div className="text-lg md:text-xl font-bold text-amber-700 mt-1 font-mono tabular-nums">
            {formatINR(aggregates.refundedSales)}
          </div>
          <span className="text-[11px] text-amber-600 font-medium">Debited drawer</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Cancelled Sales</span>
          <div className="text-lg md:text-xl font-bold text-rose-700 mt-1 font-mono tabular-nums">
            {formatINR(aggregates.cancelledSales)}
          </div>
          <span className="text-[11px] text-slate-400">Inventory restored</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Pending Credit</span>
          <div className="text-lg md:text-xl font-bold text-amber-600 mt-1 font-mono tabular-nums">
            {formatINR(aggregates.pendingCredit)}
          </div>
          <span className="text-[11px] text-slate-400">Hostel ledger due</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Avg Bill Value</span>
          <div className="text-lg md:text-xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
            {formatINR(aggregates.avgBillValue)}
          </div>
          <span className="text-[11px] text-slate-400">{aggregates.completedBillsCount} bills</span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'revenue', label: 'A. Revenue & Trends' },
          { id: 'products', label: 'B. Product Analytics' },
          { id: 'students', label: 'C. Student Analytics' },
          { id: 'cashiers', label: 'D. Cashier Analytics' },
          { id: 'payments', label: 'E. Payment Channel Share' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab A: Revenue */}
      {activeTab === 'revenue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Category-Wise Revenue Contribution</h2>
            <p className="text-xs text-slate-500 mb-4">Gross income earned across distinct menu categories</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aggregates.categoryChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(val: any) => [formatINR(Number(val)), 'Sales']}
                    contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Bar dataKey="revenue" fill="#2563EB" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-1">Financial Reconciliation Summary</h2>
              <p className="text-xs text-slate-500 mb-4">Reconciliation of gross vs completed vs refunds</p>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-600">Gross Processed Transactions:</span>
                  <span className="font-mono font-bold">{formatINR(aggregates.grossSales)}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-600">Valid Completed Orders:</span>
                  <span className="font-mono font-bold text-emerald-700">{formatINR(aggregates.completedSales)}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-600">Approved Customer Refunds:</span>
                  <span className="font-mono font-bold text-amber-700">-{formatINR(aggregates.refundedSales)}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-600">Voided / Cancelled Bills:</span>
                  <span className="font-mono font-bold text-rose-700">{formatINR(aggregates.cancelledSales)}</span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-bold text-slate-900">
                  <span>Net Mess Retained:</span>
                  <span className="font-mono text-blue-700">{formatINR(aggregates.netSales)}</span>
                </div>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-4 p-2.5 bg-slate-50 rounded-xl">
              Consistent accounting rule: Cancelled orders are excluded from net sales and reverse ingredient deductions.
            </div>
          </div>
        </div>
      )}

      {/* Tab B: Product Analytics */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Products by Volume */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Top Selling Items (By Volume)</h2>
            <p className="text-xs text-slate-500 mb-4">Dishes with highest plate/portion turnover</p>
            <div className="space-y-2.5">
              {aggregates.topByQuantity.slice(0, 8).map((p, idx) => (
                <div key={p.name} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 font-bold text-[10px]">#{idx + 1}</span>
                    <span className="font-semibold text-slate-900">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 font-mono">{formatIndianNumber(p.quantity)} units</span>
                    <span className="text-slate-500 text-[10px] ml-2 font-mono">({formatINR(p.revenue)})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products by Revenue */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Highest Revenue Generators</h2>
            <p className="text-xs text-slate-500 mb-4">Dishes producing largest gross rupees</p>
            <div className="space-y-2.5">
              {aggregates.topByRevenue.slice(0, 8).map((p, idx) => (
                <div key={p.name} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 font-bold text-[10px]">#{idx + 1}</span>
                    <span className="font-semibold text-slate-900">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-blue-700 font-mono">{formatINR(p.revenue)}</span>
                    <span className="text-slate-500 text-[10px] ml-2 font-mono">({p.quantity} units)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab C: Student Analytics */}
      {activeTab === 'students' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Top Spending Students</h2>
            <p className="text-xs text-slate-500 mb-4">Highest total purchase volume</p>
            <div className="space-y-2.5">
              {aggregates.topSpenders.map((s, idx) => (
                <div key={s.id} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50">
                  <div>
                    <span className="font-bold text-slate-900">{s.name}</span>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {s.id} &middot; Room {s.room}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold font-mono text-slate-900">{formatINR(s.total)}</span>
                    <div className="text-[10px] text-slate-500">{s.count} bills</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Most Frequent Diners</h2>
            <p className="text-xs text-slate-500 mb-4">Highest number of mess transactions</p>
            <div className="space-y-2.5">
              {aggregates.frequentBuyers.map((s, idx) => (
                <div key={s.id} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50">
                  <div>
                    <span className="font-bold text-slate-900">{s.name}</span>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {s.id} &middot; Room {s.room}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold font-mono text-emerald-700">{s.count} transactions</span>
                    <div className="text-[10px] text-slate-500">{formatINR(s.total)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab D: Cashier Analytics */}
      {activeTab === 'cashiers' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Cashier Shift Performance Breakdown</h2>
          <p className="text-xs text-slate-500 mb-4">Audited bills settled, gross collections, and cancellations</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Cashier Name</th>
                  <th className="py-2.5 px-3 text-right">Bills Settled</th>
                  <th className="py-2.5 px-3 text-right">Gross Sales</th>
                  <th className="py-2.5 px-3 text-right">Completed Sales</th>
                  <th className="py-2.5 px-3 text-right">Refunds Paid</th>
                  <th className="py-2.5 px-3 text-right">Cancellations</th>
                  <th className="py-2.5 px-3 text-right">Average Bill</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {aggregates.cashierSummaryList.map((c) => (
                  <tr key={c.name} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">{c.name}</td>
                    <td className="py-3 px-3 text-right font-mono">{c.billsCount}</td>
                    <td className="py-3 px-3 text-right font-mono">{formatINR(c.gross)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-blue-700">{formatINR(c.completed)}</td>
                    <td className="py-3 px-3 text-right font-mono text-amber-700">{formatINR(c.refunds)}</td>
                    <td className="py-3 px-3 text-right font-mono text-rose-700">{c.cancellations}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold">{formatINR(c.avg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab E: Payments */}
      {activeTab === 'payments' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">UPI / QR Digital</span>
            <div className="text-xl font-bold text-blue-700 font-mono mt-2 tabular-nums">
              {formatINR(aggregates.paymentModes.upi)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Direct bank credit via QR scanning</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Physical Cash</span>
            <div className="text-xl font-bold text-emerald-700 font-mono mt-2 tabular-nums">
              {formatINR(aggregates.paymentModes.cash)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Cash in register drawers</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Hostel Credit Ledger</span>
            <div className="text-xl font-bold text-amber-700 font-mono mt-2 tabular-nums">
              {formatINR(aggregates.paymentModes.hostel_credit)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Billed against monthly hostel dues</p>
          </div>
        </div>
      )}
    </div>
  );
};
