/**
 * GamificationService
 *
 * Service for managing gamification data persistence using D1 database.
 * Handles streaks, badges, challenges, goals, and XP.
 */

import {
  d1Client,
  type D1FitnessGamification,
} from '../../../lib/api-clients/d1-client';
import { authService } from '../../../services/AuthServiceV2';
import {
  type GamificationState,
  type UserBadge,
  type Challenge,
  type Goal,
  type ActivityItem,
  DEFAULT_GAMIFICATION_STATE,
} from '../types/gamification';

/**
 * Gets the current authenticated user's UUID
 */
async function getCurrentUserUuid(): Promise<string> {
  await authService.waitForInit();
  const authUser = authService.getUser();

  if (authUser?.uuid) {
    return authUser.uuid;
  }

  throw new Error('User not authenticated');
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

/**
 * Maps D1 gamification to frontend GamificationState type
 */
function mapD1ToGamificationState(data: D1FitnessGamification): GamificationState {
  const badges = JSON.parse(data.badges || '[]') as UserBadge[];
  const challenges = JSON.parse(data.challenges || '[]') as Challenge[];
  const goals = JSON.parse(data.goals || '[]') as Goal[];
  const activities = JSON.parse(data.activities || '[]') as ActivityItem[];

  const { currentLevel, xpInCurrentLevel, xpToNextLevel } = calculateLevelData(data.total_xp);

  return {
    streak: {
      currentStreak: data.current_streak,
      longestStreak: data.longest_streak,
      lastActivityDate: data.last_activity_date,
      totalActiveDays: data.total_active_days,
    },
    xp: {
      totalXP: data.total_xp,
      currentLevel,
      xpInCurrentLevel,
      xpToNextLevel,
    },
    badges,
    challenges,
    goals,
    activities,
    lastUpdated: data.updated_at || data.created_at,
    totalWorkoutsCompleted: data.total_workouts_completed,
    perfectWeeks: data.perfect_weeks,
    perfectMonths: data.perfect_months,
  };
}

/**
 * Gamification data service for D1 persistence
 */
export const GamificationService = {
  /**
   * Gets the user's gamification data
   */
  async getGamificationData(): Promise<GamificationState> {
    try {
      const userUuid = await getCurrentUserUuid();
      const result = await d1Client.getFitnessGamification(userUuid);

      if (result.error) {
        console.error('Error fetching gamification data:', result.error);
        return { ...DEFAULT_GAMIFICATION_STATE };
      }

      if (!result.data) {
        // Return default state for new users
        return { ...DEFAULT_GAMIFICATION_STATE };
      }

      return mapD1ToGamificationState(result.data);
    } catch (error) {
      console.error('Error in getGamificationData:', error);
      return { ...DEFAULT_GAMIFICATION_STATE };
    }
  },

  /**
   * Saves the user's gamification data
   */
  async saveGamificationData(state: GamificationState): Promise<boolean> {
    try {
      const userUuid = await getCurrentUserUuid();

      const result = await d1Client.upsertFitnessGamification({
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
      });

      if (result.error) {
        console.error('Error saving gamification data:', result.error);
        return false;
      }

      console.log('Gamification data saved successfully');
      return true;
    } catch (error) {
      console.error('Error in saveGamificationData:', error);
      return false;
    }
  },

  /**
   * Records an activity and updates relevant gamification data
   * This is a convenience method that loads, updates, and saves in one call
   */
  async recordActivity(
    activityType: ActivityItem['type'],
    details: {
      title: string;
      description: string;
      xpEarned: number;
      metadata?: Record<string, any>;
    }
  ): Promise<GamificationState | null> {
    try {
      // Load current state
      const currentState = await this.getGamificationData();

      // Create new activity
      const newActivity: ActivityItem = {
        id: crypto.randomUUID(),
        type: activityType,
        title: details.title,
        description: details.description,
        xpEarned: details.xpEarned,
        timestamp: new Date().toISOString(),
        metadata: details.metadata,
      };

      // Calculate new XP and level
      const newTotalXP = currentState.xp.totalXP + details.xpEarned;
      const levelData = calculateLevelData(newTotalXP);

      // Update state
      const updatedState: GamificationState = {
        ...currentState,
        xp: {
          totalXP: newTotalXP,
          ...levelData,
        },
        activities: [newActivity, ...currentState.activities].slice(0, 50),
        lastUpdated: new Date().toISOString(),
      };

      // Save and return
      const saved = await this.saveGamificationData(updatedState);
      if (!saved) {
        return null;
      }

      return updatedState;
    } catch (error) {
      console.error('Error in recordActivity:', error);
      return null;
    }
  },

  /**
   * Checks if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await getCurrentUserUuid();
      return true;
    } catch {
      return false;
    }
  },
};

export default GamificationService;
