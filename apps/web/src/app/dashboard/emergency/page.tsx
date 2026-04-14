import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Chip } from '../../../components/ui/chip';
import { AlertTriangle, Activity, MapPin, Radio, BellRing } from 'lucide-react';

export default function EmergencyPage() {
  return (
    <div className="space-y-8 animate-fade-in text-[#191c1e]">
      {/* High Alert Header section using Surface layering and error colors appropriately */}
      <div className="bg-[#ffdad6] rounded-3xl p-8 lg:p-12 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border border-[#ba1a1a]/20">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <AlertTriangle className="w-64 h-64 text-[#ba1a1a]" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ba1a1a] text-white text-xs font-bold uppercase tracking-wider rounded-md mb-6">
            <Radio className="w-4 h-4 animate-pulse" />
            Global Override Active
          </div>
          <h1 className="text-display-md text-[#93000a] font-bold font-[family-name:var(--font-space-grotesk)] leading-none text-4xl lg:text-5xl">
            Emergency Protocol
          </h1>
          <p className="text-[#93000a] mt-4 font-medium text-lg opacity-90">
            Standard operations are suspended. All local nodes report to the central crisis dispatch immediately. Dispatch unassigned fleet vehicles to Sector 7.
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <Button className="h-16 px-8 bg-[#ba1a1a] text-white hover:bg-[#93000a] text-lg rounded-xl shadow-[0_8px_32px_rgba(186,26,26,0.3)] border border-[#ffdad6]/20">
            Acknowledge Order
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-headline-sm font-semibold text-[#191c1e] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#ba1a1a]" /> Live Incident Feed
          </h2>
          
          <div className="space-y-4">
            {[1, 2, 3, 4].map((incident) => (
              <div key={incident} className="group bg-[#ffffff] border border-[#e0e3e5] rounded-xl p-5 hover:border-[#ba1a1a]/30 transition-colors">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-3 w-3 rounded-full bg-[#ba1a1a] shadow-[0_0_8px_rgba(186,26,26,0.6)] animate-pulse" />
                    <span className="font-semibold font-[family-name:var(--font-space-grotesk)] text-[#191c1e] text-lg">Multiple Casualties Reported</span>
                  </div>
                  <span className="text-xs font-bold text-[#ba1a1a] uppercase bg-[#ffdad6] px-2 py-1 rounded">Crit-L1</span>
                </div>
                <p className="text-[#45464d] text-sm leading-relaxed mb-4">
                  Seismic activity resulted in bridge collapse at Highway 49. Immediate medical evacuation required. Water supply disrupted.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#7c839b] font-medium border-t border-[#f2f4f6] pt-4">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Zone Alpha, 49th St</span>
                  <span className="flex items-center gap-1"><BellRing className="w-4 h-4" /> Updated 2m ago</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6 flex flex-col">
          <div className="bg-[#131b2e] rounded-2xl p-6 text-white border border-[#2d3133]">
            <h3 className="text-headline-sm font-[family-name:var(--font-space-grotesk)] text-xl font-bold mb-6">Dispatch Vectors</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-[#2d3133]">
                <span className="text-[#bec6e0] text-sm">MedEvac Units</span>
                <span className="font-bold text-lg">04</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#2d3133]">
                <span className="text-[#bec6e0] text-sm">Supply Convoys</span>
                <span className="font-bold text-lg">12</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#2d3133]">
                <span className="text-[#bec6e0] text-sm">Ground Volunteers</span>
                <span className="font-bold text-lg text-[#6cf8bb]">145</span>
              </div>
            </div>

            <Button className="w-full mt-8 bg-[#ffffff] text-[#131b2e] hover:bg-[#e0e3e5] h-12">
              Update Vectors
            </Button>
          </div>

          <div className="bg-[#f2f4f6] rounded-2xl p-6 flex-1 flex flex-col justify-center items-center text-center border border-[#e0e3e5]">
            <Radio className="w-10 h-10 text-[#7c839b] mb-4 opacity-50" />
            <p className="text-[#45464d] text-sm max-w-[200px] mb-4">You are securely connected to the central crisis dispatch network.</p>
            <Chip>Encrypted Link</Chip>
          </div>
        </div>
      </div>
    </div>
  );
}
