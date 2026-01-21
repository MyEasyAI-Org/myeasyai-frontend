/**
 * Gamification Types
 *
 * Type definitions for the gamification system (streaks, badges, challenges, goals).
 */

// =============================================================================
// Streak Types
// =============================================================================

/**
 * Streak data tracking consecutive days of activity
 */
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null; // ISO date string (YYYY-MM-DD)
  totalActiveDays: number;
}

// =============================================================================
// Badge Types
// =============================================================================

/**
 * Badge categories
 */
export type BadgeCategory = 'streak' | 'volume' | 'consistency' | 'special';

/**
 * Badge rarity levels
 */
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

/**
 * Badge definition (static configuration)
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  icon: string; // Icon name from lucide-react
  requirement: {
    type: 'streak' | 'total_workouts' | 'perfect_week' | 'perfect_month' | 'special';
    value: number;
  };
}

/**
 * User's earned badge with timestamp
 */
export interface UserBadge {
  badgeId: string;
  unlockedAt: string; // ISO timestamp
  notified: boolean; // Whether user has been notified
}

// =============================================================================
// Challenge Types
// =============================================================================

/**
 * Challenge types
 */
export type ChallengeType = 'daily' | 'weekly';

/**
 * Challenge status
 */
export type ChallengeStatus = 'active' | 'completed' | 'failed' | 'expired';

/**
 * Challenge definition
 */
export interface Challenge {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  icon: string;
  target: number;
  progress: number;
  xpReward: number;
  status: ChallengeStatus;
  createdAt: string; // ISO timestamp
  expiresAt: string; // ISO timestamp
}

/**
 * Challenge template for generation
 */
export interface ChallengeTemplate {
  id: string;
  type: ChallengeType;
  titleTemplate: string;
  descriptionTemplate: string;
  icon: string;
  targetGenerator: (profile: { diasTreinoSemana: number }) => number;
  xpReward: number;
}

// =============================================================================
// Goal Types
// =============================================================================

/**
 * Goal category
 */
export type GoalCategory = 'workout' | 'consistency' | 'nutrition' | 'progress';

/**
 * Goal status
 */
export type GoalStatus = 'active' | 'completed' | 'failed';

/**
 * Goal definition
 */
export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  target: number;
  progress: number;
  unit: string;
  icon: string;
  status: GoalStatus;
  createdAt: string;
  completedAt?: string;
}

// =============================================================================
// XP & Level Types
// =============================================================================

/**
 * XP and level data
 */
export interface XPData {
  totalXP: number;
  currentLevel: number;
  xpInCurrentLevel: number;
  xpToNextLevel: number;
}

// =============================================================================
// Activity Types
// =============================================================================

/**
 * Activity types that can be recorded
 */
export type ActivityType =
  | 'workout_completed'
  | 'challenge_completed'
  | 'badge_earned'
  | 'goal_achieved'
  | 'streak_milestone'
  | 'level_up'
  | 'diet_followed';

/**
 * Activity feed item
 */
export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  xpEarned: number;
  timestamp: string; // ISO timestamp
  metadata?: Record<string, any>;
}

// =============================================================================
// Combined State Types
// =============================================================================

/**
 * Complete gamification state
 */
export interface GamificationState {
  // Streak tracking
  streak: StreakData;

  // XP and leveling
  xp: XPData;

  // Badges
  badges: UserBadge[];

  // Challenges
  challenges: Challenge[];

  // Goals
  goals: Goal[];

  // Activity history
  activities: ActivityItem[];

  // Metadata
  lastUpdated: string;
  totalWorkoutsCompleted: number;
  perfectWeeks: number;
  perfectMonths: number;
}

/**
 * Initial/default gamification state
 */
export const DEFAULT_GAMIFICATION_STATE: GamificationState = {
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    totalActiveDays: 0,
  },
  xp: {
    totalXP: 0,
    currentLevel: 1,
    xpInCurrentLevel: 0,
    xpToNextLevel: 100,
  },
  badges: [],
  challenges: [],
  goals: [],
  activities: [],
  lastUpdated: new Date().toISOString(),
  totalWorkoutsCompleted: 0,
  perfectWeeks: 0,
  perfectMonths: 0,
};

// =============================================================================
// D1 Persistence Types
// =============================================================================

/**
 * D1 gamification profile for database persistence
 * All arrays are stored as JSON strings in D1
 */
export interface D1GamificationProfile {
  id: string;
  user_uuid: string;
  // Streak data
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  total_active_days: number;
  // XP data
  total_xp: number;
  current_level: number;
  // Stats
  total_workouts_completed: number;
  perfect_weeks: number;
  perfect_months: number;
  // JSON stringified arrays
  badges: string; // JSON array of UserBadge
  challenges: string; // JSON array of Challenge
  goals: string; // JSON array of Goal
  activities: string; // JSON array of ActivityItem (limited to recent 50)
  // Timestamps
  created_at: string;
  updated_at: string | null;
}

/**
 * Convert GamificationState to D1GamificationProfile format
 */
export function toD1GamificationProfile(
  userUuid: string,
  state: GamificationState,
  existingId?: string
): Omit<D1GamificationProfile, 'created_at' | 'updated_at'> {
  return {
    id: existingId || crypto.randomUUID(),
    user_uuid: userUuid,
    current_streak: state.streak.currentStreak,
    longest_streak: state.streak.longestStreak,
    last_activity_date: state.streak.lastActivityDate,
    total_active_days: state.streak.totalActiveDays,
    total_xp: state.xp.totalXP,
    current_level: state.xp.currentLevel,
    total_workouts_completed: state.totalWorkoutsCompleted,
    perfect_weeks: state.perfectWeeks,
    perfect_months: state.perfectMonths,
    badges: JSON.stringify(state.badges),
    challenges: JSON.stringify(state.challenges),
    goals: JSON.stringify(state.goals),
    activities: JSON.stringify(state.activities.slice(0, 50)), // Limit to 50 recent
  };
}

/**
 * Convert D1GamificationProfile to GamificationState
 */
export function fromD1GamificationProfile(
  profile: D1GamificationProfile
): GamificationState {
  const badges = JSON.parse(profile.badges || '[]') as UserBadge[];
  const challenges = JSON.parse(profile.challenges || '[]') as Challenge[];
  const goals = JSON.parse(profile.goals || '[]') as Goal[];
  const activities = JSON.parse(profile.activities || '[]') as ActivityItem[];

  // Calculate XP level data
  const { currentLevel, xpInCurrentLevel, xpToNextLevel } = calculateLevelData(profile.total_xp);

  return {
    streak: {
      currentStreak: profile.current_streak,
      longestStreak: profile.longest_streak,
      lastActivityDate: profile.last_activity_date,
      totalActiveDays: profile.total_active_days,
    },
    xp: {
      totalXP: profile.total_xp,
      currentLevel,
      xpInCurrentLevel,
      xpToNextLevel,
    },
    badges,
    challenges,
    goals,
    activities,
    lastUpdated: profile.updated_at || profile.created_at,
    totalWorkoutsCompleted: profile.total_workouts_completed,
    perfectWeeks: profile.perfect_weeks,
    perfectMonths: profile.perfect_months,
  };
}

/**
 * Calculate level data from total XP
 */
function calculateLevelData(totalXP: number): {
  currentLevel: number;
  xpInCurrentLevel: number;
  xpToNextLevel: number;
} {
  // XP required per level: 100, 150, 225, 337, 506... (1.5x multiplier)
  let level = 1;
  let xpForLevel = 100;
  let xpUsed = 0;

  while (xpUsed + xpForLevel <= totalXP) {
    xpUsed += xpForLevel;
    level++;
    xpForLevel = Math.floor(xpForLevel * 1.5);
  }

  return {
    currentLevel: level,
    xpInCurrentLevel: totalXP - xpUsed,
    xpToNextLevel: xpForLevel,
  };
}
