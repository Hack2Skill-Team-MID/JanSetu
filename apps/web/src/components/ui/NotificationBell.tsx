'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

const TYPE_ICONS: Record<string, string> = {
  donation_received: '💰',
  task_assigned: '📋',
  emergency_alert: '🚨',
  campaign_update: '🎯',
  badge_earned: '🏆',
  message_received: '💬',
  need_reported: '📍',
  default: '🔔',
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/notifications?limit=15');
      if (res.data.success) {
        setNotifications(res.data.data.notifications);
        setUnreadCount(res.data.data.unreadCount);
      }
    } catch { /* ignore */ } finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      const deleted = notifications.find((n) => n.id === id);
      if (deleted && !deleted.isRead) setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* ignore */ }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) fetchNotifications(); }}
        className="p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors relative"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-10 w-80 max-h-[480px] glass-card rounded-2xl border border-slate-700/60 shadow-2xl shadow-black/40 z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-200">Notifications</h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <Bell className="w-8 h-8 text-slate-700 mb-2" />
                <p className="text-slate-500 text-sm">No notifications yet</p>
                <p className="text-slate-600 text-xs mt-1">Actions like donations and task assignments will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-800/30 transition-colors group ${!n.isRead ? 'bg-indigo-500/5' : ''}`}
                  >
                    <div className="text-lg flex-shrink-0 mt-0.5">
                      {TYPE_ICONS[n.type] || TYPE_ICONS.default}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${n.isRead ? 'text-slate-400' : 'text-slate-200'}`}>{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-[10px] text-slate-600 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.isRead && (
                        <button onClick={() => markRead(n.id)} className="p-1 rounded text-slate-500 hover:text-indigo-400" title="Mark as read">
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                      <button onClick={() => deleteNotification(n.id)} className="p-1 rounded text-slate-500 hover:text-red-400" title="Delete">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
