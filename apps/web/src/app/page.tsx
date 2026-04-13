import Link from 'next/link';
import { ArrowRight, Shield, Activity, Users, Target, Heart, Globe, Sparkles, TrendingUp, Award } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute top-20 left-10 w-64 h-64 bg-pink-600/5 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="container px-4 text-center z-10 max-w-5xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/60 text-indigo-300 text-sm font-medium mb-8 backdrop-blur-md animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Smart NGO Ecosystem Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Connect. Collaborate.
            </span>
            <br />
            Create Impact.
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-fade-in leading-relaxed">
            JanSetu unifies NGOs, volunteers, donors, and communities into one intelligent 
            ecosystem&nbsp;— powered by AI to maximize every rupee and every volunteer hour.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center animate-fade-in">
            <Link
              href="/register"
              className="px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-[0_0_24px_rgba(79,70,229,0.5)] hover:shadow-[0_0_36px_rgba(79,70,229,0.7)] flex items-center gap-2 group w-full sm:w-auto justify-center"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 font-semibold transition-all w-full sm:w-auto justify-center flex backdrop-blur-md"
            >
              Log In
            </Link>
          </div>

          {/* Live stats */}
          <div className="grid grid-cols-4 gap-6 mt-16 animate-fade-in">
            {[
              { value: '2+', label: 'NGOs Connected', icon: Globe },
              { value: '3', label: 'Active Campaigns', icon: Target },
              { value: '5', label: 'Volunteers', icon: Users },
              { value: '₹42K+', label: 'Donations Raised', icon: Heart },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Who Section */}
      <section className="w-full py-24 relative">
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">One platform for <span className="text-indigo-400">everyone</span></h2>
            <p className="text-slate-400 max-w-lg mx-auto">Whether you run an NGO, volunteer, donate, or report community needs — JanSetu has your workspace.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'NGO Admins',
                desc: 'Manage campaigns, resources, volunteers, and track trust scores — all in one private workspace.',
                icon: Shield, color: 'indigo',
                features: ['Campaign Builder', 'Resource Inventory', 'Trust Dashboard'],
              },
              {
                title: 'Volunteers',
                desc: 'Get AI-matched to tasks that fit your skills. Earn points, climb the leaderboard, collect badges.',
                icon: Users, color: 'emerald',
                features: ['Smart Matching', 'Gamification', 'Impact Tracking'],
              },
              {
                title: 'Donors',
                desc: 'Fund verified campaigns, donate anonymously, and see exactly where your money goes.',
                icon: Heart, color: 'pink',
                features: ['Verified NGOs', 'Impact Reports', 'Tax Receipts'],
              },
              {
                title: 'Communities',
                desc: 'Report local needs, upload surveys, and watch as NGOs mobilize resources in response.',
                icon: Activity, color: 'amber',
                features: ['Need Reporting', 'Survey Upload', 'Live Status'],
              },
            ].map((role, i) => (
              <div key={i} className="glass-card rounded-2xl border border-slate-800 p-6 hover:border-indigo-500/30 transition-all group">
                <div className={`w-12 h-12 rounded-xl bg-${role.color}-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <role.icon className={`w-6 h-6 text-${role.color}-400`} />
                </div>
                <h3 className="text-lg font-semibold text-slate-100 mb-2">{role.title}</h3>
                <p className="text-sm text-slate-400 mb-4">{role.desc}</p>
                <div className="space-y-2">
                  {role.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-24 relative border-t border-slate-800/50">
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Powered by <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Intelligence</span>
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">AI-driven features that make every operation smarter.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles, title: 'AI Impact Reports',
                desc: 'Auto-generated campaign impact narratives. Show donors exactly what their money achieved with data-backed stories.',
              },
              {
                icon: Shield, title: 'Trust & Fraud Detection',
                desc: 'Every NGO gets a real-time trust score. AI flags suspicious campaigns, donation patterns, and fake accounts.',
              },
              {
                icon: TrendingUp, title: 'Crisis Prediction',
                desc: 'Analyze regional trends and predict upcoming crises — so resources reach communities before disasters strike.',
              },
              {
                icon: Users, title: 'Smart Volunteer Matching',
                desc: 'AI matches volunteers to tasks based on skills, location, availability, and past performance.',
              },
              {
                icon: Globe, title: 'Cross-NGO Network',
                desc: 'Discover other NGOs, share resources, and launch joint campaigns through the public collaboration layer.',
              },
              {
                icon: Award, title: 'Gamification Engine',
                desc: 'Points, badges, leaderboards, and reputation scores keep volunteers engaged and organizations accountable.',
              },
            ].map((feature, i) => (
              <div key={i} className="glass-card rounded-2xl border border-slate-800 p-6 hover:border-indigo-500/20 transition-colors">
                <feature.icon className="w-8 h-8 text-indigo-400 mb-4" />
                <h3 className="text-base font-semibold text-slate-100 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-600/5 to-transparent pointer-events-none"></div>
        <div className="container px-4 max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to build impact?</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Join the ecosystem that connects NGOs, volunteers, donors, and communities into one intelligent and trustworthy system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register"
              className="px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-[0_0_24px_rgba(79,70,229,0.5)] flex items-center gap-2 justify-center group">
              Register Your NGO
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/register"
              className="px-8 py-4 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-all flex items-center gap-2 justify-center">
              Join as Volunteer
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/50 py-8">
        <div className="container px-4 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-xs text-white">JS</span>
            </div>
            <span className="font-bold text-slate-300">JanSetu</span>
            <span className="text-xs text-slate-500">Smart NGO Ecosystem</span>
          </div>
          <p className="text-xs text-slate-500">Built for Hack2Skill Hackathon &middot; Team MID &middot; 2025</p>
        </div>
      </footer>
    </main>
  );
}
