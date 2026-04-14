import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Chip } from '../../../components/ui/chip';
import { TrendingUp, ArrowUpRight, IndianRupee, PieChart, Users } from 'lucide-react';

export default function DonationsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col border-b border-[#eceef0] pb-8">
        <Chip className="w-fit mb-4">Financial Transparency</Chip>
        <h1 className="text-display-md text-[#131b2e] font-bold mt-2">Funding Portal</h1>
        <p className="text-body-md text-[#45464d] mt-4 max-w-2xl">
          Track global resource pooling and individual campaign velocities in real-time. Transparent ledgers powered by structured impact forecasting.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Pooled', value: '₹4.2M', icon: IndianRupee, color: 'text-[#006c49]', trend: '+12%' },
          { label: 'Active Campaigns', value: '24', icon: TrendingUp, color: 'text-[#131b2e]', trend: '+3' },
          { label: 'Contributors', value: '1,420', icon: Users, color: 'text-[#131b2e]', trend: '+150' },
          { label: 'Resource Allocation', value: '88%', icon: PieChart, color: 'text-[#006c49]', trend: '+5%' },
        ].map((stat, i) => (
          <Card key={i} className="border border-[#e0e3e5] shadow-none hover:shadow-[0_4px_24px_rgba(25,28,30,0.04)] transition-all">
            <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
              <span className="text-sm font-semibold text-[#7c839b]">{stat.label}</span>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-[#191c1e]">{stat.value}</div>
              <div className="flex items-center gap-1 mt-2 text-sm text-[#006c49] font-medium">
                <ArrowUpRight className="h-4 w-4" />
                {stat.trend} this week
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mt-4">
        {/* Priority Campaigns List */}
        <div className="bg-[#f2f4f6] rounded-2xl p-6 lg:p-8 border-none">
           <h2 className="text-headline-sm font-semibold text-[#191c1e] mb-6">Priority Funding Vectors</h2>
           <div className="space-y-6">
             {[1, 2, 3].map((i) => (
               <div key={i} className="group cursor-pointer">
                 <div className="flex justify-between items-start mb-2">
                   <div>
                     <h3 className="text-[#191c1e] font-semibold text-lg group-hover:text-[#006c49] transition-colors">Phase 1 Logistics Deployment</h3>
                     <p className="text-[#45464d] text-sm mt-1">Requires immediate diesel and fleet allocation.</p>
                   </div>
                   <Chip active>Critical</Chip>
                 </div>
                 <div className="h-2 w-full bg-[#e0e3e5] rounded-full overflow-hidden mt-4">
                   <div className="h-full bg-[#131b2e]" style={{ width: `${80 - (i*15)}%` }} />
                 </div>
                 <div className="flex justify-between text-xs font-semibold text-[#7c839b] mt-2 uppercase tracking-wide">
                   <span>Raised: ₹{(80-i*15)}k</span>
                   <span>Goal: ₹100k</span>
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* Action Panel */}
        <div className="flex flex-col justify-between">
          <div className="bg-[#131b2e] rounded-2xl p-8 lg:p-12 text-[#ffffff] h-full flex flex-col justify-end relative overflow-hidden group">
             {/* Decorative Background Texture */}
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
             
             <div className="relative z-10 w-full">
               <h2 className="text-display-sm font-[family-name:var(--font-space-grotesk)] text-3xl font-bold leading-tight mb-4">
                 Inject Capital into the Ecosystem
               </h2>
               <p className="text-[#bec6e0] text-sm md:text-base leading-relaxed mb-8 max-w-sm">
                 Bypass the bureaucracy. Our smart ledgers route your donation directly to on-the-ground operational nodes.
               </p>
               <Button className="w-full h-14 text-base font-semibold bg-[#ffffff] text-[#131b2e] hover:bg-[#f2f4f6]">
                 Initiate Transfer
               </Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
