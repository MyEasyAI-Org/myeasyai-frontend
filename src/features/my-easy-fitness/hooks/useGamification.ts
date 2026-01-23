/**
 * useGamification Hook
 *
 * Main hook that integrates all gamification functionality:
 * - Streaks
 * - Trophies (with tier progression)
 * - Unique Badges (special achievements)
 * - Legacy Badges (for backward compatibility)
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
import type { UserTrophy } from '../types/trophies';
import { DEFAULT_GAMIFICATION_STATE } from '../types/gamification';
import { XP_CONFIG } from '../constants/gamification';
import type { UserUniqueBadge } from '../constants/uniqueBadges';
import { GamificationService } from '../services/GamificationService';
import { useStreaks } from './useStreaks';
import { useBadges } from './useBadges';
import { useTrophies, getClosestTrophyToUnlock } from './useTrophies';
import { useUniqueBadges } from './useUniqueBadges';
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

  // Trophies (new system with tier progression)
  trophies: {
    all: ReturnType<typeof useTrophies>['trophiesWithProgress'];
    maxed: ReturnType<typeof useTrophies>['maxedTrophies'];
    inProgress: ReturnType<typeof useTrophies>['inProgressTrophies'];
    closestToUnlock: ReturnType<typeof useTrophies>['trophiesWithProgress'][0] | null;
    goldCount: number;
    silverCount: number;
    bronzeCount: number;
    trophyPoints: number;
    totalTiers: number;
    unlockedTiers: number;
  };

  // Unique Badges (special achievements)
  uniqueBadges: {
    unlocked: Array<{ id: string; name: string; icon: string; rarity: string; unlockedAt?: string }>;
    locked: Array<{ id: string; name: string; icon: string; rarity: string; hint?: string }>;
    visible: Array<{ id: string; name: string; icon: string; rarity: string; isUnlocked: boolean }>;
    unlockedCount: number;
    totalCount: number;
  };

  // Legacy Badges (kept for backward compatibility)
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
  recordWorkoutCompleted: (workoutHour?: number, modalidade?: string) => Promise<void>;
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

  const handleTrophyTierUnlock = useCallback((trophy: UserTrophy, xpReward: number) => {
    setState((prev) => {
      // Update or add the trophy
      const existingIndex = prev.trophies.findIndex((t) => t.trophyId === trophy.trophyId);
      const newTrophies = [...prev.trophies];
      if (existingIndex >= 0) {
        newTrophies[existingIndex] = trophy;
      } else {
        newTrophies.push(trophy);
      }

      // Create activity for trophy unlock
      const activity: ActivityItem = {
        id: crypto.randomUUID(),
        type: 'badge_earned',
        title: `Trofeu desbloqueado: ${trophy.currentTier}`,
        description: `+${xpReward} XP`,
        xpEarned: xpReward,
        timestamp: new Date().toISOString(),
        metadata: { trophyId: trophy.trophyId, tier: trophy.currentTier },
      };

      return {
        ...prev,
        trophies: newTrophies,
        activities: [activity, ...prev.activities].slice(0, 50),
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  const handleUniqueBadgeUnlock = useCallback((badge: UserUniqueBadge, xpReward: number) => {
    setState((prev) => {
      // Create activity for badge unlock
      const activity: ActivityItem = {
        id: crypto.randomUUID(),
        type: 'badge_earned',
        title: `Conquista desbloqueada!`,
        description: `+${xpReward} XP`,
        xpEarned: xpReward,
        timestamp: new Date().toISOString(),
        metadata: { badgeId: badge.badgeId },
      };

      return {
        ...prev,
        uniqueBadges: [...prev.uniqueBadges, badge],
        activities: [activity, ...prev.activities].slice(0, 50),
        lastUpdated: new Date().toISOString(),
      };
    });
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

  const trophiesHook = useTrophies({
    state,
    onTrophyTierUnlock: handleTrophyTierUnlock,
  });

  const uniqueBadgesHook = useUniqueBadges({
    state,
    onBadgeUnlock: handleUniqueBadgeUnlock,
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
   * @param workoutHour - Hour of the workout (0-23) for early/night tracking
   * @param modalidade - Workout type/modality for variety tracking
   */
  const recordWorkoutCompleted = useCallback(async (workoutHour?: number, modalidade?: string) => {
    // Update streak
    const newStreak = streaksHook.updateStreakOnActivity();

    // Get current hour if not provided
    const hour = workoutHour ?? new Date().getHours();

    // Update workout count and new metrics for trophies
    setState((prev) => {
      const updates: Partial<GamificationState> = {
        totalWorkoutsCompleted: prev.totalWorkoutsCompleted + 1,
      };

      // Track early workouts (before 7am)
      if (hour < 7) {
        updates.earlyWorkouts = (prev.earlyWorkouts || 0) + 1;
      }

      // Track night workouts (after 9pm / 21:00)
      if (hour >= 21) {
        updates.nightWorkouts = (prev.nightWorkouts || 0) + 1;
      }

      // Track workout modalities
      if (modalidade && !prev.workoutModalities?.includes(modalidade)) {
        updates.workoutModalities = [...(prev.workoutModalities || []), modalidade];
      }

      return { ...prev, ...updates };
    });

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

    // Check for new legacy badges
    badgesHook.checkAndUnlockBadges();

    // Check for new trophy tier unlocks
    trophiesHook.checkAndUnlockTrophyTiers();

    // Check for new unique badges
    uniqueBadgesHook.checkAndUnlockBadges();

    // Update goals
    goalsHook.refreshGoals();

    // Force save
    await forceSave();
  }, [
    streaksHook,
    state.totalWorkoutsCompleted,
    challengesHook,
    badgesHook,
    trophiesHook,
    uniqueBadgesHook,
    goalsHook,
    addXP,
    forceSave,
  ]);

  /**
   * Record diet followed
   */
  const recordDietFollowed = useCallback(async () => {
    // Update diet days counter for trophy
    setState((prev) => ({
      ...prev,
      dietDaysFollowed: (prev.dietDaysFollowed || 0) + 1,
    }));

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

    // Check for trophy unlocks
    trophiesHook.checkAndUnlockTrophyTiers();

    await forceSave();
  }, [challengesHook, trophiesHook, addXP, forceSave]);

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

  const trophiesData = useMemo(() => ({
    all: trophiesHook.trophiesWithProgress,
    maxed: trophiesHook.maxedTrophies,
    inProgress: trophiesHook.inProgressTrophies,
    closestToUnlock: getClosestTrophyToUnlock(trophiesHook.trophiesWithProgress),
    goldCount: trophiesHook.goldCount,
    silverCount: trophiesHook.silverCount,
    bronzeCount: trophiesHook.bronzeCount,
    trophyPoints: trophiesHook.trophyPoints,
    totalTiers: trophiesHook.totalTiers,
    unlockedTiers: trophiesHook.unlockedTiers,
  }), [trophiesHook]);

  const uniqueBadgesData = useMemo(() => ({
    unlocked: uniqueBadgesHook.unlockedBadges.map((b) => ({
      id: b.id,
      name: b.name,
      icon: b.icon,
      rarity: b.rarity,
      unlockedAt: b.unlockedAt,
    })),
    locked: uniqueBadgesHook.lockedBadges.map((b) => ({
      id: b.id,
      name: b.name,
      icon: b.icon,
      rarity: b.rarity,
      hint: b.hint,
    })),
    visible: uniqueBadgesHook.visibleBadges.map((b) => ({
      id: b.id,
      name: b.name,
      icon: b.icon,
      rarity: b.rarity,
      isUnlocked: b.isUnlocked,
    })),
    unlockedCount: uniqueBadgesHook.unlockedCount,
    totalCount: uniqueBadgesHook.totalBadges,
  }), [uniqueBadgesHook]);

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

    trophies: trophiesData,

    uniqueBadges: uniqueBadgesData,

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
