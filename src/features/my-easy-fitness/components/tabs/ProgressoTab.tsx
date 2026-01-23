/**
 * ProgressoTab Component
 *
 * Full gamification tab showing streak, XP, trophies, badges, challenges, and goals.
 */

import { memo, useMemo } from 'react';
import { Trophy, Loader2 } from 'lucide-react';
import { useFitnessContext } from '../../contexts';
import {
  StreakCard,
  XpProgressBar,
  TrophyGrid,
  UniqueBadgeGrid,
  ChallengeList,
  GoalProgress,
} from '../gamification';
import { UNIQUE_BADGES } from '../../constants/uniqueBadges';

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

  // Transform unique badges data for UniqueBadgeGrid
  const uniqueBadgesForGrid = useMemo(() => {
    return UNIQUE_BADGES.map((badge) => {
      const userBadge = gamification.uniqueBadges.unlocked.find(
        (b) => b.id === badge.id
      );
      return {
        ...badge,
        isUnlocked: !!userBadge,
        unlockedAt: userBadge?.unlockedAt,
      };
    });
  }, [gamification.uniqueBadges.unlocked]);

  return (
    <div className="relative p-3 sm:p-4 space-y-3 overflow-hidden pb-24 sm:pb-4">
      {/* Compact Header */}
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="h-5 w-5 text-amber-400" />
        <h2 className="text-lg font-semibold text-white">Seu Progresso</h2>
      </div>

      {/* Top Row: Streak and XP - compact mode */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <StreakCard
          currentStreak={gamification.streak.current}
          longestStreak={gamification.streak.longest}
          isActiveToday={gamification.streak.isActiveToday}
          totalActiveDays={gamification.streak.totalActiveDays}
          compact
        />

        <XpProgressBar
          currentXP={gamification.xp.currentLevelXP}
          nextLevelXP={gamification.xp.nextLevelXP}
          level={gamification.xp.level}
          totalXP={gamification.xp.total}
          compact
        />
      </div>

      {/* Trophies Section */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700 p-3">
        <TrophyGrid
          trophies={gamification.trophies.all}
          goldCount={gamification.trophies.goldCount}
          silverCount={gamification.trophies.silverCount}
          bronzeCount={gamification.trophies.bronzeCount}
          trophyPoints={gamification.trophies.trophyPoints}
          totalTiers={gamification.trophies.totalTiers}
          unlockedTiers={gamification.trophies.unlockedTiers}
        />
      </div>

      {/* Unique Badges Section */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700 p-3">
        <UniqueBadgeGrid badges={uniqueBadgesForGrid} />
      </div>

      {/* Challenges and Goals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Challenges */}
        <div className="bg-slate-800/30 rounded-xl border border-slate-700 p-3">
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
        <div className="bg-slate-800/30 rounded-xl border border-slate-700 p-3">
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
