'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth-store';
import {
  ShieldAlert, Activity, Users, AlertTriangle, ChevronRight,
  ShieldCheck, Search, Filter, MessageSquare, Clock, Gavel, FileText, CheckCircle2, FileQuestion
} from 'lucide-react';

export default function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState<'audit' | 'fraud'>('fraud');
  const user = useAuthStore((s) => s.user);

  if (!user || !['admin', 'platform_admin'].includes(user.role)) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <ShieldAlert className="w-16 h-16 text-red-500 mb-4 mx-auto" />
          <h2 className="text-xl font-bold text-slate-200">Access Denied</h2>
          <p className="text-slate-400 mt-2">You do not have permission to view the admin panel.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-red-400" />
            Platform Admin Panel
          </h1>
          <p className="text-slate-400 mt-1">Manage platform security, audit logs, and fraud escalations.</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab('fraud')}
            className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'fraud'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Fraud Escalations
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'audit'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            Audit Trail
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'fraud' ? <FraudTab /> : <AuditTab />}
      </div>
    </DashboardLayout>
  );
}

// ==========================================
// FRAUD TAB
// ==========================================
function FraudTab() {
  const [cases, setCases] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [noteContent, setNoteContent] = useState('');
  const [resolutionAction, setResolutionAction] = useState('warn');
  const [resolutionDetails, setResolutionDetails] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [casesRes, statsRes] = await Promise.all([
        api.get('/fraud/cases'),
        api.get('/fraud/stats'),
      ]);
      setCases(casesRes.data.data.cases);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectCase = async (id: string) => {
    try {
      const res = await api.get(`/fraud/cases/${id}`);
      setSelectedCase(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addNote = async () => {
    if (!noteContent.trim() || !selectedCase) return;
    try {
      const res = await api.post(`/fraud/cases/${selectedCase._id}/note`, { content: noteContent });
      setSelectedCase(res.data.data);
      setNoteContent('');
    } catch (err) {
      console.error(err);
    }
  };

  const resolveCase = async () => {
    if (!selectedCase) return;
    try {
      await api.patch(`/fraud/cases/${selectedCase._id}/resolve`, {
        action: resolutionAction,
        details: resolutionDetails,
      });
      setSelectedCase(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'critical': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      default: return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  if (loading && !cases.length) {
    return <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* List Column */}
      <div className="lg:col-span-1 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card rounded-xl border border-red-500/30 p-4">
            <p className="text-xs text-slate-400">Open Cases</p>
            <p className="text-2xl font-bold text-red-400">{stats?.open || 0}</p>
          </div>
          <div className="glass-card rounded-xl border border-slate-800 p-4">
            <p className="text-xs text-slate-400">Investigating</p>
            <p className="text-2xl font-bold text-yellow-400">{stats?.investigating || 0}</p>
          </div>
        </div>

        {/* Case List */}
        <div className="glass-card rounded-xl border border-slate-800 divide-y divide-slate-800">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-slate-200">Active Cases</h3>
            <button className="text-xs text-slate-400 hover:text-white"><Filter className="w-4 h-4" /></button>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {cases.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-emerald-500/50" />
                <p>No active fraud cases.</p>
              </div>
            ) : (
              cases.map((c) => (
                <div
                  key={c._id}
                  onClick={() => selectCase(c._id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedCase?._id === c._id ? 'bg-slate-800/80 border-l-2 border-red-500' : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-slate-400">{c.caseNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getSeverityStyle(c.severity)}`}>
                      {c.severity}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200 truncate">{c.entityTitle}</h4>
                  <p className="text-xs text-slate-500 mt-1 capitalize">{c.entityType} • {c.status}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Details Column */}
      <div className="lg:col-span-2">
        {selectedCase ? (
          <div className="glass-card rounded-xl border border-slate-800 flex flex-col h-full animate-fade-in min-h-[600px]">
            {/* Header */}
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-slate-400">{selectedCase.caseNumber}</span>
                <span className={`px-3 py-1 rounded-full text-xs uppercase font-bold border ${getSeverityStyle(selectedCase.severity)}`}>
                  {selectedCase.severity} Priority
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-100">{selectedCase.entityTitle}</h2>
              <div className="flex items-center gap-4 mt-3 text-sm text-slate-400">
                <span className="capitalize"><span className="font-semibold text-slate-300">Type:</span> {selectedCase.entityType}</span>
                <span className="capitalize"><span className="font-semibold text-slate-300">Source:</span> {selectedCase.source.replace('_', ' ')}</span>
                <span className="capitalize flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(selectedCase.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Content Array */}
            <div className="grid grid-cols-2 flex-1 overflow-hidden">
              {/* Left col: AI Details & Resolution */}
              <div className="p-6 border-r border-slate-800 overflow-y-auto">
                <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-400" /> AI Fraud Analysis
                </h3>
                {selectedCase.aiAnalysis && selectedCase.aiAnalysis.flags ? (
                  <div className="space-y-4">
                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-400">Risk Score</span>
                        <span className={`font-bold ${selectedCase.aiAnalysis.riskScore > 70 ? 'text-red-400' : 'text-yellow-400'}`}>
                          {selectedCase.aiAnalysis.riskScore}/100
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${selectedCase.aiAnalysis.riskScore > 70 ? 'bg-red-500' : 'bg-yellow-500'}`} 
                          style={{ width: `${selectedCase.aiAnalysis.riskScore}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2">Red Flags Detected</span>
                      <ul className="space-y-2">
                        {selectedCase.aiAnalysis.flags.map((flag: string, i: number) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="text-red-400 mt-0.5">•</span> {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 italic">No AI analysis available for this case.</div>
                )}

                {/* Resolution Action */}
                {selectedCase.status !== 'resolved' && (
                  <div className="mt-8 pt-6 border-t border-slate-800">
                     <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                      <Gavel className="w-4 h-4 text-emerald-400" /> Resolve Case
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Action to Take</label>
                        <select 
                          value={resolutionAction}
                          onChange={(e) => setResolutionAction(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
                        >
                          <option value="warn">Issue Warning</option>
                          <option value="suspend_user">Suspend User</option>
                          <option value="remove_campaign">Remove Campaign</option>
                          <option value="freeze_funds">Freeze Funds</option>
                          <option value="dismiss">Dismiss Flag (False Positive)</option>
                        </select>
                      </div>
                      <textarea
                        value={resolutionDetails}
                        onChange={(e) => setResolutionDetails(e.target.value)}
                        placeholder="Resolution details..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 resize-none h-20"
                      />
                      <button 
                        onClick={resolveCase}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        Confirm Resolution
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Col: Notes Timeline */}
              <div className="flex flex-col h-full bg-slate-900/30">
                <div className="p-4 border-b border-slate-800 bg-slate-900">
                  <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-400" /> Investigation Notes
                  </h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedCase.notes.length === 0 ? (
                    <div className="text-center text-slate-500 text-sm mt-4">No notes added yet.</div>
                  ) : (
                    selectedCase.notes.map((note: any, i: number) => (
                      <div key={i} className="bg-slate-800 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-semibold text-indigo-300">{note.authorName}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(note.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300">{note.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Note Input */}
                {selectedCase.status !== 'resolved' && (
                  <div className="p-4 border-t border-slate-800 bg-slate-900 mt-auto">
                    <textarea 
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Add an investigation note..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 resize-none h-16 mb-2"
                    />
                    <button 
                      onClick={addNote}
                      disabled={!noteContent.trim()}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      Add Note
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-xl border border-slate-800 flex flex-col items-center justify-center min-h-[600px] text-center p-8">
            <FileQuestion className="w-16 h-16 text-slate-700 mb-4 mx-auto" />
            <h3 className="text-lg font-semibold text-slate-300">No Case Selected</h3>
            <p className="text-slate-500 mt-1 max-w-sm mx-auto">Select a fraud case from the list to view its AI analysis, investigation timeline, and resolution options.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Dummy Bot Icon component
const Bot = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" />
    <line x1="16" y1="16" x2="16" y2="16" />
  </svg>
);

// ==========================================
// AUDIT TAB
// ==========================================
function AuditTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/audit');
      setLogs(res.data.data.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch(action) {
      case 'create': return 'text-emerald-400 bg-emerald-400/10';
      case 'delete': return 'text-red-400 bg-red-400/10';
      case 'update': return 'text-blue-400 bg-blue-400/10';
      case 'fraud_flag': return 'text-orange-400 bg-orange-400/10';
      default: return 'text-slate-400 bg-slate-800';
    }
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="glass-card rounded-xl border border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <h3 className="font-semibold text-slate-200">System Audit Trail</h3>
        <button className="text-sm text-indigo-400 hover:text-indigo-300">Export CSV</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-800">
              <th className="p-4 font-semibold">Timestamp</th>
              <th className="p-4 font-semibold">Action</th>
              <th className="p-4 font-semibold">Entity</th>
              <th className="p-4 font-semibold">Description</th>
              <th className="p-4 font-semibold">Actor</th>
              <th className="p-4 font-semibold">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {logs.map((log) => (
              <tr key={log._id} className="hover:bg-slate-800/30 text-sm border-b border-slate-800/50">
                <td className="p-4 text-slate-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getActionColor(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td className="p-4 text-slate-300 capitalize">{log.entity}</td>
                <td className="p-4 text-slate-300 max-w-xs truncate" title={log.description}>{log.description}</td>
                <td className="p-4 text-indigo-300 truncate max-w-[150px]">{log.actorName}</td>
                <td className="p-4 text-slate-500 font-mono text-xs">{log.ip || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div className="p-8 text-center text-slate-400">No audit logs found.</div>
        )}
      </div>
    </div>
  );
}
