import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Boxes, 
  Calendar, 
  AlertTriangle,
  Download,
  CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import { DashboardSummary } from '../types';

export const Reports: React.FC = () => {
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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-textPrimary">
            Executive Pharmacy Analytics & Financial Reports
          </h3>
          <p className="text-xs text-textSecondary mt-0.5">
            Real-time reconciliation of inventory valuation, gross sales, and regulatory batch tracking.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-sm transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export PDF Report</span>
        </button>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-textSecondary">
            Total Gross Revenue
          </span>
          <div className="text-2xl font-extrabold text-textPrimary mt-1">
            ₹{(summary?.totalRevenue ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-emerald-600 mt-1 font-semibold">
            {summary?.totalSalesCount ?? 0} Completed Invoices
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-textSecondary">
            Inventory Valuation
          </span>
          <div className="text-2xl font-extrabold text-secondary mt-1">
            ₹{(summary?.totalValuation ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-textSecondary mt-1 font-semibold">
            {summary?.totalStockUnits ?? 0} Shelf Units Recorded
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-textSecondary">
            Near-Expiry Exposure
          </span>
          <div className="text-2xl font-extrabold text-rose-600 mt-1">
            {summary?.nearExpiryCount ?? 0} Batches
          </div>
          <p className="text-[11px] text-rose-600 mt-1 font-semibold">
            Expiring in less than 30 days
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-textSecondary">
            Registered Customers
          </span>
          <div className="text-2xl font-extrabold text-textPrimary mt-1">
            {summary?.totalCustomers ?? 0}
          </div>
          <p className="text-[11px] text-accent mt-1 font-semibold">
            {summary?.totalSuppliers ?? 0} Verified Suppliers
          </p>
        </div>
      </div>

      {/* Top Selling Products Performance */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6">
        <h4 className="font-extrabold text-sm text-textPrimary mb-1">
          Top Performing Medicines Performance Breakdown
        </h4>
        <p className="text-xs text-textSecondary mb-4">
          Detailed unit movement and contribution to total turnover.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-textSecondary">
            <thead className="bg-slatebg text-textPrimary uppercase font-bold text-[11px] border-b">
              <tr>
                <th className="py-3 px-4">Medicine Name</th>
                <th className="py-3 px-4">Form</th>
                <th className="py-3 px-4 text-center">Quantity Dispensed</th>
                <th className="py-3 px-4 text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary?.topSellingMedicines && summary.topSellingMedicines.length > 0 ? (
                summary.topSellingMedicines.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-textPrimary">{m.medicineName}</td>
                    <td className="py-3 px-4">{m.dosageForm}</td>
                    <td className="py-3 px-4 text-center font-bold text-textPrimary">
                      {m.totalQuantitySold}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">
                      ₹{m.totalRevenue.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-textSecondary">
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

