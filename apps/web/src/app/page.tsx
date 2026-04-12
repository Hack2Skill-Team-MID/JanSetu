import Link from 'next/link';
import { ArrowRight, Shield, Activity, Users } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="container px-4 text-center z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/60 text-indigo-300 text-sm font-medium mb-8 backdrop-blur-md animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Hack2Skill Hackathon Submission
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Smart Resource Allocation
            </span>
            <br />
            for Community Needs
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-fade-in leading-relaxed">
            JanSetu leverages AI to automatically extract insights from community surveys
            and intelligently match volunteers to urgent tasks — bridging communities and change-makers.
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
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-24 bg-slate-900/40 border-t border-slate-800/50">
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">How JanSetu Works</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">Streamlining the process from need identification to community resolution.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Shield className="w-7 h-7 text-indigo-400" />}
              title="AI Survey Processing"
              description="Upload handwritten forms or field reports. Our Gemini-powered NLP pipeline instantly extracts actionable needs, categories, and urgency levels."
              color="indigo"
            />
            <FeatureCard
              icon={<Activity className="w-7 h-7 text-purple-400" />}
              title="Dynamic Prioritization"
              description="Critical issues are automatically flagged based on urgency keywords, affected population size, and how long the need has been unresolved."
              color="purple"
            />
            <FeatureCard
              icon={<Users className="w-7 h-7 text-emerald-400" />}
              title="Smart Volunteering"
              description="Our algorithm matches tasks to volunteers using skill overlap (45%), haversine geographic distance (30%), and availability (25%)."
              color="emerald"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/50 py-8 text-center text-sm text-slate-500">
        Built with ❤️ for Hack2Skill · JanSetu © 2025
      </footer>
    </main>
  );
}

function FeatureCard({
  icon, title, description, color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'indigo' | 'purple' | 'emerald';
}) {
  const glows = {
    indigo: 'group-hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]',
    purple: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]',
    emerald: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
  };

  return (
    <div className={`group glass-card rounded-2xl p-7 transition-all duration-300 hover:-translate-y-2 ${glows[color]}`}>
      <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-slate-200">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm">{description}</p>
    </div>
  );
}
