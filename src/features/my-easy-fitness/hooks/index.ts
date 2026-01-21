/**
 * MyEasyFitness Hooks
 *
 * Re-exports all custom hooks.
 */

export { useFitnessData } from './useFitnessData';
export { usePersonalInfoFlow } from './useAnamneseFlow';

// Internal hooks (used by useFitnessData)
export { useAutoSave } from './useAutoSave';
export type { ChangeType } from './useAutoSave';
export { useWorkoutManager } from './useWorkoutManager';
export { useDietManager } from './useDietManager';

// Helper functions and constants
export {
  AUTO_SAVE_DELAY,
  WORKOUT_TRIGGER_FIELDS,
  DIET_TRIGGER_FIELDS,
  hasFieldsChanged,
  canGenerateWorkouts,
  canGenerateDiet,
} from './fitnessDataHelpers';

// Gamification hooks
export { useGamification } from './useGamification';
export { useStreaks, isStreakAtRisk, isStreakLost } from './useStreaks';
export { useBadges, getNextMilestone } from './useBadges';
export { useChallenges } from './useChallenges';
export { useGoals } from './useGoals';
export { useAutoSaveGamification, useSaveOnUnload } from './useAutoSaveGamification';
