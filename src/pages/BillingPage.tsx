import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useMess } from '../store/MessContext';
import { Product, Student, Bill, PaymentMethod, PaymentStatus, ProductCategory } from '../types';
import { formatINR } from '../utils/currency';
import { BarcodeScannerModal } from '../components/billing/BarcodeScannerModal';
import { ReceiptModal } from '../components/ui/ReceiptModal';
import {
  Search,
  Scan,
  UserCheck,
  AlertCircle,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Receipt,
  X,
  CreditCard,
  Smartphone,
  Wallet,
  Sparkles,
  ShoppingBag,
  Clock,
  Printer,
  RotateCcw,
} from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
}

export const BillingPage: React.FC = () => {
  const { state, currentUser, createBill, addToast } = useMess();

  // Student Selection State
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentError, setStudentError] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const studentInputRef = useRef<HTMLInputElement>(null);

  // Product Selection & Filtering
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Receipt Modal
  const [lastGeneratedBill, setLastGeneratedBill] = useState<Bill | null>(null);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F2 or Escape: Focus student search
      if (e.key === 'F2') {
        e.preventDefault();
        studentInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter students for autocomplete dropdown
  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim() || selectedStudent) return [];
    const query = studentSearch.trim().toLowerCase();
    return state.students
      .filter(
        (s) =>
          s.id.toLowerCase().includes(query) ||
          s.name.toLowerCase().includes(query) ||
          s.roomNumber.toLowerCase().includes(query) ||
          s.barcode.toLowerCase().includes(query)
      )
      .slice(0, 6);
  }, [studentSearch, state.students, selectedStudent]);

  // Handle student selection
  const handleSelectStudent = (student: Student) => {
    if (student.status !== 'active') {
      setStudentError(
        `Student ${student.name} (${student.id}) is ${student.status.toUpperCase()}. Inactive students cannot be billed!`
      );
      setSelectedStudent(null);
      return;
    }

    setSelectedStudent(student);
    setStudentSearch(`${student.id} - ${student.name}`);
    setStudentError(null);
  };

  const handleClearStudent = () => {
    setSelectedStudent(null);
    setStudentSearch('');
    setStudentError(null);
    studentInputRef.current?.focus();
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return state.products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch =
        !productSearch.trim() ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.code.toLowerCase().includes(productSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [state.products, selectedCategory, productSearch]);

  // Cart operations
  const handleAddToCart = (product: Product) => {
    if (!product.isAvailable) {
      addToast('error', 'Item Unavailable', `${product.name} is currently out of stock/unavailable.`);
      return;
    }

    // Check stock if tracked
    if (product.isStockTracked && !state.settings.allowNegativeStock) {
      const inCart = cart.find((i) => i.product.id === product.id)?.quantity || 0;
      if (inCart >= product.stockQuantity) {
        addToast(
          'warning',
          'Stock Limit Reached',
          `Only ${product.stockQuantity} ${product.unit} of ${product.name} available in stock.`
        );
        return;
      }
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;

            if (item.product.isStockTracked && !state.settings.allowNegativeStock) {
              if (newQty > item.product.stockQuantity) {
                addToast(
                  'warning',
                  'Stock Limit',
                  `Cannot add more than ${item.product.stockQuantity} ${item.product.unit}.`
                );
                return item;
              }
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
    setDiscountPercent(0);
    setNotes('');
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (discountPercent <= 0) return 0;
    return Math.round((subtotal * discountPercent) / 100);
  }, [subtotal, discountPercent]);

  const grandTotal = Math.max(0, subtotal - discountAmount);

  // Validate payment status based on payment method
  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method === 'hostel_credit') {
      // Can be pending or paid
    } else {
      // Cash and UPI at mess counter default to paid
      setPaymentStatus('paid');
    }
  };

  // Final Confirmation
  const handleConfirmBill = () => {
    if (!selectedStudent) {
      setStudentError('Please select or scan an active student before confirming bill.');
      studentInputRef.current?.focus();
      return;
    }

    if (cart.length === 0) {
      addToast('warning', 'Cart Empty', 'Add at least one food item to the bill.');
      return;
    }

    setIsSubmitting(true);

    const billPayload = {
      studentId: selectedStudent.id,
      items: cart.map((c) => ({
        productId: c.product.id,
        quantity: c.quantity,
      })),
      paymentMethod,
      paymentStatus,
      discount: discountAmount,
      notes: notes.trim() || undefined,
    };

    const result = createBill(billPayload);
    setIsSubmitting(false);

    if (result.success && result.bill) {
      // Show receipt modal
      setLastGeneratedBill(result.bill);
      // Reset cart and student for next person in line
      handleClearCart();
      setSelectedStudent(null);
      setStudentSearch('');
      setStudentError(null);
      studentInputRef.current?.focus();
    } else if (result.error) {
      addToast('error', 'Billing Failed', result.error);
    }
  };

  const categories = ['All', ...state.settings.categories];

  return (
    <div className="space-y-4">
      {/* Top Banner: Fast POS Header & Shortcuts */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold text-slate-900 leading-tight">
              Hostel Mess POS &middot; High-Speed Meal Billing
            </h1>
            <p className="text-xs text-slate-500">
              Cashier: <strong className="text-slate-800">{currentUser.name}</strong> &middot; Press <strong>[F2]</strong> to focus student lookup
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
          >
            <Scan className="w-4 h-4 text-blue-400" />
            <span>Simulate Smart Card Scan</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Catalog & Student Selector (7 cols), Right Cart & Checkout (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Student Selector & Food Menu */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Student Selector Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              1. Student Identification (ID / Name / Smart Card)
            </label>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={studentInputRef}
                type="text"
                value={studentSearch}
                onChange={(e) => {
                  setStudentSearch(e.target.value);
                  if (selectedStudent) setSelectedStudent(null);
                  if (studentError) setStudentError(null);
                }}
                placeholder="Type Student ID (e.g. STU-001), student name, room (A-101)..."
                className="w-full text-sm pl-10 pr-24 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
              />

              {selectedStudent ? (
                <button
                  onClick={handleClearStudent}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
                  title="Clear selected student"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setIsScannerOpen(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                >
                  Scan ID
                </button>
              )}
            </div>

            {/* Student Autocomplete Dropdown */}
            {filteredStudents.length > 0 && (
              <div className="mt-2 bg-white rounded-xl shadow-lg border border-slate-200 divide-y divide-slate-100 overflow-hidden z-20">
                {filteredStudents.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectStudent(s)}
                    className="w-full p-2.5 text-left text-xs hover:bg-blue-50 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{s.id}</span>
                      <span className="font-semibold text-slate-800 ml-2">{s.name}</span>
                      <span className="text-slate-500 ml-2">Room {s.roomNumber} &middot; {s.department.split('&')[0]}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        s.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {s.status}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Error Message */}
            {studentError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Student Status Notice: </span>
                  {studentError}
                </div>
              </div>
            )}

            {/* Active Selected Student Details Pill */}
            {selectedStudent && (
              <div className="mt-3 p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-emerald-950 flex items-center gap-2">
                      <span>{selectedStudent.name}</span>
                      <span className="font-mono text-emerald-800">({selectedStudent.id})</span>
                    </div>
                    <div className="text-[11px] text-emerald-800">
                      {selectedStudent.department} &middot; Year {selectedStudent.year} &middot; Room: <strong>{selectedStudent.roomNumber}</strong> (Block {selectedStudent.hostelBlock})
                    </div>
                  </div>
                </div>

                <div className="text-right text-[11px] text-emerald-900">
                  <div>Month Spend: <strong className="font-mono">{formatINR(selectedStudent.monthlySpending)}</strong></div>
                  <div>Status: <span className="uppercase font-bold text-emerald-700">Verified Active</span></div>
                </div>
              </div>
            )}
          </div>

          {/* Food Menu Catalog Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                2. Select Food Products &amp; Dishes
              </label>

              {/* Product search */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter dishes..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto p-1">
              {filteredProducts.map((product) => {
                const inCartItem = cart.find((i) => i.product.id === product.id);
                const isOutOfStock =
                  product.isStockTracked &&
                  !state.settings.allowNegativeStock &&
                  product.stockQuantity <= 0;

                return (
                  <div
                    key={product.id}
                    className={`p-3 rounded-xl border transition-all flex flex-col justify-between text-left ${
                      inCartItem
                        ? 'border-blue-500 bg-blue-50/30 shadow-xs'
                        : isOutOfStock || !product.isAvailable
                        ? 'border-slate-200 bg-slate-50 opacity-60'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-xl">{product.imageEmoji || '🍽️'}</span>
                        {product.isStockTracked && (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                              product.stockQuantity <= product.minStockThreshold
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {product.stockQuantity} {product.unit}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {product.category}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                        {formatINR(product.price)}
                      </span>

                      {isOutOfStock || !product.isAvailable ? (
                        <span className="text-[10px] font-semibold text-rose-600">
                          Unavailable
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{inCartItem ? `+${inCartItem.quantity}` : 'Add'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Billing Cart & Settlement */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Current Bill Cart
              </h2>
              <span className="text-xs text-slate-500">
                {cart.length} unique {cart.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {cart.length > 0 && (
              <button
                onClick={handleClearCart}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold inline-flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                <p className="text-xs font-medium">Cart is currently empty</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Click dishes from the menu to build the student meal bill
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-[11px] text-slate-500 tabular-nums">
                      {formatINR(item.product.price)} &times; {item.quantity} ={' '}
                      <strong className="text-slate-800">
                        {formatINR(item.product.price * item.quantity)}
                      </strong>
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleUpdateQuantity(item.product.id, -1)}
                      className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold font-mono text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.product.id, 1)}
                      className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleRemoveFromCart(item.product.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pricing Subtotal, Discount & Grand Total */}
          <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono tabular-nums">{formatINR(subtotal)}</span>
            </div>

            {/* Role-based discount percentage input */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-600">Discount (%):</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max={state.settings.maxDiscountPercent}
                  value={discountPercent || ''}
                  onChange={(e) =>
                    setDiscountPercent(
                      Math.min(
                        state.settings.maxDiscountPercent,
                        Math.max(0, Number(e.target.value))
                      )
                    )
                  }
                  placeholder="0"
                  className="w-16 text-right px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
                <span className="text-slate-400">%</span>
              </div>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount Savings:</span>
                <span className="font-mono tabular-nums">-{formatINR(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Grand Total:</span>
              <span className="font-mono text-lg text-blue-700 tabular-nums">
                {formatINR(grandTotal)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              3. Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handlePaymentMethodChange('upi')}
                className={`p-2.5 rounded-xl border text-center text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-xs ring-1 ring-blue-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => handlePaymentMethodChange('cash')}
                className={`p-2.5 rounded-xl border text-center text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs ring-1 ring-emerald-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>Cash</span>
              </button>

              <button
                type="button"
                onClick={() => handlePaymentMethodChange('hostel_credit')}
                className={`p-2.5 rounded-xl border text-center text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                  paymentMethod === 'hostel_credit'
                    ? 'border-amber-600 bg-amber-50 text-amber-800 shadow-xs ring-1 ring-amber-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <CreditCard className="w-4 h-4 text-amber-600" />
                <span>Hostel Credit</span>
              </button>
            </div>
          </div>

          {/* Payment Status Option */}
          <div className="pt-1 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Payment Status:</span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="payStatus"
                  checked={paymentStatus === 'paid'}
                  onChange={() => setPaymentStatus('paid')}
                  className="text-blue-600"
                />
                <span className="text-slate-800 font-medium">Paid (Immediate)</span>
              </label>

              {paymentMethod === 'hostel_credit' && (
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="payStatus"
                    checked={paymentStatus === 'pending'}
                    onChange={() => setPaymentStatus('pending')}
                    className="text-amber-600"
                  />
                  <span className="text-amber-700 font-medium">Pending Ledger</span>
                </label>
              )}
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <input
              type="text"
              placeholder="Optional remarks (e.g. extra spicy / takeaway)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirmBill}
            disabled={isSubmitting || cart.length === 0}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-300 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm &amp; Print Bill ({formatINR(grandTotal)})</span>
          </button>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSelectStudent={handleSelectStudent}
      />

      {/* Printable Receipt Modal */}
      <ReceiptModal
        bill={lastGeneratedBill}
        onClose={() => setLastGeneratedBill(null)}
      />
    </div>
  );
};
