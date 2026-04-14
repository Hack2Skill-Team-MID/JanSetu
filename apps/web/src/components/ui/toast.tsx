'use client';

import { create } from 'zustand';
import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// ─── Toast Store ────────────────────────────────────────
type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, variant?: ToastVariant, duration?: number) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, variant = 'info', duration = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({ toasts: [...state.toasts, { id, message, variant, duration }] }));
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

// Convenience hook
export function useToast() {
  const addToast = useToastStore((s) => s.addToast);
  return {
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'error'),
    warning: (msg: string) => addToast(msg, 'warning'),
    info: (msg: string) => addToast(msg, 'info'),
  };
}

// ─── Variant Config ─────────────────────────────────────
const VARIANT_CONFIG: Record<ToastVariant, { icon: typeof CheckCircle2; bg: string; border: string; text: string }> = {
  success: { icon: CheckCircle2, bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  error:   { icon: XCircle,      bg: 'bg-red-500/10',     border: 'border-red-500/30',     text: 'text-red-400' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-500/10',  border: 'border-amber-500/30',   text: 'text-amber-400' },
  info:    { icon: Info,          bg: 'bg-indigo-500/10',  border: 'border-indigo-500/30',  text: 'text-indigo-400' },
};

// ─── Single Toast Item ──────────────────────────────────
function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useToastStore((s) => s.removeToast);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => removeToast(toast.id), 300);
    }, toast.duration || 4000);
    return () => clearTimeout(timeout);
  }, [toast.id, toast.duration, removeToast]);

  const config = VARIANT_CONFIG[toast.variant];
  const Icon = config.icon;

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl
        ${config.bg} ${config.border}
        transition-all duration-300 ease-out
        ${isExiting ? 'opacity-0 translate-x-6 scale-95' : 'opacity-100 translate-x-0 scale-100'}
        animate-toast-in
      `}
    >
      <Icon className={`w-5 h-5 ${config.text} shrink-0`} />
      <p className="text-sm text-slate-200 flex-1 font-medium">{toast.message}</p>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => removeToast(toast.id), 300);
        }}
        className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Toast Container (add to layout) ────────────────────
export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
