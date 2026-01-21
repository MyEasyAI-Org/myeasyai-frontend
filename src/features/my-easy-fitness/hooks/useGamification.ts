/**
 * useGamification Hook
 *
 * Main hook that integrates all gamification functionality:
 * - Streaks
 * - Badges
 * - Challenges
 * - Goals
 * - XP/Leveling
 * - Auto-save
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  GamificationState,
  UserBadge,
  Challenge,
  Goal,
  ActivityItem,
  StreakData,
} from '../types/gamification';
import { DEFAULT_GAMIFICATION_STATE } from '../types/gamification';
import { XP_CONFIG } from '../constants/gamification';
import { GamificationService } from '../services/GamificationService';
import { useStreaks } from './useStreaks';
import { useBadges } from './useBadges';
import { useChallenges } from './useChallenges';
import { useGoals } from './useGoals';
import { useAutoSaveGamification } from './useAutoSaveGamification';

interface UseGamificationProps {
  diasTreinoSemana: number;
  objetivo: string;
  enabled?: boolean;
}

interface UseGamificationReturn {
  // State
  state: GamificationState;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Streak data
  streak: {
    current: number;
    longest: number;
    isActiveToday: boolean;
    daysSinceLastActivity: number;
    totalActiveDays: number;
  };

  // XP data
  xp: {
    total: number;
    level: number;
    currentLevelXP: number;
    nextLevelXP: number;
    progressPercent: number;
  };

  // Badges
  badges: {
    unlocked: Array<{ id: string; name: string; icon: string; unlockedAt: string }>;
    locked: Array<{ id: string; name: string; icon: string; requirement: string }>;
    recentUnlocks: Array<{ id: string; name: string; icon: string }>;
    unlockedCount: number;
    totalCount: number;
  };

  // Challenges
  challenges: {
    daily: Challenge[];
    weekly: Challenge[];
    dailyProgress: { completed: number; total: number };
    weeklyProgress: { completed: number; total: number };
  };

  // Goals
  goals: {
    active: Goal[];
    completed: Goal[];
    overallProgress: number;
  };

  // Activity feed
  activities: ActivityItem[];

  // Actions
  recordWorkoutCompleted: () => Promise<void>;
  recordDietFollowed: () => Promise<void>;
  completeDailyChallenge: (challengeId: string) => void;
  completeWeeklyChallenge: (challengeId: string) => void;
  addXP: (amount: number, reason: string) => void;
  refresh: () => Promise<void>;
}

/**
 * Calculate XP level data
 */
function calculateLevelData(totalXP: number) {
  let level: number = 1;
  let xpForLevel: number = XP_CONFIG.LEVEL_BASE_XP;
  let xpUsed = 0;

  while (xpUsed + xpForLevel <= totalXP && level < XP_CONFIG.MAX_LEVEL) {
    xpUsed += xpForLevel;
    level++;
    xpForLevel = Math.floor(xpForLevel * XP_CONFIG.LEVEL_MULTIPLIER);
  }

  const xpInCurrentLevel = totalXP - xpUsed;
  const progressPercent = Math.round((xpInCurrentLevel / xpForLevel) * 100);

  return {
    currentLevel: level,
    xpInCurrentLevel,
    xpToNextLevel: xpForLevel,
    progressPercent,
  };
}

export function useGamification({
  diasTreinoSemana,
  objetivo,
  enabled = true,
}: UseGamificationProps): UseGamificationReturn {
  const [state, setState] = useState<GamificationState>(DEFAULT_GAMIFICATION_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ===== State Update Callbacks =====

  const handleStreakUpdate = useCallback((newStreak: StreakData) => {
    setState((prev) => ({ ...prev, streak: newStreak }));
  }, []);

  const handleBadgeUnlock = useCallback((badge: UserBadge) => {
    setState((prev) => ({
      ...prev,
      badges: [...prev.badges, badge],
    }));
  }, []);

  const handleChallengesUpdate = useCallback((challenges: Challenge[]) => {
    setState((prev) => ({ ...prev, challenges }));
  }, []);

  const handleGoalsUpdate = useCallback((goals: Goal[]) => {
    setState((prev) => ({ ...prev, goals }));
  }, []);

  // ===== Sub-hooks =====

  const streaksHook = useStreaks({
    streak: state.streak,
    onStreakUpdate: handleStreakUpdate,
  });

  const badgesHook = useBadges({
    state,
    onBadgeUnlock: handleBadgeUnlock,
  });

  const challengesHook = useChallenges({
    challenges: state.challenges,
    diasTreinoSemana,
    onChallengesUpdate: handleChallengesUpdate,
  });

  const goalsHook = useGoals({
    goals: state.goals,
    diasTreinoSemana,
    objetivo,
    currentStreak: state.streak.currentStreak,
    totalWorkoutsCompleted: state.totalWorkoutsCompleted,
    onGoalsUpdate: handleGoalsUpdate,
  });

  const { isSaving, forceSave } = useAutoSaveGamification({
    state,
    enabled,
    debounceMs: 2000,
  });

  // ===== Load Initial Data =====

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await GamificationService.getGamificationData();

        if (mounted) {
          setState(data);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load gamification data');
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [enabled]);

  // ===== Initialize/Refresh Challenges and Goals =====

  useEffect(() => {
    if (isLoading || !enabled) return;

    // Refresh challenges on mount
    challengesHook.refreshChallengesIfNeeded();

    // Refresh goals on mount
    goalsHook.refreshGoals();
  }, [isLoading, enabled]); // Only run once after loading

  // ===== Actions =====

  /**
   * Add XP and update level
   */
  const addXP = useCallback((amount: number, reason: string) => {
    setState((prev) => {
      const newTotalXP = prev.xp.totalXP + amount;
      const levelData = calculateLevelData(newTotalXP);

      // Check for level up
      const didLevelUp = levelData.currentLevel > prev.xp.currentLevel;

      // Create activity
      const activity: ActivityItem = {
        id: crypto.randomUUID(),
        type: didLevelUp ? 'level_up' : 'workout_completed',
        title: didLevelUp ? `Subiu para o Nivel ${levelData.currentLevel}!` : reason,
        description: `+${amount} XP`,
        xpEarned: amount,
        timestamp: new Date().toISOString(),
      };

      return {
        ...prev,
        xp: {
          totalXP: newTotalXP,
          currentLevel: levelData.currentLevel,
          xpInCurrentLevel: levelData.xpInCurrentLevel,
          xpToNextLevel: levelData.xpToNextLevel,
        },
        activities: [activity, ...prev.activities].slice(0, 50),
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  /**
   * Record a workout completion
   */
  const recordWorkoutCompleted = useCallback(async () => {
    // Update streak
    const newStreak = streaksHook.updateStreakOnActivity();

    // Update workout count
    setState((prev) => ({
      ...prev,
      totalWorkoutsCompleted: prev.totalWorkoutsCompleted + 1,
    }));

    // Add XP
    const isFirstWorkout = state.totalWorkoutsCompleted === 0;
    const xpAmount = isFirstWorkout
      ? XP_CONFIG.REWARDS.WORKOUT_COMPLETED + XP_CONFIG.REWARDS.FIRST_WORKOUT
      : XP_CONFIG.REWARDS.WORKOUT_COMPLETED;

    addXP(xpAmount, 'Treino concluido');

    // Update daily workout challenge
    const dailyWorkoutChallenge = challengesHook.dailyChallenges.find(
      (c) => c.id.includes('daily_workout')
    );
    if (dailyWorkoutChallenge && dailyWorkoutChallenge.status === 'active') {
      challengesHook.completeChallenge(dailyWorkoutChallenge.id);
      addXP(XP_CONFIG.REWARDS.CHALLENGE_DAILY_COMPLETED, 'Desafio diario concluido');
    }

    // Update weekly workout challenge
    const weeklyWorkoutChallenge = challengesHook.weeklyChallenges.find(
      (c) => c.id.includes('weekly_workouts')
    );
    if (weeklyWorkoutChallenge && weeklyWorkoutChallenge.status === 'active') {
      const newProgress = weeklyWorkoutChallenge.progress + 1;
      challengesHook.updateChallengeProgress(weeklyWorkoutChallenge.id, newProgress);

      if (newProgress >= weeklyWorkoutChallenge.target) {
        addXP(XP_CONFIG.REWARDS.CHALLENGE_WEEKLY_COMPLETED, 'Meta semanal concluida');
      }
    }

    // Check for new badges
    badgesHook.checkAndUnlockBadges();

    // Update goals
    goalsHook.refreshGoals();

    // Force save
    await forceSave();
  }, [
    streaksHook,
    state.totalWorkoutsCompleted,
    challengesHook,
    badgesHook,
    goalsHook,
    addXP,
    forceSave,
  ]);

  /**
   * Record diet followed
   */
  const recordDietFollowed = useCallback(async () => {
    // Update diet challenge
    const dietChallenge = challengesHook.dailyChallenges.find(
      (c) => c.id.includes('daily_diet')
    );
    if (dietChallenge && dietChallenge.status === 'active') {
      challengesHook.completeChallenge(dietChallenge.id);
      addXP(XP_CONFIG.REWARDS.CHALLENGE_DAILY_COMPLETED, 'Dieta seguida');
    }

    // Create activity
    setState((prev) => {
      const activity: ActivityItem = {
        id: crypto.randomUUID(),
        type: 'diet_followed',
        title: 'Dieta seguida',
        description: 'Seguiu o plano alimentar',
        xpEarned: XP_CONFIG.REWARDS.CHALLENGE_DAILY_COMPLETED,
        timestamp: new Date().toISOString(),
      };

      return {
        ...prev,
        activities: [activity, ...prev.activities].slice(0, 50),
        lastUpdated: new Date().toISOString(),
      };
    });

    await forceSave();
  }, [challengesHook, addXP, forceSave]);

  /**
   * Complete a daily challenge
   */
  const completeDailyChallenge = useCallback(
    (challengeId: string) => {
      challengesHook.completeChallenge(challengeId);
      addXP(XP_CONFIG.REWARDS.CHALLENGE_DAILY_COMPLETED, 'Desafio diario concluido');
    },
    [challengesHook, addXP]
  );

  /**
   * Complete a weekly challenge
   */
  const completeWeeklyChallenge = useCallback(
    (challengeId: string) => {
      challengesHook.completeChallenge(challengeId);
      addXP(XP_CONFIG.REWARDS.CHALLENGE_WEEKLY_COMPLETED, 'Desafio semanal concluido');
    },
    [challengesHook, addXP]
  );

  /**
   * Refresh all data from server
   */
  const refresh = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await GamificationService.getGamificationData();
      setState(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  // ===== Computed Return Values =====

  const xpData = useMemo(() => {
    const levelData = calculateLevelData(state.xp.totalXP);
    return {
      total: state.xp.totalXP,
      level: levelData.currentLevel,
      currentLevelXP: levelData.xpInCurrentLevel,
      nextLevelXP: levelData.xpToNextLevel,
      progressPercent: levelData.progressPercent,
    };
  }, [state.xp.totalXP]);

  const badgesData = useMemo(() => ({
    unlocked: badgesHook.unlockedBadges.map((b) => ({
      id: b.id,
      name: b.name,
      icon: b.icon,
      unlockedAt: b.unlockedAt,
    })),
    locked: badgesHook.lockedBadges.map((b) => ({
      id: b.id,
      name: b.name,
      icon: b.icon,
      requirement: b.description,
    })),
    recentUnlocks: badgesHook.recentUnlocks.map((b) => ({
      id: b.id,
      name: b.name,
      icon: b.icon,
    })),
    unlockedCount: badgesHook.unlockedCount,
    totalCount: badgesHook.totalBadges,
  }), [badgesHook]);

  return {
    state,
    isLoading,
    isSaving,
    error,

    streak: {
      current: streaksHook.currentStreak,
      longest: streaksHook.longestStreak,
      isActiveToday: streaksHook.isActiveToday,
      daysSinceLastActivity: streaksHook.daysSinceLastActivity,
      totalActiveDays: streaksHook.totalActiveDays,
    },

    xp: xpData,

    badges: badgesData,

    challenges: {
      daily: challengesHook.dailyChallenges,
      weekly: challengesHook.weeklyChallenges,
      dailyProgress: challengesHook.dailyProgress,
      weeklyProgress: challengesHook.weeklyProgress,
    },

    goals: {
      active: goalsHook.activeGoals,
      completed: goalsHook.completedGoals,
      overallProgress: goalsHook.overallProgress,
    },

    activities: state.activities,

    recordWorkoutCompleted,
    recordDietFollowed,
    completeDailyChallenge,
    completeWeeklyChallenge,
    addXP,
    refresh,
  };
}
