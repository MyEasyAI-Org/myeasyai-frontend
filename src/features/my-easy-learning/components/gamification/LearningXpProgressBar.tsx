/**
 * LearningXpProgressBar Component
 *
 * Displays XP progress bar with level indicator for learning.
 */

import { memo, useMemo } from 'react';
import { TrendingUp, Star, Sparkles, GraduationCap } from 'lucide-react';

interface LearningXpProgressBarProps {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
  compact?: boolean;
}

export const LearningXpProgressBar = memo(function LearningXpProgressBar({
  level,
  currentXP,
  nextLevelXP,
  totalXP,
  compact = false,
}: LearningXpProgressBarProps) {
  const progressPercent = useMemo(() => {
    return Math.min(Math.round((currentXP / nextLevelXP) * 100), 100);
  }, [currentXP, nextLevelXP]);

  // Determine level tier for styling
  const levelTier = useMemo(() => {
    if (level >= 50) return 'legendary';
    if (level >= 30) return 'epic';
    if (level >= 15) return 'rare';
    if (level >= 5) return 'uncommon';
    return 'common';
  }, [level]);

  const tierColors = {
    legendary: {
      bg: 'bg-amber-500',
      text: 'text-amber-400',
      border: 'border-amber-500/50',
      glow: 'shadow-amber-500/30',
    },
    epic: {
      bg: 'bg-purple-500',
      text: 'text-purple-400',
      border: 'border-purple-500/50',
      glow: 'shadow-purple-500/30',
    },
    rare: {
      bg: 'bg-blue-500',
      text: 'text-blue-400',
      border: 'border-blue-500/50',
      glow: 'shadow-blue-500/30',
    },
    uncommon: {
      bg: 'bg-green-500',
      text: 'text-green-400',
      border: 'border-green-500/50',
      glow: 'shadow-green-500/30',
    },
    common: {
      bg: 'bg-cyan-500',
      text: 'text-cyan-400',
      border: 'border-cyan-500/50',
      glow: 'shadow-cyan-500/30',
    },
  };

  const colors = tierColors[levelTier];

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
        {/* Level badge */}
        <div
          className={`relative w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center shadow-lg ${colors.glow}`}
        >
          <span className="text-sm font-bold text-white">{level}</span>
          {level >= 30 && (
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300" />
          )}
        </div>

        {/* Progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-slate-300">Nivel {level}</span>
            <span className="text-xs text-slate-500">
              {currentXP}/{nextLevelXP} XP
            </span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${colors.bg} transition-all duration-500 ease-out`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
      <div className="flex items-center gap-4">
        {/* Level badge */}
        <div
          className={`relative w-16 h-16 rounded-full ${colors.bg} flex items-center justify-center shadow-lg ${colors.glow}`}
        >
          <span className="text-2xl font-bold text-white">{level}</span>
          {level >= 30 && (
            <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-300" />
          )}
        </div>

        {/* Info and progress */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <GraduationCap className={`h-4 w-4 ${colors.text}`} />
              <span className="font-semibold text-white">Nivel {level}</span>
            </div>
            <span className="text-sm text-slate-400">
              {totalXP.toLocaleString()} XP total
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full ${colors.bg} transition-all duration-500 ease-out`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* XP info */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">
              <span className={colors.text}>{currentXP}</span> / {nextLevelXP} XP
            </span>
            <div className="flex items-center gap-1 text-slate-500">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{progressPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Next level preview */}
      {progressPercent >= 80 && (
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <span className="text-yellow-400">
              Quase la! Faltam {nextLevelXP - currentXP} XP para o nivel {level + 1}
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

export default LearningXpProgressBar;
