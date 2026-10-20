import React, { useState, useMemo } from 'react';
import { useMess } from '../store/MessContext';
import { User, UserRole, FacilityCategory, CashierDesignation, GenderCategory } from '../types';
import { formatDateTime } from '../utils/date';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import {
  Users,
  UserPlus,
  Shield,
  KeyRound,
  CheckCircle2,
  XCircle,
  Power,
  Edit2,
  Lock,
  X,
  AlertTriangle,
  Search,
  Building2,
  Sparkles,
  Filter,
  Tag,
  Home,
  UtensilsCrossed,
  Layers,
} from 'lucide-react';

const CATEGORY_OPTIONS: FacilityCategory[] = [
  "Men's Mess",
  "Men's Hostel",
  "Women's Mess",
  "Men's PG",
  "Women's Hostel / PG",
  "General / Central",
];

const DESIGNATION_OPTIONS: CashierDesignation[] = [
  "Men's Mess Cashier",
  "Men's Hostel Cashier",
  "Women's Mess Cashier",
  "System Administrator",
  "Counter Cashier",
];

export const UserManagementPage: React.FC = () => {
  const { state, currentUser, addUser, updateUser, toggleUserStatus, addToast } = useMess();

  const isAdmin = currentUser.role === 'admin';

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [designationFilter, setDesignationFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Deactivate confirmation modal
  const [deactivatingUser, setDeactivatingUser] = useState<User | null>(null);

  // Form State (User ID & Username are completely customizable & editable!)
  const [formId, setFormId] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<FacilityCategory>("Men's Mess");
  const [formDesignation, setFormDesignation] = useState<CashierDesignation>("Men's Mess Cashier");
  const [formGenderCategory, setFormGenderCategory] = useState<GenderCategory>('Men');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('cashier');
  const [formError, setFormError] = useState('');

  // Password reset simulation modal
  const [resettingUser, setResettingUser] = useState<User | null>(null);

  if (!isAdmin) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Access Restricted</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          User administration is restricted to System Administrators. Cashier accounts cannot modify personnel, roles, or User IDs.
        </p>
      </div>
    );
  }

  // Quick stats
  const stats = useMemo(() => {
    const total = state.users.length;
    const mensMessCashiers = state.users.filter(
      (u) => u.designation === "Men's Mess Cashier" || u.category === "Men's Mess"
    ).length;
    const mensHostelCashiers = state.users.filter(
      (u) => u.designation === "Men's Hostel Cashier" || u.category === "Men's Hostel" || u.category === "Men's PG"
    ).length;
    const womensMessCashiers = state.users.filter(
      (u) => u.designation === "Women's Mess Cashier" || u.category === "Women's Mess"
    ).length;
    const admins = state.users.filter((u) => u.role === 'admin').length;

    return { total, mensMessCashiers, mensHostelCashiers, womensMessCashiers, admins };
  }, [state.users]);

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return state.users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory =
        categoryFilter === 'all' ||
        (u.category && u.category.toLowerCase() === categoryFilter.toLowerCase());

      const matchDesignation =
        designationFilter === 'all' ||
        (u.designation && u.designation.toLowerCase() === designationFilter.toLowerCase());

      const matchRole = roleFilter === 'all' || u.role === roleFilter;

      return matchSearch && matchCategory && matchDesignation && matchRole;
    });
  }, [state.users, searchTerm, categoryFilter, designationFilter, roleFilter]);

  const handleOpenAdd = () => {
    setEditingUser(null);
    const nextSeq = String(state.users.length + 1).padStart(3, '0');
    setFormId(`USR-MENS-${nextSeq}`);
    setFormUsername(`cashier_${state.users.length + 1}`);
    setFormName('');
    setFormCategory("Men's Mess");
    setFormDesignation("Men's Mess Cashier");
    setFormGenderCategory('Men');
    setFormEmail('');
    setFormPhone('+91 98765 00000');
    setFormRole('cashier');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    // Explicitly allow editing User ID and Username!
    setFormId(user.id);
    setFormUsername(user.username);
    setFormName(user.name);
    setFormCategory((user.category as FacilityCategory) || (user.role === 'admin' ? 'General / Central' : "Men's Mess"));
    setFormDesignation(
      (user.designation as CashierDesignation) || (user.role === 'admin' ? 'System Administrator' : "Men's Mess Cashier")
    );
    setFormGenderCategory(user.genderCategory || (user.role === 'admin' ? 'Co-ed' : 'Men'));
    setFormEmail(user.email);
    setFormPhone(user.phone);
    setFormRole(user.role);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCategoryChange = (newCat: FacilityCategory) => {
    setFormCategory(newCat);
    // Sensible automatic defaults that remain fully editable
    if (newCat === "Men's Hostel") {
      setFormGenderCategory('Men');
      if (formRole === 'cashier') setFormDesignation("Men's Hostel Cashier");
      if (!editingUser) setFormId(`USR-MHST-${String(state.users.length + 1).padStart(2, '0')}`);
    } else if (newCat === "Men's Mess") {
      setFormGenderCategory('Men');
      if (formRole === 'cashier') setFormDesignation("Men's Mess Cashier");
      if (!editingUser) setFormId(`USR-MMES-${String(state.users.length + 1).padStart(2, '0')}`);
    } else if (newCat === "Women's Mess" || newCat === "Women's Hostel / PG") {
      setFormGenderCategory('Women');
      if (formRole === 'cashier') setFormDesignation("Women's Mess Cashier");
      if (!editingUser) setFormId(`USR-WMES-${String(state.users.length + 1).padStart(2, '0')}`);
    } else if (newCat === "Men's PG") {
      setFormGenderCategory('Men');
      if (formRole === 'cashier') setFormDesignation("Men's Hostel Cashier");
      if (!editingUser) setFormId(`USR-MPG-${String(state.users.length + 1).padStart(2, '0')}`);
    } else if (newCat === "General / Central") {
      setFormGenderCategory('Co-ed');
      if (formRole === 'admin') setFormDesignation('System Administrator');
      if (!editingUser) setFormId(`USR-ADM-${String(state.users.length + 1).padStart(2, '0')}`);
    }
  };

  const handleGenerateId = () => {
    const prefix = formCategory === "Men's Hostel" ? 'MHST' : formCategory === "Women's Mess" ? 'WMES' : formCategory === "Men's PG" ? 'MPG' : 'MMES';
    const rand = Math.floor(100 + Math.random() * 900);
    setFormId(`USR-${prefix}-${rand}`);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = formId.trim().toUpperCase();
    const cleanUsername = formUsername.trim().toLowerCase();
    const cleanName = formName.trim();

    if (!cleanId) {
      setFormError('User ID cannot be blank. Enter a unique identifier (e.g. USR-MENS-01).');
      return;
    }
    if (!cleanUsername) {
      setFormError('Username cannot be blank. Enter a unique login handle.');
      return;
    }
    if (!cleanName) {
      setFormError('Full personnel name is required.');
      return;
    }

    if (editingUser) {
      const res = updateUser(editingUser.id, {
        id: cleanId,
        username: cleanUsername,
        name: cleanName,
        category: formCategory,
        designation: formDesignation,
        genderCategory: formGenderCategory,
        email: formEmail.trim() || `${cleanUsername}@hostel.edu`,
        phone: formPhone.trim() || '+91 98000 00000',
        role: formRole,
      });

      if (res.success) {
        setIsModalOpen(false);
      } else if (res.error) {
        setFormError(res.error);
      }
    } else {
      const res = addUser({
        id: cleanId,
        username: cleanUsername,
        name: cleanName,
        category: formCategory,
        designation: formDesignation,
        genderCategory: formGenderCategory,
        email: formEmail.trim() || `${cleanUsername}@hostel.edu`,
        phone: formPhone.trim() || '+91 98000 11111',
        role: formRole,
        active: true,
        permissions: formRole === 'admin' ? ['all'] : ['pos.read', 'pos.write', 'shifts.read'],
      });

      if (res.success) {
        setIsModalOpen(false);
      } else if (res.error) {
        setFormError(res.error);
      }
    }
  };

  const handleSimulateResetPassword = (user: User) => {
    setResettingUser(user);
    setTimeout(() => {
      addToast(
        'success',
        'Temporary Password Dispatched',
        `Secure reset instruction dispatched to ${user.email} (Username: ${user.username})`
      );
      setResettingUser(null);
    }, 600);
  };

  // Helper badge color for Category
  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case "Men's Hostel":
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case "Men's Mess":
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case "Women's Mess":
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case "Men's PG":
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case "Women's Hostel / PG":
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            User Accounts &amp; Access Control
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Role-Based Access Control (RBAC) &middot; Manage Men's / Women's Hostel &amp; Mess Cashier Accounts &amp; Customize User IDs
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Cashier / Staff</span>
        </button>
      </div>

      {/* Category Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Personnel</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</div>
          <span className="text-[10px] text-slate-400">Active system accounts</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-indigo-100 shadow-xs bg-gradient-to-br from-indigo-50/50 to-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-indigo-700 uppercase">Men's Mess</span>
            <UtensilsCrossed className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-900 mt-1">{stats.mensMessCashiers}</div>
          <span className="text-[10px] text-indigo-500">Mess Dining Cashiers</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-blue-100 shadow-xs bg-gradient-to-br from-blue-50/50 to-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-blue-700 uppercase">Men's Hostel</span>
            <Home className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-900 mt-1">{stats.mensHostelCashiers}</div>
          <span className="text-[10px] text-blue-500">Hostel &amp; PG Cashiers</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-rose-100 shadow-xs bg-gradient-to-br from-rose-50/50 to-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-700 uppercase">Women's Mess</span>
            <UtensilsCrossed className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-900 mt-1">{stats.womensMessCashiers}</div>
          <span className="text-[10px] text-rose-500">Women's Counter Staff</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-600 uppercase">Administrators</span>
            <Shield className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{stats.admins}</div>
          <span className="text-[10px] text-slate-400">Full System Access</span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, Username or Name..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="text-[11px] font-medium text-slate-500">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Facilities</option>
                <option value="Men's Mess">Men's Mess</option>
                <option value="Men's Hostel">Men's Hostel</option>
                <option value="Women's Mess">Women's Mess</option>
                <option value="Men's PG">Men's PG</option>
                <option value="General / Central">General / Central</option>
              </select>
            </div>

            {/* Designation Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="text-[11px] font-medium text-slate-500">Designation:</span>
              <select
                value={designationFilter}
                onChange={(e) => setDesignationFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Designations</option>
                <option value="Men's Mess Cashier">Men's Mess Cashier</option>
                <option value="Men's Hostel Cashier">Men's Hostel Cashier</option>
                <option value="Women's Mess Cashier">Women's Mess Cashier</option>
                <option value="System Administrator">System Administrator</option>
              </select>
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="cashier">Cashiers</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                <th className="py-3.5 px-4">User ID &amp; Login Handle</th>
                <th className="py-3.5 px-4">Personnel Name</th>
                <th className="py-3.5 px-4">Facility Category</th>
                <th className="py-3.5 px-4">Assigned Role &amp; Designation</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Activity</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No users matching current search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* User ID and Username */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                          {user.id}
                        </span>
                        {user.id === currentUser.id && (
                          <span className="text-[9px] bg-blue-100 text-blue-700 px-1 py-0.2 rounded font-semibold uppercase">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        @{user.username}
                      </div>
                    </td>

                    {/* Personnel Name & Contacts */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{user.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {user.email} &middot; {user.phone}
                      </div>
                    </td>

                    {/* Facility Category & Gender */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getCategoryBadge(
                            user.category
                          )}`}
                        >
                          {user.category || "Men's Mess"}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[9px] font-semibold">
                          {user.genderCategory || 'Men'}
                        </span>
                      </div>
                    </td>

                    {/* Assigned Role & Designation */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">
                        {user.designation || (user.role === 'admin' ? 'System Administrator' : "Men's Mess Cashier")}
                      </div>
                      <div className="mt-0.5">
                        <span
                          className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider font-mono ${
                            user.role === 'admin'
                              ? 'bg-slate-900 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-slate-400'}`}
                        />
                        {user.active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    {/* Last Login */}
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {formatDateTime(user.lastLogin)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleSimulateResetPassword(user)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Simulate password reset link dispatch"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit User ID, Username, Category & Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeactivatingUser(user)}
                          disabled={user.id === currentUser.id}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30"
                          title={user.active ? 'Deactivate account' : 'Activate account'}
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
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingUser ? `Edit Account & Credentials` : 'Create System Cashier / Staff'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  User ID and Username can be customized as requested by administration
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* User ID & Username (CHANGEABLE / EDITABLE!) */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Customizable Identifiers (Editable)
                  </span>
                  <button
                    type="button"
                    onClick={handleGenerateId}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-2"
                  >
                    Suggest ID
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* User ID Input - EDITABLE! */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      User ID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formId}
                      onChange={(e) => setFormId(e.target.value)}
                      placeholder="e.g. USR-MENS-01"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold bg-white text-slate-900"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Custom ID for this account
                    </span>
                  </div>

                  {/* Username Input - EDITABLE! */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Username <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      placeholder="e.g. mens_cashier"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono bg-white text-slate-900"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Login handle for sign-in
                    </span>
                  </div>
                </div>
              </div>

              {/* Personnel Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Personnel Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Facility Category & Gender Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Category: Men's Hostel / Men's Mess / Women's Mess / Men's PG */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Facility / Branch Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => handleCategoryChange(e.target.value as FacilityCategory)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Gender / Wing Target */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender / Wing Target
                  </label>
                  <select
                    value={formGenderCategory}
                    onChange={(e) => setFormGenderCategory(e.target.value as GenderCategory)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="Men">Men (Men's Wing)</option>
                    <option value="Women">Women (Women's Wing)</option>
                    <option value="Co-ed">Co-ed / All</option>
                  </select>
                </div>
              </div>

              {/* Cashier Designation & System Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Counter Designation: Men's Hostel Cashier / Men's Mess Cashier / Women's Mess Cashier */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Counter Designation <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value as CashierDesignation)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    {DESIGNATION_OPTIONS.map((desig) => (
                      <option key={desig} value={desig}>
                        {desig}
                      </option>
                    ))}
                  </select>
                </div>

                {/* System Role */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    System Role
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole;
                      setFormRole(newRole);
                      if (newRole === 'admin') {
                        setFormDesignation('System Administrator');
                      } else if (formDesignation === 'System Administrator') {
                        setFormDesignation("Men's Mess Cashier");
                      }
                    }}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="cashier">Cashier (POS &amp; Shifts)</option>
                    <option value="admin">Administrator (Full Control)</option>
                  </select>
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="name@hostel.edu"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm transition-colors"
                >
                  {editingUser ? 'Save Updates' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate confirmation modal */}
      {deactivatingUser && (
        <ConfirmModal
          isOpen={!!deactivatingUser}
          title={deactivatingUser.active ? `Deactivate User ${deactivatingUser.name}?` : `Activate User ${deactivatingUser.name}?`}
          message={`Are you sure you want to ${deactivatingUser.active ? 'deactivate' : 'activate'} this user account (${deactivatingUser.username})? ${
            deactivatingUser.active
              ? 'They will be prevented from logging in to the POS terminal until re-enabled.'
              : 'They will immediately regain terminal access.'
          }`}
          confirmLabel={deactivatingUser.active ? 'Confirm Deactivation' : 'Confirm Activation'}
          variant={deactivatingUser.active ? 'danger' : 'primary'}
          onConfirm={() => {
            toggleUserStatus(deactivatingUser.id);
            setDeactivatingUser(null);
          }}
          onCancel={() => setDeactivatingUser(null)}
        />
      )}
    </div>
  );
};
