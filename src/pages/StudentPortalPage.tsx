import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMess } from '../store/MessContext';
import { formatINR } from '../utils/currency';
import { formatDateTime, formatDate } from '../utils/date';
import { Bill, StudentPayment, Product } from '../types';
import { ReceiptModal } from '../components/ui/ReceiptModal';
import {
  User,
  CreditCard,
  Receipt,
  Utensils,
  ShieldCheck,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  X,
  Printer,
  QrCode,
  AlertCircle,
  Building,
  Phone,
  Mail,
  LogOut,
  Sparkles,
  Info,
  Search,
  Check,
  ChevronDown,
  Layers,
  UtensilsCrossed,
  FileText,
} from 'lucide-react';

export const StudentPortalPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, currentUser, currentStudent, payStudentDue, logout, addToast } = useMess();

  // If student is logged in, use currentStudent; if an admin/staff visits this page, fallback to first student for demo preview
  const student = currentStudent || state.students[0];

  // Bills for this student
  const studentBills = useMemo(() => {
    if (!student) return [];
    return state.bills.filter((b) => b.studentId === student.id);
  }, [state.bills, student]);

  // Payments made by this student
  const studentPayments = useMemo(() => {
    if (!student || !state.studentPayments) return [];
    return state.studentPayments.filter((p: StudentPayment) => p.studentId === student.id);
  }, [state.studentPayments, student]);

  // Selected bill for receipt modal
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  // Search in bills
  const [billSearch, setBillSearch] = useState('');

  // Payment Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(student ? student.pendingBalance : 0);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'qr'>('upi');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [lastPaymentRecord, setLastPaymentRecord] = useState<StudentPayment | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Mess Due Statement Modal State & Filter
  const [isDueStatementModalOpen, setIsDueStatementModalOpen] = useState(false);
  const [statementFilter, setStatementFilter] = useState<'pending' | 'all'>('pending');

  // Bills for the Due Statement modal based on filter
  const statementBills = useMemo(() => {
    if (statementFilter === 'pending') {
      return studentBills.filter((b) => b.paymentStatus === 'pending');
    }
    return studentBills;
  }, [studentBills, statementFilter]);

  const totalStatementAmount = useMemo(() => {
    return statementBills.reduce((sum, b) => sum + b.totalAmount, 0);
  }, [statementBills]);

  const totalClearedAmount = useMemo(() => {
    return studentPayments.reduce((sum, p) => sum + p.amount, 0);
  }, [studentPayments]);

  // Filtered bills
  const filteredBills = useMemo(() => {
    if (!billSearch.trim()) return studentBills;
    const q = billSearch.toLowerCase();
    return studentBills.filter(
      (b) =>
        b.billNumber.toLowerCase().includes(q) ||
        b.items.some((it) => it.productName.toLowerCase().includes(q)) ||
        b.paymentMethod.toLowerCase().includes(q)
    );
  }, [studentBills, billSearch]);

  // Credit limit progress
  const creditUsagePercent = useMemo(() => {
    if (!student || !student.creditLimit) return 0;
    return Math.min(100, Math.round((student.pendingBalance / student.creditLimit) * 100));
  }, [student]);

  if (!student) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Student Profile Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">Please sign in with a valid Student ID.</p>
      </div>
    );
  }

  const handleOpenPaymentModal = () => {
    setPayAmount(student.pendingBalance > 0 ? student.pendingBalance : 500);
    setIsPayModalOpen(true);
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) {
      addToast('error', 'Invalid Amount', 'Payment amount must be greater than ₹0.');
      return;
    }

    setPaymentProcessing(true);

    setTimeout(() => {
      const res = payStudentDue(
        student.id,
        payAmount,
        paymentMethod,
        `UPI-${Math.floor(100000 + Math.random() * 900000)}`
      );

      setPaymentProcessing(false);

      if (res.success && res.paymentRecord) {
        setIsPayModalOpen(false);
        setLastPaymentRecord(res.paymentRecord);
        setIsReceiptModalOpen(true);
      }
    }, 600);
  };

  const handlePrintStatement = () => {
    setIsDueStatementModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner Notice for Student */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-blue-800/80 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <UtensilsCrossed className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-2xl font-bold shadow-inner shrink-0">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Hostel Resident
                </span>
                <span className="font-mono text-xs text-blue-200 font-semibold bg-blue-950/60 px-2 py-0.5 rounded-lg border border-blue-700/50">
                  {student.id}
                </span>
                <span className="text-[10px] text-indigo-200 bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-700/50">
                  {student.category || "Men's Mess"}
                </span>
              </div>

              <h1 className="text-xl md:text-2xl font-bold text-white mt-1.5 tracking-tight">
                {student.name}
              </h1>

              <p className="text-xs text-blue-200 mt-0.5 flex flex-wrap items-center gap-2">
                <span>{student.department} &middot; Year {student.year}</span>
                <span>&bull;</span>
                <span>{student.hostelBlock}, Room {student.roomNumber}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={handlePrintStatement}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md hover:shadow-lg border border-blue-400/40"
              title="Print Mess Due Amount Statement (கட்டண நிலுவை அறிக்கை)"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Print Due Statement (நிலுவை அறிக்கை)</span>
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-200 bg-rose-500/20 hover:bg-rose-500/30 rounded-xl transition-colors border border-rose-400/30"
              title="Sign out of student portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial Health & Mess Wallet Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Outstanding Mess Due Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Outstanding Mess Due
            </span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                student.pendingBalance === 0
                  ? 'bg-emerald-500'
                  : student.pendingBalance > 2500
                  ? 'bg-rose-500'
                  : 'bg-amber-500'
              }`}
            />
          </div>

          <div className="my-3">
            <div
              className={`text-2xl md:text-3xl font-extrabold tracking-tight ${
                student.pendingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {formatINR(student.pendingBalance)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {student.pendingBalance > 0
                ? 'Unsettled mess dues pending clearance'
                : 'All mess dining bills are cleared!'}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={handleOpenPaymentModal}
              disabled={student.pendingBalance <= 0}
              className="flex-1 py-2.5 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{student.pendingBalance > 0 ? 'Pay Online' : 'No Dues'}</span>
            </button>
            <button
              onClick={() => setIsDueStatementModalOpen(true)}
              className="py-2.5 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1 border border-slate-200"
              title="View & Print Mess Due Statement"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Statement</span>
            </button>
          </div>
        </div>

        {/* Credit Limit & Remaining Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Mess Credit Limit
            </span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>

          <div className="my-3">
            <div className="text-2xl font-bold text-slate-900">
              {formatINR(student.creditLimit)}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
              <span>Available Credit:</span>
              <span className="font-bold text-emerald-600">
                {formatINR(Math.max(0, student.creditLimit - student.pendingBalance))}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  creditUsagePercent > 80
                    ? 'bg-rose-500'
                    : creditUsagePercent > 50
                    ? 'bg-amber-500'
                    : 'bg-blue-600'
                }`}
                style={{ width: `${creditUsagePercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>{creditUsagePercent}% utilized</span>
              <span>Max ₹{student.creditLimit}</span>
            </div>
          </div>
        </div>

        {/* Monthly Mess Spending */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              This Month's Spending
            </span>
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>

          <div className="my-3">
            <div className="text-2xl font-bold text-indigo-900">
              {formatINR(student.monthlySpending || student.pendingBalance)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Current cycle dining consumption
            </p>
          </div>

          <div className="text-[11px] text-indigo-700 bg-indigo-50 p-2 rounded-xl flex items-center justify-between">
            <span>Bills Logged:</span>
            <span className="font-bold">{studentBills.length} Orders</span>
          </div>
        </div>

        {/* Total Spending */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Mess Spending
            </span>
            <Receipt className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="my-3">
            <div className="text-2xl font-bold text-slate-800">
              {formatINR(student.totalSpending || student.monthlySpending)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Cumulative lifetime mess meals</p>
          </div>

          <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl flex items-center justify-between">
            <span>Online Payments:</span>
            <span className="font-bold text-emerald-600">{studentPayments.length} Completed</span>
          </div>
        </div>
      </div>

      {/* Main Content Split: Bills & Transactions History vs Mess Menu & Timings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Student Bills History */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-blue-600" />
                  <span>My Mess Bills &amp; Meal Invoices</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Itemized invoices of your breakfast, lunch, snacks, and dinner orders
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={billSearch}
                  onChange={(e) => setBillSearch(e.target.value)}
                  placeholder="Search dish or bill #..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Bill No &amp; Date</th>
                    <th className="py-3 px-4">Dishes / Items</th>
                    <th className="py-3 px-4">Payment Mode</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Payment Status (நிலை)</th>
                    <th className="py-3 px-4 text-center">Payment Date (செலுத்திய தேதி)</th>
                    <th className="py-3 px-4 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBills.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        No mess invoices found.
                      </td>
                    </tr>
                  ) : (
                    filteredBills.map((bill) => (
                      <tr key={bill.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-slate-900">{bill.billNumber}</span>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {formatDateTime(bill.timestamp)}
                          </div>
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-medium text-slate-800 line-clamp-1">
                            {bill.items.map((it) => `${it.productName} (${it.quantity})`).join(', ')}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Counter: {bill.cashierName || "Men's Mess Cashier"}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono ${
                              bill.paymentMethod === 'hostel_credit'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : bill.paymentMethod === 'upi'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {bill.paymentMethod.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {formatINR(bill.totalAmount)}
                        </td>

                        <td className="py-3 px-4 text-center">
                          {bill.paymentStatus === 'paid' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Paid</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              <span>Pending Due</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center font-mono text-[11px]">
                          {bill.paymentStatus === 'paid' && bill.paidAt ? (
                            <div>
                              <div className="font-semibold text-slate-800">{formatDateTime(bill.paidAt)}</div>
                              {bill.paymentRef && (
                                <div className="text-[10px] text-slate-400 font-mono">Ref: {bill.paymentRef}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-amber-700 font-sans font-medium text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Pending Clearance
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedBill(bill)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Printer className="w-3 h-3" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Records History (Cleared Receipts) */}
          {studentPayments.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>My Online Payment Clearance History</span>
              </h3>

              <div className="space-y-2">
                {studentPayments.map((p: StudentPayment) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{p.paymentNumber}</span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase font-mono">
                          {p.paymentMethod.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Ref: {p.transactionRef} &middot; {formatDateTime(p.timestamp)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-emerald-600 font-mono text-sm">
                        +{formatINR(p.amount)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Remaining: {formatINR(p.remainingBalance)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Today's Menu & Dining Schedule */}
        <div className="space-y-4">
          {/* Dining Schedule Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Mess Dining Schedule</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Breakfast &amp; Tiffin</div>
                  <div className="text-[11px] text-slate-400">Idli, Dosa, Pongal, Tea/Coffee</div>
                </div>
                <span className="font-mono text-[11px] font-semibold text-blue-600">
                  7:30 - 9:30 AM
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Lunch Meal</div>
                  <div className="text-[11px] text-slate-400">Full South/North Thali, Curd, Rice</div>
                </div>
                <span className="font-mono text-[11px] font-semibold text-blue-600">
                  12:30 - 2:30 PM
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Evening Snacks</div>
                  <div className="text-[11px] text-slate-400">Samosa, Vada, Tea, Milk</div>
                </div>
                <span className="font-mono text-[11px] font-semibold text-blue-600">
                  4:30 - 6:00 PM
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Dinner</div>
                  <div className="text-[11px] text-slate-400">Chapati, Parotta, Curry, Extras</div>
                </div>
                <span className="font-mono text-[11px] font-semibold text-blue-600">
                  7:30 - 9:30 PM
                </span>
              </div>
            </div>
          </div>

          {/* Today's Special & Extras Available */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-600" />
              <span>Today's Available Menu &amp; Rates</span>
            </h3>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {state.products
                .filter((p) => p.isAvailable)
                .slice(0, 10)
                .map((product) => (
                  <div
                    key={product.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{product.name}</div>
                      <div className="text-[10px] text-slate-400">{product.category}</div>
                    </div>
                    <span className="font-bold font-mono text-emerald-600">
                      {formatINR(product.price)}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Mess Helpdesk / Contact Notice */}
          <div className="bg-blue-50/70 rounded-3xl border border-blue-200/80 p-5 space-y-2 text-xs text-blue-950">
            <div className="font-bold flex items-center gap-1.5 text-blue-900">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Student Mess Helpdesk</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              For dining rebates, leaves, or mess bill reconciliations, contact the Warden Office:
            </p>
            <div className="text-[11px] space-y-1 pt-1 font-mono text-blue-900">
              <div>Phone: +91 44 2257 8000</div>
              <div>Email: mess-warden@campus.edu</div>
            </div>
          </div>
        </div>
      </div>

      {/* Online Payment Modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Pay Outstanding Mess Dues</h3>
                <p className="text-[11px] text-slate-500">Secure Online Campus Dining Payment</p>
              </div>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecutePayment} className="p-6 space-y-4">
              {/* Outstanding Amount Callout */}
              <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase">Total Due</span>
                  <div className="text-xl font-bold text-blue-950">{formatINR(student.pendingBalance)}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-blue-600">Student ID</span>
                  <div className="font-mono text-xs font-bold text-blue-900">{student.id}</div>
                </div>
              </div>

              {/* Amount to pay */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    min="1"
                    max={student.pendingBalance > 0 ? student.pendingBalance : 10000}
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full text-base font-bold font-mono pl-7 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {student.pendingBalance > 0 && payAmount !== student.pendingBalance && (
                  <button
                    type="button"
                    onClick={() => setPayAmount(student.pendingBalance)}
                    className="text-[11px] text-blue-600 font-semibold mt-1 hover:underline"
                  >
                    Pay Full Due ({formatINR(student.pendingBalance)})
                  </button>
                )}
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <QrCode className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <span className="text-[11px] block">UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      paymentMethod === 'card'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                    <span className="text-[11px] block">Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      paymentMethod === 'netbanking'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Building className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
                    <span className="text-[11px] block">Net Banking</span>
                  </button>
                </div>
              </div>

              {/* UPI Simulator Box */}
              {paymentMethod === 'upi' && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl border border-slate-300 flex flex-col items-center justify-center shadow-xs">
                    <QrCode className="w-24 h-24 text-slate-800" />
                    <span className="text-[9px] font-mono text-slate-500 font-bold">hostelmess@campus</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Scan with any UPI App (GPay, PhonePe, Paytm, BHIM)
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentProcessing}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {paymentProcessing ? 'Processing Payment...' : `Confirm & Pay ₹${payAmount}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Payment Clearance Receipt Modal */}
      {isReceiptModalOpen && lastPaymentRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Payment Clearance Acknowledged</h3>
              <p className="text-xs text-slate-500 mt-0.5">Kavery Hostel Dining System</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt No:</span>
                <span className="font-bold text-slate-800">{lastPaymentRecord.paymentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="font-bold text-slate-800">{student.name} ({student.id})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-emerald-600">{formatINR(lastPaymentRecord.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-bold text-slate-800">{lastPaymentRecord.paymentMethod.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Txn Ref:</span>
                <span className="text-slate-700">{lastPaymentRecord.transactionRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Remaining Balance:</span>
                <span className="font-bold text-rose-600">{formatINR(lastPaymentRecord.remainingBalance)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="w-1/2 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="w-1/2 py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Itemized Bill Modal */}
      {selectedBill && (
        <ReceiptModal
          bill={selectedBill}
          isOpen={!!selectedBill}
          onClose={() => setSelectedBill(null)}
        />
      )}

      {/* Official Mess Due Amount Statement (விடுதி கட்டண நிலுவை அறிக்கை) Modal */}
      {isDueStatementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-4 sm:my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Top Control Bar (Hidden when printing via no-print) */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-200 bg-slate-50 no-print">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-600 text-white">
                  <FileText className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Mess Due Amount Statement / விடுதி கட்டண நிலுவை அறிக்கை
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Official Student Dining Ledger for Hostel Clearance &amp; Verification
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* View Filter: Pending Only vs All Bills */}
                <div className="inline-flex rounded-xl bg-slate-200 p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setStatementFilter('pending')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      statementFilter === 'pending'
                        ? 'bg-white text-rose-700 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Pending Dues Only ({studentBills.filter((b) => b.paymentStatus === 'pending').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatementFilter('all')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      statementFilter === 'all'
                        ? 'bg-white text-blue-700 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Invoices ({studentBills.length})
                  </button>
                </div>

                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>

                <button
                  onClick={() => setIsDueStatementModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Statement Document Content */}
            <div className="p-6 sm:p-8 printable-area bg-white text-slate-900 font-sans space-y-6">
              {/* Official Letterhead */}
              <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="p-1.5 rounded-full bg-slate-900 text-white inline-flex items-center justify-center">
                    <UtensilsCrossed className="w-5 h-5" />
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-950 font-serif">
                    {state.settings.messName || 'KAVERY HOSTEL MESS & DINING SYSTEM'}
                  </h1>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Student Mess &amp; Catering Department &bull; Hostel Administration Block
                </p>
                <div className="inline-block mt-1 px-3 py-1 rounded-md bg-slate-100 border border-slate-300">
                  <h2 className="text-xs sm:text-sm font-extrabold tracking-wide uppercase text-slate-900">
                    MESS DUE AMOUNT STATEMENT / விடுதி கட்டண நிலுவை அறிக்கை
                  </h2>
                </div>
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 font-mono">
                  <span>Statement Ref: STMT-{student.id}-{Date.now().toString().slice(-6)}</span>
                  <span>Generated Date: {formatDateTime(new Date().toISOString())}</span>
                </div>
              </div>

              {/* Student Profile & Room Details Header Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Student Name</span>
                  <span className="font-bold text-slate-900 text-sm">{student.name}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Roll / Student ID</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{student.id}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Hostel &amp; Room</span>
                  <span className="font-semibold text-slate-800">{student.hostelBlock}, Rm {student.roomNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Dept &amp; Year</span>
                  <span className="font-semibold text-slate-800">{student.department} &bull; Year {student.year}</span>
                </div>
              </div>

              {/* Due & Balance Summary Highlight Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Total Incurred Bills ({studentBills.length} Orders)
                  </span>
                  <span className="text-lg font-bold text-slate-900 font-mono">
                    {formatINR(studentBills.reduce((s, b) => s + b.totalAmount, 0))}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Total Cleared / Paid Amount
                  </span>
                  <span className="text-lg font-bold text-emerald-600 font-mono">
                    {formatINR(totalClearedAmount)}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border-2 border-rose-500 bg-rose-50/50">
                  <span className="text-[10px] font-black text-rose-800 uppercase tracking-wider block">
                    Net Outstanding Mess Due (நிலுவை தொகை)
                  </span>
                  <span className="text-2xl font-black text-rose-700 font-mono">
                    {formatINR(student.pendingBalance)}
                  </span>
                  <span className="text-[10px] text-rose-600 block mt-0.5 font-medium">
                    {student.pendingBalance > 0 ? 'Clearance Required Before Mess Cut-off' : 'All Mess Dues Cleared!'}
                  </span>
                </div>
              </div>

              {/* Statement Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {statementFilter === 'pending'
                      ? 'Unsettled Pending Due Invoices (நிலுவை பில்கள் விவரம்)'
                      : 'Complete Itemized Dining Records (அனைத்து உணவு பில்கள்)'}
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Showing {statementBills.length} invoice{statementBills.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                        <th className="p-2 border-r border-slate-200 w-10 text-center">#</th>
                        <th className="p-2 border-r border-slate-200">Bill No &amp; Date</th>
                        <th className="p-2 border-r border-slate-200">Dishes / Meals Consumed</th>
                        <th className="p-2 border-r border-slate-200 text-right">Amount (₹)</th>
                        <th className="p-2 border-r border-slate-200 text-center">Payment Status (நிலை)</th>
                        <th className="p-2 text-center">Payment Date (செலுத்திய தேதி)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {statementBills.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-500">
                            {statementFilter === 'pending'
                              ? 'No pending mess dues! All invoices have been successfully paid.'
                              : 'No dining records found for this student.'}
                          </td>
                        </tr>
                      ) : (
                        statementBills.map((b, idx) => (
                          <tr key={b.id} className="odd:bg-white even:bg-slate-50/50">
                            <td className="p-2 border-r border-slate-200 text-center font-mono text-slate-500">
                              {idx + 1}
                            </td>
                            <td className="p-2 border-r border-slate-200 font-mono">
                              <div className="font-bold text-slate-900">{b.billNumber}</div>
                              <div className="text-[10px] text-slate-500">{formatDateTime(b.timestamp)}</div>
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <div className="font-medium text-slate-800 line-clamp-1">
                                {b.items.map((i) => `${i.productName} × ${i.quantity}`).join(', ')}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Slot: {b.mealSlot ? b.mealSlot.toUpperCase() : 'MEAL'} &bull; Mode: {b.paymentMethod.replace('_', ' ').toUpperCase()}
                              </div>
                            </td>
                            <td className="p-2 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                              {formatINR(b.totalAmount)}
                            </td>
                            <td className="p-2 border-r border-slate-200 text-center">
                              {b.paymentStatus === 'paid' ? (
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  PAID (செலுத்தப்பட்டது)
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                  PENDING DUE (நிலுவை)
                                </span>
                              )}
                            </td>
                            <td className="p-2 text-center font-mono text-[11px]">
                              {b.paymentStatus === 'paid' && b.paidAt ? (
                                <div>
                                  <div className="font-bold text-slate-900">{formatDateTime(b.paidAt)}</div>
                                  {b.paymentRef && (
                                    <div className="text-[9px] text-slate-500">Ref: {b.paymentRef}</div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-rose-600 font-sans font-semibold text-[10px]">
                                  Pending Clearance
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-900">
                        <td colSpan={3} className="p-2 text-right uppercase text-[11px] border-r border-slate-200">
                          Statement Subtotal:
                        </td>
                        <td className="p-2 text-right font-mono text-sm border-r border-slate-200">
                          {formatINR(totalStatementAmount)}
                        </td>
                        <td colSpan={2} className="p-2 text-center text-xs text-slate-500">
                          Net Outstanding Balance: <strong className="text-rose-600 font-mono">{formatINR(student.pendingBalance)}</strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Cleared Payments Log Table if payments exist */}
              {studentPayments.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Payment Clearance Receipts Log (செலுத்தப்பட்ட பரிவர்த்தனைகள்)
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-200 border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                          <th className="p-2 border-r border-slate-200">Receipt / Pay #</th>
                          <th className="p-2 border-r border-slate-200">Date &amp; Time</th>
                          <th className="p-2 border-r border-slate-200">Mode</th>
                          <th className="p-2 border-r border-slate-200">Txn Reference</th>
                          <th className="p-2 border-r border-slate-200 text-right">Amount Paid</th>
                          <th className="p-2 text-right">Remaining Due</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {studentPayments.map((p) => (
                          <tr key={p.id} className="odd:bg-white even:bg-slate-50/50 font-mono">
                            <td className="p-2 border-r border-slate-200 font-bold text-slate-900">
                              {p.paymentNumber}
                            </td>
                            <td className="p-2 border-r border-slate-200 text-slate-600 text-[11px]">
                              {formatDateTime(p.timestamp)}
                            </td>
                            <td className="p-2 border-r border-slate-200 font-sans uppercase font-bold text-[10px] text-slate-700">
                              {p.paymentMethod}
                            </td>
                            <td className="p-2 border-r border-slate-200 text-slate-600 text-[10px]">
                              {p.transactionRef}
                            </td>
                            <td className="p-2 border-r border-slate-200 text-right font-bold text-emerald-600">
                              {formatINR(p.amount)}
                            </td>
                            <td className="p-2 text-right font-bold text-rose-600">
                              {formatINR(p.remainingBalance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Official Endorsement and Signatures Section */}
              <div className="pt-8 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
                <div className="space-y-12">
                  <div className="h-8" />
                  <div className="border-t border-dashed border-slate-400 pt-1 font-semibold text-slate-700">
                    Student Signature
                    <div className="text-[10px] text-slate-400 font-normal">{student.name}</div>
                  </div>
                </div>

                <div className="space-y-12">
                  <div className="h-8" />
                  <div className="border-t border-dashed border-slate-400 pt-1 font-semibold text-slate-700">
                    Mess Accountant / Cashier
                    <div className="text-[10px] text-slate-400 font-normal">Dining Accounts Office</div>
                  </div>
                </div>

                <div className="space-y-12">
                  <div className="h-8" />
                  <div className="border-t border-dashed border-slate-400 pt-1 font-semibold text-slate-700">
                    Hostel Warden / Mess Manager
                    <div className="text-[10px] text-slate-400 font-normal">Official Stamp &amp; Signature</div>
                  </div>
                </div>
              </div>

              {/* Print Watermark / Compliance Notice */}
              <div className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-3">
                * This document is an official computer-generated student mess due statement. For billing discrepancies, contact the Hostel Mess Office within 3 days.
              </div>
            </div>

            {/* Modal Bottom Actions (Hidden when printing via no-print) */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 no-print">
              <span className="text-xs text-slate-500">
                Use standard A4 portrait or landscape print settings for physical clearance submission.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDueStatementModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Mess Due Statement</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
