import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Boxes, 
  Calendar, 
  AlertTriangle,
  Download,
  CheckCircle2,
  Scale,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';
import { DashboardSummary } from '../types';

export const Reports: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [reconciliation, setReconciliation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const [sumRes, reconRes] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/reports/reconciliation').catch(() => ({ data: { success: false, data: null } }))
      ]);

      if (sumRes.data.success) {
        setSummary(sumRes.data.data);
      }
      if (reconRes.data?.success) {
        setReconciliation(reconRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* Top Header */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full text-xs font-bold text-primary mb-2 border border-blue-100">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>PharmaFlow Financial & Inventory Governance</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Financial Reports & Stock Reconciliation
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time audit reconciliation of inventory valuation, gross sales, batch tax compliance, and stock ledger math.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchSummary}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-card transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Gross Revenue
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ₹{(summary?.totalRevenue ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-emerald-600 mt-1.5 font-bold">
              {summary?.totalSalesCount ?? 0} Completed Invoices
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Inventory Valuation
            </span>
            <div className="p-2.5 bg-blue-50 text-primary rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
              ₹{(summary?.totalValuation ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1.5 font-bold">
              {summary?.totalStockUnits ?? 0} Shelf Units Recorded
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Near-Expiry Batches
            </span>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
              {summary?.nearExpiryCount ?? 0} Batches
            </div>
            <p className="text-xs text-rose-500 mt-1.5 font-bold">
              Expiring within 30 days
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Suppliers & Customers
            </span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {summary?.totalCustomers ?? 0}
            </div>
            <p className="text-xs text-purple-600 mt-1.5 font-bold">
              {summary?.totalSuppliers ?? 0} Verified Vendors
            </p>
          </div>
        </div>
      </div>

      {/* Stock Reconciliation Ledger Banner */}
      {reconciliation && (
        <div className="bg-gradient-to-br from-slate-900 via-[#102B46] to-slate-900 p-7 rounded-3xl text-white shadow-card space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 bg-white/10 rounded-2xl text-emerald-400">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-black tracking-tight text-white">
                  Regulatory Stock Ledger Reconciliation Formula
                </h4>
                <p className="text-xs text-slate-300">
                  Calculated Balance = Restocks - Sales + Returns + Adjustments
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                reconciliation.isBalanced ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              }`}>
                {reconciliation.isBalanced ? '✓ 100% Ledger Balanced' : '⚠ Discrepancy Found'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Restocked</span>
              <div className="text-xl font-black text-emerald-400 mt-1">+{reconciliation.totalRestocked}</div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Sold (Deducted)</span>
              <div className="text-xl font-black text-rose-400 mt-1">-{reconciliation.totalSold}</div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Returned</span>
              <div className="text-xl font-black text-blue-400 mt-1">+{reconciliation.totalReturned}</div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Net Adjustments</span>
              <div className="text-xl font-black text-amber-400 mt-1">{reconciliation.totalAdjusted >= 0 ? `+${reconciliation.totalAdjusted}` : reconciliation.totalAdjusted}</div>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl border border-white/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Expected Balance</span>
              <div className="text-xl font-black text-white mt-1">{reconciliation.calculatedBalance}</div>
            </div>
            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Physical Stock</span>
              <div className="text-xl font-black text-emerald-400 mt-1">{reconciliation.physicalStockTotal}</div>
            </div>
          </div>
        </div>
      )}

      {/* Top Selling Products Performance */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h4 className="font-black text-lg text-slate-900 tracking-tight">
              Top Performing Medicines Performance Breakdown
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Unit movement, dosage form contribution, and total turnover generated.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/70">
          <table className="w-full text-left text-xs sm:text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-4 px-6">Medicine Name</th>
                <th className="py-4 px-6">Form</th>
                <th className="py-4 px-6 text-center">Quantity Dispensed</th>
                <th className="py-4 px-6 text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary?.topSellingMedicines && summary.topSellingMedicines.length > 0 ? (
                summary.topSellingMedicines.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">{m.medicineName}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
                        {m.dosageForm}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-black text-slate-800">
                      {m.totalQuantitySold} units
                    </td>
                    <td className="py-4 px-6 text-right font-black text-emerald-600">
                      ₹{m.totalRevenue.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                    No sales data accumulated yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

