'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Activity, Users, Target, Heart, Globe, Sparkles, TrendingUp, Award, Languages } from 'lucide-react';
import { useState } from 'react';
import { useThemeStore } from '../store/theme-store';

// ── Inline translations (landing page is outside I18nProvider scope for SSR) ──
const TRANSLATIONS = {
  en: {
    badge: 'Smart NGO Ecosystem Platform',
    hero1: 'Connect. Collaborate.',
    hero2: 'Create Impact.',
    subtitle: 'JanSetu unifies NGOs, volunteers, donors, and communities into one intelligent ecosystem — powered by AI to maximize every rupee and every volunteer hour.',
    getStarted: 'Get Started Free',
    login: 'Log In',
    stat1: 'NGOs Connected', stat2: 'Active Campaigns', stat3: 'Volunteers', stat4: 'Donations Raised',
    demoTitle: '🔑 Demo Credentials (Hackathon)',
    whoTitle: 'One platform for ', whoHL: 'everyone',
    whoSub: 'Whether you run an NGO, volunteer, donate, or report community needs — JanSetu has your workspace.',
    featTitle: 'Powered by ', featHL: 'Intelligence',
    featSub: 'AI-driven features that make every operation smarter.',
    howTitle: 'How ', howHL: 'JanSetu', howTitle2: ' Works',
    howSub: 'From need identification to impact delivery — in 4 simple steps.',
    step: 'STEP',
    prodTitle: 'Built for ', prodHL: 'Production',
    prodSub: "Enterprise-grade infrastructure you'd expect from platforms 10x our size.",
    ctaTitle: 'Ready to build impact?',
    ctaSub: 'Join the ecosystem that connects NGOs, volunteers, donors, and communities into one intelligent and trustworthy system.',
    ngoLogin: 'NGO Admin Login', volunteerLogin: 'Volunteer Login', donorLogin: 'Donor Login',
    footerTag: 'AI-powered smart NGO ecosystem platform connecting communities with resources that matter.',
    footerCopy: '© 2026 JanSetu. Built for Hack2Skill Hackathon by Team MID',
    madeWith: 'Made with', forIndia: 'for India',
    platform: 'Platform', developers: 'Developers', techStack: 'Tech Stack',
    toggleLang: 'हिन्दी',
  },
  hi: {
    badge: 'स्मार्ट NGO इकोसिस्टम प्लेटफ़ॉर्म',
    hero1: 'जोड़ें। सहयोग करें।',
    hero2: 'बदलाव लाएं।',
    subtitle: 'JanSetu NGOs, स्वयंसेवकों, दाताओं और समुदायों को एक AI-संचालित स्मार्ट इकोसिस्टम में एकजुट करता है — हर रुपये और हर घंटे को सार्थक बनाता है।',
    getStarted: 'मुफ़्त शुरू करें',
    login: 'लॉग इन',
    stat1: 'जुड़े NGOs', stat2: 'सक्रिय अभियान', stat3: 'स्वयंसेवक', stat4: 'एकत्रित दान',
    demoTitle: '🔑 डेमो क्रेडेंशियल (हैकाथॉन)',
    whoTitle: 'एक पोर्टल ', whoHL: 'सबके लिए',
    whoSub: 'चाहे आप NGO चलाते हों, स्वयंसेवक हों, दान करते हों — JanSetu आपके लिए है।',
    featTitle: 'संचालित है ', featHL: 'बुद्धिमत्ता से',
    featSub: 'AI-आधारित सुविधाएँ जो हर कार्य को स्मार्ट बनाती हैं।',
    howTitle: 'कैसे काम करता है ', howHL: 'JanSetu', howTitle2: '',
    howSub: 'ज़रूरत की पहचान से प्रभाव तक — केवल 4 सरल चरणों में।',
    step: 'चरण',
    prodTitle: 'बनाया है ', prodHL: 'उत्पादन के लिए',
    prodSub: 'एंटरप्राइज़-स्तरीय तकनीकी ढाँचा।',
    ctaTitle: 'प्रभाव बनाने के लिए तैयार हैं?',
    ctaSub: 'उस इकोसिस्टम से जुड़ें जो NGOs, स्वयंसेवकों और समुदायों को एक बुद्धिमान तंत्र में जोड़ता है।',
    ngoLogin: 'NGO एडमिन लॉगिन', volunteerLogin: 'स्वयंसेवक लॉगिन', donorLogin: 'दाता लॉगिन',
    footerTag: 'AI-संचालित स्मार्ट NGO प्लेटफ़ॉर्म जो समुदायों को ज़रूरी संसाधनों से जोड़ता है।',
    footerCopy: '© 2026 JanSetu। Hack2Skill हैकाथॉन के लिए Team MID द्वारा',
    madeWith: 'बनाया', forIndia: 'भारत के लिए',
    platform: 'प्लेटफ़ॉर्म', developers: 'डेवलपर्स', techStack: 'तकनीक',
    toggleLang: 'English',
  },
};

type Lang = 'en' | 'hi';

export default function Home() {
  const [lang, setLang] = useState<Lang>('en');
  const T = TRANSLATIONS[lang];
  const { themeId } = useThemeStore();
  const isLight = themeId === 'aurora' || themeId === 'sunrise';

  // Theme-aware color classes
  const accent = isLight
    ? 'text-primary'
    : 'text-emerald-400';
  const accentBg = isLight
    ? 'bg-primary/10 border-primary/20'
    : 'bg-emerald-500/10 border-emerald-500/20';
  const heroBg = isLight
    ? 'from-primary/5 via-transparent to-transparent'
    : 'from-emerald-600/8 via-transparent to-transparent';
  const cardBase = isLight
    ? 'bg-white border-border shadow-sm hover:shadow-md hover:border-primary/30'
    : 'glass-card border-border hover:border-primary/30';
  const textMuted = isLight ? 'text-muted-foreground' : 'text-slate-400';
  const textMain = isLight ? 'text-foreground' : 'text-white';
  const textSub = isLight ? 'text-muted-foreground' : 'text-slate-300';
  const btnPrimary = isLight
    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20'
    : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_24px_var(--primary)/30]';
  const btnSecondary = isLight
    ? 'bg-muted hover:bg-muted/80 text-foreground border border-border'
    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700';
  const statCard = isLight
    ? 'bg-muted/60 border border-border'
    : 'bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm';
  const demoCard = isLight
    ? 'bg-muted/50 border border-border'
    : 'bg-slate-900/60 border border-slate-700/60 backdrop-blur-md';
  const divider = isLight ? 'border-border/60' : 'border-slate-800/50';
  const footerText = isLight ? 'text-muted-foreground' : 'text-slate-500';
  const footerLink = isLight ? 'text-muted-foreground hover:text-primary' : 'text-slate-500 hover:text-primary';

  const roles = [
    {
      title: lang === 'en' ? 'NGO Admins' : 'NGO व्यवस्थापक',
      desc: lang === 'en'
        ? 'Manage campaigns, resources, volunteers, and track trust scores — all in one private workspace.'
        : 'अभियान, संसाधन, स्वयंसेवकों का प्रबंधन करें और ट्रस्ट स्कोर ट्रैक करें।',
      icon: Shield, color: 'indigo',
      features: lang === 'en'
        ? ['Campaign Builder', 'Resource Inventory', 'Trust Dashboard']
        : ['अभियान निर्माता', 'संसाधन सूची', 'ट्रस्ट डैशबोर्ड'],
    },
    {
      title: lang === 'en' ? 'Volunteers' : 'स्वयंसेवक',
      desc: lang === 'en'
        ? 'Get AI-matched to tasks that fit your skills. Earn points, climb the leaderboard, collect badges.'
        : 'AI द्वारा अपने कौशल के अनुसार कार्य प्राप्त करें। अंक अर्जित करें और बैज जीतें।',
      icon: Users, color: 'emerald',
      features: lang === 'en'
        ? ['Smart Matching', 'Gamification', 'Impact Tracking']
        : ['स्मार्ट मिलान', 'गेमिफिकेशन', 'प्रभाव ट्रैकिंग'],
    },
    {
      title: lang === 'en' ? 'Donors' : 'दाता',
      desc: lang === 'en'
        ? 'Fund verified campaigns, donate anonymously, and see exactly where your money goes.'
        : 'सत्यापित अभियानों को फंड करें, गुमनाम दान करें और देखें आपका पैसा कहाँ जाता है।',
      icon: Heart, color: 'pink',
      features: lang === 'en'
        ? ['Verified NGOs', 'Impact Reports', 'Tax Receipts']
        : ['सत्यापित NGO', 'प्रभाव रिपोर्ट', 'कर रसीद'],
    },
    {
      title: lang === 'en' ? 'Communities' : 'समुदाय',
      desc: lang === 'en'
        ? 'Report local needs, upload surveys, and watch as NGOs mobilize resources in response.'
        : 'स्थानीय जरूरतें दर्ज करें और NGOs को संसाधन जुटाते देखें।',
      icon: Activity, color: 'amber',
      features: lang === 'en'
        ? ['Need Reporting', 'Survey Upload', 'Live Status']
        : ['जरूरत रिपोर्ट', 'सर्वेक्षण अपलोड', 'लाइव स्थिति'],
    },
  ];

  const features = [
    {
      icon: Sparkles,
      title: lang === 'en' ? 'AI Impact Reports' : 'AI प्रभाव रिपोर्ट',
      desc: lang === 'en'
        ? 'Auto-generated campaign impact narratives. Show donors exactly what their money achieved with data-backed stories.'
        : 'स्वतः-उत्पन्न अभियान प्रभाव रिपोर्ट। दाताओं को बताएं उनका पैसा कहाँ काम आया।',
    },
    {
      icon: Shield,
      title: lang === 'en' ? 'Trust & Fraud Detection' : 'विश्वास और धोखाधड़ी पहचान',
      desc: lang === 'en'
        ? 'Every NGO gets a real-time trust score. AI flags suspicious campaigns and fake accounts.'
        : 'हर NGO को रियल-टाइम ट्रस्ट स्कोर मिलता है। AI संदिग्ध अभियानों को चिह्नित करता है।',
    },
    {
      icon: TrendingUp,
      title: lang === 'en' ? 'Crisis Prediction' : 'संकट भविष्यवाणी',
      desc: lang === 'en'
        ? 'Analyze regional trends and predict upcoming crises so resources reach communities before disasters strike.'
        : 'क्षेत्रीय रुझानों का विश्लेषण करें और आने वाले संकटों की भविष्यवाणी करें।',
    },
    {
      icon: Users,
      title: lang === 'en' ? 'Smart Volunteer Matching' : 'स्मार्ट स्वयंसेवक मिलान',
      desc: lang === 'en'
        ? 'AI matches volunteers to tasks based on skills, location, availability, and past performance.'
        : 'AI कौशल, स्थान और उपलब्धता के आधार पर स्वयंसेवकों को कार्यों से जोड़ता है।',
    },
    {
      icon: Globe,
      title: lang === 'en' ? 'Cross-NGO Network' : 'क्रॉस-NGO नेटवर्क',
      desc: lang === 'en'
        ? 'Discover other NGOs, share resources, and launch joint campaigns through the collaboration layer.'
        : 'अन्य NGO खोजें, संसाधन साझा करें और संयुक्त अभियान शुरू करें।',
    },
    {
      icon: Award,
      title: lang === 'en' ? 'Gamification Engine' : 'गेमिफिकेशन इंजन',
      desc: lang === 'en'
        ? 'Points, badges, leaderboards, and reputation scores keep volunteers engaged and organizations accountable.'
        : 'अंक, बैज, लीडरबोर्ड — स्वयंसेवकों को व्यस्त रखें और संगठनों को जवाबदेह बनाएं।',
    },
  ];

  const steps = [
    {
      step: '01', icon: '📋',
      title: lang === 'en' ? 'Identify Needs' : 'जरूरतें पहचानें',
      desc: lang === 'en'
        ? 'Communities report local needs through surveys, field reports, or the mobile app. AI prioritizes by urgency.'
        : 'समुदाय सर्वेक्षण और मोबाइल ऐप के माध्यम से स्थानीय जरूरतें दर्ज करते हैं। AI तात्कालिकता के आधार पर प्राथमिकता देता है।',
    },
    {
      step: '02', icon: '🎯',
      title: lang === 'en' ? 'Mobilize Resources' : 'संसाधन जुटाएं',
      desc: lang === 'en'
        ? 'NGOs create campaigns, register resources, and recruit volunteers — all matched by AI to the right needs.'
        : 'NGO अभियान बनाते हैं, संसाधन दर्ज करते हैं और स्वयंसेवकों की भर्ती करते हैं।',
    },
    {
      step: '03', icon: '⚡',
      title: lang === 'en' ? 'Execute & Track' : 'कार्यान्वयन और ट्रैकिंग',
      desc: lang === 'en'
        ? 'Volunteers complete tasks, donors fund campaigns, and everyone tracks progress with real-time dashboards.'
        : 'स्वयंसेवक कार्य पूरा करते हैं, दाता फंड देते हैं, और सभी रियल-टाइम डैशबोर्ड से प्रगति ट्रैक करते हैं।',
    },
    {
      step: '04', icon: '📊',
      title: lang === 'en' ? 'Measure Impact' : 'प्रभाव मापें',
      desc: lang === 'en'
        ? 'AI generates impact reports, trust scores update, and the leaderboard rewards the most active contributors.'
        : 'AI प्रभाव रिपोर्ट बनाता है, ट्रस्ट स्कोर अपडेट होता है, और लीडरबोर्ड सर्वश्रेष्ठ योगदानकर्ताओं को पुरस्कृत करता है।',
    },
  ];

  return (
    <main className="flex-1 flex flex-col items-center">

      {/* ── Language Toggle (floating) ── */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${accentBg} ${accent}`}
        >
          <Languages className="w-3.5 h-3.5" />
          {T.toggleLang}
        </button>
      </div>

      {/* ── HERO ── */}
      <section className="w-full min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${heroBg} pointer-events-none`} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/6 rounded-full blur-[140px] pointer-events-none" />

        <div className="container px-4 text-center z-10 max-w-5xl mx-auto flex flex-col items-center animate-fade-in">

          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium mb-8 ${accentBg} ${accent}`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
            </span>
            {T.badge}
          </div>

          {/* Headline */}
          <h1 className={`text-5xl md:text-7xl font-bold tracking-tight mb-6 ${textMain}`}>
            <span className="gradient-text">{T.hero1}</span>
            <br />
            {T.hero2}
          </h1>

          <p className={`text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed ${textMuted}`}>
            {T.subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link href="/register" className={`px-8 py-4 rounded-full font-semibold transition-all flex items-center gap-2 group w-full sm:w-auto justify-center ${btnPrimary}`}>
              {T.getStarted}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className={`px-8 py-4 rounded-full font-semibold transition-all w-full sm:w-auto justify-center flex ${btnSecondary}`}>
              {T.login}
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16">
            {[
              { value: '120+', label: T.stat1, icon: Globe, color: accent },
              { value: '48', label: T.stat2, icon: Target, color: 'text-purple-500' },
              { value: '1.2K+', label: T.stat3, icon: Users, color: 'text-emerald-500' },
              { value: '₹8.4L+', label: T.stat4, icon: Heart, color: 'text-pink-500' },
            ].map((stat, i) => (
              <div key={i} className={`text-center px-4 py-4 rounded-2xl ${statCard}`}>
                <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
                <div className={`text-2xl md:text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className={`text-xs mt-1 font-medium ${textMuted}`}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Demo Credentials */}
          <div className={`mt-10 p-4 rounded-2xl max-w-xl mx-auto w-full ${demoCard}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-3 text-center ${textMuted}`}>{T.demoTitle}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {[
                { role: lang === 'en' ? 'NGO Admin' : 'NGO व्यवस्थापक', email: 'admin@jansetu.org', color: 'indigo' },
                { role: lang === 'en' ? 'Volunteer' : 'स्वयंसेवक', email: 'volunteer@jansetu.org', color: 'emerald' },
                { role: lang === 'en' ? 'Donor' : 'दाता', email: 'donor@jansetu.org', color: 'pink' },
              ].map((d, i) => (
                <div key={i} className={`bg-${d.color}-500/10 rounded-xl p-3 border border-${d.color}-500/20`}>
                  <div className={`text-${d.color}-500 font-bold mb-1`}>{d.role}</div>
                  <div className={textSub}>{d.email}</div>
                  <div className={textMuted}>password123</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOR WHO ── */}
      <section className="w-full py-24">
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textMain}`}>
              {T.whoTitle}<span className={accent}>{T.whoHL}</span>
            </h2>
            <p className={`max-w-lg mx-auto ${textMuted}`}>{T.whoSub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role, i) => (
              <div key={i} className={`rounded-2xl border p-6 transition-all group card-hover ${cardBase}`}>
                <div className={`w-12 h-12 rounded-xl bg-${role.color}-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <role.icon className={`w-6 h-6 text-${role.color}-500`} />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${textMain}`}>{role.title}</h3>
                <p className={`text-sm mb-4 ${textMuted}`}>{role.desc}</p>
                <div className="space-y-2">
                  {role.features.map((f, j) => (
                    <div key={j} className={`flex items-center gap-2 text-xs ${textSub}`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className={`w-full py-24 border-t ${divider}`}>
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textMain}`}>
              {T.featTitle}<span className={accent}>{T.featHL}</span>
            </h2>
            <p className={`max-w-lg mx-auto ${textMuted}`}>{T.featSub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className={`rounded-2xl border p-6 transition-all card-hover ${cardBase}`}>
                <f.icon className={`w-8 h-8 mb-4 ${accent}`} />
                <h3 className={`text-base font-semibold mb-2 ${textMain}`}>{f.title}</h3>
                <p className={`text-sm leading-relaxed ${textMuted}`}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={`w-full py-24 border-t ${divider}`}>
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textMain}`}>
              {T.howTitle}<span className={accent}>{T.howHL}</span>{T.howTitle2}
            </h2>
            <p className={`max-w-lg mx-auto ${textMuted}`}>{T.howSub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((item, i) => (
              <div key={i} className="relative">
                <div className={`rounded-2xl border p-6 transition-all h-full card-hover ${cardBase}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{item.icon}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${accentBg} ${accent}`}>
                      {T.step} {item.step}
                    </span>
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${textMain}`}>{item.title}</h3>
                  <p className={`text-sm leading-relaxed ${textMuted}`}>{item.desc}</p>
                </div>
                {i < 3 && <div className={`hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary/30 z-10`} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={`w-full py-24 border-t ${divider}`}>
        <div className="container px-4 max-w-3xl mx-auto text-center">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textMain}`}>{T.ctaTitle}</h2>
          <p className={`mb-8 max-w-lg mx-auto ${textMuted}`}>{T.ctaSub}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login?role=ngo_coordinator" className={`px-8 py-4 rounded-full font-semibold transition-all flex items-center gap-2 justify-center group ${btnPrimary}`}>
              {T.ngoLogin}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login?role=volunteer" className="px-8 py-4 rounded-full bg-emerald-600/90 hover:bg-emerald-500 text-white font-semibold transition-all flex items-center gap-2 justify-center">
              {T.volunteerLogin}
            </Link>
            <Link href="/login?role=donor" className="px-8 py-4 rounded-full bg-gradient-to-r from-pink-600/90 to-rose-600/90 hover:opacity-90 text-white font-semibold transition-all flex items-center gap-2 justify-center">
              <Heart className="w-4 h-4" />
              {T.donorLogin}
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={`w-full border-t ${divider} py-10`}>
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="font-bold text-sm text-primary-foreground">JS</span>
                </div>
                <span className={`font-bold text-lg ${textMain}`}>JanSetu</span>
              </div>
              <p className={`text-sm leading-relaxed ${footerText}`}>{T.footerTag}</p>
            </div>
            <div>
              <h4 className={`text-sm font-semibold mb-3 ${textSub}`}>{T.platform}</h4>
              <div className="space-y-2">
                {[
                  ['/dashboard/campaigns', lang === 'en' ? 'Campaigns' : 'अभियान'],
                  ['/dashboard/donate', lang === 'en' ? 'Donate' : 'दान करें'],
                  ['/dashboard/leaderboard', lang === 'en' ? 'Leaderboard' : 'लीडरबोर्ड'],
                  ['/dashboard/map', lang === 'en' ? 'Impact Map' : 'प्रभाव मानचित्र'],
                ].map(([href, label]) => (
                  <Link key={href} href={href} className={`block text-sm transition-colors ${footerLink}`}>{label}</Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className={`text-sm font-semibold mb-3 ${textSub}`}>{T.developers}</h4>
              <div className="space-y-2">
                <Link href="/dashboard/api-docs" className={`block text-sm transition-colors ${footerLink}`}>
                  {lang === 'en' ? 'API Reference' : 'API संदर्भ'}
                </Link>
                <a href="https://github.com/Hack2Skill-Team-MID/JanSetu" target="_blank" rel="noopener noreferrer" className={`block text-sm transition-colors ${footerLink}`}>GitHub</a>
              </div>
            </div>
            <div>
              <h4 className={`text-sm font-semibold mb-3 ${textSub}`}>{T.techStack}</h4>
              <div className="flex flex-wrap gap-2">
                {['Next.js', 'Express', 'PostgreSQL', 'Prisma', 'TypeScript', 'Gemini AI', 'Razorpay'].map((tech) => (
                  <span key={tech} className={`text-[10px] px-2 py-1 rounded-md border ${isLight ? 'bg-muted border-border text-muted-foreground' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className={`border-t ${divider} pt-6 flex flex-col md:flex-row items-center justify-between gap-4`}>
            <p className={`text-xs ${footerText}`}>{T.footerCopy}</p>
            <div className={`flex items-center gap-1 text-xs ${footerText}`}>
              <span>{T.madeWith}</span>
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
              <span>{T.forIndia}</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
