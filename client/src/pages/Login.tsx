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
  Layers,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  DollarSign,
  TrendingDown
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
  const [activeSlide, setActiveSlide] = useState(0);

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
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 md:p-12 lg:p-16 aurora-bg">
      {/* Outer Floating Master Canvas Card (Exactly like Screenshot) */}
      <div className="w-full max-w-[1240px] bg-white rounded-[28px] shadow-[0_25px_70px_rgba(30,27,75,0.25)] border border-white/60 overflow-hidden flex flex-col lg:flex-row min-h-[700px] transition-all">
        
        {/* ========================================================= */}
        {/* LEFT PANEL: Clean Modern Glass Auth Card (Approx 45%) */}
        {/* ========================================================= */}
        <div className="w-full lg:w-[46%] p-8 sm:p-12 lg:p-14 flex flex-col justify-between bg-white relative">
          
          {/* Subtle grid background on left */}
          <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />

          {/* Top Logo Bar */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md border border-slate-100 overflow-hidden flex-shrink-0">
                <img 
                  src="/pharmaflow-logo.png" 
                  alt="PharmaFlow Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tight">PharmaFlow</span>
            </div>
            <span className="text-[11px] font-bold text-primary bg-primary-light px-2.5 py-1 rounded-full uppercase tracking-wider">
              v2.4 Pro
            </span>
          </div>

          {/* Floating White Auth Card Inside Left */}
          <div className="relative z-10 my-auto py-6 max-w-[380px] w-full mx-auto">
            {/* Circular Glowing Icon (from screenshot) */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white mx-auto shadow-[0_10px_25px_rgba(59,104,233,0.35)] mb-6">
              <Mail className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1 mb-7">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Sign In
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Don't have an account? <span className="text-primary font-bold hover:underline cursor-pointer">Create now</span>
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all font-medium"
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
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all font-medium"
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
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-sm shadow-[0_8px_20px_rgba(59,104,233,0.35)] transition-all flex items-center justify-center space-x-2 mt-2"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Quick Demo Pill Selector */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
                Instant Demo Access
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('admin@pharmaflow.com', 'admin123')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
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
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                    email === 'pharmacist@pharmaflow.com'
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                  }`}
                >
                  Pharmacist
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('cashier@pharmaflow.com', 'password123')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
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
          <div className="relative z-10 text-[11px] font-semibold text-slate-400 flex items-center justify-between pt-4 border-t border-slate-100">
            <span>ALGIONS AI LABS ASSESSMENT</span>
            <span className="flex items-center space-x-1 text-emerald-600 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>TLS Secured 256-Bit</span>
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT PANEL: Authentic Pharmacy Telemetry Dashboard Preview */}
        {/* Matches reference screenshot cards: Graph Report Today, Top Selling, Over All Revenue */}
        {/* ========================================================= */}
        <div className="w-full lg:w-[54%] p-8 sm:p-12 lg:p-14 bg-slate-50/60 border-l border-slate-100 flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle Grid backdrop */}
          <div className="absolute inset-0 grid-pattern opacity-60 pointer-events-none" />

          {/* Right Top Header matching screenshot */}
          <div className="relative z-10 flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                💊
              </div>
              <span className="text-base font-extrabold text-slate-900">PharmaFlow Telemetry</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>FEFO Engine Online</span>
            </div>
          </div>

          {/* Cards Showcase Stack (Matching Screenshot Perfectly) */}
          <div className="relative z-10 space-y-4 my-auto">
            
            {/* Top Row: Graph Report Today + Top Selling Medicine */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              
              {/* 1. Graph Report Today (Stacked Bars from screenshot) */}
              <div className="sm:col-span-7 bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <h4 className="text-xs font-extrabold text-slate-800">Graph Report Today</h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">•••</span>
                </div>

                {/* Stacked Bars Diagram */}
                <div className="h-32 flex items-end justify-around pt-2 px-2 border-b border-slate-100">
                  {/* Bar 1: Purchases */}
                  <div className="flex flex-col items-center space-y-1.5 w-12">
                    <div className="w-8 flex flex-col space-y-1 items-center">
                      <div className="w-full h-3 bg-emerald-500 rounded-t-sm" />
                      <div className="w-full h-6 bg-amber-500" />
                      <div className="w-full h-12 bg-primary rounded-b-sm" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">Purchases</span>
                  </div>

                  {/* Bar 2: Suppliers */}
                  <div className="flex flex-col items-center space-y-1.5 w-12">
                    <div className="w-8 flex flex-col space-y-1 items-center">
                      <div className="w-full h-3 bg-emerald-500 rounded-t-sm" />
                      <div className="w-full h-5 bg-amber-500" />
                      <div className="w-full h-16 bg-primary rounded-b-sm" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">Suppliers</span>
                  </div>

                  {/* Bar 3: Sales */}
                  <div className="flex flex-col items-center space-y-1.5 w-12">
                    <div className="w-8 flex flex-col space-y-1 items-center">
                      <div className="w-full h-4 bg-emerald-500 rounded-t-sm" />
                      <div className="w-full h-6 bg-amber-500" />
                      <div className="w-full h-20 bg-primary rounded-b-sm" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">Sales</span>
                  </div>
                </div>
              </div>

              {/* 2. Top Selling Medicine (Color pill bars from screenshot) */}
              <div className="sm:col-span-5 bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Package className="w-3.5 h-3.5 text-slate-500" />
                    <h4 className="text-xs font-extrabold text-slate-800">Top Selling</h4>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">Today</span>
                </div>

                {/* Vertical Segmented Pill Indicators */}
                <div className="flex items-center space-x-1 py-1">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-4 w-1.5 rounded-full ${
                        i < 6 ? 'bg-primary' : i < 11 ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                    />
                  ))}
                </div>

                {/* Top medicines listing */}
                <div className="space-y-2 pt-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 truncate">Dolo 650</span>
                    <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-[85%]" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 truncate">Augmentin 625</span>
                    <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[65%]" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 truncate">Pantocid 40</span>
                    <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full w-[45%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Over All Revenue vs Expense Chart Card (From screenshot) */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Over All Revenue vs Expense</h4>
                  <div className="flex items-center space-x-4 mt-1 text-[10px] font-bold">
                    <span className="flex items-center space-x-1 text-primary">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      <span>Revenue</span>
                    </span>
                    <span className="flex items-center space-x-1 text-amber-500">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>Expense</span>
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  Monthly
                </span>
              </div>

              {/* Candlestick / Bar Chart Simulation from screenshot */}
              <div className="h-28 flex items-end justify-between px-2 pt-2 border-b border-slate-100">
                {[
                  { m: 'Jan', hRev: 45, hExp: 30 },
                  { m: 'Feb', hRev: 60, hExp: 38 },
                  { m: 'Mar', hRev: 52, hExp: 42 },
                  { m: 'Apr', hRev: 75, hExp: 48 },
                  { m: 'May', hRev: 65, hExp: 35 },
                  { m: 'Jun', hRev: 85, hExp: 50 },
                  { m: 'Jul', hRev: 78, hExp: 40 },
                  { m: 'Aug', hRev: 95, hExp: 60 },
                  { m: 'Sep', hRev: 70, hExp: 45 },
                  { m: 'Oct', hRev: 88, hExp: 55 },
                  { m: 'Nov', hRev: 92, hExp: 58 },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center space-y-1">
                    <div className="flex items-end space-x-1">
                      <div
                        className="w-1.5 bg-primary rounded-t-sm"
                        style={{ height: `${item.hRev}px` }}
                      />
                      <div
                        className="w-1.5 bg-amber-500 rounded-t-sm"
                        style={{ height: `${item.hExp}px` }}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400">{item.m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Bottom Welcome Message matching screenshot */}
          <div className="relative z-10 pt-6 text-center space-y-1.5">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Welcome Back PharmaFlow
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Securely access your PharmaFlow Pharmacy Management account. Sign in to keep your pharmacy running efficiently.
            </p>

            {/* Pagination Dots from screenshot */}
            <div className="flex items-center justify-center space-x-1.5 pt-3">
              <span className="w-5 h-1.5 rounded-full bg-primary" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
