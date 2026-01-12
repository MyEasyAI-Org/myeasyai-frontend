/**
 * Workout Generator
 *
 * Functions to generate personalized workout plans based on user profile.
 * Now creates truly personalized workouts based on:
 * - Training modality (musculação, corrida, crossfit, caminhada, funcional, calistenia)
 * - Days per week available
 * - Time per session
 * - Experience level
 * - Injuries
 */

import type { Exercise, Treino, UserPersonalInfo, TrainingModality, WorkoutModification, ExerciseAlternative } from '../types';
import {
  INJURY_EXERCISE_ALTERNATIVES,
  WORKOUT_TEMPLATES,
  CORRIDA_TEMPLATES,
  CROSSFIT_TEMPLATES,
  CAMINHADA_TEMPLATES,
  FUNCIONAL_TEMPLATES,
  CALISTENIA_TEMPLATES,
  TRAINING_MODALITY_CONFIG,
} from '../constants';

/**
 * Check if an exercise should be avoided based on injuries
 */
function shouldAvoidExercise(exerciseName: string, lesoes: string[]): boolean {
  const lowerName = exerciseName.toLowerCase();

  for (const lesao of lesoes) {
    const lowerLesao = lesao.toLowerCase();

    for (const [injuryType, config] of Object.entries(INJURY_EXERCISE_ALTERNATIVES)) {
      if (lowerLesao.includes(injuryType)) {
        if (config.avoid.some((avoid) => lowerName.includes(avoid))) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Get alternative exercise for an injury
 */
function getAlternativeExercise(
  originalExercise: Exercise,
  lesoes: string[]
): Exercise | null {
  for (const lesao of lesoes) {
    const lowerLesao = lesao.toLowerCase();

    for (const [injuryType, config] of Object.entries(INJURY_EXERCISE_ALTERNATIVES)) {
      if (lowerLesao.includes(injuryType)) {
        if (
          config.avoid.some((avoid) =>
            originalExercise.nome.toLowerCase().includes(avoid)
          )
        ) {
          // Return first available alternative
          if (config.alternatives.length > 0) {
            return {
              ...originalExercise,
              nome: config.alternatives[0],
              series: originalExercise.series,
              repeticoes: '12-15', // Usually lighter reps for alternatives
              descanso: '60s',
            };
          }
        }
      }
    }
  }

  return null;
}

/**
 * Adjust workout intensity based on activity level and experience
 */
function adjustForExperience(
  exercicios: Exercise[],
  experienciaTreino: string,
  nivelAtividade: string
): Exercise[] {
  // Use experience if available, otherwise fallback to activity level
  const level = experienciaTreino || nivelAtividade;

  // Reduce sets for beginners
  if (level === 'iniciante' || level === 'sedentario' || level === 'leve') {
    return exercicios.map((e) => ({
      ...e,
      series: Math.max(2, e.series - 1),
      repeticoes: '10-15', // Higher reps, lighter weight for beginners
      descanso: '90s', // More rest for beginners
      observacao: e.observacao || 'Foque na execucao correta',
    }));
  }

  // Standard for intermediate
  if (level === 'intermediario' || level === 'moderado') {
    return exercicios;
  }

  // Increase intensity for advanced
  if (level === 'avancado' || level === 'intenso') {
    return exercicios.map((e) => ({
      ...e,
      series: e.series + 1,
      repeticoes: '6-10', // Lower reps, heavier weight for advanced
      descanso: '60s', // Less rest for advanced
    }));
  }

  return exercicios;
}

/**
 * Adjust number of exercises based on available time
 */
function adjustForTime(exercicios: Exercise[], tempoMinutos: number): Exercise[] {
  if (!tempoMinutos || tempoMinutos === 0) {
    return exercicios; // No adjustment if time not specified
  }

  // Estimate ~8-10 min per exercise (including rest)
  const maxExercises = Math.floor(tempoMinutos / 8);

  if (exercicios.length > maxExercises) {
    // Prioritize compound exercises (usually first in list)
    return exercicios.slice(0, Math.max(3, maxExercises));
  }

  return exercicios;
}

/**
 * Adjust workout parameters based on user's goal
 * - hipertrofia/massa: mais volume, 8-12 reps
 * - forca: menos reps, mais descanso
 * - emagrecimento/definicao: mais reps, menos descanso
 * - condicionamento: circuito style
 */
function adjustForGoal(exercicios: Exercise[], objetivo: string): Exercise[] {
  if (!objetivo) return exercicios;

  const lowerObjetivo = objetivo.toLowerCase();

  // Hipertrofia / Ganhar massa
  if (lowerObjetivo.includes('massa') || lowerObjetivo.includes('hipertrofia') || lowerObjetivo.includes('muscul')) {
    return exercicios.map((e) => ({
      ...e,
      series: Math.max(3, e.series),
      repeticoes: '8-12',
      descanso: '90s',
      observacao: e.observacao || 'Foco em contracao muscular',
    }));
  }

  // Forca
  if (lowerObjetivo.includes('forca') || lowerObjetivo.includes('força') || lowerObjetivo.includes('forte')) {
    return exercicios.map((e) => ({
      ...e,
      series: Math.min(5, e.series + 1),
      repeticoes: '4-6',
      descanso: '180s',
      observacao: e.observacao || 'Carga maxima com boa forma',
    }));
  }

  // Emagrecimento / Definicao
  if (lowerObjetivo.includes('emagrec') || lowerObjetivo.includes('definic') || lowerObjetivo.includes('perder') || lowerObjetivo.includes('gordura')) {
    return exercicios.map((e) => ({
      ...e,
      series: Math.max(3, e.series),
      repeticoes: '12-15',
      descanso: '45s',
      observacao: e.observacao || 'Manter ritmo elevado',
    }));
  }

  // Condicionamento
  if (lowerObjetivo.includes('condicionamento') || lowerObjetivo.includes('resistencia') || lowerObjetivo.includes('resistência')) {
    return exercicios.map((e) => ({
      ...e,
      series: Math.max(3, e.series),
      repeticoes: '15-20',
      descanso: '30s',
      observacao: e.observacao || 'Sem pausa longa entre exercicios',
    }));
  }

  // Manter forma (padrao)
  return exercicios;
}

/**
 * Exercises that require gym equipment (machines, cables, barbells)
 * These will be filtered out for home workouts
 */
const GYM_ONLY_EXERCISES = [
  'leg press', 'hack', 'smith', 'puxada', 'pulley', 'crossover',
  'peck deck', 'extensora', 'flexora', 'remada baixa', 'cabo',
  'maquina', 'aparelho', 'graviton', 'glr',
];

/**
 * Alternative bodyweight exercises for home workouts
 */
const HOME_ALTERNATIVES: Record<string, string> = {
  'supino reto': 'Flexao de Braço',
  'supino inclinado': 'Flexao Inclinada',
  'puxada frontal': 'Barra Fixa (ou Australiana)',
  'remada baixa': 'Remada com Elastico',
  'remada curvada': 'Remada Invertida',
  'leg press': 'Agachamento com Salto',
  'cadeira extensora': 'Afundo',
  'cadeira flexora': 'Stiff Unilateral',
  'triceps pulley': 'Triceps no banco',
  'desenvolvimento': 'Pike Push-up',
  'elevacao lateral': 'Elevacao Lateral com Elastico',
  'rosca direta': 'Rosca com Elastico',
};

/**
 * Filter exercises based on training location (gym vs home)
 * Home workouts prioritize bodyweight exercises
 */
function filterByEquipment(exercicios: Exercise[], localTreino: string): Exercise[] {
  if (!localTreino || localTreino === 'academia') {
    return exercicios; // No filtering for gym workouts
  }

  // For home workouts, replace gym-only exercises
  return exercicios.map((e) => {
    const lowerNome = e.nome.toLowerCase();

    // Check if this is a gym-only exercise
    const isGymOnly = GYM_ONLY_EXERCISES.some((gym) => lowerNome.includes(gym));

    if (isGymOnly) {
      // Find an alternative
      for (const [gymEx, homeEx] of Object.entries(HOME_ALTERNATIVES)) {
        if (lowerNome.includes(gymEx)) {
          return {
            ...e,
            nome: homeEx,
            observacao: e.observacao || 'Exercicio adaptado para casa',
          };
        }
      }
      // If no specific alternative, return generic bodyweight
      return {
        ...e,
        nome: 'Exercicio com peso corporal',
        observacao: `Substituto para ${e.nome}`,
      };
    }

    return e;
  });
}

/**
 * Process exercises for injuries, experience, goal and time
 */
function processExercises(
  exercicios: Exercise[],
  personalInfo: UserPersonalInfo
): Exercise[] {
  let processed = exercicios.map((e) => ({ ...e }));

  // Replace exercises that should be avoided due to injuries
  processed = processed.map((exercise) => {
    if (shouldAvoidExercise(exercise.nome, personalInfo.lesoes)) {
      const alternative = getAlternativeExercise(exercise, personalInfo.lesoes);
      return alternative || exercise;
    }
    return exercise;
  });

  // Filter out any remaining problematic exercises
  processed = processed.filter(
    (e) => !shouldAvoidExercise(e.nome, personalInfo.lesoes)
  );

  // Adjust for user's goal (hipertrofia, forca, emagrecimento, etc)
  processed = adjustForGoal(processed, personalInfo.objetivo);

  // Filter/adapt exercises based on training location (gym vs home)
  processed = filterByEquipment(processed, personalInfo.localTreino);

  // Adjust intensity based on experience and activity level
  processed = adjustForExperience(
    processed,
    personalInfo.experienciaTreino,
    personalInfo.nivelAtividade
  );

  // Adjust number of exercises based on available time
  processed = adjustForTime(processed, personalInfo.tempoTreinoMinutos);

  return processed;
}

// ============================================
// MUSCULAÇÃO (Weightlifting)
// ============================================

/**
 * Get workout split for musculação based on days per week
 * Uses modern splits:
 * - 1-2 days: Full Body
 * - 3 days: Push/Pull/Legs
 * - 4 days: Upper/Lower x2
 * - 5-6 days: Push/Pull/Legs x2
 */
function getMusculacaoSplit(diasPorSemana: number): { template: keyof typeof WORKOUT_TEMPLATES; dia: string }[] {
  const DIAS = ['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];

  switch (diasPorSemana) {
    case 1:
      // Full Body unico
      return [{ template: 'full_body_a', dia: DIAS[0] }];
    case 2:
      // Full Body A e B
      return [
        { template: 'full_body_a', dia: DIAS[0] },
        { template: 'full_body_b', dia: DIAS[3] },
      ];
    case 3:
      // Push/Pull/Legs classico
      return [
        { template: 'push_day', dia: DIAS[0] },
        { template: 'pull_day', dia: DIAS[2] },
        { template: 'legs_day', dia: DIAS[4] },
      ];
    case 4:
      // Upper/Lower 2x por semana
      return [
        { template: 'upper_body', dia: DIAS[0] },
        { template: 'lower_body', dia: DIAS[1] },
        { template: 'upper_body', dia: DIAS[3] },
        { template: 'lower_body', dia: DIAS[4] },
      ];
    case 5:
      // Push/Pull/Legs + Upper/Lower
      return [
        { template: 'push_day', dia: DIAS[0] },
        { template: 'pull_day', dia: DIAS[1] },
        { template: 'legs_day', dia: DIAS[2] },
        { template: 'upper_body', dia: DIAS[3] },
        { template: 'lower_body', dia: DIAS[4] },
      ];
    case 6:
    case 7:
      // Push/Pull/Legs 2x por semana
      return [
        { template: 'push_day', dia: DIAS[0] },
        { template: 'pull_day', dia: DIAS[1] },
        { template: 'legs_day', dia: DIAS[2] },
        { template: 'push_day', dia: DIAS[3] },
        { template: 'pull_day', dia: DIAS[4] },
        { template: 'legs_day', dia: DIAS[5] },
      ];
    default:
      // Padrao: Push/Pull/Legs
      return [
        { template: 'push_day', dia: DIAS[0] },
        { template: 'pull_day', dia: DIAS[2] },
        { template: 'legs_day', dia: DIAS[4] },
      ];
  }
}

function generateMusculacaoWorkout(personalInfo: UserPersonalInfo): Treino[] {
  const diasPorSemana = personalInfo.diasTreinoSemana || 3;
  const split = getMusculacaoSplit(diasPorSemana);

  return split.map((item) => {
    const template = WORKOUT_TEMPLATES[item.template];
    const exercicios = processExercises(template.exercicios, personalInfo);

    return {
      id: `treino-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      nome: template.nome,
      diaSemana: item.dia,
      exercicios,
    };
  });
}

// ============================================
// CORRIDA (Running)
// ============================================

function getCorridaSplit(diasPorSemana: number): { template: keyof typeof CORRIDA_TEMPLATES; dia: string }[] {
  const DIAS = ['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];

  switch (diasPorSemana) {
    case 1:
      return [{ template: 'recuperacao', dia: DIAS[0] }];
    case 2:
      return [
        { template: 'intervalado', dia: DIAS[0] },
        { template: 'longo', dia: DIAS[5] },
      ];
    case 3:
      return [
        { template: 'intervalado', dia: DIAS[0] },
        { template: 'recuperacao', dia: DIAS[2] },
        { template: 'longo', dia: DIAS[5] },
      ];
    case 4:
      return [
        { template: 'intervalado', dia: DIAS[0] },
        { template: 'recuperacao', dia: DIAS[1] },
        { template: 'tempo', dia: DIAS[3] },
        { template: 'longo', dia: DIAS[5] },
      ];
    case 5:
    case 6:
    case 7:
      return [
        { template: 'intervalado', dia: DIAS[0] },
        { template: 'recuperacao', dia: DIAS[1] },
        { template: 'tempo', dia: DIAS[2] },
        { template: 'intervalado', dia: DIAS[3] },
        { template: 'longo', dia: DIAS[5] },
      ];
    default:
      return [
        { template: 'intervalado', dia: DIAS[0] },
        { template: 'recuperacao', dia: DIAS[2] },
        { template: 'longo', dia: DIAS[5] },
      ];
  }
}

function generateCorridaWorkout(personalInfo: UserPersonalInfo): Treino[] {
  const diasPorSemana = personalInfo.diasTreinoSemana || 3;
  const split = getCorridaSplit(diasPorSemana);

  return split.map((item) => {
    const template = CORRIDA_TEMPLATES[item.template];
    const exercicios = processExercises(template.exercicios, personalInfo);

    return {
      id: `treino-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      nome: template.nome,
      diaSemana: item.dia,
      exercicios,
    };
  });
}

// ============================================
// CROSSFIT
// ============================================

function getCrossfitSplit(diasPorSemana: number): { template: keyof typeof CROSSFIT_TEMPLATES; dia: string }[] {
  const DIAS = ['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];
  const TEMPLATES: (keyof typeof CROSSFIT_TEMPLATES)[] = ['wod_amrap', 'wod_emom', 'wod_fortime'];

  switch (diasPorSemana) {
    case 1:
      return [{ template: 'wod_amrap', dia: DIAS[0] }];
    case 2:
      return [
        { template: 'wod_amrap', dia: DIAS[0] },
        { template: 'wod_fortime', dia: DIAS[3] },
      ];
    case 3:
      return TEMPLATES.map((t, i) => ({ template: t, dia: DIAS[i * 2] }));
    case 4:
    case 5:
    case 6:
    case 7:
      return [
        { template: 'wod_amrap', dia: DIAS[0] },
        { template: 'wod_emom', dia: DIAS[1] },
        { template: 'wod_fortime', dia: DIAS[2] },
        { template: 'wod_amrap', dia: DIAS[4] },
      ];
    default:
      return TEMPLATES.map((t, i) => ({ template: t, dia: DIAS[i * 2] }));
  }
}

function generateCrossfitWorkout(personalInfo: UserPersonalInfo): Treino[] {
  const diasPorSemana = personalInfo.diasTreinoSemana || 3;
  const split = getCrossfitSplit(diasPorSemana);

  return split.map((item) => {
    const template = CROSSFIT_TEMPLATES[item.template];
    const exercicios = processExercises(template.exercicios, personalInfo);

    return {
      id: `treino-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      nome: template.nome,
      diaSemana: item.dia,
      exercicios,
    };
  });
}

// ============================================
// CAMINHADA (Walking)
// ============================================

function getCaminhadaSplit(diasPorSemana: number): { template: keyof typeof CAMINHADA_TEMPLATES; dia: string }[] {
  const DIAS = ['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];

  switch (diasPorSemana) {
    case 1:
      return [{ template: 'leve', dia: DIAS[0] }];
    case 2:
      return [
        { template: 'leve', dia: DIAS[0] },
        { template: 'moderada', dia: DIAS[3] },
      ];
    case 3:
      return [
        { template: 'leve', dia: DIAS[0] },
        { template: 'moderada', dia: DIAS[2] },
        { template: 'intensa', dia: DIAS[5] },
      ];
    case 4:
    case 5:
      return [
        { template: 'leve', dia: DIAS[0] },
        { template: 'moderada', dia: DIAS[1] },
        { template: 'leve', dia: DIAS[3] },
        { template: 'intensa', dia: DIAS[5] },
      ];
    case 6:
    case 7:
      return [
        { template: 'leve', dia: DIAS[0] },
        { template: 'moderada', dia: DIAS[1] },
        { template: 'leve', dia: DIAS[2] },
        { template: 'moderada', dia: DIAS[3] },
        { template: 'leve', dia: DIAS[4] },
        { template: 'intensa', dia: DIAS[5] },
      ];
    default:
      return [
        { template: 'leve', dia: DIAS[0] },
        { template: 'moderada', dia: DIAS[2] },
        { template: 'intensa', dia: DIAS[5] },
      ];
  }
}

function generateCaminhadaWorkout(personalInfo: UserPersonalInfo): Treino[] {
  const diasPorSemana = personalInfo.diasTreinoSemana || 3;
  const split = getCaminhadaSplit(diasPorSemana);

  return split.map((item) => {
    const template = CAMINHADA_TEMPLATES[item.template];
    const exercicios = processExercises(template.exercicios, personalInfo);

    return {
      id: `treino-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      nome: template.nome,
      diaSemana: item.dia,
      exercicios,
    };
  });
}

// ============================================
// FUNCIONAL (Functional Training)
// ============================================

function getFuncionalSplit(diasPorSemana: number): { template: keyof typeof FUNCIONAL_TEMPLATES; dia: string }[] {
  const DIAS = ['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];
  const TEMPLATES: (keyof typeof FUNCIONAL_TEMPLATES)[] = ['circuito_a', 'circuito_b', 'circuito_c'];

  switch (diasPorSemana) {
    case 1:
      return [{ template: 'circuito_a', dia: DIAS[0] }];
    case 2:
      return [
        { template: 'circuito_a', dia: DIAS[0] },
        { template: 'circuito_b', dia: DIAS[3] },
      ];
    case 3:
      return TEMPLATES.map((t, i) => ({ template: t, dia: DIAS[i * 2] }));
    case 4:
      return [
        { template: 'circuito_a', dia: DIAS[0] },
        { template: 'circuito_b', dia: DIAS[1] },
        { template: 'circuito_c', dia: DIAS[3] },
        { template: 'circuito_a', dia: DIAS[4] },
      ];
    case 5:
    case 6:
    case 7:
      return [
        { template: 'circuito_a', dia: DIAS[0] },
        { template: 'circuito_b', dia: DIAS[1] },
        { template: 'circuito_c', dia: DIAS[2] },
        { template: 'circuito_a', dia: DIAS[3] },
        { template: 'circuito_b', dia: DIAS[4] },
      ];
    default:
      return TEMPLATES.map((t, i) => ({ template: t, dia: DIAS[i * 2] }));
  }
}

function generateFuncionalWorkout(personalInfo: UserPersonalInfo): Treino[] {
  const diasPorSemana = personalInfo.diasTreinoSemana || 3;
  const split = getFuncionalSplit(diasPorSemana);

  return split.map((item) => {
    const template = FUNCIONAL_TEMPLATES[item.template];
    const exercicios = processExercises(template.exercicios, personalInfo);

    return {
      id: `treino-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      nome: template.nome,
      diaSemana: item.dia,
      exercicios,
    };
  });
}

// ============================================
// CALISTENIA (Calisthenics)
// ============================================

function getCalisteniaSplit(diasPorSemana: number): { template: keyof typeof CALISTENIA_TEMPLATES; dia: string }[] {
  const DIAS = ['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];
  const TEMPLATES: (keyof typeof CALISTENIA_TEMPLATES)[] = ['upper', 'lower', 'full'];

  switch (diasPorSemana) {
    case 1:
      return [{ template: 'full', dia: DIAS[0] }];
    case 2:
      return [
        { template: 'upper', dia: DIAS[0] },
        { template: 'lower', dia: DIAS[3] },
      ];
    case 3:
      return TEMPLATES.map((t, i) => ({ template: t, dia: DIAS[i * 2] }));
    case 4:
      return [
        { template: 'upper', dia: DIAS[0] },
        { template: 'lower', dia: DIAS[1] },
        { template: 'full', dia: DIAS[3] },
        { template: 'upper', dia: DIAS[4] },
      ];
    case 5:
    case 6:
    case 7:
      return [
        { template: 'upper', dia: DIAS[0] },
        { template: 'lower', dia: DIAS[1] },
        { template: 'full', dia: DIAS[2] },
        { template: 'upper', dia: DIAS[3] },
        { template: 'lower', dia: DIAS[4] },
      ];
    default:
      return TEMPLATES.map((t, i) => ({ template: t, dia: DIAS[i * 2] }));
  }
}

function generateCalisteniaWorkout(personalInfo: UserPersonalInfo): Treino[] {
  const diasPorSemana = personalInfo.diasTreinoSemana || 3;
  const split = getCalisteniaSplit(diasPorSemana);

  return split.map((item) => {
    const template = CALISTENIA_TEMPLATES[item.template];
    const exercicios = processExercises(template.exercicios, personalInfo);

    return {
      id: `treino-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      nome: template.nome,
      diaSemana: item.dia,
      exercicios,
    };
  });
}

// ============================================
// MAIN GENERATION FUNCTION
// ============================================

/**
 * Parse training modality from preferenciaTreino string
 */
function parseModality(preferencia: string): TrainingModality {
  const lower = preferencia.toLowerCase().trim();

  if (lower.includes('muscula') || lower.includes('peso') || lower.includes('academia')) {
    return 'musculacao';
  }
  if (lower.includes('corr') || lower.includes('running')) {
    return 'corrida';
  }
  if (lower.includes('crossfit') || lower.includes('cross fit')) {
    return 'crossfit';
  }
  if (lower.includes('caminh') || lower.includes('walk')) {
    return 'caminhada';
  }
  if (lower.includes('funcional') || lower.includes('functional')) {
    return 'funcional';
  }
  if (lower.includes('calistenia') || lower.includes('calisthenic') || lower.includes('peso corporal')) {
    return 'calistenia';
  }

  // Default to musculação if unclear
  return 'musculacao';
}

/**
 * Generate a complete workout plan based on user's preferences and available days
 */
export function generatePersonalizedWorkoutPlan(personalInfo: UserPersonalInfo): Treino[] {
  const modality = parseModality(personalInfo.preferenciaTreino);

  switch (modality) {
    case 'musculacao':
      return generateMusculacaoWorkout(personalInfo);
    case 'corrida':
      return generateCorridaWorkout(personalInfo);
    case 'crossfit':
      return generateCrossfitWorkout(personalInfo);
    case 'caminhada':
      return generateCaminhadaWorkout(personalInfo);
    case 'funcional':
      return generateFuncionalWorkout(personalInfo);
    case 'calistenia':
      return generateCalisteniaWorkout(personalInfo);
    default:
      return generateMusculacaoWorkout(personalInfo);
  }
}

/**
 * Get workout split based on days per week (legacy - for musculação)
 * @deprecated Use generatePersonalizedWorkoutPlan instead
 */
function getWorkoutSplit(diasPorSemana: number): { templates: (keyof typeof WORKOUT_TEMPLATES)[]; dias: string[] }[] {
  switch (diasPorSemana) {
    case 1:
      return [{ templates: ['peito_triceps'], dias: ['Dia unico - Full Body adaptado'] }];
    case 2:
      return [
        { templates: ['peito_triceps'], dias: ['Segunda'] },
        { templates: ['pernas'], dias: ['Quinta'] },
      ];
    case 3:
      return [
        { templates: ['peito_triceps'], dias: ['Segunda'] },
        { templates: ['costas_biceps'], dias: ['Quarta'] },
        { templates: ['pernas'], dias: ['Sexta'] },
      ];
    case 4:
      return [
        { templates: ['peito_triceps'], dias: ['Segunda'] },
        { templates: ['costas_biceps'], dias: ['Terca'] },
        { templates: ['pernas'], dias: ['Quinta'] },
        { templates: ['peito_triceps'], dias: ['Sexta'] },
      ];
    case 5:
      return [
        { templates: ['peito_triceps'], dias: ['Segunda'] },
        { templates: ['costas_biceps'], dias: ['Terca'] },
        { templates: ['pernas'], dias: ['Quarta'] },
        { templates: ['peito_triceps'], dias: ['Quinta'] },
        { templates: ['costas_biceps'], dias: ['Sexta'] },
      ];
    case 6:
    case 7:
      return [
        { templates: ['peito_triceps'], dias: ['Segunda'] },
        { templates: ['costas_biceps'], dias: ['Terca'] },
        { templates: ['pernas'], dias: ['Quarta'] },
        { templates: ['peito_triceps'], dias: ['Quinta'] },
        { templates: ['costas_biceps'], dias: ['Sexta'] },
        { templates: ['pernas'], dias: ['Sabado'] },
      ];
    default:
      return [
        { templates: ['peito_triceps'], dias: ['Segunda'] },
        { templates: ['costas_biceps'], dias: ['Quarta'] },
        { templates: ['pernas'], dias: ['Sexta'] },
      ];
  }
}

/**
 * Generate a workout plan based on template and user profile
 */
export function generateWorkout(
  templateKey: keyof typeof WORKOUT_TEMPLATES,
  personalInfo: UserPersonalInfo,
  diaSemana?: string
): Treino {
  const template = WORKOUT_TEMPLATES[templateKey];
  const exercicios = processExercises(template.exercicios, personalInfo);

  return {
    id: `treino-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    nome: template.nome,
    diaSemana: diaSemana || template.diaSemana,
    exercicios,
  };
}

/**
 * Generate default chest/triceps workout
 */
export function generateChestTricepsWorkout(personalInfo: UserPersonalInfo): Treino {
  return generateWorkout('peito_triceps', personalInfo);
}

/**
 * Generate default back/biceps workout
 */
export function generateBackBicepsWorkout(personalInfo: UserPersonalInfo): Treino {
  return generateWorkout('costas_biceps', personalInfo);
}

/**
 * Generate default legs workout
 */
export function generateLegsWorkout(personalInfo: UserPersonalInfo): Treino {
  return generateWorkout('pernas', personalInfo);
}

/**
 * Generate workout response message for single workout
 */
export function generateWorkoutResponseMessage(
  personalInfo: UserPersonalInfo,
  treino: Treino
): string {
  let resposta = `Criei uma planilha de treino para voce! Confira na aba "Treinos".\n\n`;

  if (personalInfo.lesoes.length > 0) {
    resposta += `Levei em conta suas lesoes (${personalInfo.lesoes.join(', ')}) ao montar o treino.\n\n`;
  }

  if (personalInfo.objetivo) {
    resposta += `Este treino foi pensado para ajudar no seu objetivo de "${personalInfo.objetivo}".\n\n`;
  }

  resposta += 'Quer que eu crie treinos para outros grupos musculares?';

  return resposta;
}

/**
 * Generate workout response message for complete plan
 */
export function generatePersonalizedWorkoutResponseMessage(
  personalInfo: UserPersonalInfo,
  treinos: Treino[]
): string {
  const modality = parseModality(personalInfo.preferenciaTreino);
  const modalityName = TRAINING_MODALITY_CONFIG[modality]?.name || 'Musculação';

  let resposta = `Criei um plano de treino PERSONALIZADO para voce!\n\n`;

  // Summary of personalization
  resposta += `**Personalizacoes aplicadas:**\n`;
  resposta += `• Modalidade: ${modalityName}\n`;

  if (personalInfo.diasTreinoSemana) {
    resposta += `• ${treinos.length} treino(s) para ${personalInfo.diasTreinoSemana} dias por semana\n`;
  }

  if (personalInfo.tempoTreinoMinutos) {
    const tempoFormatado = personalInfo.tempoTreinoMinutos >= 60
      ? `${Math.floor(personalInfo.tempoTreinoMinutos / 60)}h${personalInfo.tempoTreinoMinutos % 60 > 0 ? ` ${personalInfo.tempoTreinoMinutos % 60}min` : ''}`
      : `${personalInfo.tempoTreinoMinutos}min`;
    resposta += `• Exercicios ajustados para sessoes de ~${tempoFormatado}\n`;
  }

  if (personalInfo.experienciaTreino) {
    const expLabel = {
      iniciante: 'Iniciante (mais repeticoes, foco em tecnica)',
      intermediario: 'Intermediario (carga moderada)',
      avancado: 'Avancado (maior intensidade)',
    }[personalInfo.experienciaTreino] || personalInfo.experienciaTreino;
    resposta += `• Intensidade para nivel ${expLabel}\n`;
  }

  if (personalInfo.lesoes.length > 0) {
    resposta += `• Exercicios adaptados para suas lesoes (${personalInfo.lesoes.join(', ')})\n`;
  }

  if (personalInfo.objetivo) {
    resposta += `• Focado no objetivo: "${personalInfo.objetivo}"\n`;
  }

  resposta += `\n**Seus treinos:**\n`;
  for (const treino of treinos) {
    resposta += `• ${treino.nome} - ${treino.diaSemana} (${treino.exercicios.length} exercicios)\n`;
  }

  resposta += `\nConfira todos os detalhes na aba "Treinos". Voce pode editar qualquer exercicio!\n\n`;
  resposta += `Quer que eu crie uma dieta personalizada tambem?`;

  return resposta;
}

/**
 * Check if user asked for workout in message
 */
export function isWorkoutRequest(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return (
    lowerMessage.includes('treino') ||
    lowerMessage.includes('exercicio') ||
    lowerMessage.includes('musculacao') ||
    lowerMessage.includes('corrida') ||
    lowerMessage.includes('crossfit') ||
    lowerMessage.includes('caminhada') ||
    lowerMessage.includes('funcional') ||
    lowerMessage.includes('calistenia')
  );
}

/**
 * Get modality display name
 */
export function getModalityName(modality: TrainingModality): string {
  return TRAINING_MODALITY_CONFIG[modality]?.name || '';
}

/**
 * Get all available modalities
 */
export function getAvailableModalities(): { id: TrainingModality; name: string; description: string }[] {
  return Object.entries(TRAINING_MODALITY_CONFIG)
    .filter(([id]) => id !== '')
    .map(([id, config]) => ({
      id: id as TrainingModality,
      name: config.name,
      description: config.description,
    }));
}

// ============================================
// WORKOUT MODIFICATION
// ============================================

/**
 * Alternative exercises by muscle group for suggestions
 */
const EXERCISE_ALTERNATIVES: Record<string, string[]> = {
  peito: ['Supino Reto', 'Supino Inclinado', 'Supino Declinado', 'Crucifixo', 'Crossover', 'Peck Deck', 'Flexao de Braço'],
  costas: ['Puxada Frontal', 'Remada Curvada', 'Remada Baixa', 'Remada Unilateral', 'Pulldown', 'Barra Fixa'],
  ombros: ['Desenvolvimento', 'Elevacao Lateral', 'Elevacao Frontal', 'Face Pull', 'Remada Alta'],
  biceps: ['Rosca Direta', 'Rosca Martelo', 'Rosca Concentrada', 'Rosca Scott', 'Rosca com Elastico'],
  triceps: ['Triceps Pulley', 'Triceps Frances', 'Triceps Testa', 'Mergulho', 'Triceps no banco'],
  pernas: ['Agachamento', 'Leg Press', 'Cadeira Extensora', 'Cadeira Flexora', 'Stiff', 'Afundo', 'Elevacao Pelvica', 'Hack'],
  core: ['Prancha', 'Abdominal', 'Prancha Lateral', 'Abdominal Bicicleta', 'Elevacao de Pernas'],
};

/**
 * Get muscle group from exercise name
 */
function getExerciseMuscleGroup(exerciseName: string): string {
  const lowerName = exerciseName.toLowerCase();

  if (lowerName.includes('supino') || lowerName.includes('crucifixo') || lowerName.includes('peck') || lowerName.includes('crossover') || lowerName.includes('flexao')) {
    return 'peito';
  }
  if (lowerName.includes('puxada') || lowerName.includes('remada') || lowerName.includes('pulldown') || lowerName.includes('barra fixa')) {
    return 'costas';
  }
  if (lowerName.includes('desenvolvimento') || lowerName.includes('elevacao lateral') || lowerName.includes('elevacao frontal') || lowerName.includes('face pull')) {
    return 'ombros';
  }
  if (lowerName.includes('rosca')) {
    return 'biceps';
  }
  if (lowerName.includes('triceps') || lowerName.includes('mergulho')) {
    return 'triceps';
  }
  if (lowerName.includes('agachamento') || lowerName.includes('leg') || lowerName.includes('extensora') || lowerName.includes('flexora') || lowerName.includes('stiff') || lowerName.includes('afundo') || lowerName.includes('panturrilha') || lowerName.includes('hack')) {
    return 'pernas';
  }
  if (lowerName.includes('prancha') || lowerName.includes('abdominal')) {
    return 'core';
  }

  return 'outro';
}

/**
 * Modify an existing workout
 */
export function modifyWorkout(
  treino: Treino,
  modificacao: WorkoutModification
): Treino {
  const novoTreino = { ...treino, exercicios: [...treino.exercicios] };
  const { type, exercicioIndex, exercicioNovo, ajustes } = modificacao;

  switch (type) {
    case 'substituir':
      if (exercicioNovo && exercicioIndex >= 0 && exercicioIndex < novoTreino.exercicios.length) {
        const original = novoTreino.exercicios[exercicioIndex];
        novoTreino.exercicios[exercicioIndex] = {
          ...original,
          nome: exercicioNovo,
          observacao: `Substituto de ${original.nome}`,
        };
      }
      break;

    case 'adicionar':
      if (exercicioNovo) {
        novoTreino.exercicios.push({
          nome: exercicioNovo,
          series: 3,
          repeticoes: '10-12',
          descanso: '60s',
        });
      }
      break;

    case 'remover':
      if (exercicioIndex >= 0 && exercicioIndex < novoTreino.exercicios.length) {
        novoTreino.exercicios.splice(exercicioIndex, 1);
      }
      break;

    case 'ajustar':
      if (ajustes && exercicioIndex >= 0 && exercicioIndex < novoTreino.exercicios.length) {
        novoTreino.exercicios[exercicioIndex] = {
          ...novoTreino.exercicios[exercicioIndex],
          ...ajustes,
        };
      }
      break;
  }

  return novoTreino;
}

/**
 * Get alternative exercises for a given exercise
 */
export function getExerciseAlternatives(
  exerciseName: string,
  lesoes: string[] = []
): ExerciseAlternative[] {
  const muscleGroup = getExerciseMuscleGroup(exerciseName);
  const alternatives = EXERCISE_ALTERNATIVES[muscleGroup] || [];

  return alternatives
    .filter((alt) => {
      // Don't suggest the same exercise
      if (alt.toLowerCase() === exerciseName.toLowerCase()) return false;
      // Don't suggest exercises that should be avoided due to injuries
      if (shouldAvoidExercise(alt, lesoes)) return false;
      return true;
    })
    .map((alt) => ({
      nome: alt,
      motivo: `Trabalha o mesmo grupo muscular (${muscleGroup})`,
      categoria: muscleGroup,
    }));
}

/**
 * Suggest modifications based on user feedback
 */
export function suggestModifications(
  treino: Treino,
  feedback: string,
  personalInfo: UserPersonalInfo
): WorkoutModification[] {
  const lowerFeedback = feedback.toLowerCase();
  const suggestions: WorkoutModification[] = [];

  // If workout is too hard, suggest reducing intensity
  if (lowerFeedback.includes('dificil') || lowerFeedback.includes('pesado') || lowerFeedback.includes('cansativo')) {
    treino.exercicios.forEach((ex, index) => {
      suggestions.push({
        type: 'ajustar',
        exercicioIndex: index,
        motivo: 'Reduzir dificuldade',
        ajustes: {
          series: Math.max(2, ex.series - 1),
          descanso: '90s',
          observacao: 'Series reduzidas para adaptacao',
        },
      });
    });
  }

  // If workout is too easy, suggest increasing intensity
  if (lowerFeedback.includes('facil') || lowerFeedback.includes('leve') || lowerFeedback.includes('pouco')) {
    treino.exercicios.forEach((ex, index) => {
      suggestions.push({
        type: 'ajustar',
        exercicioIndex: index,
        motivo: 'Aumentar intensidade',
        ajustes: {
          series: ex.series + 1,
          descanso: '45s',
          observacao: 'Series aumentadas para progressao',
        },
      });
    });
  }

  // If specific exercise hurts, suggest alternatives
  treino.exercicios.forEach((ex, index) => {
    const exLower = ex.nome.toLowerCase();
    if (lowerFeedback.includes(exLower) && (lowerFeedback.includes('doi') || lowerFeedback.includes('dor') || lowerFeedback.includes('incomoda'))) {
      const alternatives = getExerciseAlternatives(ex.nome, personalInfo.lesoes);
      if (alternatives.length > 0) {
        suggestions.push({
          type: 'substituir',
          exercicioIndex: index,
          exercicioNovo: alternatives[0].nome,
          motivo: `Substituir ${ex.nome} que causa desconforto`,
        });
      }
    }
  });

  return suggestions;
}
