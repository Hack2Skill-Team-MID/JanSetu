import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Chip } from '../../../components/ui/chip';
import { Settings, Users, Database, LayoutTemplate, MoreHorizontal } from 'lucide-react';

export default function NgoWorkspacePage() {
  return (
    <div className="space-y-8 animate-fade-in text-[#191c1e]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#eceef0] pb-8 gap-6">
        <div>
          <Chip className="mb-4">Private Workspace</Chip>
          <h1 className="text-display-md text-[#131b2e] font-bold mt-2">Admin Command Center</h1>
          <p className="text-body-md text-[#45464d] mt-4 max-w-xl">
            Configure integrations, manage personnel tiers, and audit API usage for the organization node.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="tertiary" className="border border-[#e0e3e5]">Audit Logs</Button>
          <Button variant="action">Add Personnel</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Settings Navigation/Menu spanning 3 cols */}
        <div className="lg:col-span-3 space-y-2">
          {[
            { label: 'General Configuration', icon: Settings, active: true },
            { label: 'Access & Personnel', icon: Users, active: false },
            { label: 'Data & Integrations', icon: Database, active: false },
            { label: 'Interface Layers', icon: LayoutTemplate, active: false },
          ].map((nav, i) => (
            <div 
              key={i} 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                nav.active 
                  ? 'bg-[#131b2e] text-[#ffffff]' 
                  : 'text-[#45464d] hover:bg-[#eceef0] hover:text-[#191c1e]'
              }`}
            >
              <nav.icon className="w-4 h-4" />
              <span className="font-semibold text-sm">{nav.label}</span>
            </div>
          ))}
        </div>

        {/* Content Area spanning 9 cols */}
        <div className="lg:col-span-9 space-y-6">
          <Card className="border border-[#e0e3e5] shadow-none">
            <CardHeader className="border-b border-[#eceef0] p-6">
              <CardTitle>Organization Profile</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#45464d]">Organization Name</label>
                  <div className="h-10 w-full rounded-md bg-[#e0e3e5] px-3 flex items-center text-sm font-medium ghost-border">
                    JanSetu Global Relief
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#45464d]">Node Identification (NID)</label>
                  <div className="h-10 w-full rounded-md bg-[#e0e3e5] px-3 flex items-center text-sm font-medium ghost-border text-[#7c839b]">
                    NODE-8472-X
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#45464d]">Operational Charter</label>
                <div className="min-h-24 w-full rounded-md bg-[#e0e3e5] p-3 text-sm font-medium ghost-border">
                  Coordinating relief efforts across central administrative districts and routing capital directly to impacted zones.
                </div>
              </div>
              <div className="flex justify-end border-t border-[#eceef0] pt-6 mt-6">
                <Button>Save Configuration</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#e0e3e5] shadow-none">
            <CardHeader className="flex flex-row justify-between items-center border-b border-[#eceef0] p-6">
              <CardTitle>API Access Keys</CardTitle>
              <Button variant="tertiary" size="sm">Generate Key</Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[#eceef0]">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between p-6">
                    <div>
                      <h4 className="font-semibold text-[#191c1e] text-sm">Logistics Sync Token {i}</h4>
                      <p className="text-xs text-[#7c839b] mt-1 font-mono">sk_live_v2...89x</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-semibold text-[#45464d]">Last used: 2h ago</span>
                      <Button variant="tertiary" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
