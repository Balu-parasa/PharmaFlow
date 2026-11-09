import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Plus, 
  Search, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  ShieldAlert,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import api from '../services/api';
import { Medicine, Batch } from '../types';

export const Inventory: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'medicines' | 'batches' | 'alerts'>('medicines');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);

  // New Medicine Form State
  const [newMed, setNewMed] = useState({
    name: '',
    genericName: '',
    sku: '',
    barcode: '',
    category: 'Antibiotics',
    dosageForm: 'Tablet',
    strength: '500mg',
    minStockThreshold: 15,
    requiresPrescription: false
  });

  // New Batch Form State
  const [newBatch, setNewBatch] = useState({
    medicineId: '',
    batchNumber: '',
    expiryDate: '',
    costPrice: 20,
    sellingPrice: 35,
    quantity: 100
  });

  const loadData = async () => {
    try {
      const [medRes, batchRes] = await Promise.all([
        api.get('/medicines'),
        api.get('/inventory/batches')
      ]);
      if (medRes.data.success) setMedicines(medRes.data.data);
      if (batchRes.data.success) setBatches(batchRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/medicines', newMed);
      if (res.data.success) {
        setShowAddMedicineModal(false);
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating medicine');
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/inventory/batches', newBatch);
      if (res.data.success) {
        setShowAddBatchModal(false);
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating batch');
    }
  };

  const filteredMedicines = medicines.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchQuery =
      m.name.toLowerCase().includes(q) ||
      (m.genericName && m.genericName.toLowerCase().includes(q)) ||
      m.sku.toLowerCase().includes(q);
    const matchCategory = filterCategory === 'ALL' || m.category === filterCategory;
    return matchQuery && matchCategory;
  });

  const now = new Date();
  const expiringSoonBatches = batches.filter((b) => {
    const expiry = new Date(b.expiryDate);
    const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return diffDays > 0 && diffDays <= 30 && b.quantityInStock > 0;
  });

  const expiredBatches = batches.filter((b) => {
    return new Date(b.expiryDate) <= now && b.quantityInStock > 0;
  });

  return (
    <div className="space-y-6">
      {/* Action Header & Tabs */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('medicines')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'medicines'
                ? 'bg-primary text-white shadow-sm font-extrabold'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
            }`}
          >
            All Medicines ({medicines.length})
          </button>
          <button
            onClick={() => setActiveTab('batches')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'batches'
                ? 'bg-primary text-white shadow-sm font-extrabold'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
            }`}
          >
            All Batches ({batches.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'alerts'
                ? 'bg-rose-600 text-white shadow-sm font-extrabold'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Expiry Alerts ({expiringSoonBatches.length + expiredBatches.length})</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowAddBatchModal(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all border border-slate-200/70 shadow-sm"
          >
            <Plus className="w-4 h-4 text-slate-600" />
            <span>Receive New Batch</span>
          </button>
          <button
            onClick={() => setShowAddMedicineModal(true)}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Medicine</span>
          </button>
        </div>
      </div>

      {/* Main View: Medicines */}
      {activeTab === 'medicines' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Search & Filter Bar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search medicines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Medicine Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Dosage / Form</th>
                  <th className="py-3 px-4 text-center">Total Stock</th>
                  <th className="py-3 px-4">Next Expiry</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMedicines.map((med) => (
                  <tr key={med.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 text-sm">{med.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        SKU: {med.sku} {med.genericName ? `• ${med.genericName}` : ''}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium text-[11px]">
                        {med.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {med.dosageForm} {med.strength && `(${med.strength})`}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full font-bold text-xs ${
                          med.isLowStock
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {med.totalStock} units
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {med.nextExpiringBatch ? (
                        <div className="flex items-center space-x-1.5 text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(med.nextExpiringBatch.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No active batches</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800">
                      ₹{med.nextExpiringBatch?.sellingPrice?.toFixed(2) || '0.00'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Batches */}
      {activeTab === 'batches' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Batch Number</th>
                  <th className="py-3 px-4">Medicine</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4 text-center">In Stock / Initial</th>
                  <th className="py-3 px-4 text-right">Cost Price</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batches.map((batch) => {
                  const isExpired = new Date(batch.expiryDate) <= now;
                  return (
                    <tr key={batch.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {batch.batchNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {batch.medicine?.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className={isExpired ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                          {new Date(batch.expiryDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-slate-800">{batch.quantityInStock}</span>
                        <span className="text-slate-400"> / {batch.initialQuantity}</span>
                      </td>
                      <td className="py-3 px-4 text-right">₹{batch.costPrice.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800">
                        ₹{batch.sellingPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {batch.isRecalled ? (
                          <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold">
                            RECALLED
                          </span>
                        ) : isExpired ? (
                          <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-[10px] font-bold">
                            EXPIRED
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">
                            ACTIVE
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Expiry Alerts */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* Expired Batches */}
          <div className="bg-white rounded-xl border border-rose-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-rose-50 border-b border-rose-200 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-rose-800 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>Expired Stock ({expiredBatches.length} Batches) - Do Not Dispense!</span>
              </div>
            </div>
            <div className="p-4 divide-y divide-slate-100">
              {expiredBatches.length === 0 ? (
                <div className="text-slate-400 text-xs py-4 text-center">No expired batches found.</div>
              ) : (
                expiredBatches.map((b) => (
                  <div key={b.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{b.medicine?.name}</span>
                      <span className="text-slate-400 ml-2 font-mono">Batch: {b.batchNumber}</span>
                    </div>
                    <div className="text-rose-600 font-bold">
                      Expired on {new Date(b.expiryDate).toLocaleDateString()} ({b.quantityInStock} units in stock)
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Near Expiry Batches (< 30 days) */}
          <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-amber-800 font-bold text-sm">
                <Clock className="w-5 h-5 text-amber-600" />
                <span>Expiring Within 30 Days ({expiringSoonBatches.length} Batches)</span>
              </div>
            </div>
            <div className="p-4 divide-y divide-slate-100">
              {expiringSoonBatches.length === 0 ? (
                <div className="text-slate-400 text-xs py-4 text-center">No batches expiring within 30 days.</div>
              ) : (
                expiringSoonBatches.map((b) => (
                  <div key={b.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{b.medicine?.name}</span>
                      <span className="text-slate-400 ml-2 font-mono">Batch: {b.batchNumber}</span>
                    </div>
                    <div className="text-amber-700 font-bold">
                      Expiring on {new Date(b.expiryDate).toLocaleDateString()} ({b.quantityInStock} units left)
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Medicine */}
      {showAddMedicineModal && (
        <div className="fixed inset-0 z-[100] backdrop-blur-md flex items-center justify-center p-4 transition-all">
          <form
            onSubmit={handleCreateMedicine}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
          >
            <h3 className="text-lg font-bold text-slate-800">Add New Medicine to Catalog</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  placeholder="e.g. Paracetamol 500"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Generic Name</label>
                <input
                  type="text"
                  value={newMed.genericName}
                  onChange={(e) => setNewMed({ ...newMed, genericName: e.target.value })}
                  placeholder="e.g. Acetaminophen"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">SKU *</label>
                <input
                  type="text"
                  required
                  value={newMed.sku}
                  onChange={(e) => setNewMed({ ...newMed, sku: e.target.value })}
                  placeholder="e.g. MED-PCM-500"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Category</label>
                <select
                  value={newMed.category}
                  onChange={(e) => setNewMed({ ...newMed, category: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                >
                  <option>Antibiotics</option>
                  <option>Analgesics & Antipyretics</option>
                  <option>Antihistamines</option>
                  <option>Gastrointestinal</option>
                  <option>Cardiovascular</option>
                  <option>Respiratory</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Dosage Form</label>
                <select
                  value={newMed.dosageForm}
                  onChange={(e) => setNewMed({ ...newMed, dosageForm: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                >
                  <option>Tablet</option>
                  <option>Syrup</option>
                  <option>Capsule</option>
                  <option>Injection</option>
                  <option>Ointment</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowAddMedicineModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Save Medicine
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Add Batch */}
      {showAddBatchModal && (
        <div className="fixed inset-0 z-[100] backdrop-blur-md flex items-center justify-center p-4 transition-all">
          <form
            onSubmit={handleCreateBatch}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Receive Stock Batch</h3>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                FEFO Ready
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Select Medicine *</label>
                <select
                  required
                  value={newBatch.medicineId}
                  onChange={(e) => setNewBatch({ ...newBatch, medicineId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-primary focus:outline-none bg-slate-50 text-xs"
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
                  placeholder="e.g. BATCH-2024-X"
                  value={newBatch.batchNumber}
                  onChange={(e) => setNewBatch({ ...newBatch, batchNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:border-primary focus:outline-none text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={newBatch.expiryDate}
                  onChange={(e) => setNewBatch({ ...newBatch, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-primary focus:outline-none text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Cost Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newBatch.costPrice}
                  onChange={(e) => setNewBatch({ ...newBatch, costPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-primary focus:outline-none text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Selling Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newBatch.sellingPrice}
                  onChange={(e) => setNewBatch({ ...newBatch, sellingPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-primary focus:outline-none text-xs"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Quantity Received *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newBatch.quantity}
                  onChange={(e) => setNewBatch({ ...newBatch, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-primary focus:outline-none text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddBatchModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                Save & Restock Batch
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

