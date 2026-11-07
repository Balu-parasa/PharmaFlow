import React from 'react';
import { Bell, Search, AlertTriangle, ShieldCheck } from 'lucide-react';
import { User } from '../../types';

interface HeaderProps {
  title: string;
  user: User | null;
  nearExpiryCount: number;
  lowStockCount: number;
}

export const Header: React.FC<HeaderProps> = ({ title, user, nearExpiryCount, lowStockCount }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center space-x-3">
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      </div>

      <div className="flex items-center space-x-4">
        {/* Alerts Pill */}
        {(nearExpiryCount > 0 || lowStockCount > 0) && (
          <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-1.5 rounded-full font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>
              {nearExpiryCount > 0 && `${nearExpiryCount} Near Expiry`}
              {nearExpiryCount > 0 && lowStockCount > 0 && ' • '}
              {lowStockCount > 0 && `${lowStockCount} Low Stock`}
            </span>
          </div>
        )}

        {/* Status Indicator */}
        <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>System Online</span>
        </div>
      </div>
    </header>
  );
};

