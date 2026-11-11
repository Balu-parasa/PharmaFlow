import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  CheckCircle2,
  Sparkles
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 relative bg-cover bg-center overflow-x-hidden"
         style={{ backgroundImage: `url('/doctor-pharmacy-hero.png')` }}>
      
      {/* Background Soft Backdrop Blur Overlay for realism */}
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md" />

      {/* Main Center White Card matching reference image exactly */}
      <div className="relative z-10 w-full max-w-[1020px] bg-white rounded-[32px] sm:rounded-[40px] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col md:flex-row border border-white/60">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: Clean Clinical Sign-In Form (50%) */}
        {/* ========================================================= */}
        <div className="w-full md:w-1/2 p-7 sm:p-10 lg:p-12 xl:p-14 flex flex-col justify-between bg-white relative z-10">
          
          {/* Top Brand Logo */}
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0284C7] to-[#0EA5E9] flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <span className="text-xl font-black leading-none">+</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-bold tracking-tight text-[#0EA5E9]">PharmaFlow</span>
              <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-200">
                PRO
              </span>
            </div>
          </div>

          {/* Form Middle Body */}
          <div className="my-auto py-6 max-w-sm w-full mx-auto">
            
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
                Welcome back
              </h1>
              <p className="text-xs text-slate-400 mt-1.5 font-medium">
                Smart pharmacy management & FEFO stock dispensation
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  placeholder="Enter your Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="mt-1 text-left">
                  <span className="text-[11px] font-semibold text-[#0EA5E9] hover:underline cursor-pointer">
                    forgot password?
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#0098FF] hover:bg-[#0086E6] text-white font-bold rounded-xl text-sm shadow-[0_6px_18px_rgba(0,152,255,0.35)] transition-all flex items-center justify-center space-x-2 mt-2 cursor-pointer active:scale-[0.99]"
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
            </form>

            <p className="text-[11px] text-slate-500 text-center mt-3 font-medium">
              Don't you have any account?{' '}
              <span className="text-[#0EA5E9] font-bold hover:underline cursor-pointer">
                Sign up
              </span>
            </p>

            {/* Divider OR */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="border-t border-slate-200 w-full absolute" />
              <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">
                OR
              </span>
            </div>

            {/* Instant Demo Role Switcher Buttons */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2">
                Instant Demo Access
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('admin@pharmaflow.com', 'admin123')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    email === 'admin@pharmaflow.com'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                  }`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('pharmacist@pharmaflow.com', 'password123')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    email === 'pharmacist@pharmaflow.com'
                      ? 'bg-[#0098FF] text-white border-[#0098FF] shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                  }`}
                >
                  Pharmacist
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('cashier@pharmaflow.com', 'password123')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
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

          {/* Left Footer */}
          <div className="pt-2 text-[10px] text-slate-400 text-center font-medium">
            21 CFR Part 11 Compliant • TLS 256-Bit Encrypted
          </div>

        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Realistic Clinical Doctor & Medication Photo (50%) */}
        {/* ========================================================= */}
        <div className="hidden md:block w-1/2 relative bg-slate-50 overflow-hidden">
          <img 
            src="/doctor-hero-isolated.png" 
            alt="Clinical Pharmacist Dispensing Medicine" 
            className="w-full h-full object-cover object-center"
          />

          {/* Floating Realistic Telemetry Pill Badges */}
          <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-white/80 max-w-[210px] space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-slate-800">FEFO Engine Active</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Earliest-expiring batch automatically allocated for patient safety.
            </p>
          </div>

          <div className="absolute bottom-6 left-6 bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-white/10 flex items-center space-x-3 text-white">
            <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-[#0EA5E9]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold">PharmaFlow Clinical Suite</p>
              <p className="text-[10px] text-slate-300">Zero Medication Dispense Errors</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
