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
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [nearExpiryCount, setNearExpiryCount] = useState<number>(0);
  const [lowStockCount, setLowStockCount] = useState<number>(0);

  // Check persisted session and verify with backend /profile (or refresh cookie)
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const token = localStorage.getItem('pharmaflow_token');
      
      try {
        if (token) {
          // Verify token against backend profile
          const res = await api.get('/auth/profile');
          if (res.data.success && isMounted) {
            setUser(res.data.data);
            localStorage.setItem('pharmaflow_user', JSON.stringify(res.data.data));
            setIsInitializing(false);
            return;
          }
        } else {
          // If no access token in localStorage, attempt silent refresh via httpOnly cookie
          const refreshRes = await api.post('/auth/refresh');
          if (refreshRes.data.success && isMounted) {
            const { user: refreshedUser, token: newToken } = refreshRes.data.data;
            localStorage.setItem('pharmaflow_token', newToken);
            localStorage.setItem('pharmaflow_user', JSON.stringify(refreshedUser));
            setUser(refreshedUser);
            setIsInitializing(false);
            return;
          }
        }
      } catch (err) {
        // Token invalid or refresh expired
        if (isMounted) {
          localStorage.removeItem('pharmaflow_token');
          localStorage.removeItem('pharmaflow_user');
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    verifySession();

    // Listen for session expiry event from API interceptor
    const handleSessionExpired = () => {
      setUser(null);
    };
    window.addEventListener('capsulix_session_expired', handleSessionExpired);

    return () => {
      isMounted = false;
      window.removeEventListener('capsulix_session_expired', handleSessionExpired);
    };
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

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore network errors on logout
    } finally {
      localStorage.removeItem('pharmaflow_token');
      localStorage.removeItem('pharmaflow_user');
      setUser(null);
    }
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-3 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Validating Session...</p>
        </div>
      </div>
    );
  }

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
          title={tabTitles[currentTab] || 'Capsulix'}
          user={user}
          nearExpiryCount={nearExpiryCount}
          lowStockCount={lowStockCount}
        />

        <main className="flex-1 p-5 sm:p-6 lg:p-7 overflow-y-auto">
          <div className="w-full">
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
