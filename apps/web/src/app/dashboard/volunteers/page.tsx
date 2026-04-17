'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Users, Trophy, UsersRound, MapPin, Crown, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';


interface Volunteer {
  id: string; name: string; email?: string; skills: string[];
  location: string; availability: string; reputationScore: number;
  points: number; badges: string[]; tasksCompleted?: number; impactScore?: number;
}

const DEMO_VOLUNTEERS: Volunteer[] = [
  { id: 'v1', name: 'Priya Sharma', email: 'priya@example.com', skills: ['First Aid', 'Nursing', 'Community Health'], location: 'Mumbai, Maharashtra', availability: 'full-time', reputationScore: 96, points: 4820, badges: ['first_task', 'ten_tasks', 'first_aid_hero', 'crisis_responder'], tasksCompleted: 34, impactScore: 92 },
  { id: 'v2', name: 'Arjun Mehta', email: 'arjun@example.com', skills: ['GIS Mapping', 'Data Analysis', 'Field Survey'], location: 'Pune, Maharashtra', availability: 'available', reputationScore: 89, points: 3640, badges: ['first_task', 'five_tasks', 'community_voice'], tasksCompleted: 22, impactScore: 78 },
  { id: 'v3', name: 'Kavya Nair', email: 'kavya@example.com', skills: ['Teaching', 'Digital Literacy', 'Content Creation'], location: 'Kochi, Kerala', availability: 'weekends', reputationScore: 84, points: 2980, badges: ['first_task', 'five_tasks', 'mentor'], tasksCompleted: 18, impactScore: 71 },
  { id: 'v4', name: 'Rahul Verma', email: 'rahul@example.com', skills: ['Logistics', 'Driving', 'Supply Chain'], location: 'Delhi, NCR', availability: 'full-time', reputationScore: 91, points: 4120, badges: ['first_task', 'ten_tasks', 'team_player'], tasksCompleted: 28, impactScore: 85 },
  { id: 'v5', name: 'Anita Patel', email: 'anita@example.com', skills: ['Social Work', 'Counselling', 'Community Outreach'], location: 'Ahmedabad, Gujarat', availability: 'available', reputationScore: 87, points: 3310, badges: ['first_task', 'five_tasks', 'community_voice'], tasksCompleted: 20, impactScore: 74 },
  { id: 'v6', name: 'Siddharth Rao', email: 'sid@example.com', skills: ['Electrical', 'Solar Tech', 'Civil Work'], location: 'Bengaluru, Karnataka', availability: 'evenings', reputationScore: 79, points: 2150, badges: ['first_task', 'five_tasks'], tasksCompleted: 13, impactScore: 63 },
  { id: 'v7', name: 'Meera Iyer', email: 'meera@example.com', skills: ['Nutrition', 'Healthcare', 'Child Welfare'], location: 'Chennai, Tamil Nadu', availability: 'part-time', reputationScore: 93, points: 4510, badges: ['first_task', 'ten_tasks', 'first_aid_hero', 'weekly_star'], tasksCompleted: 31, impactScore: 88 },
  { id: 'v8', name: 'Aakash Singh', email: 'aakash@example.com', skills: ['Photography', 'Media', 'Storytelling'], location: 'Bhopal, Madhya Pradesh', availability: 'weekends', reputationScore: 72, points: 1860, badges: ['first_task'], tasksCompleted: 9, impactScore: 52 },
  { id: 'v9', name: 'Deepika Reddy', email: 'deepika@example.com', skills: ['Water Engineering', 'Hydrology', 'Plumbing'], location: 'Hyderabad, Telangana', availability: 'available', reputationScore: 88, points: 3720, badges: ['first_task', 'five_tasks', 'team_player'], tasksCompleted: 24, impactScore: 80 },
  { id: 'v10', name: 'Vikram Tiwari', email: 'vikram@example.com', skills: ['Legal Aid', 'Administration', 'Documentation'], location: 'Jaipur, Rajasthan', availability: 'evenings', reputationScore: 76, points: 2340, badges: ['first_task', 'five_tasks'], tasksCompleted: 15, impactScore: 59 },
  { id: 'v11', name: 'Sunita Devi', email: 'sunita@example.com', skills: ['SHG Management', 'Microfinance', 'Women Empowerment'], location: 'Patna, Bihar', availability: 'available', reputationScore: 82, points: 2880, badges: ['first_task', 'five_tasks', 'mentor'], tasksCompleted: 17, impactScore: 69 },
  { id: 'v12', name: 'Ravi Kumar', email: 'ravi@example.com', skills: ['Reforestation', 'Environment', 'Agriculture'], location: 'Mysuru, Karnataka', availability: 'weekends', reputationScore: 74, points: 1990, badges: ['first_task'], tasksCompleted: 11, impactScore: 55 },
];

const AVAILABILITY_CONFIG: Record<string, { label: string; color: string }> = {
  available: { label: 'Available', color: 'bg-emerald-500/20 text-emerald-400' },
  'full-time': { label: 'Full-time', color: 'bg-indigo-500/20 text-indigo-400' },
  'part-time': { label: 'Part-time', color: 'bg-blue-500/20 text-blue-400' },
  weekends: { label: 'Weekends', color: 'bg-amber-500/20 text-amber-400' },
  evenings: { label: 'Evenings', color: 'bg-purple-500/20 text-purple-400' },
};

const BADGE_META: Record<string, { icon: string; label: string }> = {
  first_task: { icon: '🎯', label: 'Pioneer' },
  five_tasks: { icon: '⭐', label: 'Reliable' },
  ten_tasks: { icon: '🏆', label: 'Veteran' },
  first_aid_hero: { icon: '🏥', label: 'First Aid Hero' },
  crisis_responder: { icon: '🚨', label: 'Crisis Responder' },
  team_player: { icon: '🤝', label: 'Team Player' },
  mentor: { icon: '📚', label: 'Mentor' },
  top_donor: { icon: '💎', label: 'Top Donor' },
  community_voice: { icon: '📢', label: 'Community Voice' },
  weekly_star: { icon: '🌟', label: 'Weekly Star' },
};

function VolunteerCard({ volunteer }: { volunteer: Volunteer }) {
  const avail = AVAILABILITY_CONFIG[volunteer.availability] || { label: volunteer.availability, color: 'bg-slate-500/20 text-slate-400' };
  const initials = volunteer.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div className="glass-card rounded-2xl border border-slate-800 hover:border-slate-600 p-5 transition-all card-hover">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-300">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-slate-200 truncate">{volunteer.name}</h3>
            <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0', avail.color)}>{avail.label}</span>
          </div>
          {volunteer.location && (
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" />{volunteer.location}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {(volunteer.skills || []).slice(0, 3).map((s) => (
          <span key={s} className="px-2 py-0.5 text-[10px] rounded-md border border-slate-700 text-slate-400 bg-slate-800/50">{s}</span>
        ))}
      </div>
      <div className="border-t border-slate-800 pt-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-sm font-bold text-indigo-400">{volunteer.points.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500">Points</p>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-200">{volunteer.reputationScore}</p>
          <p className="text-[10px] text-slate-500">Rep.</p>
        </div>
        <div>
          <p className="text-sm font-bold text-amber-400">{volunteer.tasksCompleted || 0}</p>
          <p className="text-[10px] text-slate-500">Tasks</p>
        </div>
      </div>
      {volunteer.badges.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {volunteer.badges.slice(0, 4).map(b => (
            <span key={b} title={BADGE_META[b]?.label || b} className="text-base cursor-help">{BADGE_META[b]?.icon || '🏅'}</span>
          ))}
          {volunteer.badges.length > 4 && <span className="text-xs text-slate-500 self-center">+{volunteer.badges.length - 4}</span>}
        </div>
      )}
    </div>
  );
}

function Leaderboard({ volunteers }: { volunteers: Volunteer[] }) {
  const sorted = [...volunteers].sort((a, b) => b.points - a.points);
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const podiumHeights = ['h-24', 'h-32', 'h-20'];
  const podiumColors = ['bg-slate-600/40', 'bg-amber-500/20', 'bg-amber-800/30'];
  const medals = [
    <Medal key="silver" className="h-6 w-6 text-slate-300" />,
    <Crown key="gold" className="h-7 w-7 text-amber-400" />,
    <Medal key="bronze" className="h-6 w-6 text-amber-700" />,
  ];
  const rankColors = ['text-slate-300', 'text-amber-400', 'text-amber-700'];
  return (
    <div className="space-y-8 max-w-2xl">
      {top3.length >= 2 && (
        <div className="flex items-end justify-center gap-4 pt-4">
          {podiumOrder.map((v, i) => {
            if (!v) return null;
            const initials = v.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            return (
              <div key={v.id} className="flex flex-col items-center gap-2">
                {medals[i]}
                <div className={`w-12 h-12 rounded-full border-2 ${i===1?'border-amber-400':'border-slate-600'} bg-slate-800 flex items-center justify-center text-sm font-bold ${rankColors[i]}`}>
                  {initials}
                </div>
                <p className="text-xs font-semibold text-slate-200 text-center max-w-[80px] leading-tight">{v.name}</p>
                <p className={`text-xs font-bold ${rankColors[i]}`}>{v.points.toLocaleString()} pts</p>
                <div className={cn('w-20 rounded-t-lg flex items-center justify-center', podiumColors[i], podiumHeights[i])}>
                  <span className="text-sm font-bold text-slate-300">{i===1?'1st':i===0?'2nd':'3rd'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h3 className="text-sm font-bold text-slate-200">Global Rankings</h3>
          <span className="text-xs text-slate-500">{volunteers.length} volunteers</span>
        </div>
        <div className="divide-y divide-slate-800/50">
          {rest.map((v, i) => {
            const initials = v.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            const maxPoints = sorted[0]?.points || 1;
            return (
              <div key={v.id} className="p-3 flex items-center gap-3 hover:bg-slate-800/30 transition-colors">
                <span className="text-sm font-bold text-slate-500 w-6 text-center">#{i+4}</span>
                <div className="w-8 h-8 rounded-full bg-indigo-900/50 border border-indigo-800/50 flex items-center justify-center text-xs font-bold text-indigo-300">{initials}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{v.name}</p>
                  <div className="flex gap-1 mt-0.5">
                    {v.badges.slice(0, 3).map(b => <span key={b} className="text-xs">{BADGE_META[b]?.icon || '🏅'}</span>)}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-indigo-400">{v.points.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500">pts</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TeamFormation({ volunteers }: { volunteers: Volunteer[] }) {
  const available = volunteers.filter((v) => ['available', 'full-time'].includes(v.availability));
  const skillGroups: Record<string, Volunteer[]> = {};
  available.forEach((v) => {
    (v.skills || []).slice(0, 2).forEach((skill) => {
      if (!skillGroups[skill]) skillGroups[skill] = [];
      skillGroups[skill].push(v);
    });
  });
  const topSkills = Object.entries(skillGroups).sort((a, b) => b[1].length - a[1].length).slice(0, 6);
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">Available volunteers grouped by skill for team formation</p>
      {topSkills.length === 0 ? (
        <div className="text-center py-12 text-slate-500"><UsersRound className="h-10 w-10 mx-auto mb-3 opacity-40" /><p>No available volunteers</p></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topSkills.map(([skill, vols]) => (
            <div key={skill} className="glass-card rounded-xl border border-slate-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-200">{skill}</h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">{vols.length}</span>
              </div>
              <div className="space-y-2">
                {vols.slice(0, 4).map((v) => {
                  const initials = v.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                  return (
                    <div key={v.id} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">{initials}</div>
                      <span className="text-xs font-medium text-slate-300 truncate">{v.name}</span>
                    </div>
                  );
                })}
                {vols.length > 4 && <p className="text-xs text-slate-500">+{vols.length - 4} more</p>}
              </div>
              <button className="w-full mt-3 py-1.5 rounded-lg border border-slate-700 hover:border-indigo-500 text-slate-400 hover:text-indigo-400 text-xs font-medium transition-colors">Form Team</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VolunteersPage() {
  const { t } = useTranslation();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/volunteers').then((res) => {
      if (res.data.success) {
        const vols = res.data.data?.volunteers || res.data.data || [];
        if (Array.isArray(vols) && vols.length > 0) {
          const normalized = vols.map((v: any) => ({
            id: v.id || v._id, name: v.user?.name || v.name || 'Unknown',
            email: v.user?.email || v.email, skills: v.skills || [],
            location: v.location || v.user?.location || '', availability: v.availability || 'weekends',
            reputationScore: v.user?.reputationScore || v.reputationScore || 50,
            points: v.user?.points || v.points || 0, badges: v.user?.badges || v.badges || [],
            tasksCompleted: v.tasksCompleted || 0, impactScore: v.impactScore || 0,
          }));
          setVolunteers(normalized);
          return;
        }
      }
      setVolunteers(DEMO_VOLUNTEERS);
    }).catch(() => setVolunteers(DEMO_VOLUNTEERS)).finally(() => setLoading(false));
  }, []);

  const filtered = volunteers.filter((v) =>
    !search || v.name.toLowerCase().includes(search.toLowerCase()) ||
    (v.skills || []).some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">{t('volunteers.title')}</h1>
            <p className="text-slate-400 mt-1">{t('volunteers.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Users className="h-4 w-4" />
            <span>{volunteers.length} {t('volunteers.total').toLowerCase()}</span>
          </div>
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            placeholder={t('volunteers.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:border-indigo-500 focus:outline-none placeholder:text-slate-500"
          />
        </div>
        <Tabs defaultValue="volunteers">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-slate-800 border border-slate-700">
            <TabsTrigger value="volunteers" className="gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Users className="h-4 w-4" /><span className="hidden sm:inline">{t('volunteers.leaderboard').replace('Leaderboard','').trim() || t('nav.volunteers')}</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Trophy className="h-4 w-4" /><span className="hidden sm:inline">{t('volunteers.leaderboard')}</span>
            </TabsTrigger>
            <TabsTrigger value="teams" className="gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <UsersRound className="h-4 w-4" /><span className="hidden sm:inline">{t('common.and')} Teams</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="volunteers" className="mt-6">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array(8).fill(0).map((_, i) => <div key={i} className="h-52 rounded-2xl bg-slate-800 animate-pulse" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-500"><Users className="h-10 w-10 mx-auto mb-3 opacity-40" /><p>No volunteers found</p></div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((v) => <VolunteerCard key={v.id} volunteer={v} />)}
              </div>
            )}
          </TabsContent>
          <TabsContent value="leaderboard" className="mt-6">
            {loading ? (
              <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-800 animate-pulse" />)}</div>
            ) : <Leaderboard volunteers={volunteers} />}
          </TabsContent>
          <TabsContent value="teams" className="mt-6">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array(6).fill(0).map((_, i) => <div key={i} className="h-48 rounded-xl bg-slate-800 animate-pulse" />)}</div>
            ) : <TeamFormation volunteers={volunteers} />}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
