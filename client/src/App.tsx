import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { POS } from './pages/POS';
import { Inventory } from './pages/Inventory';
import { Prescriptions } from './pages/Prescriptions';
import { SalesHistory } from './pages/SalesHistory';
import { Suppliers } from './pages/Suppliers';
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
    dashboard: 'Executive Dashboard & Metrics',
    pos: 'Point of Sale (POS) Billing Terminal',
    inventory: 'Inventory & Batch Expiry Management',
    prescriptions: 'Prescription Records & Dispensing',
    sales: 'Sales Transactions & Invoice Records',
    suppliers: 'Supplier & Vendor Directory'
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
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

        <main className="flex-1 p-8 overflow-y-auto">
          {currentTab === 'dashboard' && <Dashboard onNavigateTab={setCurrentTab} />}
          {currentTab === 'pos' && <POS />}
          {currentTab === 'inventory' && <Inventory />}
          {currentTab === 'prescriptions' && <Prescriptions />}
          {currentTab === 'sales' && <SalesHistory />}
          {currentTab === 'suppliers' && <Suppliers />}
        </main>
      </div>
    </div>
  );
}

export default App;
