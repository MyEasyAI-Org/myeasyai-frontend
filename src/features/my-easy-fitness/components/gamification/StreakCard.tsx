/**
 * StreakCard Component
 *
 * Displays current streak with fire animation and motivational messages.
 */

import { memo, useMemo } from 'react';
import { Flame, Calendar, Trophy, AlertTriangle } from 'lucide-react';
import { getStreakMessage } from '../../constants/gamification';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  isActiveToday: boolean;
  totalActiveDays: number;
  compact?: boolean;
}

export const StreakCard = memo(function StreakCard({
  currentStreak,
  longestStreak,
  isActiveToday,
  totalActiveDays,
  compact = false,
}: StreakCardProps) {
  const message = useMemo(() => getStreakMessage(currentStreak), [currentStreak]);

  // Determine flame intensity based on streak
  const flameIntensity = useMemo(() => {
    if (currentStreak >= 100) return 'legendary';
    if (currentStreak >= 30) return 'epic';
    if (currentStreak >= 7) return 'strong';
    if (currentStreak >= 3) return 'medium';
    return 'low';
  }, [currentStreak]);

  const flameColors = {
    legendary: 'text-amber-400',
    epic: 'text-orange-400',
    strong: 'text-orange-500',
    medium: 'text-orange-600',
    low: 'text-slate-500',
  };

  const glowColors = {
    legendary: 'shadow-amber-500/50',
    epic: 'shadow-orange-500/40',
    strong: 'shadow-orange-500/30',
    medium: 'shadow-orange-500/20',
    low: '',
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
        <div
          className={`relative ${currentStreak > 0 ? 'animate-pulse' : ''}`}
          style={{ animationDuration: '2s' }}
        >
          <Flame
            className={`h-6 w-6 ${flameColors[flameIntensity]} ${
              currentStreak > 0 ? `drop-shadow-lg ${glowColors[flameIntensity]}` : ''
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{currentStreak}</span>
            <span className="text-sm text-slate-400">
              {currentStreak === 1 ? 'dia' : 'dias'}
            </span>
          </div>
          {!isActiveToday && currentStreak > 0 && (
            <div className="flex items-center gap-1 text-yellow-500 text-xs">
              <AlertTriangle className="h-3 w-3" />
              <span>Treine hoje para manter!</span>
            </div>
          )}
        </div>
        {isActiveToday && (
          <div className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
            Ativo
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header with flame */}
      <div className="p-4 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`relative p-3 rounded-full bg-slate-800/80 ${
                currentStreak > 0 ? 'animate-pulse' : ''
              }`}
              style={{ animationDuration: '2s' }}
            >
              <Flame
                className={`h-8 w-8 ${flameColors[flameIntensity]} ${
                  currentStreak > 0 ? `drop-shadow-lg ${glowColors[flameIntensity]}` : ''
                }`}
              />
              {currentStreak >= 7 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">
                    {currentStreak >= 100 ? '!' : currentStreak >= 30 ? '+' : ''}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Sequencia</h3>
              <p className="text-sm text-slate-400">{message}</p>
            </div>
          </div>

          {isActiveToday ? (
            <div className="px-3 py-1.5 bg-green-500/20 text-green-400 text-sm rounded-full border border-green-500/30">
              Ativo hoje
            </div>
          ) : currentStreak > 0 ? (
            <div className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 text-sm rounded-full border border-yellow-500/30 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              Treine hoje!
            </div>
          ) : null}
        </div>
      </div>

      {/* Main streak display */}
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-2">
            <span
              className={`text-6xl font-bold ${
                currentStreak > 0 ? 'text-white' : 'text-slate-500'
              }`}
            >
              {currentStreak}
            </span>
            <span className="text-xl text-slate-400">
              {currentStreak === 1 ? 'dia' : 'dias'}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
            <Trophy className="h-5 w-5 text-amber-400" />
            <div>
              <p className="text-xs text-slate-400">Recorde</p>
              <p className="text-lg font-semibold text-white">
                {longestStreak} {longestStreak === 1 ? 'dia' : 'dias'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-xs text-slate-400">Total ativo</p>
              <p className="text-lg font-semibold text-white">
                {totalActiveDays} {totalActiveDays === 1 ? 'dia' : 'dias'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Streak visualization (last 7 days) */}
      <div className="px-6 pb-6">
        <p className="text-xs text-slate-500 mb-2">Ultimos 7 dias</p>
        <div className="flex gap-1">
          {Array.from({ length: 7 }).map((_, i) => {
            // Calculate if this day was active (simplified - shows streak days)
            const daysAgo = 6 - i;
            const wasActive = daysAgo < currentStreak || (daysAgo === 0 && isActiveToday);

            return (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full ${
                  wasActive ? 'bg-orange-500' : 'bg-slate-700'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default StreakCard;
