'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import { Trophy, Medal, TrendingUp, Crown, Star } from 'lucide-react';

interface Leader {
  _id: string; name: string; points: number; reputationScore: number; badges: string[]; rank: number;
}

const DEMO_LEADERS: Leader[] = [
  { _id: 'l1', name: 'Priya Sharma', points: 4820, reputationScore: 96, badges: ['first_task', 'ten_tasks', 'first_aid_hero', 'crisis_responder'], rank: 1 },
  { _id: 'l2', name: 'Meera Iyer', points: 4510, reputationScore: 93, badges: ['first_task', 'ten_tasks', 'first_aid_hero', 'weekly_star'], rank: 2 },
  { _id: 'l3', name: 'Rahul Verma', points: 4120, reputationScore: 91, badges: ['first_task', 'ten_tasks', 'team_player'], rank: 3 },
  { _id: 'l4', name: 'Deepika Reddy', points: 3720, reputationScore: 88, badges: ['first_task', 'five_tasks', 'team_player'], rank: 4 },
  { _id: 'l5', name: 'Arjun Mehta', points: 3640, reputationScore: 89, badges: ['first_task', 'five_tasks', 'community_voice'], rank: 5 },
  { _id: 'l6', name: 'Anita Patel', points: 3310, reputationScore: 87, badges: ['first_task', 'five_tasks', 'community_voice'], rank: 6 },
  { _id: 'l7', name: 'Kavya Nair', points: 2980, reputationScore: 84, badges: ['first_task', 'five_tasks', 'mentor'], rank: 7 },
  { _id: 'l8', name: 'Sunita Devi', points: 2880, reputationScore: 82, badges: ['first_task', 'five_tasks', 'mentor'], rank: 8 },
  { _id: 'l9', name: 'Vikram Tiwari', points: 2340, reputationScore: 76, badges: ['first_task', 'five_tasks'], rank: 9 },
  { _id: 'l10', name: 'Ravi Kumar', points: 1990, reputationScore: 74, badges: ['first_task'], rank: 10 },
];

const BADGE_META: Record<string, string> = {
  first_task: '🎯', five_tasks: '⭐', ten_tasks: '🏆', first_aid_hero: '🏥',
  crisis_responder: '🚨', team_player: '🤝', mentor: '📚',
  top_donor: '💎', community_voice: '📢', weekly_star: '🌟',
};

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/gamification/leaderboard').then((res) => {
      if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setLeaders(res.data.data);
      } else {
        setLeaders(DEMO_LEADERS);
      }
    }).catch(() => setLeaders(DEMO_LEADERS)).finally(() => setIsLoading(false));
  }, []);

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  const PODIUM_CONFIG = [
    { rank: '2nd', color: 'border-slate-300 text-slate-300', barH: 'h-28', barBg: 'bg-gradient-to-t from-slate-600/50 to-slate-400/10', pts: 'text-slate-300' },
    { rank: '1st', color: 'border-amber-400 text-amber-100', barH: 'h-40', barBg: 'bg-gradient-to-t from-amber-900/50 to-amber-500/10', pts: 'text-amber-400' },
    { rank: '3rd', color: 'border-amber-700 text-amber-500', barH: 'h-20', barBg: 'bg-gradient-to-t from-amber-900/30 to-amber-700/10', pts: 'text-amber-700' },
  ];
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const medalIcons = ['🥈', '🥇', '🥉'];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto py-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-100 mb-3">Volunteer Leaderboard</h1>
          <p className="text-slate-400">Top contributors making a real-world impact. Earn points by completing tasks and reporting needs!</p>
        </div>

        {/* Podium */}
        {!isLoading && top3.length >= 3 && (
          <div className="flex flex-col md:flex-row items-end justify-center gap-4 mb-4">
            {podiumOrder.map((leader, i) => {
              if (!leader) return null;
              const cfg = PODIUM_CONFIG[i];
              return (
                <div key={leader._id} className={`flex flex-col items-center flex-1 max-w-[160px] ${i === 1 ? 'z-10' : 'opacity-90'}`}>
                  <span className="text-3xl mb-2">{medalIcons[i]}</span>
                  <div className={`w-14 h-14 rounded-full border-2 ${cfg.color} bg-slate-800 flex items-center justify-center text-lg font-bold mb-2 relative`}>
                    {leader.name.charAt(0)}
                  </div>
                  <p className="font-bold text-slate-200 text-sm text-center mb-1">{leader.name}</p>
                  <p className={`font-semibold text-sm mb-3 ${cfg.pts}`}>{leader.points.toLocaleString()} pts</p>
                  <div className={`w-full ${cfg.barH} ${cfg.barBg} rounded-t-2xl border border-white/5 border-b-0 flex items-center justify-center`}>
                    <span className="text-sm font-bold text-slate-400">{cfg.rank}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full Rankings List */}
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
            <h2 className="text-base font-bold text-slate-200">Global Ranking</h2>
            <div className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Updated live
            </div>
          </div>
          {isLoading ? (
            <div className="p-12 text-center text-indigo-400">Loading rankings...</div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {rest.map((leader, i) => (
                <div key={leader._id} className="p-4 flex items-center gap-4 hover:bg-slate-800/30 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-slate-400">
                    {i + 4}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-indigo-900/50 border border-indigo-800/50 flex items-center justify-center font-bold text-indigo-300 text-sm">
                    {leader.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-200 text-sm">{leader.name}</p>
                    <div className="flex gap-1 mt-0.5">
                      {leader.badges?.slice(0, 4).map((b, idx) => (
                        <span key={idx} className="text-sm">{BADGE_META[b] || '🏅'}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-400 text-sm">{leader.points.toLocaleString()} pts</p>
                    <p className="text-xs text-slate-500">Rep: {leader.reputationScore}</p>
                  </div>
                </div>
              ))}
              {leaders.length <= 3 && (
                <div className="p-12 text-center text-slate-500">No more leaders to display.</div>
              )}
            </div>
          )}
        </div>

        {/* How to Earn Points */}
        <div className="glass-card rounded-2xl border border-slate-800 p-6">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2"><Star className="w-4 h-4 text-amber-400" /> How to Earn Points</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { action: 'Complete a task', pts: '+100 pts', icon: '✅' },
              { action: 'Report a need', pts: '+25 pts', icon: '📍' },
              { action: 'Donate to campaign', pts: '+50 pts', icon: '❤️' },
              { action: 'Refer a volunteer', pts: '+75 pts', icon: '👥' },
            ].map(item => (
              <div key={item.action} className="bg-slate-800/50 rounded-xl p-3 text-center border border-slate-700/50">
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-xs font-bold text-indigo-400">{item.pts}</div>
                <div className="text-xs text-slate-400 mt-0.5">{item.action}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
