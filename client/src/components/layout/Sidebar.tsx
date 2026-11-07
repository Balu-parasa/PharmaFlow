import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Pill, 
  FileText, 
  Truck, 
  Receipt, 
  LogOut,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { User } from '../../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, user, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'PHARMACIST', 'CASHIER'] },
    { id: 'pos', label: 'Point of Sale (POS)', icon: ShoppingCart, roles: ['ADMIN', 'PHARMACIST', 'CASHIER'] },
    { id: 'inventory', label: 'Inventory & Batches', icon: Pill, roles: ['ADMIN', 'PHARMACIST'] },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText, roles: ['ADMIN', 'PHARMACIST', 'CASHIER'] },
    { id: 'sales', label: 'Sales Invoices', icon: Receipt, roles: ['ADMIN', 'PHARMACIST', 'CASHIER'] },
    { id: 'suppliers', label: 'Suppliers', icon: Truck, roles: ['ADMIN', 'PHARMACIST'] },
  ];

  const filteredMenu = menuItems.filter(item => !user || item.roles.includes(user.role));

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
          <Pill className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight">PharmaFlow</h1>
          <p className="text-xs text-slate-400">Smart Pharmacy System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Operations
        </div>
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User profile footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-brand-400 font-semibold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <div className="flex items-center space-x-1.5">
              <span className={`inline-block w-2 h-2 rounded-full ${
                user?.role === 'ADMIN' ? 'bg-purple-400' : user?.role === 'PHARMACIST' ? 'bg-blue-400' : 'bg-emerald-400'
              }`} />
              <p className="text-xs text-slate-400 uppercase tracking-wider">{user?.role}</p>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-red-500/20 text-slate-300 hover:text-red-400 text-xs font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

