/**
 * useLearningGamification Hook
 *
 * Main hook for learning gamification functionality.
 * Simplified version that can be expanded later.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  LearningGamificationState,
  StudyActivityItem,
} from '../types/gamification';
import { DEFAULT_LEARNING_GAMIFICATION_STATE } from '../types/gamification';
import type { FinalExam, CourseDiploma } from '../types/courseCompletion';
import { XP_CONFIG, getStreakMessage } from '../constants/gamification';
import { LearningGamificationService } from '../services/LearningGamificationService';

interface UseLearningGamificationProps {
  weeklyHours?: number;
  enabled?: boolean;
}

interface UseLearningGamificationReturn {
  state: LearningGamificationState;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  streak: {
    current: number;
    longest: number;
    isActiveToday: boolean;
    totalStudyDays: number;
    message: string;
  };

  xp: {
    total: number;
    level: number;
    currentLevelXP: number;
    nextLevelXP: number;
    progressPercent: number;
  };

  stats: {
    totalTasksCompleted: number;
    totalLessonsCompleted: number;
    perfectWeeks: number;
    plansCompleted: number;
  };

  recordTaskCompleted: (studyHour?: number, skillCategory?: string) => Promise<void>;
  recordWeekCompleted: () => Promise<void>;
  recordPlanCompleted: () => Promise<void>;
  recordExamUpdated: (exam: FinalExam) => void;
  recordDiplomaIssued: (diploma: CourseDiploma) => void;
  addXP: (amount: number, reason: string) => void;
  refresh: () => Promise<void>;
}

function calculateLevelData(totalXP: number) {
  let level = 1;
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

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function isToday(dateString: string | null): boolean {
  if (!dateString) return false;
  return dateString === getTodayDateString();
}

export function useLearningGamification({
  enabled = true,
}: UseLearningGamificationProps = {}): UseLearningGamificationReturn {
  const [state, setState] = useState<LearningGamificationState>(
    DEFAULT_LEARNING_GAMIFICATION_STATE
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
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

        const data = await LearningGamificationService.getGamificationData();

        if (mounted) {
          setState(data);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : 'Failed to load gamification data'
          );
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [enabled]);

  // Save state when it changes (debounced)
  useEffect(() => {
    if (isLoading || !enabled) return;

    const timeoutId = setTimeout(async () => {
      setIsSaving(true);
      await LearningGamificationService.saveGamificationData(state);
      setIsSaving(false);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [state, isLoading, enabled]);

  // Update streak
  const updateStreak = useCallback(() => {
    const today = getTodayDateString();
    const lastDate = state.streak.lastStudyDate;

    if (lastDate === today) {
      // Already studied today
      return state.streak;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = state.streak.currentStreak;

    if (lastDate === yesterdayStr) {
      // Studied yesterday, increment streak
      newStreak += 1;
    } else if (lastDate !== today) {
      // Streak broken, reset to 1
      newStreak = 1;
    }

    const newLongest = Math.max(newStreak, state.streak.longestStreak);

    return {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastStudyDate: today,
      totalStudyDays: state.streak.totalStudyDays + 1,
    };
  }, [state.streak]);

  // Add XP
  const addXP = useCallback((amount: number, reason: string) => {
    setState((prev) => {
      const newTotalXP = prev.xp.totalXP + amount;
      const levelData = calculateLevelData(newTotalXP);

      const didLevelUp = levelData.currentLevel > prev.xp.currentLevel;

      const activity: StudyActivityItem = {
        id: crypto.randomUUID(),
        type: didLevelUp ? 'level_up' : 'task_completed',
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

  // Record task completed
  const recordTaskCompleted = useCallback(
    async (studyHour?: number, skillCategory?: string) => {
      const hour = studyHour ?? new Date().getHours();
      const newStreak = updateStreak();

      setState((prev) => {
        const updates: Partial<LearningGamificationState> = {
          streak: newStreak,
          totalTasksCompleted: prev.totalTasksCompleted + 1,
        };

        // Track early study sessions (before 7am)
        if (hour < 7) {
          updates.earlyStudySessions = (prev.earlyStudySessions || 0) + 1;
        }

        // Track night study sessions (after 9pm)
        if (hour >= 21) {
          updates.nightStudySessions = (prev.nightStudySessions || 0) + 1;
        }

        // Track skill categories
        if (skillCategory && !prev.skillCategories?.includes(skillCategory)) {
          updates.skillCategories = [...(prev.skillCategories || []), skillCategory];
        }

        return { ...prev, ...updates };
      });

      // Add XP
      const isFirstTask = state.totalTasksCompleted === 0;
      const xpAmount = isFirstTask
        ? XP_CONFIG.REWARDS.TASK_COMPLETED + XP_CONFIG.REWARDS.FIRST_LESSON
        : XP_CONFIG.REWARDS.TASK_COMPLETED;

      addXP(xpAmount, 'Tarefa concluida');
    },
    [updateStreak, state.totalTasksCompleted, addXP]
  );

  // Record week completed
  const recordWeekCompleted = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      totalLessonsCompleted: prev.totalLessonsCompleted + 1,
    }));

    addXP(XP_CONFIG.REWARDS.LESSON_COMPLETED, 'Semana concluida');
  }, [addXP]);

  // Record plan completed
  const recordPlanCompleted = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      plansCompleted: (prev.plansCompleted || 0) + 1,
    }));

    addXP(XP_CONFIG.REWARDS.PLAN_COMPLETED, 'Plano de estudos concluido!');
  }, [addXP]);

  // Record exam updated (save exam state for persistence)
  const recordExamUpdated = useCallback((exam: FinalExam) => {
    setState((prev) => {
      const existingIdx = prev.finalExams.findIndex((e) => e.planId === exam.planId);
      const updatedExams = [...prev.finalExams];
      if (existingIdx >= 0) {
        updatedExams[existingIdx] = exam;
      } else {
        updatedExams.push(exam);
      }
      return { ...prev, finalExams: updatedExams, lastUpdated: new Date().toISOString() };
    });
  }, []);

  // Record diploma issued (save diploma for persistence)
  const recordDiplomaIssued = useCallback((diploma: CourseDiploma) => {
    setState((prev) => ({
      ...prev,
      courseDiplomas: [...prev.courseDiplomas, diploma],
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  // Refresh
  const refresh = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await LearningGamificationService.getGamificationData();
      setState(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  // Computed values
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

  const streakData = useMemo(
    () => ({
      current: state.streak.currentStreak,
      longest: state.streak.longestStreak,
      isActiveToday: isToday(state.streak.lastStudyDate),
      totalStudyDays: state.streak.totalStudyDays,
      message: getStreakMessage(state.streak.currentStreak),
    }),
    [state.streak]
  );

  const stats = useMemo(
    () => ({
      totalTasksCompleted: state.totalTasksCompleted,
      totalLessonsCompleted: state.totalLessonsCompleted,
      perfectWeeks: state.perfectWeeks,
      plansCompleted: state.plansCompleted,
    }),
    [
      state.totalTasksCompleted,
      state.totalLessonsCompleted,
      state.perfectWeeks,
      state.plansCompleted,
    ]
  );

  return {
    state,
    isLoading,
    isSaving,
    error,
    streak: streakData,
    xp: xpData,
    stats,
    recordTaskCompleted,
    recordWeekCompleted,
    recordPlanCompleted,
    recordExamUpdated,
    recordDiplomaIssued,
    addXP,
    refresh,
  };
}
