import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Package, 
  ArrowUpRight,
  ChevronRight,
  DollarSign,
  Boxes,
  Truck,
  RotateCcw,
  CheckCircle2,
  Activity
} from 'lucide-react';
import api from '../services/api';
import { DashboardSummary } from '../types';

interface DashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateTab }) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSummary = async () => {
      try {
        setFetchError(null);
        const res = await api.get('/reports/summary');
        if (isMounted && res.data.success) {
          setSummary(res.data.data);
        }
      } catch (err: any) {
        console.error('Failed to load dashboard summary:', err);
        if (isMounted) {
          setFetchError(err.response?.data?.message || err.message || 'Unable to connect to server');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSummary();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <div className="w-9 h-9 border-3 border-secondary/30 border-t-secondary rounded-full animate-spin" />
        <p className="text-xs text-textSecondary font-semibold">Loading live pharmacy telemetry...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 space-y-3 shadow-subtle">
        <div className="flex items-center space-x-2 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <span>Error loading dashboard metrics</span>
        </div>
        <p className="text-xs text-rose-600">{fetchError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SECTION 1: Executive KPI Cards (6 Key Operational Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. Today's Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-textSecondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today's Revenue</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-textPrimary">
              ₹{(summary?.todayRevenue ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-textSecondary mt-1">
              {summary?.todaySalesCount ?? 0} invoices today
            </p>
          </div>
        </div>

        {/* 2. Total Valuation */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-textSecondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Inventory Value</span>
            <div className="p-2 bg-blue-50 rounded-xl text-secondary">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-textPrimary">
              ₹{(summary?.totalValuation ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-textSecondary mt-1">At batch cost value</p>
          </div>
        </div>

        {/* 3. Total Stock Units */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-textSecondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Units</span>
            <div className="p-2 bg-teal-50 rounded-xl text-accent">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-textPrimary">
              {(summary?.totalStockUnits ?? 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-textSecondary mt-1">Units on shelf</p>
          </div>
        </div>

        {/* 4. Active Catalog SKU */}
        <div 
          onClick={() => onNavigateTab('medicines')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-textSecondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Medicines</span>
            <div className="p-2 bg-slate-100 rounded-xl text-primary">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-textPrimary">
              {summary?.totalMedicinesCount ?? 0}
            </div>
            <p className="text-[11px] text-textSecondary mt-1 flex items-center justify-between">
              <span>Catalog SKUs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </p>
          </div>
        </div>

        {/* 5. Low Stock Alert */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-textSecondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Low Stock</span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-amber-600">
              {summary?.lowStockCount ?? 0}
            </div>
            <p className="text-[11px] text-textSecondary mt-1 flex items-center justify-between">
              <span>Below threshold</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </p>
          </div>
        </div>

        {/* 6. Expiry Alert */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-textSecondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Near Expiry</span>
            <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-rose-600">
              {summary?.nearExpiryCount ?? 0}
            </div>
            <p className="text-[11px] text-textSecondary mt-1 flex items-center justify-between">
              <span>Expiring &lt;30d ({summary?.expiredCount ?? 0} exp)</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: Action Hero Card + Fast Moving Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* POS Launch & Status Hero (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-primary via-[#14375A] to-primary-dark rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-accent-light border border-white/10">
              <Activity className="w-3.5 h-3.5" />
              <span>Real-Time FEFO Terminal</span>
            </div>
            <h3 className="text-2xl font-black tracking-tight leading-snug">
              Point of Sale & Compliant Invoicing
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Automated First-Expiry, First-Out (FEFO) batch deduction ensures no expired medicines are dispensed, maintains transactional stock integrity, and issues instant GST-compliant bills.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center space-x-3">
            <button
              onClick={() => onNavigateTab('pos')}
              className="flex-1 bg-accent hover:bg-accent-light text-primary font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <span>Launch POS Billing</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab('prescriptions')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 px-3.5 rounded-xl text-xs transition-all border border-white/10"
            >
              Prescriptions
            </button>
          </div>
        </div>

        {/* Top-Selling Medicines (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-textPrimary">Top Moving Medicines</h3>
              <p className="text-xs text-textSecondary">High-demand items ranked by units sold</p>
            </div>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-xs text-secondary hover:text-secondary-dark font-bold flex items-center space-x-1"
            >
              <span>View Full Reports</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {summary?.topSellingMedicines && summary.topSellingMedicines.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {summary.topSellingMedicines.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[11px]">
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-textPrimary text-sm">{item.medicineName}</span>
                      <p className="text-[11px] text-textSecondary">{item.dosageForm}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-textPrimary text-sm">
                      {item.totalQuantitySold} units
                    </div>
                    <div className="text-[11px] text-accent font-semibold">
                      ₹{item.totalRevenue.toFixed(2)} rev
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-textSecondary text-xs">
              No sales data recorded yet. Dispense items at the POS to populate top-selling products.
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: Recent Transactions & Immutable Stock Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-textPrimary">Recent Sales Invoices</h3>
              <p className="text-xs text-textSecondary">Live register of latest customer sales</p>
            </div>
            <button
              onClick={() => onNavigateTab('sales')}
              className="text-xs text-secondary hover:text-secondary-dark font-bold flex items-center space-x-1"
            >
              <span>All Invoices</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {summary?.recentSales && summary.recentSales.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {summary.recentSales.map((sale) => (
                <div key={sale.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-textPrimary font-mono">{sale.invoiceNumber}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          sale.paymentStatus === 'REFUNDED'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {sale.paymentStatus}
                      </span>
                    </div>
                    <p className="text-[11px] text-textSecondary mt-0.5">
                      {sale.customer?.name || 'Walk-in'} • Cashier: {sale.cashier?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-textPrimary">
                      ₹{sale.totalAmount.toFixed(2)}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-textSecondary text-xs">
              No recent invoices found.
            </div>
          )}
        </div>

        {/* Recent Stock Movements Audit */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-textPrimary">Recent Stock Movements</h3>
              <p className="text-xs text-textSecondary">Audit trail of batch deductions, returns & receipts</p>
            </div>
            <button
              onClick={() => onNavigateTab('audit-logs')}
              className="text-xs text-secondary hover:text-secondary-dark font-bold flex items-center space-x-1"
            >
              <span>Full Audit Trail</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {summary?.recentMovements && summary.recentMovements.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {summary.recentMovements.map((mov) => (
                <div key={mov.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          mov.type === 'SALE'
                            ? 'bg-blue-100 text-blue-700'
                            : mov.type === 'RETURN'
                            ? 'bg-amber-100 text-amber-700'
                            : mov.type === 'RESTOCK'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {mov.type}
                      </span>
                      <span className="font-bold text-textPrimary">
                        {mov.batch?.medicine?.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-textSecondary mt-0.5 truncate max-w-xs">
                      {mov.reason}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-bold ${
                        mov.quantity > 0 ? 'text-emerald-600' : 'text-slate-800'
                      }`}
                    >
                      {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity} units
                    </span>
                    <p className="text-[10px] text-slate-400">Bal: {mov.balanceAfter}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-textSecondary text-xs">
              No stock movements recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
