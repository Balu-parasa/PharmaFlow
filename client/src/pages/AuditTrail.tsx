import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Activity, User as UserIcon, Calendar } from 'lucide-react';
import api from '../services/api';
import { AuditLog } from '../types';

export const AuditTrail: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/reports/audit-logs');
        if (res.data.success) {
          setLogs(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      (l.user?.name && l.user.name.toLowerCase().includes(q)) ||
      l.entity.toLowerCase().includes(q) ||
      (l.details && l.details.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center space-x-2 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold text-emerald-700 mb-2 border border-emerald-100">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>21 CFR Part 11 Compliant Audit Engine</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Immutable Regulatory Audit Trail
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete cryptographic audit log of inventory adjustments, sales transactions, returns, and security access events.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search action, user, or entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-primary focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6">Action Event</th>
                <th className="py-4 px-6">User / Actor</th>
                <th className="py-4 px-6">Target Entity</th>
                <th className="py-4 px-6">Audit Details & Parameters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 text-slate-500 whitespace-nowrap font-sans font-medium">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-block px-3 py-1 rounded-xl font-bold uppercase text-[11px] ${
                        log.action.includes('RETURN')
                          ? 'bg-amber-100 text-amber-800'
                          : log.action.includes('SALE')
                          ? 'bg-blue-100 text-blue-800'
                          : log.action.includes('ADJUST')
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-sans font-bold text-slate-900">
                    {log.user ? `${log.user.name} (${log.user.role})` : 'System Automated'}
                  </td>
                  <td className="py-4 px-6 font-sans font-semibold text-slate-700">
                    <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs">
                      {log.entity}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-600 font-mono text-[11px] break-all max-w-xl">
                    {log.details || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

