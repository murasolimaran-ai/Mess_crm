import React, { useState } from 'react';
import { useMess } from '../../store/MessContext';
import { QrCode, Scan, X, Search, Check, AlertTriangle } from 'lucide-react';
import { Student } from '../../types';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStudent: (student: Student) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectStudent,
}) => {
  const { state } = useMess();
  const [manualCode, setManualCode] = useState('');
  const [scanStatus, setScanStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulateScan = (student: Student) => {
    setScanStatus(`Scanned barcode: ${student.barcode}`);
    setTimeout(() => {
      onSelectStudent(student);
      onClose();
    }, 400);
  };

  const handleManualLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    const query = manualCode.trim().toLowerCase();
    const found = state.students.find(
      (s) =>
        s.barcode.toLowerCase() === query ||
        s.id.toLowerCase() === query ||
        s.roomNumber.toLowerCase() === query
    );

    if (found) {
      setScanStatus(`Found ${found.name} (${found.id})`);
      setTimeout(() => {
        onSelectStudent(found);
        onClose();
      }, 400);
    } else {
      setScanStatus(`No student found for barcode "${manualCode}"`);
    }
  };

  // Sample active and inactive students for testing
  const sampleStudents = state.students.slice(0, 6);
  const inactiveSample = state.students.find((s) => s.status !== 'active');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hostel Smart ID Card Scanner</h3>
              <p className="text-xs text-slate-500">Optical barcode &amp; RFID badge reader</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Simulated Scanner Viewport */}
          <div className="relative border-2 border-dashed border-blue-400 rounded-xl p-6 bg-slate-900 text-white flex flex-col items-center justify-center text-center overflow-hidden">
            {/* Animated Laser beam */}
            <div className="absolute inset-x-0 top-1/2 h-0.5 bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse" />
            
            <QrCode className="w-16 h-16 text-blue-400 opacity-80 mb-3" />
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">
              Hardware Scanner Ready
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
              Place student identity smart card or mess coupon under barcode reader
            </p>
            {scanStatus && (
              <div className="mt-3 px-3 py-1 bg-blue-500/20 border border-blue-400/40 rounded text-xs text-blue-200">
                {scanStatus}
              </div>
            )}
          </div>

          {/* Quick Simulated RFID Tap */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Quick Tap Simulation (One-Click)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {sampleStudents.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSimulateScan(s)}
                  className="flex flex-col items-start p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-colors text-xs"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-slate-900">{s.id}</span>
                    <span className="text-[10px] text-slate-500">{s.roomNumber}</span>
                  </div>
                  <span className="text-slate-700 truncate w-full mt-0.5">{s.name}</span>
                  <span className="text-[10px] text-slate-500 truncate">{s.department.split('&')[0]}</span>
                </button>
              ))}
            </div>

            {inactiveSample && (
              <div className="mt-2">
                <button
                  onClick={() => handleSimulateScan(inactiveSample)}
                  className="w-full flex items-center justify-between p-2 rounded-lg border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 text-xs text-amber-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Test Inactive Student Error: <strong>{inactiveSample.name} ({inactiveSample.id})</strong></span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-amber-700">{inactiveSample.status}</span>
                </button>
              </div>
            )}
          </div>

          {/* Manual Input Fallback */}
          <form onSubmit={handleManualLookup} className="pt-2 border-t border-slate-200">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Manual Barcode / ID String Entry
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. BRC-STU-001-1001 or STU-001"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                Find
              </button>
            </div>
          </form>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
