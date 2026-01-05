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
  AnamneseStep,
  UserAnamnese,
  Exercise,
  Treino,
  Refeicao,
  Dieta,
  FitnessMessage,
  FitnessData,
  ActivityLevelConfig,
  AnamneseQuestionConfig,
  AnamneseParseResult,
  BMIClassification,
  MacrosResult,
} from './types';

// Hooks - export for potential reuse
export { useFitnessData } from './hooks/useFitnessData';
export { useAnamneseFlow } from './hooks/useAnamneseFlow';

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

export { generateWorkout, isWorkoutRequest } from './utils/workoutGenerator';
export { generateDiet, isDietRequest } from './utils/dietGenerator';

// Constants - export for potential customization
export {
  DEFAULT_ANAMNESE,
  ACTIVITY_LEVELS,
  ANAMNESE_QUESTIONS,
  ANAMNESE_ERROR_MESSAGES,
  INITIAL_MESSAGE,
  WORKOUT_TEMPLATES,
  DEFAULT_DIET_TEMPLATE,
  getActivityFactor,
  getActivityLevelName,
} from './constants';

// Services - export for direct usage
export { FitnessService } from './services/FitnessService';
