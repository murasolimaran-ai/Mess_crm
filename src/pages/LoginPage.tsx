import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMess } from '../store/MessContext';
import {
  Utensils,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Info,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, state } = useMess();
  const navigate = useNavigate();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username is required.');
      return;
    }
    if (!password.trim()) {
      setError('Password is required.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // In demo mode: accept admin123 / cashier123 or any password for configured demo users
      const user = state.users.find(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase()
      );

      if (!user) {
        setError(`User "${username}" not found. Try one of the demo credentials below.`);
        setLoading(false);
        return;
      }

      if (!user.active) {
        setError('This user account is currently deactivated. Please contact the administrator.');
        setLoading(false);
        return;
      }

      const success = login(user.username);
      setLoading(false);

      if (success) {
        if (user.role === 'cashier') {
          navigate('/billing');
        } else {
          navigate('/');
        }
      }
    }, 300);
  };

  const handleSelectDemo = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 antialiased">
      <div className="max-w-md w-full">
        {/* Brand Card */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-500/20 mb-3">
            <Utensils className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Kavery Hostel Mess
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise Campus Dining &amp; Smart POS Billing System
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Sign in to Terminal</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter authorized personnel credentials to access mess POS
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
              <span className="font-bold">Error:</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username / Terminal ID
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
                  placeholder="e.g. admin or cashier1"
                  className="w-full text-sm pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Secret Passcode / PIN
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="••••••••"
                  className="w-full text-sm pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>Remember this terminal</span>
              </label>
              <span className="text-slate-400">Shift Active: 2026-IST</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl text-sm transition-colors shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Account Quick Pickers */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Demo Accounts (Click to Fill)
              </span>
              <span className="text-[10px] text-blue-600 font-medium">Quick switch</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleSelectDemo('admin', 'admin123')}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  username === 'admin'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-900'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <span>admin / admin123</span>
                    <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.2 rounded font-mono uppercase">
                      Admin Role
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Dr. Ramanathan · Full access to all 12 modules &amp; reports
                  </div>
                </div>
                {username === 'admin' && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemo('cashier1', 'cashier123')}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  username === 'cashier1'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-900'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <span>cashier1 / cashier123</span>
                    <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-mono uppercase">
                      Morning POS
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Ramesh Kumar · Fast billing, cart &amp; active shift
                  </div>
                </div>
                {username === 'cashier1' && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemo('cashier2', 'cashier123')}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  username === 'cashier2'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-900'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <span>cashier2 / cashier123</span>
                    <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-mono uppercase">
                      Evening POS
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Suresh Patil · Dinner rush billing &amp; drawer balance
                  </div>
                </div>
                {username === 'cashier2' && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
              </button>
            </div>
          </div>
        </div>

        {/* Backend Note */}
        <div className="mt-4 p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 text-[11px] text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-300">FastAPI Architecture Note:</span> In production, credentials will be verified via bcrypt hashes against PostgreSQL with JWT access tokens issued by <code className="text-blue-300 font-mono">POST /api/auth/login</code>.
          </div>
        </div>
      </div>
    </div>
  );
};
