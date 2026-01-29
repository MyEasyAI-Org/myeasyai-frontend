/**
 * Activity Level Configuration
 *
 * Activity level definitions with Harris-Benedict factors.
 */

import type { ActivityLevel, ActivityLevelConfig } from '../types';

/**
 * Activity level configurations with Harris-Benedict factors
 */
export const ACTIVITY_LEVELS: ActivityLevelConfig[] = [
  {
    id: 'sedentario',
    name: 'Sedentário',
    description: 'Pouco ou nenhum exercício',
    factor: 1.2,
  },
  {
    id: 'leve',
    name: 'Levemente ativo',
    description: 'Exercício leve 1-3 dias/semana',
    factor: 1.375,
  },
  {
    id: 'moderado',
    name: 'Moderadamente ativo',
    description: 'Exercício moderado 3-5 dias/semana',
    factor: 1.55,
  },
  {
    id: 'intenso',
    name: 'Muito ativo',
    description: 'Exercício intenso 6-7 dias/semana',
    factor: 1.725,
  },
];

/**
 * Get activity level factor by ID
 */
export const getActivityFactor = (level: ActivityLevel): number => {
  const config = ACTIVITY_LEVELS.find((l) => l.id === level);
  return config?.factor ?? 1.4;
};

/**
 * Get activity level display name
 */
export const getActivityLevelName = (level: ActivityLevel): string => {
  const config = ACTIVITY_LEVELS.find((l) => l.id === level);
  return config?.name ?? level;
};
