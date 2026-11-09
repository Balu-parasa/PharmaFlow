import React, { useState, useEffect } from 'react';
import { Receipt, Search, Printer, Calendar } from 'lucide-react';
import api from '../services/api';
import { Sale } from '../types';

export const SalesHistory: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

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

  const filtered = sales.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.invoiceNumber.toLowerCase().includes(q) ||
      (s.customer?.name && s.customer.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search invoice number or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Sales Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Cashier</th>
                <th className="py-3 px-4 text-center">Items</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    {sale.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {new Date(sale.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {sale.customer?.name || 'Walk-in'}
                  </td>
                  <td className="py-3 px-4">{sale.cashier?.name}</td>
                  <td className="py-3 px-4 text-center font-bold">{sale.items.length}</td>
                  <td className="py-3 px-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px]">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    ₹{sale.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedSale(sale)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold"
                    >
                      View Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 text-xs space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">PharmaFlow Pharmacy</h3>
                <p className="text-slate-400">Invoice: {selectedSale.invoiceNumber}</p>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div>
                <p className="font-semibold text-slate-700">Billed To:</p>
                <p>{selectedSale.customer?.name || 'Walk-in Customer'}</p>
                <p>{selectedSale.customer?.phone || ''}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-700">Date:</p>
                <p>{new Date(selectedSale.createdAt).toLocaleString()}</p>
                <p>Cashier: {selectedSale.cashier?.name}</p>
              </div>
            </div>

            <div className="border rounded overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 border-b">
                  <tr>
                    <th className="p-2">Item</th>
                    <th className="p-2 text-center">Batch</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Price</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedSale.items.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2 font-medium">{item.batch?.medicine?.name}</td>
                      <td className="p-2 text-center font-mono text-[10px]">
                        {item.batch?.batchNumber}
                      </td>
                      <td className="p-2 text-center">{item.quantity}</td>
                      <td className="p-2 text-right">₹{item.unitPrice.toFixed(2)}</td>
                      <td className="p-2 text-right font-bold">₹{item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-1 text-right">
              <div>Subtotal: ₹{selectedSale.subTotal.toFixed(2)}</div>
              <div>Tax (GST): ₹{selectedSale.taxAmount.toFixed(2)}</div>
              <div>Discount: -₹{selectedSale.discountAmount.toFixed(2)}</div>
              <div className="text-sm font-bold text-slate-900 border-t pt-1">
                Grand Total: ₹{selectedSale.totalAmount.toFixed(2)}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold flex items-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={() => setSelectedSale(null)}
                className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

