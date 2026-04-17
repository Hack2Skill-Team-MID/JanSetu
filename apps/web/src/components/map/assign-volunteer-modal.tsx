'use client';

import { useState } from 'react';
import { X, User, Hash } from 'lucide-react';

interface AssignVolunteerModalProps {
  crisisId: string;
  crisisTitle: string;
  onAssign: (crisisId: string, data: { volunteerName: string; volunteerId: string }) => void;
  onClose: () => void;
}

type InputMode = 'manual';

export default function AssignVolunteerModal({
  crisisId,
  crisisTitle,
  onAssign,
  onClose,
}: AssignVolunteerModalProps) {
  const [mode]              = useState<InputMode>('manual');
  const [volunteerName, setName] = useState('');
  const [volunteerId, setId]     = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!volunteerName.trim() || !volunteerId.trim()) return;
    setSubmitting(true);
    try {
      await onAssign(crisisId, { volunteerName: volunteerName.trim(), volunteerId: volunteerId.trim() });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100">Assign Volunteer</h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{crisisTitle}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex rounded-xl overflow-hidden border border-slate-700">
          <button className="flex-1 py-2 text-xs font-semibold bg-indigo-600 text-white">
            Manual Entry
          </button>
          <button className="flex-1 py-2 text-xs font-medium text-slate-400 bg-slate-800/60 hover:bg-slate-800 transition-colors border-l border-slate-700">
            From Database
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">Volunteer Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                value={volunteerName}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full pl-8 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none placeholder:text-slate-600"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">Volunteer ID</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                value={volunteerId}
                onChange={(e) => setId(e.target.value)}
                placeholder="e.g. VOL-20240118"
                className="w-full pl-8 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none placeholder:text-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 text-sm font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !volunteerName.trim() || !volunteerId.trim()}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all"
          >
            {submitting ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
}
