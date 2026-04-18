'use client';

import { useState } from 'react';
import { X, User, Hash } from 'lucide-react';

interface AssignVolunteerModalProps {
  crisisId: string;
  crisisTitle: string;
  onAssign: (crisisId: string, data: { volunteerName: string; volunteerId: string }) => void;
  onClose: () => void;
}

export default function AssignVolunteerModal({
  crisisId,
  crisisTitle,
  onAssign,
  onClose,
}: AssignVolunteerModalProps) {
  const [volunteerName, setName] = useState('');
  const [volunteerId, setId]     = useState('');
  const [submitting, setSub]     = useState(false);
  const [mode, setMode]          = useState<'manual' | 'db'>('manual');

  const handleSubmit = async () => {
    if (!volunteerName.trim() || !volunteerId.trim()) return;
    setSub(true);
    try {
      await onAssign(crisisId, {
        volunteerName: volunteerName.trim(),
        volunteerId: volunteerId.trim(),
      });
      onClose();
    } finally {
      setSub(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: 'rgba(13,20,35,0.97)', border: '1px solid rgba(51,65,85,0.6)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-slate-800/60">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Assign Volunteer</h3>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-[220px]">{crisisTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-all flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex mx-5 mt-4 rounded-xl overflow-hidden border border-slate-700/50">
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 py-2 text-xs font-semibold transition-all ${
              mode === 'manual'
                ? 'bg-indigo-600 text-white'
                : 'bg-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setMode('db')}
            className={`flex-1 py-2 text-xs font-semibold border-l border-slate-700/50 transition-all ${
              mode === 'db'
                ? 'bg-indigo-600 text-white'
                : 'bg-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            From Database
          </button>
        </div>

        {/* Fields */}
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block mb-1.5">
              Volunteer Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
              <input
                value={volunteerName}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 bg-slate-800/60 border border-slate-700/50 focus:outline-none focus:border-indigo-500/60 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block mb-1.5">
              Volunteer ID
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
              <input
                value={volunteerId}
                onChange={(e) => setId(e.target.value)}
                placeholder="e.g. VOL-20240418"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 bg-slate-800/60 border border-slate-700/50 focus:outline-none focus:border-indigo-500/60 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600 text-xs font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !volunteerName.trim() || !volunteerId.trim()}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all"
          >
            {submitting ? 'Assigning...' : 'Assign Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
