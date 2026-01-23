/**
 * Migration Utility: Badges to Trophies
 *
 * Converts old badge data to the new trophy system with tier progression.
 * This migration should run once when loading user data.
 */

import type { UserBadge, GamificationState } from '../types/gamification';
import type { UserTrophy, TrophyTier } from '../types/trophies';
import type { UserUniqueBadge } from '../constants/uniqueBadges';
import { TROPHIES } from '../constants/trophies';

/**
 * Mapping of old badge IDs to new trophy IDs and tiers
 */
const BADGE_TO_TROPHY_MAP: Record<
  string,
  { trophyId: string; tier: Exclude<TrophyTier, 'none'> }
> = {
  // Streak badges -> streak_fire trophy
  streak_7: { trophyId: 'streak_fire', tier: 'bronze' },
  streak_30: { trophyId: 'streak_fire', tier: 'silver' },
  streak_100: { trophyId: 'streak_fire', tier: 'gold' },

  // Volume badges -> volume_marathon trophy
  // Note: Old thresholds were 10, 50, 100, 500
  // New thresholds are 25, 100, 500
  // We'll map 10 and 50 to bronze, 100 to silver, 500 to gold
  workouts_10: { trophyId: 'volume_marathon', tier: 'bronze' },
  workouts_50: { trophyId: 'volume_marathon', tier: 'bronze' },
  workouts_100: { trophyId: 'volume_marathon', tier: 'silver' },
  workouts_500: { trophyId: 'volume_marathon', tier: 'gold' },

  // Consistency badges -> consistency_week and consistency_month trophies
  perfect_week: { trophyId: 'consistency_week', tier: 'bronze' },
  perfect_week_5: { trophyId: 'consistency_week', tier: 'silver' },
  perfect_month: { trophyId: 'consistency_month', tier: 'bronze' },
  perfect_month_3: { trophyId: 'consistency_month', tier: 'silver' },
};

/**
 * Badge IDs that should become unique badges
 */
const UNIQUE_BADGE_IDS = [
  'first_workout',
  'profile_complete',
  'early_bird',
  'night_owl',
  'comeback',
];

/**
 * Check if migration is needed
 */
export function needsMigration(state: GamificationState): boolean {
  // Migration is needed if we have old badges but no trophies
  const hasOldBadges = state.badges && state.badges.length > 0;
  const hasTrophies = state.trophies && state.trophies.length > 0;

  // Also check if old badges have IDs that should be migrated
  const hasMigratableBadges = state.badges?.some(
    (b) => BADGE_TO_TROPHY_MAP[b.badgeId] || UNIQUE_BADGE_IDS.includes(b.badgeId)
  );

  return hasOldBadges && !hasTrophies && !!hasMigratableBadges;
}

/**
 * Migrate old badges to new trophy system
 */
export function migrateBadgesToTrophies(state: GamificationState): {
  trophies: UserTrophy[];
  uniqueBadges: UserUniqueBadge[];
  migratedCount: number;
} {
  const trophiesMap = new Map<string, UserTrophy>();
  const uniqueBadges: UserUniqueBadge[] = [];
  let migratedCount = 0;

  // Initialize all trophies with default state
  for (const trophy of TROPHIES) {
    trophiesMap.set(trophy.id, {
      trophyId: trophy.id,
      currentTier: 'none',
      progress: 0,
      tierUnlocks: {},
      notified: true, // Mark as notified since these are migrated
    });
  }

  // Process each old badge
  for (const oldBadge of state.badges || []) {
    // Check if it's a trophy badge
    const trophyMapping = BADGE_TO_TROPHY_MAP[oldBadge.badgeId];
    if (trophyMapping) {
      const { trophyId, tier } = trophyMapping;
      const trophy = trophiesMap.get(trophyId);

      if (trophy) {
        // Update trophy tier if this tier is higher
        const tierOrder = { none: 0, bronze: 1, silver: 2, gold: 3 };
        if (tierOrder[tier] > tierOrder[trophy.currentTier]) {
          trophy.currentTier = tier;
        }

        // Add unlock timestamp for this tier
        trophy.tierUnlocks[tier] = oldBadge.unlockedAt;

        // Also add previous tiers if not already set
        if (tier === 'silver' && !trophy.tierUnlocks.bronze) {
          trophy.tierUnlocks.bronze = oldBadge.unlockedAt;
        }
        if (tier === 'gold') {
          if (!trophy.tierUnlocks.bronze) {
            trophy.tierUnlocks.bronze = oldBadge.unlockedAt;
          }
          if (!trophy.tierUnlocks.silver) {
            trophy.tierUnlocks.silver = oldBadge.unlockedAt;
          }
        }

        migratedCount++;
      }
    }

    // Check if it's a unique badge
    if (UNIQUE_BADGE_IDS.includes(oldBadge.badgeId)) {
      // Map old IDs to new IDs if needed
      let newBadgeId = oldBadge.badgeId;

      // Special mappings for renamed badges
      if (oldBadge.badgeId === 'early_bird') {
        // This was a unique badge, but now it's part of variety_early trophy
        // We'll create a unique badge entry for backward compatibility
        newBadgeId = 'first_workout'; // Keep as unique badge
      }

      uniqueBadges.push({
        badgeId: newBadgeId,
        unlockedAt: oldBadge.unlockedAt,
        notified: true, // Mark as notified since these are migrated
      });
      migratedCount++;
    }
  }

  // Set progress values based on state metrics
  const streakTrophy = trophiesMap.get('streak_fire');
  if (streakTrophy) {
    streakTrophy.progress = state.streak.currentStreak;
  }

  const volumeTrophy = trophiesMap.get('volume_marathon');
  if (volumeTrophy) {
    volumeTrophy.progress = state.totalWorkoutsCompleted;
  }

  const weekTrophy = trophiesMap.get('consistency_week');
  if (weekTrophy) {
    weekTrophy.progress = state.perfectWeeks;
  }

  const monthTrophy = trophiesMap.get('consistency_month');
  if (monthTrophy) {
    monthTrophy.progress = state.perfectMonths;
  }

  // Convert map to array
  const trophies = Array.from(trophiesMap.values());

  return {
    trophies,
    uniqueBadges,
    migratedCount,
  };
}

/**
 * Apply migration to state
 */
export function applyMigration(state: GamificationState): GamificationState {
  if (!needsMigration(state)) {
    return state;
  }

  const { trophies, uniqueBadges, migratedCount } = migrateBadgesToTrophies(state);

  console.log(`[Migration] Migrated ${migratedCount} badges to new trophy system`);

  return {
    ...state,
    trophies,
    uniqueBadges,
    // Keep old badges for reference but they won't be displayed
    badges: state.badges,
  };
}

/**
 * Initialize trophies for a new user
 */
export function initializeTrophies(state: GamificationState): GamificationState {
  // If trophies already exist, don't initialize
  if (state.trophies && state.trophies.length > 0) {
    return state;
  }

  const trophies: UserTrophy[] = TROPHIES.map((trophy) => ({
    trophyId: trophy.id,
    currentTier: 'none',
    progress: 0,
    tierUnlocks: {},
    notified: true,
  }));

  return {
    ...state,
    trophies,
    uniqueBadges: state.uniqueBadges || [],
  };
}
