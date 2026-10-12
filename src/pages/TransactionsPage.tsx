import React, { useState, useMemo } from 'react';
import { useMess } from '../store/MessContext';
import { Bill } from '../types';
import { formatINR } from '../utils/currency';
import { formatDateTime, formatDate, isWithinDateRange } from '../utils/date';
import { exportToCSV } from '../utils/export';
import { ReceiptModal } from '../components/ui/ReceiptModal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import {
  Receipt,
  Search,
  Filter,
  Download,
  Eye,
  RotateCcw,
  Ban,
  ChevronLeft,
  ChevronRight,
  Printer,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const { state, currentUser, cancelBill, refundBill } = useMess();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [cashierFilter, setCashierFilter] = useState('All');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Selected modals
  const [selectedReceiptBill, setSelectedReceiptBill] = useState<Bill | null>(null);
  const [actionBill, setActionBill] = useState<{ bill: Bill; type: 'cancel' | 'refund' } | null>(null);

  // If currentUser is cashier, they can default to their own transactions or see all
  const isCashier = currentUser.role === 'cashier';

  // Filter bills
  const filteredBills = useMemo(() => {
    return state.bills.filter((bill) => {
      // If cashier role, they only see their bills if strictly requested, but let's check cashier name
      if (isCashier && cashierFilter === 'My' && bill.cashierId !== currentUser.id) {
        return false;
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        bill.billNumber.toLowerCase().includes(q) ||
        bill.studentName.toLowerCase().includes(q) ||
        bill.studentId.toLowerCase().includes(q) ||
        bill.studentRoom.toLowerCase().includes(q);

      const matchesMethod = methodFilter === 'All' || bill.paymentMethod === methodFilter;
      const matchesStatus = statusFilter === 'All' || bill.status === statusFilter;
      const matchesCashier = cashierFilter === 'All' || bill.cashierName.includes(cashierFilter);
      const matchesDate = isWithinDateRange(bill.timestamp, dateStart, dateEnd);

      return matchesSearch && matchesMethod && matchesStatus && matchesCashier && matchesDate;
    });
  }, [state.bills, isCashier, currentUser.id, searchQuery, methodFilter, statusFilter, cashierFilter, dateStart, dateEnd]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredBills.length / pageSize) || 1;
  const paginatedBills = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBills.slice(start, start + pageSize);
  }, [filteredBills, currentPage, pageSize]);

  // Export CSV
  const handleExportCSV = () => {
    const rows = filteredBills.map((b) => ({
      BillNumber: b.billNumber,
      StudentID: b.studentId,
      StudentName: b.studentName,
      Room: b.studentRoom,
      Department: b.studentDepartment,
      Date: formatDate(b.timestamp),
      DateTime: formatDateTime(b.timestamp),
      Cashier: b.cashierName,
      ItemCount: b.items.length,
      Subtotal: b.subtotal,
      Discount: b.discount,
      Total: b.total,
      PaymentMethod: b.paymentMethod,
      PaymentStatus: b.paymentStatus,
      Status: b.status,
      RefundReason: b.refundReason || '',
    }));
    exportToCSV(`mess_transactions_${Date.now()}`, rows);
  };

  // Perform cancellation or refund with mandatory reason
  const handlePerformAction = (reason?: string) => {
    if (!actionBill || !reason) return;

    if (actionBill.type === 'cancel') {
      cancelBill(actionBill.bill.id, reason);
    } else {
      refundBill(actionBill.bill.id, reason);
    }
    setActionBill(null);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Bills &amp; Financial Transactions
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Complete transaction ledger with immutable audit trail, cancellation, and refund management
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Transactions CSV</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Keyword Search */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search bill number, student name or room..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Payment Method */}
          <div>
            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="All">All Payment Modes</option>
              <option value="upi">UPI / QR</option>
              <option value="cash">Cash</option>
              <option value="hostel_credit">Hostel Credit</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Date Start & End */}
          <div className="lg:col-span-2 flex items-center gap-2">
            <input
              type="date"
              value={dateStart}
              onChange={(e) => {
                setDateStart(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Start date"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => {
                setDateEnd(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="End date"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong>{filteredBills.length}</strong> records (Page {currentPage} of {totalPages})
          </span>
          {(searchQuery || methodFilter !== 'All' || statusFilter !== 'All' || dateStart || dateEnd) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setMethodFilter('All');
                setStatusFilter('All');
                setDateStart('');
                setDateEnd('');
                setCurrentPage(1);
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-3 px-4">Bill No</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Cashier</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Bill Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedBills.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No transactions match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{bill.billNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{bill.studentName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {bill.studentId} &middot; Room {bill.studentRoom}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{formatDateTime(bill.timestamp)}</td>
                    <td className="py-3 px-4 text-slate-600">{bill.cashierName.split(' ')[0]}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {bill.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatINR(bill.total)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold uppercase text-[10px] text-slate-700">
                        {bill.paymentMethod}
                      </div>
                      <div
                        className={`text-[9px] font-bold uppercase tracking-wider ${
                          bill.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {bill.paymentStatus}
                      </div>
                    </td>
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedReceiptBill(bill)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Tax Receipt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Can only cancel or refund if currently completed */}
                        {bill.status === 'completed' && (
                          <>
                            <button
                              onClick={() => setActionBill({ bill, type: 'refund' })}
                              className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Process Refund"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setActionBill({ bill, type: 'cancel' })}
                              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Cancel Transaction & Revert Inventory"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredBills.length)} of {filteredBills.length} records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      <ReceiptModal
        bill={selectedReceiptBill}
        onClose={() => setSelectedReceiptBill(null)}
      />

      {/* Cancellation / Refund Confirmation Modal */}
      {actionBill && (
        <ConfirmModal
          isOpen={!!actionBill}
          title={actionBill.type === 'cancel' ? `Cancel Bill ${actionBill.bill.billNumber}?` : `Refund Bill ${actionBill.bill.billNumber}?`}
          message={
            actionBill.type === 'cancel'
              ? `Cancelling this bill will reverse student spending metrics and automatically restore deducted inventory for tracked food items. The bill record will remain permanently preserved in the ledger as CANCELLED.`
              : `Processing a refund of ${formatINR(actionBill.bill.total)} will mark this bill as REFUNDED and debit cashier shift drawer balances.`
          }
          confirmLabel={actionBill.type === 'cancel' ? 'Confirm Cancellation' : 'Process Refund'}
          variant={actionBill.type === 'cancel' ? 'danger' : 'warning'}
          requireReason={true}
          reasonPlaceholder={`Enter regulatory reason for ${actionBill.type} (e.g. food quality issue, student billing mistake)...`}
          onConfirm={handlePerformAction}
          onCancel={() => setActionBill(null)}
        />
      )}
    </div>
  );
};
