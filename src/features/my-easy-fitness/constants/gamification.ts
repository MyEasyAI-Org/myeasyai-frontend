/**
 * Gamification Constants
 *
 * Configuration for XP, badges, challenges, and goals.
 */

import type { Badge, ChallengeTemplate } from '../types/gamification';

// =============================================================================
// XP Configuration
// =============================================================================

export const XP_CONFIG = {
  // XP rewards for actions
  REWARDS: {
    WORKOUT_COMPLETED: 50,
    CHALLENGE_DAILY_COMPLETED: 25,
    CHALLENGE_WEEKLY_COMPLETED: 100,
    STREAK_7_DAYS: 100,
    STREAK_30_DAYS: 500,
    STREAK_100_DAYS: 1500,
    STREAK_365_DAYS: 5000,
    PERFECT_WEEK: 150,
    PERFECT_MONTH: 750,
    BADGE_EARNED: 50,
    GOAL_ACHIEVED: 100,
    FIRST_WORKOUT: 100,
    PROFILE_COMPLETE: 50,
  },

  // Level progression (base XP, increases by 1.5x each level)
  LEVEL_BASE_XP: 100,
  LEVEL_MULTIPLIER: 1.5,
  MAX_LEVEL: 100,
} as const;

// =============================================================================
// Badge Definitions
// =============================================================================

export const BADGES: Badge[] = [
  // Streak Badges
  {
    id: 'streak_7',
    name: 'Semana de Fogo',
    description: '7 dias consecutivos de treino',
    category: 'streak',
    rarity: 'common',
    icon: 'Flame',
    requirement: { type: 'streak', value: 7 },
  },
  {
    id: 'streak_30',
    name: 'Dedicado',
    description: '30 dias consecutivos de treino',
    category: 'streak',
    rarity: 'rare',
    icon: 'Flame',
    requirement: { type: 'streak', value: 30 },
  },
  {
    id: 'streak_100',
    name: 'Imparavel',
    description: '100 dias consecutivos de treino',
    category: 'streak',
    rarity: 'epic',
    icon: 'Flame',
    requirement: { type: 'streak', value: 100 },
  },
  {
    id: 'streak_365',
    name: 'Lendario',
    description: '365 dias consecutivos de treino',
    category: 'streak',
    rarity: 'legendary',
    icon: 'Crown',
    requirement: { type: 'streak', value: 365 },
  },

  // Volume Badges (Total Workouts)
  {
    id: 'workouts_10',
    name: 'Iniciante',
    description: 'Complete 10 treinos',
    category: 'volume',
    rarity: 'common',
    icon: 'Dumbbell',
    requirement: { type: 'total_workouts', value: 10 },
  },
  {
    id: 'workouts_50',
    name: 'Praticante',
    description: 'Complete 50 treinos',
    category: 'volume',
    rarity: 'rare',
    icon: 'Dumbbell',
    requirement: { type: 'total_workouts', value: 50 },
  },
  {
    id: 'workouts_100',
    name: 'Atleta',
    description: 'Complete 100 treinos',
    category: 'volume',
    rarity: 'epic',
    icon: 'Medal',
    requirement: { type: 'total_workouts', value: 100 },
  },
  {
    id: 'workouts_500',
    name: 'Mestre',
    description: 'Complete 500 treinos',
    category: 'volume',
    rarity: 'legendary',
    icon: 'Trophy',
    requirement: { type: 'total_workouts', value: 500 },
  },

  // Consistency Badges
  {
    id: 'perfect_week',
    name: 'Semana Perfeita',
    description: 'Complete todos os treinos planejados na semana',
    category: 'consistency',
    rarity: 'common',
    icon: 'CalendarCheck',
    requirement: { type: 'perfect_week', value: 1 },
  },
  {
    id: 'perfect_week_5',
    name: 'Consistente',
    description: '5 semanas perfeitas',
    category: 'consistency',
    rarity: 'rare',
    icon: 'CalendarCheck',
    requirement: { type: 'perfect_week', value: 5 },
  },
  {
    id: 'perfect_month',
    name: 'Mes Perfeito',
    description: 'Complete todos os treinos planejados no mes',
    category: 'consistency',
    rarity: 'epic',
    icon: 'Star',
    requirement: { type: 'perfect_month', value: 1 },
  },
  {
    id: 'perfect_month_3',
    name: 'Disciplinado',
    description: '3 meses perfeitos',
    category: 'consistency',
    rarity: 'legendary',
    icon: 'Stars',
    requirement: { type: 'perfect_month', value: 3 },
  },

  // Special Badges
  {
    id: 'first_workout',
    name: 'Primeiro Passo',
    description: 'Complete seu primeiro treino',
    category: 'special',
    rarity: 'common',
    icon: 'Footprints',
    requirement: { type: 'special', value: 1 },
  },
  {
    id: 'profile_complete',
    name: 'Perfil Completo',
    description: 'Complete todas as informacoes do seu perfil',
    category: 'special',
    rarity: 'common',
    icon: 'UserCheck',
    requirement: { type: 'special', value: 1 },
  },
  {
    id: 'early_bird',
    name: 'Madrugador',
    description: 'Complete um treino antes das 7h',
    category: 'special',
    rarity: 'rare',
    icon: 'Sunrise',
    requirement: { type: 'special', value: 1 },
  },
  {
    id: 'night_owl',
    name: 'Coruja Noturna',
    description: 'Complete um treino apos as 22h',
    category: 'special',
    rarity: 'rare',
    icon: 'Moon',
    requirement: { type: 'special', value: 1 },
  },
  {
    id: 'comeback',
    name: 'Retorno Triunfante',
    description: 'Volte a treinar apos 30 dias de inatividade',
    category: 'special',
    rarity: 'rare',
    icon: 'RotateCcw',
    requirement: { type: 'special', value: 1 },
  },
];

// Map for quick badge lookup by ID
export const BADGES_MAP = new Map(BADGES.map((badge) => [badge.id, badge]));

// =============================================================================
// Challenge Templates
// =============================================================================

export const DAILY_CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    id: 'daily_workout',
    type: 'daily',
    titleTemplate: 'Treino do Dia',
    descriptionTemplate: 'Complete seu treino hoje',
    icon: 'Dumbbell',
    targetGenerator: () => 1,
    xpReward: 25,
  },
  {
    id: 'daily_hydration',
    type: 'daily',
    titleTemplate: 'Hidratacao',
    descriptionTemplate: 'Registre que bebeu agua suficiente hoje',
    icon: 'Droplet',
    targetGenerator: () => 1,
    xpReward: 15,
  },
  {
    id: 'daily_diet',
    type: 'daily',
    titleTemplate: 'Seguir Dieta',
    descriptionTemplate: 'Siga seu plano alimentar hoje',
    icon: 'Salad',
    targetGenerator: () => 1,
    xpReward: 20,
  },
];

export const WEEKLY_CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    id: 'weekly_workouts',
    type: 'weekly',
    titleTemplate: 'Meta Semanal',
    descriptionTemplate: 'Complete {target} treinos esta semana',
    icon: 'Target',
    targetGenerator: (profile) => Math.max(profile.diasTreinoSemana || 3, 2),
    xpReward: 100,
  },
  {
    id: 'weekly_consistency',
    type: 'weekly',
    titleTemplate: 'Consistencia',
    descriptionTemplate: 'Treine em dias alternados (min 3 treinos)',
    icon: 'Calendar',
    targetGenerator: () => 3,
    xpReward: 75,
  },
  {
    id: 'weekly_perfect',
    type: 'weekly',
    titleTemplate: 'Semana Perfeita',
    descriptionTemplate: 'Complete TODOS os treinos planejados',
    icon: 'Star',
    targetGenerator: (profile) => profile.diasTreinoSemana || 3,
    xpReward: 150,
  },
];

// =============================================================================
// Goal Templates
// =============================================================================

export const GOAL_TEMPLATES = {
  // Workout goals based on diasTreinoSemana
  WEEKLY_WORKOUT: {
    titleTemplate: 'Meta Semanal de Treinos',
    descriptionTemplate: 'Complete {target} treinos por semana',
    category: 'workout' as const,
    icon: 'Dumbbell',
    unit: 'treinos',
  },

  // Monthly workout volume
  MONTHLY_WORKOUT: {
    titleTemplate: 'Meta Mensal de Treinos',
    descriptionTemplate: 'Complete {target} treinos este mes',
    category: 'workout' as const,
    icon: 'Calendar',
    unit: 'treinos',
  },

  // Streak goals
  STREAK_GOAL: {
    titleTemplate: 'Manter Sequencia',
    descriptionTemplate: 'Mantenha uma sequencia de {target} dias',
    category: 'consistency' as const,
    icon: 'Flame',
    unit: 'dias',
  },

  // Consistency goal
  CONSISTENCY_GOAL: {
    titleTemplate: 'Consistencia Mensal',
    descriptionTemplate: 'Treine pelo menos 80% dos dias planejados',
    category: 'consistency' as const,
    icon: 'CheckCircle',
    unit: '%',
  },
} as const;

// =============================================================================
// Rarity Colors
// =============================================================================

export const RARITY_COLORS = {
  common: {
    bg: 'bg-slate-500/20',
    border: 'border-slate-500/50',
    text: 'text-slate-300',
    glow: 'shadow-slate-500/20',
  },
  rare: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/50',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/30',
  },
  epic: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/50',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/30',
  },
  legendary: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/50',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/40',
  },
} as const;

// =============================================================================
// Activity Icons
// =============================================================================

export const ACTIVITY_ICONS = {
  workout_completed: 'Dumbbell',
  challenge_completed: 'Target',
  badge_earned: 'Award',
  goal_achieved: 'Flag',
  streak_milestone: 'Flame',
  level_up: 'TrendingUp',
  diet_followed: 'Salad',
} as const;

// =============================================================================
// Streak Messages
// =============================================================================

export const STREAK_MESSAGES = {
  0: 'Comece sua jornada hoje!',
  1: 'Primeiro dia! Continue assim!',
  3: 'Tres dias seguidos! Voce esta pegando o ritmo!',
  7: 'Uma semana inteira! Incrivel!',
  14: 'Duas semanas! Voce esta criando um habito!',
  30: 'Um mes! Voce e imparavel!',
  60: 'Dois meses! Lendario!',
  100: 'CEM DIAS! Voce e uma inspiracao!',
  365: 'UM ANO! Voce e um verdadeiro atleta!',
} as const;

export function getStreakMessage(streak: number): string {
  const milestones = Object.keys(STREAK_MESSAGES)
    .map(Number)
    .sort((a, b) => b - a);

  for (const milestone of milestones) {
    if (streak >= milestone) {
      return STREAK_MESSAGES[milestone as keyof typeof STREAK_MESSAGES];
    }
  }

  return STREAK_MESSAGES[0];
}
