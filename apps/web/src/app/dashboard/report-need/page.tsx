'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '../../../lib/api';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import { useAuthStore } from '../../../store/auth-store';
import {
  Mic, MicOff, Send, MapPin, AlertTriangle, Loader2,
  CheckCircle2, FileText
} from 'lucide-react';

const REGIONS = [
  'Delhi NCR', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata',
  'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
];

export default function ReportNeedPage() {
  const user = useAuthStore((s) => s.user);
  const [mode, setMode] = useState<'form' | 'voice'>('form');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const recognitionRef = useRef<any>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'other',
    urgency: 'medium',
    location: '',
  });

  const updateField = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  // Web Speech API
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser. Use Chrome.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      setTranscript(finalTranscript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const processVoice = async () => {
    if (!transcript.trim()) return;
    setSubmitting(true);
    try {
      // Send to AI for need extraction
      const res = await api.post('/surveys/process', {
        fileUrl: 'voice-input',
        fileType: 'text',
        rawText: transcript,
      });
      if (res.data.success && res.data.data.extractedNeeds?.length > 0) {
        const need = res.data.data.extractedNeeds[0];
        setForm({
          title: need.title || '',
          description: need.description || transcript,
          category: need.category || 'other',
          urgency: need.urgency || 'medium',
          location: need.location || '',
        });
        setAiResult(res.data.data);
        setMode('form');
      }
    } catch (err) {
      // Fallback: just put transcript in description
      setForm((p) => ({ ...p, description: transcript }));
      setMode('form');
    } finally {
      setSubmitting(false);
    }
  };

  const submitNeed = async () => {
    setSubmitting(true);
    try {
      const res = await api.post('/needs', form);
      if (res.data.success) {
        setSuccess(true);
        setForm({ title: '', description: '', category: 'other', urgency: 'medium', location: '' });
        setTranscript('');
        setAiResult(null);
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const CATEGORIES = [
    { value: 'water', label: '💧 Water' },
    { value: 'healthcare', label: '🏥 Healthcare' },
    { value: 'education', label: '📚 Education' },
    { value: 'food_security', label: '🍚 Food' },
    { value: 'sanitation', label: '🚽 Sanitation' },
    { value: 'infrastructure', label: '🏗️ Infrastructure' },
    { value: 'employment', label: '💼 Employment' },
    { value: 'safety', label: '🛡️ Safety' },
    { value: 'environment', label: '🌱 Environment' },
    { value: 'other', label: '📋 Other' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            Report Community Need
          </h1>
          <p className="text-slate-400 mt-1">Use voice or text to report a need in your community</p>
        </div>

        {success && (
          <div className="glass-card rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="text-sm font-semibold text-emerald-400">Need Reported Successfully!</h3>
              <p className="text-xs text-slate-400">Our team will review and prioritize it.</p>
            </div>
          </div>
        )}

        {/* Mode toggle */}
        <div className="flex gap-2">
          <button onClick={() => setMode('form')}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              mode === 'form' ? 'bg-indigo-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-400'
            }`}>
            <FileText className="w-4 h-4" /> Text Form
          </button>
          <button onClick={() => setMode('voice')}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              mode === 'voice' ? 'bg-indigo-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-400'
            }`}>
            <Mic className="w-4 h-4" /> Voice Input
          </button>
        </div>

        {/* Voice Mode */}
        {mode === 'voice' && (
          <div className="glass-card rounded-2xl border border-slate-800 p-8 text-center space-y-6">
            <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-500/20 border-2 border-red-500 animate-pulse'
                : 'bg-indigo-600/20 border-2 border-indigo-500'
            }`}>
              {isListening ? (
                <MicOff className="w-10 h-10 text-red-400" />
              ) : (
                <Mic className="w-10 h-10 text-indigo-400" />
              )}
            </div>

            <p className="text-sm text-slate-400">
              {isListening ? 'Listening... Speak about the community need' : 'Click the mic and describe the need in your own words'}
            </p>

            {transcript && (
              <div className="text-left bg-slate-800/50 rounded-xl p-4 text-sm text-slate-200 italic">
                "{transcript}"
              </div>
            )}

            <div className="flex gap-3 justify-center">
              {!isListening ? (
                <button onClick={startListening}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
                  <Mic className="w-4 h-4" /> Start Speaking
                </button>
              ) : (
                <button onClick={stopListening}
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
                  <MicOff className="w-4 h-4" /> Stop
                </button>
              )}
              {transcript && !isListening && (
                <button onClick={processVoice} disabled={submitting}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-40 transition-colors">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Process with AI
                </button>
              )}
            </div>
          </div>
        )}

        {/* Text Form Mode */}
        {mode === 'form' && (
          <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-5">
            {aiResult && (
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 flex items-center gap-2 text-xs text-indigo-300">
                <CheckCircle2 className="w-4 h-4" />
                AI auto-filled from your voice input (confidence: {Math.round((aiResult.confidence || 0.5) * 100)}%)
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">Title</label>
              <input value={form.title} onChange={(e) => updateField('title', e.target.value)}
                placeholder="Brief title of the need"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe the community need in detail..."
                rows={4}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none resize-none" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button key={c.value} onClick={() => updateField('category', c.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      form.category === c.value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 border border-slate-700 text-slate-400'
                    }`}>{c.label}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">Urgency</label>
                <select value={form.urgency} onChange={(e) => updateField('urgency', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none">
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="critical">🔴 Critical</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 flex items-center gap-1 mb-1.5">
                  <MapPin className="w-4 h-4" /> Location
                </label>
                <select value={form.location} onChange={(e) => updateField('location', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Select a location</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <button onClick={submitNeed} disabled={submitting || !form.title}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <><Send className="w-4 h-4" /> Submit Need Report</>
              )}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
