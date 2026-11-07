import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Package, 
  Users, 
  ArrowUpRight,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';
import { DashboardSummary } from '../types';

interface DashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateTab }) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/reports/summary');
        if (res.data.success) {
          setSummary(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Today's Sales */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's Revenue</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">
              ₹{summary?.todayRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {summary?.todaySalesCount || 0} transactions completed today
            </p>
          </div>
        </div>

        {/* Total Medicines */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Catalog Medicines</span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">
              {summary?.totalMedicinesCount || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active SKU items in catalog
            </p>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Low Stock Alert</span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">
              {summary?.lowStockCount || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>Items below minimum threshold</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </p>
          </div>
        </div>

        {/* Expiry Alerts */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between cursor-pointer hover:border-rose-400 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">Expiry Watch</span>
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-rose-600">
              {summary?.nearExpiryCount || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>Expiring in &lt; 30 days ({summary?.expiredCount || 0} expired)</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </p>
          </div>
        </div>
      </div>

      {/* Quick Launch & Recent Sales Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Card */}
        <div className="bg-gradient-to-br from-brand-700 to-teal-900 rounded-xl p-6 text-white shadow-md flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-teal-100 mb-4">
              <span>⚡ Fast Cashier Operations</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Point of Sale (POS)</h3>
            <p className="text-sm text-teal-100 leading-relaxed">
              Scan barcode or search medicines to instantly generate compliant invoices, apply automatic FIFO batch deductions, and bill walk-in or prescription patients.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-teal-600/40 flex items-center space-x-3">
            <button
              onClick={() => onNavigateTab('pos')}
              className="flex-1 bg-white hover:bg-teal-50 text-brand-900 font-semibold py-2.5 px-4 rounded-lg text-sm shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <span>Open POS Terminal</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab('prescriptions')}
              className="bg-brand-600/60 hover:bg-brand-600 text-white font-medium py-2.5 px-3 rounded-lg text-sm transition-all"
            >
              Dispense Rx
            </button>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800">Recent Sales Invoices</h3>
            <button
              onClick={() => onNavigateTab('sales')}
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center space-x-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {summary?.recentSales && summary.recentSales.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {summary.recentSales.map((sale) => (
                <div key={sale.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-slate-800">{sale.invoiceNumber}</span>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                        {sale.paymentMethod}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {sale.customer?.name || 'Walk-in Customer'} • Cashier: {sale.cashier?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-slate-900">
                      ₹{sale.totalAmount.toFixed(2)}
                    </div>
                    <p className="text-xs text-slate-400">
                      {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">
              No transactions recorded today yet. Launch POS to bill items.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

