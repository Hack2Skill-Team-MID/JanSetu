'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../../store/auth-store';
import { useTranslation, LANGUAGES } from '../../lib/i18n';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Menu, X, Bell,
  MapPin, Briefcase, Target, Globe, Trophy, Package, Heart, IndianRupee,
  MessageSquare, Map, Bot, BarChart3, Shield, Mic, AlertTriangle, BookOpen,
  Handshake, Search, Building2, Gift, TrendingUp, Star, Network
} from 'lucide-react';
import NotificationBell from '../ui/NotificationBell';
import { ChatbotWidget } from '../chat/chatbot-widget';

const ROLE_CONFIG: Record<string, { label: string; color: string; gradientClass: string }> = {
  platform_admin:  { label: 'Platform Admin',    color: '#818cf8', gradientClass: 'from-indigo-500 to-violet-500' },
  ngo_coordinator: { label: 'NGO Admin',          color: '#818cf8', gradientClass: 'from-indigo-500 to-violet-500' },
  volunteer:       { label: 'NGO Volunteer',      color: '#34d399', gradientClass: 'from-emerald-500 to-teal-500' },
  community:       { label: 'Community Member',   color: '#fbbf24', gradientClass: 'from-amber-500 to-orange-500' },
  donor:           { label: 'Donor',              color: '#f472b6', gradientClass: 'from-pink-500 to-rose-500' },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const pathname = usePathname();
  const { t, locale, setLocale } = useTranslation();
  const [activeEmergency, setActiveEmergency] = useState<any>(null);

  // Check for active emergencies
  useEffect(() => {
    const checkEmergency = async () => {
      try {
        const authStorage = typeof window !== 'undefined' ? localStorage.getItem('auth-storage') : null;
        if (!authStorage) return;
        const { state } = JSON.parse(authStorage);
        if (!state.token) return;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/emergency/active`, {
          headers: { Authorization: `Bearer ${state.token}` },
        });
        const data = await res.json();
        if (data.success && data.data.length > 0) setActiveEmergency(data.data[0]);
      } catch { /* ignore */ }
    };
    checkEmergency();
  }, []);

  const role = String(user?.role || '');

  // ─── NGO ADMIN NAV ────────────────────────────────────────────────────────
  const ngoNavigation = [
    { name: 'Overview',         href: '/dashboard',                 icon: LayoutDashboard },
    { name: 'Campaigns',        href: '/dashboard/campaigns',       icon: Target },
    { name: 'Community Needs',  href: '/dashboard/needs',           icon: MapPin },
    { name: 'Tasks',            href: '/dashboard/tasks',           icon: Briefcase },
    { name: 'Volunteers',       href: '/dashboard/volunteers',      icon: Users },
    { name: 'Resources',        href: '/dashboard/resources',       icon: Package },
    { name: 'Surveys',          href: '/dashboard/surveys',         icon: FileText },
    { name: 'Donations',        href: '/dashboard/donate',          icon: IndianRupee },
    { name: 'Analytics',        href: '/dashboard/analytics',       icon: BarChart3 },
    { name: 'Impact Map',       href: '/dashboard/map',             icon: Map },
    { name: 'Messages',         href: '/dashboard/messages',        icon: MessageSquare },
    { name: 'NGO Network',      href: '/dashboard/network',         icon: Globe },
    { name: 'AI Assistant',     href: '/dashboard/ai-assistant',    icon: Bot },
    { name: 'Emergency',        href: '/dashboard/emergency',       icon: AlertTriangle },
    { name: 'Fraud Detection',  href: '/dashboard/admin',           icon: Shield },
    { name: 'API Docs',         href: '/dashboard/api-docs',        icon: BookOpen },
  ];

  // ─── VOLUNTEER NAV ────────────────────────────────────────────────────────
  const volunteerNavigation = [
    { name: 'My Portal',        href: '/dashboard',                 icon: LayoutDashboard },
    { name: 'My Tasks',         href: '/dashboard/tasks',           icon: Briefcase },
    { name: 'Campaigns',        href: '/dashboard/campaigns',       icon: Target },
    { name: 'Report a Need',    href: '/dashboard/report-need',     icon: Mic },
    { name: 'Impact Map',       href: '/dashboard/map',             icon: Map },
    { name: 'Resources',        href: '/dashboard/resources',       icon: Package },
    { name: 'Donate',           href: '/dashboard/donate',          icon: Heart },
    { name: 'Messages',         href: '/dashboard/messages',        icon: MessageSquare },
    { name: 'NGO Network',      href: '/dashboard/network',         icon: Globe },
    { name: 'Leaderboard',      href: '/dashboard/leaderboard',     icon: Trophy },
    { name: 'AI Assistant',     href: '/dashboard/ai-assistant',    icon: Bot },
    { name: 'My Profile',       href: '/dashboard/profile',         icon: Settings },
  ];

  // ─── COMMUNITY MEMBER NAV ─────────────────────────────────────────────────
  const communityNavigation = [
    { name: 'Discover',         href: '/dashboard',                 icon: Search },
    { name: 'Find NGOs',        href: '/dashboard/network',         icon: Building2 },
    { name: 'Browse Tasks',     href: '/dashboard/tasks',           icon: Briefcase },
    { name: 'Live Needs Map',   href: '/dashboard/map',             icon: Map },
    { name: 'Campaign',         href: '/dashboard/campaigns',       icon: Target },
    { name: 'Report a Need',    href: '/dashboard/report-need',     icon: Mic },
    { name: 'Donate',           href: '/dashboard/donate',          icon: Heart },
    { name: 'Leaderboard',      href: '/dashboard/leaderboard',     icon: Trophy },
    { name: 'AI Assistant',     href: '/dashboard/ai-assistant',    icon: Bot },
    { name: 'My Profile',       href: '/dashboard/profile',         icon: Settings },
  ];

  // ─── DONOR NAV ────────────────────────────────────────────────────────────
  const donorNavigation = [
    { name: 'My Impact',        href: '/dashboard',                 icon: TrendingUp },
    { name: 'Donate',           href: '/dashboard/donate',          icon: Heart },
    { name: 'Campaigns',        href: '/dashboard/campaigns',       icon: Target },
    { name: 'My Donations',     href: '/dashboard/my-donations',    icon: Gift },
    { name: 'NGO Network',      href: '/dashboard/network',         icon: Globe },
    { name: 'Impact Map',       href: '/dashboard/map',             icon: Map },
    { name: 'Leaderboard',      href: '/dashboard/leaderboard',     icon: Trophy },
    { name: 'AI Assistant',     href: '/dashboard/ai-assistant',    icon: Bot },
    { name: 'My Profile',       href: '/dashboard/profile',         icon: Settings },
  ];

  const getNavigation = () => {
    if (role === 'platform_admin' || role === 'ngo_coordinator' || role === 'admin') return ngoNavigation;
    if (role === 'volunteer') return volunteerNavigation;
    if (role === 'donor') return donorNavigation;
    return communityNavigation; // community or unknown
  };

  const navigation = getNavigation();
  const roleConf = ROLE_CONFIG[role] || ROLE_CONFIG['community'];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      {/* Mobile sidebar overlay bg */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 glass-card transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Emergency Banner */}
          {activeEmergency && (
            <div className="mx-3 mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 animate-pulse">
              <a href="/dashboard/emergency" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-red-400 truncate">🚨 ACTIVE EMERGENCY</p>
                  <p className="text-xs text-red-300/70 truncate">{activeEmergency.title}</p>
                </div>
              </a>
            </div>
          )}

          {/* Sidebar Header */}
          <div className="h-16 flex items-center px-6 border-b border-slate-700/50">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(79,70,229,0.5)]">
                <span className="font-bold text-sm text-white">JS</span>
              </div>
              <span className="font-bold text-lg text-slate-200 tracking-wide">JanSetu</span>
            </Link>
          </div>

          {/* User Profile Summary */}
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${roleConf.gradientClass} flex items-center justify-center text-white font-bold text-sm shadow-lg`}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-200 truncate">{user?.name}</p>
                <p className="text-xs font-medium truncate" style={{ color: roleConf.color }}>
                  {roleConf.label}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all
                    ${isActive
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
                  `}
                >
                  <item.icon className={`mr-3 w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  {t(`nav.${item.name.replace(/ /g, '')}`, item.name)}
                </Link>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-700/50">
            <button
              onClick={() => logout()}
              className="group flex w-full items-center px-3 py-2.5 text-sm font-medium rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <LogOut className="mr-3 w-4 h-4 flex-shrink-0 text-slate-500 group-hover:text-red-400" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-md sticky top-0 z-30">
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800 focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-800/70 rounded-lg border border-slate-700/50 overflow-hidden">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLocale(lang.code)}
                  className={`px-2.5 py-1.5 text-xs font-bold transition-colors ${
                    locale === lang.code
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`}
                  title={lang.name}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            {/* Notification Bell */}
            <NotificationBell />
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-auto bg-slate-950 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
      <ChatbotWidget />
    </div>
  );
}
