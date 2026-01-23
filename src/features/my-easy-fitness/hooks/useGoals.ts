/**
 * useGoals Hook
 *
 * Manages goal generation, tracking, and completion.
 * Generates automatic goals based on user profile (diasTreinoSemana, objetivo).
 */

import { useCallback, useMemo } from 'react';
import type { Goal, GoalCategory, GoalStatus } from '../types/gamification';
import { GOAL_TEMPLATES } from '../constants/gamification';

interface UseGoalsProps {
  goals: Goal[];
  diasTreinoSemana: number;
  objetivo: string;
  currentStreak: number;
  totalWorkoutsCompleted: number;
  onGoalsUpdate: (goals: Goal[]) => void;
}

interface UseGoalsReturn {
  // Goal collections
  activeGoals: Goal[];
  completedGoals: Goal[];
  goalsByCategory: Record<GoalCategory, Goal[]>;

  // Stats
  completedCount: number;
  activeCount: number;
  overallProgress: number;

  // Actions
  generateDefaultGoals: () => Goal[];
  updateGoalProgress: (goalId: string, progress: number) => void;
  completeGoal: (goalId: string) => void;
  addCustomGoal: (goal: Omit<Goal, 'id' | 'status' | 'createdAt'>) => void;
  removeGoal: (goalId: string) => void;
  refreshGoals: () => void;
}

/**
 * Get current month string (YYYY-MM)
 */
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Get current week string (YYYY-WXX)
 */
function getCurrentWeek(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}

export function useGoals({
  goals,
  diasTreinoSemana,
  objetivo,
  currentStreak,
  totalWorkoutsCompleted,
  onGoalsUpdate,
}: UseGoalsProps): UseGoalsReturn {
  // Filter active goals
  const activeGoals = useMemo(() => {
    return goals.filter((g) => g.status === 'active');
  }, [goals]);

  // Filter completed goals
  const completedGoals = useMemo(() => {
    return goals.filter((g) => g.status === 'completed');
  }, [goals]);

  // Goals by category
  const goalsByCategory = useMemo(() => {
    const categories: Record<GoalCategory, Goal[]> = {
      workout: [],
      consistency: [],
      nutrition: [],
      progress: [],
    };

    for (const goal of goals) {
      categories[goal.category].push(goal);
    }

    return categories;
  }, [goals]);

  // Stats
  const completedCount = completedGoals.length;
  const activeCount = activeGoals.length;

  // Overall progress (average of active goals)
  const overallProgress = useMemo(() => {
    if (activeGoals.length === 0) return 0;
    const totalProgress = activeGoals.reduce(
      (sum, g) => sum + (g.progress / g.target) * 100,
      0
    );
    return Math.round(totalProgress / activeGoals.length);
  }, [activeGoals]);

  /**
   * Generate default goals based on user profile
   */
  const generateDefaultGoals = useCallback((): Goal[] => {
    const currentMonth = getCurrentMonth();
    const currentWeek = getCurrentWeek();
    const newGoals: Goal[] = [];

    // Weekly workout goal
    if (diasTreinoSemana > 0) {
      const weeklyTarget = diasTreinoSemana;
      newGoals.push({
        id: `weekly_workout_${currentWeek}`,
        title: GOAL_TEMPLATES.WEEKLY_WORKOUT.titleTemplate,
        description: GOAL_TEMPLATES.WEEKLY_WORKOUT.descriptionTemplate.replace(
          '{target}',
          String(weeklyTarget)
        ),
        category: GOAL_TEMPLATES.WEEKLY_WORKOUT.category,
        target: weeklyTarget,
        progress: 0, // Will be updated based on weekly workouts
        unit: GOAL_TEMPLATES.WEEKLY_WORKOUT.unit,
        icon: GOAL_TEMPLATES.WEEKLY_WORKOUT.icon,
        status: 'active',
        createdAt: new Date().toISOString(),
      });
    }

    // Monthly workout goal
    if (diasTreinoSemana > 0) {
      const monthlyTarget = diasTreinoSemana * 4; // Approximate 4 weeks per month
      newGoals.push({
        id: `monthly_workout_${currentMonth}`,
        title: GOAL_TEMPLATES.MONTHLY_WORKOUT.titleTemplate,
        description: GOAL_TEMPLATES.MONTHLY_WORKOUT.descriptionTemplate.replace(
          '{target}',
          String(monthlyTarget)
        ),
        category: GOAL_TEMPLATES.MONTHLY_WORKOUT.category,
        target: monthlyTarget,
        progress: 0,
        unit: GOAL_TEMPLATES.MONTHLY_WORKOUT.unit,
        icon: GOAL_TEMPLATES.MONTHLY_WORKOUT.icon,
        status: 'active',
        createdAt: new Date().toISOString(),
      });
    }

    // Streak goal (next milestone)
    const nextStreakMilestone = getNextStreakMilestone(currentStreak);
    if (nextStreakMilestone) {
      newGoals.push({
        id: `streak_goal_${nextStreakMilestone}`,
        title: GOAL_TEMPLATES.STREAK_GOAL.titleTemplate,
        description: GOAL_TEMPLATES.STREAK_GOAL.descriptionTemplate.replace(
          '{target}',
          String(nextStreakMilestone)
        ),
        category: GOAL_TEMPLATES.STREAK_GOAL.category,
        target: nextStreakMilestone,
        progress: currentStreak,
        unit: GOAL_TEMPLATES.STREAK_GOAL.unit,
        icon: GOAL_TEMPLATES.STREAK_GOAL.icon,
        status: 'active',
        createdAt: new Date().toISOString(),
      });
    }

    return newGoals;
  }, [diasTreinoSemana, currentStreak]);

  /**
   * Update goal progress
   */
  const updateGoalProgress = useCallback(
    (goalId: string, progress: number) => {
      const updatedGoals = goals.map((g) => {
        if (g.id === goalId && g.status === 'active') {
          const newProgress = Math.min(progress, g.target);
          const newStatus: GoalStatus = newProgress >= g.target ? 'completed' : 'active';
          return {
            ...g,
            progress: newProgress,
            status: newStatus,
            ...(newStatus === 'completed' ? { completedAt: new Date().toISOString() } : {}),
          };
        }
        return g;
      });

      onGoalsUpdate(updatedGoals);
    },
    [goals, onGoalsUpdate]
  );

  /**
   * Complete a goal manually
   */
  const completeGoal = useCallback(
    (goalId: string) => {
      const updatedGoals = goals.map((g) => {
        if (g.id === goalId && g.status === 'active') {
          return {
            ...g,
            progress: g.target,
            status: 'completed' as GoalStatus,
            completedAt: new Date().toISOString(),
          };
        }
        return g;
      });

      onGoalsUpdate(updatedGoals);
    },
    [goals, onGoalsUpdate]
  );

  /**
   * Add a custom goal
   */
  const addCustomGoal = useCallback(
    (goal: Omit<Goal, 'id' | 'status' | 'createdAt'>) => {
      const newGoal: Goal = {
        ...goal,
        id: `custom_${Date.now()}`,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      onGoalsUpdate([...goals, newGoal]);
    },
    [goals, onGoalsUpdate]
  );

  /**
   * Remove a goal
   */
  const removeGoal = useCallback(
    (goalId: string) => {
      onGoalsUpdate(goals.filter((g) => g.id !== goalId));
    },
    [goals, onGoalsUpdate]
  );

  /**
   * Refresh goals - update progress for existing goals and generate new ones if needed
   */
  const refreshGoals = useCallback(() => {
    const currentWeek = getCurrentWeek();
    const currentMonth = getCurrentMonth();

    // Check if we have current week/month goals
    const hasWeeklyGoal = goals.some(
      (g) => g.id.includes('weekly_workout') && g.id.includes(currentWeek)
    );
    const hasMonthlyGoal = goals.some(
      (g) => g.id.includes('monthly_workout') && g.id.includes(currentMonth)
    );

    let updatedGoals = [...goals];

    // Generate new goals if needed
    if (!hasWeeklyGoal || !hasMonthlyGoal) {
      const newGoals = generateDefaultGoals();
      const goalsToAdd = newGoals.filter(
        (newGoal) =>
          !goals.some((existingGoal) => existingGoal.id === newGoal.id)
      );
      updatedGoals = [...updatedGoals, ...goalsToAdd];
    }

    // Update streak goal progress
    updatedGoals = updatedGoals.map((g) => {
      if (g.id.includes('streak_goal')) {
        const newProgress = Math.min(currentStreak, g.target);
        const newStatus: GoalStatus = newProgress >= g.target ? 'completed' : 'active';
        return {
          ...g,
          progress: newProgress,
          status: newStatus,
          ...(newStatus === 'completed' && !g.completedAt
            ? { completedAt: new Date().toISOString() }
            : {}),
        };
      }
      return g;
    });

    // Keep only last 20 goals
    updatedGoals = updatedGoals
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20);

    onGoalsUpdate(updatedGoals);
  }, [goals, currentStreak, generateDefaultGoals, onGoalsUpdate]);

  return {
    activeGoals,
    completedGoals,
    goalsByCategory,
    completedCount,
    activeCount,
    overallProgress,
    generateDefaultGoals,
    updateGoalProgress,
    completeGoal,
    addCustomGoal,
    removeGoal,
    refreshGoals,
  };
}

/**
 * Get next streak milestone
 */
function getNextStreakMilestone(currentStreak: number): number | null {
  const milestones = [7, 14, 30, 60, 100, 200, 365];
  for (const milestone of milestones) {
    if (currentStreak < milestone) {
      return milestone;
    }
  }
  return null; // All milestones achieved
}
