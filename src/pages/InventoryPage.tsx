import React, { useState, useMemo } from 'react';
import { useMess } from '../store/MessContext';
import { Product, StockMovementType, StockMovement } from '../types';
import { formatINR, formatIndianNumber } from '../utils/currency';
import { formatDateTime } from '../utils/date';
import { exportToCSV } from '../utils/export';
import {
  Boxes,
  Plus,
  Minus,
  AlertTriangle,
  History,
  TrendingDown,
  Trash2,
  CheckCircle2,
  Download,
  Search,
  X,
  Package,
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const { state, adjustStock } = useMess();

  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  // Stock Adjustment Modal
  const [adjustmentTarget, setAdjustmentTarget] = useState<Product | null>(null);
  const [adjustType, setAdjustType] = useState<StockMovementType>('in');
  const [adjustQuantity, setAdjustQuantity] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [modalError, setModalError] = useState<string>('');

  // Tracked products
  const trackedProducts = useMemo(() => {
    return state.products.filter((p) => p.isStockTracked);
  }, [state.products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return trackedProducts.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
      const matchesLowStock = !filterLowStockOnly || p.stockQuantity <= p.minStockThreshold;
      return matchesSearch && matchesLowStock;
    });
  }, [trackedProducts, searchQuery, filterLowStockOnly]);

  // Total inventory valuation
  const inventoryValuation = useMemo(() => {
    return trackedProducts.reduce((acc, p) => acc + p.stockQuantity * (p.costPrice || p.price), 0);
  }, [trackedProducts]);

  const lowStockCount = useMemo(() => {
    return trackedProducts.filter((p) => p.stockQuantity <= p.minStockThreshold).length;
  }, [trackedProducts]);

  const handleOpenAdjust = (product: Product, type: StockMovementType) => {
    setAdjustmentTarget(product);
    setAdjustType(type);
    setAdjustQuantity(type === 'in' ? 20 : 5);
    setAdjustReason(
      type === 'in'
        ? 'Kitchen batch prepared / fresh stock delivered'
        : type === 'wastage'
        ? 'Spoilage / shelf-life expiry'
        : 'Internal staff meal consumption'
    );
    setModalError('');
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustmentTarget) return;

    if (adjustQuantity <= 0) {
      setModalError('Quantity must be greater than zero.');
      return;
    }
    if (!adjustReason.trim()) {
      setModalError('Mandatory reason required for inventory audit.');
      return;
    }

    const res = adjustStock(adjustmentTarget.id, adjustType, adjustQuantity, adjustReason.trim());
    if (res.success) {
      setAdjustmentTarget(null);
    } else if (res.error) {
      setModalError(res.error);
    }
  };

  const handleExportStockCSV = () => {
    const rows = trackedProducts.map((p) => ({
      Code: p.code,
      Name: p.name,
      Category: p.category,
      CurrentStock: p.stockQuantity,
      MinThreshold: p.minStockThreshold,
      Unit: p.unit,
      CostPrice: p.costPrice,
      TotalValuation: p.stockQuantity * (p.costPrice || p.price),
    }));
    exportToCSV(`mess_stock_ledger_${Date.now()}`, rows);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Inventory &amp; Food Stock Control
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Real-time stock depletion on billing, manual receiving, wastage logs, and threshold alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportStockCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Stock Ledger</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Stock Valuation
            </span>
            <div className="text-xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
              {formatINR(inventoryValuation)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Calculated at unit cost price</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tracked Food Items
            </span>
            <div className="text-xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
              {trackedProducts.length} dishes
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Inventory deducted at POS checkout</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Low Stock Warnings
            </span>
            <div className="text-xl font-bold text-amber-600 mt-1 font-mono tabular-nums">
              {lowStockCount} items
            </div>
            <p className="text-[11px] text-amber-700 mt-0.5">At or below re-order mark</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
              activeTab === 'current'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Current Stock Levels
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Stock Movement History ({state.stockMovements.length})
          </button>
        </div>

        {activeTab === 'current' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                filterLowStockOnly
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {filterLowStockOnly ? 'Showing Low Stock Only' : 'Filter Low Stock'}
            </button>
          </div>
        )}
      </div>

      {activeTab === 'current' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tracked dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {filteredProducts.length} items listed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Dish Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Current Stock</th>
                  <th className="py-3 px-4 text-right">Min Threshold</th>
                  <th className="py-3 px-4 text-right">Unit Cost</th>
                  <th className="py-3 px-4 text-right">Total Value</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick Stock Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const isLow = p.stockQuantity <= p.minStockThreshold;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                          <span>{p.imageEmoji}</span>
                          <span>{p.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{p.code}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{p.category}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {p.stockQuantity} {p.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500 tabular-nums">
                        {p.minStockThreshold} {p.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600 tabular-nums">
                        {formatINR(p.costPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatINR(p.stockQuantity * p.costPrice)}
                      </td>
                      <td className="py-3 px-4">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Optimal
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenAdjust(p, 'in')}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                            title="Stock In / Received Batch"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Stock In</span>
                          </button>
                          <button
                            onClick={() => handleOpenAdjust(p, 'out')}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            title="Stock Out / Consumption"
                          >
                            <Minus className="w-3 h-3" />
                            <span>Stock Out</span>
                          </button>
                          <button
                            onClick={() => handleOpenAdjust(p, 'wastage')}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                            title="Record Kitchen Wastage"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Wastage</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Movement History Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Movement Type</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4 text-right">Prev &rarr; New Stock</th>
                  <th className="py-3 px-4">Reason / Reference</th>
                  <th className="py-3 px-4">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.stockMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono">
                      {formatDateTime(m.timestamp)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{m.productName}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          m.type === 'in'
                            ? 'bg-emerald-50 text-emerald-700'
                            : m.type === 'wastage'
                            ? 'bg-rose-50 text-rose-700'
                            : m.type === 'sale'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {m.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                      {m.type === 'in' ? `+${m.quantity}` : `-${m.quantity}`}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500 tabular-nums">
                      {m.previousStock} &rarr; <strong>{m.newStock}</strong>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{m.reason}</td>
                    <td className="py-3 px-4 text-slate-500">{m.createdBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustmentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Stock Adjustment: {adjustmentTarget.name}
              </h3>
              <button
                onClick={() => setAdjustmentTarget(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="p-6 space-y-4">
              {modalError && (
                <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
                  {modalError}
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl text-xs flex justify-between items-center">
                <span className="text-slate-600">Current Stock:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {adjustmentTarget.stockQuantity} {adjustmentTarget.unit}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adjustment Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'in', label: 'Stock In (+)' },
                    { id: 'out', label: 'Stock Out (-)' },
                    { id: 'wastage', label: 'Wastage (-)' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setAdjustType(t.id as any)}
                      className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-all ${
                        adjustType === t.id
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity ({adjustmentTarget.unit}) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason / Source Reference <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Received shipment invoice #108 or spoilage"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustmentTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-xs"
                >
                  Commit Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
