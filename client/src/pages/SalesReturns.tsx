import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Receipt, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import api from '../services/api';
import { Sale } from '../types';

export const SalesReturns: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [returnQtys, setReturnQtys] = useState<Record<string, number>>({});
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadSales = async () => {
    try {
      const res = await api.get('/sales');
      if (res.data.success) {
        setSales(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  const handleSelectSale = (sale: Sale) => {
    setSelectedSale(sale);
    setReturnQtys({});
    setReason('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleQtyChange = (saleItemId: string, maxQty: number, qty: number) => {
    const safeQty = Math.max(0, Math.min(qty, maxQty));
    setReturnQtys({ ...returnQtys, [saleItemId]: safeQty });
  };

  const handleProcessReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSale) return;

    if (!reason.trim()) {
      setErrorMsg('Mandatory reason is required to process any return.');
      return;
    }

    const itemsToReturn = Object.entries(returnQtys)
      .filter(([_, q]) => q > 0)
      .map(([saleItemId, quantity]) => ({ saleItemId, quantity }));

    if (itemsToReturn.length === 0) {
      setErrorMsg('Please specify quantity to return for at least one item.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await api.post(`/sales/${selectedSale.id}/return`, {
        items: itemsToReturn,
        reason: reason.trim()
      });

      if (res.data.success) {
        setSuccessMsg(`Return successfully processed! Inventory restocked.`);
        setSelectedSale(null);
        loadSales();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to process return');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = sales.filter((s) => {
    const q = search.toLowerCase();
    return s.invoiceNumber.toLowerCase().includes(q) || (s.customer?.name && s.customer.name.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      {/* Banner info */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-textPrimary font-extrabold text-base">
            <RotateCcw className="w-5 h-5 text-secondary" />
            <span>Sales Return & Inventory Reconciliation Terminal</span>
          </div>
          <p className="text-xs text-textSecondary">
            Enforces auditable stock restock, tracks pharmacist/cashier user attribution, and requires justification reasons.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center space-x-2 font-bold shadow-subtle">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Invoice Lookup List (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden flex flex-col h-[580px]">
          <div className="p-4 border-b border-slate-200 bg-slatebg">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search invoice number or customer name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-textPrimary focus:outline-none focus:border-secondary"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
            {filtered.map((s) => (
              <div
                key={s.id}
                onClick={() => handleSelectSale(s)}
                className={`p-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                  selectedSale?.id === s.id
                    ? 'bg-secondary/10 border border-secondary shadow-sm'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-textPrimary font-mono">{s.invoiceNumber}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        s.paymentStatus === 'REFUNDED'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {s.paymentStatus}
                    </span>
                  </div>
                  <p className="text-[11px] text-textSecondary mt-0.5">
                    {s.customer?.name || 'Walk-in Customer'} • {new Date(s.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-xs text-textPrimary">₹{s.totalAmount.toFixed(2)}</span>
                  <p className="text-[10px] text-textSecondary">{s.items.length} items</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Return Processing Form (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 h-[580px] flex flex-col justify-between">
          {selectedSale ? (
            <form onSubmit={handleProcessReturn} className="flex flex-col justify-between h-full space-y-4">
              <div className="space-y-4 overflow-y-auto pr-1">
                <div className="border-b pb-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-textPrimary">
                      Processing Return for {selectedSale.invoiceNumber}
                    </h4>
                    <span className="text-xs text-textSecondary font-semibold">
                      Total: ₹{selectedSale.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[11px] text-textSecondary mt-0.5">
                    Select quantities to return. Inventory batches will automatically increment with full audit logging.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Items selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-textPrimary">Sold Items in this Sale</label>
                  <div className="space-y-2">
                    {selectedSale.items.map((it) => (
                      <div
                        key={it.id}
                        className="p-3 bg-slatebg rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="font-bold text-textPrimary">{it.batch.medicine.name}</span>
                          <p className="text-[11px] text-textSecondary font-mono">
                            Batch: {it.batch.batchNumber} • Sold: {it.quantity} @ ₹{it.unitPrice.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] text-textSecondary">Return Qty:</span>
                          <input
                            type="number"
                            min="0"
                            max={it.quantity}
                            value={returnQtys[it.id] || 0}
                            onChange={(e) => handleQtyChange(it.id, it.quantity, Number(e.target.value))}
                            className="w-16 px-2 py-1 text-center font-bold bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mandatory Reason */}
                <div>
                  <label className="block text-xs font-bold text-textPrimary mb-1">
                    Mandatory Return Justification Reason *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="e.g. Customer purchased excess quantity or doctor altered medication dose"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-textPrimary focus:outline-none focus:border-secondary"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedSale(null)}
                  className="px-4 py-2.5 bg-slatebg hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center justify-center space-x-1.5"
                >
                  {isSubmitting ? <span>Processing Return...</span> : <span>Confirm & Restock Inventory</span>}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-textSecondary space-y-2">
              <Receipt className="w-12 h-12 text-slate-300" />
              <h5 className="font-bold text-sm text-textPrimary">Select an Invoice to Initiate Return</h5>
              <p className="text-xs max-w-xs">
                Pick a transaction from the left panel to review items, specify return units, and restock inventory.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

