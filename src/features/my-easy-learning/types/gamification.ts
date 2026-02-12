/**
 * Learning Gamification Types
 *
 * Type definitions for the learning gamification system.
 * Adapted from fitness: workout -> lesson, diet -> practice session
 */

import type { UserCertificate } from './trophies';
import type { UserAchievement } from '../constants/uniqueBadges';
import type { CourseDiploma, FinalExam } from './courseCompletion';

// =============================================================================
// Streak Types
// =============================================================================

export interface StudyStreakData {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null; // ISO date string (YYYY-MM-DD)
  totalStudyDays: number;
}

// =============================================================================
// Badge Types (Legacy - kept for compatibility)
// =============================================================================

export type StudyBadgeCategory = 'streak' | 'volume' | 'consistency' | 'mastery';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface StudyBadge {
  id: string;
  name: string;
  description: string;
  category: StudyBadgeCategory;
  rarity: BadgeRarity;
  icon: string;
  requirement: {
    type: 'streak' | 'total_lessons' | 'perfect_week' | 'perfect_month' | 'special';
    value: number;
  };
}

export interface UserStudyBadge {
  badgeId: string;
  unlockedAt: string;
  notified: boolean;
}

// =============================================================================
// Challenge Types
// =============================================================================

export type StudyChallengeType = 'daily' | 'weekly';
export type ChallengeStatus = 'active' | 'completed' | 'failed' | 'expired';

export interface StudyChallenge {
  id: string;
  type: StudyChallengeType;
  title: string;
  description: string;
  icon: string;
  target: number;
  progress: number;
  xpReward: number;
  status: ChallengeStatus;
  createdAt: string;
  expiresAt: string;
}

export interface StudyChallengeTemplate {
  id: string;
  type: StudyChallengeType;
  titleTemplate: string;
  descriptionTemplate: string;
  icon: string;
  targetGenerator: (profile: { weeklyHours: number; tasksPerWeek: number }) => number;
  xpReward: number;
}

// =============================================================================
// Goal Types
// =============================================================================

export type StudyGoalCategory = 'lesson' | 'consistency' | 'practice' | 'progress';
export type GoalStatus = 'active' | 'completed' | 'failed';

export interface StudyGoal {
  id: string;
  title: string;
  description: string;
  category: StudyGoalCategory;
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

export interface LearningXPData {
  totalXP: number;
  currentLevel: number;
  xpInCurrentLevel: number;
  xpToNextLevel: number;
}

// =============================================================================
// Activity Types
// =============================================================================

export type StudyActivityType =
  | 'lesson_completed'
  | 'task_completed'
  | 'practice_session'
  | 'challenge_completed'
  | 'achievement_earned'
  | 'goal_achieved'
  | 'streak_milestone'
  | 'level_up'
  | 'week_completed'
  | 'plan_completed';

export interface StudyActivityItem {
  id: string;
  type: StudyActivityType;
  title: string;
  description: string;
  xpEarned: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// Combined State Types
// =============================================================================

export interface LearningGamificationState {
  // Streak tracking
  streak: StudyStreakData;

  // XP and leveling
  xp: LearningXPData;

  // Legacy badges
  badges: UserStudyBadge[];

  // Certificates (trophies with tier progression)
  certificates: UserCertificate[];

  // Achievements (unique badges)
  achievements: UserAchievement[];

  // Challenges
  challenges: StudyChallenge[];

  // Goals
  goals: StudyGoal[];

  // Activity history
  activities: StudyActivityItem[];

  // Metadata
  lastUpdated: string;
  totalLessonsCompleted: number;
  totalTasksCompleted: number;
  perfectWeeks: number;
  perfectMonths: number;

  // Learning-specific metrics
  earlyStudySessions: number; // Before 7am
  nightStudySessions: number; // After 9pm
  practiceSessionsCompleted: number;
  skillCategories: string[]; // Different subjects studied
  consecutivePerfectWeeks: number;
  plansCompleted: number;

  // Course completion diplomas (separate from gamification trophies)
  courseDiplomas: CourseDiploma[];
  finalExams: FinalExam[];
}

export const DEFAULT_LEARNING_GAMIFICATION_STATE: LearningGamificationState = {
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: null,
    totalStudyDays: 0,
  },
  xp: {
    totalXP: 0,
    currentLevel: 1,
    xpInCurrentLevel: 0,
    xpToNextLevel: 100,
  },
  badges: [],
  certificates: [],
  achievements: [],
  challenges: [],
  goals: [],
  activities: [],
  lastUpdated: new Date().toISOString(),
  totalLessonsCompleted: 0,
  totalTasksCompleted: 0,
  perfectWeeks: 0,
  perfectMonths: 0,
  earlyStudySessions: 0,
  nightStudySessions: 0,
  practiceSessionsCompleted: 0,
  skillCategories: [],
  consecutivePerfectWeeks: 0,
  plansCompleted: 0,
  courseDiplomas: [],
  finalExams: [],
};

// =============================================================================
// D1 Persistence Types
// =============================================================================

export interface D1LearningGamificationProfile {
  id: string;
  user_uuid: string;
  // Streak data
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
  total_study_days: number;
  // XP data
  total_xp: number;
  current_level: number;
  // Stats
  total_lessons_completed: number;
  total_tasks_completed: number;
  perfect_weeks: number;
  perfect_months: number;
  // Learning-specific stats
  early_study_sessions: number;
  night_study_sessions: number;
  practice_sessions_completed: number;
  skill_categories: string; // JSON array
  consecutive_perfect_weeks: number;
  plans_completed: number;
  // JSON stringified arrays
  badges: string;
  certificates: string;
  achievements: string;
  challenges: string;
  goals: string;
  activities: string;
  // Course completion
  course_diplomas: string;
  final_exams: string;
  // Timestamps
  created_at: string;
  updated_at: string | null;
}

/**
 * Convert LearningGamificationState to D1 format
 */
export function toD1LearningGamificationProfile(
  userUuid: string,
  state: LearningGamificationState,
  existingId?: string
): Omit<D1LearningGamificationProfile, 'created_at' | 'updated_at'> {
  return {
    id: existingId || crypto.randomUUID(),
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
    early_study_sessions: state.earlyStudySessions,
    night_study_sessions: state.nightStudySessions,
    practice_sessions_completed: state.practiceSessionsCompleted,
    skill_categories: JSON.stringify(state.skillCategories),
    consecutive_perfect_weeks: state.consecutivePerfectWeeks,
    plans_completed: state.plansCompleted,
    badges: JSON.stringify(state.badges),
    certificates: JSON.stringify(state.certificates),
    achievements: JSON.stringify(state.achievements),
    challenges: JSON.stringify(state.challenges),
    goals: JSON.stringify(state.goals),
    activities: JSON.stringify(state.activities.slice(0, 50)),
    course_diplomas: JSON.stringify(state.courseDiplomas || []),
    final_exams: JSON.stringify(state.finalExams || []),
  };
}

/**
 * Convert D1 format to LearningGamificationState
 */
export function fromD1LearningGamificationProfile(
  profile: D1LearningGamificationProfile
): LearningGamificationState {
  const badges = JSON.parse(profile.badges || '[]') as UserStudyBadge[];
  const certificates = JSON.parse(profile.certificates || '[]') as UserCertificate[];
  const achievements = JSON.parse(profile.achievements || '[]') as UserAchievement[];
  const challenges = JSON.parse(profile.challenges || '[]') as StudyChallenge[];
  const goals = JSON.parse(profile.goals || '[]') as StudyGoal[];
  const activities = JSON.parse(profile.activities || '[]') as StudyActivityItem[];
  const skillCategories = JSON.parse(profile.skill_categories || '[]') as string[];
  const courseDiplomas = JSON.parse(profile.course_diplomas || '[]') as CourseDiploma[];
  const finalExams = JSON.parse(profile.final_exams || '[]') as FinalExam[];

  const { currentLevel, xpInCurrentLevel, xpToNextLevel } = calculateLevelData(
    profile.total_xp
  );

  return {
    streak: {
      currentStreak: profile.current_streak,
      longestStreak: profile.longest_streak,
      lastStudyDate: profile.last_study_date,
      totalStudyDays: profile.total_study_days,
    },
    xp: {
      totalXP: profile.total_xp,
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
    lastUpdated: profile.updated_at || profile.created_at,
    totalLessonsCompleted: profile.total_lessons_completed,
    totalTasksCompleted: profile.total_tasks_completed,
    perfectWeeks: profile.perfect_weeks,
    perfectMonths: profile.perfect_months,
    earlyStudySessions: profile.early_study_sessions || 0,
    nightStudySessions: profile.night_study_sessions || 0,
    practiceSessionsCompleted: profile.practice_sessions_completed || 0,
    skillCategories,
    consecutivePerfectWeeks: profile.consecutive_perfect_weeks || 0,
    plansCompleted: profile.plans_completed || 0,
    courseDiplomas,
    finalExams,
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
