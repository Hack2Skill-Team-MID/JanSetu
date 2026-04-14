import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Chip } from '../../../components/ui/chip';
import { Shield, Clock, MapPin, Search } from 'lucide-react';
import { Input } from '../../../components/ui/input';

export default function VolunteerPage() {
  const tasks = [
    { id: 1, title: 'Emergency Supply Distribution', location: 'District 4, HQ', status: 'critical', active: true },
    { id: 2, title: 'Medical Support Logistics', location: 'City Hospital Annex', status: 'standard', active: false },
    { id: 3, title: 'Evacuation Coordination', location: 'Northern Sector', status: 'critical', active: false },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Editorial Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#eceef0] pb-8">
        <div className="max-w-2xl">
          <Chip className="mb-4">Live Hub</Chip>
          <h1 className="text-display-md text-[#131b2e] font-bold mt-2">Volunteer Action Portal</h1>
          <p className="text-body-md text-[#45464d] mt-4">
            Discover, claim, and execute critical community interventions. Filter by proximity or urgency.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 h-4 w-4 top-3 text-[#7c839b]" />
            <Input className="pl-9" placeholder="Search tasks by skill..." />
          </div>
          <Button variant="action">Search</Button>
        </div>
      </div>

      {/* Grid Layout without 1px dividers */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Main Feed: 2 columns wide */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-sm font-semibold text-[#191c1e]">Active Operations</h2>
            <Button variant="tertiary" className="text-sm">Filter & Sort</Button>
          </div>
          
          <div className="flex flex-col space-y-6">
            {tasks.map((task) => (
              <Card key={task.id} className="relative overflow-hidden group hover:shadow-[0_8px_32px_rgba(25,28,30,0.06)] transition-all">
                {task.status === 'critical' && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#ba1a1a]" />
                )}
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                       <Chip active={task.active}>{task.active ? 'Accepting Volunteers' : 'Pending Review'}</Chip>
                       {task.status === 'critical' && <span className="text-[#ba1a1a] text-xs font-semibold uppercase tracking-wider flex items-center gap-1"><Shield className="h-3 w-3" /> Priority</span>}
                    </div>
                    <CardTitle className="text-xl">{task.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-[#45464d]">
                      <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {task.location}</span>
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Posted 2h ago</span>
                    </div>
                  </div>
                  <Button variant={task.active ? 'action' : 'default'} className="hidden sm:inline-flex shrink-0">
                    {task.active ? 'Claim Task' : 'View Details'}
                  </Button>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar Info Panel */}
        <div className="space-y-6">
           <div className="bg-[#f2f4f6] rounded-2xl p-6 border-none">
             <h3 className="text-headline-sm font-semibold text-[#191c1e] mb-4">Your Operational Status</h3>
             <div className="space-y-4">
               <div className="flex justify-between items-center group cursor-pointer hover:bg-[#eceef0] p-3 -mx-3 rounded-lg transition-colors">
                 <span className="text-[#45464d]">Hours Logged</span>
                 <span className="text-[#191c1e] font-semibold text-lg font-[family-name:var(--font-space-grotesk)]">124</span>
               </div>
               <div className="flex justify-between items-center group cursor-pointer hover:bg-[#eceef0] p-3 -mx-3 rounded-lg transition-colors">
                 <span className="text-[#45464d]">Active Claims</span>
                 <span className="text-[#191c1e] font-semibold text-lg font-[family-name:var(--font-space-grotesk)]">2</span>
               </div>
               <div className="flex justify-between items-center group cursor-pointer hover:bg-[#eceef0] p-3 -mx-3 rounded-lg transition-colors">
                 <span className="text-[#45464d]">Team Rank</span>
                 <span className="text-[#006c49] font-bold text-lg font-[family-name:var(--font-space-grotesk)]">Elite</span>
               </div>
             </div>
             
             <div className="mt-8 pt-6 border-t border-[#e0e3e5]">
               <Button className="w-full justify-start text-[#191c1e]" variant="glass">
                 Update Availability Profile
               </Button>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
