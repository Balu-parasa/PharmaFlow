import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles,
  ArrowRight
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
    <div 
      className="h-screen w-screen flex items-center justify-center p-3 sm:p-5 relative bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url('/doctor-pharmacy-hero.png')` }}
    >
      {/* Background Soft Backdrop Blur Overlay for realism */}
      <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-md" />

      {/* Main Center White Card matching reference image with perfect viewport scaling */}
      <div className="relative z-10 w-full max-w-[880px] max-h-[92vh] bg-white rounded-[28px] sm:rounded-[36px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.35)] overflow-hidden flex flex-col md:flex-row border border-white/70">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: Clean Clinical Sign-In Form (50%) */}
        {/* ========================================================= */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-9 flex flex-col justify-between bg-white relative z-10 overflow-y-auto">
          
          {/* Top Brand Logo without PRO badge */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0284C7] to-[#0EA5E9] flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <span className="text-lg font-black leading-none">+</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#0EA5E9]">PharmaFlow</span>
          </div>

          {/* Form Middle Body */}
          <div className="my-auto py-3 max-w-[340px] w-full mx-auto">
            
            <div className="text-center mb-4">
              <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight leading-tight">
                Welcome back
              </h1>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                Order from different drugstores all around the country
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  placeholder="Enter your Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
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
                className="w-full py-2.5 bg-[#0098FF] hover:bg-[#0086E6] text-white font-bold rounded-xl text-xs sm:text-sm shadow-[0_6px_16px_rgba(0,152,255,0.3)] transition-all flex items-center justify-center space-x-2 mt-2 cursor-pointer active:scale-[0.99]"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <span>Login account</span>
                )}
              </button>
            </form>

            <p className="text-[11px] text-slate-500 text-center mt-2.5 font-medium">
              Don't you have any account?{' '}
              <span className="text-[#0EA5E9] font-bold hover:underline cursor-pointer">
                Sign up
              </span>
            </p>

            {/* Divider OR */}
            <div className="relative my-3 flex items-center justify-center">
              <div className="border-t border-slate-200 w-full absolute" />
              <span className="bg-white px-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest relative z-10">
                OR
              </span>
            </div>

            {/* Instant Demo Role Switcher Buttons */}
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 text-center mb-1.5">
                Instant Demo Access
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleFillDemo('admin@pharmaflow.com', 'admin123')}
                  className={`py-1.5 px-1.5 rounded-lg text-[11px] font-bold border transition-all text-center cursor-pointer ${
                    email === 'admin@pharmaflow.com'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                  }`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('pharmacist@pharmaflow.com', 'password123')}
                  className={`py-1.5 px-1.5 rounded-lg text-[11px] font-bold border transition-all text-center cursor-pointer ${
                    email === 'pharmacist@pharmaflow.com'
                      ? 'bg-[#0098FF] text-white border-[#0098FF] shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                  }`}
                >
                  Pharmacist
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('cashier@pharmaflow.com', 'password123')}
                  className={`py-1.5 px-1.5 rounded-lg text-[11px] font-bold border transition-all text-center cursor-pointer ${
                    email === 'cashier@pharmaflow.com'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
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
        {/* RIGHT COLUMN: Clean Doctor & Medicine Photo without Overlays */}
        {/* ========================================================= */}
        <div className="hidden md:block w-1/2 relative bg-slate-50 overflow-hidden select-none">
          <img 
            src="/doctor-hero-isolated.png" 
            alt="Clinical Pharmacist Dispensing Medicine" 
            className="w-full h-full object-cover object-center"
          />
        </div>

      </div>

    </div>
  );
};
