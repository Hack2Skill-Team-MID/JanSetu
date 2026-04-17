'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import { Trophy, Medal, Star, Award, TrendingUp } from 'lucide-react';

interface Leader {
  _id: string;
  name: string;
  points: number;
  reputationScore: number;
  badges: string[];
  rank: number;
}

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/gamification/leaderboard');
        if (res.data.success) {
          setLeaders(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto py-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Volunteer Leaderboard</h1>
          <p className="text-slate-400">Discover our top contributors making a real-world impact. Earn points by completing tasks and reporting needs!</p>
        </div>

        {/* Podium (Top 3) */}
        {!isLoading && leaders.length >= 3 && (
          <div className="flex flex-col md:flex-row items-end justify-center gap-4 mb-12 h-64 mt-12">
            
            {/* 2nd Place */}
            <div className="flex flex-col items-center flex-1 order-2 md:order-1 transform translate-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-700 mb-3 border-4 border-slate-300 flex items-center justify-center text-xl font-bold text-slate-300 relative">
                {leaders[1]?.name.charAt(0)}
                <div className="absolute -bottom-2 w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center text-slate-900 text-xs font-bold ring-2 ring-slate-900">2</div>
              </div>
              <p className="font-bold text-white mb-1">{leaders[1]?.name}</p>
              <p className="text-indigo-400 font-semibold mb-3">{leaders[1]?.points} pts</p>
              <div className="w-full h-32 bg-gradient-to-t from-indigo-900/50 to-indigo-600/20 rounded-t-2xl border border-indigo-500/20 border-b-0"></div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center flex-1 order-1 md:order-2 z-10">
              <div className="w-20 h-20 rounded-full bg-yellow-600 mb-3 border-4 border-yellow-400 flex items-center justify-center text-3xl font-bold text-yellow-100 relative shadow-[0_0_20px_rgba(250,204,21,0.5)]">
                {leaders[0]?.name.charAt(0)}
                <div className="absolute -top-4 text-yellow-400"><Medal className="w-8 h-8" /></div>
                <div className="absolute -bottom-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 text-sm font-bold ring-2 ring-slate-900">1</div>
              </div>
              <p className="font-bold text-white text-lg mb-1">{leaders[0]?.name}</p>
              <p className="text-yellow-400 font-semibold mb-3">{leaders[0]?.points} pts</p>
              <div className="w-full h-40 bg-gradient-to-t from-yellow-900/50 to-yellow-600/20 rounded-t-2xl border border-yellow-500/30 border-b-0 relative">
                <div className="absolute inset-x-0 top-0 h-1 bg-yellow-400/50"></div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center flex-1 order-3 transform translate-y-8">
              <div className="w-16 h-16 rounded-full bg-amber-900 mb-3 border-4 border-amber-700 flex items-center justify-center text-xl font-bold text-amber-500 relative">
                {leaders[2]?.name.charAt(0)}
                <div className="absolute -bottom-2 w-6 h-6 bg-amber-700 rounded-full flex items-center justify-center text-amber-100 text-xs font-bold ring-2 ring-slate-900">3</div>
              </div>
              <p className="font-bold text-white mb-1">{leaders[2]?.name}</p>
              <p className="text-amber-500 font-semibold mb-3">{leaders[2]?.points} pts</p>
              <div className="w-full h-24 bg-gradient-to-t from-amber-900/50 to-amber-700/20 rounded-t-2xl border border-amber-500/20 border-b-0"></div>
            </div>

          </div>
        )}

        {/* Full List */}
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h2 className="text-lg font-bold text-white">Global Ranking</h2>
            <div className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Updated live
            </div>
          </div>
          
          {isLoading ? (
            <div className="p-12 text-center text-indigo-400">Loading rankings...</div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {leaders.slice(3).map((leader, i) => (
                <div key={leader._id} className="p-4 flex items-center gap-4 hover:bg-slate-800/30 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-400">
                    {i + 4}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-indigo-900 flex items-center justify-center font-bold text-indigo-200">
                    {leader.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-200">{leader.name}</p>
                    <div className="flex gap-2 mt-1">
                      {leader.badges?.slice(0, 3).map((b, idx) => (
                        <span key={idx} className="w-4 h-4 text-xs">⭐</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-400">{leader.points} pts</p>
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
      </div>
    </DashboardLayout>
  );
}
