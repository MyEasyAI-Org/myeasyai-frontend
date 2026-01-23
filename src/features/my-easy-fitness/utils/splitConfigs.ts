/**
 * Split Configurations
 *
 * Declarative configuration for workout splits across all training modalities.
 * Replaces 6 duplicated getXXXSplit functions with a single data-driven approach.
 */

import type { TrainingModality } from '../types';

// Days of the week for workout scheduling
const DIAS = ['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'] as const;

// Type for split configuration entry
type SplitEntry<T extends string> = { template: T; dia: string };

// Type for split configuration by days per week
type SplitConfig<T extends string> = Record<number, SplitEntry<T>[]>;

// ============================================
// MUSCULACAO SPLIT CONFIG
// ============================================
const musculacaoSplits: SplitConfig<string> = {
  1: [{ template: 'full_body_a', dia: DIAS[0] }],
  2: [
    { template: 'full_body_a', dia: DIAS[0] },
    { template: 'full_body_b', dia: DIAS[3] },
  ],
  3: [
    { template: 'push_day', dia: DIAS[0] },
    { template: 'pull_day', dia: DIAS[2] },
    { template: 'legs_day', dia: DIAS[4] },
  ],
  4: [
    { template: 'upper_body', dia: DIAS[0] },
    { template: 'lower_body', dia: DIAS[1] },
    { template: 'upper_body', dia: DIAS[3] },
    { template: 'lower_body', dia: DIAS[4] },
  ],
  5: [
    { template: 'push_day', dia: DIAS[0] },
    { template: 'pull_day', dia: DIAS[1] },
    { template: 'legs_day', dia: DIAS[2] },
    { template: 'upper_body', dia: DIAS[3] },
    { template: 'lower_body', dia: DIAS[4] },
  ],
  6: [
    { template: 'push_day', dia: DIAS[0] },
    { template: 'pull_day', dia: DIAS[1] },
    { template: 'legs_day', dia: DIAS[2] },
    { template: 'push_day', dia: DIAS[3] },
    { template: 'pull_day', dia: DIAS[4] },
    { template: 'legs_day', dia: DIAS[5] },
  ],
};
// 7 days uses same config as 6
musculacaoSplits[7] = musculacaoSplits[6];

// ============================================
// CORRIDA SPLIT CONFIG
// ============================================
const corridaSplits: SplitConfig<string> = {
  1: [{ template: 'recuperacao', dia: DIAS[0] }],
  2: [
    { template: 'intervalado', dia: DIAS[0] },
    { template: 'longo', dia: DIAS[5] },
  ],
  3: [
    { template: 'intervalado', dia: DIAS[0] },
    { template: 'recuperacao', dia: DIAS[2] },
    { template: 'longo', dia: DIAS[5] },
  ],
  4: [
    { template: 'intervalado', dia: DIAS[0] },
    { template: 'recuperacao', dia: DIAS[1] },
    { template: 'tempo', dia: DIAS[3] },
    { template: 'longo', dia: DIAS[5] },
  ],
  5: [
    { template: 'intervalado', dia: DIAS[0] },
    { template: 'recuperacao', dia: DIAS[1] },
    { template: 'tempo', dia: DIAS[2] },
    { template: 'intervalado', dia: DIAS[3] },
    { template: 'longo', dia: DIAS[5] },
  ],
};
// 6 and 7 days use same config as 5
corridaSplits[6] = corridaSplits[5];
corridaSplits[7] = corridaSplits[5];

// ============================================
// CROSSFIT SPLIT CONFIG
// ============================================
const crossfitSplits: SplitConfig<string> = {
  1: [{ template: 'wod_amrap', dia: DIAS[0] }],
  2: [
    { template: 'wod_amrap', dia: DIAS[0] },
    { template: 'wod_fortime', dia: DIAS[3] },
  ],
  3: [
    { template: 'wod_amrap', dia: DIAS[0] },
    { template: 'wod_emom', dia: DIAS[2] },
    { template: 'wod_fortime', dia: DIAS[4] },
  ],
  4: [
    { template: 'wod_amrap', dia: DIAS[0] },
    { template: 'wod_emom', dia: DIAS[1] },
    { template: 'wod_fortime', dia: DIAS[2] },
    { template: 'wod_amrap', dia: DIAS[4] },
  ],
};
// 5, 6, 7 days use same config as 4
crossfitSplits[5] = crossfitSplits[4];
crossfitSplits[6] = crossfitSplits[4];
crossfitSplits[7] = crossfitSplits[4];

// ============================================
// CAMINHADA SPLIT CONFIG
// ============================================
const caminhadaSplits: SplitConfig<string> = {
  1: [{ template: 'leve', dia: DIAS[0] }],
  2: [
    { template: 'leve', dia: DIAS[0] },
    { template: 'moderada', dia: DIAS[3] },
  ],
  3: [
    { template: 'leve', dia: DIAS[0] },
    { template: 'moderada', dia: DIAS[2] },
    { template: 'intensa', dia: DIAS[5] },
  ],
  4: [
    { template: 'leve', dia: DIAS[0] },
    { template: 'moderada', dia: DIAS[1] },
    { template: 'leve', dia: DIAS[3] },
    { template: 'intensa', dia: DIAS[5] },
  ],
  5: [
    { template: 'leve', dia: DIAS[0] },
    { template: 'moderada', dia: DIAS[1] },
    { template: 'leve', dia: DIAS[3] },
    { template: 'intensa', dia: DIAS[5] },
  ],
  6: [
    { template: 'leve', dia: DIAS[0] },
    { template: 'moderada', dia: DIAS[1] },
    { template: 'leve', dia: DIAS[2] },
    { template: 'moderada', dia: DIAS[3] },
    { template: 'leve', dia: DIAS[4] },
    { template: 'intensa', dia: DIAS[5] },
  ],
};
// 7 days uses same config as 6
caminhadaSplits[7] = caminhadaSplits[6];

// ============================================
// FUNCIONAL SPLIT CONFIG
// ============================================
const funcionalSplits: SplitConfig<string> = {
  1: [{ template: 'circuito_a', dia: DIAS[0] }],
  2: [
    { template: 'circuito_a', dia: DIAS[0] },
    { template: 'circuito_b', dia: DIAS[3] },
  ],
  3: [
    { template: 'circuito_a', dia: DIAS[0] },
    { template: 'circuito_b', dia: DIAS[2] },
    { template: 'circuito_c', dia: DIAS[4] },
  ],
  4: [
    { template: 'circuito_a', dia: DIAS[0] },
    { template: 'circuito_b', dia: DIAS[1] },
    { template: 'circuito_c', dia: DIAS[3] },
    { template: 'circuito_a', dia: DIAS[4] },
  ],
  5: [
    { template: 'circuito_a', dia: DIAS[0] },
    { template: 'circuito_b', dia: DIAS[1] },
    { template: 'circuito_c', dia: DIAS[2] },
    { template: 'circuito_a', dia: DIAS[3] },
    { template: 'circuito_b', dia: DIAS[4] },
  ],
};
// 6 and 7 days use same config as 5
funcionalSplits[6] = funcionalSplits[5];
funcionalSplits[7] = funcionalSplits[5];

// ============================================
// CALISTENIA SPLIT CONFIG
// ============================================
const calisteniaSplits: SplitConfig<string> = {
  1: [{ template: 'full', dia: DIAS[0] }],
  2: [
    { template: 'upper', dia: DIAS[0] },
    { template: 'lower', dia: DIAS[3] },
  ],
  3: [
    { template: 'upper', dia: DIAS[0] },
    { template: 'lower', dia: DIAS[2] },
    { template: 'full', dia: DIAS[4] },
  ],
  4: [
    { template: 'upper', dia: DIAS[0] },
    { template: 'lower', dia: DIAS[1] },
    { template: 'full', dia: DIAS[3] },
    { template: 'upper', dia: DIAS[4] },
  ],
  5: [
    { template: 'upper', dia: DIAS[0] },
    { template: 'lower', dia: DIAS[1] },
    { template: 'full', dia: DIAS[2] },
    { template: 'upper', dia: DIAS[3] },
    { template: 'lower', dia: DIAS[4] },
  ],
};
// 6 and 7 days use same config as 5
calisteniaSplits[6] = calisteniaSplits[5];
calisteniaSplits[7] = calisteniaSplits[5];

// ============================================
// UNIFIED CONFIGURATION MAP
// ============================================
const SPLIT_CONFIGS: Record<TrainingModality, SplitConfig<string>> = {
  musculacao: musculacaoSplits,
  corrida: corridaSplits,
  crossfit: crossfitSplits,
  caminhada: caminhadaSplits,
  funcional: funcionalSplits,
  calistenia: calisteniaSplits,
  '': musculacaoSplits, // Default to musculacao for empty modality
};

// Default split (3 days) for each modality
const DEFAULT_DAYS = 3;

/**
 * Get the workout split configuration for a specific modality and number of days
 * @param modality Training modality (musculacao, corrida, etc.)
 * @param diasPorSemana Number of training days per week (1-7)
 * @returns Array of split entries with template and day
 */
export function getSplitForModality(
  modality: TrainingModality,
  diasPorSemana: number
): { template: string; dia: string }[] {
  const config = SPLIT_CONFIGS[modality];

  // Clamp days to valid range
  const days = Math.max(1, Math.min(7, diasPorSemana || DEFAULT_DAYS));

  // Return specific config or fall back to default (3 days)
  return config[days] ?? config[DEFAULT_DAYS];
}

export { SPLIT_CONFIGS };
