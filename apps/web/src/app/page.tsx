import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight, BarChart3, Database } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function GatewayPage() {
  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background asymmetric geometric hint */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-tr from-[#eceef0] to-[#f7f9fb] transform rounded-full opacity-50 blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <main className="w-full max-w-[1400px] mx-auto px-6 py-24 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Column: Structural Asymmetry */}
        <div className="flex flex-col items-start space-y-8">
          <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold bg-[#e0e3e5] text-[#45464d] tracking-wide uppercase">
            <span className="flex h-2 w-2 rounded-full bg-[#006c49] mr-2"></span>
            Smart NGO Ecosystem
          </div>
          
          <h1 className="text-display-lg text-[#131b2e] max-w-2xl font-bold">
            The Digital Architect for Crisis Response
          </h1>
          
          <p className="text-body-md text-[#45464d] max-w-xl text-lg leading-relaxed">
            Unifying logistics, volunteer coordination, and global philanthropy into an
            intelligently structured operation console. Break boundaries. Respond faster.
          </p>
          
          <div className="flex items-center gap-4 pt-4">
            <Link href="/dashboard/gateway">
              <Button size="lg" className="h-14 px-8 text-base shadow-[0_4px_24px_rgba(19,27,46,0.15)] group">
                Enter Workspace
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="tertiary" size="lg" className="h-14 px-8 text-base">
                View Intelligence Report
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column: Information Data Vis Placeholder */}
        <div className="relative">
          <div className="rounded-2xl bg-[#ffffff] p-8 shadow-[0_16px_64px_rgba(25,28,30,0.08)] border border-[#e0e3e5] relative z-10 w-full h-[500px] flex flex-col">
            <div className="flex justify-between items-center pb-6 border-b border-[#eceef0]">
              <h3 className="text-headline-sm font-semibold text-[#131b2e]">Network Velocity</h3>
              <div className="h-10 w-10 rounded-full bg-[#f2f4f6] flex items-center justify-center">
                <BarChart3 className="text-[#006c49] h-5 w-5" />
              </div>
            </div>
            
            <div className="flex-1 flex flex-col justify-end mt-8 relative">
              {/* Mock Data Vis */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <Database className="h-32 w-32 text-[#bec6e0]" />
              </div>
              <div className="grid grid-cols-4 gap-4 items-end h-48 mt-auto z-10">
                <div className="bg-[#131b2e] rounded-t-sm w-full h-[40%]" />
                <div className="bg-[#131b2e] rounded-t-sm w-full h-[70%]" />
                <div className="bg-[#131b2e] rounded-t-sm w-full h-[100%]" />
                <div className="bg-[#006c49] rounded-t-sm w-full h-[130%]" />
              </div>
            </div>

            <div className="pt-6 mt-6 flex justify-between items-center text-sm text-[#45464d] border-t border-[#eceef0]">
              <span className="font-medium">Live Nodes</span>
              <span className="flex items-center text-[#006c49] font-bold">
                +14% <ChevronRight className="h-4 w-4 ml-1" />
              </span>
            </div>
          </div>

          {/* Decorative floating sub-card for hierarchy */}
          <div className="absolute -bottom-8 -left-8 bg-[#ffffff] p-6 rounded-xl shadow-[0_8px_32px_rgba(25,28,30,0.06)] border border-[#e0e3e5] z-20">
            <p className="text-xs font-bold text-[#7c839b] uppercase mb-1">Global Reach</p>
            <p className="text-2xl font-bold text-[#191c1e] font-[family-name:var(--font-space-grotesk)]">240,000+</p>
            <p className="text-sm text-[#45464d] mt-1 text-inter">Volunteers Dispatched</p>
          </div>
        </div>
      </main>
    </div>
  );
}
