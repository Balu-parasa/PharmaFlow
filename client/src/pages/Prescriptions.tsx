import React, { useState, useEffect } from 'react';
import { FileText, UserCheck, CheckCircle2, Clock, Plus, Search } from 'lucide-react';
import api from '../services/api';
import { Prescription, Medicine } from '../types';

export const Prescriptions: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // New Rx form
  const [newRx, setNewRx] = useState({
    customerName: '',
    customerPhone: '',
    doctorName: '',
    doctorLicense: '',
    clinicHospital: '',
    notes: '',
    items: [{ medicineId: '', dosageInstructions: '1 tablet twice daily after meals', quantityRequired: 10 }]
  });

  const loadPrescriptions = async () => {
    try {
      const res = await api.get('/prescriptions');
      if (res.data.success) {
        setPrescriptions(res.data.data);
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
    loadPrescriptions();
    loadMedicines();
  }, []);

  const handleAddItem = () => {
    setNewRx({
      ...newRx,
      items: [
        ...newRx.items,
        { medicineId: '', dosageInstructions: '1 tablet after food', quantityRequired: 10 }
      ]
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...newRx.items];
    (updated[index] as any)[field] = value;
    setNewRx({ ...newRx, items: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/prescriptions', newRx);
      if (res.data.success) {
        setShowModal(false);
        loadPrescriptions();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error recording prescription');
    }
  };

  const filtered = prescriptions.filter((rx) => {
    const q = search.toLowerCase();
    return (
      rx.prescriptionCode.toLowerCase().includes(q) ||
      rx.customer?.name?.toLowerCase().includes(q) ||
      rx.doctorName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Rx Code, Patient, Doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Prescription Entry</span>
        </button>
      </div>

      {/* Prescription Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((rx) => (
          <div
            key={rx.id}
            className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 space-y-4 hover:border-brand-500/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded">
                  {rx.prescriptionCode}
                </span>
                <h3 className="font-bold text-slate-800 text-sm mt-2">{rx.customer?.name}</h3>
                <p className="text-xs text-slate-500">Phone: {rx.customer?.phone || 'N/A'}</p>
              </div>

              <div>
                {rx.status === 'DISPENSED' ? (
                  <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 text-[11px] font-bold px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Dispensed</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 text-amber-700 bg-amber-50 text-[11px] font-bold px-2.5 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pending Dispense</span>
                  </span>
                )}
              </div>
            </div>

            {/* Doctor Info */}
            <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
              <div className="font-semibold text-slate-800">{rx.doctorName}</div>
              <div className="text-[11px] text-slate-400">
                {rx.clinicHospital} {rx.doctorLicense ? `• Lic: ${rx.doctorLicense}` : ''}
              </div>
              {rx.notes && <div className="mt-1 italic text-slate-500 font-serif">"{rx.notes}"</div>}
            </div>

            {/* Prescribed Items */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Prescribed Medicines
              </div>
              <div className="space-y-1.5">
                {rx.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 rounded bg-slate-50 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{item.medicine?.name}</div>
                      <div className="text-[11px] text-slate-500">{item.dosageInstructions}</div>
                    </div>
                    <div className="font-bold text-slate-700">{item.quantityRequired} units</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Rx Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-bold text-slate-800">Add New Prescription</h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Patient Name *</label>
                <input
                  type="text"
                  required
                  value={newRx.customerName}
                  onChange={(e) => setNewRx({ ...newRx, customerName: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Patient Phone</label>
                <input
                  type="text"
                  value={newRx.customerPhone}
                  onChange={(e) => setNewRx({ ...newRx, customerPhone: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Doctor Name *</label>
                <input
                  type="text"
                  required
                  value={newRx.doctorName}
                  onChange={(e) => setNewRx({ ...newRx, doctorName: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Doctor License / Reg No.</label>
                <input
                  type="text"
                  value={newRx.doctorLicense}
                  onChange={(e) => setNewRx({ ...newRx, doctorLicense: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Hospital / Clinic</label>
                <input
                  type="text"
                  value={newRx.clinicHospital}
                  onChange={(e) => setNewRx({ ...newRx, clinicHospital: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
            </div>

            {/* Prescribed Items section */}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">Prescription Medicines</span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-xs text-brand-600 font-bold hover:underline"
                >
                  + Add Another Medicine
                </button>
              </div>

              {newRx.items.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded mb-2 border space-y-2 text-xs">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <select
                        required
                        value={item.medicineId}
                        onChange={(e) => handleItemChange(idx, 'medicineId', e.target.value)}
                        className="w-full px-2 py-1 border rounded bg-white"
                      >
                        <option value="">-- Select Medicine --</option>
                        {medicines.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.dosageForm})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="number"
                        min="1"
                        required
                        placeholder="Qty"
                        value={item.quantityRequired}
                        onChange={(e) =>
                          handleItemChange(idx, 'quantityRequired', Number(e.target.value))
                        }
                        className="w-full px-2 py-1 border rounded bg-white text-center"
                      />
                    </div>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Dosage instruction (e.g. 1 tab morning & night)"
                      value={item.dosageInstructions}
                      onChange={(e) => handleItemChange(idx, 'dosageInstructions', e.target.value)}
                      className="w-full px-2 py-1 border rounded bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded text-xs font-semibold"
              >
                Save Prescription
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

