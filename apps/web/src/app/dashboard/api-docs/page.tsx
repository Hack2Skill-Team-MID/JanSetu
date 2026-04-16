'use client';

import { useState } from 'react';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import {
  BookOpen, ChevronDown, ChevronRight, Copy, Check,
  Shield, Zap, Globe, Server, Code2
} from 'lucide-react';

const API_SECTIONS = [
  {
    title: 'Authentication',
    icon: Shield,
    color: 'text-emerald-400',
    endpoints: [
      { method: 'POST', path: '/api/auth/register', desc: 'Register a new user', body: '{ name, email, password, role }', response: '{ token, user }' },
      { method: 'POST', path: '/api/auth/login', desc: 'Login with credentials', body: '{ email, password }', response: '{ token, user }' },
      { method: 'GET', path: '/api/auth/me', desc: 'Get current user profile', body: null, response: '{ user }' },
    ],
  },
  {
    title: 'Campaigns',
    icon: Zap,
    color: 'text-indigo-400',
    endpoints: [
      { method: 'GET', path: '/api/campaigns', desc: 'List all campaigns', body: null, response: '{ campaigns[], total }' },
      { method: 'POST', path: '/api/campaigns', desc: 'Create a new campaign', body: '{ title, description, goal, category, ... }', response: '{ campaign }' },
      { method: 'GET', path: '/api/campaigns/:id', desc: 'Get campaign by ID', body: null, response: '{ campaign }' },
      { method: 'PATCH', path: '/api/campaigns/:id', desc: 'Update a campaign', body: '{ title?, description?, ... }', response: '{ campaign }' },
      { method: 'POST', path: '/api/campaigns/:id/donate', desc: 'Donate to a campaign', body: '{ amount }', response: '{ donation }' },
    ],
  },
  {
    title: 'Community Needs',
    icon: Globe,
    color: 'text-amber-400',
    endpoints: [
      { method: 'GET', path: '/api/needs', desc: 'List community needs', body: null, response: '{ needs[], total }' },
      { method: 'POST', path: '/api/needs', desc: 'Report a new need', body: '{ title, description, category, urgencyLevel, location }', response: '{ need }' },
      { method: 'PATCH', path: '/api/needs/:id', desc: 'Update need status', body: '{ status }', response: '{ need }' },
      { method: 'POST', path: '/api/surveys/process', desc: 'Process survey via AI', body: '{ responses[] }', response: '{ extractedNeeds[] }' },
    ],
  },
  {
    title: 'Resources & Tasks',
    icon: Server,
    color: 'text-cyan-400',
    endpoints: [
      { method: 'GET', path: '/api/resources', desc: 'List all resources', body: null, response: '{ resources[] }' },
      { method: 'POST', path: '/api/resources', desc: 'Register a resource', body: '{ name, type, quantity, location }', response: '{ resource }' },
      { method: 'POST', path: '/api/resources/match', desc: 'AI match resources to needs', body: '{ needId }', response: '{ matches[] }' },
      { method: 'GET', path: '/api/tasks', desc: 'List volunteer tasks', body: null, response: '{ tasks[] }' },
      { method: 'POST', path: '/api/tasks/:id/apply', desc: 'Apply for a task', body: null, response: '{ application }' },
    ],
  },
  {
    title: 'Emergency',
    icon: Zap,
    color: 'text-red-400',
    endpoints: [
      { method: 'POST', path: '/api/emergency/activate', desc: 'Declare an emergency', body: '{ declarationType, title, description, severity, affectedArea }', response: '{ emergency }' },
      { method: 'PATCH', path: '/api/emergency/:id/resolve', desc: 'Resolve an emergency', body: '{ resolutionNotes }', response: '{ emergency }' },
      { method: 'GET', path: '/api/emergency/active', desc: 'Get active emergencies', body: null, response: '{ emergencies[] }' },
      { method: 'POST', path: '/api/emergency/:id/broadcast', desc: 'Send emergency broadcast', body: '{ message }', response: '{ success }' },
    ],
  },
  {
    title: 'AI Bridge',
    icon: Code2,
    color: 'text-purple-400',
    endpoints: [
      { method: 'POST', path: '/api/ai-bridge/chatbot', desc: 'Chat with AI assistant', body: '{ message, context? }', response: '{ reply }' },
      { method: 'POST', path: '/api/ai-bridge/impact-report', desc: 'Generate AI impact report', body: '{ campaignId }', response: '{ report }' },
      { method: 'POST', path: '/api/ai-bridge/fraud-detect', desc: 'Run AI fraud detection', body: '{ entityType, entityId }', response: '{ analysis }' },
    ],
  },
  {
    title: 'Audit & Fraud',
    icon: Shield,
    color: 'text-orange-400',
    endpoints: [
      { method: 'GET', path: '/api/audit', desc: 'Get paginated audit logs', body: null, response: '{ logs[], total, page }' },
      { method: 'GET', path: '/api/audit/stats', desc: 'Get audit statistics', body: null, response: '{ totalLogs, todayLogs, ... }' },
      { method: 'GET', path: '/api/fraud/cases', desc: 'List fraud cases', body: null, response: '{ cases[], total }' },
      { method: 'POST', path: '/api/fraud/cases', desc: 'Create fraud case', body: '{ entityType, entityId, entityTitle, severity }', response: '{ fraudCase }' },
      { method: 'PATCH', path: '/api/fraud/cases/:id/resolve', desc: 'Resolve fraud case', body: '{ action, details }', response: '{ fraudCase }' },
    ],
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  POST: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PATCH: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  PUT: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  DELETE: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function ApiDocsPage() {
  const [expandedSection, setExpandedSection] = useState<number | null>(0);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(text);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            Platform API Reference
          </h1>
          <p className="text-slate-400 mt-1">Complete REST API documentation for integrations and development.</p>
        </div>

        {/* Base URL */}
        <div className="glass-card rounded-xl border border-slate-800 p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Base URL</span>
            <p className="text-sm font-mono text-indigo-300 mt-1">
              {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000'}/api
            </p>
          </div>
          <div className="text-xs text-slate-500">
            <span className="px-2 py-1 bg-emerald-500/15 text-emerald-400 rounded-md font-semibold">v1.0</span>
          </div>
        </div>

        {/* Auth Info */}
        <div className="glass-card rounded-xl border border-indigo-500/20 p-4 bg-indigo-500/5">
          <h3 className="text-sm font-semibold text-indigo-300 mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Authentication
          </h3>
          <p className="text-sm text-slate-400">
            Include the JWT token in the <code className="px-1.5 py-0.5 bg-slate-800 rounded text-indigo-300 text-xs">Authorization</code> header:
          </p>
          <div className="mt-2 bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-300 overflow-x-auto">
            Authorization: Bearer &lt;your_jwt_token&gt;
          </div>
        </div>

        {/* API Sections */}
        <div className="space-y-3">
          {API_SECTIONS.map((section, sIdx) => {
            const Icon = section.icon;
            const isExpanded = expandedSection === sIdx;
            return (
              <div key={sIdx} className="glass-card rounded-xl border border-slate-800 overflow-hidden">
                {/* Section Header */}
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : sIdx)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${section.color}`} />
                    <span className="font-semibold text-slate-200">{section.title}</span>
                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                      {section.endpoints.length} endpoints
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {/* Endpoints */}
                {isExpanded && (
                  <div className="border-t border-slate-800 divide-y divide-slate-800/50">
                    {section.endpoints.map((ep, eIdx) => (
                      <div key={eIdx} className="px-5 py-4 hover:bg-slate-900/50 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${METHOD_COLORS[ep.method]}`}>
                            {ep.method}
                          </span>
                          <code className="text-sm font-mono text-slate-200 flex-1">{ep.path}</code>
                          <button
                            onClick={() => copyToClipboard(ep.path)}
                            className="p-1 hover:bg-slate-800 rounded transition-colors"
                            title="Copy path"
                          >
                            {copiedPath === ep.path ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-slate-400 ml-14">{ep.desc}</p>

                        {ep.body && (
                          <div className="mt-2 ml-14">
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Request Body</span>
                            <div className="bg-slate-900 rounded-md px-3 py-1.5 mt-1 font-mono text-xs text-amber-300/80 inline-block">
                              {ep.body}
                            </div>
                          </div>
                        )}

                        <div className="mt-2 ml-14">
                          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Response</span>
                          <div className="bg-slate-900 rounded-md px-3 py-1.5 mt-1 font-mono text-xs text-emerald-300/80 inline-block">
                            {ep.response}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Rate Limiting Info */}
        <div className="glass-card rounded-xl border border-slate-800 p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Rate Limiting & Best Practices</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-start gap-2"><span className="text-indigo-400 mt-0.5">•</span> API rate limit: <strong className="text-slate-300">100 requests/minute</strong> per authenticated user</li>
            <li className="flex items-start gap-2"><span className="text-indigo-400 mt-0.5">•</span> All timestamps are returned in <strong className="text-slate-300">ISO 8601</strong> format (UTC)</li>
            <li className="flex items-start gap-2"><span className="text-indigo-400 mt-0.5">•</span> Pagination uses <code className="text-xs bg-slate-800 px-1 rounded">?page=1&limit=20</code> query parameters</li>
            <li className="flex items-start gap-2"><span className="text-indigo-400 mt-0.5">•</span> All responses follow the format: <code className="text-xs bg-slate-800 px-1 rounded">{"{ success: boolean, data?: any, error?: string }"}</code></li>
            <li className="flex items-start gap-2"><span className="text-indigo-400 mt-0.5">•</span> WebSocket events available for real-time updates on <code className="text-xs bg-slate-800 px-1 rounded">messages</code> and <code className="text-xs bg-slate-800 px-1 rounded">emergencies</code></li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
