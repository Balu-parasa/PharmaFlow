import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';
import api from '../services/api';
import { User } from '../types';

export const UserDirectory: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/reports/users');
        if (res.data.success) {
          setUsers(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-textPrimary flex items-center space-x-2">
            <Users className="w-5 h-5 text-secondary" />
            <span>Staff & User Access Management</span>
          </h3>
          <p className="text-xs text-textSecondary mt-0.5">
            Role-Based Access Control (RBAC) directory for Administrators, Pharmacists, and Cashiers.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search staff name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slatebg border border-slate-200 rounded-xl text-xs text-textPrimary focus:outline-none focus:border-secondary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filtered.map((u) => (
          <div
            key={u.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-5 space-y-4 hover:shadow-card-hover transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    u.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-700'
                      : u.role === 'PHARMACIST'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {u.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-textPrimary">{u.name}</h4>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      u.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-700'
                        : u.role === 'PHARMACIST'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {u.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-textSecondary pt-2 border-t border-slate-100">
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{u.email}</span>
              </div>
              {u.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{u.phone}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-textSecondary font-medium">
              <span>Lifetime Transactions:</span>
              <span className="font-bold text-textPrimary">{u._count?.sales ?? 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

