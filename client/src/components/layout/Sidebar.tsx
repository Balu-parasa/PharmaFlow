import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Pill, 
  Package, 
  FileText, 
  Truck, 
  Receipt, 
  RotateCcw, 
  BarChart3, 
  ShieldCheck, 
  Users, 
  LogOut, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { User } from '../../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, user, onLogout }) => {
  const menuSections = [
    {
      heading: 'Operations',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'PHARMACIST', 'CASHIER'] },
        { id: 'pos', label: 'Point of Sale (POS)', icon: ShoppingCart, roles: ['ADMIN', 'PHARMACIST', 'CASHIER'], highlight: true },
        { id: 'prescriptions', label: 'Prescriptions', icon: FileText, roles: ['ADMIN', 'PHARMACIST', 'CASHIER'] },
        { id: 'sales', label: 'Sales & Invoices', icon: Receipt, roles: ['ADMIN', 'PHARMACIST', 'CASHIER'] },
      ]
    },
    {
      heading: 'Inventory & Stock',
      items: [
        { id: 'medicines', label: 'Medicines Catalogue', icon: Pill, roles: ['ADMIN', 'PHARMACIST'] },
        { id: 'inventory', label: 'Batch Inventory (FEFO)', icon: Package, roles: ['ADMIN', 'PHARMACIST'] },
        { id: 'suppliers', label: 'Suppliers & Purchases', icon: Truck, roles: ['ADMIN', 'PHARMACIST'] },
        { id: 'returns', label: 'Sales Returns', icon: RotateCcw, roles: ['ADMIN', 'PHARMACIST'] },
      ]
    },
    {
      heading: 'Governance',
      items: [
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, roles: ['ADMIN', 'PHARMACIST'] },
        { id: 'audit-logs', label: 'Audit Trail', icon: ShieldCheck, roles: ['ADMIN', 'PHARMACIST'] },
        { id: 'users', label: 'User Directory', icon: Users, roles: ['ADMIN'] },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#0B1724] text-white flex flex-col h-screen sticky top-0 border-r border-slate-800/80 select-none shadow-[2px_0_12px_rgba(0,0,0,0.12)] z-30">
      
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/70 flex items-center justify-between bg-[#08111B]/60">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 flex items-center justify-center flex-shrink-0">
            <img 
              src="/pharmaflow-logo.png" 
              alt="Capsulix Logo" 
              className="w-full h-full object-contain drop-shadow-[0_2px_14px_rgba(14,165,233,0.45)] transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight text-white leading-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Capsulix
            </h1>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
        {menuSections.map((section, sIdx) => {
          const visibleItems = section.items.filter((it) => !user || it.roles.includes(user.role));
          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {section.heading}
              </div>
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                      isActive
                        ? 'bg-primary text-white font-semibold shadow-sm'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white font-medium'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className={`p-1 rounded-lg ${
                        isActive ? 'text-white' : 'text-slate-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[12px]">{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User Profile Card */}
      <div className="p-3 border-t border-slate-800/80 bg-[#08111B]/80">
        <div className="flex items-center space-x-2.5 p-2 bg-white/5 rounded-xl border border-white/5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary-light flex items-center justify-center font-bold text-xs">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${
                user?.role === 'ADMIN' ? 'bg-purple-400' : user?.role === 'PHARMACIST' ? 'bg-blue-400' : 'bg-emerald-400'
              }`} />
              <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
                {user?.role}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 text-xs font-medium transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
