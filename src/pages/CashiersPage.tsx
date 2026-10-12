import React, { useState, useMemo } from 'react';
import { useMess } from '../store/MessContext';
import { Shift, User } from '../types';
import { formatINR } from '../utils/currency';
import { formatDateTime } from '../utils/date';
import {
  Clock,
  UserCheck,
  DollarSign,
  PlayCircle,
  StopCircle,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Receipt,
  X,
} from 'lucide-react';

export const CashiersPage: React.FC = () => {
  const { state, currentUser, startShift, closeShift, addToast } = useMess();

  const isAdmin = currentUser.role === 'admin';

  // Start shift modal
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [openingCashInput, setOpeningCashInput] = useState<number>(2000);

  // Close shift modal
  const [closingShiftTarget, setClosingShiftTarget] = useState<Shift | null>(null);
  const [actualCashCount, setActualCashCount] = useState<number>(0);
  const [closeNotes, setCloseNotes] = useState<string>('');

  // Find active open shift for current user
  const myOpenShift = useMemo(() => {
    return state.shifts.find(
      (sh) => sh.cashierId === currentUser.id && sh.status === 'open'
    );
  }, [state.shifts, currentUser.id]);

  // Filter shifts based on role: Cashiers see only their shifts; Admin sees all
  const visibleShifts = useMemo(() => {
    if (isAdmin) return state.shifts;
    return state.shifts.filter((sh) => sh.cashierId === currentUser.id);
  }, [state.shifts, isAdmin, currentUser.id]);

  const cashiersList = useMemo(() => {
    return state.users.filter((u) => u.role === 'cashier');
  }, [state.users]);

  // Start shift submit
  const handleStartShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = startShift(openingCashInput);
    if (res.success) {
      setIsStartModalOpen(false);
    } else if (res.error) {
      addToast('error', 'Cannot Start Shift', res.error);
    }
  };

  // Close shift submit
  const handleCloseShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingShiftTarget) return;

    const res = closeShift(closingShiftTarget.id, actualCashCount, closeNotes);
    if (res.success) {
      setClosingShiftTarget(null);
    } else if (res.error) {
      addToast('error', 'Cannot Close Shift', res.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Cashiers &amp; Shift Management
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Drawer cash verification, active POS shifts, opening floats, and variance balancing
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!myOpenShift ? (
            <button
              onClick={() => {
                setOpeningCashInput(2000);
                setIsStartModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Start New Shift (Open Drawer)</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setClosingShiftTarget(myOpenShift);
                setActualCashCount(myOpenShift.expectedClosingCash);
                setCloseNotes('');
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition-colors shadow-xs"
            >
              <StopCircle className="w-4 h-4" />
              <span>Close Active Shift ({myOpenShift.id})</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Shift Banner if Open */}
      {myOpenShift && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md border border-blue-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                  Active POS Shift In Progress
                </span>
                <span className="font-mono text-xs text-blue-300">({myOpenShift.id})</span>
              </div>
              <h2 className="text-lg font-bold mt-1">{myOpenShift.cashierName}</h2>
              <p className="text-xs text-blue-200 mt-0.5">
                Clocked in: {formatDateTime(myOpenShift.startTime)} &middot; Opening Drawer Cash: {formatINR(myOpenShift.openingCash)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs">
              <div>
                <span className="text-blue-300 block">Cash Received:</span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  {formatINR(myOpenShift.cashReceived)}
                </span>
              </div>
              <div>
                <span className="text-blue-300 block">UPI / QR Scans:</span>
                <span className="text-base font-bold font-mono text-blue-300">
                  {formatINR(myOpenShift.upiReceived)}
                </span>
              </div>
              <div>
                <span className="text-blue-300 block">Expected Drawer Cash:</span>
                <span className="text-lg font-bold font-mono text-white">
                  {formatINR(myOpenShift.expectedClosingCash)}
                </span>
              </div>

              <button
                onClick={() => {
                  setClosingShiftTarget(myOpenShift);
                  setActualCashCount(myOpenShift.expectedClosingCash);
                  setCloseNotes('');
                }}
                className="px-4 py-2 bg-white text-blue-950 font-bold rounded-xl text-xs hover:bg-blue-50 transition-colors shadow-xs"
              >
                Reconcile &amp; Close Shift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cashiers Status Grid (Admin View) */}
      {isAdmin && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
            Cashier Personnel Directory &amp; Active Duty
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cashiersList.map((cashier) => {
              const openShift = state.shifts.find(
                (s) => s.cashierId === cashier.id && s.status === 'open'
              );

              return (
                <div
                  key={cashier.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      {cashier.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs">{cashier.name}</h3>
                      <p className="text-[11px] text-slate-500 font-mono">{cashier.username} &middot; {cashier.phone}</p>
                      <div className="mt-2 text-xs">
                        {openShift ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Active on POS ({openShift.id}) &middot; {openShift.billsCount} bills
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No shift currently open</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      cashier.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cashier.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Shift Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Shift History &amp; Reconciliations</h2>
            <p className="text-xs text-slate-500">Record of opening floats, collections, and counted cash</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-3 px-4">Shift ID</th>
                <th className="py-3 px-4">Cashier</th>
                <th className="py-3 px-4">Start Time</th>
                <th className="py-3 px-4">End Time</th>
                <th className="py-3 px-4 text-right">Opening Cash</th>
                <th className="py-3 px-4 text-right">Cash Received</th>
                <th className="py-3 px-4 text-right">Expected Drawer</th>
                <th className="py-3 px-4 text-right">Actual Counted</th>
                <th className="py-3 px-4 text-right">Variance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleShifts.map((sh) => (
                <tr key={sh.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{sh.id}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{sh.cashierName}</td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{formatDateTime(sh.startTime)}</td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {sh.endTime ? formatDateTime(sh.endTime) : <span className="text-emerald-600 font-bold">Active Now</span>}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums">
                    {formatINR(sh.openingCash)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums">
                    {formatINR(sh.cashReceived)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {formatINR(sh.expectedClosingCash)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {sh.actualClosingCash !== undefined ? formatINR(sh.actualClosingCash) : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                    {sh.difference !== undefined ? (
                      <span className={sh.difference === 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {formatINR(sh.difference)}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        sh.status === 'open'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {sh.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {sh.status === 'open' && (
                      <button
                        onClick={() => {
                          setClosingShiftTarget(sh);
                          setActualCashCount(sh.expectedClosingCash);
                          setCloseNotes('');
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                      >
                        Close
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Start Shift Modal */}
      {isStartModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Open Cashier Shift Drawer</h3>
              <button
                onClick={() => setIsStartModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStartShiftSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cashier Account
                </label>
                <input
                  type="text"
                  disabled
                  value={`${currentUser.name} (${currentUser.role})`}
                  className="w-full text-xs px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-medium text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Opening Cash Float (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={openingCashInput}
                  onChange={(e) => setOpeningCashInput(Number(e.target.value))}
                  placeholder="e.g. 2000"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-base font-bold"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Count physical bills and change present in the POS cash drawer at shift start.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStartModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-xs"
                >
                  Start Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Shift Modal */}
      {closingShiftTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Close Shift Reconciliation ({closingShiftTarget.id})
              </h3>
              <button
                onClick={() => setClosingShiftTarget(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCloseShiftSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Opening Cash Float:</span>
                  <span className="font-mono font-semibold">{formatINR(closingShiftTarget.openingCash)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cash Collected in Shift:</span>
                  <span className="font-mono font-semibold text-emerald-700">+{formatINR(closingShiftTarget.cashReceived)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cash Refunds Dispensed:</span>
                  <span className="font-mono font-semibold text-amber-700">-{formatINR(closingShiftTarget.refunds)}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-200 font-bold text-slate-900">
                  <span>Expected Drawer Balance:</span>
                  <span className="font-mono text-sm text-blue-700">
                    {formatINR(closingShiftTarget.expectedClosingCash)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Actual Counted Cash (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={actualCashCount}
                  onChange={(e) => setActualCashCount(Number(e.target.value))}
                  className="w-full text-base font-bold px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />

                {/* Variance Display */}
                <div className="mt-2 p-2 rounded-lg text-xs flex justify-between font-bold bg-slate-100">
                  <span>Drawer Discrepancy / Variance:</span>
                  <span
                    className={
                      actualCashCount - closingShiftTarget.expectedClosingCash === 0
                        ? 'text-emerald-700'
                        : 'text-rose-700'
                    }
                  >
                    {formatINR(actualCashCount - closingShiftTarget.expectedClosingCash)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Shift Notes / Handover Remarks
                </label>
                <textarea
                  rows={2}
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  placeholder="Notes for incoming cashier or warden..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setClosingShiftTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 shadow-xs"
                >
                  Confirm &amp; Lock Drawer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
