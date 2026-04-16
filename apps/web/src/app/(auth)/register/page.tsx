'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth-store';
import { Shield, Handshake, Globe, Heart, ArrowRight, Eye, EyeOff } from 'lucide-react';

const ROLES = [
  {
    id: 'ngo_coordinator',
    label: 'NGO Admin',
    tagline: 'Manage your NGO',
    icon: Shield,
    gradient: 'from-indigo-600 to-violet-600',
    color: 'indigo',
    textColor: 'text-indigo-400',
    border: 'border-indigo-500/50',
    bg: 'bg-indigo-500/10',
  },
  {
    id: 'volunteer',
    label: 'NGO Volunteer',
    tagline: 'Serve your community',
    icon: Handshake,
    gradient: 'from-emerald-600 to-teal-600',
    color: 'emerald',
    textColor: 'text-emerald-400',
    border: 'border-emerald-500/50',
    bg: 'bg-emerald-500/10',
  },
  {
    id: 'community',
    label: 'Community Member',
    tagline: 'Discover & join NGOs',
    icon: Globe,
    gradient: 'from-amber-500 to-orange-600',
    color: 'amber',
    textColor: 'text-amber-400',
    border: 'border-amber-500/50',
    bg: 'bg-amber-500/10',
  },
  {
    id: 'donor',
    label: 'Donor',
    tagline: 'Fund causes you care about',
    icon: Heart,
    gradient: 'from-pink-600 to-rose-600',
    color: 'pink',
    textColor: 'text-pink-400',
    border: 'border-pink-500/50',
    bg: 'bg-pink-500/10',
  },
];

function RegisterInner() {
  const searchParams = useSearchParams();
  const preRole = searchParams.get('role') || 'volunteer';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: preRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setCredentials = useAuthStore((state) => state.setCredentials);

  const selectedRole = ROLES.find((r) => r.id === formData.role) || ROLES[0];
  const RoleIcon = selectedRole.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      // community members register as volunteers initially
      const payload = { ...formData, role: formData.role === 'community' ? 'volunteer' : formData.role };
      const response = await api.post('/auth/register', payload);
      if (response.data.success) {
        setCredentials(response.data.data.token, response.data.data.user);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Bg glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(79,70,229,0.5)]">
            <span className="text-sm font-bold text-white">JS</span>
          </div>
          <span className="font-bold text-slate-200 text-lg">JanSetu</span>
        </Link>
        <Link href="/login" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
          Already have an account? <span className="text-indigo-400 font-medium">Sign in</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Join JanSetu</h1>
            <p className="text-slate-400">Be part of India's impact ecosystem</p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-slate-700/50">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
                {error}
              </div>
            )}

            {/* Role Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3">I am joining as</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const isSelected = formData.role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r.id })}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? `${r.border} ${r.bg}`
                          : 'border-slate-700/60 bg-slate-900/40 hover:border-slate-600'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${r.gradient} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${isSelected ? r.textColor : 'text-slate-300'}`}>{r.label}</p>
                        <p className="text-[10px] text-slate-500 truncate">{r.tagline}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="name">
                  Full Name {formData.role === 'ngo_coordinator' ? '/ Organization' : ''}
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all"
                  placeholder={formData.role === 'ngo_coordinator' ? 'Help India Foundation' : 'Ravi Kumar'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="reg-password">Password</label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 pr-11 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all"
                    placeholder="Min. 6 characters"
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

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-gradient-to-r ${selectedRole.gradient} hover:opacity-90 text-white font-semibold py-3 rounded-xl mt-2 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Join as {selectedRole.label} <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-slate-400 mt-5">
              Already have an account?{' '}
              <Link href="/login" className={`${selectedRole.textColor} hover:opacity-80 font-medium transition-colors`}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <RegisterInner />
    </Suspense>
  );
}
