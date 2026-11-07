import React, { useState } from 'react';
import { 
  Pill, 
  Lock, 
  Mail, 
  AlertCircle, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  ShieldCheck, 
  Package, 
  CheckCircle2,
  Clock,
  Activity,
  Layers
} from 'lucide-react';
import api from '../services/api';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@pharmaflow.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { user, token } = res.data.data;
        localStorage.setItem('pharmaflow_token', token);
        localStorage.setItem('pharmaflow_user', JSON.stringify(user));
        onLoginSuccess(user, token);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F6F8FB] overflow-hidden">
      {/* LEFT PANEL: Authentication Card (45% Width on Desktop) */}
      <div className="w-full lg:w-[45%] flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16 bg-white border-r border-slate-200/80 shadow-subtle z-10">
        {/* Top Header & Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-accent shadow-md shadow-primary/20">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-extrabold tracking-tight text-primary">PharmaFlow</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                Enterprise
              </span>
            </div>
            <p className="text-[11px] font-medium text-textSecondary">Smart Pharmacy Management System</p>
          </div>
        </div>

        {/* Center: Main Login Form */}
        <div className="max-w-md w-full mx-auto my-8 space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
              Sign In
            </h1>
            <p className="text-sm text-textSecondary">
              Enter your credentials to access your pharmacy operations console.
            </p>
          </div>

          {/* Quick Demo Autofill Selector */}
          <div className="p-3.5 bg-slatebg rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-textPrimary">Quick Demo Accounts</span>
              <span className="text-[11px] text-textSecondary">Click to autofill</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('admin@pharmaflow.com', 'admin123')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                  email === 'admin@pharmaflow.com'
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white border-slate-200 text-textPrimary hover:bg-slate-50'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('pharmacist@pharmaflow.com', 'password123')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                  email === 'pharmacist@pharmaflow.com'
                    ? 'bg-secondary text-white border-secondary shadow-sm'
                    : 'bg-white border-slate-200 text-textPrimary hover:bg-slate-50'
                }`}
              >
                Pharmacist
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('cashier@pharmaflow.com', 'password123')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                  email === 'cashier@pharmaflow.com'
                    ? 'bg-accent text-white border-accent shadow-sm'
                    : 'bg-white border-slate-200 text-textPrimary hover:bg-slate-50'
                }`}
              >
                Cashier
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-textPrimary mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="name@pharmacy.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-textPrimary placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-textPrimary mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-textPrimary placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-textPrimary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 cursor-pointer text-textSecondary">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-secondary focus:ring-secondary"
                />
                <span>Remember this workstation</span>
              </label>
              <span className="text-secondary hover:underline cursor-pointer font-medium">
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-light text-white font-semibold rounded-xl text-sm shadow-md shadow-primary/20 hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                <>
                  <span>Sign In to Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-textSecondary">
          <span>ALGIONS AI LABS ASSESSMENT</span>
          <span className="flex items-center space-x-1 text-accent font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>256-Bit TLS Secured</span>
          </span>
        </div>
      </div>

      {/* RIGHT PANEL: Live Pharmacy SaaS Dashboard Preview (55% Width on Desktop) */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-12 bg-gradient-to-br from-[#102B46] via-[#14375A] to-[#0A1C2E] text-white overflow-hidden">
        {/* Subtle decorative background circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

        {/* Right Top Title */}
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-accent-light border border-white/10 mb-3">
              <Activity className="w-3.5 h-3.5" />
              <span>Next-Gen Pharmacy OS</span>
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Intelligent Inventory, POS & Regulatory Compliance
            </h2>
          </div>
        </div>

        {/* Right Middle: Interactive Mock Showcase Card */}
        <div className="relative z-10 my-8 space-y-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 shadow-2xl space-y-6">
            {/* Header of preview card */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center text-accent-light font-bold">
                  Rx
                </div>
                <div>
                  <h4 className="text-sm font-bold">Apollo Care Center Branch #04</h4>
                  <p className="text-xs text-slate-300">Live Telemetry & FEFO Allocation</p>
                </div>
              </div>
              <span className="flex items-center space-x-1 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full font-medium border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>99.98% System Uptime</span>
              </span>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <span className="text-[11px] text-slate-300">Today's Sales</span>
                <div className="text-lg font-bold text-white mt-0.5">₹48,250.00</div>
                <div className="text-[10px] text-emerald-400 flex items-center space-x-0.5 mt-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>+14.2% vs yesterday</span>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <span className="text-[11px] text-slate-300">FEFO Batches</span>
                <div className="text-lg font-bold text-accent-light mt-0.5">142 Active</div>
                <div className="text-[10px] text-slate-300 mt-0.5">0 Expired sold</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <span className="text-[11px] text-slate-300">Prescriptions</span>
                <div className="text-lg font-bold text-white mt-0.5">28 Fulfilled</div>
                <div className="text-[10px] text-slate-300 mt-0.5">100% Audit logged</div>
              </div>
            </div>

            {/* Simulated Live Top-Selling Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold px-1">
                <span>Top Fast-Moving Medicines</span>
                <span>FEFO Expiry Order</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl text-xs border border-white/5">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
                      D
                    </div>
                    <div>
                      <div className="font-semibold text-white">Dolo 650mg</div>
                      <div className="text-[10px] text-slate-400 font-mono">Batch: DOL-2023-FEFO</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-emerald-400">192 Units Sold</span>
                    <p className="text-[10px] text-slate-400">Exp: Dec 2026</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl text-xs border border-white/5">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                      A
                    </div>
                    <div>
                      <div className="font-semibold text-white">Augmentin 625 Duo</div>
                      <div className="text-[10px] text-slate-400 font-mono">Batch: AUG-2024-01</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-emerald-400">84 Units Sold</span>
                    <p className="text-[10px] text-slate-400">Exp: Nov 2027</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Bottom Feature Badges */}
        <div className="relative z-10 grid grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-accent" />
            <span>Strict FEFO Policy</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-accent" />
            <span>Zero-Negative Inventory</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-accent" />
            <span>Immutable Audit Trail</span>
          </div>
        </div>
      </div>
    </div>
  );
};
