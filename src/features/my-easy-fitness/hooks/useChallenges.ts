/**
 * useChallenges Hook
 *
 * Manages challenge generation, progress tracking, and completion.
 * Generates daily and weekly challenges based on user profile.
 */

import { useCallback, useMemo } from 'react';
import type { Challenge, ChallengeStatus } from '../types/gamification';
import {
  DAILY_CHALLENGE_TEMPLATES,
  WEEKLY_CHALLENGE_TEMPLATES,
} from '../constants/gamification';

interface UseChallengesProps {
  challenges: Challenge[];
  diasTreinoSemana: number;
  onChallengesUpdate: (challenges: Challenge[]) => void;
}

interface UseChallengesReturn {
  // Challenge collections
  activeChallenges: Challenge[];
  dailyChallenges: Challenge[];
  weeklyChallenges: Challenge[];
  completedToday: Challenge[];

  // Stats
  dailyProgress: { completed: number; total: number };
  weeklyProgress: { completed: number; total: number };

  // Actions
  generateDailyChallenges: () => Challenge[];
  generateWeeklyChallenges: () => Challenge[];
  updateChallengeProgress: (challengeId: string, progress: number) => void;
  completeChallenge: (challengeId: string) => void;
  expireOldChallenges: () => void;
  refreshChallengesIfNeeded: () => boolean;
}

/**
 * Get start of today (midnight)
 */
function getStartOfDay(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

/**
 * Get end of today (23:59:59)
 */
function getEndOfDay(): Date {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now;
}

/**
 * Get end of current week (Sunday 23:59:59)
 */
function getEndOfWeek(): Date {
  const now = new Date();
  const daysUntilSunday = 7 - now.getDay();
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);
  return endOfWeek;
}

/**
 * Check if a date is today
 */
function isToday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is within the current week
 */
function isThisWeek(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return date >= startOfWeek;
}

export function useChallenges({
  challenges,
  diasTreinoSemana,
  onChallengesUpdate,
}: UseChallengesProps): UseChallengesReturn {
  // Filter active challenges (not expired, not failed)
  const activeChallenges = useMemo(() => {
    const now = new Date();
    return challenges.filter(
      (c) =>
        (c.status === 'active' || c.status === 'completed') &&
        new Date(c.expiresAt) > now
    );
  }, [challenges]);

  // Daily challenges
  const dailyChallenges = useMemo(() => {
    return activeChallenges.filter((c) => c.type === 'daily' && isToday(c.createdAt));
  }, [activeChallenges]);

  // Weekly challenges
  const weeklyChallenges = useMemo(() => {
    return activeChallenges.filter((c) => c.type === 'weekly' && isThisWeek(c.createdAt));
  }, [activeChallenges]);

  // Completed today
  const completedToday = useMemo(() => {
    return challenges.filter((c) => c.status === 'completed' && isToday(c.createdAt));
  }, [challenges]);

  // Progress stats
  const dailyProgress = useMemo(() => ({
    completed: dailyChallenges.filter((c) => c.status === 'completed').length,
    total: dailyChallenges.length,
  }), [dailyChallenges]);

  const weeklyProgress = useMemo(() => ({
    completed: weeklyChallenges.filter((c) => c.status === 'completed').length,
    total: weeklyChallenges.length,
  }), [weeklyChallenges]);

  /**
   * Generate daily challenges
   */
  const generateDailyChallenges = useCallback((): Challenge[] => {
    const now = new Date();
    const endOfDay = getEndOfDay();

    const newChallenges: Challenge[] = DAILY_CHALLENGE_TEMPLATES.map((template) => ({
      id: `${template.id}_${now.toISOString().split('T')[0]}`,
      type: template.type,
      title: template.titleTemplate,
      description: template.descriptionTemplate,
      icon: template.icon,
      target: template.targetGenerator({ diasTreinoSemana }),
      progress: 0,
      xpReward: template.xpReward,
      status: 'active' as ChallengeStatus,
      createdAt: now.toISOString(),
      expiresAt: endOfDay.toISOString(),
    }));

    return newChallenges;
  }, [diasTreinoSemana]);

  /**
   * Generate weekly challenges
   */
  const generateWeeklyChallenges = useCallback((): Challenge[] => {
    const now = new Date();
    const endOfWeek = getEndOfWeek();

    const newChallenges: Challenge[] = WEEKLY_CHALLENGE_TEMPLATES.map((template) => {
      const target = template.targetGenerator({ diasTreinoSemana });
      return {
        id: `${template.id}_week_${now.toISOString().split('T')[0]}`,
        type: template.type,
        title: template.titleTemplate,
        description: template.descriptionTemplate.replace('{target}', String(target)),
        icon: template.icon,
        target,
        progress: 0,
        xpReward: template.xpReward,
        status: 'active' as ChallengeStatus,
        createdAt: now.toISOString(),
        expiresAt: endOfWeek.toISOString(),
      };
    });

    return newChallenges;
  }, [diasTreinoSemana]);

  /**
   * Update challenge progress
   */
  const updateChallengeProgress = useCallback(
    (challengeId: string, progress: number) => {
      const updatedChallenges = challenges.map((c) => {
        if (c.id === challengeId && c.status === 'active') {
          const newProgress = Math.min(progress, c.target);
          const newStatus: ChallengeStatus =
            newProgress >= c.target ? 'completed' : 'active';
          return { ...c, progress: newProgress, status: newStatus };
        }
        return c;
      });

      onChallengesUpdate(updatedChallenges);
    },
    [challenges, onChallengesUpdate]
  );

  /**
   * Complete a challenge manually
   */
  const completeChallenge = useCallback(
    (challengeId: string) => {
      const updatedChallenges = challenges.map((c) => {
        if (c.id === challengeId && c.status === 'active') {
          return { ...c, progress: c.target, status: 'completed' as ChallengeStatus };
        }
        return c;
      });

      onChallengesUpdate(updatedChallenges);
    },
    [challenges, onChallengesUpdate]
  );

  /**
   * Expire old challenges
   */
  const expireOldChallenges = useCallback(() => {
    const now = new Date();
    const updatedChallenges = challenges.map((c) => {
      if (c.status === 'active' && new Date(c.expiresAt) <= now) {
        return { ...c, status: 'expired' as ChallengeStatus };
      }
      return c;
    });

    // Keep only last 50 challenges (remove very old ones)
    const trimmedChallenges = updatedChallenges
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50);

    onChallengesUpdate(trimmedChallenges);
  }, [challenges, onChallengesUpdate]);

  /**
   * Refresh challenges if needed (new day/week)
   */
  const refreshChallengesIfNeeded = useCallback((): boolean => {
    let needsUpdate = false;
    let updatedChallenges = [...challenges];

    // Check if we need new daily challenges
    const hasTodaysDailyChallenges = dailyChallenges.length > 0;
    if (!hasTodaysDailyChallenges) {
      const newDaily = generateDailyChallenges();
      updatedChallenges = [...updatedChallenges, ...newDaily];
      needsUpdate = true;
    }

    // Check if we need new weekly challenges
    const hasThisWeeksChallenges = weeklyChallenges.length > 0;
    if (!hasThisWeeksChallenges) {
      const newWeekly = generateWeeklyChallenges();
      updatedChallenges = [...updatedChallenges, ...newWeekly];
      needsUpdate = true;
    }

    if (needsUpdate) {
      // Also expire old challenges
      const now = new Date();
      updatedChallenges = updatedChallenges.map((c) => {
        if (c.status === 'active' && new Date(c.expiresAt) <= now) {
          return { ...c, status: 'expired' as ChallengeStatus };
        }
        return c;
      });

      // Keep only last 50
      updatedChallenges = updatedChallenges
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 50);

      onChallengesUpdate(updatedChallenges);
    }

    return needsUpdate;
  }, [
    challenges,
    dailyChallenges,
    weeklyChallenges,
    generateDailyChallenges,
    generateWeeklyChallenges,
    onChallengesUpdate,
  ]);

  return {
    activeChallenges,
    dailyChallenges,
    weeklyChallenges,
    completedToday,
    dailyProgress,
    weeklyProgress,
    generateDailyChallenges,
    generateWeeklyChallenges,
    updateChallengeProgress,
    completeChallenge,
    expireOldChallenges,
    refreshChallengesIfNeeded,
  };
}
