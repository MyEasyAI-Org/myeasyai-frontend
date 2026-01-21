/**
 * ProgressoTab Component
 *
 * Full gamification tab showing streak, XP, badges, challenges, and goals.
 */

import { memo } from 'react';
import { Trophy, Loader2 } from 'lucide-react';
import { useFitnessContext } from '../../contexts';
import { TAB_WATERMARKS } from '../../constants';
import { WatermarkIcon } from '../shared';
import {
  StreakCard,
  XpProgressBar,
  BadgeGrid,
  ChallengeList,
  GoalProgress,
} from '../gamification';
import { BADGES } from '../../constants/gamification';

export const ProgressoTab = memo(function ProgressoTab() {
  const { gamification } = useFitnessContext();

  if (gamification.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-lime-400 animate-spin" />
          <p className="text-slate-400 text-sm">Carregando seu progresso...</p>
        </div>
      </div>
    );
  }

  if (gamification.error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-center">
          <Trophy className="h-10 w-10 text-slate-600" />
          <p className="text-slate-400">Erro ao carregar dados de gamificacao</p>
          <p className="text-sm text-slate-500">{gamification.error}</p>
        </div>
      </div>
    );
  }

  // Transform badge data for BadgeGrid
  const unlockedBadgesForGrid = BADGES
    .filter((badge) => gamification.badges.unlocked.some((b) => b.id === badge.id))
    .map((badge) => {
      const userBadge = gamification.badges.unlocked.find((b) => b.id === badge.id);
      return {
        ...badge,
        unlockedAt: userBadge?.unlockedAt || '',
      };
    });

  const lockedBadgesForGrid = BADGES.filter(
    (badge) => !gamification.badges.unlocked.some((b) => b.id === badge.id)
  );

  return (
    <div className="relative p-6 space-y-6 overflow-hidden">
      {/* Tab Watermark */}
      <WatermarkIcon src={TAB_WATERMARKS.visaoGeral} size="lg" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
          <Trophy className="h-7 w-7 text-amber-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Seu Progresso</h2>
          <p className="text-sm text-slate-400">
            Acompanhe sua evolucao, conquistas e desafios
          </p>
        </div>
      </div>

      {/* Top Row: Streak and XP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StreakCard
          currentStreak={gamification.streak.current}
          longestStreak={gamification.streak.longest}
          isActiveToday={gamification.streak.isActiveToday}
          totalActiveDays={gamification.streak.totalActiveDays}
        />

        <XpProgressBar
          currentXP={gamification.xp.currentLevelXP}
          nextLevelXP={gamification.xp.nextLevelXP}
          level={gamification.xp.level}
          totalXP={gamification.xp.total}
        />
      </div>

      {/* Badges Section */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700 p-5">
        <BadgeGrid
          unlockedBadges={unlockedBadgesForGrid}
          lockedBadges={lockedBadgesForGrid}
          showLocked
        />
      </div>

      {/* Challenges and Goals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Challenges */}
        <div className="bg-slate-800/30 rounded-xl border border-slate-700 p-5">
          <ChallengeList
            dailyChallenges={gamification.challenges.daily}
            weeklyChallenges={gamification.challenges.weekly}
            dailyProgress={gamification.challenges.dailyProgress}
            weeklyProgress={gamification.challenges.weeklyProgress}
            onCompleteDailyChallenge={gamification.completeDailyChallenge}
            onCompleteWeeklyChallenge={gamification.completeWeeklyChallenge}
          />
        </div>

        {/* Goals */}
        <div className="bg-slate-800/30 rounded-xl border border-slate-700 p-5">
          <GoalProgress
            activeGoals={gamification.goals.active}
            completedGoals={gamification.goals.completed}
            overallProgress={gamification.goals.overallProgress}
          />
        </div>
      </div>

      {/* Saving indicator */}
      {gamification.isSaving && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Salvando...
        </div>
      )}
    </div>
  );
});

export default ProgressoTab;
