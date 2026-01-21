/**
 * useBadges Hook
 *
 * Manages badge detection, unlocking, and display.
 * Checks for badge unlocks based on:
 * - Streak milestones (7, 30, 100, 365 days)
 * - Total workouts (10, 50, 100, 500)
 * - Consistency (perfect weeks, perfect months)
 * - Special achievements (first workout, profile complete, etc.)
 */

import { useCallback, useMemo } from 'react';
import type { Badge, UserBadge, GamificationState } from '../types/gamification';
import { BADGES, BADGES_MAP } from '../constants/gamification';

interface UseBadgesProps {
  state: GamificationState;
  onBadgeUnlock: (badge: UserBadge) => void;
}

interface UseBadgesReturn {
  // Badge collections
  unlockedBadges: Array<Badge & { unlockedAt: string }>;
  lockedBadges: Badge[];
  recentUnlocks: Array<Badge & { unlockedAt: string }>;

  // Stats
  totalBadges: number;
  unlockedCount: number;
  progressPercentage: number;

  // Actions
  checkAndUnlockBadges: () => UserBadge[];
  getBadgeById: (id: string) => Badge | undefined;
  isBadgeUnlocked: (badgeId: string) => boolean;
  markBadgeAsNotified: (badgeId: string) => void;
}

/**
 * Get all badges that should be unlocked based on current state
 */
function getEligibleBadges(state: GamificationState): string[] {
  const eligible: string[] = [];

  // Check streak badges
  if (state.streak.currentStreak >= 7) eligible.push('streak_7');
  if (state.streak.currentStreak >= 30) eligible.push('streak_30');
  if (state.streak.currentStreak >= 100) eligible.push('streak_100');
  if (state.streak.currentStreak >= 365) eligible.push('streak_365');

  // Check volume badges (total workouts)
  if (state.totalWorkoutsCompleted >= 10) eligible.push('workouts_10');
  if (state.totalWorkoutsCompleted >= 50) eligible.push('workouts_50');
  if (state.totalWorkoutsCompleted >= 100) eligible.push('workouts_100');
  if (state.totalWorkoutsCompleted >= 500) eligible.push('workouts_500');

  // Check consistency badges (perfect weeks)
  if (state.perfectWeeks >= 1) eligible.push('perfect_week');
  if (state.perfectWeeks >= 5) eligible.push('perfect_week_5');

  // Check consistency badges (perfect months)
  if (state.perfectMonths >= 1) eligible.push('perfect_month');
  if (state.perfectMonths >= 3) eligible.push('perfect_month_3');

  // First workout badge
  if (state.totalWorkoutsCompleted >= 1) eligible.push('first_workout');

  return eligible;
}

export function useBadges({ state, onBadgeUnlock }: UseBadgesProps): UseBadgesReturn {
  const unlockedBadgeIds = useMemo(
    () => new Set(state.badges.map((b) => b.badgeId)),
    [state.badges]
  );

  // Unlocked badges with full badge data
  const unlockedBadges = useMemo(() => {
    return state.badges
      .map((userBadge) => {
        const badge = BADGES_MAP.get(userBadge.badgeId);
        if (!badge) return null;
        return { ...badge, unlockedAt: userBadge.unlockedAt };
      })
      .filter((b): b is Badge & { unlockedAt: string } => b !== null)
      .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime());
  }, [state.badges]);

  // Locked badges
  const lockedBadges = useMemo(() => {
    return BADGES.filter((badge) => !unlockedBadgeIds.has(badge.id));
  }, [unlockedBadgeIds]);

  // Recent unlocks (last 7 days)
  const recentUnlocks = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return unlockedBadges.filter(
      (badge) => new Date(badge.unlockedAt) >= sevenDaysAgo
    );
  }, [unlockedBadges]);

  // Stats
  const totalBadges = BADGES.length;
  const unlockedCount = state.badges.length;
  const progressPercentage = Math.round((unlockedCount / totalBadges) * 100);

  /**
   * Check for any new badges that should be unlocked
   */
  const checkAndUnlockBadges = useCallback((): UserBadge[] => {
    const eligibleBadgeIds = getEligibleBadges(state);
    const newUnlocks: UserBadge[] = [];

    for (const badgeId of eligibleBadgeIds) {
      if (!unlockedBadgeIds.has(badgeId)) {
        const newBadge: UserBadge = {
          badgeId,
          unlockedAt: new Date().toISOString(),
          notified: false,
        };
        newUnlocks.push(newBadge);
        onBadgeUnlock(newBadge);
      }
    }

    return newUnlocks;
  }, [state, unlockedBadgeIds, onBadgeUnlock]);

  /**
   * Get badge by ID
   */
  const getBadgeById = useCallback((id: string): Badge | undefined => {
    return BADGES_MAP.get(id);
  }, []);

  /**
   * Check if a specific badge is unlocked
   */
  const isBadgeUnlocked = useCallback(
    (badgeId: string): boolean => {
      return unlockedBadgeIds.has(badgeId);
    },
    [unlockedBadgeIds]
  );

  /**
   * Mark a badge as notified (after showing notification to user)
   */
  const markBadgeAsNotified = useCallback(
    (badgeId: string) => {
      // This would typically update the state through the parent
      // For now, the parent component should handle this
      console.log(`Badge ${badgeId} marked as notified`);
    },
    []
  );

  return {
    unlockedBadges,
    lockedBadges,
    recentUnlocks,
    totalBadges,
    unlockedCount,
    progressPercentage,
    checkAndUnlockBadges,
    getBadgeById,
    isBadgeUnlocked,
    markBadgeAsNotified,
  };
}

/**
 * Utility function to get the next milestone for a badge category
 */
export function getNextMilestone(
  category: 'streak' | 'volume' | 'consistency',
  currentValue: number
): { target: number; badgeId: string } | null {
  const milestones: Record<string, { target: number; badgeId: string }[]> = {
    streak: [
      { target: 7, badgeId: 'streak_7' },
      { target: 30, badgeId: 'streak_30' },
      { target: 100, badgeId: 'streak_100' },
      { target: 365, badgeId: 'streak_365' },
    ],
    volume: [
      { target: 10, badgeId: 'workouts_10' },
      { target: 50, badgeId: 'workouts_50' },
      { target: 100, badgeId: 'workouts_100' },
      { target: 500, badgeId: 'workouts_500' },
    ],
    consistency: [
      { target: 1, badgeId: 'perfect_week' },
      { target: 5, badgeId: 'perfect_week_5' },
    ],
  };

  const categoryMilestones = milestones[category];
  if (!categoryMilestones) return null;

  for (const milestone of categoryMilestones) {
    if (currentValue < milestone.target) {
      return milestone;
    }
  }

  return null; // All milestones achieved
}
