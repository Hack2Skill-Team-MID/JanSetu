import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../../store/auth-store';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  MapPin,
  Briefcase,
  Target,
  Globe,
  Trophy,
  Package,
  Heart,
  IndianRupee,
  MessageSquare,
  Map
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const pathname = usePathname();

  const isNgo = user?.role === 'ngo_coordinator' || user?.role === 'ngo_admin' || user?.role === 'admin' || user?.role === 'platform_admin';

  const ngoNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Campaigns', href: '/dashboard/campaigns', icon: Target },
    { name: 'Manage Needs', href: '/dashboard/needs', icon: MapPin },
    { name: 'Process Surveys', href: '/dashboard/surveys', icon: FileText },
    { name: 'Resources', href: '/dashboard/resources', icon: Package },
    { name: 'Impact Map', href: '/dashboard/map', icon: Map },
    { name: 'Donate', href: '/dashboard/donate', icon: Heart },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'NGO Network', href: '/dashboard/network', icon: Globe },
    { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
    { name: 'Volunteers', href: '/dashboard/volunteers', icon: Users },
  ];

  const volunteerNavigation = [
    { name: 'My Portal', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Open Tasks', href: '/dashboard/tasks', icon: Briefcase },
    { name: 'Campaigns', href: '/dashboard/campaigns', icon: Target },
    { name: 'Impact Map', href: '/dashboard/map', icon: Map },
    { name: 'Donate', href: '/dashboard/donate', icon: Heart },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'NGO Network', href: '/dashboard/network', icon: Globe },
    { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
    { name: 'My Profile', href: '/dashboard/profile', icon: Settings },
  ];

  const navigation = isNgo ? ngoNavigation : volunteerNavigation;

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
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
                <p className="text-xs text-indigo-400 capitalize truncate">
                  {user?.role.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all
                    ${isActive 
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
                  `}
                >
                  <item.icon className={`mr-3 w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  {item.name}
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
              <LogOut className="mr-3 w-5 h-5 flex-shrink-0 text-slate-500 group-hover:text-red-400" />
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

          <div className="flex-1"></div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors relative">
              <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-indigo-500"></span>
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-auto bg-slate-950 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
