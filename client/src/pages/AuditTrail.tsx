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
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-textPrimary flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-accent" />
            <span>Immutable Regulatory Audit Trail</span>
          </h3>
          <p className="text-xs text-textSecondary mt-0.5">
            Complete cryptographic audit log of inventory adjustments, sales transactions, returns, and security actions.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search action, user, or entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slatebg border border-slate-200 rounded-xl text-xs text-textPrimary focus:outline-none focus:border-secondary"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-textSecondary">
            <thead className="bg-slatebg text-textPrimary uppercase font-bold text-[11px] border-b">
              <tr>
                <th className="py-3.5 px-5">Timestamp</th>
                <th className="py-3.5 px-5">Action</th>
                <th className="py-3.5 px-5">User</th>
                <th className="py-3.5 px-5">Target Entity</th>
                <th className="py-3.5 px-5">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-5 text-slate-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
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
                  <td className="py-3 px-5 font-sans font-semibold text-textPrimary">
                    {log.user ? `${log.user.name} (${log.user.role})` : 'System Automated'}
                  </td>
                  <td className="py-3 px-5 font-sans text-slate-700">{log.entity}</td>
                  <td className="py-3 px-5 text-slate-600 truncate max-w-md">
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

