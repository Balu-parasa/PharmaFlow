import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Clock,
  FileCheck2,
  Cpu,
  BadgeAlert
} from 'lucide-react';
import api from '../services/api';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@pharmaflow.com');
  const [password, setPassword] = useState('AdminPassword123!');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="h-screen w-full flex flex-col lg:flex-row bg-[#08111B] text-slate-100 overflow-hidden selection:bg-primary selection:text-white">
      
      {/* ========================================================= */}
      {/* LEFT PANEL: 50% Exact Width - Clinical Intelligence Showcase */}
      {/* ========================================================= */}
      <div className="w-full lg:w-1/2 h-full p-6 sm:p-8 xl:p-10 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#0B1724] via-[#0D1E30] to-[#07101B] border-b lg:border-b-0 lg:border-r border-slate-800/80">
        
        {/* Subtle Architectural Glows & Background Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,104,233,0.18),rgba(255,255,255,0))]" />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 p-1.5 flex items-center justify-center shadow-md border border-white/15 backdrop-blur-md overflow-hidden flex-shrink-0">
              <img 
                src="/pharmaflow-logo.png" 
                alt="PharmaFlow Capsule Logo" 
                className="w-full h-full object-contain scale-110 drop-shadow-[0_2px_8px_rgba(59,104,233,0.5)]"
              />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-black text-white tracking-tight leading-none">PharmaFlow</span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Smart Pharmacy Management System</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[11px] font-semibold text-slate-300 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>21 CFR Part 11 Compliant</span>
          </div>
        </div>

        {/* Middle Feature Showcase */}
        <div className="relative z-10 my-auto py-3 max-w-xl">
          <div className="inline-flex items-center space-x-2 bg-primary/20 border border-primary/30 text-primary-light px-3 py-1 rounded-full text-[11px] font-bold mb-3.5 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-primary-light" />
            <span>Automated FEFO Intelligence & Real-Time Ledger</span>
          </div>

          <h2 className="text-2xl sm:text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
            Clinical Accuracy for <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              Modern Healthcare Pharmacies
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed font-normal">
            Eliminate medication dispensing risks, prevent expired inventory losses with First-Expiry-First-Out (FEFO) allocation, and maintain a mathematically verified zero-discrepancy stock ledger.
          </p>

          {/* 4 Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-5">
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-primary/40 backdrop-blur-md transition-all group">
              <div className="flex items-center space-x-2.5 mb-1.5">
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-white">Automated FEFO Engine</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Earliest-expiring batches are automatically prioritized at checkout, preventing drug shelf losses.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-emerald-500/40 backdrop-blur-md transition-all group">
              <div className="flex items-center space-x-2.5 mb-1.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <FileCheck2 className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-white">Double-Entry Stock Audit</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Restocks, sales, returns, and adjustments are logged with zero mathematical shrinkage.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-purple-500/40 backdrop-blur-md transition-all group">
              <div className="flex items-center space-x-2.5 mb-1.5">
                <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-white">Idempotent POS Billing</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Payload hashed idempotency keys prevent duplicate checkouts over unstable networks.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-amber-500/40 backdrop-blur-md transition-all group">
              <div className="flex items-center space-x-2.5 mb-1.5">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <BadgeAlert className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-white">Quarantine & Expiry Guard</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Expired and recalled medications are strictly quarantined with hard system-level billing blocks.
              </p>
            </div>
          </div>

          {/* Live Node Status Mini-Strip */}
          <div className="mt-4 p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between text-[11px] backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold text-slate-200">Production Node:</span>
              <span className="font-mono text-emerald-400">api.pharmaflow.internal</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-400 font-mono text-[10px]">
              <span>99.99% Uptime</span>
              <span className="text-emerald-400 font-bold">FEFO ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="relative z-10 flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 font-medium">
          <span>ALGIONS AI LABS Assessment</span>
          <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>256-Bit TLS Secured</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT PANEL: 50% Exact Width - Sign In Terminal */}
      {/* ========================================================= */}
      <div className="w-full lg:w-1/2 h-full p-6 sm:p-8 xl:p-10 flex flex-col justify-between bg-white text-slate-900 relative z-10 shadow-2xl">
        
        {/* Top Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Gateway Secure</span>
          </div>
          <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
            Version 2.4 Pro
          </span>
        </div>

        {/* Sign In Form Container */}
        <div className="my-auto py-2 max-w-sm w-full mx-auto">
          {/* Circular Icon */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-white mx-auto shadow-[0_8px_20px_rgba(59,104,233,0.3)] mb-4">
            <Mail className="w-5 h-5" />
          </div>

          <div className="text-center space-y-1 mb-5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Sign In
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Access your clinical pharmacy terminal
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@pharmaflow.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <span className="text-[10px] font-semibold text-slate-400 hover:text-primary cursor-pointer transition-colors">
                  Forgot Password?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-xs sm:text-sm shadow-[0_6px_16px_rgba(59,104,233,0.3)] transition-all flex items-center justify-center space-x-2 mt-1 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5">
                  <span>Sign In to Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </button>
          </form>

          {/* Quick Demo Role Selector */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2">
              Instant One-Click Demo Access
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('admin@pharmaflow.com', 'AdminPassword123!')}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                  email === 'admin@pharmaflow.com'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('pharmacist@pharmaflow.com', 'PharmPassword123!')}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                  email === 'pharmacist@pharmaflow.com'
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                }`}
              >
                Pharmacist
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('cashier@pharmaflow.com', 'CashierPassword123!')}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                  email === 'cashier@pharmaflow.com'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                }`}
              >
                Cashier
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="text-[10px] font-medium text-slate-400 text-center pt-3 border-t border-slate-100">
          Authorized personnel only. Protected by multi-factor cryptographic tokens.
        </div>
      </div>

    </div>
  );
};
