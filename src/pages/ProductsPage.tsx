import React, { useState, useMemo } from 'react';
import { useMess } from '../store/MessContext';
import { Product, ProductCategory } from '../types';
import { formatINR } from '../utils/currency';
import { formatDateTime } from '../utils/date';
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
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { state, addProduct, updateProduct, toggleProductAvailability, addToast } = useMess();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'tracked' | 'low_stock'>('all');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deactivatingProduct, setDeactivatingProduct] = useState<Product | null>(null);
  const [viewingAuditProduct, setViewingAuditProduct] = useState<Product | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('Meals & Thali');
  const [formPrice, setFormPrice] = useState<number>(50);
  const [formCostPrice, setFormCostPrice] = useState<number>(30);
  const [formIsStockTracked, setFormIsStockTracked] = useState(true);
  const [formStockQuantity, setFormStockQuantity] = useState<number>(50);
  const [formMinStock, setFormMinStock] = useState<number>(15);
  const [formUnit, setFormUnit] = useState('plate');
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

      let matchesStock = true;
      if (stockFilter === 'tracked') matchesStock = p.isStockTracked;
      else if (stockFilter === 'low_stock')
        matchesStock = p.isStockTracked && p.stockQuantity <= p.minStockThreshold;

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [state.products, searchQuery, selectedCategory, stockFilter]);

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
    setFormCategory('Meals & Thali');
    setFormPrice(60);
    setFormCostPrice(35);
    setFormIsStockTracked(true);
    setFormStockQuantity(50);
    setFormMinStock(15);
    setFormUnit('plate');
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
    setFormPrice(p.price);
    setFormCostPrice(p.costPrice);
    setFormIsStockTracked(p.isStockTracked);
    setFormStockQuantity(p.stockQuantity);
    setFormMinStock(p.minStockThreshold);
    setFormUnit(p.unit);
    setFormEmoji(p.imageEmoji || '🍲');
    setFormDescription(p.description || '');
    setFormError('');
    setIsFormModalOpen(true);
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
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Menu Catalog &amp; Products
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Manage hostel mess food items, prices, cost margins, and active availability
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

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search dishes or item code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            {(searchQuery || selectedCategory !== 'All' || stockFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setStockFilter('all');
                }}
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                Reset
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
            const margin = p.costPrice > 0 ? Math.round(((p.price - p.costPrice) / p.price) * 100) : 0;

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-2xl">{p.imageEmoji || '🍲'}</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          p.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {p.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{p.code} &middot; {p.category}</p>
                  {p.description && (
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
                        {formatINR(p.price)}
                      </span>
                      <span className="text-[10px] text-slate-500 ml-1">/ {p.unit}</span>
                    </div>
                    {p.costPrice > 0 && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        Cost: {formatINR(p.costPrice)} ({margin}% margin)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">
                      Stock:{' '}
                      {p.isStockTracked ? (
                        <strong
                          className={`font-mono ${isLowStock ? 'text-amber-600 font-bold' : 'text-slate-800'}`}
                        >
                          {p.stockQuantity} {p.unit}
                        </strong>
                      ) : (
                        <span className="text-slate-400 italic">Made to order</span>
                      )}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewingAuditProduct(p)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="View price history & audit log"
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
                      <button
                        onClick={() => setDeactivatingProduct(p)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          p.isAvailable
                            ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={p.isAvailable ? 'Mark unavailable' : 'Mark available'}
                      >
                        {p.isAvailable ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Item Code</th>
                  <th className="py-3 px-4">Food Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-right">Cost Price</th>
                  <th className="py-3 px-4">Stock Level</th>
                  <th className="py-3 px-4">Availability</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{p.code}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        <span>{p.imageEmoji}</span>
                        <span>{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{p.category}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatINR(p.price)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500 tabular-nums">
                      {p.costPrice ? formatINR(p.costPrice) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {p.isStockTracked ? (
                        <span
                          className={`font-mono font-semibold ${
                            p.stockQuantity <= p.minStockThreshold ? 'text-amber-600' : 'text-slate-700'
                          }`}
                        >
                          {p.stockQuantity} {p.unit}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Uncapped</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          p.isAvailable
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {p.isAvailable ? 'Available' : 'Disabled'}
                      </span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {editingProduct ? `Edit Food Product: ${editingProduct.name}` : 'Add New Menu Item'}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-3.5">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dish / Food Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Masala Dosa"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emoji Icon</label>
                  <input
                    type="text"
                    value={formEmoji}
                    onChange={(e) => setFormEmoji(e.target.value)}
                    className="w-full text-xs text-center px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
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
                    placeholder="e.g. BRK-MDOS"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

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
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estimated Cost (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
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
                  <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
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
                    <div>
                      <label className="text-[11px] text-slate-500">Unit Type</label>
                      <input
                        type="text"
                        value={formUnit}
                        onChange={(e) => setFormUnit(e.target.value)}
                        placeholder="plate / cup"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ingredients &amp; Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ingredients, serving portions, or meal contents"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-xs"
                >
                  {editingProduct ? 'Save Updates' : 'Add to Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal before deactivation */}
      {deactivatingProduct && (
        <ConfirmModal
          isOpen={!!deactivatingProduct}
          title={deactivatingProduct.isAvailable ? 'Disable Menu Product?' : 'Enable Menu Product?'}
          message={`Are you sure you want to change availability for ${deactivatingProduct.name}? ${
            deactivatingProduct.isAvailable
              ? 'Cashiers will not be able to add this item to student bills until re-enabled.'
              : 'This dish will immediately appear on the active POS billing grid.'
          }`}
          confirmLabel={deactivatingProduct.isAvailable ? 'Disable Item' : 'Enable Item'}
          variant={deactivatingProduct.isAvailable ? 'warning' : 'primary'}
          onConfirm={() => {
            toggleProductAvailability(deactivatingProduct.id);
            setDeactivatingProduct(null);
          }}
          onCancel={() => setDeactivatingProduct(null)}
        />
      )}

      {/* Price Audit History Modal */}
      {viewingAuditProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Audit History: {viewingAuditProduct.name}
                </h3>
              </div>
              <button
                onClick={() => setViewingAuditProduct(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <div className="text-xs text-slate-600">
                Current Price: <strong className="font-mono text-slate-900">{formatINR(viewingAuditProduct.price)}</strong> &middot; Last updated: {formatDateTime(viewingAuditProduct.updatedAt)}
              </div>

              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {productPriceAudits.length > 0 ? (
                  productPriceAudits.map((a) => (
                    <div key={a.id} className="py-2.5 text-xs">
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span>{a.action}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {formatDateTime(a.timestamp)}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{a.description}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">By: {a.userName} ({a.userRole})</p>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No historical modifications recorded for this product.
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewingAuditProduct(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
