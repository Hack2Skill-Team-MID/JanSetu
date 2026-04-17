'use client';

import { useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth-store';
import {
  Shield, Handshake, Globe, Heart, ArrowRight, Eye, EyeOff, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ROLES = [
  {
    id: 'ngo_coordinator',
    label: 'NGO Admin',
    tagline: 'I manage an NGO',
    icon: Shield,
    gradient: 'from-blue-600 to-indigo-600',
    ringColor: 'ring-blue-500/40',
    bgActive: 'bg-blue-50',
    textActive: 'text-blue-700',
    borderActive: 'border-blue-500',
    dotColor: 'bg-blue-500',
    features: ['Manage campaigns & budgets', 'Oversee volunteers & tasks', 'Track resources & donations', 'AI fraud detection & analytics'],
    demoEmail: 'admin@jansetu.org',
    demoPassword: 'password123',
  },
  {
    id: 'volunteer',
    label: 'NGO Volunteer',
    tagline: "I'm part of an NGO team",
    icon: Handshake,
    gradient: 'from-emerald-500 to-green-600',
    ringColor: 'ring-emerald-500/40',
    bgActive: 'bg-emerald-50',
    textActive: 'text-emerald-700',
    borderActive: 'border-emerald-500',
    dotColor: 'bg-emerald-500',
    features: ['View & apply for tasks', 'Earn badges & points', 'Track your impact hours', 'Message your team'],
    demoEmail: 'rohit@gmail.com',
    demoPassword: 'password123',
  },
  {
    id: 'community',
    label: 'Community Member',
    tagline: 'I want to find & serve NGOs',
    icon: Globe,
    gradient: 'from-amber-500 to-orange-500',
    ringColor: 'ring-amber-500/40',
    bgActive: 'bg-amber-50',
    textActive: 'text-amber-700',
    borderActive: 'border-amber-500',
    dotColor: 'bg-amber-500',
    features: ['Discover NGOs near you', 'Browse open volunteer tasks', 'Report community needs', 'Join campaigns'],
    demoEmail: 'sneha@gmail.com',
    demoPassword: 'password123',
  },
  {
    id: 'donor',
    label: 'Donor',
    tagline: 'I want to donate to causes',
    icon: Heart,
    gradient: 'from-rose-500 to-pink-600',
    ringColor: 'ring-rose-500/40',
    bgActive: 'bg-rose-50',
    textActive: 'text-rose-700',
    borderActive: 'border-rose-500',
    dotColor: 'bg-rose-500',
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Subtle gradient circles */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-secondary/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-sm font-bold text-primary-foreground">JS</span>
          </div>
          <span className="font-bold text-foreground text-lg">JanSetu</span>
        </Link>
        <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          New here?{' '}
          <span className="text-primary font-medium">Create account</span>
        </Link>
      </header>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12 gap-10">
        {/* Hero text */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Sparkles className="w-3 h-3" />
            Smart Role-Based Access
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Who are you?</h1>
          <p className="text-muted-foreground max-w-sm mx-auto text-sm">
            Pick your role to get a personalized dashboard with the right tools.
          </p>
        </div>

        {/* Role Cards */}
        <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ROLES.map((r) => {
            const Icon = r.icon;
            const isSelected = selectedRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => handleRoleSelect(r.id)}
                className={cn(
                  'relative group text-left p-5 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-md bg-card',
                  isSelected
                    ? `${r.borderActive} ${r.bgActive} shadow-md`
                    : 'border-border hover:border-primary/30'
                )}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className={cn('w-5 h-5 rounded-full bg-gradient-to-br flex items-center justify-center', r.gradient)}>
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}

                <div className={cn('w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform', r.gradient)}>
                  <Icon className="w-5 h-5 text-white" />
                </div>

                <div className="mb-3">
                  <h3 className={cn('text-sm font-bold mb-0.5', isSelected ? r.textActive : 'text-foreground')}>{r.label}</h3>
                  <p className="text-xs text-muted-foreground">{r.tagline}</p>
                </div>

                <div className="space-y-1.5">
                  {r.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', r.dotColor)} />
                      {f}
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Login Form */}
        <div
          ref={formRef}
          className={cn(
            'w-full max-w-md transition-all duration-500',
            selectedRole ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          )}
        >
          {role && (
            <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
              {/* Role Context */}
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-border">
                <div className={cn('p-2 rounded-xl bg-gradient-to-br shadow-sm', role.gradient)}>
                  <RoleIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Signing in as</p>
                  <p className={cn('text-sm font-bold', role.textActive)}>{role.label}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRole(null)}
                  className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Change
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground" htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-input bg-background rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground" htmlFor="password">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-input bg-background rounded-xl px-4 py-2.5 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Demo hint */}
                <div className={cn('text-xs px-3 py-2.5 rounded-lg border', role.bgActive, role.borderActive + '/30')}>
                  <span className={cn('font-semibold', role.textActive)}>🔑 Demo: </span>
                  <span className="text-muted-foreground">{role.demoEmail} / password123</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    'w-full bg-gradient-to-r text-white font-semibold py-2.5 rounded-xl mt-1 transition-all shadow-md hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2',
                    role.gradient
                  )}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Sign In as {role.label} <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-5">
                Don't have an account?{' '}
                <Link href={`/register?role=${selectedRole}`} className={cn('font-medium hover:opacity-80 transition-colors', role.textActive)}>
                  Create account
                </Link>
              </p>
            </div>
          )}

          {!selectedRole && (
            <div className="text-center text-muted-foreground text-sm">
              ↑ Select a role above to sign in
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginInner />
    </Suspense>
  );
}
