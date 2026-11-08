import React from 'react';
import { Search, AlertTriangle, ShieldCheck, User as UserIcon, Bell, Sparkles } from 'lucide-react';
import { User } from '../../types';

interface HeaderProps {
  title: string;
  user: User | null;
  nearExpiryCount: number;
  lowStockCount: number;
}

export const Header: React.FC<HeaderProps> = ({ title, user, nearExpiryCount, lowStockCount }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md bg-white/95 shadow-sm">
      
      {/* Title */}
      <div className="flex items-center space-x-3">
        <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">{title}</h2>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3.5">
        {/* Real-time Alerts Pill */}
        {(nearExpiryCount > 0 || lowStockCount > 0) && (
          <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-1.5 rounded-xl font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span>
              {nearExpiryCount > 0 && `${nearExpiryCount} Near Expiry`}
              {nearExpiryCount > 0 && lowStockCount > 0 && ' • '}
              {lowStockCount > 0 && `${lowStockCount} Low Stock`}
            </span>
          </div>
        )}

        {/* System Online Status */}
        <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl font-medium border border-slate-200/60">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>FEFO Engine Online</span>
        </div>

        {/* Current user badge */}
        <div className="flex items-center space-x-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name}</p>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
