/**
 * Learning Gamification Constants
 */

import type { StudyBadge, StudyChallengeTemplate } from '../types/gamification';

// =============================================================================
// XP Configuration
// =============================================================================

export const XP_CONFIG = {
  REWARDS: {
    // Legacy task rewards
    TASK_COMPLETED: 25,
    LESSON_COMPLETED: 50, // Week completed (legacy)
    PRACTICE_SESSION: 30,

    // New AI Teaching Mode rewards
    SECTION_COMPLETED: 15, // Each theory section read
    QUIZ_PASSED: 35, // Pass quiz with 70%+
    QUIZ_PERFECT_SCORE: 50, // Get 100% on quiz
    EXERCISE_COMPLETED: 25, // Complete a practice exercise
    EXERCISE_NO_HINTS: 40, // Complete exercise without hints
    EXTERNAL_RESOURCE_ACCESSED: 20, // Access external resource
    LESSON_FULL_COMPLETED: 50, // Complete entire lesson (sections + quiz + exercises)
    FIRST_LESSON_BONUS: 100, // First lesson completed bonus

    // Challenge rewards
    CHALLENGE_DAILY_COMPLETED: 25,
    CHALLENGE_WEEKLY_COMPLETED: 100,

    // Streak rewards
    STREAK_7_DAYS: 100,
    STREAK_30_DAYS: 500,
    STREAK_100_DAYS: 1500,
    STREAK_365_DAYS: 5000,

    // Perfect completion rewards
    PERFECT_WEEK: 150,
    PERFECT_MONTH: 750,

    // Achievement rewards
    ACHIEVEMENT_EARNED: 50,
    GOAL_ACHIEVED: 100,
    FIRST_LESSON: 100,
    PLAN_COMPLETED: 500,
  },

  LEVEL_BASE_XP: 100,
  LEVEL_MULTIPLIER: 1.5,
  MAX_LEVEL: 100,
} as const;

// =============================================================================
// Badge Definitions (Legacy)
// =============================================================================

export const STUDY_BADGES: StudyBadge[] = [
  // Streak Badges
  {
    id: 'streak_7',
    name: 'Semana Dedicada',
    description: '7 dias consecutivos de estudo',
    category: 'streak',
    rarity: 'common',
    icon: 'BookOpen',
    requirement: { type: 'streak', value: 7 },
  },
  {
    id: 'streak_30',
    name: 'Estudante Comprometido',
    description: '30 dias consecutivos de estudo',
    category: 'streak',
    rarity: 'rare',
    icon: 'BookOpen',
    requirement: { type: 'streak', value: 30 },
  },
  {
    id: 'streak_100',
    name: 'Aprendiz Imparavel',
    description: '100 dias consecutivos de estudo',
    category: 'streak',
    rarity: 'epic',
    icon: 'BookOpen',
    requirement: { type: 'streak', value: 100 },
  },
  {
    id: 'streak_365',
    name: 'Mestre do Conhecimento',
    description: '365 dias consecutivos de estudo',
    category: 'streak',
    rarity: 'legendary',
    icon: 'Crown',
    requirement: { type: 'streak', value: 365 },
  },

  // Volume Badges
  {
    id: 'lessons_10',
    name: 'Primeiros Passos',
    description: 'Complete 10 semanas de estudo',
    category: 'volume',
    rarity: 'common',
    icon: 'GraduationCap',
    requirement: { type: 'total_lessons', value: 10 },
  },
  {
    id: 'lessons_50',
    name: 'Estudante Aplicado',
    description: 'Complete 50 semanas de estudo',
    category: 'volume',
    rarity: 'rare',
    icon: 'GraduationCap',
    requirement: { type: 'total_lessons', value: 50 },
  },
  {
    id: 'lessons_100',
    name: 'Academico',
    description: 'Complete 100 semanas de estudo',
    category: 'volume',
    rarity: 'epic',
    icon: 'Medal',
    requirement: { type: 'total_lessons', value: 100 },
  },
  {
    id: 'lessons_500',
    name: 'Erudito',
    description: 'Complete 500 semanas de estudo',
    category: 'volume',
    rarity: 'legendary',
    icon: 'Award',
    requirement: { type: 'total_lessons', value: 500 },
  },

  // Consistency Badges
  {
    id: 'perfect_week',
    name: 'Semana Exemplar',
    description: 'Complete todas as tarefas da semana',
    category: 'consistency',
    rarity: 'common',
    icon: 'CalendarCheck',
    requirement: { type: 'perfect_week', value: 1 },
  },
  {
    id: 'perfect_month',
    name: 'Mes Academico',
    description: 'Complete todas as tarefas do mes',
    category: 'consistency',
    rarity: 'epic',
    icon: 'Star',
    requirement: { type: 'perfect_month', value: 1 },
  },
];

export const STUDY_BADGES_MAP = new Map(STUDY_BADGES.map((badge) => [badge.id, badge]));

// =============================================================================
// Challenge Templates
// =============================================================================

export const DAILY_CHALLENGE_TEMPLATES: StudyChallengeTemplate[] = [
  {
    id: 'daily_task',
    type: 'daily',
    titleTemplate: 'Tarefa do Dia',
    descriptionTemplate: 'Complete pelo menos uma tarefa do seu plano',
    icon: 'BookOpen',
    targetGenerator: () => 1,
    xpReward: 25,
  },
  {
    id: 'daily_practice',
    type: 'daily',
    titleTemplate: 'Pratica Diaria',
    descriptionTemplate: 'Faca uma sessao de pratica ou exercicios',
    icon: 'PenTool',
    targetGenerator: () => 1,
    xpReward: 20,
  },
  {
    id: 'daily_review',
    type: 'daily',
    titleTemplate: 'Revisao',
    descriptionTemplate: 'Revise o conteudo estudado ontem',
    icon: 'RotateCcw',
    targetGenerator: () => 1,
    xpReward: 15,
  },
];

export const WEEKLY_CHALLENGE_TEMPLATES: StudyChallengeTemplate[] = [
  {
    id: 'weekly_tasks',
    type: 'weekly',
    titleTemplate: 'Meta Semanal',
    descriptionTemplate: 'Complete {target} tarefas esta semana',
    icon: 'Target',
    targetGenerator: (profile) => Math.max(profile.tasksPerWeek || 5, 3),
    xpReward: 100,
  },
  {
    id: 'weekly_consistency',
    type: 'weekly',
    titleTemplate: 'Consistencia',
    descriptionTemplate: 'Estude pelo menos 4 dias esta semana',
    icon: 'Calendar',
    targetGenerator: () => 4,
    xpReward: 75,
  },
  {
    id: 'weekly_perfect',
    type: 'weekly',
    titleTemplate: 'Semana Perfeita',
    descriptionTemplate: 'Complete TODAS as tarefas planejadas',
    icon: 'Star',
    targetGenerator: (profile) => profile.tasksPerWeek || 5,
    xpReward: 150,
  },
];

// =============================================================================
// Goal Templates
// =============================================================================

export const GOAL_TEMPLATES = {
  WEEKLY_TASKS: {
    titleTemplate: 'Meta Semanal de Tarefas',
    descriptionTemplate: 'Complete {target} tarefas por semana',
    category: 'lesson' as const,
    icon: 'BookOpen',
    unit: 'tarefas',
  },
  MONTHLY_LESSONS: {
    titleTemplate: 'Meta Mensal de Licoes',
    descriptionTemplate: 'Complete {target} semanas este mes',
    category: 'lesson' as const,
    icon: 'Calendar',
    unit: 'semanas',
  },
  STREAK_GOAL: {
    titleTemplate: 'Manter Sequencia',
    descriptionTemplate: 'Mantenha uma sequencia de {target} dias',
    category: 'consistency' as const,
    icon: 'Flame',
    unit: 'dias',
  },
  PLAN_COMPLETION: {
    titleTemplate: 'Completar Plano',
    descriptionTemplate: 'Complete 100% do seu plano de estudos',
    category: 'progress' as const,
    icon: 'Flag',
    unit: '%',
  },
} as const;

// =============================================================================
// Streak Messages
// =============================================================================

export const STREAK_MESSAGES = {
  0: 'Comece sua jornada de aprendizado hoje!',
  1: 'Primeiro dia! O conhecimento comeca aqui!',
  3: 'Tres dias seguidos! Esta criando o habito!',
  7: 'Uma semana! Voce e dedicado!',
  14: 'Duas semanas! O conhecimento esta florescendo!',
  30: 'Um mes! Voce e um estudante exemplar!',
  60: 'Dois meses! Impressionante dedicacao!',
  100: 'CEM DIAS! Voce e uma inspiracao!',
  365: 'UM ANO! Voce e um verdadeiro mestre!',
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

// =============================================================================
// Rarity and Activity Colors/Icons
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

export const ACTIVITY_ICONS = {
  lesson_completed: 'BookOpen',
  task_completed: 'CheckSquare',
  practice_session: 'PenTool',
  challenge_completed: 'Target',
  achievement_earned: 'Award',
  goal_achieved: 'Flag',
  streak_milestone: 'Flame',
  level_up: 'TrendingUp',
  week_completed: 'Calendar',
  plan_completed: 'GraduationCap',
} as const;

// =============================================================================
// Goal Category Configuration
// =============================================================================

export const GOAL_CATEGORY_COLORS = {
  lesson: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/50',
    text: 'text-blue-400',
    icon: 'text-blue-400',
  },
  consistency: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/50',
    text: 'text-green-400',
    icon: 'text-green-400',
  },
  practice: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/50',
    text: 'text-purple-400',
    icon: 'text-purple-400',
  },
  progress: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/50',
    text: 'text-amber-400',
    icon: 'text-amber-400',
  },
} as const;

export const GOAL_CATEGORY_LABELS = {
  lesson: 'Licoes',
  consistency: 'Consistencia',
  practice: 'Pratica',
  progress: 'Progresso',
} as const;
