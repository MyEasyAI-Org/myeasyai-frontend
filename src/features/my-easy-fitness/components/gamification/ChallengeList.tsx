/**
 * ChallengeList Component
 *
 * Displays a list of daily and weekly challenges.
 */

import { memo } from 'react';
import { Target, Calendar, Sun, CalendarDays } from 'lucide-react';
import type { Challenge } from '../../types/gamification';
import { ChallengeCard } from './ChallengeCard';

interface ChallengeListProps {
  dailyChallenges: Challenge[];
  weeklyChallenges: Challenge[];
  dailyProgress: { completed: number; total: number };
  weeklyProgress: { completed: number; total: number };
  onCompleteDailyChallenge?: (challengeId: string) => void;
  onCompleteWeeklyChallenge?: (challengeId: string) => void;
  compact?: boolean;
}

export const ChallengeList = memo(function ChallengeList({
  dailyChallenges,
  weeklyChallenges,
  dailyProgress,
  weeklyProgress,
  onCompleteDailyChallenge,
  onCompleteWeeklyChallenge,
  compact = false,
}: ChallengeListProps) {
  if (compact) {
    const allChallenges = [...dailyChallenges, ...weeklyChallenges].filter(
      (c) => c.status === 'active'
    );

    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-lime-400" />
            <span className="font-medium text-white">Desafios</span>
          </div>
          <span className="text-sm text-slate-400">
            {dailyProgress.completed + weeklyProgress.completed}/
            {dailyProgress.total + weeklyProgress.total}
          </span>
        </div>

        {allChallenges.length > 0 ? (
          <div className="space-y-2">
            {allChallenges.slice(0, 3).map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onComplete={
                  challenge.type === 'daily'
                    ? () => onCompleteDailyChallenge?.(challenge.id)
                    : () => onCompleteWeeklyChallenge?.(challenge.id)
                }
                compact
              />
            ))}
            {allChallenges.length > 3 && (
              <p className="text-xs text-slate-500 text-center pt-2">
                +{allChallenges.length - 3} desafio(s) a mais
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">
            Todos os desafios concluidos!
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-lime-500/20">
          <Target className="h-6 w-6 text-lime-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Desafios</h3>
          <p className="text-sm text-slate-400">Complete desafios para ganhar XP extra</p>
        </div>
      </div>

      {/* Daily challenges */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-blue-400" />
            <h4 className="font-medium text-white">Desafios Diarios</h4>
          </div>
          <span className="text-sm text-slate-400">
            {dailyProgress.completed}/{dailyProgress.total} completo
            {dailyProgress.completed !== 1 ? 's' : ''}
          </span>
        </div>

        {dailyChallenges.length > 0 ? (
          <div className="space-y-3">
            {dailyChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onComplete={() => onCompleteDailyChallenge?.(challenge.id)}
              />
            ))}
          </div>
        ) : (
          <div className="p-6 text-center bg-slate-800/30 rounded-xl border border-slate-700">
            <Calendar className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500">Nenhum desafio diario disponivel</p>
          </div>
        )}
      </div>

      {/* Weekly challenges */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-purple-400" />
            <h4 className="font-medium text-white">Desafios Semanais</h4>
          </div>
          <span className="text-sm text-slate-400">
            {weeklyProgress.completed}/{weeklyProgress.total} completo
            {weeklyProgress.completed !== 1 ? 's' : ''}
          </span>
        </div>

        {weeklyChallenges.length > 0 ? (
          <div className="space-y-3">
            {weeklyChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onComplete={() => onCompleteWeeklyChallenge?.(challenge.id)}
              />
            ))}
          </div>
        ) : (
          <div className="p-6 text-center bg-slate-800/30 rounded-xl border border-slate-700">
            <CalendarDays className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500">Nenhum desafio semanal disponivel</p>
          </div>
        )}
      </div>
    </div>
  );
});

export default ChallengeList;
