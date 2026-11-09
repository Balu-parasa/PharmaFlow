import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Edit2
} from 'lucide-react';
import api from '../services/api';
import { Medicine } from '../types';

export const MedicinesCatalogue: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);

  const [form, setForm] = useState({
    name: '',
    genericName: '',
    sku: '',
    barcode: '',
    category: 'Antibiotics',
    dosageForm: 'Tablet',
    strength: '500mg',
    minStockThreshold: 15,
    requiresPrescription: false,
    description: ''
  });

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const res = await api.get('/medicines');
      if (res.data.success) {
        setMedicines(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const openAddModal = () => {
    setEditingMed(null);
    setForm({
      name: '',
      genericName: '',
      sku: '',
      barcode: '',
      category: 'Antibiotics',
      dosageForm: 'Tablet',
      strength: '500mg',
      minStockThreshold: 15,
      requiresPrescription: false,
      description: ''
    });
    setShowModal(true);
  };

  const openEditModal = (med: Medicine) => {
    setEditingMed(med);
    setForm({
      name: med.name,
      genericName: med.genericName || '',
      sku: med.sku,
      barcode: med.barcode || '',
      category: med.category,
      dosageForm: med.dosageForm,
      strength: med.strength || '',
      minStockThreshold: med.minStockThreshold,
      requiresPrescription: med.requiresPrescription,
      description: med.description || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMed) {
        await api.put(`/medicines/${editingMed.id}`, form);
      } else {
        await api.post('/medicines', form);
      }
      setShowModal(false);
      loadMedicines();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save medicine');
    }
  };

  const categories = ['ALL', 'Antibiotics', 'Analgesics & Antipyretics', 'Antihistamines', 'Gastrointestinal', 'Cardiovascular', 'Respiratory'];

  const filtered = medicines.filter((m) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      m.name.toLowerCase().includes(q) ||
      (m.genericName && m.genericName.toLowerCase().includes(q)) ||
      m.sku.toLowerCase().includes(q) ||
      (m.barcode && m.barcode.includes(q));
    const matchesCat = categoryFilter === 'ALL' || m.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center space-x-3">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Brand, Generic, SKU or Barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slatebg border border-slate-200 rounded-xl text-xs text-textPrimary focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slatebg border border-slate-200 rounded-xl text-xs text-textPrimary font-semibold focus:outline-none focus:border-secondary"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md shadow-primary/20 transition-all self-end md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Medicine</span>
        </button>
      </div>

      {/* Catalogue Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-textSecondary">
            <thead className="bg-slatebg text-textPrimary uppercase font-bold text-[11px] border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-5">Medicine Item</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5">Dosage / Form</th>
                <th className="py-3.5 px-5 text-center">Shelf Stock</th>
                <th className="py-3.5 px-5">Earliest FEFO Expiry</th>
                <th className="py-3.5 px-5 text-center">Rx Required</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((med) => (
                <tr key={med.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-textPrimary text-sm">{med.name}</div>
                    <div className="text-[11px] text-textSecondary font-mono mt-0.5">
                      SKU: {med.sku} {med.genericName ? `• ${med.genericName}` : ''}
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="bg-slatebg text-slate-700 px-2.5 py-1 rounded-lg font-semibold text-[11px] border border-slate-200">
                      {med.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-medium text-textPrimary">
                    {med.dosageForm} {med.strength && `(${med.strength})`}
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full font-extrabold text-xs ${
                        med.isLowStock
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {med.totalStock} units
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    {med.nextExpiringBatch ? (
                      <div>
                        <span className="font-semibold text-textPrimary">
                          {new Date(med.nextExpiringBatch.expiryDate).toLocaleDateString()}
                        </span>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Batch: {med.nextExpiringBatch.batchNumber}
                        </p>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">No batches on shelf</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    {med.requiresPrescription ? (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full font-bold text-[10px]">
                        Prescription Req.
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium text-[10px]">
                        OTC
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => openEditModal(med)}
                      className="p-1.5 text-slate-500 hover:text-secondary rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add/Edit Medicine */}
      {showModal && (
        <div className="fixed inset-0 z-[100] backdrop-blur-md flex items-center justify-center p-4 transition-all">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-textPrimary">
                {editingMed ? 'Edit Medicine Details' : 'Add New Medicine to Catalogue'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block text-textPrimary font-semibold mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Paracetamol 650"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-textPrimary font-semibold mb-1">Generic Name</label>
                <input
                  type="text"
                  value={form.genericName}
                  onChange={(e) => setForm({ ...form, genericName: e.target.value })}
                  placeholder="e.g. Acetaminophen"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-textPrimary font-semibold mb-1">SKU *</label>
                <input
                  type="text"
                  required
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder="e.g. MED-PCM-650"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-textPrimary font-semibold mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
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
                <label className="block text-textPrimary font-semibold mb-1">Dosage Form</label>
                <select
                  value={form.dosageForm}
                  onChange={(e) => setForm({ ...form, dosageForm: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option>Tablet</option>
                  <option>Syrup</option>
                  <option>Capsule</option>
                  <option>Injection</option>
                  <option>Ointment</option>
                </select>
              </div>
              <div>
                <label className="block text-textPrimary font-semibold mb-1">Strength</label>
                <input
                  type="text"
                  value={form.strength}
                  onChange={(e) => setForm({ ...form, strength: e.target.value })}
                  placeholder="e.g. 650mg or 100ml"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-textPrimary font-semibold mb-1">Min. Threshold</label>
                <input
                  type="number"
                  min="0"
                  value={form.minStockThreshold}
                  onChange={(e) => setForm({ ...form, minStockThreshold: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="col-span-2 flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="rxReq"
                  checked={form.requiresPrescription}
                  onChange={(e) => setForm({ ...form, requiresPrescription: e.target.checked })}
                  className="rounded border-slate-300 text-secondary focus:ring-secondary"
                />
                <label htmlFor="rxReq" className="text-textPrimary font-semibold cursor-pointer">
                  Requires valid doctor prescription to dispense
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slatebg hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-xl text-xs font-bold"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

