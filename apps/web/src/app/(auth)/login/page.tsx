'use client';

import { useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth-store';
import {
  Shield, Handshake, Globe, Heart, ArrowRight, ChevronDown,
  Eye, EyeOff, Sparkles
} from 'lucide-react';

const ROLES = [
  {
    id: 'ngo_coordinator',
    label: 'NGO Admin',
    tagline: 'I manage an NGO',
    icon: Shield,
    color: 'indigo',
    gradient: 'from-indigo-600 to-violet-600',
    glowColor: 'rgba(99,102,241,0.25)',
    borderColor: 'border-indigo-500/50',
    bgActive: 'bg-indigo-500/10',
    textActive: 'text-indigo-400',
    features: ['Manage campaigns & budgets', 'Oversee volunteers & tasks', 'Track resources & donations', 'AI fraud detection & analytics'],
    demoEmail: 'admin@jansetu.org',
    demoPassword: 'password123',
  },
  {
    id: 'volunteer',
    label: 'NGO Volunteer',
    tagline: "I'm part of an NGO team",
    icon: Handshake,
    color: 'emerald',
    gradient: 'from-emerald-600 to-teal-600',
    glowColor: 'rgba(16,185,129,0.25)',
    borderColor: 'border-emerald-500/50',
    bgActive: 'bg-emerald-500/10',
    textActive: 'text-emerald-400',
    features: ['View & apply for tasks', 'Earn badges & points', 'Track your impact hours', 'Message your team'],
    demoEmail: 'rohit@gmail.com',
    demoPassword: 'password123',
  },
  {
    id: 'community',
    label: 'Community Member',
    tagline: 'I want to find & serve NGOs',
    icon: Globe,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    glowColor: 'rgba(245,158,11,0.25)',
    borderColor: 'border-amber-500/50',
    bgActive: 'bg-amber-500/10',
    textActive: 'text-amber-400',
    features: ['Discover NGOs near you', 'Browse open volunteer tasks', 'Report community needs', 'Join campaigns'],
    demoEmail: 'sneha@gmail.com',
    demoPassword: 'password123',
  },
  {
    id: 'donor',
    label: 'Donor',
    tagline: 'I want to donate to causes',
    icon: Heart,
    color: 'pink',
    gradient: 'from-pink-600 to-rose-600',
    glowColor: 'rgba(236,72,153,0.25)',
    borderColor: 'border-pink-500/50',
    bgActive: 'bg-pink-500/10',
    textActive: 'text-pink-400',
    features: ['Fund verified campaigns', 'Donate anonymously', 'Track your impact', 'Get donation receipts'],
    demoEmail: 'vikram@gmail.com',
    demoPassword: 'password123',
  },
];

function LoginInner() {
  const searchParams = useSearchParams();
  const urlRole = searchParams.get('role');
  const initialRole = ROLES.find((r) => r.id === urlRole) || null;

  const [selectedRole, setSelectedRole] = useState<string | null>(initialRole?.id || null);
  const [email, setEmail] = useState(initialRole?.demoEmail || '');
  const [password, setPassword] = useState(initialRole?.demoPassword || '');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setCredentials = useAuthStore((state) => state.setCredentials);
  const formRef = useRef<HTMLDivElement>(null);

  const role = ROLES.find((r) => r.id === selectedRole) || null;

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    const r = ROLES.find((x) => x.id === roleId)!;
    setEmail(r.demoEmail);
    setPassword(r.demoPassword);
    setError('');
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        setCredentials(response.data.data.token, response.data.data.user);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to connect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const RoleIcon = role?.icon || Shield;

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(79,70,229,0.5)]">
            <span className="text-sm font-bold text-white">JS</span>
          </div>
          <span className="font-bold text-slate-200 text-lg">JanSetu</span>
        </Link>
        <Link href="/register" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
          New here? <span className="text-indigo-400 font-medium">Create account</span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 gap-12">
        {/* Role Selector */}
        <div className="w-full max-w-5xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/60 text-indigo-300 text-xs font-medium mb-4">
              <Sparkles className="w-3 h-3" />
              Smart Role-Based Access
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Who are you?</h1>
            <p className="text-slate-400 max-w-md mx-auto">Pick your role to get a personalized experience — the right tools, right features, right dashboard.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => handleRoleSelect(r.id)}
                  className={`relative group text-left p-5 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.02] ${
                    isSelected
                      ? `${r.borderColor} ${r.bgActive}`
                      : 'border-slate-700/60 bg-slate-900/40 hover:border-slate-600'
                  }`}
                  style={isSelected ? { boxShadow: `0 0 32px ${r.glowColor}` } : {}}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${r.gradient} flex items-center justify-center`}>
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}

                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${r.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <div className="mb-3">
                    <h3 className={`text-base font-bold mb-0.5 ${isSelected ? r.textActive : 'text-slate-100'}`}>{r.label}</h3>
                    <p className="text-xs text-slate-400">{r.tagline}</p>
                  </div>

                  <div className="space-y-1.5">
                    {r.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                        <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${r.gradient} flex-shrink-0`} />
                        {f}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <div
          ref={formRef}
          className={`w-full max-w-md transition-all duration-500 ${selectedRole ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        >
          {role && (
            <div
              className={`glass-card p-8 rounded-2xl border ${role.borderColor}/40`}
              style={{ boxShadow: `0 0 48px ${role.glowColor}` }}
            >
              {/* Role Context Tag */}
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-700/50">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${role.gradient}`}>
                  <RoleIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Signing in as</p>
                  <p className={`text-sm font-bold ${role.textActive}`}>{role.label}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRole(null)}
                  className="ml-auto text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Change
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="password">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 pr-11 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Demo hint */}
                <div className={`text-xs px-3 py-2 rounded-lg ${role.bgActive} border ${role.borderColor}/30`}>
                  <span className={`font-semibold ${role.textActive}`}>🔑 Demo:</span>
                  <span className="text-slate-400 ml-1">{role.demoEmail} / password123</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-gradient-to-r ${role.gradient} hover:opacity-90 text-white font-semibold py-3 rounded-xl mt-2 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Sign In as {role.label} <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-slate-400 mt-5">
                Don't have an account?{' '}
                <Link href={`/register?role=${selectedRole}`} className={`${role.textActive} hover:opacity-80 font-medium transition-colors`}>
                  Create account
                </Link>
              </p>
            </div>
          )}

          {!selectedRole && (
            <div className="text-center">
              <ChevronDown className="w-6 h-6 text-slate-600 mx-auto animate-bounce" />
              <p className="text-slate-500 text-sm mt-2">Select a role above to sign in</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginInner />
    </Suspense>
  );
}
