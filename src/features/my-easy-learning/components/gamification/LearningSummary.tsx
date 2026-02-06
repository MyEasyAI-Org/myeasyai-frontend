/**
 * LearningSummary Component
 *
 * Compact summary of gamification status for the learning dashboard.
 * Shows streak, XP/level, and recent achievements at a glance.
 */

import { memo } from 'react';
import { Flame, GraduationCap, Award, BookOpen } from 'lucide-react';

interface LearningSummaryProps {
  streak: {
    current: number;
    isActiveToday: boolean;
  };
  xp: {
    level: number;
    progressPercent: number;
  };
  achievements: {
    unlockedCount: number;
    totalCount: number;
    recentUnlocks: Array<{ name: string }>;
  };
  stats: {
    totalTasksCompleted: number;
    totalLessonsCompleted: number;
  };
}

export const LearningSummary = memo(function LearningSummary({
  streak,
  xp,
  achievements,
  stats,
}: LearningSummaryProps) {
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
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <GraduationCap className="h-5 w-5 text-cyan-400" />
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
                stroke="rgb(34 211 238)"
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

        {/* Achievements */}
        <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Award className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">{achievements.unlockedCount}</p>
            <p className="text-xs text-slate-500">de {achievements.totalCount} conquistas</p>
          </div>
        </div>

        {/* Tasks completed */}
        <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <BookOpen className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">
              {stats.totalTasksCompleted}
            </p>
            <p className="text-xs text-slate-500">Tarefas</p>
          </div>
        </div>
      </div>

      {/* Recent achievement unlock */}
      {achievements.recentUnlocks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <div className="flex items-center gap-2 text-xs">
            <Award className="h-3.5 w-3.5 text-purple-400" />
            <span className="text-slate-400">Conquista recente:</span>
            <span className="text-purple-400 font-medium">
              {achievements.recentUnlocks[0].name}
            </span>
          </div>
        </div>
      )}

      {/* Streak warning if not active today */}
      {streak.current > 0 && !streak.isActiveToday && (
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <div className="flex items-center gap-2 text-xs bg-yellow-500/10 text-yellow-400 px-3 py-2 rounded-lg">
            <Flame className="h-3.5 w-3.5" />
            <span>Estude hoje para manter sua sequencia de {streak.current} dias!</span>
          </div>
        </div>
      )}
    </div>
  );
});

export default LearningSummary;
