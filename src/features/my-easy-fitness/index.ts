/**
 * MyEasyFitness Module
 *
 * Fitness and wellness module with AI-powered assistance for workouts,
 * diets, calories, supplements, mobility, and sports.
 *
 * Clean architecture with separated concerns:
 * - types/ for type definitions
 * - constants/ for configuration
 * - hooks/ for state management
 * - utils/ for business logic
 * - components/ for UI
 */

// Main component
export { MyEasyFitness } from './MyEasyFitness';

// Types - export all types for external use
export type {
  BiologicalSex,
  ActivityLevel,
  PersonalInfoStep,
  UserPersonalInfo,
  Exercise,
  Treino,
  Refeicao,
  Dieta,
  FitnessMessage,
  FitnessData,
  ActivityLevelConfig,
  PersonalInfoQuestionConfig,
  PersonalInfoParseResult,
  BMIClassification,
  MacrosResult,
} from './types';

// Hooks - export for potential reuse
export { useFitnessData } from './hooks/useFitnessData';
export { usePersonalInfoFlow } from './hooks/useAnamneseFlow';

// Utils - export for potential reuse
export {
  parseBasicInfo,
  parseMeasurements,
  parseObjective,
  parseActivityLevel,
  parseHealthInfo,
} from './utils/anamneseParser';

export {
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  calculateMacros,
  generateUserContext,
} from './utils/fitnessCalculations';

export { generatePersonalizedWorkoutPlan, isWorkoutRequest } from './utils/workoutGenerator';
export { generateDiet, isDietRequest } from './utils/dietGenerator';

// Constants - export for potential customization
export {
  DEFAULT_PERSONAL_INFO,
  ACTIVITY_LEVELS,
  PERSONAL_INFO_QUESTIONS,
  PERSONAL_INFO_ERROR_MESSAGES,
  INITIAL_MESSAGE,
  WORKOUT_TEMPLATES,
  DEFAULT_DIET_TEMPLATE,
  getActivityFactor,
  getActivityLevelName,
} from './constants';

// Services - export for direct usage
export { FitnessService } from './services/FitnessService';
