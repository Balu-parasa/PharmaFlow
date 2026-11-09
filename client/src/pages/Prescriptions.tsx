import React, { useState, useEffect } from 'react';
import { FileText, UserCheck, CheckCircle2, Clock, Plus, Search } from 'lucide-react';
import api from '../services/api';
import { Prescription, Medicine } from '../types';
import { ModalPortal } from '../components/ModalPortal';

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
    <div className="space-y-6 pb-10">
      {/* Header bar */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full text-xs font-bold text-primary mb-2 border border-blue-100">
            <FileText className="w-3.5 h-3.5" />
            <span>Digital Prescription & Clinical Workflow</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Clinical Prescriptions & Dispensing
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Validate physician licenses, cross-reference dosage instructions, and dispense controlled pharmaceuticals.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search by Rx Code, Patient, Doctor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 shadow-card transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Prescription</span>
          </button>
        </div>
      </div>

      {/* Prescription Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((rx) => (
          <div
            key={rx.id}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 space-y-4 hover:border-primary/40 hover:shadow-card-hover transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-xl">
                  {rx.prescriptionCode}
                </span>

                <div>
                  {rx.status === 'DISPENSED' ? (
                    <span className="inline-flex items-center space-x-1.5 text-emerald-700 bg-emerald-50 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Dispensed</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 text-amber-700 bg-amber-50 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Pending Dispense</span>
                    </span>
                  )}
                </div>
              </div>

              <h4 className="font-black text-slate-900 text-base">{rx.customer?.name}</h4>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Contact: {rx.customer?.phone || 'Not recorded'}</p>

              {/* Doctor Info */}
              <div className="mt-4 p-4 bg-slate-50/80 rounded-2xl text-xs text-slate-600 border border-slate-100 space-y-1">
                <div className="font-bold text-slate-800 text-sm">{rx.doctorName}</div>
                <div className="text-xs text-slate-400 font-medium">
                  {rx.clinicHospital} {rx.doctorLicense ? `• Lic: ${rx.doctorLicense}` : ''}
                </div>
                {rx.notes && <div className="mt-2 italic text-slate-600 font-serif border-t border-slate-200/50 pt-2">"{rx.notes}"</div>}
              </div>

              {/* Prescribed Items */}
              <div className="mt-4">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Prescribed Medicines ({rx.items.length})
                </div>
                <div className="space-y-2">
                  {rx.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white border border-slate-200/70 rounded-xl text-xs flex items-center justify-between shadow-sm"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{item.medicine?.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.dosageInstructions}</div>
                      </div>
                      <div className="text-right pl-3">
                        <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-800">
                          {item.quantityRequired} units
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Date: {new Date(rx.createdAt).toLocaleDateString()}</span>
              <span className="text-primary font-bold">FEFO Verified</span>
            </div>
          </div>
        ))}
      </div>

      {/* New Rx Modal */}
      {showModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-[9999] backdrop-blur-md flex items-center justify-center p-4 transition-all">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
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
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Save Prescription
                </button>
              </div>
            </form>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

