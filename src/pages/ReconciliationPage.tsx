import React, { useState, useMemo } from 'react';
import { useMess } from '../store/MessContext';
import { formatINR } from '../utils/currency';
import { formatDate, formatDateTime, getTodayDateString } from '../utils/date';
import { exportToCSV } from '../utils/export';
import {
  Landmark,
  Calendar,
  Filter,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  Smartphone,
  CreditCard,
  RotateCcw,
} from 'lucide-react';

export const ReconciliationPage: React.FC = () => {
  const { state } = useMess();

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [selectedCashier, setSelectedCashier] = useState<string>('All');
  const [actualCountedCash, setActualCountedCash] = useState<number>(6250);

  // Filter bills by selected date and cashier
  const dailyBills = useMemo(() => {
    return state.bills.filter((b) => {
      const matchDate = b.timestamp.startsWith(selectedDate);
      const matchCashier = selectedCashier === 'All' || b.cashierName.includes(selectedCashier);
      return matchDate && matchCashier;
    });
  }, [state.bills, selectedDate, selectedCashier]);

  // Breakdown calculations
  const reconData = useMemo(() => {
    let completedCash = 0;
    let completedUPI = 0;
    let completedCredit = 0;
    let pendingCreditAmount = 0;
    let refundedAmount = 0;
    let openingFloatTotal = 2000; // standard opening drawer float

    dailyBills.forEach((b) => {
      if (b.status === 'completed') {
        if (b.paymentMethod === 'cash') completedCash += b.total;
        else if (b.paymentMethod === 'upi') completedUPI += b.total;
        else if (b.paymentMethod === 'hostel_credit') completedCredit += b.total;

        if (b.paymentStatus === 'pending') {
          pendingCreditAmount += b.total;
        }
      } else if (b.status === 'refunded') {
        refundedAmount += b.total;
      }
    });

    const expectedCashBalance = openingFloatTotal + completedCash - refundedAmount;
    const cashVariance = actualCountedCash - expectedCashBalance;
    const totalCollectedRealized = completedCash + completedUPI;

    return {
      openingFloatTotal,
      completedCash,
      completedUPI,
      completedCredit,
      pendingCreditAmount,
      refundedAmount,
      expectedCashBalance,
      cashVariance,
      totalCollectedRealized,
      billCount: dailyBills.length,
    };
  }, [dailyBills, actualCountedCash]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const rows = [
      { Metric: 'Reporting Date', Value: selectedDate },
      { Metric: 'Opening Cash Float', Value: reconData.openingFloatTotal },
      { Metric: 'Completed Cash Payments', Value: reconData.completedCash },
      { Metric: 'Completed UPI Payments', Value: reconData.completedUPI },
      { Metric: 'Hostel Credit Ledger Transactions', Value: reconData.completedCredit },
      { Metric: 'Unpaid Pending Hostel Credit', Value: reconData.pendingCreditAmount },
      { Metric: 'Cash Refunds Paid', Value: reconData.refundedAmount },
      { Metric: 'Expected Cash Drawer Balance', Value: reconData.expectedCashBalance },
      { Metric: 'Actual Cash Counted', Value: actualCountedCash },
      { Metric: 'Discrepancy Variance', Value: reconData.cashVariance },
    ];
    exportToCSV(`reconciliation_${selectedDate}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Daily Payment Reconciliation
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Audit register drawer balances against electronic UPI and deferred hostel credit records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
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
            <span>Print Closing Sheet</span>
          </button>
        </div>
      </div>

      {/* Date & Cashier Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700">Audit Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700">Terminal:</span>
            <select
              value={selectedCashier}
              onChange={(e) => setSelectedCashier(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium"
            >
              <option value="All">All Cashier Terminals</option>
              {state.users
                .filter((u) => u.role === 'cashier')
                .map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Transactions in batch: <strong>{reconData.billCount}</strong>
        </div>
      </div>

      {/* Printable Report Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs printable-area space-y-6">
        {/* Report Top Header */}
        <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {state.settings.messName} &middot; Daily Closing Balance Sheet
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Financial reconciliation for business day: <strong>{formatDate(selectedDate)}</strong> &middot; Campus Mess Accounting
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-500 font-mono">
            <div>Printed: {formatDateTime(new Date().toISOString())}</div>
            <div>Timezone: {state.settings.timezone}</div>
          </div>
        </div>

        {/* 4 Primary Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>Collected Physical Cash</span>
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
              {formatINR(reconData.completedCash)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">From completed cash bills</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>Collected UPI / QR</span>
            </div>
            <div className="text-xl font-bold font-mono text-blue-700 tabular-nums">
              {formatINR(reconData.completedUPI)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Direct merchant bank settlement</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
              <CreditCard className="w-4 h-4 text-amber-600" />
              <span>Hostel Credit Total</span>
            </div>
            <div className="text-xl font-bold font-mono text-amber-800 tabular-nums">
              {formatINR(reconData.completedCredit)}
            </div>
            <p className="text-[11px] text-amber-700 mt-1">Unpaid Pending: {formatINR(reconData.pendingCreditAmount)}</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <span>Refunds Dispensed</span>
            </div>
            <div className="text-xl font-bold font-mono text-rose-700 tabular-nums">
              {formatINR(reconData.refundedAmount)}
            </div>
            <p className="text-[11px] text-rose-600 mt-1">Debited from cash drawer</p>
          </div>
        </div>

        {/* Cash Drawer Reconciliation Matrix */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Cash Drawer Physical Count vs Expected Calculation
            </h3>
            <span className="text-[11px] text-slate-500">Audited Closing Verification</span>
          </div>

          <div className="p-4 space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">1. Opening Cash Float (Change Provided):</span>
              <span className="font-mono font-semibold">{formatINR(reconData.openingFloatTotal)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">2. + Completed Cash Billing Inflow:</span>
              <span className="font-mono font-semibold text-emerald-700">+{formatINR(reconData.completedCash)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">3. &ndash; Cash Customer Refunds Dispensed:</span>
              <span className="font-mono font-semibold text-amber-700">-{formatINR(reconData.refundedAmount)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200 font-bold text-slate-900 bg-slate-50 px-2 rounded-lg">
              <span>Expected Cash in Drawer:</span>
              <span className="font-mono text-sm text-blue-700">{formatINR(reconData.expectedCashBalance)}</span>
            </div>

            {/* Actual count input in UI */}
            <div className="flex justify-between items-center py-2 no-print">
              <span className="font-semibold text-slate-800">Physical Cash Counted by Supervisor (₹):</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={actualCountedCash}
                  onChange={(e) => setActualCountedCash(Number(e.target.value))}
                  className="w-32 px-3 py-1.5 border border-slate-300 rounded-lg text-right font-mono font-bold text-sm"
                />
              </div>
            </div>

            {/* Variance row */}
            <div className="flex justify-between py-3 px-3 rounded-xl bg-slate-100 font-bold text-sm">
              <span>Variance Discrepancy (Actual &ndash; Expected):</span>
              <span
                className={`font-mono text-base ${
                  reconData.cashVariance === 0
                    ? 'text-emerald-700'
                    : reconData.cashVariance > 0
                    ? 'text-blue-700'
                    : 'text-rose-700'
                }`}
              >
                {formatINR(reconData.cashVariance)}
                {reconData.cashVariance === 0 && ' (Balanced Perfectly)'}
              </span>
            </div>
          </div>
        </div>

        {/* Regulatory Statement Note */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-slate-800">Accounting Policy Note:</p>
          <p>
            Unpaid Hostel Credit transactions ({formatINR(reconData.pendingCreditAmount)}) are not treated as collected cash or UPI revenue. They remain in the Student Hostel Dues Ledger until cleared by the academic bursar office.
          </p>
        </div>

        {/* Signature lines for printable sheet */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-6 text-center text-xs text-slate-500">
          <div>
            <div className="h-10 border-b border-slate-300 mb-2" />
            <span>Cashier Signature</span>
          </div>
          <div>
            <div className="h-10 border-b border-slate-300 mb-2" />
            <span>Shift Supervisor</span>
          </div>
          <div>
            <div className="h-10 border-b border-slate-300 mb-2" />
            <span>Mess Warden / Manager</span>
          </div>
        </div>
      </div>
    </div>
  );
};
