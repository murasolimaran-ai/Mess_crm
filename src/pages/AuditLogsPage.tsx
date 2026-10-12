import React, { useState, useMemo } from 'react';
import { useMess } from '../store/MessContext';
import { formatDateTime, formatDate, isWithinDateRange } from '../utils/date';
import { exportToCSV } from '../utils/export';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Calendar,
  Lock,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const { state } = useMess();

  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const filteredLogs = useMemo(() => {
    return state.auditLogs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        log.action.toLowerCase().includes(q) ||
        log.description.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.recordId.toLowerCase().includes(q);

      const matchesEntity = entityFilter === 'All' || log.entityType === entityFilter;
      const matchesRole = roleFilter === 'All' || log.userRole === roleFilter;
      const matchesDate = isWithinDateRange(log.timestamp, dateStart, dateEnd);

      return matchesSearch && matchesEntity && matchesRole && matchesDate;
    });
  }, [state.auditLogs, searchQuery, entityFilter, roleFilter, dateStart, dateEnd]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  const handleExportCSV = () => {
    const rows = filteredLogs.map((l) => ({
      ID: l.id,
      Timestamp: l.timestamp,
      Date: formatDate(l.timestamp),
      User: l.userName,
      Role: l.userRole,
      Action: l.action,
      EntityType: l.entityType,
      RecordID: l.recordId,
      Description: l.description,
    }));
    exportToCSV(`mess_audit_trail_${Date.now()}`, rows);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Immutable Audit Trail &amp; System Logs
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Cryptographically timestamped compliance records &middot; Immutable read-only events ({state.auditLogs.length} total)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search event action, user, or record ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="All">All Entity Types</option>
              <option value="bill">Bills &amp; Transactions</option>
              <option value="student">Student Accounts</option>
              <option value="product">Product &amp; Prices</option>
              <option value="inventory">Inventory Movements</option>
              <option value="shift">Shift Closings</option>
              <option value="user">User Accounts</option>
              <option value="settings">Mess Configuration</option>
            </select>
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="All">All User Roles</option>
              <option value="admin">Admin Actions Only</option>
              <option value="cashier">Cashier Actions Only</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={dateStart}
              onChange={(e) => {
                setDateStart(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600"
              title="Start Date"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => {
                setDateEnd(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600"
              title="End Date"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong>{filteredLogs.length}</strong> audited logs (Page {currentPage} of {totalPages})
          </span>
          {(searchQuery || entityFilter !== 'All' || roleFilter !== 'All' || dateStart || dateEnd) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setEntityFilter('All');
                setRoleFilter('All');
                setDateStart('');
                setDateEnd('');
                setCurrentPage(1);
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-3 px-4">Timestamp (IST)</th>
                <th className="py-3 px-4">User &amp; Role</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Record Ref</th>
                <th className="py-3 px-4">Audit Description &amp; Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{log.userName}</div>
                    <span
                      className={`inline-block mt-0.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded font-mono ${
                        log.userRole === 'admin'
                          ? 'bg-slate-900 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {log.userRole}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800 text-[11px]">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 uppercase text-[10px] font-bold text-slate-500 tracking-wider">
                    {log.entityType}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">{log.recordId}</td>
                  <td className="py-3 px-4 text-slate-700 leading-relaxed max-w-md">
                    {log.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length} events
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
