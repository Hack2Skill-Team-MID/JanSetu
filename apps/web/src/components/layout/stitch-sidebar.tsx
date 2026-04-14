import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, Target, Heart, ShieldAlert, FileText, Settings } from 'lucide-react';

export function StitchSidebar() {
  const navItems = [
    { name: 'Gateway', href: '/', icon: LayoutDashboard },
    { name: 'Volunteers', href: '/dashboard/volunteer', icon: Users },
    { name: 'Donations', href: '/dashboard/donations', icon: Heart },
    { name: 'Emergency', href: '/dashboard/emergency', icon: ShieldAlert },
    { name: 'NGO Admin', href: '/dashboard/ngo', icon: Settings },
    { name: 'Impact Summary', href: '/dashboard/summary', icon: FileText },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 bg-[#f7f9fb] shadow-[1px_0_0_0_rgba(198,198,205,0.2)] z-50">
      <div className="h-16 flex items-center px-6">
        <span className="text-xl font-bold text-[#191c1e] text-headline-sm tracking-tight text-gradient">JanSetu</span>
      </div>
      <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <p className="px-2 text-xs font-semibold text-[#7c839b] uppercase tracking-wider mb-4">Platform Architecture</p>
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#45464d] hover:bg-[#eceef0] hover:text-[#191c1e] transition-colors"
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </Link>
        ))}
      </div>
    </aside>
  );
}
