import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Chip } from '../../../components/ui/chip';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SummaryPage() {
  return (
    <div className="flex flex-col min-h-[80vh] justify-center items-center text-center animate-fade-in text-[#191c1e] px-4">
      
      <div className="mb-8">
        <div className="mx-auto w-24 h-24 bg-[#6cf8bb] rounded-full flex items-center justify-center shadow-[0_0_64px_rgba(108,248,187,0.4)] mb-8">
          <CheckCircle2 className="w-12 h-12 text-[#00714d]" />
        </div>
        <Chip active className="mb-6">Phase Complete</Chip>
        <h1 className="text-display-lg text-[#131b2e] font-bold max-w-3xl mx-auto font-[family-name:var(--font-space-grotesk)]">
          Impact Summary Registered
        </h1>
        <p className="text-body-md text-[#45464d] mt-6 max-w-xl mx-auto text-lg leading-relaxed">
          Your contributions have been securely logged to the regional ledger. JanSetu operations continue optimizing distribution layers globally.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 w-full max-w-3xl mt-8">
         <Card className="bg-[#f2f4f6] shadow-none border-none">
           <CardContent className="p-6 text-center">
             <div className="text-[#45464d] text-sm font-semibold uppercase tracking-wider mb-2">Hours</div>
             <div className="text-4xl font-bold font-[family-name:var(--font-space-grotesk)] text-[#131b2e]">12</div>
           </CardContent>
         </Card>
         <Card className="bg-[#131b2e] shadow-none border-none">
           <CardContent className="p-6 text-center">
             <div className="text-[#bec6e0] text-sm font-semibold uppercase tracking-wider mb-2">Lives Reached</div>
             <div className="text-4xl font-bold font-[family-name:var(--font-space-grotesk)] text-[#ffffff]">8.4k</div>
           </CardContent>
         </Card>
         <Card className="bg-[#f2f4f6] shadow-none border-none">
           <CardContent className="p-6 text-center">
             <div className="text-[#45464d] text-sm font-semibold uppercase tracking-wider mb-2">Network Rank</div>
             <div className="text-4xl font-bold font-[family-name:var(--font-space-grotesk)] text-[#006c49]">Top 5%</div>
           </CardContent>
         </Card>
      </div>

      <div className="mt-16 flex items-center justify-center gap-6 border-t border-[#eceef0] pt-12 w-full max-w-3xl">
        <Link href="/dashboard/gateway">
          <Button variant="tertiary" className="h-12 px-8 text-base">Return to Gateway</Button>
        </Link>
        <Link href="/dashboard/volunteer">
          <Button className="h-12 px-8 text-base group">
            Continue Operating <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>

    </div>
  );
}
