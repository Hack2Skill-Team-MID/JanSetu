'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '../../../lib/api';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import { useAuthStore } from '../../../store/auth-store';
import {
  MessageSquare, Send, Radio, Users, ChevronRight, Clock
} from 'lucide-react';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [broadcastText, setBroadcastText] = useState('');
  const [sending, setSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore((s) => s.user);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConvos = async () => {
      try {
        const res = await api.get('/messages/conversations');
        if (res.data.success) setConversations(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConvos();
  }, []);

  useEffect(() => {
    if (!activeConvo) return;
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${activeConvo}`);
        if (res.data.success) setMessages(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, [activeConvo]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConvo) return;
    setSending(true);
    try {
      await api.post('/messages/send', {
        content: newMessage,
        type: 'direct',
      });
      setMessages((prev) => [...prev, {
        senderId: { _id: user?._id, name: user?.name },
        content: newMessage,
        createdAt: new Date().toISOString(),
      }]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const sendBroadcast = async () => {
    if (!broadcastText.trim()) return;
    setSending(true);
    try {
      await api.post('/messages/broadcast', {
        content: broadcastText,
        priority: 'normal',
      });
      setBroadcastText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const isAdmin = ['ngo_admin', 'ngo_coordinator', 'admin', 'platform_admin'].includes(user?.role || '');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-indigo-400" />
          Messaging Center
        </h1>

        {/* Broadcast panel for admins */}
        {isAdmin && (
          <div className="glass-card rounded-2xl border border-slate-800 p-5">
            <h2 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400" /> Broadcast to Organization
            </h2>
            <div className="flex gap-3">
              <input
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                placeholder="Type announcement..."
                className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && sendBroadcast()}
              />
              <button onClick={sendBroadcast} disabled={!broadcastText.trim() || sending}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-semibold disabled:opacity-40 flex items-center gap-2 transition-colors">
                <Radio className="w-4 h-4" /> Broadcast
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: '500px' }}>
          {/* Conversation list */}
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" /> Conversations
              </h2>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center">
                <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No conversations yet</p>
                <p className="text-xs text-slate-500 mt-1">Start messaging team members</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {conversations.map((c: any) => (
                  <button key={c._id} onClick={() => setActiveConvo(c._id)}
                    className={`w-full text-left p-4 hover:bg-slate-800/30 transition-colors ${
                      activeConvo === c._id ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500' : ''
                    }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-200 truncate">
                        {c.type === 'broadcast' ? '📢 Broadcast' : `💬 ${c._id.slice(3, 15)}...`}
                      </span>
                      {c.unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-xs text-white flex items-center justify-center">{c.unread}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-1">{c.lastMessage}</p>
                    <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {new Date(c.lastAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Message thread */}
          <div className="lg:col-span-2 glass-card rounded-2xl border border-slate-800 flex flex-col">
            {!activeConvo ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">Select a conversation</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96">
                  {messages.map((m: any, idx: number) => {
                    const isMe = m.senderId?._id === user?._id || m.senderId === user?._id;
                    return (
                      <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-4 py-2.5 rounded-2xl ${
                          isMe ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200'
                        }`}>
                          {!isMe && (
                            <div className="text-xs font-semibold text-indigo-400 mb-1">
                              {m.senderId?.name || 'Unknown'}
                            </div>
                          )}
                          <p className="text-sm">{m.content}</p>
                          <div className={`text-xs mt-1 ${isMe ? 'text-indigo-200' : 'text-slate-500'}`}>
                            {new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEnd} />
                </div>

                <div className="p-4 border-t border-slate-800">
                  <div className="flex gap-2">
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button onClick={sendMessage} disabled={!newMessage.trim() || sending}
                      className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-40 transition-colors">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
