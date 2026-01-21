/**
 * useStreaks Hook
 *
 * Manages streak calculation and updates.
 * Streak logic:
 * - If no lastActivityDate → streak = 1 (first activity)
 * - If lastActivityDate was today → keeps current streak
 * - If lastActivityDate was yesterday → streak + 1
 * - If lastActivityDate > 1 day ago → streak = 1 (reset)
 */

import { useCallback, useMemo } from 'react';
import type { StreakData } from '../types/gamification';

interface UseStreaksProps {
  streak: StreakData;
  onStreakUpdate: (newStreak: StreakData) => void;
}

interface UseStreaksReturn {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  totalActiveDays: number;
  isActiveToday: boolean;
  daysSinceLastActivity: number;
  updateStreakOnActivity: () => StreakData;
  resetStreak: () => StreakData;
}

/**
 * Get today's date in YYYY-MM-DD format (local timezone)
 */
function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Get yesterday's date in YYYY-MM-DD format (local timezone)
 */
function getYesterdayDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

/**
 * Calculate days between two date strings
 */
function daysBetween(dateStr1: string, dateStr2: string): number {
  const date1 = new Date(dateStr1);
  const date2 = new Date(dateStr2);
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function useStreaks({ streak, onStreakUpdate }: UseStreaksProps): UseStreaksReturn {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  // Check if user was active today
  const isActiveToday = useMemo(() => {
    return streak.lastActivityDate === today;
  }, [streak.lastActivityDate, today]);

  // Calculate days since last activity
  const daysSinceLastActivity = useMemo(() => {
    if (!streak.lastActivityDate) return -1; // Never active
    return daysBetween(streak.lastActivityDate, today);
  }, [streak.lastActivityDate, today]);

  /**
   * Updates streak when user completes an activity
   */
  const updateStreakOnActivity = useCallback((): StreakData => {
    const { lastActivityDate, currentStreak, longestStreak, totalActiveDays } = streak;

    let newCurrentStreak: number;
    let newTotalActiveDays = totalActiveDays;

    // Case 1: First ever activity
    if (!lastActivityDate) {
      newCurrentStreak = 1;
      newTotalActiveDays = 1;
    }
    // Case 2: Already active today - no change
    else if (lastActivityDate === today) {
      return streak; // No update needed
    }
    // Case 3: Was active yesterday - increment streak
    else if (lastActivityDate === yesterday) {
      newCurrentStreak = currentStreak + 1;
      newTotalActiveDays = totalActiveDays + 1;
    }
    // Case 4: Was active before yesterday - reset streak
    else {
      newCurrentStreak = 1;
      newTotalActiveDays = totalActiveDays + 1;
    }

    const newLongestStreak = Math.max(longestStreak, newCurrentStreak);

    const newStreak: StreakData = {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastActivityDate: today,
      totalActiveDays: newTotalActiveDays,
    };

    onStreakUpdate(newStreak);
    return newStreak;
  }, [streak, today, yesterday, onStreakUpdate]);

  /**
   * Resets the streak to 0 (used when streak is lost)
   */
  const resetStreak = useCallback((): StreakData => {
    const newStreak: StreakData = {
      currentStreak: 0,
      longestStreak: streak.longestStreak,
      lastActivityDate: streak.lastActivityDate,
      totalActiveDays: streak.totalActiveDays,
    };

    onStreakUpdate(newStreak);
    return newStreak;
  }, [streak, onStreakUpdate]);

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastActivityDate: streak.lastActivityDate,
    totalActiveDays: streak.totalActiveDays,
    isActiveToday,
    daysSinceLastActivity,
    updateStreakOnActivity,
    resetStreak,
  };
}

/**
 * Utility function to check if streak should be considered "at risk"
 * (last activity was yesterday, so today is the last chance to maintain it)
 */
export function isStreakAtRisk(lastActivityDate: string | null): boolean {
  if (!lastActivityDate) return false;
  return lastActivityDate === getYesterdayDateString();
}

/**
 * Utility function to check if streak was lost
 * (last activity was more than 1 day ago)
 */
export function isStreakLost(lastActivityDate: string | null, currentStreak: number): boolean {
  if (!lastActivityDate || currentStreak === 0) return false;
  const today = getTodayDateString();
  return daysBetween(lastActivityDate, today) > 1;
}
