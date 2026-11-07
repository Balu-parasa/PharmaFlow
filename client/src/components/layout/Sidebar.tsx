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
    <aside className="w-72 bg-[#0E1E2E] text-white flex flex-col h-screen sticky top-0 border-r border-slate-800/80 select-none shadow-[4px_0_24px_rgba(0,0,0,0.15)] z-30">
      
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/70 flex items-center justify-between bg-[#0A1622]/60">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white shadow-[0_8px_20px_rgba(59,104,233,0.35)]">
            <Pill className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-black text-lg tracking-tight text-white">PharmaFlow</h1>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Live
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Smart Pharmacy System</p>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {menuSections.map((section, sIdx) => {
          const visibleItems = section.items.filter((it) => !user || it.roles.includes(user.role));
          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx} className="space-y-1.5">
              <div className="px-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                {section.heading}
              </div>
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-[0_8px_20px_rgba(59,104,233,0.35)] font-extrabold translate-x-1'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-1.5 rounded-xl transition-colors ${
                        isActive ? 'bg-white/20 text-white' : 'text-slate-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[13px]">{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User Profile Card */}
      <div className="p-4 border-t border-slate-800/80 bg-[#0A1622]/80">
        <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-2xl border border-white/5 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-blue-500 text-white flex items-center justify-center font-extrabold text-sm shadow-md">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-white truncate">{user?.name}</p>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${
                user?.role === 'ADMIN' ? 'bg-purple-400' : user?.role === 'PHARMACIST' ? 'bg-blue-400' : 'bg-emerald-400'
              }`} />
              <p className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">
                {user?.role}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 text-xs font-bold transition-all border border-white/5"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Workstation</span>
        </button>
      </div>
    </aside>
  );
};
