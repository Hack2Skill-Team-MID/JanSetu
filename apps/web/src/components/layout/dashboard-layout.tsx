'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/auth-store';
import { useTranslation, LANGUAGES } from '../../lib/i18n';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarProvider, useSidebar } from './sidebar-context';
import { ChatbotWidget } from '../chat/chatbot-widget';
import NotificationBell from '../ui/NotificationBell';
import {
  LayoutDashboard, Map, Zap, CheckSquare, Users, Network, Heart,
  BookOpen, BarChart3, MessageSquare, Settings, Menu, Search, Bell,
  LogOut, User, ChevronDown, AlertTriangle, Trophy, Bot, Shield,
  MapPin, Target, Mic, Star, X, Package, Globe, FileText, Briefcase,
  IndianRupee, TrendingUp, Gift,
} from 'lucide-react';

// Role-based navigation config
const ROLE_NAV: Record<string, { name: string; href: string; icon: any }[]> = {
  ngo_coordinator: [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Campaigns', href: '/dashboard/campaigns', icon: Zap },
    { name: 'Community Needs', href: '/dashboard/needs', icon: MapPin },
    { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Volunteers', href: '/dashboard/volunteers', icon: Users },
    { name: 'NGO Network', href: '/dashboard/network', icon: Network },
    { name: 'Resources', href: '/dashboard/resources', icon: BookOpen },
    { name: 'Donations', href: '/dashboard/donate', icon: Heart },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Impact Map', href: '/dashboard/map', icon: Map },
    { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'AI Assistant', href: '/dashboard/ai-assistant', icon: Bot },
    { name: 'Emergency', href: '/dashboard/emergency', icon: AlertTriangle },
    { name: 'Fraud Detection', href: '/dashboard/admin', icon: Shield },
  ],
  admin: [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Campaigns', href: '/dashboard/campaigns', icon: Zap },
    { name: 'Community Needs', href: '/dashboard/needs', icon: MapPin },
    { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Volunteers', href: '/dashboard/volunteers', icon: Users },
    { name: 'NGO Network', href: '/dashboard/network', icon: Network },
    { name: 'Resources', href: '/dashboard/resources', icon: BookOpen },
    { name: 'Donations', href: '/dashboard/donate', icon: Heart },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Impact Map', href: '/dashboard/map', icon: Map },
    { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'AI Assistant', href: '/dashboard/ai-assistant', icon: Bot },
    { name: 'Emergency', href: '/dashboard/emergency', icon: AlertTriangle },
    { name: 'Fraud Detection', href: '/dashboard/admin', icon: Shield },
  ],
  platform_admin: [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Campaigns', href: '/dashboard/campaigns', icon: Zap },
    { name: 'Community Needs', href: '/dashboard/needs', icon: MapPin },
    { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Volunteers', href: '/dashboard/volunteers', icon: Users },
    { name: 'NGO Network', href: '/dashboard/network', icon: Network },
    { name: 'Resources', href: '/dashboard/resources', icon: BookOpen },
    { name: 'Donations', href: '/dashboard/donate', icon: Heart },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Impact Map', href: '/dashboard/map', icon: Map },
    { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'AI Assistant', href: '/dashboard/ai-assistant', icon: Bot },
    { name: 'Emergency', href: '/dashboard/emergency', icon: AlertTriangle },
    { name: 'Fraud Detection', href: '/dashboard/admin', icon: Shield },
  ],
  volunteer: [
    { name: 'My Portal', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Campaigns', href: '/dashboard/campaigns', icon: Zap },
    { name: 'Report a Need', href: '/dashboard/report-need', icon: Mic },
    { name: 'Impact Map', href: '/dashboard/map', icon: Map },
    { name: 'Resources', href: '/dashboard/resources', icon: BookOpen },
    { name: 'Donate', href: '/dashboard/donate', icon: Heart },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'NGO Network', href: '/dashboard/network', icon: Network },
    { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
    { name: 'AI Assistant', href: '/dashboard/ai-assistant', icon: Bot },
    { name: 'My Profile', href: '/dashboard/profile', icon: Settings },
  ],
  donor: [
    { name: 'My Impact', href: '/dashboard', icon: TrendingUp },
    { name: 'Donate', href: '/dashboard/donate', icon: Heart },
    { name: 'Campaigns', href: '/dashboard/campaigns', icon: Zap },
    { name: 'My Donations', href: '/dashboard/my-donations', icon: Gift },
    { name: 'NGO Network', href: '/dashboard/network', icon: Network },
    { name: 'Impact Map', href: '/dashboard/map', icon: Map },
    { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
    { name: 'AI Assistant', href: '/dashboard/ai-assistant', icon: Bot },
    { name: 'My Profile', href: '/dashboard/profile', icon: Settings },
  ],
  community: [
    { name: 'Discover', href: '/dashboard', icon: Star },
    { name: 'Find NGOs', href: '/dashboard/network', icon: Network },
    { name: 'Browse Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Live Needs Map', href: '/dashboard/map', icon: Map },
    { name: 'Campaign', href: '/dashboard/campaigns', icon: Zap },
    { name: 'Report a Need', href: '/dashboard/report-need', icon: Mic },
    { name: 'Donate', href: '/dashboard/donate', icon: Heart },
    { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
    { name: 'AI Assistant', href: '/dashboard/ai-assistant', icon: Bot },
    { name: 'My Profile', href: '/dashboard/profile', icon: Settings },
  ],
};

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
  platform_admin: { label: 'Platform Admin', color: 'bg-primary' },
  ngo_coordinator: { label: 'NGO Admin', color: 'bg-primary' },
  admin: { label: 'NGO Admin', color: 'bg-primary' },
  volunteer: { label: 'Volunteer', color: 'bg-secondary' },
  donor: { label: 'Donor', color: 'bg-accent' },
  community: { label: 'Community Member', color: 'bg-muted-foreground' },
};

// Sidebar component
function AppSidebar() {
  const { isOpen, closeSidebar } = useSidebar();
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();
  const role = String(user?.role || 'community');
  const navigation = ROLE_NAV[role] || ROLE_NAV.community;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden" onClick={closeSidebar} />
      )}

      <aside
        className={cn(
          'flex flex-col border-r border-border bg-background transition-all duration-300 ease-in-out',
          'h-[calc(100vh-64px)]',
          'md:relative fixed left-0 top-16 z-40',
          isOpen ? 'w-64' : 'w-0 overflow-hidden md:w-0 md:overflow-hidden'
        )}
      >
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-0.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSidebar}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">JanSetu v1.0 | Smart NGO Ecosystem</p>
        </div>
      </aside>
    </>
  );
}

// Navbar component
function AppNavbar() {
  const { toggleSidebar } = useSidebar();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { locale, setLocale } = useTranslation();
  const router = useRouter();
  const role = String(user?.role || 'community');
  const roleConf = ROLE_CONFIG[role] || ROLE_CONFIG.community;
  const [activeEmergency, setActiveEmergency] = useState<any>(null);

  useEffect(() => {
    const checkEmergency = async () => {
      try {
        const authStorage = typeof window !== 'undefined' ? localStorage.getItem('auth-storage') : null;
        if (!authStorage) return;
        const { state } = JSON.parse(authStorage);
        if (!state?.token) return;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/emergency/active`, {
          headers: { Authorization: `Bearer ${state.token}` },
        });
        const data = await res.json();
        if (data.success && data.data?.length > 0) setActiveEmergency(data.data[0]);
      } catch { /* ignore */ }
    };
    checkEmergency();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'JS';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="flex h-full items-center px-4 gap-3">
        {/* Menu button + Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-md text-sm">
            JS
          </div>
          <span className="text-lg font-bold text-foreground hidden sm:inline">JanSetu</span>
        </div>

        {/* Emergency banner */}
        {activeEmergency && (
          <Link href="/dashboard/emergency" className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-destructive/10 border border-destructive/30 animate-pulse flex-shrink-0">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            <span className="text-xs font-bold text-destructive">🚨 ACTIVE EMERGENCY</span>
          </Link>
        )}

        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <div className="hidden sm:flex items-center rounded-lg border border-border overflow-hidden">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLocale(lang.code)}
                title={lang.name}
                className={cn(
                  'px-2.5 py-1.5 text-xs font-bold transition-colors',
                  locale === lang.code
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Notifications */}
          <NotificationBell />

          {/* Role badge */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground">
            <span className={cn('h-2 w-2 rounded-full', roleConf.color)} />
            {roleConf.label}
          </div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="font-semibold">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground font-normal truncate">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" />Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

// Root layout wrapper
function DashboardInner({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();
  return (
    <div className="min-h-screen bg-background flex flex-col dark">
      <AppNavbar />
      <div className="flex flex-1 pt-16 overflow-hidden">
        <AppSidebar />
        <main className={cn('flex-1 overflow-auto transition-all duration-300', isOpen ? 'md:ml-0' : 'md:ml-0')}>
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
      <ChatbotWidget />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardInner>{children}</DashboardInner>
    </SidebarProvider>
  );
}
