import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { POS } from './pages/POS';
import { MedicinesCatalogue } from './pages/MedicinesCatalogue';
import { Inventory } from './pages/Inventory';
import { Prescriptions } from './pages/Prescriptions';
import { SalesHistory } from './pages/SalesHistory';
import { SalesReturns } from './pages/SalesReturns';
import { Suppliers } from './pages/Suppliers';
import { Reports } from './pages/Reports';
import { AuditTrail } from './pages/AuditTrail';
import { UserDirectory } from './pages/UserDirectory';
import { Login } from './pages/Login';
import { User } from './types';
import api from './services/api';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [nearExpiryCount, setNearExpiryCount] = useState<number>(0);
  const [lowStockCount, setLowStockCount] = useState<number>(0);

  // Check persisted session
  useEffect(() => {
    const savedUser = localStorage.getItem('pharmaflow_user');
    const token = localStorage.getItem('pharmaflow_token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.clear();
      }
    }
  }, []);

  // Fetch alert counts for the header pill
  useEffect(() => {
    if (!user) return;
    const fetchAlerts = async () => {
      try {
        const res = await api.get('/reports/summary');
        if (res.data.success) {
          setNearExpiryCount(res.data.data.nearExpiryCount || 0);
          setLowStockCount(res.data.data.lowStockCount || 0);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAlerts();
  }, [user, currentTab]);

  const handleLogout = () => {
    localStorage.removeItem('pharmaflow_token');
    localStorage.removeItem('pharmaflow_user');
    setUser(null);
  };

  if (!user) {
    return <Login onLoginSuccess={(u) => setUser(u)} />;
  }

  const tabTitles: Record<string, string> = {
    dashboard: 'Executive Pharmacy Operations Dashboard',
    pos: 'Point of Sale (POS) Billing & Dispensing Terminal',
    medicines: 'Medicines Product Catalogue',
    inventory: 'Batch Inventory & FEFO Expiry Tracking',
    prescriptions: 'Clinical Prescriptions & Patient Dispense',
    sales: 'Sales Transaction Register & Invoices',
    returns: 'Sales Returns & Inventory Reconciliation',
    suppliers: 'Suppliers & Vendors Directory',
    reports: 'Financial Reports & Stock Valuation',
    'audit-logs': 'Immutable Regulatory Audit Trail',
    users: 'Staff & Role-Based Access Directory'
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900 antialiased">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        user={user}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={tabTitles[currentTab] || 'PharmaFlow'}
          user={user}
          nearExpiryCount={nearExpiryCount}
          lowStockCount={lowStockCount}
        />

        <main className="flex-1 p-6 sm:p-8 lg:p-8 xl:p-10 overflow-y-auto">
          <div className="max-w-[1700px] w-full mx-auto">
            {currentTab === 'dashboard' && <Dashboard onNavigateTab={setCurrentTab} />}
            {currentTab === 'pos' && <POS />}
            {currentTab === 'medicines' && <MedicinesCatalogue />}
            {currentTab === 'inventory' && <Inventory />}
            {currentTab === 'prescriptions' && <Prescriptions />}
            {currentTab === 'sales' && <SalesHistory />}
            {currentTab === 'returns' && <SalesReturns />}
            {currentTab === 'suppliers' && <Suppliers />}
            {currentTab === 'reports' && <Reports />}
            {currentTab === 'audit-logs' && <AuditTrail />}
            {currentTab === 'users' && <UserDirectory />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
