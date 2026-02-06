/**
 * LearningGamificationService
 *
 * Service for managing learning gamification data persistence using D1 database.
 */

import {
  d1Client,
  type D1LearningGamification,
} from '../../../lib/api-clients/d1-client';
import { authService } from '../../../services/AuthServiceV2';
import {
  type LearningGamificationState,
  type UserStudyBadge,
  type StudyChallenge,
  type StudyGoal,
  type StudyActivityItem,
  DEFAULT_LEARNING_GAMIFICATION_STATE,
} from '../types/gamification';
import type { UserCertificate } from '../types/trophies';
import type { UserAchievement } from '../constants/uniqueBadges';
import { CERTIFICATES } from '../constants/trophies';

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
 * Initialize certificates for new users
 */
function initializeCertificates(state: LearningGamificationState): LearningGamificationState {
  if (state.certificates && state.certificates.length > 0) {
    return state;
  }

  const initialCertificates: UserCertificate[] = CERTIFICATES.map((cert) => ({
    certificateId: cert.id,
    currentTier: 'none',
    progress: 0,
    tierUnlocks: {},
    notified: true,
  }));

  return {
    ...state,
    certificates: initialCertificates,
  };
}

/**
 * Maps D1 gamification to frontend LearningGamificationState type
 */
function mapD1ToGamificationState(data: D1LearningGamification): LearningGamificationState {
  const badges = JSON.parse(data.badges || '[]') as UserStudyBadge[];
  const certificates = JSON.parse(data.certificates || '[]') as UserCertificate[];
  const achievements = JSON.parse(data.achievements || '[]') as UserAchievement[];
  const challenges = JSON.parse(data.challenges || '[]') as StudyChallenge[];
  const goals = JSON.parse(data.goals || '[]') as StudyGoal[];
  const activities = JSON.parse(data.activities || '[]') as StudyActivityItem[];
  const skillCategories = JSON.parse(data.skill_categories || '[]') as string[];

  const { currentLevel, xpInCurrentLevel, xpToNextLevel } = calculateLevelData(data.total_xp);

  let state: LearningGamificationState = {
    streak: {
      currentStreak: data.current_streak,
      longestStreak: data.longest_streak,
      lastStudyDate: data.last_study_date,
      totalStudyDays: data.total_study_days,
    },
    xp: {
      totalXP: data.total_xp,
      currentLevel,
      xpInCurrentLevel,
      xpToNextLevel,
    },
    badges,
    certificates,
    achievements,
    challenges,
    goals,
    activities,
    lastUpdated: data.updated_at || data.created_at,
    totalLessonsCompleted: data.total_lessons_completed,
    totalTasksCompleted: data.total_tasks_completed,
    perfectWeeks: data.perfect_weeks,
    perfectMonths: data.perfect_months,
    earlyStudySessions: data.early_study_sessions || 0,
    nightStudySessions: data.night_study_sessions || 0,
    practiceSessionsCompleted: data.practice_sessions_completed || 0,
    skillCategories,
    consecutivePerfectWeeks: data.consecutive_perfect_weeks || 0,
    plansCompleted: data.plans_completed || 0,
  };

  // Initialize certificates for new users
  state = initializeCertificates(state);

  return state;
}

/**
 * Learning Gamification data service for D1 persistence
 */
export const LearningGamificationService = {
  /**
   * Gets the user's gamification data
   */
  async getGamificationData(): Promise<LearningGamificationState> {
    try {
      const userUuid = await getCurrentUserUuid();
      const result = await d1Client.getLearningGamification(userUuid);

      if (result.error) {
        console.error('Error fetching learning gamification data:', result.error);
        return initializeCertificates({ ...DEFAULT_LEARNING_GAMIFICATION_STATE });
      }

      if (!result.data) {
        return initializeCertificates({ ...DEFAULT_LEARNING_GAMIFICATION_STATE });
      }

      return mapD1ToGamificationState(result.data);
    } catch (error) {
      console.error('Error in getLearningGamificationData:', error);
      return initializeCertificates({ ...DEFAULT_LEARNING_GAMIFICATION_STATE });
    }
  },

  /**
   * Saves the user's gamification data
   */
  async saveGamificationData(state: LearningGamificationState): Promise<boolean> {
    try {
      const userUuid = await getCurrentUserUuid();

      const result = await d1Client.upsertLearningGamification({
        user_uuid: userUuid,
        current_streak: state.streak.currentStreak,
        longest_streak: state.streak.longestStreak,
        last_study_date: state.streak.lastStudyDate,
        total_study_days: state.streak.totalStudyDays,
        total_xp: state.xp.totalXP,
        current_level: state.xp.currentLevel,
        total_lessons_completed: state.totalLessonsCompleted,
        total_tasks_completed: state.totalTasksCompleted,
        perfect_weeks: state.perfectWeeks,
        perfect_months: state.perfectMonths,
        early_study_sessions: state.earlyStudySessions || 0,
        night_study_sessions: state.nightStudySessions || 0,
        practice_sessions_completed: state.practiceSessionsCompleted || 0,
        skill_categories: JSON.stringify(state.skillCategories || []),
        consecutive_perfect_weeks: state.consecutivePerfectWeeks || 0,
        plans_completed: state.plansCompleted || 0,
        badges: JSON.stringify(state.badges),
        certificates: JSON.stringify(state.certificates || []),
        achievements: JSON.stringify(state.achievements || []),
        challenges: JSON.stringify(state.challenges),
        goals: JSON.stringify(state.goals),
        activities: JSON.stringify(state.activities.slice(0, 50)),
      });

      if (result.error) {
        console.error('Error saving learning gamification data:', result.error);
        return false;
      }

      console.log('Learning gamification data saved successfully');
      return true;
    } catch (error) {
      console.error('Error in saveLearningGamificationData:', error);
      return false;
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

export default LearningGamificationService;
