import React, { useState } from 'react';
import { useMess } from '../store/MessContext';
import { User, UserRole } from '../types';
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
} from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const { state, currentUser, addUser, updateUser, toggleUserStatus, addToast } = useMess();

  const isAdmin = currentUser.role === 'admin';

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Deactivate confirmation modal
  const [deactivatingUser, setDeactivatingUser] = useState<User | null>(null);

  // Form State
  const [formUsername, setFormUsername] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('cashier');
  const [formError, setFormError] = useState('');

  // Password reset simulation modal
  const [resettingUser, setResettingUser] = useState<User | null>(null);

  if (!isAdmin) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Access Restricted</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          User administration is restricted to System Administrators. Cashier accounts cannot modify personnel or roles.
        </p>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormUsername('');
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('cashier');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormUsername(user.username);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPhone(user.phone);
    setFormRole(user.role);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim()) {
      setFormError('Username is required.');
      return;
    }
    if (!formName.trim()) {
      setFormError('Full name is required.');
      return;
    }

    if (editingUser) {
      updateUser(editingUser.id, {
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        role: formRole,
      });
      setIsModalOpen(false);
    } else {
      const res = addUser({
        username: formUsername.trim().toLowerCase(),
        name: formName.trim(),
        email: formEmail.trim() || `${formUsername.toLowerCase()}@hostel.edu`,
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
        `Secure reset instruction dispatched to ${user.email} (FastAPI Auth Service Simulation)`
      );
      setResettingUser(null);
    }, 600);
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
            Role-Based Access Control (RBAC) &middot; Manage cashiers and administrator permissions
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add System User</span>
        </button>
      </div>

      {/* Permissions Matrix Callout */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 space-y-1">
        <div className="font-bold flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-blue-600" />
          <span>Role Permission Summary:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-[11px] text-blue-800">
          <div>
            <strong>Administrator:</strong> Unrestricted access to all 12 modules, inventory adjustment, refunds, staff creation, rate changes &amp; reports.
          </div>
          <div>
            <strong>Cashier:</strong> Streamlined billing POS, student search, invoice receipt generation, and active cash drawer reconciliation.
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Username / ID</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{user.name}</div>
                    <div className="text-[11px] text-slate-500">{user.email} &middot; {user.phone}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{user.username}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono ${
                        user.role === 'admin'
                          ? 'bg-slate-900 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        user.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {user.active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                    {formatDateTime(user.lastLogin)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleSimulateResetPassword(user)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Simulate password reset link dispatch"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit profile"
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {editingUser ? `Edit Account: ${editingUser.name}` : 'Create System Personnel'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={!!editingUser}
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="e.g. cashier3"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Personnel Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Mohan Verma"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="cashier">Cashier</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="name@hostel.edu"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-xs"
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
          message={`Are you sure you want to ${deactivatingUser.active ? 'deactivate' : 'activate'} this user account? ${
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
