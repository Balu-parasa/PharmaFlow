import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, Phone, Mail, MapPin, PackagePlus, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import api from '../services/api';
import { Supplier, Medicine } from '../types';

interface PurchaseBatchInput {
  medicineId: string;
  batchNumber: string;
  manufacturingDate?: string;
  expiryDate: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
}

export const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [isSubmittingPO, setIsSubmittingPO] = useState(false);

  // Supplier Add Form
  const [newSup, setNewSup] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    gstin: ''
  });

  // Purchase Order Form State
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [purchaseBatches, setPurchaseBatches] = useState<PurchaseBatchInput[]>([
    {
      medicineId: '',
      batchNumber: '',
      manufacturingDate: '',
      expiryDate: '',
      costPrice: 20,
      sellingPrice: 35,
      quantity: 50
    }
  ]);

  const loadSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      if (res.data.success) {
        setSuppliers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadMedicines = async () => {
    try {
      const res = await api.get('/medicines');
      if (res.data.success) {
        setMedicines(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSuppliers();
    loadMedicines();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/suppliers', newSup);
      if (res.data.success) {
        setShowModal(false);
        setNewSup({ name: '', contactPerson: '', phone: '', email: '', address: '', gstin: '' });
        loadSuppliers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error adding supplier');
    }
  };

  // Add another batch row to PO
  const handleAddBatchRow = () => {
    setPurchaseBatches([
      ...purchaseBatches,
      {
        medicineId: '',
        batchNumber: '',
        manufacturingDate: '',
        expiryDate: '',
        costPrice: 20,
        sellingPrice: 35,
        quantity: 50
      }
    ]);
  };

  // Remove batch row from PO
  const handleRemoveBatchRow = (index: number) => {
    if (purchaseBatches.length === 1) return;
    setPurchaseBatches(purchaseBatches.filter((_, i) => i !== index));
  };

  // Update specific batch row
  const handleBatchChange = (index: number, field: keyof PurchaseBatchInput, value: any) => {
    const updated = [...purchaseBatches];
    (updated[index] as any)[field] = value;
    setPurchaseBatches(updated);
  };

  // Calculate total purchase amount
  const totalPurchaseAmount = purchaseBatches.reduce((acc, b) => acc + (Number(b.costPrice) || 0) * (Number(b.quantity) || 0), 0);

  // Submit Purchase Order
  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPurchaseError(null);
    setPurchaseSuccess(null);

    if (!selectedSupplierId) {
      setPurchaseError('Please select a supplier.');
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    for (const b of purchaseBatches) {
      if (!b.medicineId || !b.batchNumber || !b.expiryDate) {
        setPurchaseError('All batch rows must specify a medicine, batch number, and expiry date.');
        return;
      }
      if (b.expiryDate <= todayStr) {
        setPurchaseError(`Batch '${b.batchNumber}' has already expired (${b.expiryDate}). Expired stock receiving is blocked.`);
        return;
      }
      if (Number(b.costPrice) <= 0 || Number(b.sellingPrice) <= 0 || Number(b.quantity) <= 0) {
        setPurchaseError('Cost price, selling price, and quantity must be positive.');
        return;
      }
    }

    try {
      setIsSubmittingPO(true);
      const res = await api.post('/suppliers/purchases', {
        supplierId: selectedSupplierId,
        items: purchaseBatches
      });

      if (res.data.success) {
        setPurchaseSuccess(`Purchase order ${res.data.data.orderNumber} successfully received into batches! Total: ₹${res.data.data.totalAmount.toFixed(2)}`);
        // Reset form
        setPurchaseBatches([
          {
            medicineId: '',
            batchNumber: '',
            manufacturingDate: '',
            expiryDate: '',
            costPrice: 20,
            sellingPrice: 35,
            quantity: 50
          }
        ]);
        setTimeout(() => {
          setShowPurchaseModal(false);
          setPurchaseSuccess(null);
        }, 2000);
      }
    } catch (err: any) {
      setPurchaseError(err.response?.data?.message || 'Failed to receive purchase order.');
    } finally {
      setIsSubmittingPO(false);
    }
  };

  const filtered = suppliers.filter((s) => {
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.phone.includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search suppliers by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              setPurchaseError(null);
              setPurchaseSuccess(null);
              setShowPurchaseModal(true);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Receive Purchase Order</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((sup) => (
          <div
            key={sup.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-3 hover:border-primary/40 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{sup.name}</h3>
                {sup.contactPerson && (
                  <p className="text-xs text-slate-500 font-medium">Attn: {sup.contactPerson}</p>
                )}
              </div>
              <div className="p-2 bg-blue-50 text-primary rounded-xl">
                <Truck className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{sup.phone}</span>
              </div>
              {sup.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{sup.email}</span>
                </div>
              )}
              {sup.address && (
                <div className="flex items-start space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{sup.address}</span>
                </div>
              )}
            </div>

            {sup.gstin && (
              <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100">
                GSTIN: {sup.gstin}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Add Supplier */}
      {showModal && (
        <div className="fixed inset-0 z-[100] backdrop-blur-md flex items-center justify-center p-4 transition-all">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Supplier Vendor</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Company / Supplier Name *</label>
                <input
                  type="text"
                  required
                  value={newSup.name}
                  onChange={(e) => setNewSup({ ...newSup, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Contact Person</label>
                <input
                  type="text"
                  value={newSup.contactPerson}
                  onChange={(e) => setNewSup({ ...newSup, contactPerson: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={newSup.phone}
                  onChange={(e) => setNewSup({ ...newSup, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={newSup.email}
                  onChange={(e) => setNewSup({ ...newSup, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Physical Address</label>
                <textarea
                  rows={2}
                  value={newSup.address}
                  onChange={(e) => setNewSup({ ...newSup, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">GSTIN Number</label>
                <input
                  type="text"
                  placeholder="e.g. 29ABCDE1234F1Z5"
                  value={newSup.gstin}
                  onChange={(e) => setNewSup({ ...newSup, gstin: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono uppercase focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Save Supplier
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Receive Purchase Order Multi-Batch */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-[100] backdrop-blur-md flex items-center justify-center p-4 transition-all">
          <form
            onSubmit={handlePurchaseSubmit}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Receive Stock Purchase Order</h3>
                <p className="text-xs text-slate-500">Atomic ingestion of multiple medicine batches into inventory under FEFO ledger.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPurchaseModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {purchaseSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{purchaseSuccess}</span>
              </div>
            )}

            {purchaseError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{purchaseError}</span>
              </div>
            )}

            {/* Supplier Selector */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Origin Supplier *</label>
              <select
                required
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full sm:w-96 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:border-primary focus:outline-none"
              >
                <option value="">-- Choose Vendor / Supplier --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.phone}) {s.gstin ? `• GSTIN: ${s.gstin}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Entry Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Batches Being Received ({purchaseBatches.length})
                </h4>
                <button
                  type="button"
                  onClick={handleAddBatchRow}
                  className="px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Batch</span>
                </button>
              </div>

              <div className="space-y-3">
                {purchaseBatches.map((b, idx) => (
                  <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 relative shadow-sm">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="font-bold text-xs text-slate-700">Batch #{idx + 1}</span>
                      {purchaseBatches.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBatchRow(idx)}
                          className="text-rose-500 hover:text-rose-700 text-xs font-bold flex items-center space-x-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                      <div className="sm:col-span-2">
                        <label className="block text-slate-600 font-medium mb-1">Medicine *</label>
                        <select
                          required
                          value={b.medicineId}
                          onChange={(e) => handleBatchChange(idx, 'medicineId', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:border-primary focus:outline-none"
                        >
                          <option value="">-- Choose Medicine --</option>
                          {medicines.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.dosageForm}) - SKU: {m.sku}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Batch Number *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. B2026-01"
                          value={b.batchNumber}
                          onChange={(e) => handleBatchChange(idx, 'batchNumber', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono uppercase focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Expiry Date *</label>
                        <input
                          type="date"
                          required
                          value={b.expiryDate}
                          onChange={(e) => handleBatchChange(idx, 'expiryDate', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Cost Price (₹) *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          required
                          value={b.costPrice}
                          onChange={(e) => handleBatchChange(idx, 'costPrice', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Quantity *</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={b.quantity}
                          onChange={(e) => handleBatchChange(idx, 'quantity', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-bold focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t gap-3">
              <div className="text-xs text-slate-600">
                <span>Calculated PO Total: </span>
                <span className="text-base font-black text-slate-900 ml-1">₹{totalPurchaseAmount.toFixed(2)}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPO}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {isSubmittingPO ? (
                    <span>Receiving Stock...</span>
                  ) : (
                    <>
                      <PackagePlus className="w-4 h-4" />
                      <span>Confirm Stock Ingestion</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
