/**
 * GamificationSummary Component
 *
 * Compact summary of gamification status for the Visao Geral tab.
 * Shows streak, XP/level, and recent achievements at a glance.
 */

import { memo } from 'react';
import { Flame, Star, Award, Target } from 'lucide-react';

interface GamificationSummaryProps {
  streak: {
    current: number;
    isActiveToday: boolean;
  };
  xp: {
    level: number;
    progressPercent: number;
  };
  badges: {
    unlockedCount: number;
    totalCount: number;
    recentUnlocks: Array<{ name: string }>;
  };
  challenges: {
    dailyProgress: { completed: number; total: number };
    weeklyProgress: { completed: number; total: number };
  };
}

export const GamificationSummary = memo(function GamificationSummary({
  streak,
  xp,
  badges,
  challenges,
}: GamificationSummaryProps) {
  const totalChallengesCompleted =
    challenges.dailyProgress.completed + challenges.weeklyProgress.completed;
  const totalChallenges =
    challenges.dailyProgress.total + challenges.weeklyProgress.total;

  return (
    <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/50 rounded-xl border border-slate-700 p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-slate-300">Seu Progresso</h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Streak */}
        <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
          <div
            className={`p-2 rounded-lg ${
              streak.current > 0 ? 'bg-orange-500/20' : 'bg-slate-700/50'
            }`}
          >
            <Flame
              className={`h-5 w-5 ${
                streak.current > 0 ? 'text-orange-400' : 'text-slate-500'
              }`}
            />
          </div>
          <div>
            <p className="text-lg font-bold text-white">{streak.current}</p>
            <p className="text-xs text-slate-500">
              {streak.isActiveToday ? 'Ativo hoje' : 'Sequencia'}
            </p>
          </div>
        </div>

        {/* Level */}
        <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
          <div className="relative">
            <div className="p-2 rounded-lg bg-lime-500/20">
              <Star className="h-5 w-5 text-lime-400" />
            </div>
            {/* Mini progress ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="none"
                stroke="rgb(51 65 85 / 0.5)"
                strokeWidth="2"
              />
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="none"
                stroke="rgb(132 204 22)"
                strokeWidth="2"
                strokeDasharray={`${xp.progressPercent * 2.83} 283`}
              />
            </svg>
          </div>
          <div>
            <p className="text-lg font-bold text-white">Nv. {xp.level}</p>
            <p className="text-xs text-slate-500">{xp.progressPercent}% XP</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
          <div className="p-2 rounded-lg bg-amber-500/20">
            <Award className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">{badges.unlockedCount}</p>
            <p className="text-xs text-slate-500">de {badges.totalCount} badges</p>
          </div>
        </div>

        {/* Challenges */}
        <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Target className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">
              {totalChallengesCompleted}/{totalChallenges}
            </p>
            <p className="text-xs text-slate-500">Desafios</p>
          </div>
        </div>
      </div>

      {/* Recent badge unlock */}
      {badges.recentUnlocks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <div className="flex items-center gap-2 text-xs">
            <Award className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-slate-400">Conquista recente:</span>
            <span className="text-amber-400 font-medium">
              {badges.recentUnlocks[0].name}
            </span>
          </div>
        </div>
      )}

      {/* Streak warning if not active today */}
      {streak.current > 0 && !streak.isActiveToday && (
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <div className="flex items-center gap-2 text-xs bg-yellow-500/10 text-yellow-400 px-3 py-2 rounded-lg">
            <Flame className="h-3.5 w-3.5" />
            <span>Treine hoje para manter sua sequencia de {streak.current} dias!</span>
          </div>
        </div>
      )}
    </div>
  );
});

export default GamificationSummary;
