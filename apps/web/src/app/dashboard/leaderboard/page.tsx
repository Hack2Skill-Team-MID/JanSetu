'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import { Trophy, Star, Award, Shield, TrendingUp } from 'lucide-react';

const BADGE_META: Record<string, { icon: string; color: string }> = {
  first_task: { icon: '🎯', color: 'bg-blue-500/15 text-blue-400' },
  five_tasks: { icon: '⭐', color: 'bg-amber-500/15 text-amber-400' },
  ten_tasks: { icon: '🏆', color: 'bg-yellow-500/15 text-yellow-400' },
  first_aid_hero: { icon: '🏥', color: 'bg-emerald-500/15 text-emerald-400' },
  crisis_responder: { icon: '🚨', color: 'bg-red-500/15 text-red-400' },
  team_player: { icon: '🤝', color: 'bg-indigo-500/15 text-indigo-400' },
  mentor: { icon: '📚', color: 'bg-purple-500/15 text-purple-400' },
  top_donor: { icon: '💎', color: 'bg-cyan-500/15 text-cyan-400' },
  weekly_star: { icon: '🌟', color: 'bg-amber-500/15 text-amber-400' },
  verified_ngo: { icon: '✅', color: 'bg-emerald-500/15 text-emerald-400' },
  admin: { icon: '🛡️', color: 'bg-slate-500/15 text-slate-400' },
};

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/gamification/leaderboard');
        if (res.data.success) setLeaders(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border-amber-500/30';
    if (rank === 2) return 'bg-gradient-to-r from-slate-400/10 to-slate-500/5 border-slate-400/30';
    if (rank === 3) return 'bg-gradient-to-r from-orange-500/10 to-amber-500/5 border-orange-500/20';
    return 'border-slate-800';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-400" />
            Volunteer Leaderboard
          </h1>
          <p className="text-slate-400 mt-1">Top contributors across the JanSetu network</p>
        </div>

        {/* Top 3 podium */}
        {!isLoading && leaders.length >= 3 && (
          <div className="grid grid-cols-3 gap-4">
            {[leaders[1], leaders[0], leaders[2]].map((l, idx) => {
              const isFirst = idx === 1;
              return (
                <div key={l._id} className={`glass-card rounded-2xl border p-6 text-center ${isFirst ? 'border-amber-500/30 -mt-2 scale-105' : 'border-slate-800 mt-4'} transition-transform`}>
                  <div className={`text-3xl mb-3 ${isFirst ? 'text-4xl' : ''}`}>
                    {getRankIcon(l.rank)}
                  </div>
                  <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center text-lg font-bold ${
                    isFirst ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-white' : 'bg-slate-700 text-slate-200'
                  }`}>
                    {l.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <h3 className="text-base font-semibold text-slate-100 mt-3">{l.name}</h3>
                  <div className={`text-2xl font-bold mt-2 ${isFirst ? 'text-amber-400' : 'text-indigo-400'}`}>
                    {l.points} pts
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Star className="w-3 h-3 text-slate-500" />
                    <span className="text-xs text-slate-400">Rep: {l.reputationScore}/100</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3 justify-center">
                    {l.badges?.slice(0, 3).map((b: string) => (
                      <span key={b} className={`px-2 py-0.5 text-xs rounded-md ${BADGE_META[b]?.color || 'bg-slate-700 text-slate-300'}`}>
                        {BADGE_META[b]?.icon || '🏅'} {b.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full rankings */}
        <div className="glass-card rounded-2xl border border-slate-800">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" /> Full Rankings
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {leaders.map((l) => (
                <div key={l._id} className={`flex items-center gap-4 px-6 py-4 hover:bg-slate-800/30 transition-colors border-l-2 ${getRankStyle(l.rank)}`}>
                  <div className="w-10 text-center text-lg font-bold text-slate-300">
                    {getRankIcon(l.rank)}
                  </div>

                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-200">
                    {l.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-100">{l.name}</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {l.badges?.map((b: string) => (
                        <span key={b} className="text-xs">{BADGE_META[b]?.icon || '🏅'}</span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-indigo-400">{l.points}</div>
                    <div className="text-xs text-slate-500">points</div>
                  </div>

                  <div className="text-right w-20">
                    <div className="flex items-center gap-1 justify-end">
                      <Shield className="w-3 h-3 text-slate-500" />
                      <span className="text-sm font-semibold text-slate-300">{l.reputationScore}</span>
                    </div>
                    <div className="text-xs text-slate-500">reputation</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
