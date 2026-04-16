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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-16 animate-fade-in">
            {[
              { value: '120+', label: 'NGOs Connected', icon: Globe, color: 'text-indigo-400' },
              { value: '48', label: 'Active Campaigns', icon: Target, color: 'text-purple-400' },
              { value: '1.2K+', label: 'Volunteers', icon: Users, color: 'text-emerald-400' },
              { value: '₹8.4L+', label: 'Donations Raised', icon: Heart, color: 'text-pink-400' },
            ].map((stat, i) => (
              <div key={i} className="text-center px-4 py-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
                <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
                <div className={`text-2xl md:text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Demo Credentials */}
          <div className="mt-10 p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60 backdrop-blur-md max-w-xl mx-auto animate-fade-in">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3 text-center">🔑 Demo Credentials (Hackathon)</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-indigo-500/10 rounded-xl p-3 border border-indigo-500/20">
                <div className="text-indigo-400 font-bold mb-1">NGO Admin</div>
                <div className="text-slate-300">admin@jansetu.org</div>
                <div className="text-slate-400">password123</div>
              </div>
              <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
                <div className="text-emerald-400 font-bold mb-1">Volunteer</div>
                <div className="text-slate-300">volunteer@jansetu.org</div>
                <div className="text-slate-400">password123</div>
              </div>
              <div className="bg-pink-500/10 rounded-xl p-3 border border-pink-500/20">
                <div className="text-pink-400 font-bold mb-1">Donor</div>
                <div className="text-slate-300">donor@jansetu.org</div>
                <div className="text-slate-400">password123</div>
              </div>
            </div>
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

      {/* How it Works */}
      <section className="w-full py-24 relative border-t border-slate-800/50">
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How <span className="text-indigo-400">JanSetu</span> Works
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">From need identification to impact delivery — in 4 simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Identify Needs', desc: 'Communities report local needs through surveys, field reports, or the mobile app. AI prioritizes by urgency.', icon: '📋' },
              { step: '02', title: 'Mobilize Resources', desc: 'NGOs create campaigns, register resources, and recruit volunteers — all matched by AI to the right needs.', icon: '🎯' },
              { step: '03', title: 'Execute & Track', desc: 'Volunteers complete tasks, donors fund campaigns, and everyone tracks progress with real-time dashboards.', icon: '⚡' },
              { step: '04', title: 'Measure Impact', desc: 'AI generates impact reports, trust scores update, and the leaderboard rewards the most active contributors.', icon: '📊' },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="glass-card rounded-2xl border border-slate-800 p-6 hover:border-indigo-500/30 transition-all h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full">STEP {item.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-indigo-500/30 z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Production-Ready Showcase */}
      <section className="w-full py-24 relative border-t border-slate-800/50">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/3 to-transparent pointer-events-none"></div>
        <div className="container px-4 max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Built for <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">Production</span>
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">Enterprise-grade infrastructure you&apos;d expect from platforms 10x our size.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: '🚨 Emergency Mode', desc: 'One-tap disaster activation with automatic broadcasts, resource locking, and priority re-ordering. Your command center when it matters most.', tag: 'Phase 3' },
              { title: '🌐 Multi-language', desc: 'Full English, Hindi, and Tamil support with instant switching. Every label, button, and status translated. Expandable to 100+ languages.', tag: 'i18n' },
              { title: '📱 Offline-First PWA', desc: 'Installable app with service worker caching. Failed requests queued in IndexedDB and auto-replayed when connectivity returns.', tag: 'PWA' },
              { title: '📋 Audit Trail', desc: 'Every action logged with actor, timestamp, IP address, and before/after snapshots. Export to CSV. Full compliance-grade tracking.', tag: 'Security' },
              { title: '🔍 Fraud Detection', desc: 'AI-powered risk scoring with investigation workflows. Case management, severity tracking, and resolution with actionable outcomes.', tag: 'AI' },
              { title: '📖 API Documentation', desc: '30+ REST API endpoints documented with request/response schemas, method badges, and copy-to-clipboard paths.', tag: 'DevX' },
            ].map((item, i) => (
              <div key={i} className="glass-card rounded-2xl border border-slate-800 p-6 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl">{item.title.split(' ')[0]}</span>
                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">{item.tag}</span>
                </div>
                <h3 className="text-base font-semibold text-slate-100 mb-2">{item.title.split(' ').slice(1).join(' ')}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
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
            <Link href="/login?role=ngo_coordinator"
              className="px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-[0_0_24px_rgba(79,70,229,0.5)] flex items-center gap-2 justify-center group">
              NGO Admin Login
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login?role=volunteer"
              className="px-8 py-4 rounded-full bg-emerald-600/90 hover:bg-emerald-500 text-white font-semibold transition-all flex items-center gap-2 justify-center">
              Volunteer Login
            </Link>
            <Link href="/login?role=donor"
              className="px-8 py-4 rounded-full bg-gradient-to-r from-pink-600/90 to-rose-600/90 hover:opacity-90 text-white font-semibold transition-all flex items-center gap-2 justify-center">
              <Heart className="w-4 h-4" />
              Donor Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/50 py-10">
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-sm text-white">JS</span>
                </div>
                <span className="font-bold text-lg text-slate-200">JanSetu</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">AI-powered smart NGO ecosystem platform connecting communities with resources that matter.</p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Platform</h4>
              <div className="space-y-2">
                <Link href="/dashboard/campaigns" className="block text-sm text-slate-500 hover:text-indigo-400 transition-colors">Campaigns</Link>
                <Link href="/dashboard/donate" className="block text-sm text-slate-500 hover:text-indigo-400 transition-colors">Donate</Link>
                <Link href="/dashboard/leaderboard" className="block text-sm text-slate-500 hover:text-indigo-400 transition-colors">Leaderboard</Link>
                <Link href="/dashboard/map" className="block text-sm text-slate-500 hover:text-indigo-400 transition-colors">Impact Map</Link>
              </div>
            </div>

            {/* Developers */}
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Developers</h4>
              <div className="space-y-2">
                <Link href="/dashboard/api-docs" className="block text-sm text-slate-500 hover:text-indigo-400 transition-colors">API Reference</Link>
                <a href="https://github.com/agrawalishan2005/jansetu" target="_blank" rel="noopener noreferrer" className="block text-sm text-slate-500 hover:text-indigo-400 transition-colors">GitHub</a>
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                {['Next.js', 'Express', 'PostgreSQL', 'Prisma', 'TypeScript', 'Gemini AI', 'Razorpay'].map((tech) => (
                  <span key={tech} className="text-[10px] px-2 py-1 bg-slate-800 rounded-md text-slate-400 border border-slate-700">{tech}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800/50 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">© 2026 JanSetu. Built for Hack2Skill Hackathon by Team MID</p>
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
              <span>for India</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
