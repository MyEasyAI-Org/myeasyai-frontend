/**
 * MyEasyFitness Constants
 *
 * Re-exports all constants from specialized modules.
 * Configuration and constant values for the fitness assistant module.
 */

// Default values
export { DEFAULT_PERSONAL_INFO, DEFAULT_DIET_TEMPLATE } from './defaultValues';

// Activity levels
export {
  ACTIVITY_LEVELS,
  getActivityFactor,
  getActivityLevelName,
} from './activityLevels';

// Chat messages
export {
  PERSONAL_INFO_QUESTIONS,
  PERSONAL_INFO_ERROR_MESSAGES,
  INITIAL_MESSAGE,
} from './chatMessages';

// Parsing keywords
export {
  INJURY_KEYWORDS,
  NEGATIVE_RESPONSES,
  SEX_KEYWORDS,
  GENDER_KEYWORDS,
} from './parsingKeywords';

// Training modality configuration
export { TRAINING_MODALITY_CONFIG } from './modalityConfig';

// Workout templates
export {
  WORKOUT_TEMPLATES,
  CORRIDA_TEMPLATES,
  CROSSFIT_TEMPLATES,
  CAMINHADA_TEMPLATES,
  FUNCIONAL_TEMPLATES,
  CALISTENIA_TEMPLATES,
  MODALITY_TEMPLATES,
} from './workoutTemplates';

// Injury alternatives
export { INJURY_EXERCISE_ALTERNATIVES } from './injuryAlternatives';

// Nutritional data
export {
  NUTRITIONAL_DATABASE,
  getNutritionalInfo,
  type NutritionalInfo,
} from './nutritionalData';

// Demo profiles
export { DEMO_PROFILES } from './demoProfiles';

// Gamification
export {
  XP_CONFIG,
  BADGES,
  BADGES_MAP,
  DAILY_CHALLENGE_TEMPLATES,
  WEEKLY_CHALLENGE_TEMPLATES,
  GOAL_TEMPLATES,
  RARITY_COLORS,
  ACTIVITY_ICONS,
  STREAK_MESSAGES,
  getStreakMessage,
} from './gamification';

// Watermark icons
export { MODALITY_WATERMARKS, TAB_WATERMARKS } from './watermarkIcons';
