/**
 * Workout Templates
 *
 * Predefined workout templates for different training modalities.
 */

import type { Exercise, TrainingModality } from '../types';

/**
 * Default workout templates by muscle group
 */
export const WORKOUT_TEMPLATES = {
  peito_triceps: {
    nome: 'Treino A - Peito/Tríceps',
    diaSemana: 'Segunda e Quinta',
    exercicios: [
      { nome: 'Supino Reto', series: 4, repeticoes: '8-12', descanso: '90s' },
      {
        nome: 'Supino Inclinado',
        series: 3,
        repeticoes: '10-12',
        descanso: '90s',
      },
      { nome: 'Crucifixo com Halteres', series: 3, repeticoes: '12-15', descanso: '60s' },
      {
        nome: 'Tríceps Pulley (Corda)',
        series: 3,
        repeticoes: '12-15',
        descanso: '60s',
      },
      {
        nome: 'Tríceps Francês',
        series: 3,
        repeticoes: '10-12',
        descanso: '60s',
      },
    ],
  },
  costas_biceps: {
    nome: 'Treino B - Costas/Bíceps',
    diaSemana: 'Terça e Sexta',
    exercicios: [
      { nome: 'Puxada Frontal', series: 4, repeticoes: '8-12', descanso: '90s' },
      {
        nome: 'Remada Curvada com Barra',
        series: 3,
        repeticoes: '10-12',
        descanso: '90s',
      },
      { nome: 'Remada Baixa no Cabo', series: 3, repeticoes: '12-15', descanso: '60s' },
      {
        nome: 'Rosca Direta com Barra',
        series: 3,
        repeticoes: '10-12',
        descanso: '60s',
      },
      {
        nome: 'Rosca Martelo',
        series: 3,
        repeticoes: '10-12',
        descanso: '60s',
      },
    ],
  },
  pernas: {
    nome: 'Treino C - Pernas',
    diaSemana: 'Quarta e Sábado',
    exercicios: [
      { nome: 'Agachamento Livre', series: 4, repeticoes: '8-12', descanso: '120s' },
      { nome: 'Leg Press 45°', series: 3, repeticoes: '10-12', descanso: '90s' },
      {
        nome: 'Cadeira Extensora',
        series: 3,
        repeticoes: '12-15',
        descanso: '60s',
      },
      {
        nome: 'Cadeira Flexora',
        series: 3,
        repeticoes: '12-15',
        descanso: '60s',
      },
      {
        nome: 'Elevação de Panturrilha em Pé',
        series: 4,
        repeticoes: '15-20',
        descanso: '45s',
      },
    ],
  },
  // Push/Pull/Legs Split
  push_day: {
    nome: 'Push - Peito/Ombros/Tríceps',
    diaSemana: 'Segunda e Quinta',
    exercicios: [
      { nome: 'Supino Reto', series: 4, repeticoes: '8-12', descanso: '90s' },
      { nome: 'Supino Inclinado', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Desenvolvimento com Barra', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Elevação Lateral', series: 3, repeticoes: '12-15', descanso: '60s' },
      { nome: 'Tríceps Pulley (Corda)', series: 3, repeticoes: '12-15', descanso: '60s' },
      { nome: 'Tríceps Francês', series: 3, repeticoes: '10-12', descanso: '60s' },
    ],
  },
  pull_day: {
    nome: 'Pull - Costas/Bíceps',
    diaSemana: 'Terça e Sexta',
    exercicios: [
      { nome: 'Puxada Frontal', series: 4, repeticoes: '8-12', descanso: '90s' },
      { nome: 'Remada Curvada com Barra', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Remada Baixa no Cabo', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Face Pull', series: 3, repeticoes: '15-20', descanso: '60s' },
      { nome: 'Rosca Direta com Barra', series: 3, repeticoes: '10-12', descanso: '60s' },
      { nome: 'Rosca Martelo', series: 3, repeticoes: '10-12', descanso: '60s' },
    ],
  },
  legs_day: {
    nome: 'Legs - Pernas Completo',
    diaSemana: 'Quarta e Sábado',
    exercicios: [
      { nome: 'Agachamento Livre', series: 4, repeticoes: '8-12', descanso: '120s' },
      { nome: 'Leg Press 45°', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Stiff (Levantamento Terra Romeno)', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Cadeira Extensora', series: 3, repeticoes: '12-15', descanso: '60s' },
      { nome: 'Cadeira Flexora', series: 3, repeticoes: '12-15', descanso: '60s' },
      { nome: 'Elevação de Panturrilha em Pé', series: 4, repeticoes: '15-20', descanso: '45s' },
    ],
  },
  // Upper/Lower Split
  upper_body: {
    nome: 'Upper Body - Superior',
    diaSemana: 'Segunda e Quinta',
    exercicios: [
      { nome: 'Supino Reto', series: 4, repeticoes: '8-12', descanso: '90s' },
      { nome: 'Puxada Frontal', series: 4, repeticoes: '8-12', descanso: '90s' },
      { nome: 'Desenvolvimento com Barra', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Remada Baixa no Cabo', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Rosca Direta com Barra', series: 3, repeticoes: '10-12', descanso: '60s' },
      { nome: 'Tríceps Pulley (Corda)', series: 3, repeticoes: '12-15', descanso: '60s' },
    ],
  },
  lower_body: {
    nome: 'Lower Body - Inferior',
    diaSemana: 'Terça e Sexta',
    exercicios: [
      { nome: 'Agachamento Livre', series: 4, repeticoes: '8-12', descanso: '120s' },
      { nome: 'Stiff (Levantamento Terra Romeno)', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Leg Press 45°', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Cadeira Extensora', series: 3, repeticoes: '12-15', descanso: '60s' },
      { nome: 'Cadeira Flexora', series: 3, repeticoes: '12-15', descanso: '60s' },
      { nome: 'Elevação Pélvica', series: 3, repeticoes: '12-15', descanso: '60s' },
      { nome: 'Elevação de Panturrilha em Pé', series: 4, repeticoes: '15-20', descanso: '45s' },
    ],
  },
  // Full Body Split
  full_body_a: {
    nome: 'Full Body A',
    diaSemana: 'Segunda e Quinta',
    exercicios: [
      { nome: 'Agachamento Livre', series: 3, repeticoes: '8-12', descanso: '120s' },
      { nome: 'Supino Reto', series: 3, repeticoes: '8-12', descanso: '90s' },
      { nome: 'Puxada Frontal', series: 3, repeticoes: '8-12', descanso: '90s' },
      { nome: 'Desenvolvimento com Barra', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Rosca Direta com Barra', series: 2, repeticoes: '10-12', descanso: '60s' },
      { nome: 'Tríceps Pulley', series: 2, repeticoes: '12-15', descanso: '60s' },
    ],
  },
  full_body_b: {
    nome: 'Full Body B',
    diaSemana: 'Terça e Sexta',
    exercicios: [
      { nome: 'Stiff (Levantamento Terra Romeno)', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Supino Inclinado', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Remada Curvada com Barra', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Elevação Lateral', series: 3, repeticoes: '12-15', descanso: '60s' },
      { nome: 'Leg Press 45°', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Elevação de Panturrilha em Pé', series: 3, repeticoes: '15-20', descanso: '45s' },
    ],
  },
};

/**
 * Running workout templates
 */
export const CORRIDA_TEMPLATES: Record<string, { nome: string; diaSemana: string; exercicios: Exercise[] }> = {
  intervalado: {
    nome: 'Treino Intervalado (HIIT)',
    diaSemana: 'Segunda e Quinta',
    exercicios: [
      { nome: 'Aquecimento - Caminhada', series: 1, repeticoes: '5 min', descanso: '0s', observacao: 'Ritmo leve' },
      { nome: 'Sprint', series: 8, repeticoes: '30s', descanso: '60s', observacao: 'Velocidade máxima' },
      { nome: 'Desaquecimento - Caminhada', series: 1, repeticoes: '5 min', descanso: '0s', observacao: 'Ritmo leve' },
    ],
  },
  longo: {
    nome: 'Corrida Longa',
    diaSemana: 'Sábado',
    exercicios: [
      { nome: 'Aquecimento', series: 1, repeticoes: '5 min', descanso: '0s', observacao: 'Caminhada ou trote leve' },
      { nome: 'Corrida Contínua', series: 1, repeticoes: '30-45 min', descanso: '0s', observacao: 'Ritmo conversacional' },
      { nome: 'Desaquecimento', series: 1, repeticoes: '5 min', descanso: '0s', observacao: 'Caminhada' },
    ],
  },
  recuperacao: {
    nome: 'Corrida de Recuperação',
    diaSemana: 'Terça',
    exercicios: [
      { nome: 'Caminhada', series: 1, repeticoes: '5 min', descanso: '0s' },
      { nome: 'Trote Leve', series: 1, repeticoes: '20-30 min', descanso: '0s', observacao: 'Zona 2, ritmo fácil' },
      { nome: 'Alongamento', series: 1, repeticoes: '10 min', descanso: '0s' },
    ],
  },
  tempo: {
    nome: 'Corrida Tempo',
    diaSemana: 'Quarta',
    exercicios: [
      { nome: 'Aquecimento', series: 1, repeticoes: '10 min', descanso: '0s', observacao: 'Trote leve' },
      { nome: 'Corrida Tempo', series: 1, repeticoes: '20 min', descanso: '0s', observacao: 'Ritmo desconfortavelmente rápido' },
      { nome: 'Desaquecimento', series: 1, repeticoes: '5 min', descanso: '0s' },
    ],
  },
};

/**
 * CrossFit workout templates
 */
export const CROSSFIT_TEMPLATES: Record<string, { nome: string; diaSemana: string; exercicios: Exercise[] }> = {
  wod_amrap: {
    nome: 'AMRAP 20min',
    diaSemana: 'Segunda',
    exercicios: [
      { nome: 'Aquecimento Dinâmico', series: 1, repeticoes: '5 min', descanso: '0s' },
      { nome: 'Pull-ups', series: 1, repeticoes: '5', descanso: '0s', observacao: 'AMRAP 20min - parte do circuito' },
      { nome: 'Push-ups', series: 1, repeticoes: '10', descanso: '0s', observacao: 'AMRAP 20min - parte do circuito' },
      { nome: 'Air Squats', series: 1, repeticoes: '15', descanso: '0s', observacao: 'AMRAP 20min - parte do circuito' },
      { nome: 'Alongamento', series: 1, repeticoes: '5 min', descanso: '0s' },
    ],
  },
  wod_emom: {
    nome: 'EMOM 15min',
    diaSemana: 'Quarta',
    exercicios: [
      { nome: 'Aquecimento', series: 1, repeticoes: '5 min', descanso: '0s' },
      { nome: 'Burpee', series: 15, repeticoes: '5', descanso: 'resto do min', observacao: 'Every Minute On the Minute' },
      { nome: 'Kettlebell Swings', series: 15, repeticoes: '10', descanso: 'resto do min', observacao: 'Minutos alternados' },
      { nome: 'Alongamento', series: 1, repeticoes: '5 min', descanso: '0s' },
    ],
  },
  wod_fortime: {
    nome: 'For Time',
    diaSemana: 'Sexta',
    exercicios: [
      { nome: 'Aquecimento', series: 1, repeticoes: '5 min', descanso: '0s' },
      { nome: 'Wall Balls', series: 1, repeticoes: '50', descanso: 'quando precisar', observacao: 'Completar o mais rápido possível' },
      { nome: 'Box Jumps', series: 1, repeticoes: '40', descanso: 'quando precisar' },
      { nome: 'Kettlebell Swings', series: 1, repeticoes: '30', descanso: 'quando precisar' },
      { nome: 'Toes to Bar', series: 1, repeticoes: '20', descanso: 'quando precisar' },
      { nome: 'Thrusters', series: 1, repeticoes: '10', descanso: 'quando precisar' },
      { nome: 'Alongamento', series: 1, repeticoes: '5 min', descanso: '0s' },
    ],
  },
};

/**
 * Walking workout templates
 */
export const CAMINHADA_TEMPLATES: Record<string, { nome: string; diaSemana: string; exercicios: Exercise[] }> = {
  leve: {
    nome: 'Caminhada Leve',
    diaSemana: 'Segunda, Quarta e Sexta',
    exercicios: [
      { nome: 'Alongamento Inicial', series: 1, repeticoes: '5 min', descanso: '0s' },
      { nome: 'Caminhada', series: 1, repeticoes: '30 min', descanso: '0s', observacao: 'Ritmo leve, confortável' },
      { nome: 'Alongamento Final', series: 1, repeticoes: '5 min', descanso: '0s' },
    ],
  },
  moderada: {
    nome: 'Caminhada Moderada',
    diaSemana: 'Terça e Quinta',
    exercicios: [
      { nome: 'Alongamento', series: 1, repeticoes: '5 min', descanso: '0s' },
      { nome: 'Caminhada Rápida', series: 1, repeticoes: '40 min', descanso: '0s', observacao: 'Ritmo acelerado, consegue conversar' },
      { nome: 'Desaquecimento', series: 1, repeticoes: '5 min', descanso: '0s', observacao: 'Ritmo leve' },
    ],
  },
  intensa: {
    nome: 'Caminhada Intensa com Intervalos',
    diaSemana: 'Sábado',
    exercicios: [
      { nome: 'Aquecimento', series: 1, repeticoes: '5 min', descanso: '0s' },
      { nome: 'Caminhada Rápida', series: 5, repeticoes: '3 min', descanso: '1 min', observacao: 'Intervalos de alta intensidade' },
      { nome: 'Caminhada Normal', series: 5, repeticoes: '2 min', descanso: '0s', observacao: 'Recuperação ativa entre intervalos' },
      { nome: 'Desaquecimento', series: 1, repeticoes: '5 min', descanso: '0s' },
    ],
  },
};

/**
 * Functional training templates
 */
export const FUNCIONAL_TEMPLATES: Record<string, { nome: string; diaSemana: string; exercicios: Exercise[] }> = {
  circuito_a: {
    nome: 'Circuito Funcional A - Full Body',
    diaSemana: 'Segunda e Quinta',
    exercicios: [
      { nome: 'Aquecimento - Polichinelos', series: 1, repeticoes: '2 min', descanso: '0s' },
      { nome: 'Agachamento com Salto', series: 4, repeticoes: '12', descanso: '30s' },
      { nome: 'Flexão de Braço', series: 4, repeticoes: '10-15', descanso: '30s' },
      { nome: 'Afundo Alternado', series: 4, repeticoes: '12 cada', descanso: '30s' },
      { nome: 'Prancha', series: 4, repeticoes: '30-45s', descanso: '30s' },
      { nome: 'Mountain Climber', series: 4, repeticoes: '20', descanso: '30s' },
      { nome: 'Burpee', series: 3, repeticoes: '8-10', descanso: '45s' },
      { nome: 'Alongamento', series: 1, repeticoes: '5 min', descanso: '0s' },
    ],
  },
  circuito_b: {
    nome: 'Circuito Funcional B - Core e Cardio',
    diaSemana: 'Terça e Sexta',
    exercicios: [
      { nome: 'Aquecimento - Corrida no lugar', series: 1, repeticoes: '3 min', descanso: '0s' },
      { nome: 'Escalador (Mountain Climber)', series: 4, repeticoes: '30s', descanso: '20s' },
      { nome: 'Prancha Lateral', series: 3, repeticoes: '30s cada lado', descanso: '20s' },
      { nome: 'Jumping Jack', series: 4, repeticoes: '30s', descanso: '20s' },
      { nome: 'Abdominal Bicicleta', series: 3, repeticoes: '20', descanso: '30s' },
      { nome: 'Skater Jump', series: 4, repeticoes: '12 cada', descanso: '30s' },
      { nome: 'Prancha com Toque no Ombro', series: 3, repeticoes: '16', descanso: '30s' },
      { nome: 'Alongamento', series: 1, repeticoes: '5 min', descanso: '0s' },
    ],
  },
  circuito_c: {
    nome: 'Circuito Funcional C - Força',
    diaSemana: 'Quarta e Sábado',
    exercicios: [
      { nome: 'Aquecimento Dinâmico', series: 1, repeticoes: '5 min', descanso: '0s' },
      { nome: 'Agachamento Búlgaro', series: 4, repeticoes: '10 cada', descanso: '45s' },
      { nome: 'Flexão Diamante', series: 3, repeticoes: '8-12', descanso: '45s' },
      { nome: 'Stiff com Peso Corporal', series: 4, repeticoes: '12', descanso: '30s' },
      { nome: 'Pike Push-up', series: 3, repeticoes: '8-10', descanso: '45s' },
      { nome: 'Elevação Pélvica', series: 4, repeticoes: '15', descanso: '30s' },
      { nome: 'Alongamento', series: 1, repeticoes: '5 min', descanso: '0s' },
    ],
  },
};

/**
 * Calisthenics workout templates
 */
export const CALISTENIA_TEMPLATES: Record<string, { nome: string; diaSemana: string; exercicios: Exercise[] }> = {
  upper: {
    nome: 'Calistenia - Membros Superiores',
    diaSemana: 'Segunda e Quinta',
    exercicios: [
      { nome: 'Aquecimento - Rotação de Ombros', series: 1, repeticoes: '2 min', descanso: '0s' },
      { nome: 'Flexão de Braço', series: 4, repeticoes: '10-15', descanso: '60s' },
      { nome: 'Barra Fixa (Pull-up)', series: 4, repeticoes: '8-12', descanso: '90s' },
      { nome: 'Pike Push-up', series: 3, repeticoes: '8-10', descanso: '60s' },
      { nome: 'Dips nas Paralelas', series: 4, repeticoes: '8-12', descanso: '90s' },
      { nome: 'Flexão Diamante', series: 3, repeticoes: '8-10', descanso: '60s' },
      { nome: 'Chin-up (Barra Supinada)', series: 3, repeticoes: '6-10', descanso: '90s' },
      { nome: 'Alongamento', series: 1, repeticoes: '5 min', descanso: '0s' },
    ],
  },
  lower: {
    nome: 'Calistenia - Membros Inferiores',
    diaSemana: 'Terça e Sexta',
    exercicios: [
      { nome: 'Aquecimento - Agachamento livre', series: 1, repeticoes: '2 min', descanso: '0s' },
      { nome: 'Pistol Squat', series: 4, repeticoes: '6-8 cada', descanso: '90s' },
      { nome: 'Agachamento Búlgaro', series: 4, repeticoes: '10 cada', descanso: '60s' },
      { nome: 'Agachamento com Salto', series: 4, repeticoes: '10-12', descanso: '60s' },
      { nome: 'Nordic Curl', series: 3, repeticoes: '5-8', descanso: '90s' },
      { nome: 'Elevação de Panturrilha em Pé', series: 4, repeticoes: '15-20', descanso: '45s' },
      { nome: 'Glute Bridge Unilateral', series: 3, repeticoes: '12 cada', descanso: '45s' },
      { nome: 'Alongamento', series: 1, repeticoes: '5 min', descanso: '0s' },
    ],
  },
  full: {
    nome: 'Calistenia - Full Body',
    diaSemana: 'Quarta e Sábado',
    exercicios: [
      { nome: 'Aquecimento Dinâmico', series: 1, repeticoes: '5 min', descanso: '0s' },
      { nome: 'Burpee', series: 4, repeticoes: '8-10', descanso: '60s' },
      { nome: 'Barra Fixa (Pull-up)', series: 4, repeticoes: '6-10', descanso: '90s' },
      { nome: 'Pistol Squat', series: 3, repeticoes: '6 cada', descanso: '90s' },
      { nome: 'Flexão Archer', series: 3, repeticoes: '6 cada', descanso: '60s' },
      { nome: 'L-Sit', series: 4, repeticoes: '10-20s', descanso: '60s' },
      { nome: 'Muscle Up', series: 3, repeticoes: '3-5', descanso: '120s' },
      { nome: 'Parada de Mãos', series: 3, repeticoes: '20-30s', descanso: '60s' },
      { nome: 'Alongamento', series: 1, repeticoes: '5 min', descanso: '0s' },
    ],
  },
};

/**
 * All modality templates combined for easy access
 */
export const MODALITY_TEMPLATES: Record<TrainingModality, Record<string, { nome: string; diaSemana: string; exercicios: Exercise[] }>> = {
  musculacao: WORKOUT_TEMPLATES,
  corrida: CORRIDA_TEMPLATES,
  crossfit: CROSSFIT_TEMPLATES,
  caminhada: CAMINHADA_TEMPLATES,
  funcional: FUNCIONAL_TEMPLATES,
  calistenia: CALISTENIA_TEMPLATES,
  '': {},
};
