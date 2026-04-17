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
import { Search, Users, Trophy, UsersRound, Star, MapPin, Crown, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Volunteer {
  id: string;
  name: string;
  email?: string;
  skills: string[];
  location: string;
  availability: string;
  reputationScore: number;
  points: number;
  badges: string[];
  tasksCompleted?: number;
  impactScore?: number;
}

const AVAILABILITY_CONFIG: Record<string, { label: string; color: string }> = {
  available: { label: 'Available', color: 'bg-secondary text-secondary-foreground' },
  'full-time': { label: 'Full-time', color: 'bg-primary text-primary-foreground' },
  'part-time': { label: 'Part-time', color: 'bg-muted text-muted-foreground' },
  weekends: { label: 'Weekends', color: 'bg-muted text-muted-foreground' },
  evenings: { label: 'Evenings', color: 'bg-muted text-muted-foreground' },
};

function VolunteerCard({ volunteer }: { volunteer: Volunteer }) {
  const avail = AVAILABILITY_CONFIG[volunteer.availability] || { label: volunteer.availability, color: 'bg-muted text-muted-foreground' };
  const initials = volunteer.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm text-foreground truncate">{volunteer.name}</h3>
              <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0', avail.color)}>
                {avail.label}
              </span>
            </div>
            {volunteer.location && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" />{volunteer.location}
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {(volunteer.skills || []).slice(0, 3).map((s) => (
            <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
          ))}
        </div>

        <Separator className="my-3" />

        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-sm font-bold text-foreground">{volunteer.points}</p>
            <p className="text-[10px] text-muted-foreground">Points</p>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{volunteer.reputationScore}</p>
            <p className="text-[10px] text-muted-foreground">Reputation</p>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{volunteer.badges?.length || 0}</p>
            <p className="text-[10px] text-muted-foreground">Badges</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Leaderboard({ volunteers }: { volunteers: Volunteer[] }) {
  const sorted = [...volunteers].sort((a, b) => b.points - a.points);
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const podiumHeights = ['h-24', 'h-32', 'h-20'];
  const podiumColors = ['bg-muted', 'bg-primary/20', 'bg-muted'];
  const medals = [
    <Medal key="silver" className="h-6 w-6 text-slate-400" />,
    <Crown key="gold" className="h-7 w-7 text-amber-400" />,
    <Medal key="bronze" className="h-6 w-6 text-amber-700" />,
  ];

  return (
    <div className="space-y-8">
      {/* Podium */}
      {top3.length >= 2 && (
        <div className="flex items-end justify-center gap-4 pt-4">
          {podiumOrder.map((v, i) => {
            if (!v) return null;
            const initials = v.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
            return (
              <div key={v.id} className="flex flex-col items-center gap-2">
                {medals[i]}
                <Avatar className="h-12 w-12 ring-2 ring-border">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">{initials}</AvatarFallback>
                </Avatar>
                <p className="text-xs font-semibold text-foreground text-center max-w-[80px] leading-tight">{v.name}</p>
                <div className={cn('w-20 rounded-t-lg flex items-center justify-center', podiumColors[i], podiumHeights[i])}>
                  <span className="text-sm font-bold text-foreground">{i === 1 ? '1st' : i === 0 ? '2nd' : '3rd'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rankings list */}
      <div className="space-y-2">
        {rest.map((v, i) => {
          const initials = v.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
          const rank = i + 4;
          const maxPoints = sorted[0]?.points || 1;
          return (
            <Card key={v.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-muted-foreground w-6 text-center">#{rank}</span>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-muted text-xs font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{v.name}</p>
                    <Progress value={(v.points / maxPoints) * 100} className="h-1.5 mt-1" />
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-foreground">{v.points}</p>
                    <p className="text-[10px] text-muted-foreground">pts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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

  const topSkills = Object.entries(skillGroups)
    .filter(([, vols]) => vols.length >= 1)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 6);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Available volunteers grouped by skill for team formation</p>
      {topSkills.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <UsersRound className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>No available volunteers to form teams</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topSkills.map(([skill, vols]) => (
            <Card key={skill}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>{skill}</span>
                  <Badge variant="secondary">{vols.length} volunteers</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {vols.slice(0, 4).map((v) => {
                  const initials = v.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
                  return (
                    <div key={v.id} className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[10px] bg-muted">{initials}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-foreground truncate">{v.name}</span>
                    </div>
                  );
                })}
                {vols.length > 4 && <p className="text-xs text-muted-foreground">+{vols.length - 4} more</p>}
                <Button size="sm" variant="outline" className="w-full mt-2 text-xs h-7">Form Team</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/volunteers').then((res) => {
      if (res.data.success) {
        const vols = res.data.data?.volunteers || res.data.data || [];
        // Normalize volunteer profile data
        const normalized = vols.map((v: any) => ({
          id: v.id || v._id,
          name: v.user?.name || v.name || 'Unknown',
          email: v.user?.email || v.email,
          skills: v.skills || [],
          location: v.location || v.user?.location || '',
          availability: v.availability || 'weekends',
          reputationScore: v.user?.reputationScore || v.reputationScore || 50,
          points: v.user?.points || v.points || 0,
          badges: v.user?.badges || v.badges || [],
          tasksCompleted: v.tasksCompleted || 0,
          impactScore: v.impactScore || 0,
        }));
        setVolunteers(normalized);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = volunteers.filter((v) =>
    !search ||
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    (v.skills || []).some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Volunteer Ecosystem</h1>
            <p className="text-muted-foreground mt-1">Manage volunteers, track performance, and build teams</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{volunteers.length} total volunteers</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or skill..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="volunteers">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="volunteers" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Volunteers</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="teams" className="gap-2">
              <UsersRound className="h-4 w-4" />
              <span className="hidden sm:inline">Teams</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="volunteers" className="mt-6">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-52" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>No volunteers found</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((v) => <VolunteerCard key={v.id} volunteer={v} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-6 max-w-2xl">
            {loading ? (
              <div className="space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
            ) : (
              <Leaderboard volunteers={volunteers} />
            )}
          </TabsContent>

          <TabsContent value="teams" className="mt-6">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48" />)}
              </div>
            ) : (
              <TeamFormation volunteers={volunteers} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
