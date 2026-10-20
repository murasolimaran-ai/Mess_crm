import React from 'react';
import { Bill } from '../../types';
import { useMess } from '../../store/MessContext';
import { formatINR } from '../../utils/currency';
import { formatDateTime } from '../../utils/date';
import { Printer, X, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';

interface ReceiptModalProps {
  bill: Bill | null;
  isOpen?: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ bill, onClose }) => {
  const { state } = useMess();

  if (!bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const isCancelled = bill.status === 'cancelled';
  const isRefunded = bill.status === 'refunded';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden my-6">
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tax Invoice &amp; Receipt
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-6 printable-area bg-white text-slate-900 font-mono text-xs">
          {/* Header */}
          <div className="text-center border-b border-dashed border-slate-300 pb-4">
            <h2 className="text-base font-bold text-slate-900 font-sans tracking-tight">
              {state.settings.messName}
            </h2>
            <p className="text-[11px] text-slate-600 font-sans">{state.settings.instituteName}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{state.settings.address}</p>
            <p className="text-[10px] text-slate-500">Ph: {state.settings.phone}</p>
            {state.settings.gstNumber && (
              <p className="text-[10px] text-slate-500">GSTIN: {state.settings.gstNumber}</p>
            )}
          </div>

          {/* Status Badge if Refunded or Cancelled */}
          {(isCancelled || isRefunded) && (
            <div className="my-3 p-2 rounded border border-rose-200 bg-rose-50 text-rose-800 text-center font-sans">
              <div className="font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-1">
                {isCancelled ? <AlertCircle className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                {isCancelled ? 'TRANSACTION CANCELLED' : 'PAYMENT REFUNDED'}
              </div>
              {bill.refundReason && (
                <p className="text-[11px] mt-0.5 text-rose-700 italic">
                  Reason: {bill.refundReason}
                </p>
              )}
            </div>
          )}

          {/* Bill Meta */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Bill No:</span>
              <span className="font-bold text-slate-900">{bill.billNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date &amp; Time:</span>
              <span>{formatDateTime(bill.timestamp)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cashier:</span>
              <span>{bill.cashierName}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between">
              <span className="text-slate-500">Student ID:</span>
              <span className="font-semibold text-slate-900">{bill.studentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Name:</span>
              <span className="font-sans font-medium">{bill.studentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Room / Dept:</span>
              <span>
                {bill.studentRoom} · {bill.studentDepartment}
              </span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="py-3 border-b border-dashed border-slate-300">
            <div className="flex justify-between font-bold text-slate-700 pb-1.5 border-b border-slate-200">
              <span className="w-1/2">Item</span>
              <span className="w-12 text-center">Qty</span>
              <span className="w-16 text-right">Rate</span>
              <span className="w-16 text-right">Total</span>
            </div>
            <div className="divide-y divide-slate-100 pt-1">
              {bill.items.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1 text-[11px]">
                  <span className="w-1/2 font-sans truncate pr-1 text-slate-800">
                    {item.productName}
                  </span>
                  <span className="w-12 text-center tabular-nums">{item.quantity}</span>
                  <span className="w-16 text-right tabular-nums">{formatINR(item.unitPrice)}</span>
                  <span className="w-16 text-right font-semibold tabular-nums text-slate-900">
                    {formatINR(item.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="tabular-nums">{formatINR(bill.subtotal)}</span>
            </div>
            {bill.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Special Discount:</span>
                <span className="tabular-nums">-{formatINR(bill.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold pt-1 border-t border-slate-200 text-slate-900">
              <span>GRAND TOTAL:</span>
              <span className="tabular-nums text-base">{formatINR(bill.total)}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Mode:</span>
              <span className="font-bold uppercase tracking-wider text-slate-800">
                {bill.paymentMethod === 'hostel_credit' ? 'Hostel Credit Ledger' : bill.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Payment Status:</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase tracking-wider ${
                  bill.paymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {bill.paymentStatus}
              </span>
            </div>
            {bill.notes && (
              <div className="text-[10px] text-slate-500 pt-1 font-sans italic">
                Note: {bill.notes}
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="text-center pt-4 font-sans text-[10px] text-slate-500 whitespace-pre-line leading-relaxed">
            {state.settings.receiptFooter}
            <div className="mt-2 text-[9px] text-slate-400">
              Generated by Smart Mess POS · System Verified
            </div>
          </div>
        </div>

        {/* Modal Bottom Close */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-xs"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
