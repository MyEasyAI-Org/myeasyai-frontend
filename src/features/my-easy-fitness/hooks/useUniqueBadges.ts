/**
 * useUniqueBadges Hook
 *
 * Manages unique badges - special one-time achievements without progression.
 * Handles milestone, special, and hidden badges.
 */

import { useCallback, useMemo } from 'react';
import type { GamificationState } from '../types/gamification';
import type { UserTrophy, TrophyTier } from '../types/trophies';
import {
  UNIQUE_BADGES,
  UNIQUE_BADGES_MAP,
  getHiddenUniqueBadges,
  type UniqueBadge,
  type UserUniqueBadge,
} from '../constants/uniqueBadges';
import { TROPHIES } from '../constants/trophies';

interface UseUniqueBadgesProps {
  state: GamificationState;
  onBadgeUnlock: (badge: UserUniqueBadge, xpReward: number) => void;
}

interface UniqueBadgeWithStatus extends UniqueBadge {
  isUnlocked: boolean;
  unlockedAt?: string;
}

interface UseUniqueBadgesReturn {
  // Badge collections
  unlockedBadges: UniqueBadgeWithStatus[];
  lockedBadges: UniqueBadge[];
  visibleBadges: UniqueBadgeWithStatus[]; // Includes locked non-hidden
  hiddenBadges: UniqueBadgeWithStatus[]; // Only hidden ones

  // Stats
  totalBadges: number;
  unlockedCount: number;
  progressPercentage: number;

  // Actions
  checkAndUnlockBadges: () => UserUniqueBadge[];
  getBadgeById: (id: string) => UniqueBadge | undefined;
  isBadgeUnlocked: (badgeId: string) => boolean;
}

/**
 * Check conditions for unique badge eligibility
 */
function checkBadgeEligibility(
  badgeId: string,
  state: GamificationState,
  allTrophiesGold: boolean
): boolean {
  switch (badgeId) {
    // Milestone badges
    case 'first_workout':
      return state.totalWorkoutsCompleted >= 1;

    case 'profile_complete':
      // This should be triggered by profile completion logic
      // For now, we'll assume it's tracked elsewhere
      return false;

    case 'legendary_streak':
      return state.streak.currentStreak >= 365;

    case 'supreme_master':
      return allTrophiesGold;

    // Special badges
    case 'comeback':
      // This needs to be tracked when user returns after 30 days
      // Should be triggered elsewhere
      return false;

    case 'beat_record':
      // Triggered when current streak > longest streak
      return (
        state.streak.currentStreak > 0 &&
        state.streak.currentStreak > state.streak.longestStreak
      );

    case 'anniversary':
      // This should be checked based on account creation date
      // Would need to be tracked elsewhere
      return false;

    // Hidden badges
    case 'seven_days':
      // Trained all 7 days of the week
      // This would need weekly tracking - for now using streak >= 7
      return state.streak.currentStreak >= 7;

    case 'combo_perfect':
      // 3 consecutive perfect weeks
      return state.consecutivePerfectWeeks >= 3;

    default:
      return false;
  }
}

export function useUniqueBadges({
  state,
  onBadgeUnlock,
}: UseUniqueBadgesProps): UseUniqueBadgesReturn {
  // Create a set of unlocked badge IDs
  const unlockedBadgeIds = useMemo(
    () => new Set((state.uniqueBadges || []).map((b) => b.badgeId)),
    [state.uniqueBadges]
  );

  // Check if all trophies are at gold tier
  const allTrophiesGold = useMemo(() => {
    if (!state.trophies || state.trophies.length < TROPHIES.length) {
      return false;
    }
    return state.trophies.every((t) => t.currentTier === 'gold');
  }, [state.trophies]);

  /**
   * Get badge by ID
   */
  const getBadgeById = useCallback(
    (id: string): UniqueBadge | undefined => {
      return UNIQUE_BADGES_MAP.get(id);
    },
    []
  );

  /**
   * Check if a badge is unlocked
   */
  const isBadgeUnlocked = useCallback(
    (badgeId: string): boolean => {
      return unlockedBadgeIds.has(badgeId);
    },
    [unlockedBadgeIds]
  );

  /**
   * Badges with unlock status
   */
  const badgesWithStatus = useMemo((): UniqueBadgeWithStatus[] => {
    return UNIQUE_BADGES.map((badge) => {
      const userBadge = (state.uniqueBadges || []).find(
        (ub) => ub.badgeId === badge.id
      );
      return {
        ...badge,
        isUnlocked: !!userBadge,
        unlockedAt: userBadge?.unlockedAt,
      };
    });
  }, [state.uniqueBadges]);

  // Filtered collections
  const unlockedBadges = useMemo(
    () =>
      badgesWithStatus
        .filter((b) => b.isUnlocked)
        .sort(
          (a, b) =>
            new Date(b.unlockedAt || 0).getTime() -
            new Date(a.unlockedAt || 0).getTime()
        ),
    [badgesWithStatus]
  );

  const lockedBadges = useMemo(
    () => UNIQUE_BADGES.filter((b) => !unlockedBadgeIds.has(b.id)),
    [unlockedBadgeIds]
  );

  // Visible badges: all non-hidden + unlocked hidden
  const visibleBadges = useMemo(
    () =>
      badgesWithStatus.filter(
        (b) => b.category !== 'hidden' || b.isUnlocked
      ),
    [badgesWithStatus]
  );

  // Hidden badges only
  const hiddenBadges = useMemo(
    () => badgesWithStatus.filter((b) => b.category === 'hidden'),
    [badgesWithStatus]
  );

  // Stats
  const totalBadges = UNIQUE_BADGES.length;
  const unlockedCount = unlockedBadges.length;
  const progressPercentage = Math.round((unlockedCount / totalBadges) * 100);

  /**
   * Check for badge unlocks
   */
  const checkAndUnlockBadges = useCallback((): UserUniqueBadge[] => {
    const newUnlocks: UserUniqueBadge[] = [];

    for (const badge of UNIQUE_BADGES) {
      if (unlockedBadgeIds.has(badge.id)) continue;

      if (checkBadgeEligibility(badge.id, state, allTrophiesGold)) {
        const newBadge: UserUniqueBadge = {
          badgeId: badge.id,
          unlockedAt: new Date().toISOString(),
          notified: false,
        };
        newUnlocks.push(newBadge);
        onBadgeUnlock(newBadge, badge.xpReward);
      }
    }

    return newUnlocks;
  }, [state, unlockedBadgeIds, allTrophiesGold, onBadgeUnlock]);

  return {
    unlockedBadges,
    lockedBadges,
    visibleBadges,
    hiddenBadges,
    totalBadges,
    unlockedCount,
    progressPercentage,
    checkAndUnlockBadges,
    getBadgeById,
    isBadgeUnlocked,
  };
}

/**
 * Special unlock functions for badges that need external triggers
 */
export function shouldUnlockComebackBadge(
  lastActivityDate: string | null,
  today: Date
): boolean {
  if (!lastActivityDate) return false;
  const lastDate = new Date(lastActivityDate);
  const diffDays = Math.floor(
    (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diffDays >= 30;
}

export function shouldUnlockAnniversaryBadge(
  accountCreatedAt: string,
  today: Date
): boolean {
  const createdDate = new Date(accountCreatedAt);
  const diffYears =
    (today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  return diffYears >= 1;
}
