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
  Activity
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
    <div className="h-screen w-full relative flex items-center justify-center p-3 sm:p-6 md:p-8 lg:p-10 overflow-hidden bg-slate-900 select-none">
      
      {/* Blurred Ambient Pharmacy Background matching photo presentation */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter blur-xl scale-110 opacity-60"
        style={{ backgroundImage: `url('/doctor-pills-hand.jpg')` }}
      />
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-2xl" />

      {/* Main Curved White Modal Card (Exact geometry and aesthetic from HiHealth design) */}
      <div className="relative z-10 w-full max-w-6xl h-full max-h-[760px] bg-white rounded-[32px] sm:rounded-[40px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col lg:flex-row border border-white/60">
        
        {/* ========================================================= */}
        {/* LEFT SIDE: Doctor / Clinical Pharmacy Image (Swapped to Left) */}
        {/* ========================================================= */}
        <div className="hidden lg:block lg:w-1/2 h-full relative overflow-hidden bg-slate-100">
          <img 
            src="/doctor-pills-hand.jpg" 
            alt="Doctor Holding Pharmaceutical Capsules with Stethoscope"
            className="w-full h-full object-cover object-center filter brightness-[1.02] contrast-[1.03]"
          />
          {/* Subtle gradient vignette blending toward inner divider */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/20 pointer-events-none" />

          {/* Floating Live Pharmaceutical Intelligence Badge */}
          <div className="absolute bottom-8 left-8 right-8 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/80 shadow-lg">
            <div className="flex items-center space-x-3 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-900">Automated FEFO Batch Intelligence</span>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                21 CFR Part 11
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              Eliminate medication dispensing risks, prevent expired inventory losses, and maintain a mathematically verified zero-discrepancy stock ledger.
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT SIDE: Elegant Sign-In Form (Exact HiHealth Design System) */}
        {/* ========================================================= */}
        <div className="w-full lg:w-1/2 h-full p-8 sm:p-12 xl:p-16 flex flex-col justify-between overflow-y-auto bg-white">
          
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-md border border-slate-200 overflow-hidden flex-shrink-0">
                <img 
                  src="/pharmaflow-logo.png" 
                  alt="PharmaFlow Capsule Logo" 
                  className="w-full h-full object-contain scale-110 drop-shadow-[0_2px_6px_rgba(59,104,233,0.4)]"
                />
              </div>
              <div>
                <span className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                  PharmaFlow
                  <span className="text-[9px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                    PRO
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-[11px] uppercase tracking-wider">Gateway Secure</span>
            </div>
          </div>

          {/* Form Core */}
          <div className="my-auto py-4 max-w-sm w-full mx-auto">
            
            {/* Title & Subtitle matching HiHealth reference */}
            <div className="text-center space-y-1.5 mb-7">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome back
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                Smart pharmacy management and clinical dispensing terminal
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 pr-11 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="mt-1.5">
                  <span className="text-xs font-semibold text-[#0ea5e9] hover:underline cursor-pointer">
                    forgot password?
                  </span>
                </div>
              </div>

              {/* Pill-shaped Blue Button (Exact HiHealth Style) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded-full text-sm shadow-[0_8px_20px_rgba(14,165,233,0.35)] transition-all flex items-center justify-center space-x-2 mt-4 cursor-pointer active:scale-[0.99]"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <span>Login account</span>
                )}
              </button>

              <div className="text-center text-xs text-slate-500 font-medium pt-1">
                Don't you have any account?{' '}
                <span className="text-[#0ea5e9] font-bold hover:underline cursor-pointer">
                  Sign up
                </span>
              </div>
            </form>

            {/* OR Divider from HiHealth Design */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  OR
                </span>
              </div>
            </div>

            {/* Quick Demo Access Buttons matching the Google-pill border button */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span>Instant Demo Access</span>
                <span className="text-[#0ea5e9]">One-Click Fill</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('admin@pharmaflow.com', 'AdminPassword123!')}
                  className={`py-2 px-2.5 rounded-full text-xs font-bold border transition-all text-center cursor-pointer ${
                    email === 'admin@pharmaflow.com'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Admin
                </button>

                <button
                  type="button"
                  onClick={() => handleFillDemo('pharmacist@pharmaflow.com', 'PharmPassword123!')}
                  className={`py-2 px-2.5 rounded-full text-xs font-bold border transition-all text-center cursor-pointer ${
                    email === 'pharmacist@pharmaflow.com'
                      ? 'bg-[#0ea5e9] text-white border-[#0ea5e9] shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Pharmacist
                </button>

                <button
                  type="button"
                  onClick={() => handleFillDemo('cashier@pharmaflow.com', 'CashierPassword123!')}
                  className={`py-2 px-2.5 rounded-full text-xs font-bold border transition-all text-center cursor-pointer ${
                    email === 'cashier@pharmaflow.com'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Cashier
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Footer */}
          <div className="text-[11px] font-medium text-slate-400 text-center pt-4 border-t border-slate-100">
            PharmaFlow Smart Pharmacy System • ALGIONS AI LABS Assessment
          </div>

        </div>

      </div>

    </div>
  );
};
