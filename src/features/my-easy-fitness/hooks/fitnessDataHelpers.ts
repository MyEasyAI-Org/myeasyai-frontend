/**
 * Fitness Data Helpers
 *
 * Utility functions and constants for fitness data management.
 */

import type { UserPersonalInfo } from '../types';

// Debounce delay for auto-save (in ms)
export const AUTO_SAVE_DELAY = 2000;

// Fields that trigger workout regeneration
export const WORKOUT_TRIGGER_FIELDS: (keyof UserPersonalInfo)[] = [
  'lesoes',
  'experienciaTreino',
  'diasTreinoSemana',
  'tempoTreinoMinutos',
  'preferenciaTreino',
];

// Fields that trigger diet regeneration
export const DIET_TRIGGER_FIELDS: (keyof UserPersonalInfo)[] = [
  'peso',
  'altura',
  'idade',
  'sexo',
  'objetivo',
  'nivelAtividade',
  'restricoesAlimentares',
  'comidasFavoritas',
  'comidasEvitar',
  'numeroRefeicoes',
  'horarioTreino',
];

/**
 * Check if specific fields changed between two personal info objects
 */
export function hasFieldsChanged(
  prev: UserPersonalInfo | null,
  current: UserPersonalInfo,
  fields: (keyof UserPersonalInfo)[]
): boolean {
  if (!prev) return false;

  for (const field of fields) {
    const prevValue = prev[field];
    const currValue = current[field];

    // Handle arrays
    if (Array.isArray(prevValue) && Array.isArray(currValue)) {
      if (prevValue.length !== currValue.length) return true;
      if (!prevValue.every((v, i) => v === currValue[i])) return true;
    } else if (prevValue !== currValue) {
      return true;
    }
  }

  return false;
}

/**
 * Check if user has minimum info to generate workouts
 */
export function canGenerateWorkouts(info: UserPersonalInfo): boolean {
  return !!(info.diasTreinoSemana && info.diasTreinoSemana > 0);
}

/**
 * Check if user has minimum info to generate diet
 * Requires diet preferences (numeroRefeicoes) to be set to prevent auto-generation on profile load
 */
export function canGenerateDiet(info: UserPersonalInfo): boolean {
  return !!(
    info.peso && info.peso > 0 &&
    info.altura && info.altura > 0 &&
    info.idade && info.idade > 0 &&
    info.numeroRefeicoes && info.numeroRefeicoes > 0
  );
}
