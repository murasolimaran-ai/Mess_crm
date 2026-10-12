import React, { useState } from 'react';
import { useMess } from '../store/MessContext';
import { MessSettings, ProductCategory } from '../types';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { exportToCSV } from '../utils/export';
import {
  Settings,
  Building2,
  Receipt,
  RotateCcw,
  Download,
  Save,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  CreditCard,
  Plus,
  Trash2,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { state, updateSettings, resetDemoData, addToast } = useMess();

  const [settingsForm, setSettingsForm] = useState<MessSettings>({ ...state.settings });
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleInputChange = (field: keyof MessSettings, value: any) => {
    setSettingsForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePaymentMethodToggle = (method: 'cash' | 'upi' | 'hostel_credit') => {
    setSettingsForm((prev) => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [method]: !prev.paymentMethods[method],
      },
    }));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
  };

  // Add custom category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const cat = newCategoryName.trim() as ProductCategory;
    if (settingsForm.categories.includes(cat)) {
      addToast('warning', 'Category Exists', 'This category already exists in your menu.');
      return;
    }
    setSettingsForm((prev) => ({
      ...prev,
      categories: [...prev.categories, cat],
    }));
    setNewCategoryName('');
  };

  const handleRemoveCategory = (cat: ProductCategory) => {
    if (settingsForm.categories.length <= 1) {
      addToast('error', 'Cannot Remove', 'Must maintain at least one category.');
      return;
    }
    setSettingsForm((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== cat),
    }));
  };

  const handleExportAllSystemData = () => {
    const dump = {
      exportedAt: new Date().toISOString(),
      studentsCount: state.students.length,
      billsCount: state.bills.length,
      productsCount: state.products.length,
      settings: state.settings,
    };
    exportToCSV(`mess_full_backup_${Date.now()}`, [dump]);
    addToast('success', 'Backup Exported', 'Full system state exported.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Mess Settings &amp; Configuration
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Configure hostel dining hall identity, thermal receipt headers, and currency standards
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Mess Organization Identity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Mess Organization Identity &amp; Campus Coordinates
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mess Name</label>
              <input
                type="text"
                value={settingsForm.messName}
                onChange={(e) => handleInputChange('messName', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Parent Institute / University
              </label>
              <input
                type="text"
                value={settingsForm.instituteName}
                onChange={(e) => handleInputChange('instituteName', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Address</label>
              <input
                type="text"
                value={settingsForm.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Helpdesk Phone</label>
              <input
                type="text"
                value={settingsForm.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Administrative Email</label>
              <input
                type="email"
                value={settingsForm.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Currency & Fiscal Standards */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Financial, Currency &amp; Timezone Standards
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Operating Currency</label>
              <input
                type="text"
                disabled
                value={`${settingsForm.currency} (${settingsForm.currencySymbol}) - Indian Rupee`}
                className="w-full text-xs px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-mono font-medium text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Business Timezone</label>
              <input
                type="text"
                disabled
                value={`${settingsForm.timezone} (IST +05:30)`}
                className="w-full text-xs px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-mono font-medium text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bill Number Prefix</label>
              <input
                type="text"
                value={settingsForm.billPrefix}
                onChange={(e) => handleInputChange('billPrefix', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Max Allowed Cashier Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={settingsForm.maxDiscountPercent}
                onChange={(e) => handleInputChange('maxDiscountPercent', Number(e.target.value))}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={settingsForm.allowNegativeStock}
                  onChange={(e) => handleInputChange('allowNegativeStock', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>Allow Negative Inventory (Backorder Overrides)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Thermal POS Receipt Customizer */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Receipt className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              POS Thermal Receipt Customizer
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt Top Header Banner</label>
              <textarea
                rows={3}
                value={settingsForm.receiptHeader}
                onChange={(e) => handleInputChange('receiptHeader', e.target.value)}
                className="w-full text-xs font-mono p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt Footer Instructions</label>
              <textarea
                rows={3}
                value={settingsForm.receiptFooter}
                onChange={(e) => handleInputChange('receiptFooter', e.target.value)}
                className="w-full text-xs font-mono p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Payment Channels & Menu Categories */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Accepted Payment Modes &amp; Menu Categories
            </h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Enabled Payment Channels</label>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsForm.paymentMethods.upi}
                  onChange={() => handlePaymentMethodToggle('upi')}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>UPI / QR Digital Transfers</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsForm.paymentMethods.cash}
                  onChange={() => handlePaymentMethodToggle('cash')}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span>Physical Counter Cash</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsForm.paymentMethods.hostel_credit}
                  onChange={() => handlePaymentMethodToggle('hostel_credit')}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <span>Hostel Credit Ledger Account</span>
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-2">Active Food Categories</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {settingsForm.categories.map((cat) => (
                <div
                  key={cat}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                >
                  <span>{cat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(cat)}
                    className="text-slate-400 hover:text-rose-600 p-0.5"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                placeholder="New category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 text-xs px-3 py-1.5 border border-slate-300 rounded-lg"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Data Persistence, Backup & Demo Reset Controls */}
        <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-rose-100">
            <RotateCcw className="w-5 h-5 text-rose-600" />
            <h2 className="text-sm font-bold text-rose-950 uppercase tracking-wider">
              Demo Data Reset &amp; Full System Backup
            </h2>
          </div>

          <p className="text-xs text-slate-600">
            All client modifications are persisted safely in browser local storage. If you need to restore the pristine initial seed of 500 students, realistic dish inventory, and sample bills, trigger a reset below.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleExportAllSystemData}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Full System Backup</span>
            </button>

            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo to Seed State</span>
            </button>
          </div>
        </div>
      </form>

      {/* Demo Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <ConfirmModal
          isOpen={isResetConfirmOpen}
          title="Reset Entire Demo Dataset?"
          message="This action will clear all local bills, custom students, and stock edits, restoring the pristine mock dataset with 500 students, 3 staff accounts, and menu catalog. Are you sure you want to proceed?"
          confirmLabel="Reset Demo Data"
          variant="danger"
          onConfirm={() => {
            resetDemoData();
            setIsResetConfirmOpen(false);
          }}
          onCancel={() => setIsResetConfirmOpen(false)}
        />
      )}
    </div>
  );
};
