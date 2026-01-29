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
import { getSplitForModality } from './splitConfigs';

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
      observacao: e.observacao || 'Foque na execução correta',
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
      observacao: e.observacao || 'Foco em contração muscular',
    }));
  }

  // Forca
  if (lowerObjetivo.includes('forca') || lowerObjetivo.includes('força') || lowerObjetivo.includes('forte')) {
    return exercicios.map((e) => ({
      ...e,
      series: Math.min(5, e.series + 1),
      repeticoes: '4-6',
      descanso: '180s',
      observacao: e.observacao || 'Carga máxima com boa forma',
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
      observacao: e.observacao || 'Sem pausa longa entre exercícios',
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
            observacao: e.observacao || 'Exercício adaptado para casa',
          };
        }
      }
      // If no specific alternative, return generic bodyweight
      return {
        ...e,
        nome: 'Exercício com peso corporal',
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
// WORKOUT GENERATION BY MODALITY
// ============================================

// Template type definition
type WorkoutTemplate = {
  nome: string;
  exercicios: Exercise[];
};

// Map of modality to template records
const MODALITY_TEMPLATES: Record<TrainingModality, Record<string, WorkoutTemplate>> = {
  musculacao: WORKOUT_TEMPLATES,
  corrida: CORRIDA_TEMPLATES,
  crossfit: CROSSFIT_TEMPLATES,
  caminhada: CAMINHADA_TEMPLATES,
  funcional: FUNCIONAL_TEMPLATES,
  calistenia: CALISTENIA_TEMPLATES,
  '': WORKOUT_TEMPLATES, // Default to musculacao
};

/**
 * Generate workout for a specific modality
 */
function generateWorkoutForModality(modality: TrainingModality, personalInfo: UserPersonalInfo): Treino[] {
  const diasPorSemana = personalInfo.diasTreinoSemana || 3;
  const effectiveModality = modality || 'musculacao';
  const split = getSplitForModality(effectiveModality, diasPorSemana);
  const templates = MODALITY_TEMPLATES[effectiveModality];

  return split.map((item) => {
    const template = templates[item.template];
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
  return generateWorkoutForModality(modality, personalInfo);
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

  let resposta = `Criei um plano de treino PERSONALIZADO para você!\n\n`;

  // Summary of personalization
  resposta += `**Personalizações aplicadas:**\n`;
  resposta += `• Modalidade: ${modalityName}\n`;

  if (personalInfo.diasTreinoSemana) {
    resposta += `• ${treinos.length} treino(s) para ${personalInfo.diasTreinoSemana} dias por semana\n`;
  }

  if (personalInfo.tempoTreinoMinutos) {
    const tempoFormatado = personalInfo.tempoTreinoMinutos >= 60
      ? `${Math.floor(personalInfo.tempoTreinoMinutos / 60)}h${personalInfo.tempoTreinoMinutos % 60 > 0 ? ` ${personalInfo.tempoTreinoMinutos % 60}min` : ''}`
      : `${personalInfo.tempoTreinoMinutos}min`;
    resposta += `• Exercícios ajustados para sessões de ~${tempoFormatado}\n`;
  }

  if (personalInfo.experienciaTreino) {
    const expLabel = {
      iniciante: 'Iniciante (mais repetições, foco em técnica)',
      intermediario: 'Intermediário (carga moderada)',
      avancado: 'Avançado (maior intensidade)',
    }[personalInfo.experienciaTreino] || personalInfo.experienciaTreino;
    resposta += `• Intensidade para nível ${expLabel}\n`;
  }

  if (personalInfo.lesoes.length > 0) {
    resposta += `• Exercícios adaptados para suas lesões (${personalInfo.lesoes.join(', ')})\n`;
  }

  if (personalInfo.objetivo) {
    resposta += `• Focado no objetivo: "${personalInfo.objetivo}"\n`;
  }

  resposta += `\n**Seus treinos:**\n`;
  for (const treino of treinos) {
    resposta += `• ${treino.nome} - ${treino.diaSemana} (${treino.exercicios.length} exercícios)\n`;
  }

  resposta += `\nConfira todos os detalhes na aba "Treinos". Você pode editar qualquer exercício!\n\n`;
  resposta += `Quer que eu crie uma dieta personalizada também?`;

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
          observacao: 'Séries reduzidas para adaptação',
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
          observacao: 'Séries aumentadas para progressão',
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
