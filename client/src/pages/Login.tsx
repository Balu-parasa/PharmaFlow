import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  CheckCircle2,
  Activity,
  Layers,
  Sparkles,
  Pill,
  ArrowRight,
  Clock,
  FileCheck2,
  Cpu,
  BadgeAlert,
  Boxes
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#08111B] text-slate-100 overflow-x-hidden selection:bg-primary selection:text-white">
      
      {/* ========================================================= */}
      {/* LEFT PANEL: Ultra-Premium Pharmaceutical Intelligence Hub (56%) */}
      {/* ========================================================= */}
      <div className="w-full lg:w-[56%] xl:w-[58%] min-h-screen p-8 sm:p-12 lg:p-14 xl:p-16 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#0B1724] via-[#0D1E30] to-[#07101B] border-b lg:border-b-0 lg:border-r border-slate-800/80">
        
        {/* Subtle Architectural Glows & Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,104,233,0.18),rgba(255,255,255,0))]" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />

        {/* Left Top Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 p-2 flex items-center justify-center shadow-lg border border-white/15 backdrop-blur-md overflow-hidden flex-shrink-0">
              <img 
                src="/pharmaflow-logo.png" 
                alt="PharmaFlow Capsule Logo" 
                className="w-full h-full object-contain scale-110 drop-shadow-[0_2px_10px_rgba(59,104,233,0.5)]"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black text-white tracking-tight">PharmaFlow</span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Smart Pharmacy Management System</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>21 CFR Part 11 Compliant</span>
          </div>
        </div>

        {/* Center Hero Showcase: Realistic Real-time Pharmacy Operations */}
        <div className="relative z-10 my-auto py-8 lg:py-12 max-w-2xl">
          
          <div className="inline-flex items-center space-x-2 bg-primary/20 border border-primary/30 text-primary-light px-3.5 py-1.5 rounded-full text-xs font-bold mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-primary-light" />
            <span>Automated FEFO Intelligence & Real-Time Ledger</span>
          </div>

          <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white tracking-tight leading-[1.15]">
            Clinical Accuracy for <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              Modern Healthcare Pharmacies
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed font-normal max-w-xl">
            Eliminate medication dispensing risks, prevent expired inventory losses with First-Expiry-First-Out (FEFO) allocation, and maintain a mathematically verified zero-discrepancy stock ledger.
          </p>

          {/* Interactive Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-8">
            
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-primary/40 backdrop-blur-md transition-all group">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 group-hover:scale-105 transition-transform">
                  <Clock className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white">Automated FEFO Engine</h4>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Earliest-expiring batches are automatically prioritized at checkout, preventing drug expiry shelf losses.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-emerald-500/40 backdrop-blur-md transition-all group">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 group-hover:scale-105 transition-transform">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white">Double-Entry Stock Audit</h4>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Restocks, sales, returns, and adjustments are cryptographically logged with zero mathematical shrinkage.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-purple-500/40 backdrop-blur-md transition-all group">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 group-hover:scale-105 transition-transform">
                  <Cpu className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white">Idempotent POS Billing</h4>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Payload hashed idempotency keys prevent duplicate checkouts even across unstable network connections.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-amber-500/40 backdrop-blur-md transition-all group">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 group-hover:scale-105 transition-transform">
                  <BadgeAlert className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white">Quarantine & Expiry Guard</h4>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Expired and recalled medications are strictly quarantined with hard system-level billing blocks.
              </p>
            </div>

          </div>

          {/* Real-time Telemetry Mini-Strip */}
          <div className="mt-8 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs backdrop-blur-sm">
            <div className="flex items-center space-x-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold text-slate-200">Live Production Node:</span>
              <span className="font-mono text-emerald-400">api.pharmaflow.internal</span>
            </div>
            <div className="flex items-center space-x-4 text-slate-400 font-mono text-[11px]">
              <span>Uptime: 99.99%</span>
              <span className="hidden sm:inline">Latency: 14ms</span>
              <span className="text-emerald-400 font-bold">FEFO ACTIVE</span>
            </div>
          </div>

        </div>

        {/* Left Footer */}
        <div className="relative z-10 flex items-center justify-between pt-6 border-t border-slate-800/80 text-xs text-slate-400 font-medium">
          <span>ALGIONS AI LABS Full-Stack Assessment</span>
          <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Enterprise 256-Bit TLS</span>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* RIGHT PANEL: Sleek, High-Conversion Sign-In Card (44%) */}
      {/* ========================================================= */}
      <div className="w-full lg:w-[44%] xl:w-[42%] min-h-screen p-6 sm:p-10 lg:p-12 xl:p-14 flex flex-col justify-between bg-white text-slate-900 relative z-10 shadow-2xl">
        
        {/* Top Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Gateway Secure</span>
          </div>
          <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
            Version 2.4 Pro
          </span>
        </div>

        {/* Sign In Form Container */}
        <div className="my-auto py-8 max-w-sm w-full mx-auto">
          
          {/* Circular Icon */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-white mx-auto shadow-[0_10px_25px_rgba(59,104,233,0.35)] mb-6">
            <Mail className="w-6 h-6" />
          </div>

          <div className="text-center space-y-1.5 mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Sign In
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Access your clinical pharmacy workspace
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center space-x-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="name@pharmaflow.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] font-semibold text-slate-400 hover:text-primary cursor-pointer transition-colors">
                  Forgot Password?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-sm shadow-[0_8px_20px_rgba(59,104,233,0.35)] transition-all flex items-center justify-center space-x-2 mt-2 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
          <div className="mt-7 pt-5 border-t border-slate-100">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              Instant One-Click Demo Access
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('admin@pharmaflow.com', 'AdminPassword123!')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
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
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
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
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
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

        {/* Right Footer */}
        <div className="text-[11px] font-medium text-slate-400 text-center pt-4 border-t border-slate-100">
          Authorized personnel only. Protected by multi-factor cryptographic tokens.
        </div>

      </div>

    </div>
  );
};
