/**
 * Fitness Calculations
 *
 * Utility functions for fitness-related calculations like BMI, calories, and macros.
 */

import type { BiologicalSex, BMIClassification, MacrosResult, UserAnamnese } from '../types';
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
 * Calculate complete macros from anamnese data
 */
export function calculateMacrosFromAnamnese(anamnese: UserAnamnese): MacrosResult | null {
  const { peso, altura, idade, sexo, nivelAtividade, objetivo } = anamnese;

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
 */
export function generateUserContext(
  anamnese: UserAnamnese,
  treinosCount: number,
  hasDieta: boolean
): string {
  const parts: string[] = [];

  if (anamnese.nome) {
    parts.push(`Nome: ${anamnese.nome}`);
  }
  if (anamnese.idade) {
    parts.push(`Idade: ${anamnese.idade} anos`);
  }
  if (anamnese.sexo) {
    parts.push(`Sexo: ${anamnese.sexo}`);
  }
  if (anamnese.peso) {
    parts.push(`Peso: ${anamnese.peso}kg`);
  }
  if (anamnese.altura) {
    parts.push(`Altura: ${anamnese.altura}cm`);
    if (anamnese.peso) {
      const bmi = calculateBMI(anamnese.peso, anamnese.altura);
      if (bmi) {
        parts.push(`IMC: ${bmi.toFixed(1)}`);
      }
    }
  }
  if (anamnese.objetivo) {
    parts.push(`Objetivo: ${anamnese.objetivo}`);
  }
  if (anamnese.nivelAtividade) {
    parts.push(`Nivel de atividade: ${anamnese.nivelAtividade}`);
  }
  if (anamnese.restricoesMedicas.length > 0) {
    parts.push(`Restricoes medicas: ${anamnese.restricoesMedicas.join(', ')}`);
  }
  if (anamnese.lesoes.length > 0) {
    parts.push(`Lesoes: ${anamnese.lesoes.join(', ')}`);
  }
  if (treinosCount > 0) {
    parts.push(`Treinos configurados: ${treinosCount}`);
  }
  if (hasDieta) {
    parts.push('Dieta configurada: sim');
  }

  return parts.join(' | ');
}
