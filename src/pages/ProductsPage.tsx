import React, { useState, useMemo, useEffect } from 'react';
import { useMess } from '../store/MessContext';
import { Product, ProductCategory, MealSlot, MealScheduleSettings } from '../types';
import { formatINR } from '../utils/currency';
import { formatDateTime, validateMealScheduleTimings, autoAlignMealScheduleTimings } from '../utils/date';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  List,
  AlertTriangle,
  History,
  X,
  Package,
  Clock,
  Sparkles,
  Save,
  Image as ImageIcon,
  Sun,
  Sunrise,
  Moon,
  ChevronDown,
} from 'lucide-react';

const PRESET_FOOD_IMAGES = [
  { name: 'Dosa', url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&auto=format&fit=crop&q=80' },
  { name: 'Idli Vada', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80' },
  { name: 'Poori Bhaji', url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80' },
  { name: 'Veg Thali', url: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=400&auto=format&fit=crop&q=80' },
  { name: 'Chapati Set', url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop&q=80' },
  { name: 'Paneer Masala', url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop&q=80' },
  { name: 'Samosa', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80' },
  { name: 'Maggi Noodles', url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&auto=format&fit=crop&q=80' },
  { name: 'Pav Bhaji', url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&auto=format&fit=crop&q=80' },
  { name: 'Masala Chai', url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80' },
  { name: 'Filter Coffee', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80' },
  { name: 'Chilled Milk', url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&auto=format&fit=crop&q=80' },
  { name: 'Gulab Jamun', url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&auto=format&fit=crop&q=80' },
  { name: 'Egg Bhurji', url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&auto=format&fit=crop&q=80' },
];

export const ProductsPage: React.FC = () => {
  const { state, addProduct, updateProduct, toggleProductAvailability, updateMealSchedule, addToast } = useMess();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [slotFilter, setSlotFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening' | 'all_day'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'tracked' | 'low_stock'>('all');

  // Meal schedule editor state
  const [scheduleState, setScheduleState] = useState<MealScheduleSettings>(() => {
    return (
      state.settings.mealSchedule || {
        morning: { name: 'Morning Breakfast', tamilName: 'காலை உணவு', startTime: '06:30', endTime: '11:30', enabled: true },
        afternoon: { name: 'Afternoon Lunch', tamilName: 'மதிய உணவு', startTime: '11:30', endTime: '16:30', enabled: true },
        evening: { name: 'Evening Dinner & Snacks', tamilName: 'மாலை & இரவு உணவு', startTime: '16:30', endTime: '22:30', enabled: true },
      }
    );
  });

  const [isEditingSchedule, setIsEditingSchedule] = useState(false);

  // Sync schedule if external state changes
  useEffect(() => {
    if (state.settings.mealSchedule) {
      setScheduleState(state.settings.mealSchedule);
    }
  }, [state.settings.mealSchedule]);

  // Current live session based on system clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const activeLiveSlot = useMemo<'morning' | 'afternoon' | 'evening'>(() => {
    const mins = currentTime.getHours() * 60 + currentTime.getMinutes();
    const parse = (t: string, def: number) => {
      if (!t) return def;
      const [h, m] = t.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };
    const mStart = parse(scheduleState.morning.startTime, 390);
    const mEnd = parse(scheduleState.morning.endTime, 690);
    const aStart = parse(scheduleState.afternoon.startTime, 690);
    const aEnd = parse(scheduleState.afternoon.endTime, 990);
    const eStart = parse(scheduleState.evening.startTime, 990);
    const eEnd = parse(scheduleState.evening.endTime, 1350);

    if (mins >= mStart && mins < mEnd) return 'morning';
    if (mins >= aStart && mins < aEnd) return 'afternoon';
    if (mins >= eStart && mins <= eEnd) return 'evening';
    return mins < mStart ? 'morning' : 'evening';
  }, [currentTime, scheduleState]);

  // Count items per slot
  const slotCounts = useMemo(() => {
    const counts = { morning: 0, afternoon: 0, evening: 0, all_day: 0, total: state.products.length };
    state.products.forEach((p) => {
      const slot = (p.mealSlot as keyof typeof counts) || 'all_day';
      if (counts[slot] !== undefined) {
        counts[slot]++;
      } else {
        counts.all_day++;
      }
    });
    return counts;
  }, [state.products]);

  // Validate meal schedule timings against overlap and sequential order
  const scheduleValidation = useMemo(() => {
    return validateMealScheduleTimings(scheduleState);
  }, [scheduleState]);

  // Handle saving the schedule timings
  const handleSaveSchedule = () => {
    if (!scheduleValidation.isValid) {
      addToast('error', 'Timing Mismatch', scheduleValidation.error || 'Please correct the schedule times.');
      return;
    }
    updateMealSchedule(scheduleState);
    setIsEditingSchedule(false);
  };

  const handleAutoAlignTimings = () => {
    const aligned = autoAlignMealScheduleTimings(scheduleState);
    setScheduleState(aligned);
    addToast('info', 'Timings Aligned', 'Shift timings adjusted to prevent overlap (1-minute gap maintained).');
  };

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingAuditProduct, setViewingAuditProduct] = useState<Product | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('Breakfast & Tiffin');
  const [formMealSlot, setFormMealSlot] = useState<MealSlot>('morning');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formPrice, setFormPrice] = useState<number>(45);
  const [formCostPrice, setFormCostPrice] = useState<number>(25);
  const [formIsStockTracked, setFormIsStockTracked] = useState(true);
  const [formStockQuantity, setFormStockQuantity] = useState<number>(50);
  const [formMinStock, setFormMinStock] = useState<number>(15);
  const [formUnit, setFormUnit] = useState('Plate');
  const [formEmoji, setFormEmoji] = useState('🍲');
  const [formDescription, setFormDescription] = useState('');
  const [formError, setFormError] = useState('');

  const categories = ['All', ...state.settings.categories];

  // Filtered products
  const filteredProducts = useMemo(() => {
    return state.products.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;

      let matchesSlot = true;
      if (slotFilter !== 'all') {
        matchesSlot = p.mealSlot === slotFilter;
      }

      let matchesStock = true;
      if (stockFilter === 'tracked') matchesStock = p.isStockTracked;
      else if (stockFilter === 'low_stock')
        matchesStock = p.isStockTracked && p.stockQuantity <= p.minStockThreshold;

      return matchesSearch && matchesCat && matchesSlot && matchesStock;
    });
  }, [state.products, searchQuery, selectedCategory, slotFilter, stockFilter]);

  // Product price audit events
  const productPriceAudits = useMemo(() => {
    if (!viewingAuditProduct) return [];
    return state.auditLogs.filter(
      (log) =>
        log.entityType === 'product' &&
        (log.recordId === viewingAuditProduct.id || log.description.includes(viewingAuditProduct.name))
    );
  }, [state.auditLogs, viewingAuditProduct]);

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCode(`PRD-${Math.floor(100 + Math.random() * 899)}`);
    setFormCategory('Breakfast & Tiffin');
    setFormMealSlot('morning');
    setFormImageUrl('https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&auto=format&fit=crop&q=80');
    setFormPrice(50);
    setFormCostPrice(28);
    setFormIsStockTracked(true);
    setFormStockQuantity(50);
    setFormMinStock(15);
    setFormUnit('Plate');
    setFormEmoji('🍱');
    setFormDescription('');
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCode(p.code);
    setFormCategory(p.category);
    setFormMealSlot(p.mealSlot || 'all_day');
    setFormImageUrl(p.imageUrl || '');
    setFormPrice(p.price);
    setFormCostPrice(p.costPrice || 0);
    setFormIsStockTracked(p.isStockTracked);
    setFormStockQuantity(p.stockQuantity);
    setFormMinStock(p.minStockThreshold);
    setFormUnit(p.unit);
    setFormEmoji(p.imageEmoji || '🍲');
    setFormDescription(p.description || '');
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Quick slot change directly from list
  const handleQuickSlotChange = (productId: string, newSlot: MealSlot) => {
    updateProduct(productId, { mealSlot: newSlot });
    addToast('success', 'Dish Rescheduled', `Item moved to ${newSlot.toUpperCase()} service schedule.`);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Product name is required.');
      return;
    }
    if (formPrice <= 0) {
      setFormError('Selling price must be greater than zero.');
      return;
    }

    if (editingProduct) {
      const res = updateProduct(editingProduct.id, {
        name: formName.trim(),
        code: formCode.trim(),
        category: formCategory,
        mealSlot: formMealSlot,
        imageUrl: formImageUrl.trim() || undefined,
        price: Number(formPrice),
        costPrice: Number(formCostPrice),
        isStockTracked: formIsStockTracked,
        stockQuantity: Number(formStockQuantity),
        minStockThreshold: Number(formMinStock),
        unit: formUnit.trim(),
        imageEmoji: formEmoji,
        description: formDescription.trim(),
      });
      if (res.success) {
        setIsFormModalOpen(false);
      } else if (res.error) {
        setFormError(res.error);
      }
    } else {
      const res = addProduct({
        name: formName.trim(),
        code: formCode.trim(),
        category: formCategory,
        mealSlot: formMealSlot,
        imageUrl: formImageUrl.trim() || undefined,
        price: Number(formPrice),
        costPrice: Number(formCostPrice),
        isStockTracked: formIsStockTracked,
        stockQuantity: Number(formStockQuantity),
        minStockThreshold: Number(formMinStock),
        isAvailable: true,
        unit: formUnit.trim(),
        imageEmoji: formEmoji,
        description: formDescription.trim(),
      });
      if (res.success) {
        setIsFormModalOpen(false);
      } else if (res.error) {
        setFormError(res.error);
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Menu Catalog &amp; Meal Scheduling
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-blue-100 text-blue-800">
              3-SESSION TIMING ENGINE
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            உணவு பட்டியல் &middot; காலை, மதியம் &amp; மாலை நேர அட்டவணை &middot; Automatic Real-time POS Counter Switch
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* CORE FEATURE: 3-Session Meal Timing & Schedule Manager (காலை / மதியம் / மாலை உணவு நேர அட்டவணை) */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-5 text-white shadow-md border border-blue-800/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-300" />
              <h2 className="text-base font-bold tracking-tight">
                3-Session Meal Timing &amp; Automatic POS Schedule (உணவு நேர அட்டவணை)
              </h2>
            </div>
            <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
              Set the counter hours for Morning, Afternoon, and Evening. The cashier POS counter automatically detects the real-time clock and dispenses dishes configured for that active session.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-blue-100">Live Clock:</span>
              <strong className="font-mono text-white">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </strong>
            </div>

            <button
              onClick={() => setIsEditingSchedule(!isEditingSchedule)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                isEditingSchedule
                  ? 'bg-amber-400 text-amber-950 hover:bg-amber-300'
                  : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
              }`}
            >
              {isEditingSchedule ? 'Cancel Timing Edit' : 'Edit Session Timings'}
            </button>
          </div>
        </div>

        {/* 3 Meal Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {/* 1. Morning Breakfast */}
          <div
            className={`rounded-2xl p-4 transition-all border ${
              activeLiveSlot === 'morning'
                ? 'bg-amber-500/20 border-amber-400/60 shadow-lg ring-1 ring-amber-400/40'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                  <Sunrise className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    🌅 Morning (காலை)
                  </h3>
                  <span className="text-[10px] text-amber-200/80">Breakfast &amp; Tiffin</span>
                </div>
              </div>

              {activeLiveSlot === 'morning' && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide bg-emerald-500 text-emerald-950 animate-pulse">
                  ACTIVE NOW
                </span>
              )}
            </div>

            {/* Time Controls */}
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              {isEditingSchedule ? (
                <div className="flex items-center gap-1.5 w-full">
                  <input
                    type="time"
                    value={scheduleState.morning.startTime}
                    onChange={(e) =>
                      setScheduleState((prev) => ({
                        ...prev,
                        morning: { ...prev.morning, startTime: e.target.value },
                      }))
                    }
                    className="bg-black/40 text-white text-xs px-2 py-1 rounded-lg border border-white/20 font-mono w-full"
                  />
                  <span className="text-xs text-white/50">to</span>
                  <input
                    type="time"
                    value={scheduleState.morning.endTime}
                    onChange={(e) =>
                      setScheduleState((prev) => ({
                        ...prev,
                        morning: { ...prev.morning, endTime: e.target.value },
                      }))
                    }
                    className="bg-black/40 text-white text-xs px-2 py-1 rounded-lg border border-white/20 font-mono w-full"
                  />
                </div>
              ) : (
                <div className="text-xs font-mono font-bold text-amber-200">
                  {scheduleState.morning.startTime} &mdash; {scheduleState.morning.endTime}
                </div>
              )}
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-white/70">
              <span>Scheduled Items:</span>
              <span className="font-bold text-white font-mono bg-white/10 px-2 py-0.5 rounded-md">
                {slotCounts.morning} dishes
              </span>
            </div>
          </div>

          {/* 2. Afternoon Lunch */}
          <div
            className={`rounded-2xl p-4 transition-all border ${
              activeLiveSlot === 'afternoon'
                ? 'bg-blue-500/20 border-blue-400/60 shadow-lg ring-1 ring-blue-400/40'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    ☀️ Afternoon (மதியம்)
                  </h3>
                  <span className="text-[10px] text-blue-200/80">Lunch &amp; Meals Thali</span>
                </div>
              </div>

              {activeLiveSlot === 'afternoon' && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide bg-emerald-500 text-emerald-950 animate-pulse">
                  ACTIVE NOW
                </span>
              )}
            </div>

            {/* Time Controls */}
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              {isEditingSchedule ? (
                <div className="flex items-center gap-1.5 w-full">
                  <input
                    type="time"
                    value={scheduleState.afternoon.startTime}
                    onChange={(e) =>
                      setScheduleState((prev) => ({
                        ...prev,
                        afternoon: { ...prev.afternoon, startTime: e.target.value },
                      }))
                    }
                    className="bg-black/40 text-white text-xs px-2 py-1 rounded-lg border border-white/20 font-mono w-full"
                  />
                  <span className="text-xs text-white/50">to</span>
                  <input
                    type="time"
                    value={scheduleState.afternoon.endTime}
                    onChange={(e) =>
                      setScheduleState((prev) => ({
                        ...prev,
                        afternoon: { ...prev.afternoon, endTime: e.target.value },
                      }))
                    }
                    className="bg-black/40 text-white text-xs px-2 py-1 rounded-lg border border-white/20 font-mono w-full"
                  />
                </div>
              ) : (
                <div className="text-xs font-mono font-bold text-blue-200">
                  {scheduleState.afternoon.startTime} &mdash; {scheduleState.afternoon.endTime}
                </div>
              )}
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-white/70">
              <span>Scheduled Items:</span>
              <span className="font-bold text-white font-mono bg-white/10 px-2 py-0.5 rounded-md">
                {slotCounts.afternoon} dishes
              </span>
            </div>
          </div>

          {/* 3. Evening Dinner & Snacks */}
          <div
            className={`rounded-2xl p-4 transition-all border ${
              activeLiveSlot === 'evening'
                ? 'bg-purple-500/20 border-purple-400/60 shadow-lg ring-1 ring-purple-400/40'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    🌙 Evening (மாலை / இரவு)
                  </h3>
                  <span className="text-[10px] text-purple-200/80">Dinner &amp; Quick Bites</span>
                </div>
              </div>

              {activeLiveSlot === 'evening' && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide bg-emerald-500 text-emerald-950 animate-pulse">
                  ACTIVE NOW
                </span>
              )}
            </div>

            {/* Time Controls */}
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              {isEditingSchedule ? (
                <div className="flex items-center gap-1.5 w-full">
                  <input
                    type="time"
                    value={scheduleState.evening.startTime}
                    onChange={(e) =>
                      setScheduleState((prev) => ({
                        ...prev,
                        evening: { ...prev.evening, startTime: e.target.value },
                      }))
                    }
                    className="bg-black/40 text-white text-xs px-2 py-1 rounded-lg border border-white/20 font-mono w-full"
                  />
                  <span className="text-xs text-white/50">to</span>
                  <input
                    type="time"
                    value={scheduleState.evening.endTime}
                    onChange={(e) =>
                      setScheduleState((prev) => ({
                        ...prev,
                        evening: { ...prev.evening, endTime: e.target.value },
                      }))
                    }
                    className="bg-black/40 text-white text-xs px-2 py-1 rounded-lg border border-white/20 font-mono w-full"
                  />
                </div>
              ) : (
                <div className="text-xs font-mono font-bold text-purple-200">
                  {scheduleState.evening.startTime} &mdash; {scheduleState.evening.endTime}
                </div>
              )}
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-white/70">
              <span>Scheduled Items:</span>
              <span className="font-bold text-white font-mono bg-white/10 px-2 py-0.5 rounded-md">
                {slotCounts.evening} dishes
              </span>
            </div>
          </div>
        </div>

        {/* Save Timing Schedule Confirmation & Mismatch Alerts */}
        {isEditingSchedule && (
          <div className="mt-4 pt-4 border-t border-white/15 space-y-3">
            {!scheduleValidation.isValid ? (
              <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Shift Timing Mismatch Detected (நேரப் பிழை)</span>
                    <span className="text-[11px] text-rose-300">{scheduleValidation.error}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAutoAlignTimings}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs whitespace-nowrap shadow-xs transition-colors self-start sm:self-auto"
                >
                  ⚡ Auto-Align Timings (+1 Min Gap)
                </button>
              </div>
            ) : (
              <div className="p-2.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-xs flex items-center gap-2 text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  ✓ Timings verified &amp; strictly sequential without overlap: Morning ({scheduleState.morning.startTime} &mdash; {scheduleState.morning.endTime}) ➔ Afternoon ({scheduleState.afternoon.startTime} &mdash; {scheduleState.afternoon.endTime}) ➔ Evening ({scheduleState.evening.startTime} &mdash; {scheduleState.evening.endTime})
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingSchedule(false)}
                className="px-3.5 py-1.5 text-xs text-white/80 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSchedule}
                disabled={!scheduleValidation.isValid}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save &amp; Synchronize Timing to POS</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter & Meal Slot Selector Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        {/* Slot Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
            Filter Schedule:
          </span>
          <button
            onClick={() => setSlotFilter('all')}
            className={`px-3 py-1.5 text-xs rounded-xl font-semibold transition-all ${
              slotFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Items ({slotCounts.total})
          </button>
          <button
            onClick={() => setSlotFilter('morning')}
            className={`px-3 py-1.5 text-xs rounded-xl font-semibold transition-all flex items-center gap-1 ${
              slotFilter === 'morning'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <Sunrise className="w-3.5 h-3.5" />
            <span>🌅 Morning ({slotCounts.morning})</span>
          </button>
          <button
            onClick={() => setSlotFilter('afternoon')}
            className={`px-3 py-1.5 text-xs rounded-xl font-semibold transition-all flex items-center gap-1 ${
              slotFilter === 'afternoon'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>☀️ Afternoon ({slotCounts.afternoon})</span>
          </button>
          <button
            onClick={() => setSlotFilter('evening')}
            className={`px-3 py-1.5 text-xs rounded-xl font-semibold transition-all flex items-center gap-1 ${
              slotFilter === 'evening'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>🌙 Evening ({slotCounts.evening})</span>
          </button>
          <button
            onClick={() => setSlotFilter('all_day')}
            className={`px-3 py-1.5 text-xs rounded-xl font-semibold transition-all ${
              slotFilter === 'all_day'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🕒 All Day ({slotCounts.all_day})
          </button>
        </div>

        {/* Search & Category Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search dishes or item code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="all">All Inventory Types</option>
              <option value="tracked">Tracked Stock Items</option>
              <option value="low_stock">Low Stock Alerts Only</option>
            </select>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>{filteredProducts.length} items shown</span>
            {(searchQuery || selectedCategory !== 'All' || slotFilter !== 'all' || stockFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSlotFilter('all');
                  setStockFilter('all');
                }}
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid or Table Presentation */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((p) => {
            const isLowStock = p.isStockTracked && p.stockQuantity <= p.minStockThreshold;

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all group"
              >
                {/* 1. Food Image Thumbnail with Meal Slot Overlay */}
                <div className="relative aspect-video w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      {p.imageEmoji || '🍲'}
                    </div>
                  )}

                  {/* Slot badge */}
                  <div className="absolute top-2 left-2">
                    {p.mealSlot === 'morning' && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase bg-amber-950/80 text-amber-200 border border-amber-500/30 backdrop-blur-xs">
                        🌅 Morning
                      </span>
                    )}
                    {p.mealSlot === 'afternoon' && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase bg-blue-950/80 text-blue-200 border border-blue-500/30 backdrop-blur-xs">
                        ☀️ Afternoon
                      </span>
                    )}
                    {p.mealSlot === 'evening' && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase bg-purple-950/80 text-purple-200 border border-purple-500/30 backdrop-blur-xs">
                        🌙 Evening
                      </span>
                    )}
                    {(p.mealSlot === 'all_day' || !p.mealSlot) && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase bg-slate-900/80 text-slate-200 border border-slate-600/30 backdrop-blur-xs">
                        🕒 All Day
                      </span>
                    )}
                  </div>

                  {/* Availability pill */}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => toggleProductAvailability(p.id)}
                      className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase transition-colors backdrop-blur-xs ${
                        p.isAvailable
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-rose-500/90 text-white'
                      }`}
                      title="Click to toggle availability"
                    >
                      {p.isAvailable ? 'Active' : 'Disabled'}
                    </button>
                  </div>

                  {/* Unit badge */}
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.2 rounded bg-black/60 text-white text-[9px] font-mono">
                    {p.unit}
                  </span>
                </div>

                {/* 2. Product Information */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                      {p.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {p.code} &middot; {p.category}
                    </p>
                  </div>

                  {/* Direct Meal Schedule Dropdown */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 font-medium">Session:</span>
                    <select
                      value={p.mealSlot || 'all_day'}
                      onChange={(e) => handleQuickSlotChange(p.id, e.target.value as MealSlot)}
                      className="text-xs px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:bg-white focus:outline-none"
                    >
                      <option value="morning">🌅 Morning</option>
                      <option value="afternoon">☀️ Afternoon</option>
                      <option value="evening">🌙 Evening</option>
                      <option value="all_day">🕒 All Day</option>
                    </select>
                  </div>

                  {/* Price & Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-base font-extrabold text-slate-900 font-mono">
                        {formatINR(p.price)}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">/ {p.unit}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewingAuditProduct(p)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Price audit history"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table Mode */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Dish</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Meal Session Slot</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-right">Cost</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg shrink-0">
                            {p.imageEmoji || '🍲'}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{p.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{p.category}</td>
                    <td className="py-3 px-4">
                      <select
                        value={p.mealSlot || 'all_day'}
                        onChange={(e) => handleQuickSlotChange(p.id, e.target.value as MealSlot)}
                        className="text-xs px-2 py-1 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800"
                      >
                        <option value="morning">🌅 Morning</option>
                        <option value="afternoon">☀️ Afternoon</option>
                        <option value="evening">🌙 Evening</option>
                        <option value="all_day">🕒 All Day</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatINR(p.price)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500">
                      {p.costPrice ? formatINR(p.costPrice) : '-'}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {p.isStockTracked ? (
                        <span className={p.stockQuantity <= p.minStockThreshold ? 'text-amber-600 font-bold' : 'text-slate-700'}>
                          {p.stockQuantity} {p.unit}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Uncapped</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleProductAvailability(p.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {p.isAvailable ? 'Available' : 'Disabled'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingAuditProduct(p)}
                          className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                          title="Audit logs"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {editingProduct ? `Edit Food Product: ${editingProduct.name}` : 'Add New Menu Item'}
                </h3>
                <p className="text-[11px] text-slate-500">Configure name, meal session schedule, photo, and price</p>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                  {formError}
                </div>
              )}

              {/* Dish Name & Emoji */}
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dish / Food Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Ghee Masala Dosa"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emoji</label>
                  <input
                    type="text"
                    value={formEmoji}
                    onChange={(e) => setFormEmoji(e.target.value)}
                    className="w-full text-xs text-center px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  />
                </div>
              </div>

              {/* Meal Slot Session Radio Group */}
              <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-2">
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider">
                  Meal Schedule Session (உணவு நேர பிரிவு) <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <label
                    className={`flex items-center gap-1.5 p-2 rounded-xl text-xs font-bold cursor-pointer border transition-all ${
                      formMealSlot === 'morning'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mealSlot"
                      value="morning"
                      checked={formMealSlot === 'morning'}
                      onChange={() => setFormMealSlot('morning')}
                      className="sr-only"
                    />
                    <span>🌅 Morning</span>
                  </label>

                  <label
                    className={`flex items-center gap-1.5 p-2 rounded-xl text-xs font-bold cursor-pointer border transition-all ${
                      formMealSlot === 'afternoon'
                        ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mealSlot"
                      value="afternoon"
                      checked={formMealSlot === 'afternoon'}
                      onChange={() => setFormMealSlot('afternoon')}
                      className="sr-only"
                    />
                    <span>☀️ Afternoon</span>
                  </label>

                  <label
                    className={`flex items-center gap-1.5 p-2 rounded-xl text-xs font-bold cursor-pointer border transition-all ${
                      formMealSlot === 'evening'
                        ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mealSlot"
                      value="evening"
                      checked={formMealSlot === 'evening'}
                      onChange={() => setFormMealSlot('evening')}
                      className="sr-only"
                    />
                    <span>🌙 Evening</span>
                  </label>

                  <label
                    className={`flex items-center gap-1.5 p-2 rounded-xl text-xs font-bold cursor-pointer border transition-all ${
                      formMealSlot === 'all_day'
                        ? 'bg-slate-800 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mealSlot"
                      value="all_day"
                      checked={formMealSlot === 'all_day'}
                      onChange={() => setFormMealSlot('all_day')}
                      className="sr-only"
                    />
                    <span>🕒 All Day</span>
                  </label>
                </div>
              </div>

              {/* Food Image URL with Preset Pickers */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Food Dish Photo (Image URL)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
                    {formImageUrl ? (
                      <img src={formImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                {/* Preset sample image chips */}
                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 block mb-1">Click a sample photo to apply:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_FOOD_IMAGES.slice(0, 8).map((preset) => (
                      <button
                        type="button"
                        key={preset.name}
                        onClick={() => setFormImageUrl(preset.url)}
                        className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-600 transition-colors font-medium border border-slate-200"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Category & Item Code */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    {state.settings.categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Item Code</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g. BF-DOSA"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Selling Price & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Selling Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="Plate / Cup / Piece"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              {/* Finished Stock Tracking */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formIsStockTracked}
                    onChange={(e) => setFormIsStockTracked(e.target.checked)}
                    className="w-3.5 h-3.5 text-blue-600 rounded"
                  />
                  <span>Enable Finished Food Stock Tracking</span>
                </label>

                {formIsStockTracked && (
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-500">Current Stock</label>
                      <input
                        type="number"
                        min="0"
                        value={formStockQuantity}
                        onChange={(e) => setFormStockQuantity(Number(e.target.value))}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500">Alert Min Stock</label>
                      <input
                        type="number"
                        min="0"
                        value={formMinStock}
                        onChange={(e) => setFormMinStock(Number(e.target.value))}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      {viewingAuditProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Price &amp; Config Audit: {viewingAuditProduct.name}
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">ID: {viewingAuditProduct.id}</p>
              </div>
              <button
                onClick={() => setViewingAuditProduct(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
              {productPriceAudits.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No modification events recorded for this food item.
                </div>
              ) : (
                productPriceAudits.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-semibold text-slate-700">{log.userName}</span>
                      <span>{formatDateTime(log.timestamp)}</span>
                    </div>
                    <p className="text-slate-800">{log.description}</p>
                    {log.reason && (
                      <p className="text-[11px] text-slate-500 italic mt-1">Reason: {log.reason}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
