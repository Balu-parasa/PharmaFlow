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
  ChevronRight
} from 'lucide-react';
import { User } from '../../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
  isOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, user, onLogout }) => {
  const menuSections = [
    {
      heading: 'Core Operations',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'PHARMACIST', 'CASHIER'] },
        { id: 'pos', label: 'Point of Sale (POS)', icon: ShoppingCart, roles: ['ADMIN', 'PHARMACIST', 'CASHIER'] },
        { id: 'prescriptions', label: 'Prescriptions', icon: FileText, roles: ['ADMIN', 'PHARMACIST', 'CASHIER'] },
        { id: 'sales', label: 'Sales & Invoices', icon: Receipt, roles: ['ADMIN', 'PHARMACIST', 'CASHIER'] },
      ]
    },
    {
      heading: 'Inventory & Supply',
      items: [
        { id: 'medicines', label: 'Medicines Catalogue', icon: Pill, roles: ['ADMIN', 'PHARMACIST'] },
        { id: 'inventory', label: 'Batch Inventory (FEFO)', icon: Package, roles: ['ADMIN', 'PHARMACIST'] },
        { id: 'suppliers', label: 'Suppliers & Purchases', icon: Truck, roles: ['ADMIN', 'PHARMACIST'] },
        { id: 'returns', label: 'Sales Returns', icon: RotateCcw, roles: ['ADMIN', 'PHARMACIST'] },
      ]
    },
    {
      heading: 'Governance & Analytics',
      items: [
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, roles: ['ADMIN', 'PHARMACIST'] },
        { id: 'audit-logs', label: 'Audit Trail', icon: ShieldCheck, roles: ['ADMIN', 'PHARMACIST'] },
        { id: 'users', label: 'User Directory', icon: Users, roles: ['ADMIN'] },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-primary text-white flex flex-col min-h-screen border-r border-primary-dark select-none shadow-xl">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 flex items-center space-x-3 bg-primary-dark/40">
        <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-primary font-bold shadow-md shadow-accent/20">
          <Pill className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center space-x-1.5">
            <h1 className="font-extrabold text-base tracking-tight text-white truncate">PharmaFlow</h1>
            <span className="text-[9px] font-bold uppercase tracking-wider bg-white/10 text-accent-light px-1.5 py-0.5 rounded">
              PRO
            </span>
          </div>
          <p className="text-[10px] text-slate-300 font-medium truncate">Smart Pharmacy OS</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 p-3.5 space-y-5 overflow-y-auto">
        {menuSections.map((section, sIdx) => {
          const visibleItems = section.items.filter((it) => !user || it.roles.includes(user.role));
          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {section.heading}
              </div>
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-secondary text-white shadow-md shadow-secondary/30 font-bold'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-3.5 border-t border-white/10 bg-primary-dark/60">
        <div className="flex items-center space-x-3 mb-3 p-2 bg-white/5 rounded-xl border border-white/5">
          <div className="w-8 h-8 rounded-lg bg-secondary text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.name}</p>
            <div className="flex items-center space-x-1.5">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${
                  user?.role === 'ADMIN'
                    ? 'bg-purple-400'
                    : user?.role === 'PHARMACIST'
                    ? 'bg-blue-400'
                    : 'bg-accent'
                }`}
              />
              <p className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                {user?.role}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-xs font-semibold transition-all border border-white/5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
