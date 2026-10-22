import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMess } from '../store/MessContext';
import { Student, StudentStatus } from '../types';
import { formatINR } from '../utils/currency';
import { exportToCSV, parseCSV } from '../utils/export';
import {
  Search,
  Filter,
  UserPlus,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Eye,
  Edit2,
  Power,
  X,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';

export const StudentsPage: React.FC = () => {
  const { state, addStudent, updateStudent, toggleStudentStatus, bulkImportStudents, addToast } = useMess();
  const navigate = useNavigate();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [blockFilter, setBlockFilter] = useState('All');

  // Sorting & Pagination
  const [sortField, setSortField] = useState<'id' | 'name' | 'room' | 'monthlySpending'>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Add/Edit Form State
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formDept, setFormDept] = useState('Computer Science & Engg');
  const [formYear, setFormYear] = useState(1);
  const [formRoom, setFormRoom] = useState('');
  const [formBlock, setFormBlock] = useState('A');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formStatus, setFormStatus] = useState<StudentStatus>('active');
  const [formError, setFormError] = useState('');

  // CSV Import State
  const [csvText, setCsvText] = useState('');
  const [importSummary, setImportSummary] = useState<{
    success: number;
    failed: number;
    duplicates: number;
    errors: string[];
  } | null>(null);

  // Departments list for filter
  const departments = useMemo(() => {
    const set = new Set(state.students.map((s) => s.department));
    return ['All', ...Array.from(set)];
  }, [state.students]);

  // Filter & Sort Logic
  const filteredStudents = useMemo(() => {
    return state.students.filter((student) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        student.id.toLowerCase().includes(q) ||
        student.name.toLowerCase().includes(q) ||
        student.roomNumber.toLowerCase().includes(q) ||
        student.department.toLowerCase().includes(q);

      const matchesDept = departmentFilter === 'All' || student.department === departmentFilter;
      const matchesYear = yearFilter === 'All' || student.year.toString() === yearFilter;
      const matchesStatus = statusFilter === 'All' || student.status === statusFilter;
      const matchesBlock = blockFilter === 'All' || student.hostelBlock === blockFilter;

      return matchesSearch && matchesDept && matchesYear && matchesStatus && matchesBlock;
    });
  }, [state.students, searchQuery, departmentFilter, yearFilter, statusFilter, blockFilter]);

  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      if (sortField === 'id') {
        valA = a.id;
        valB = b.id;
      } else if (sortField === 'name') {
        valA = a.name;
        valB = b.name;
      } else if (sortField === 'room') {
        valA = a.roomNumber;
        valB = b.roomNumber;
      } else if (sortField === 'monthlySpending') {
        valA = a.monthlySpending;
        valB = b.monthlySpending;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortDirection === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
  }, [filteredStudents, sortField, sortDirection]);

  // Pagination Slice
  const totalPages = Math.ceil(sortedStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedStudents.slice(start, start + pageSize);
  }, [sortedStudents, currentPage, pageSize]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const rows = sortedStudents.map((s) => ({
      ID: s.id,
      Name: s.name,
      Department: s.department,
      Year: s.year,
      Room: s.roomNumber,
      HostelBlock: s.hostelBlock,
      Status: s.status,
      MonthlySpending: s.monthlySpending,
      TotalSpending: s.totalSpending,
      BillsCount: s.billsCount,
      Phone: s.phone,
      Email: s.email,
    }));
    exportToCSV(`mess_students_${Date.now()}`, rows);
  };

  // Open Edit Modal
  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormId(student.id);
    setFormName(student.name);
    setFormDept(student.department);
    setFormYear(student.year);
    setFormRoom(student.roomNumber);
    setFormBlock(student.hostelBlock);
    setFormPhone(student.phone);
    setFormEmail(student.email);
    setFormStatus(student.status);
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingStudent(null);
    const nextNum = state.students.length + 1;
    setFormId(`STU-${nextNum.toString().padStart(3, '0')}`);
    setFormName('');
    setFormDept('Computer Science & Engg');
    setFormYear(1);
    setFormRoom('A-101');
    setFormBlock('A');
    setFormPhone('+91 98000 12345');
    setFormEmail('');
    setFormStatus('active');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId.trim()) {
      setFormError('Student ID is required.');
      return;
    }
    if (!formName.trim()) {
      setFormError('Student name is required.');
      return;
    }
    if (!formRoom.trim()) {
      setFormError('Room number is required.');
      return;
    }

    if (editingStudent) {
      // Update
      const res = updateStudent(editingStudent.id, {
        name: formName.trim(),
        department: formDept,
        year: formYear,
        roomNumber: formRoom.trim(),
        hostelBlock: formBlock,
        phone: formPhone.trim(),
        email: formEmail.trim() || `${formId.toLowerCase()}@hostel.edu`,
        status: formStatus,
      });
      if (res.success) {
        setIsAddModalOpen(false);
      } else if (res.error) {
        setFormError(res.error);
      }
    } else {
      // Add
      const res = addStudent({
        id: formId.trim().toUpperCase(),
        name: formName.trim(),
        department: formDept,
        year: formYear,
        roomNumber: formRoom.trim(),
        hostelBlock: formBlock,
        phone: formPhone.trim(),
        email: formEmail.trim() || `${formId.toLowerCase()}@hostel.edu`,
        status: formStatus,
        barcode: `BRC-${formId.trim().toUpperCase()}`,
        creditLimit: 3000,
      });
      if (res.success) {
        setIsAddModalOpen(false);
      } else if (res.error) {
        setFormError(res.error);
      }
    }
  };

  // CSV Import handler
  const handleProcessCSV = () => {
    if (!csvText.trim()) {
      addToast('warning', 'Empty CSV', 'Please enter or upload CSV rows.');
      return;
    }

    const { rows } = parseCSV(csvText);
    if (rows.length === 0) {
      addToast('error', 'Invalid CSV Format', 'Could not parse student columns.');
      return;
    }

    const studentsToImport: Partial<Student>[] = rows.map((r) => ({
      id: r.id || r.studentid || r.rollno,
      name: r.name || r.studentname,
      department: r.department || r.branch || r.dept,
      year: Number(r.year) || 1,
      roomNumber: r.room || r.roomnumber,
      hostelBlock: r.block || r.hostelblock || 'A',
      phone: r.phone || r.mobile,
      email: r.email,
      status: (r.status as StudentStatus) || 'active',
    }));

    const summary = bulkImportStudents(studentsToImport);
    setImportSummary(summary);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Students
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            {state.students.length} Registered Students
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              setImportSummary(null);
              setCsvText('');
              setIsImportModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Bulk CSV Import</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Search & Multi-Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID (STU-001), name, room..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
            >
              <option value="All">All Departments</option>
              {departments.filter((d) => d !== 'All').map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Year Filter */}
          <div>
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
            >
              <option value="All">All Years</option>
              <option value="1">1st Year (Freshmen)</option>
              <option value="2">2nd Year (Sophomore)</option>
              <option value="3">3rd Year (Junior)</option>
              <option value="4">4th Year (Senior)</option>
            </select>
          </div>

          {/* Account Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active Residents</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong>{sortedStudents.length}</strong> matches (Page {currentPage} of {totalPages})
          </span>
          {(searchQuery || departmentFilter !== 'All' || yearFilter !== 'All' || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setDepartmentFilter('All');
                setYearFilter('All');
                setStatusFilter('All');
                setBlockFilter('All');
                setCurrentPage(1);
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th
                  onClick={() => handleSort('id')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none"
                >
                  Student ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none"
                >
                  Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="py-3 px-4">Department &amp; Year</th>
                <th
                  onClick={() => handleSort('room')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none"
                >
                  Room No {sortField === 'room' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="py-3 px-4">Status</th>
                <th
                  onClick={() => handleSort('monthlySpending')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none text-right"
                >
                  Month Spend {sortField === 'monthlySpending' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="py-3 px-4 text-right">Bills</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No students match the current search filters.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <button
                        onClick={() => navigate(`/students/${s.id}`)}
                        className="hover:text-blue-600 text-left"
                      >
                        {s.id}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{s.name}</div>
                      <div className="text-[11px] text-slate-500">{s.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{s.department}</div>
                      <div className="text-[11px] text-slate-400">Year {s.year}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">
                      {s.roomNumber} (Blk {s.hostelBlock})
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          s.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : s.status === 'suspended'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatINR(s.monthlySpending)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600 tabular-nums">
                      {s.billsCount}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/students/${s.id}`)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View detailed ledger profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit student record"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStudentStatus(s.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            s.status === 'active'
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={s.status === 'active' ? 'Deactivate student' : 'Activate student'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedStudents.length)} of {sortedStudents.length}{' '}
            students
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
              aria-label="Previous Page"
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
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {editingStudent ? `Edit Student: ${editingStudent.id}` : 'Register New Mess Student'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 space-y-3.5">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={!!editingStudent}
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    placeholder="e.g. STU-501"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Computer Science & Engg">Computer Science &amp; Engg</option>
                    <option value="Electronics & Communication">Electronics &amp; Communication</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Electrical & Electronics">Electrical &amp; Electronics</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Biotechnology">Biotechnology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
                  <select
                    value={formYear}
                    onChange={(e) => setFormYear(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hostel Room <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    placeholder="e.g. B-214"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Block</label>
                  <select
                    value={formBlock}
                    onChange={(e) => setFormBlock(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A">Block A</option>
                    <option value="B">Block B</option>
                    <option value="C">Block C</option>
                    <option value="D">Block D</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as StudentStatus)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-xs"
                >
                  {editingStudent ? 'Save Changes' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Bulk CSV Import Student Roster
                </h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                Paste student records in CSV format or choose an exported CSV file. Duplicate student IDs will be automatically flagged and skipped.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expected Headers: <code>id, name, department, year, room, block, phone, status</code>
                </label>
                <textarea
                  rows={6}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder={`id,name,department,year,room,block,status\nSTU-501,Akash Roy,Computer Science & Engg,1,B-101,B,active\nSTU-502,Deepa Nair,Mechanical Engineering,2,C-302,C,active`}
                  className="w-full text-xs font-mono p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Import Summary Results */}
              {importSummary && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <div className="font-bold text-slate-900">Import Processing Complete:</div>
                  <div className="grid grid-cols-3 gap-2 py-1 text-center font-bold">
                    <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg">
                      {importSummary.success} Successful
                    </div>
                    <div className="p-2 bg-amber-50 text-amber-800 rounded-lg">
                      {importSummary.duplicates} Duplicates
                    </div>
                    <div className="p-2 bg-rose-50 text-rose-800 rounded-lg">
                      {importSummary.failed} Failed
                    </div>
                  </div>
                  {importSummary.errors.length > 0 && (
                    <div className="text-[11px] text-rose-600 pt-1">
                      {importSummary.errors.slice(0, 3).map((err, i) => (
                        <div key={i}>{err}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={handleProcessCSV}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-xs"
              >
                Run Validation &amp; Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
