import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Activity, User as UserIcon, Calendar, Eye, CheckCircle2, AlertTriangle, ArrowRightLeft, PackagePlus, FileText, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { AuditLog } from '../types';

export const AuditTrail: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

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

  const parseDetails = (detailsStr?: string | null): Record<string, any> | null => {
    if (!detailsStr) return null;
    try {
      return JSON.parse(detailsStr);
    } catch {
      return null;
    }
  };

  const renderBadge = (key: string, val: any) => {
    let formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    let formattedVal = String(val);

    // Format currency or booleans
    if (typeof val === 'boolean') {
      formattedVal = val ? 'Verified' : 'False';
    } else if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('total') || key.toLowerCase().includes('price')) {
      formattedVal = `₹${Number(val).toLocaleString('en-IN')}`;
    }

    return (
      <span
        key={key}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-sans font-medium bg-slate-100/90 text-slate-700 border border-slate-200/80 shadow-xs hover:bg-slate-200/70 transition-colors"
      >
        <span className="text-slate-400 font-semibold">{formattedKey}:</span>
        <span className="font-bold text-slate-900">{formattedVal}</span>
      </span>
    );
  };

  const renderAuditDetails = (log: AuditLog) => {
    const parsed = parseDetails(log.details);
    if (!parsed) {
      return (
        <span className="text-slate-500 font-sans text-xs italic">
          {log.details || 'No parameters recorded'}
        </span>
      );
    }

    const entries = Object.entries(parsed);

    return (
      <div className="flex flex-wrap items-center gap-1.5 max-w-2xl py-1">
        {entries.slice(0, 4).map(([k, v]) => renderBadge(k, v))}
        {entries.length > 4 && (
          <button
            onClick={() => setSelectedLog(log)}
            className="inline-flex items-center text-[11px] font-bold text-primary hover:text-primary-focus bg-primary/10 px-2 py-1 rounded-lg transition-colors ml-1 cursor-pointer"
          >
            +{entries.length - 4} more
          </button>
        )}
      </div>
    );
  };

  const getActionBadge = (action: string) => {
    if (action.includes('SALE')) {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
        dot: 'bg-emerald-500',
        label: 'Sale Completed'
      };
    }
    if (action.includes('RETURN')) {
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200/70',
        dot: 'bg-amber-500',
        label: 'Return Processed'
      };
    }
    if (action.includes('ADJUST')) {
      return {
        bg: 'bg-purple-50 text-purple-700 border-purple-200/70',
        dot: 'bg-purple-500',
        label: 'Stock Adjusted'
      };
    }
    if (action.includes('PURCHASE') || action.includes('RESTOCK')) {
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200/70',
        dot: 'bg-blue-500',
        label: 'Stock Received'
      };
    }
    if (action.includes('CREATE')) {
      return {
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
        dot: 'bg-indigo-500',
        label: action.replace(/_/g, ' ')
      };
    }
    return {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
      label: action.replace(/_/g, ' ')
    };
  };

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
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
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
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-primary focus:bg-white transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Main Audit Table */}
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
                <th className="py-4 px-6 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium font-sans">
                    Loading regulatory audit records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium font-sans">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => {
                  const badge = getActionBadge(log.action);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 text-slate-600 whitespace-nowrap font-sans font-medium text-xs">
                        {new Date(log.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'medium'
                        })}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold uppercase text-[10px] tracking-wide border ${badge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-sans">
                        <div className="font-bold text-slate-900 text-xs">
                          {log.user ? log.user.name : 'System Automated'}
                        </div>
                        {log.user && (
                          <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                            {log.user.role}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 font-sans">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-lg text-[11px] border border-slate-200/60">
                          {log.entity}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {renderAuditDetails(log)}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-primary hover:text-white text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 text-primary rounded-2xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Audit Record Details
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: {selectedLog.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 font-semibold block mb-0.5">Timestamp:</span>
                  <span className="font-bold text-slate-900">
                    {new Date(selectedLog.createdAt).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'medium' })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block mb-0.5">Action:</span>
                  <span className="font-bold text-slate-900">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block mb-0.5">Authorized User:</span>
                  <span className="font-bold text-slate-900">
                    {selectedLog.user ? `${selectedLog.user.name} (${selectedLog.user.role})` : 'System Engine'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block mb-0.5">Target Entity:</span>
                  <span className="font-bold text-slate-900">{selectedLog.entity}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Parsed Parameter Key-Values
                </h4>
                {parseDetails(selectedLog.details) ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(parseDetails(selectedLog.details)!).map(([k, v]) => (
                      <div key={k} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                          {k.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="text-sm font-bold text-slate-900 mt-0.5">
                          {typeof v === 'boolean'
                            ? v ? 'True (Verified)' : 'False'
                            : k.toLowerCase().includes('amount') || k.toLowerCase().includes('total') || k.toLowerCase().includes('price')
                            ? `₹${Number(v).toLocaleString('en-IN')}`
                            : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-600 font-mono">
                    {selectedLog.details || 'No additional parameters provided.'}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Raw JSON Payload
                </h4>
                <pre className="p-3 bg-slate-950 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto max-h-40 border border-slate-800">
                  {selectedLog.details
                    ? JSON.stringify(parseDetails(selectedLog.details) || selectedLog.details, null, 2)
                    : '{}'}
                </pre>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
