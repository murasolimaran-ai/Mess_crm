import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMess } from '../store/MessContext';
import {
  Utensils,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Phone,
  KeyRound,
  UserCheck,
  Building,
  HelpCircle,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginStudent, activateStudentAccount, state } = useMess();
  const navigate = useNavigate();

  // Mode: 'staff' | 'student'
  const [activeTab, setActiveTab] = useState<'staff' | 'student'>('staff');

  // Staff Form State
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Student Form State
  const [studentMode, setStudentMode] = useState<'signin' | 'activate'>('signin');
  const [studentId, setStudentId] = useState('STU-001');
  const [studentPass, setStudentPass] = useState('+91 98765 43210');
  const [studentSuccessMsg, setStudentSuccessMsg] = useState('');

  // Handle Staff Login
  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStudentSuccessMsg('');

    if (!username.trim()) {
      setError('Username / User ID is required.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const success = login(username.trim(), password);
      setLoading(false);

      if (success) {
        const found = state.users.find(
          (u) =>
            u.username.toLowerCase() === username.trim().toLowerCase() ||
            u.id.toLowerCase() === username.trim().toLowerCase()
        );
        if (found?.role === 'cashier') {
          navigate('/billing');
        } else if (found?.role === 'student') {
          navigate('/student-portal');
        } else {
          navigate('/');
        }
      } else {
        setError(`User "${username}" not found or inactive. Choose one of the demo credentials below.`);
      }
    }, 250);
  };

  // Handle Student Login
  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStudentSuccessMsg('');

    if (!studentId.trim()) {
      setError('Student ID is required (e.g. STU-001).');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (studentMode === 'activate') {
        // First-time activation: auto generates password based on registered phone number
        const res = activateStudentAccount(studentId.trim());
        setLoading(false);
        if (res.success && res.student) {
          setStudentSuccessMsg(
            `Portal Activated! Welcome ${res.student.name}. Your default password has been set to your registered mobile number (${res.student.phone}). Redirecting...`
          );
          setTimeout(() => {
            navigate('/student-portal');
          }, 900);
        } else {
          setError(res.error || 'Activation failed. Please verify your Student ID.');
        }
      } else {
        // Standard student sign-in
        if (!studentPass.trim()) {
          setLoading(false);
          setError('Password or registered phone number is required.');
          return;
        }

        const res = loginStudent(studentId.trim(), studentPass.trim());
        setLoading(false);
        if (res.success) {
          navigate('/student-portal');
        } else {
          setError(res.error || 'Invalid Student ID or password.');
        }
      }
    }, 250);
  };

  const handleSelectStaffDemo = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
    setStudentSuccessMsg('');
  };

  const handleSelectStudentDemo = (sId: string, phone: string) => {
    setStudentId(sId);
    setStudentPass(phone);
    setStudentMode('signin');
    setError('');
    setStudentSuccessMsg('');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 antialiased">
      <div className="max-w-md w-full">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-500/20 mb-3">
            <Utensils className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Kavery Central Mess ERP
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Hostel Dining, POS Billing &amp; Student Self-Service Portal
          </p>
        </div>

        {/* Tab Switcher: Staff vs Student */}
        <div className="bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700 mb-4 flex items-center gap-1 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setActiveTab('staff');
              setError('');
              setStudentSuccessMsg('');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'staff'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Staff &amp; Cashiers</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('student');
              setError('');
              setStudentSuccessMsg('');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'student'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Portal (மாணவர்)</span>
          </button>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {studentSuccessMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{studentSuccessMsg}</span>
            </div>
          )}

          {activeTab === 'staff' ? (
            /* Staff / Cashier / Admin Login */
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900">Sign In to Mess Terminal</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your credentials or choose a quick 1-click demo persona
                </p>
              </div>

              <form onSubmit={handleStaffSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Username / User ID
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="e.g. admin or USR-MENS-01"
                      className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-xs pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                    />
                    <span>Remember this terminal</span>
                  </label>

                  <span className="text-slate-400 text-[11px]">Staff Terminal</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl text-xs transition-colors shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In to Terminal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Staff 1-Click Personas */}
              <div className="mt-6 pt-5 border-t border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                  Select Staff Persona (1-Click)
                </span>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleSelectStaffDemo('admin', 'admin123')}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      username === 'admin'
                        ? 'border-blue-600 bg-blue-50 text-blue-950 font-semibold ring-1 ring-blue-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>admin</span>
                        <span className="text-[10px] bg-blue-700 text-white px-1.5 py-0.2 rounded font-mono uppercase">
                          Admin
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Dr. R. Ramanathan &middot; System Administrator (Full Access)
                      </div>
                    </div>
                    {username === 'admin' && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectStaffDemo('cashier1', 'cashier123')}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      username === 'cashier1'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-semibold ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>cashier1</span>
                        <span className="text-[10px] bg-indigo-700 text-white px-1.5 py-0.2 rounded font-mono uppercase">
                          Men's Mess
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Ramesh Kumar &middot; Men's Mess Cashier (ID: USR-MENS-01)
                      </div>
                    </div>
                    {username === 'cashier1' && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectStaffDemo('cashier2', 'cashier123')}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      username === 'cashier2'
                        ? 'border-blue-600 bg-blue-50 text-blue-950 font-semibold ring-1 ring-blue-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>cashier2</span>
                        <span className="text-[10px] bg-blue-700 text-white px-1.5 py-0.2 rounded font-mono uppercase">
                          Men's Hostel
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Suresh Patil &middot; Men's Hostel Cashier (ID: USR-MENS-02)
                      </div>
                    </div>
                    {username === 'cashier2' && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectStaffDemo('cashier3', 'cashier123')}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      username === 'cashier3'
                        ? 'border-rose-600 bg-rose-50 text-rose-950 font-semibold ring-1 ring-rose-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>cashier3</span>
                        <span className="text-[10px] bg-rose-700 text-white px-1.5 py-0.2 rounded font-mono uppercase">
                          Women's Mess
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Priya Sharma &middot; Women's Mess Cashier (ID: USR-WMNS-01)
                      </div>
                    </div>
                    {username === 'cashier3' && <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Student Self-Service Login */
            <div>
              <div className="mb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Student Mess Portal</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      View your meal orders, dues, &amp; make online payments
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Read-Only &amp; Pay
                  </span>
                </div>
              </div>

              {/* Sub Mode: Sign In vs 1st Time Activation */}
              <div className="flex rounded-xl bg-slate-100 p-1 mb-4 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setStudentMode('signin');
                    setError('');
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-colors ${
                    studentMode === 'signin'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Student Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStudentMode('activate');
                    setError('');
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                    studentMode === 'activate'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>New User 1st Time</span>
                </button>
              </div>

              {studentMode === 'activate' ? (
                /* First-Time User Activation */
                <form onSubmit={handleStudentSubmit} className="space-y-4">
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
                    <p className="font-bold flex items-center gap-1.5 mb-1 text-emerald-950">
                      <KeyRound className="w-4 h-4 text-emerald-700" />
                      <span>First-Time Account Activation</span>
                    </p>
                    <p className="text-[11px] text-emerald-800">
                      Enter your Student ID below. Your account password will be automatically initialized using your registered mobile number for secure instant access.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Student ID (Roll Number)
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                        placeholder="e.g. STU-001 or STU-002"
                        className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl text-xs transition-colors shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Activating Account...' : 'Generate Password & Activate'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* Standard Student Sign In */
                <form onSubmit={handleStudentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Student ID / Roll No.
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                        placeholder="e.g. STU-001"
                        className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Password or Mobile Number
                      </label>
                      <span className="text-[11px] text-slate-400">Default: Mobile No.</span>
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={studentPass}
                        onChange={(e) => setStudentPass(e.target.value)}
                        placeholder="Registered mobile or password"
                        className="w-full text-xs pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl text-xs transition-colors shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Authenticating...' : 'Sign In to Student Portal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Student Demo Quick Pickers */}
              <div className="mt-6 pt-5 border-t border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                  Sample Student Accounts (1-Click Demo)
                </span>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleSelectStudentDemo('STU-001', '+91 98765 43210')}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      studentId === 'STU-001'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span className="font-mono text-emerald-800">STU-001</span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-medium">
                          Men's Hostel
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Rahul Sharma &middot; Room B-204 &middot; Pending Due: ₹1,420
                      </div>
                    </div>
                    {studentId === 'STU-001' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectStudentDemo('STU-003', '+91 98765 43212')}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      studentId === 'STU-003'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span className="font-mono text-emerald-800">STU-003</span>
                        <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-medium">
                          Women's Mess
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Ananya Rao &middot; Room G-102 &middot; Pending Due: ₹680
                      </div>
                    </div>
                    {studentId === 'STU-003' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security & Access Notice */}
        <p className="text-center text-slate-400 text-xs mt-6 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Role-Based Access Control Active &middot; Strict Student Privacy Enforced</span>
        </p>
      </div>
    </div>
  );
};
