import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export function StitchTopbar() {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between px-6 glass border-b-0 shadow-sm transition-all duration-200">
      <div className="flex items-center gap-4 flex-1">
        <Button variant="tertiary" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="relative w-full max-w-md hidden md:flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-[#45464d]" />
          <Input 
            placeholder="Search platform..." 
            className="pl-9 bg-[#ffffff] border-none shadow-[0_4px_32px_rgba(25,28,30,0.06)] h-10 w-full rounded-full" 
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="tertiary" size="icon" className="rounded-full">
          <Bell className="h-5 w-5 text-[#45464d]" />
        </Button>
        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#131b2e] to-[#006c49] shadow-sm cursor-pointer" />
      </div>
    </header>
  );
}
