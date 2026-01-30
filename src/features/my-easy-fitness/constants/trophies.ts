/**
 * Trophy Definitions
 *
 * Configuration for all trophies with tier progression (Bronze → Silver → Gold).
 */

import type { Trophy } from '../types/trophies';

// =============================================================================
// Trophy Definitions
// =============================================================================

export const TROPHIES: Trophy[] = [
  // -------------------------------------------------------------------------
  // Streak Category
  // -------------------------------------------------------------------------
  {
    id: 'streak_fire',
    name: 'Energia Constante',
    category: 'streak',
    icon: 'Flame',
    metric: 'streak_days',
    tiers: [
      {
        tier: 'bronze',
        name: 'Energia Constante I',
        description: '7 dias consecutivos de treino',
        requirement: 7,
        xpReward: 100,
      },
      {
        tier: 'silver',
        name: 'Energia Constante II',
        description: '30 dias consecutivos de treino',
        requirement: 30,
        xpReward: 300,
      },
      {
        tier: 'gold',
        name: 'Energia Constante III',
        description: '100 dias consecutivos de treino',
        requirement: 100,
        xpReward: 1000,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Volume Category
  // -------------------------------------------------------------------------
  {
    id: 'volume_marathon',
    name: 'Maratonista',
    category: 'volume',
    icon: 'Trophy',
    metric: 'total_workouts',
    tiers: [
      {
        tier: 'bronze',
        name: 'Maratonista Bronze',
        description: 'Complete 25 treinos',
        requirement: 25,
        xpReward: 150,
      },
      {
        tier: 'silver',
        name: 'Maratonista Prata',
        description: 'Complete 100 treinos',
        requirement: 100,
        xpReward: 500,
      },
      {
        tier: 'gold',
        name: 'Maratonista Ouro',
        description: 'Complete 500 treinos',
        requirement: 500,
        xpReward: 2000,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Consistency Category
  // -------------------------------------------------------------------------
  {
    id: 'consistency_week',
    name: 'Semana Perfeita',
    category: 'consistency',
    icon: 'CalendarCheck',
    metric: 'perfect_weeks',
    tiers: [
      {
        tier: 'bronze',
        name: 'Semana Perfeita I',
        description: '1 semana perfeita',
        requirement: 1,
        xpReward: 100,
      },
      {
        tier: 'silver',
        name: 'Semana Perfeita II',
        description: '5 semanas perfeitas',
        requirement: 5,
        xpReward: 250,
      },
      {
        tier: 'gold',
        name: 'Semana Perfeita III',
        description: '20 semanas perfeitas',
        requirement: 20,
        xpReward: 750,
      },
    ],
  },
  {
    id: 'consistency_month',
    name: 'Mes de Ferro',
    category: 'consistency',
    icon: 'Star',
    metric: 'perfect_months',
    tiers: [
      {
        tier: 'bronze',
        name: 'Mes de Ferro I',
        description: '1 mes perfeito',
        requirement: 1,
        xpReward: 200,
      },
      {
        tier: 'silver',
        name: 'Mes de Ferro II',
        description: '3 meses perfeitos',
        requirement: 3,
        xpReward: 500,
      },
      {
        tier: 'gold',
        name: 'Mes de Ferro III',
        description: '12 meses perfeitos',
        requirement: 12,
        xpReward: 1500,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Variety Category
  // -------------------------------------------------------------------------
  {
    id: 'variety_explorer',
    name: 'Explorador',
    category: 'variety',
    icon: 'Compass',
    metric: 'workout_modalities',
    tiers: [
      {
        tier: 'bronze',
        name: 'Explorador Bronze',
        description: 'Treine 3 modalidades diferentes',
        requirement: 3,
        xpReward: 100,
      },
      {
        tier: 'silver',
        name: 'Explorador Prata',
        description: 'Treine 5 modalidades diferentes',
        requirement: 5,
        xpReward: 250,
      },
      {
        tier: 'gold',
        name: 'Explorador Ouro',
        description: 'Treine 8 modalidades diferentes',
        requirement: 8,
        xpReward: 500,
      },
    ],
  },
  {
    id: 'variety_early',
    name: 'Madrugador',
    category: 'variety',
    icon: 'Sunrise',
    metric: 'early_workouts',
    tiers: [
      {
        tier: 'bronze',
        name: 'Madrugador Bronze',
        description: '5 treinos antes das 7h',
        requirement: 5,
        xpReward: 75,
      },
      {
        tier: 'silver',
        name: 'Madrugador Prata',
        description: '20 treinos antes das 7h',
        requirement: 20,
        xpReward: 200,
      },
      {
        tier: 'gold',
        name: 'Madrugador Ouro',
        description: '50 treinos antes das 7h',
        requirement: 50,
        xpReward: 500,
      },
    ],
  },
  {
    id: 'variety_night',
    name: 'Coruja Noturna',
    category: 'variety',
    icon: 'Moon',
    metric: 'night_workouts',
    tiers: [
      {
        tier: 'bronze',
        name: 'Coruja Noturna Bronze',
        description: '5 treinos apos as 21h',
        requirement: 5,
        xpReward: 75,
      },
      {
        tier: 'silver',
        name: 'Coruja Noturna Prata',
        description: '20 treinos apos as 21h',
        requirement: 20,
        xpReward: 200,
      },
      {
        tier: 'gold',
        name: 'Coruja Noturna Ouro',
        description: '50 treinos apos as 21h',
        requirement: 50,
        xpReward: 500,
      },
    ],
  },
  {
    id: 'variety_diet',
    name: 'Dieta em Dia',
    category: 'variety',
    icon: 'Salad',
    metric: 'diet_days',
    tiers: [
      {
        tier: 'bronze',
        name: 'Dieta em Dia I',
        description: '7 dias seguindo a dieta',
        requirement: 7,
        xpReward: 100,
      },
      {
        tier: 'silver',
        name: 'Dieta em Dia II',
        description: '30 dias seguindo a dieta',
        requirement: 30,
        xpReward: 300,
      },
      {
        tier: 'gold',
        name: 'Dieta em Dia III',
        description: '90 dias seguindo a dieta',
        requirement: 90,
        xpReward: 750,
      },
    ],
  },
];

// =============================================================================
// Trophy Helpers
// =============================================================================

/**
 * Map for quick trophy lookup by ID
 */
export const TROPHIES_MAP = new Map(TROPHIES.map((trophy) => [trophy.id, trophy]));

/**
 * Get trophy by ID
 */
export function getTrophyById(id: string): Trophy | undefined {
  return TROPHIES_MAP.get(id);
}

/**
 * Get all trophies in a category
 */
export function getTrophiesByCategory(
  category: Trophy['category']
): Trophy[] {
  return TROPHIES.filter((trophy) => trophy.category === category);
}

/**
 * Category labels for display
 */
export const TROPHY_CATEGORY_LABELS: Record<Trophy['category'], string> = {
  streak: 'Sequencia',
  volume: 'Volume',
  consistency: 'Consistencia',
  variety: 'Variedade',
};

/**
 * Category icons for display
 */
export const TROPHY_CATEGORY_ICONS: Record<Trophy['category'], string> = {
  streak: 'Flame',
  volume: 'Dumbbell',
  consistency: 'CalendarCheck',
  variety: 'Compass',
};
