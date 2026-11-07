import React, { useState } from 'react';
import { Pill, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@pharmaflow.com');
  const [password, setPassword] = useState('admin123');
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
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-brand-600 to-teal-400 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-teal-500/20">
            <Pill className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">PharmaFlow</h2>
          <p className="text-xs text-slate-500">Smart Pharmacy Management & POS System</p>
        </div>

        {/* Demo Credentials Pill */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5">
          <p className="font-semibold text-slate-700">Quick Demo Logins (Click to autofill):</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleFillDemo('admin@pharmaflow.com', 'admin123')}
              className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-700 hover:bg-brand-50 hover:border-brand-300 font-medium text-[11px]"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('pharmacist@pharmaflow.com', 'password123')}
              className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-700 hover:bg-brand-50 hover:border-brand-300 font-medium text-[11px]"
            >
              💊 Pharmacist
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('cashier@pharmaflow.com', 'password123')}
              className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-700 hover:bg-brand-50 hover:border-brand-300 font-medium text-[11px]"
            >
              🛒 Cashier
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg text-sm shadow-md shadow-brand-600/30 transition-all flex items-center justify-center space-x-2"
          >
            {loading ? <span>Authenticating...</span> : (
              <>
                <span>Sign In to System</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

