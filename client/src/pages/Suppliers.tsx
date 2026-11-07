import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, Phone, Mail, MapPin } from 'lucide-react';
import api from '../services/api';
import { Supplier } from '../types';

export const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [newSup, setNewSup] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    gstin: ''
  });

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

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/suppliers', newSup);
      if (res.data.success) {
        setShowModal(false);
        loadSuppliers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error adding supplier');
    }
  };

  const filtered = suppliers.filter((s) => {
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.phone.includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search suppliers by name or phone..."
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
          <span>Add Supplier</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((sup) => (
          <div
            key={sup.id}
            className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">{sup.name}</h3>
                {sup.contactPerson && (
                  <p className="text-xs text-slate-500 mt-0.5">Contact: {sup.contactPerson}</p>
                )}
              </div>
              <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
                <Truck className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
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
              <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-1.5 rounded">
                GSTIN: {sup.gstin}
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4"
          >
            <h3 className="text-lg font-bold text-slate-800">Add Supplier Vendor</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Company / Supplier Name *</label>
                <input
                  type="text"
                  required
                  value={newSup.name}
                  onChange={(e) => setNewSup({ ...newSup, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Contact Person</label>
                <input
                  type="text"
                  value={newSup.contactPerson}
                  onChange={(e) => setNewSup({ ...newSup, contactPerson: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={newSup.phone}
                  onChange={(e) => setNewSup({ ...newSup, phone: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={newSup.email}
                  onChange={(e) => setNewSup({ ...newSup, email: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={newSup.gstin}
                  onChange={(e) => setNewSup({ ...newSup, gstin: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Address</label>
                <textarea
                  rows={2}
                  value={newSup.address}
                  onChange={(e) => setNewSup({ ...newSup, address: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
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
                Save Supplier
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

