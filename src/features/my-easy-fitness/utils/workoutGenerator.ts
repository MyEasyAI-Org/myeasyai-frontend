/**
 * Workout Generator
 *
 * Functions to generate personalized workout plans based on user profile.
 */

import type { Exercise, Treino, UserPersonalInfo } from '../types';
import { INJURY_EXERCISE_ALTERNATIVES, WORKOUT_TEMPLATES } from '../constants';

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
 * Adjust workout intensity based on activity level
 */
function adjustForActivityLevel(
  exercicios: Exercise[],
  nivelAtividade: string
): Exercise[] {
  // Reduce sets for beginners
  if (nivelAtividade === 'sedentario' || nivelAtividade === 'leve') {
    return exercicios.map((e) => ({
      ...e,
      series: Math.max(2, e.series - 1),
    }));
  }

  // Increase sets for advanced
  if (nivelAtividade === 'intenso') {
    return exercicios.map((e) => ({
      ...e,
      series: e.series + 1,
    }));
  }

  return exercicios;
}

/**
 * Generate a workout plan based on template and user profile
 */
export function generateWorkout(
  templateKey: keyof typeof WORKOUT_TEMPLATES,
  personalInfo: UserPersonalInfo
): Treino {
  const template = WORKOUT_TEMPLATES[templateKey];

  let exercicios: Exercise[] = template.exercicios.map((e) => ({ ...e }));

  // Replace exercises that should be avoided due to injuries
  exercicios = exercicios.map((exercise) => {
    if (shouldAvoidExercise(exercise.nome, personalInfo.lesoes)) {
      const alternative = getAlternativeExercise(exercise, personalInfo.lesoes);
      return alternative || exercise;
    }
    return exercise;
  });

  // Filter out any remaining problematic exercises
  exercicios = exercicios.filter(
    (e) => !shouldAvoidExercise(e.nome, personalInfo.lesoes)
  );

  // Adjust intensity based on activity level
  exercicios = adjustForActivityLevel(exercicios, personalInfo.nivelAtividade);

  return {
    id: `treino-${Date.now()}`,
    nome: template.nome,
    diaSemana: template.diaSemana,
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
 * Generate workout response message
 */
export function generateWorkoutResponseMessage(
  personalInfo: UserPersonalInfo,
  treino: Treino
): string {
  let resposta = `Criei uma planilha de treino para voce, ${personalInfo.nome}! Confira na aba "Treinos".\n\n`;

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
 * Check if user asked for workout in message
 */
export function isWorkoutRequest(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return (
    lowerMessage.includes('treino') ||
    lowerMessage.includes('exercicio') ||
    lowerMessage.includes('musculacao')
  );
}
