/**
 * Fitness Calculations
 *
 * Utility functions for fitness-related calculations like BMI, calories, and macros.
 */

import type { BiologicalSex, BMIClassification, MacrosResult, UserPersonalInfo } from '../types';
import { getActivityFactor } from '../constants';

/**
 * Calculate BMI (Body Mass Index)
 */
export function calculateBMI(peso: number, altura: number): number | null {
  if (!peso || !altura || altura <= 0) {
    return null;
  }

  const alturaMetros = altura / 100;
  return peso / (alturaMetros * alturaMetros);
}

/**
 * Get BMI classification with label and color
 */
export function getBMIClassification(bmi: number): BMIClassification {
  if (bmi < 18.5) {
    return { value: bmi, label: 'Abaixo do peso', color: 'text-yellow-400' };
  }
  if (bmi < 25) {
    return { value: bmi, label: 'Peso normal', color: 'text-green-400' };
  }
  if (bmi < 30) {
    return { value: bmi, label: 'Sobrepeso', color: 'text-orange-400' };
  }
  return { value: bmi, label: 'Obesidade', color: 'text-red-400' };
}

/**
 * Calculate BMR (Basal Metabolic Rate) using Harris-Benedict formula
 */
export function calculateBMR(
  peso: number,
  altura: number,
  idade: number,
  sexo: BiologicalSex
): number {
  if (!peso || !altura || !idade) {
    return 0;
  }

  if (sexo === 'feminino') {
    return 655 + 9.6 * peso + 1.8 * altura - 4.7 * idade;
  }

  // Default to male formula
  return 66 + 13.7 * peso + 5 * altura - 6.8 * idade;
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 */
export function calculateTDEE(bmr: number, activityLevel: string): number {
  const factor = getActivityFactor(activityLevel as any);
  return Math.round(bmr * factor);
}

/**
 * Adjust calories based on objective
 */
export function adjustCaloriesForGoal(calories: number, objetivo: string): number {
  const lowerObjectivo = objetivo.toLowerCase();

  // Weight loss: 15% deficit
  if (lowerObjectivo.includes('perder') || lowerObjectivo.includes('emagrecer')) {
    return Math.round(calories * 0.85);
  }

  // Muscle gain: 15% surplus
  if (lowerObjectivo.includes('ganhar') || lowerObjectivo.includes('massa')) {
    return Math.round(calories * 1.15);
  }

  // Maintenance
  return calories;
}

/**
 * Calculate macronutrients based on calories and weight
 */
export function calculateMacros(
  calories: number,
  peso: number,
  objetivo: string
): { proteinas: number; carboidratos: number; gorduras: number } {
  const lowerObjectivo = objetivo.toLowerCase();

  // Protein: 2g per kg for muscle building, 1.6g for weight loss, 1.8g default
  let proteinMultiplier = 1.8;
  if (lowerObjectivo.includes('ganhar') || lowerObjectivo.includes('massa')) {
    proteinMultiplier = 2.2;
  } else if (lowerObjectivo.includes('perder') || lowerObjectivo.includes('emagrecer')) {
    proteinMultiplier = 2.0; // Higher protein during cut to preserve muscle
  }

  const proteinas = Math.round(peso * proteinMultiplier);

  // Fat: 25% of calories
  const gorduras = Math.round((calories * 0.25) / 9);

  // Carbs: remaining calories
  const carboidratos = Math.round((calories - proteinas * 4 - gorduras * 9) / 4);

  return { proteinas, carboidratos, gorduras };
}

/**
 * Calculate complete macros from personal info data
 */
export function calculateMacrosFromPersonalInfo(personalInfo: UserPersonalInfo): MacrosResult | null {
  const { peso, altura, idade, sexo, nivelAtividade, objetivo } = personalInfo;

  if (!peso || !altura || !idade) {
    return null;
  }

  const tmb = calculateBMR(peso, altura, idade, sexo);
  let calorias = calculateTDEE(tmb, nivelAtividade);
  calorias = adjustCaloriesForGoal(calorias, objetivo);

  const { proteinas, carboidratos, gorduras } = calculateMacros(calorias, peso, objetivo);

  return {
    calorias,
    proteinas,
    carboidratos,
    gorduras,
    tmb,
  };
}

/**
 * Format BMI for display
 */
export function formatBMI(peso: number, altura: number): string {
  const bmi = calculateBMI(peso, altura);
  return bmi ? bmi.toFixed(1) : '--';
}

/**
 * Generate user context string for AI responses
 * Includes ALL relevant personal info for transparency
 */
export function generateUserContext(
  personalInfo: UserPersonalInfo,
  treinosCount: number,
  hasDieta: boolean
): string {
  const parts: string[] = [];

  // Basic personal info
  if (personalInfo.nome) {
    parts.push(`Nome: ${personalInfo.nome}`);
  }
  if (personalInfo.idade) {
    parts.push(`Idade: ${personalInfo.idade} anos`);
  }
  if (personalInfo.sexo) {
    parts.push(`Sexo: ${personalInfo.sexo}`);
  }
  if (personalInfo.genero && personalInfo.genero !== 'prefiro-nao-declarar') {
    parts.push(`Genero: ${personalInfo.genero}`);
  }
  if (personalInfo.peso) {
    parts.push(`Peso: ${personalInfo.peso}kg`);
  }
  if (personalInfo.altura) {
    parts.push(`Altura: ${personalInfo.altura}cm`);
    if (personalInfo.peso) {
      const bmi = calculateBMI(personalInfo.peso, personalInfo.altura);
      if (bmi) {
        parts.push(`IMC: ${bmi.toFixed(1)}`);
      }
    }
  }

  // Goals and activity
  if (personalInfo.objetivo) {
    parts.push(`Objetivo: ${personalInfo.objetivo}`);
  }
  if (personalInfo.nivelAtividade) {
    parts.push(`Nivel de atividade: ${personalInfo.nivelAtividade}`);
  }

  // Health info
  if (personalInfo.restricoesMedicas && personalInfo.restricoesMedicas.length > 0) {
    parts.push(`Restricoes medicas: ${personalInfo.restricoesMedicas.join(', ')}`);
  }
  if (personalInfo.lesoes && personalInfo.lesoes.length > 0) {
    parts.push(`Lesoes: ${personalInfo.lesoes.join(', ')}`);
  }

  // Training preferences
  if (personalInfo.preferenciaTreino) {
    parts.push(`Modalidade: ${personalInfo.preferenciaTreino}`);
  }
  if (personalInfo.diasTreinoSemana) {
    parts.push(`Dias por semana: ${personalInfo.diasTreinoSemana}`);
  }
  if (personalInfo.tempoTreinoMinutos) {
    parts.push(`Tempo por sessao: ${personalInfo.tempoTreinoMinutos}min`);
  }
  if (personalInfo.experienciaTreino) {
    parts.push(`Experiencia: ${personalInfo.experienciaTreino}`);
  }

  // Diet preferences
  if (personalInfo.numeroRefeicoes) {
    parts.push(`Refeicoes/dia: ${personalInfo.numeroRefeicoes}`);
  }
  if (personalInfo.horarioTreino) {
    parts.push(`Horario treino: ${personalInfo.horarioTreino}`);
  }
  if (personalInfo.restricoesAlimentares && personalInfo.restricoesAlimentares.length > 0) {
    parts.push(`Restricoes alimentares: ${personalInfo.restricoesAlimentares.join(', ')}`);
  }
  if (personalInfo.comidasFavoritas && personalInfo.comidasFavoritas.length > 0) {
    parts.push(`Favoritas: ${personalInfo.comidasFavoritas.join(', ')}`);
  }
  if (personalInfo.comidasEvitar && personalInfo.comidasEvitar.length > 0) {
    parts.push(`Evitar: ${personalInfo.comidasEvitar.join(', ')}`);
  }

  // Current state
  if (treinosCount > 0) {
    parts.push(`Treinos configurados: ${treinosCount}`);
  }
  if (hasDieta) {
    parts.push('Dieta configurada: sim');
  }

  return parts.join(' | ');
}

/**
 * Get fresh personal info summary for display before generation
 * Returns a formatted string of the data that will be used
 */
export function getPersonalInfoSummaryForGeneration(personalInfo: UserPersonalInfo): string {
  const lines: string[] = [];

  lines.push('📊 **Dados utilizados para geracao:**');

  // Physical data
  if (personalInfo.idade || personalInfo.peso || personalInfo.altura) {
    let physicalLine = '';
    if (personalInfo.idade) physicalLine += `${personalInfo.idade} anos`;
    if (personalInfo.sexo) physicalLine += `, ${personalInfo.sexo}`;
    if (personalInfo.peso) physicalLine += `, ${personalInfo.peso}kg`;
    if (personalInfo.altura) physicalLine += `, ${personalInfo.altura}cm`;
    lines.push(`• Dados fisicos: ${physicalLine}`);
  }

  // Goal
  if (personalInfo.objetivo) {
    lines.push(`• Objetivo: ${personalInfo.objetivo}`);
  }

  // Activity and experience
  if (personalInfo.nivelAtividade || personalInfo.experienciaTreino) {
    let activityLine = '';
    if (personalInfo.nivelAtividade) activityLine += `Atividade: ${personalInfo.nivelAtividade}`;
    if (personalInfo.experienciaTreino) activityLine += `${activityLine ? ', ' : ''}Experiencia: ${personalInfo.experienciaTreino}`;
    lines.push(`• ${activityLine}`);
  }

  // Training preferences
  if (personalInfo.preferenciaTreino || personalInfo.diasTreinoSemana || personalInfo.tempoTreinoMinutos) {
    let treinoLine = '';
    if (personalInfo.preferenciaTreino) treinoLine += `Modalidade: ${personalInfo.preferenciaTreino}`;
    if (personalInfo.diasTreinoSemana) treinoLine += `${treinoLine ? ', ' : ''}${personalInfo.diasTreinoSemana} dias/sem`;
    if (personalInfo.tempoTreinoMinutos) treinoLine += `${treinoLine ? ', ' : ''}${personalInfo.tempoTreinoMinutos}min/sessao`;
    lines.push(`• ${treinoLine}`);
  }

  // Health restrictions
  if ((personalInfo.lesoes && personalInfo.lesoes.length > 0) ||
      (personalInfo.restricoesMedicas && personalInfo.restricoesMedicas.length > 0)) {
    let healthLine = '';
    if (personalInfo.lesoes && personalInfo.lesoes.length > 0) {
      healthLine += `Lesoes: ${personalInfo.lesoes.join(', ')}`;
    }
    if (personalInfo.restricoesMedicas && personalInfo.restricoesMedicas.length > 0) {
      healthLine += `${healthLine ? ', ' : ''}Restricoes: ${personalInfo.restricoesMedicas.join(', ')}`;
    }
    lines.push(`• ${healthLine}`);
  }

  // Diet preferences (for diet generation)
  if (personalInfo.numeroRefeicoes || personalInfo.horarioTreino ||
      (personalInfo.restricoesAlimentares && personalInfo.restricoesAlimentares.length > 0)) {
    let dietLine = '';
    if (personalInfo.numeroRefeicoes) dietLine += `${personalInfo.numeroRefeicoes} refeicoes/dia`;
    if (personalInfo.horarioTreino) dietLine += `${dietLine ? ', ' : ''}Treino: ${personalInfo.horarioTreino}`;
    if (personalInfo.restricoesAlimentares && personalInfo.restricoesAlimentares.length > 0) {
      dietLine += `${dietLine ? ', ' : ''}Restricoes: ${personalInfo.restricoesAlimentares.join(', ')}`;
    }
    if (dietLine) lines.push(`• ${dietLine}`);
  }

  return lines.join('\n');
}
