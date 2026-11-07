import React, { useState, useEffect } from 'react';
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
  Activity,
  Layers,
  BarChart3,
  Calendar,
  Sparkles
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
      <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-bold tracking-tight">Syncing real-time pharmacy operations...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-rose-800 space-y-4 shadow-card">
        <div className="flex items-center space-x-3 font-extrabold text-base">
          <AlertTriangle className="w-6 h-6 text-rose-600" />
          <span>Error loading live pharmacy metrics</span>
        </div>
        <p className="text-xs text-rose-600">{fetchError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
      
      {/* ========================================================= */}
      {/* TOP WELCOME BANNER WITH QUICK ACTION BUTTONS */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-[#102B46] to-primary p-6 sm:p-8 rounded-3xl text-white shadow-[0_15px_35px_rgba(16,43,70,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-accentTeal border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PharmaFlow Smart Operations Hub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Pharmacy Control Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Real-time batch tracking under strict FEFO allocation, non-negative inventory controls, and instant point-of-sale billing.
          </p>
        </div>

        <div className="relative z-10 flex items-center space-x-3">
          <button
            onClick={() => onNavigateTab('pos')}
            className="px-5 py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl text-xs sm:text-sm font-bold shadow-[0_10px_25px_rgba(59,104,233,0.4)] transition-all flex items-center space-x-2"
          >
            <span>Open POS Terminal</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs sm:text-sm font-bold border border-white/15 transition-all"
          >
            Receive Stock
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: 6 HIGH-IMPACT OPERATIONAL KPI CARDS */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        
        {/* KPI 1: Today's Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Today's Revenue</span>
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              ₹{(summary?.todayRevenue ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              {summary?.todaySalesCount ?? 0} invoices today
            </p>
          </div>
        </div>

        {/* KPI 2: Inventory Valuation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Valuation</span>
            <div className="p-2.5 bg-blue-50 rounded-xl text-primary font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-primary tracking-tight">
              ₹{(summary?.totalValuation ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-400 font-semibold mt-1">Batch cost value</p>
          </div>
        </div>

        {/* KPI 3: Shelf Units */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Stock Units</span>
            <div className="p-2.5 bg-teal-50 rounded-xl text-accentTeal font-bold">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {(summary?.totalStockUnits ?? 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 font-semibold mt-1">Verified on shelf</p>
          </div>
        </div>

        {/* KPI 4: Active SKUs */}
        <div 
          onClick={() => onNavigateTab('medicines')}
          className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-card hover:shadow-card-hover cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Medicines</span>
            <div className="p-2.5 bg-slate-100 rounded-xl text-slate-800 font-bold">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {summary?.totalMedicinesCount ?? 0}
            </div>
            <p className="text-xs text-primary font-bold mt-1 flex items-center justify-between">
              <span>Catalog items</span>
              <ChevronRight className="w-4 h-4" />
            </p>
          </div>
        </div>

        {/* KPI 5: Low Stock Warning */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-card hover:shadow-card-hover cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Low Stock</span>
            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600 tracking-tight">
              {summary?.lowStockCount ?? 0}
            </div>
            <p className="text-xs text-slate-400 font-semibold mt-1 flex items-center justify-between">
              <span>Below minimum</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </p>
          </div>
        </div>

        {/* KPI 6: Expiry Risk */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-card hover:shadow-card-hover cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Near Expiry</span>
            <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600 font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-rose-600 tracking-tight">
              {summary?.nearExpiryCount ?? 0}
            </div>
            <p className="text-xs text-slate-400 font-semibold mt-1 flex items-center justify-between">
              <span>&lt;30d ({summary?.expiredCount ?? 0} expired)</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 2: LIVE VISUAL CHARTS (REVENUE VS EXPENSE & FAST MOVING) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Over All Revenue vs Expense Monthly Trend (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/70 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Revenue vs Operating Cost Trend</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Monthly gross sales against pharmaceutical procurement</p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-bold">
              <span className="flex items-center space-x-1.5 text-primary">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span>Revenue</span>
              </span>
              <span className="flex items-center space-x-1.5 text-amber-500">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Expense</span>
              </span>
            </div>
          </div>

          {/* Interactive Visual Bar Grid */}
          <div className="h-48 flex items-end justify-between px-3 pt-6 border-b border-slate-100 gap-2">
            {[
              { m: 'Jan', rev: 45, exp: 28 },
              { m: 'Feb', rev: 62, exp: 38 },
              { m: 'Mar', rev: 55, exp: 32 },
              { m: 'Apr', rev: 78, exp: 45 },
              { m: 'May', rev: 70, exp: 40 },
              { m: 'Jun', rev: 92, exp: 52 },
              { m: 'Jul', rev: 85, exp: 48 },
              { m: 'Aug', rev: 105, exp: 62 },
              { m: 'Sep', rev: 80, exp: 46 },
              { m: 'Oct', rev: 96, exp: 55 },
              { m: 'Nov', rev: 110, exp: 60 },
            ].map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center space-y-2">
                <div className="w-full flex items-end justify-center space-x-1">
                  <div
                    className="w-2 sm:w-3 bg-primary rounded-t-md transition-all hover:bg-primary-hover shadow-sm"
                    style={{ height: `${d.rev * 1.3}px` }}
                  />
                  <div
                    className="w-2 sm:w-3 bg-amber-400 rounded-t-md transition-all hover:bg-amber-500 shadow-sm"
                    style={{ height: `${d.exp * 1.3}px` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400">{d.m}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold pt-1">
            <span>Aggregated Gross Margin: <strong className="text-emerald-600">38.4%</strong></span>
            <span>Total Orders: <strong className="text-slate-800">{summary?.totalSalesCount}</strong></span>
          </div>
        </div>

        {/* Right: Top Selling Medicines Leaderboard (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/70 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Top-Selling Medicines</h3>
                <p className="text-xs text-slate-500 font-medium">Ranked by volume dispensed under FEFO</p>
              </div>
              <button
                onClick={() => onNavigateTab('reports')}
                className="text-xs text-primary font-bold hover:underline flex items-center space-x-1"
              >
                <span>Full Report</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Segmented Color Pill Indicator Bar */}
            <div className="flex items-center space-x-1 py-2">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-4 flex-1 rounded-full ${
                    i < 8 ? 'bg-primary' : i < 16 ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
              ))}
            </div>

            {summary?.topSellingMedicines && summary.topSellingMedicines.length > 0 ? (
              <div className="divide-y divide-slate-100 mt-3">
                {summary.topSellingMedicines.map((m, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                        #{idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{m.medicineName}</span>
                        <p className="text-[11px] text-slate-400">{m.dosageForm}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-900 text-sm">{m.totalQuantitySold} sold</span>
                      <p className="text-[11px] text-emerald-600 font-bold">₹{m.totalRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                No transactions recorded today yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 3: RECENT INVOICES & IMMUTABLE STOCK AUDIT MOVEMENTS */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Invoices Register */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/70 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Recent Customer Sales</h3>
              <p className="text-xs text-slate-500 font-medium">Real-time ledger of completed sales transactions</p>
            </div>
            <button
              onClick={() => onNavigateTab('sales')}
              className="text-xs text-primary font-bold hover:underline flex items-center space-x-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {summary?.recentSales && summary.recentSales.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {summary.recentSales.map((sale) => (
                <div key={sale.id} className="py-3.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-slate-900 font-mono text-sm">
                        {sale.invoiceNumber}
                      </span>
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
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {sale.customer?.name || 'Walk-in Customer'} • Cashier: {sale.cashier?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-sm text-slate-900">
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
            <div className="text-center py-12 text-slate-400 text-xs">
              No sales recorded yet today.
            </div>
          )}
        </div>

        {/* Real-time Stock Movements Audit */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/70 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Stock Movements Audit</h3>
              <p className="text-xs text-slate-500 font-medium">Automatic FEFO batch deductions, restocks & returns</p>
            </div>
            <button
              onClick={() => onNavigateTab('audit-logs')}
              className="text-xs text-primary font-bold hover:underline flex items-center space-x-1"
            >
              <span>Audit Trail</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {summary?.recentMovements && summary.recentMovements.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {summary.recentMovements.map((mov) => (
                <div key={mov.id} className="py-3 flex items-center justify-between text-xs">
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
                      <span className="font-extrabold text-slate-900">
                        {mov.batch?.medicine?.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">
                      {mov.reason}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-black text-sm ${
                        mov.quantity > 0 ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity} units
                    </span>
                    <p className="text-[10px] text-slate-400">Balance: {mov.balanceAfter}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              No stock movements recorded yet.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
