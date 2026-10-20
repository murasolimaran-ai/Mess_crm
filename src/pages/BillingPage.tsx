import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useMess } from '../store/MessContext';
import { Product, Student, Bill, PaymentMethod, PaymentStatus, ProductCategory } from '../types';
import { formatINR } from '../utils/currency';
import { ReceiptModal } from '../components/ui/ReceiptModal';
import {
  Utensils,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShoppingBag,
  Users,
  X,
  CreditCard,
  Printer,
  Sparkles,
  Percent,
  Wallet,
  Smartphone,
  Banknote,
  Receipt,
} from 'lucide-react';

export const BillingPage: React.FC = () => {
  const {
    state,
    currentUser,
    createBill,
    addToast,
  } = useMess();

  // Selected student
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [productSearch, setProductSearch] = useState('');

  // Meal Scheduling: Auto-switch between Morning, Afternoon, Evening based on time set in Admin
  const scheduleSettings = state.settings.mealSchedule;

  // Live real-time clock ticker (5 seconds) to trigger auto-transition when shift/timing boundary is reached
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTimestamp(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  const currentRealtimeSlot = useMemo<'morning' | 'afternoon' | 'evening'>(() => {
    const now = new Date(currentTimestamp);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const parseTime = (timeStr?: string, defaultMinutes = 390) => {
      if (!timeStr) return defaultMinutes;
      const [h, m] = timeStr.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };

    const morningStart = parseTime(scheduleSettings?.morning.startTime, 390); // 06:30
    const morningEnd = parseTime(scheduleSettings?.morning.endTime, 690);     // 11:30

    const afternoonStart = parseTime(scheduleSettings?.afternoon.startTime, 690); // 11:30
    const afternoonEnd = parseTime(scheduleSettings?.afternoon.endTime, 990);     // 16:30

    const eveningStart = parseTime(scheduleSettings?.evening.startTime, 990);   // 16:30
    const eveningEnd = parseTime(scheduleSettings?.evening.endTime, 1350);     // 22:30

    if (currentMinutes >= morningStart && currentMinutes < morningEnd) {
      return 'morning';
    } else if (currentMinutes >= afternoonStart && currentMinutes < afternoonEnd) {
      return 'afternoon';
    } else if (currentMinutes >= eveningStart && currentMinutes <= eveningEnd) {
      return 'evening';
    }
    return currentMinutes < morningStart ? 'morning' : 'evening';
  }, [scheduleSettings, currentTimestamp]);

  // Slot selector: 'auto' | 'morning' | 'afternoon' | 'evening' | 'all'
  const [selectedSlot, setSelectedSlot] = useState<'auto' | 'morning' | 'afternoon' | 'evening' | 'all'>('auto');

  const effectiveSlot = selectedSlot === 'auto' ? currentRealtimeSlot : selectedSlot;

  // Cart / Items to add
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);

  // Payment: Exclusively Student Hostel Credit Account (Pending Due)
  const paymentMethod: PaymentMethod = 'hostel_credit';
  const paymentStatus: PaymentStatus = 'pending';
  const [orderNotes, setOrderNotes] = useState('');

  // Receipt Modal
  const [receiptBill, setReceiptBill] = useState<Bill | null>(null);

  const studentInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Press F2 or Ctrl+K to jump to student search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        studentInputRef.current?.focus();
        studentInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter students by search term
  const searchedStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return [];
    return state.students
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.roomNumber.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [state.students, studentSearch]);

  // Frequently selected / line queue students (first 6 active students)
  const quickQueueStudents = useMemo(() => {
    return state.students.filter((s) => s.status === 'active').slice(0, 6);
  }, [state.students]);

  // Handle student select
  const handleSelectStudent = (student: Student) => {
    if (student.status !== 'active') {
      addToast('error', 'Student Inactive', `${student.name} is currently marked as ${student.status.toUpperCase()}. Purchases disallowed.`);
      return;
    }
    setSelectedStudent(student);
    setStudentSearch(`${student.id} - ${student.name}`);
  };

  const handleClearStudent = () => {
    setSelectedStudent(null);
    setStudentSearch('');
    studentInputRef.current?.focus();
  };

  // Filter products by category, slot, and search
  const filteredProducts = useMemo(() => {
    return state.products.filter((p) => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const q = productSearch.toLowerCase().trim();
      const matchSearch =
        !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);

      let matchSlot = true;
      if (effectiveSlot !== 'all') {
        matchSlot = p.mealSlot === effectiveSlot || p.mealSlot === 'all_day' || !p.mealSlot;
      }

      return matchCat && matchSearch && matchSlot;
    });
  }, [state.products, selectedCategory, productSearch, effectiveSlot]);

  // Cart operations
  const handleAddToCart = (product: Product) => {
    if (!product.isAvailable) {
      addToast('warning', 'Item Unavailable', `${product.name} is currently marked out of service.`);
      return;
    }
    if (product.isStockTracked && product.stockQuantity <= 0) {
      addToast('error', 'Out of Stock', `${product.name} is finished.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        if (product.isStockTracked && existing.quantity >= product.stockQuantity) {
          addToast('warning', 'Stock Limit Reached', `Only ${product.stockQuantity} available.`);
          return prev;
        }
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.product.id === productId) {
            const next = i.quantity + delta;
            if (next <= 0) return null;
            if (i.product.isStockTracked && next > i.product.stockQuantity) {
              addToast('warning', 'Stock Limit', `Maximum ${i.product.stockQuantity} in stock.`);
              return i;
            }
            return { ...i, quantity: next };
          }
          return i;
        })
        .filter(Boolean) as { product: Product; quantity: number }[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
    setOrderNotes('');
  };

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const grandTotal = cartSubtotal; // Fixed hostel mess meal rates, no discounts

  // Submit Bill to Student Hostel Credit Ledger
  const handleSubmitBill = (andPrint = false) => {
    if (!selectedStudent) {
      addToast('warning', 'Select Student', 'Please identify and select a student from search or quick roster.');
      studentInputRef.current?.focus();
      return;
    }
    if (cart.length === 0) {
      addToast('warning', 'Cart Empty', 'Tap food items to add to the student bill.');
      return;
    }

    const res = createBill({
      studentId: selectedStudent.id,
      items: cart,
      paymentMethod: 'hostel_credit',
      paymentStatus: 'pending',
      discount: 0,
      notes: orderNotes.trim() || undefined,
    });

    if (res.success && res.bill) {
      addToast(
        'success',
        `Charged to ${selectedStudent.id}`,
        `${formatINR(grandTotal)} saved to student mess pending ledger balance.`
      );
      if (andPrint) {
        setReceiptBill(res.bill);
      }
      handleClearCart();
      handleClearStudent();
    } else if (res.error) {
      addToast('error', 'Checkout Error', res.error);
    }
  };

  const categories = [
    'All',
    'Breakfast & Tiffin',
    'Lunch & Dinner',
    'Snacks & Quick Bites',
    'Beverages & Dairy',
    'Desserts & Sweets',
    'Eggs & Extras',
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner: Shift & POS Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Kavery Mess &middot; Smart High-Speed POS Counter
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Operating Cashier: <strong className="text-slate-800">{currentUser.name}</strong> &middot; Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono border">F2</kbd> anytime to jump to student search
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearCart}
            disabled={cart.length === 0}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-40"
          >
            Clear Cart
          </button>
        </div>
      </div>

      {/* Main Split Grid: Left 7 cols for Student Search & Food Menu, Right 5 cols for Order Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Student Identification & Food Menu Catalog */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Step 1: Student Lookup (NO SMART CARD SCAN, Ultra-fast keyboard lookup) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                <span>1. Identify Student (ID / Name / Room)</span>
              </label>

              {selectedStudent && (
                <button
                  onClick={handleClearStudent}
                  className="text-xs text-rose-600 hover:underline font-semibold flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Change Student</span>
                </button>
              )}
            </div>

            {/* Input search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={studentInputRef}
                type="text"
                value={studentSearch}
                onChange={(e) => {
                  setStudentSearch(e.target.value);
                  if (selectedStudent) setSelectedStudent(null);
                }}
                placeholder="Type Student ID (e.g. STU-001, STU-042), Name, Room number..."
                className="w-full text-xs pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              />
              {studentSearch && !selectedStudent && (
                <button
                  onClick={() => setStudentSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Autocomplete dropdown if searching and unselected */}
            {!selectedStudent && searchedStudents.length > 0 && (
              <div className="border border-slate-200 rounded-xl bg-white shadow-lg overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {searchedStudents.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectStudent(s)}
                    className="w-full p-2.5 text-left hover:bg-blue-50 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 font-mono text-xs">{s.id}</span>
                        <span className="font-semibold text-slate-800 text-xs">{s.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${s.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {s.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {s.department} &middot; Year {s.year} &middot; Room: {s.roomNumber} ({s.hostelBlock})
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-blue-600">Select &rarr;</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Quick 1-Tap Student Roster Chips (When no search typed yet) */}
            {!selectedStudent && !studentSearch && (
              <div className="pt-1">
                <span className="text-[11px] font-medium text-slate-500 block mb-1.5">
                  Quick Select (Counter Queue):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {quickQueueStudents.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSelectStudent(s)}
                      className="p-2 text-left rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-xs flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold font-mono text-blue-600">{s.id}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{s.roomNumber}</span>
                      </div>
                      <span className="font-bold text-slate-900 truncate w-full mt-0.5">{s.name}</span>
                      <span className="text-[10px] text-slate-500 truncate">{s.department}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Student Profile Summary Card */}
            {selectedStudent && (
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{selectedStudent.name}</span>
                    <span className="font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-[11px]">
                      {selectedStudent.id}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {selectedStudent.status}
                    </span>
                  </div>

                  <div className="text-slate-600 text-xs mt-1 space-x-2">
                    <span>{selectedStudent.department} &middot; Year {selectedStudent.year}</span>
                    <span>&bull;</span>
                    <span>Room: <strong>{selectedStudent.roomNumber}</strong> ({selectedStudent.hostelBlock})</span>
                  </div>
                </div>

                <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-blue-200">
                  <div className="text-[11px] text-slate-500">Hostel Credit Balance</div>
                  <div className="font-bold font-mono text-slate-900">
                    Pending: <span className={selectedStudent.pendingBalance > 0 ? 'text-amber-600 font-bold' : 'text-emerald-600'}>{formatINR(selectedStudent.pendingBalance)}</span> / Limit {formatINR(selectedStudent.creditLimit)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Food Menu & Dish Selection */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-blue-600" />
                  <span>2. Select Food Dishes &amp; Add to Bill</span>
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Menu is automatically scheduled based on the active meal timing set in Admin
                </p>
              </div>

              {/* Product Search */}
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search dish name or code..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Live Session Schedule Bar */}
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-semibold text-slate-700">Active Service Slot:</span>
                <span className="font-bold text-blue-900 bg-white px-2 py-0.5 rounded-md border border-blue-200 shadow-2xs uppercase tracking-wide text-[11px]">
                  {effectiveSlot === 'morning' && `🌅 Morning (${scheduleSettings?.morning.startTime || '06:30'} - ${scheduleSettings?.morning.endTime || '11:30'})`}
                  {effectiveSlot === 'afternoon' && `☀️ Afternoon (${scheduleSettings?.afternoon.startTime || '11:30'} - ${scheduleSettings?.afternoon.endTime || '16:30'})`}
                  {effectiveSlot === 'evening' && `🌙 Evening (${scheduleSettings?.evening.startTime || '16:30'} - ${scheduleSettings?.evening.endTime || '22:30'})`}
                  {effectiveSlot === 'all' && `📋 All Service Slots Active`}
                </span>
              </div>

              {/* Meal Slot Tabs */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-[11px] font-semibold overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setSelectedSlot('auto')}
                  className={`px-2 py-1 rounded transition-colors whitespace-nowrap flex items-center gap-1 ${
                    selectedSlot === 'auto' ? 'bg-blue-600 text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Automatically show dishes matching current real-time clock"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Auto ({currentRealtimeSlot.toUpperCase()})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSlot('morning')}
                  className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                    selectedSlot === 'morning' ? 'bg-amber-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🌅 Morning
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSlot('afternoon')}
                  className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                    selectedSlot === 'afternoon' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ☀️ Afternoon
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSlot('evening')}
                  className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                    selectedSlot === 'evening' ? 'bg-purple-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🌙 Evening
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSlot('all')}
                  className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                    selectedSlot === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📋 All Items
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs rounded-xl font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Products Grid: strictly Product Image, Name, Price, and Slot (NO margin, NO long descriptions) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pt-1 max-h-[520px] overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full py-12 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                  No food dishes scheduled for this session. Switch slot or select &quot;All Items&quot;.
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const cartItem = cart.find((i) => i.product.id === p.id);
                  const isLowStock = p.isStockTracked && p.stockQuantity <= p.minStockThreshold;

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleAddToCart(p)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleAddToCart(p);
                        }
                      }}
                      className={`group p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between overflow-hidden cursor-pointer select-none active:scale-[0.98] ${
                        cartItem
                          ? 'border-blue-500 bg-blue-50/40 shadow-xs ring-2 ring-blue-500/50'
                          : 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-md'
                      }`}
                    >
                      <div>
                        {/* 1. Product Image with Slot Badge overlay & Instant Click Add */}
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 mb-2 border border-slate-100">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">
                              {p.imageEmoji || '🍲'}
                            </div>
                          )}

                          {/* Meal Slot Badge Overlay */}
                          <div className="absolute top-1.5 left-1.5 pointer-events-none">
                            {p.mealSlot === 'morning' && (
                              <span className="px-1.5 py-0.5 rounded-md bg-amber-950/80 text-amber-200 text-[9px] font-bold backdrop-blur-xs">
                                🌅 Morning
                              </span>
                            )}
                            {p.mealSlot === 'afternoon' && (
                              <span className="px-1.5 py-0.5 rounded-md bg-blue-950/80 text-blue-200 text-[9px] font-bold backdrop-blur-xs">
                                ☀️ Afternoon
                              </span>
                            )}
                            {p.mealSlot === 'evening' && (
                              <span className="px-1.5 py-0.5 rounded-md bg-purple-950/80 text-purple-200 text-[9px] font-bold backdrop-blur-xs">
                                🌙 Evening
                              </span>
                            )}
                            {(p.mealSlot === 'all_day' || !p.mealSlot) && (
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-900/80 text-slate-200 text-[9px] font-bold backdrop-blur-xs">
                                🕒 All Day
                              </span>
                            )}
                          </div>

                          {/* In-Cart Count Badge Overlay */}
                          {cartItem && (
                            <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-lg bg-blue-600 text-white text-[10px] font-extrabold shadow-md animate-in zoom-in-75">
                              {cartItem.quantity} in order
                            </span>
                          )}

                          {/* Unit Pill */}
                          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.2 rounded bg-slate-900/70 text-white text-[9px] font-mono backdrop-blur-xs pointer-events-none">
                            {p.unit}
                          </span>
                        </div>

                        {/* 2. Product Name */}
                        <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 min-h-[32px] group-hover:text-blue-700 transition-colors">
                          {p.name}
                        </h4>

                        {/* Stock status indicator if tracked */}
                        {p.isStockTracked && (
                          <div className="mt-1">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                                p.stockQuantity <= 0
                                   ? 'bg-rose-100 text-rose-700'
                                  : isLowStock
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'text-slate-400'
                              }`}
                            >
                              {p.stockQuantity <= 0 ? 'Out of stock' : `${p.stockQuantity} left`}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 3. Product Price & Add Controls (NO Margins or Profit data) */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-sm font-extrabold font-mono text-slate-900">
                          {formatINR(p.price)}
                        </span>

                        {cartItem ? (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 bg-white border border-blue-500 rounded-lg p-0.5 shadow-2xs"
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateQty(p.id, -1);
                              }}
                              className="p-1 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded"
                              title="Decrease count"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold font-mono px-1.5 text-blue-700">
                              {cartItem.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateQty(p.id, 1);
                              }}
                              className="p-1 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded"
                              title="Increase count"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white px-2 py-1 rounded-lg transition-colors flex items-center gap-0.5 shadow-2xs">
                            <Plus className="w-3 h-3" />
                            <span>Tap to Add</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Bill Cart, Payment Mode & Checkout */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-blue-600" />
                  <span>Current Bill Tray</span>
                </h3>
                <span className="text-xs text-slate-500">
                  {cart.length} dish{cart.length === 1 ? '' : 'es'} in cart
                </span>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
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
                  <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-600">Cart is empty</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Select a student and tap menu dishes to build the bill
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {item.product.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {formatINR(item.product.price)} &times; {item.quantity} {item.product.unit}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
                        <button
                          onClick={() => handleUpdateQty(item.product.id, -1)}
                          className="p-1 hover:bg-white rounded text-slate-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-mono font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(item.product.id, 1)}
                          className="p-1 hover:bg-white rounded text-slate-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right w-16">
                        <span className="text-xs font-mono font-bold text-slate-900 block">
                          {formatINR(item.product.price * item.quantity)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.product.id)}
                        className="text-slate-300 hover:text-rose-600 p-1 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations & Total (No discounts in hostel mess) */}
            <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center text-sm font-bold text-slate-900">
                <span className="uppercase tracking-wider text-xs text-slate-600">Bill Total</span>
                <span className="font-mono text-lg text-blue-700 font-extrabold">{formatINR(grandTotal)}</span>
              </div>
            </div>

            {/* Exclusive Mode: Automatic Student Hostel Credit Account */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/50 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-amber-600 text-white shadow-2xs">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-amber-950 uppercase tracking-wide block">
                        Hostel Credit Account (விடுதி கடன்)
                      </span>
                      <span className="text-[10px] text-amber-700 font-semibold">
                        Automatic Monthly Mess Due Ledger
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-200 text-amber-900 border border-amber-300">
                    PENDING DUE
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  No counter cash or UPI needed. The amount is automatically charged to the student's mess credit balance and reflected on their student portal.
                </p>

                {selectedStudent ? (
                  <div className="pt-2 border-t border-amber-200/80 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/80 p-2 rounded-xl border border-amber-200/60">
                      <span className="text-[10px] text-slate-500 block">Current Mess Due:</span>
                      <strong className="font-mono text-amber-900 font-bold text-xs">
                        {formatINR(selectedStudent.pendingBalance)}
                      </strong>
                    </div>
                    <div className="bg-white/80 p-2 rounded-xl border border-amber-200/60 text-right">
                      <span className="text-[10px] text-slate-500 block">Due After This Bill:</span>
                      <strong className="font-mono text-rose-700 font-extrabold text-xs">
                        {formatINR(selectedStudent.pendingBalance + grandTotal)}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <div className="pt-1 text-[11px] text-amber-800 italic">
                    Identify student above to view account ledger and room details.
                  </div>
                )}
              </div>
            </div>

            {/* Checkout Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => handleSubmitBill(false)}
                disabled={!selectedStudent || cart.length === 0}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>
                  {selectedStudent
                    ? `Charge ${formatINR(grandTotal)} to ${selectedStudent.id}'s Credit`
                    : 'Select Student to Charge Credit'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSubmitBill(true)}
                disabled={!selectedStudent || cart.length === 0}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-300 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Charge to Credit &amp; Print Slip</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {receiptBill && (
        <ReceiptModal
          bill={receiptBill}
          isOpen={!!receiptBill}
          onClose={() => setReceiptBill(null)}
        />
      )}
    </div>
  );
};
