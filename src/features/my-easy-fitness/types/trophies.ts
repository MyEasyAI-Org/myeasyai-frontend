/**
 * Trophy Types
 *
 * Type definitions for the trophy system with tier progression (Bronze → Silver → Gold).
 */

// =============================================================================
// Trophy Tier Types
// =============================================================================

/**
 * Trophy tier levels
 */
export type TrophyTier = 'none' | 'bronze' | 'silver' | 'gold';

/**
 * Trophy categories
 */
export type TrophyCategory = 'streak' | 'volume' | 'consistency' | 'variety';

/**
 * Trophy metric types for tracking progress
 */
export type TrophyMetric =
  | 'streak_days' // Current consecutive days
  | 'total_workouts' // Total workouts completed
  | 'perfect_weeks' // Number of perfect weeks
  | 'perfect_months' // Number of perfect months
  | 'workout_modalities' // Different workout types tried
  | 'early_workouts' // Workouts before 7am
  | 'night_workouts' // Workouts after 9pm
  | 'diet_days'; // Days following diet

// =============================================================================
// Trophy Configuration Types
// =============================================================================

/**
 * Configuration for a single trophy tier
 */
export interface TrophyTierConfig {
  tier: Exclude<TrophyTier, 'none'>;
  name: string; // e.g., "Maratonista Bronze"
  description: string; // e.g., "Complete 25 treinos"
  requirement: number; // e.g., 25
  xpReward: number; // XP awarded when unlocking this tier
}

/**
 * Trophy definition (static configuration)
 */
export interface Trophy {
  id: string;
  name: string; // e.g., "Maratonista"
  category: TrophyCategory;
  icon: string; // Icon name from lucide-react
  metric: TrophyMetric;
  tiers: [TrophyTierConfig, TrophyTierConfig, TrophyTierConfig]; // Always 3 tiers
}

// =============================================================================
// User Trophy State Types
// =============================================================================

/**
 * User's trophy progress and unlocks
 */
export interface UserTrophy {
  trophyId: string;
  currentTier: TrophyTier;
  progress: number; // Current progress value for the metric
  tierUnlocks: {
    bronze?: string; // ISO timestamp when bronze was unlocked
    silver?: string; // ISO timestamp when silver was unlocked
    gold?: string; // ISO timestamp when gold was unlocked
  };
  notified: boolean; // Whether user has been notified of latest unlock
}

// =============================================================================
// Trophy Tier Visual Configuration
// =============================================================================

/**
 * Visual styling for trophy tiers
 */
export const TIER_COLORS = {
  none: {
    bg: 'bg-slate-700/30',
    border: 'border-slate-600',
    icon: 'text-slate-500',
    glow: '',
    label: 'Bloqueado',
  },
  bronze: {
    bg: 'bg-amber-900/30',
    border: 'border-amber-700',
    icon: 'text-amber-600',
    glow: 'shadow-amber-900/30',
    label: 'Bronze',
  },
  silver: {
    bg: 'bg-slate-300/20',
    border: 'border-slate-400',
    icon: 'text-slate-300',
    glow: 'shadow-slate-400/30',
    label: 'Prata',
  },
  gold: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500',
    icon: 'text-yellow-400',
    glow: 'shadow-yellow-500/40',
    label: 'Ouro',
  },
} as const;

/**
 * Order of tiers for progression
 */
export const TIER_ORDER: TrophyTier[] = ['none', 'bronze', 'silver', 'gold'];

/**
 * Get the next tier after the current one
 */
export function getNextTier(currentTier: TrophyTier): TrophyTier | null {
  const currentIndex = TIER_ORDER.indexOf(currentTier);
  if (currentIndex === -1 || currentIndex >= TIER_ORDER.length - 1) {
    return null;
  }
  return TIER_ORDER[currentIndex + 1];
}

/**
 * Get tier index for comparison (none=0, bronze=1, silver=2, gold=3)
 */
export function getTierIndex(tier: TrophyTier): number {
  return TIER_ORDER.indexOf(tier);
}

/**
 * Compare two tiers (returns negative if a < b, 0 if equal, positive if a > b)
 */
export function compareTiers(a: TrophyTier, b: TrophyTier): number {
  return getTierIndex(a) - getTierIndex(b);
}

// =============================================================================
// Default User Trophy State
// =============================================================================

/**
 * Create a default user trophy state for a trophy
 */
export function createDefaultUserTrophy(trophyId: string): UserTrophy {
  return {
    trophyId,
    currentTier: 'none',
    progress: 0,
    tierUnlocks: {},
    notified: true,
  };
}
