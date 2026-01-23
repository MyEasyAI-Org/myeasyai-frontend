/**
 * useTrophies Hook
 *
 * Manages trophy progression with tier system (Bronze → Silver → Gold).
 * Each trophy has 3 tiers that are progressively unlocked based on metrics.
 */

import { useCallback, useMemo } from 'react';
import type { GamificationState } from '../types/gamification';
import type {
  Trophy,
  UserTrophy,
  TrophyTier,
  TrophyMetric,
} from '../types/trophies';
import {
  getNextTier,
  getTierIndex,
  createDefaultUserTrophy,
} from '../types/trophies';
import { TROPHIES, TROPHIES_MAP } from '../constants/trophies';

interface UseTrophiesProps {
  state: GamificationState;
  onTrophyTierUnlock: (trophy: UserTrophy, xpReward: number) => void;
}

interface TrophyWithProgress extends Trophy {
  userProgress: UserTrophy;
  currentTierConfig: Trophy['tiers'][number] | null;
  nextTierConfig: Trophy['tiers'][number] | null;
  progressToNextTier: number; // 0-100 percentage
  isMaxed: boolean; // Has gold tier
}

interface UseTrophiesReturn {
  // Trophy collections
  trophiesWithProgress: TrophyWithProgress[];
  maxedTrophies: TrophyWithProgress[];
  inProgressTrophies: TrophyWithProgress[];

  // Stats
  totalTrophies: number;
  totalTiers: number; // 3 per trophy
  unlockedTiers: number;
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
  trophyPoints: number; // Bronze=1, Silver=3, Gold=10

  // Actions
  checkAndUnlockTrophyTiers: () => UserTrophy[];
  getTrophyById: (id: string) => Trophy | undefined;
  getUserTrophy: (trophyId: string) => UserTrophy | undefined;
  getMetricValue: (metric: TrophyMetric) => number;
}

/**
 * Get the metric value from state for a given trophy metric type
 */
function getMetricValueFromState(
  state: GamificationState,
  metric: TrophyMetric
): number {
  switch (metric) {
    case 'streak_days':
      return state.streak.currentStreak;
    case 'total_workouts':
      return state.totalWorkoutsCompleted;
    case 'perfect_weeks':
      return state.perfectWeeks;
    case 'perfect_months':
      return state.perfectMonths;
    case 'workout_modalities':
      return state.workoutModalities?.length || 0;
    case 'early_workouts':
      return state.earlyWorkouts || 0;
    case 'night_workouts':
      return state.nightWorkouts || 0;
    case 'diet_days':
      return state.dietDaysFollowed || 0;
    default:
      return 0;
  }
}

/**
 * Calculate which tier should be unlocked based on current progress
 */
function calculateCurrentTier(
  trophy: Trophy,
  progress: number
): TrophyTier {
  // Check from highest tier down
  if (progress >= trophy.tiers[2].requirement) return 'gold';
  if (progress >= trophy.tiers[1].requirement) return 'silver';
  if (progress >= trophy.tiers[0].requirement) return 'bronze';
  return 'none';
}

export function useTrophies({
  state,
  onTrophyTierUnlock,
}: UseTrophiesProps): UseTrophiesReturn {
  // Create a map of user trophies for quick lookup
  const userTrophiesMap = useMemo(() => {
    const map = new Map<string, UserTrophy>();
    for (const ut of state.trophies || []) {
      map.set(ut.trophyId, ut);
    }
    return map;
  }, [state.trophies]);

  /**
   * Get metric value from state
   */
  const getMetricValue = useCallback(
    (metric: TrophyMetric): number => {
      return getMetricValueFromState(state, metric);
    },
    [state]
  );

  /**
   * Get user trophy by ID, or create default if not exists
   */
  const getUserTrophy = useCallback(
    (trophyId: string): UserTrophy | undefined => {
      return userTrophiesMap.get(trophyId);
    },
    [userTrophiesMap]
  );

  /**
   * Get trophy definition by ID
   */
  const getTrophyById = useCallback((id: string): Trophy | undefined => {
    return TROPHIES_MAP.get(id);
  }, []);

  /**
   * Trophies with full progress information
   */
  const trophiesWithProgress = useMemo((): TrophyWithProgress[] => {
    return TROPHIES.map((trophy) => {
      const userProgress =
        userTrophiesMap.get(trophy.id) || createDefaultUserTrophy(trophy.id);
      const metricValue = getMetricValueFromState(state, trophy.metric);

      // Get current tier config
      const currentTierIndex = getTierIndex(userProgress.currentTier);
      const currentTierConfig =
        currentTierIndex > 0 ? trophy.tiers[currentTierIndex - 1] : null;

      // Get next tier config
      const nextTier = getNextTier(userProgress.currentTier);
      const nextTierIndex = nextTier ? getTierIndex(nextTier) : -1;
      const nextTierConfig =
        nextTierIndex > 0 ? trophy.tiers[nextTierIndex - 1] : null;

      // Calculate progress to next tier
      let progressToNextTier = 0;
      if (nextTierConfig) {
        const previousReq =
          currentTierConfig?.requirement || 0;
        const nextReq = nextTierConfig.requirement;
        const progressInTier = metricValue - previousReq;
        const tierRange = nextReq - previousReq;
        progressToNextTier = Math.min(
          100,
          Math.max(0, Math.round((progressInTier / tierRange) * 100))
        );
      }

      const isMaxed = userProgress.currentTier === 'gold';

      return {
        ...trophy,
        userProgress: { ...userProgress, progress: metricValue },
        currentTierConfig,
        nextTierConfig,
        progressToNextTier,
        isMaxed,
      };
    });
  }, [state, userTrophiesMap]);

  // Filtered collections
  const maxedTrophies = useMemo(
    () => trophiesWithProgress.filter((t) => t.isMaxed),
    [trophiesWithProgress]
  );

  const inProgressTrophies = useMemo(
    () => trophiesWithProgress.filter((t) => !t.isMaxed),
    [trophiesWithProgress]
  );

  // Stats
  const totalTrophies = TROPHIES.length;
  const totalTiers = totalTrophies * 3;

  const { unlockedTiers, goldCount, silverCount, bronzeCount } = useMemo(() => {
    let unlocked = 0;
    let gold = 0;
    let silver = 0;
    let bronze = 0;

    for (const trophy of trophiesWithProgress) {
      const tier = trophy.userProgress.currentTier;
      if (tier === 'gold') {
        gold++;
        unlocked += 3;
      } else if (tier === 'silver') {
        silver++;
        unlocked += 2;
      } else if (tier === 'bronze') {
        bronze++;
        unlocked += 1;
      }
    }

    return { unlockedTiers: unlocked, goldCount: gold, silverCount: silver, bronzeCount: bronze };
  }, [trophiesWithProgress]);

  // Trophy points: Bronze=1, Silver=3, Gold=10
  const trophyPoints = bronzeCount * 1 + silverCount * 3 + goldCount * 10;

  /**
   * Check for trophy tier unlocks and return newly unlocked trophies
   */
  const checkAndUnlockTrophyTiers = useCallback((): UserTrophy[] => {
    const newUnlocks: UserTrophy[] = [];

    for (const trophy of TROPHIES) {
      const metricValue = getMetricValueFromState(state, trophy.metric);
      const shouldBeTier = calculateCurrentTier(trophy, metricValue);
      const userTrophy = userTrophiesMap.get(trophy.id);
      const currentTier = userTrophy?.currentTier || 'none';

      // Check if we should upgrade
      if (getTierIndex(shouldBeTier) > getTierIndex(currentTier)) {
        const now = new Date().toISOString();

        // Create updated user trophy
        const updatedTrophy: UserTrophy = {
          trophyId: trophy.id,
          currentTier: shouldBeTier,
          progress: metricValue,
          tierUnlocks: {
            ...(userTrophy?.tierUnlocks || {}),
          },
          notified: false,
        };

        // Mark which tiers were unlocked
        const currentIndex = getTierIndex(currentTier);
        const newIndex = getTierIndex(shouldBeTier);

        // Calculate total XP reward for all new tiers
        let totalXpReward = 0;

        for (let i = currentIndex; i < newIndex; i++) {
          const tierName = ['bronze', 'silver', 'gold'][i] as Exclude<TrophyTier, 'none'>;
          updatedTrophy.tierUnlocks[tierName] = now;
          totalXpReward += trophy.tiers[i].xpReward;
        }

        newUnlocks.push(updatedTrophy);
        onTrophyTierUnlock(updatedTrophy, totalXpReward);
      }
    }

    return newUnlocks;
  }, [state, userTrophiesMap, onTrophyTierUnlock]);

  return {
    trophiesWithProgress,
    maxedTrophies,
    inProgressTrophies,
    totalTrophies,
    totalTiers,
    unlockedTiers,
    goldCount,
    silverCount,
    bronzeCount,
    trophyPoints,
    checkAndUnlockTrophyTiers,
    getTrophyById,
    getUserTrophy,
    getMetricValue,
  };
}

/**
 * Utility to get the trophy closest to next tier unlock
 */
export function getClosestTrophyToUnlock(
  trophiesWithProgress: TrophyWithProgress[]
): TrophyWithProgress | null {
  const inProgress = trophiesWithProgress.filter(
    (t) => !t.isMaxed && t.progressToNextTier < 100
  );

  if (inProgress.length === 0) return null;

  // Sort by progress percentage descending
  return inProgress.sort((a, b) => b.progressToNextTier - a.progressToNextTier)[0];
}
