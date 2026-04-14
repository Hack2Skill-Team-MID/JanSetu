import React from 'react';
import { StitchSidebar } from './stitch-sidebar';
import { StitchTopbar } from './stitch-topbar';

interface StitchShellProps {
  children: React.ReactNode;
}

export function StitchShell({ children }: StitchShellProps) {
  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] selection:bg-[#006c49]/20 selection:text-[#006c49]">
      <StitchSidebar />
      <div className="flex flex-col lg:pl-64 min-h-screen">
        <StitchTopbar />
        <main className="flex-1 p-6 md:p-8 lg:p-12 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
