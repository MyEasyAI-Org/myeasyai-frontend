/**
 * Personal Info Input Parser
 *
 * Functions to parse user input during the personal info flow.
 * Handles natural language input and extracts structured data.
 */

import type { PersonalInfoParseResult, PersonalInfoStep, UserPersonalInfo } from '../types';
import { INJURY_KEYWORDS, NEGATIVE_RESPONSES, SEX_KEYWORDS, GENDER_KEYWORDS } from '../constants';

/**
 * Parse basic info (name, sex assigned at birth, gender, age) from user input
 * Example: "Joao, 28 anos, masculino, homem"
 */
export function parseBasicInfo(input: string): PersonalInfoParseResult {
  const lowerInput = input.toLowerCase().trim();
  const result: Partial<UserPersonalInfo> = {};

  // Extract age (number followed by optional "anos")
  const ageMatch = input.match(/(\d+)\s*(anos?)?/i);
  if (ageMatch) {
    const idade = parseInt(ageMatch[1]);
    if (idade > 0 && idade < 120) {
      result.idade = idade;
    }
  }

  // Extract sex assigned at birth (prioritize explicit keywords)
  if (SEX_KEYWORDS.masculino.some((k) => lowerInput.includes(k))) {
    result.sexo = 'masculino';
  } else if (SEX_KEYWORDS.feminino.some((k) => lowerInput.includes(k))) {
    result.sexo = 'feminino';
  } else if (SEX_KEYWORDS['prefiro-nao-declarar'].some((k) => lowerInput.includes(k))) {
    result.sexo = 'prefiro-nao-declarar';
  }

  // Extract gender identity
  for (const [gender, keywords] of Object.entries(GENDER_KEYWORDS)) {
    if (gender && keywords.some((k) => lowerInput.includes(k))) {
      result.genero = gender as UserPersonalInfo['genero'];
      break;
    }
  }

  // Validate: need at least age
  if (result.idade) {
    return result;
  }

  return null;
}

/**
 * Parse measurements (weight, height) from user input
 * Example: "75kg e 175cm" or "75kg, 1.75m"
 */
export function parseMeasurements(input: string): PersonalInfoParseResult {
  const result: Partial<UserPersonalInfo> = {};

  // Extract all numbers
  const numbers = input.match(/[\d.]+/g) || [];

  for (const num of numbers) {
    const value = parseFloat(num);

    // Weight (between 20 and 300 kg)
    if (value >= 20 && value <= 300 && !result.peso) {
      result.peso = value;
    }
    // Height in meters (between 1 and 2.5)
    else if (value >= 1 && value < 3 && !result.altura) {
      result.altura = Math.round(value * 100);
    }
    // Height in cm (between 100 and 250)
    else if (value >= 100 && value <= 250 && !result.altura) {
      result.altura = Math.round(value);
    }
  }

  if (result.peso && result.altura) {
    return result;
  }

  return null;
}

/**
 * Parse objective from user input
 */
export function parseObjective(input: string): PersonalInfoParseResult {
  const trimmed = input.trim();
  if (trimmed.length > 2) {
    return { objetivo: trimmed };
  }
  return null;
}

/**
 * Parse activity level from user input
 * Accepts numbers (1-4) or text descriptions
 */
export function parseActivityLevel(input: string): PersonalInfoParseResult {
  const lowerInput = input.toLowerCase().trim();

  if (lowerInput.includes('sedentario') || lowerInput === '1') {
    return { nivelAtividade: 'sedentario' };
  }
  if (lowerInput.includes('leve') || lowerInput === '2') {
    return { nivelAtividade: 'leve' };
  }
  if (lowerInput.includes('moderado') || lowerInput === '3') {
    return { nivelAtividade: 'moderado' };
  }
  if (
    lowerInput.includes('intenso') ||
    lowerInput.includes('muito') ||
    lowerInput === '4'
  ) {
    return { nivelAtividade: 'intenso' };
  }

  return null;
}

/**
 * Parse basic info without name (sex assigned at birth, gender, and age)
 * Example: "28 anos, masculino, homem"
 */
export function parseBasicInfoSemNome(input: string): PersonalInfoParseResult {
  const lowerInput = input.toLowerCase().trim();
  const result: Partial<UserPersonalInfo> = {};

  // Extract age
  const ageMatch = input.match(/(\d+)\s*(anos?)?/i);
  if (ageMatch) {
    const idade = parseInt(ageMatch[1]);
    if (idade > 0 && idade < 120) {
      result.idade = idade;
    }
  }

  // Extract sex assigned at birth
  if (SEX_KEYWORDS.masculino.some((k) => lowerInput.includes(k))) {
    result.sexo = 'masculino';
  } else if (SEX_KEYWORDS.feminino.some((k) => lowerInput.includes(k))) {
    result.sexo = 'feminino';
  } else if (SEX_KEYWORDS['prefiro-nao-declarar'].some((k) => lowerInput.includes(k))) {
    result.sexo = 'prefiro-nao-declarar';
  }

  // Extract gender identity
  for (const [gender, keywords] of Object.entries(GENDER_KEYWORDS)) {
    if (gender && keywords.some((k) => lowerInput.includes(k))) {
      result.genero = gender as UserPersonalInfo['genero'];
      break;
    }
  }

  // Validate: need at least age (sex can be optional)
  if (result.idade) {
    return result;
  }

  return null;
}

/**
 * Parse training preferences
 * Example: "4 dias, 1 hora, intermediario, musculacao"
 */
export function parseTreinoPreferencias(input: string): PersonalInfoParseResult {
  const lowerInput = input.toLowerCase().trim();
  const result: Partial<UserPersonalInfo> = {};

  // Extract days per week (1-7)
  const daysMatch = input.match(/(\d)\s*(dias?|x|vezes)?/i);
  if (daysMatch) {
    const dias = parseInt(daysMatch[1]);
    if (dias >= 1 && dias <= 7) {
      result.diasTreinoSemana = dias;
    }
  }

  // Extract time (in minutes)
  const timeMatch = input.match(/(\d+)\s*(min|minutos?|h|hora|horas?)/i);
  if (timeMatch) {
    let tempo = parseInt(timeMatch[1]);
    if (timeMatch[2].toLowerCase().startsWith('h')) {
      tempo = tempo * 60; // Convert hours to minutes
    }
    if (tempo >= 15 && tempo <= 180) {
      result.tempoTreinoMinutos = tempo;
    }
  }

  // Extract experience level
  if (lowerInput.includes('iniciante') || lowerInput.includes('comecando') || lowerInput.includes('beginner')) {
    result.experienciaTreino = 'iniciante';
  } else if (lowerInput.includes('intermediario') || lowerInput.includes('médio') || lowerInput.includes('medio')) {
    result.experienciaTreino = 'intermediario';
  } else if (lowerInput.includes('avancado') || lowerInput.includes('avançado') || lowerInput.includes('experiente')) {
    result.experienciaTreino = 'avancado';
  }

  // Extract training preference - all modalities
  const treinoKeywords = [
    'musculacao', 'musculação', 'academia', 'peso',
    'corrida', 'correr', 'running',
    'crossfit', 'cross fit',
    'caminhada', 'caminhar', 'walking',
    'funcional', 'functional',
    'calistenia', 'calisthenic', 'peso corporal',
    'cardio', 'misto', 'hiit'
  ];
  for (const keyword of treinoKeywords) {
    if (lowerInput.includes(keyword)) {
      // Normalize to standard modality names
      let normalized = keyword.replace('ç', 'c');
      if (['correr', 'running'].includes(keyword)) normalized = 'corrida';
      if (['caminhar', 'walking'].includes(keyword)) normalized = 'caminhada';
      if (['cross fit'].includes(keyword)) normalized = 'crossfit';
      if (['calisthenic', 'peso corporal'].includes(keyword)) normalized = 'calistenia';
      if (['functional'].includes(keyword)) normalized = 'funcional';
      if (['academia', 'peso'].includes(keyword)) normalized = 'musculacao';
      result.preferenciaTreino = normalized;
      break;
    }
  }

  // Validate: need at least days per week
  if (result.diasTreinoSemana) {
    return result;
  }

  return null;
}

/**
 * Parse diet preferences
 * Example: "intolerante a lactose, gosto de frango e arroz, nao gosto de peixe, 5 refeicoes, treino a noite"
 */
export function parseDietaPreferencias(input: string): PersonalInfoParseResult {
  const lowerInput = input.toLowerCase().trim();
  const result: Partial<UserPersonalInfo> = {
    restricoesAlimentares: [],
    comidasFavoritas: [],
    comidasEvitar: [],
  };

  // Check for negative response (no restrictions)
  if (NEGATIVE_RESPONSES.includes(lowerInput)) {
    result.numeroRefeicoes = 5; // Default
    return result;
  }

  // Extract dietary restrictions
  const restricoesKeywords = [
    'lactose', 'gluten', 'vegetariano', 'vegano', 'vegan',
    'alergia', 'intolerancia', 'intolerância', 'sem carne',
    'pescetariano', 'ovo', 'soja', 'amendoim', 'frutos do mar'
  ];
  for (const keyword of restricoesKeywords) {
    if (lowerInput.includes(keyword)) {
      result.restricoesAlimentares!.push(keyword);
    }
  }

  // Extract favorite foods (look for "gosto de", "adoro", "favorito")
  const gostaMatch = input.match(/gost[oa]\s+(?:de\s+)?([^,\.]+)/gi);
  if (gostaMatch) {
    for (const match of gostaMatch) {
      const food = match.replace(/gost[oa]\s+(?:de\s+)?/i, '').trim();
      if (food.length > 1) {
        result.comidasFavoritas!.push(food);
      }
    }
  }

  const adoroMatch = input.match(/ador[oa]\s+([^,\.]+)/gi);
  if (adoroMatch) {
    for (const match of adoroMatch) {
      const food = match.replace(/ador[oa]\s+/i, '').trim();
      if (food.length > 1) {
        result.comidasFavoritas!.push(food);
      }
    }
  }

  // Extract foods to avoid (look for "não gosto", "evitar", "odeio")
  const naoGostaMatch = input.match(/(?:n[aã]o\s+gost[oa]|evitar?|odei[oa])\s+(?:de\s+)?([^,\.]+)/gi);
  if (naoGostaMatch) {
    for (const match of naoGostaMatch) {
      const food = match.replace(/(?:n[aã]o\s+gost[oa]|evitar?|odei[oa])\s+(?:de\s+)?/i, '').trim();
      if (food.length > 1) {
        result.comidasEvitar!.push(food);
      }
    }
  }

  // Extract number of meals
  const refeicoesMatch = input.match(/(\d)\s*(?:refeic[oõ]es?|x|vezes)/i);
  if (refeicoesMatch) {
    const num = parseInt(refeicoesMatch[1]);
    if (num >= 2 && num <= 8) {
      result.numeroRefeicoes = num;
    }
  }

  // Extract training time
  if (lowerInput.includes('manha') || lowerInput.includes('manhã') || lowerInput.includes('cedo')) {
    result.horarioTreino = 'manha';
  } else if (lowerInput.includes('tarde')) {
    result.horarioTreino = 'tarde';
  } else if (lowerInput.includes('noite') || lowerInput.includes('fim do dia')) {
    result.horarioTreino = 'noite';
  }

  // Always return result for diet preferences (all fields are optional)
  return result;
}

/**
 * Parse health info (restrictions and injuries) from user input
 * Automatically classifies items as restrictions or injuries based on keywords
 */
export function parseHealthInfo(input: string): PersonalInfoParseResult {
  const lowerInput = input.toLowerCase().trim();

  // Check for negative responses
  if (NEGATIVE_RESPONSES.includes(lowerInput)) {
    return {
      restricoesMedicas: [],
      lesoes: [],
    };
  }

  const result: Partial<UserPersonalInfo> = {
    restricoesMedicas: [],
    lesoes: [],
  };

  // Split by comma and classify each item
  const items = input
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  for (const item of items) {
    const lowerItem = item.toLowerCase();

    // Check if item contains injury keywords
    const isInjury = INJURY_KEYWORDS.some((keyword) =>
      lowerItem.includes(keyword)
    );

    if (isInjury) {
      result.lesoes!.push(item);
    } else {
      result.restricoesMedicas!.push(item);
    }
  }

  return result;
}

/**
 * Main parser function - routes to appropriate parser based on step
 */
export function parsePersonalInfoResponse(
  step: PersonalInfoStep,
  input: string
): PersonalInfoParseResult {
  switch (step) {
    case 'info_basica':
      return parseBasicInfo(input);
    case 'info_basica_sem_nome':
      return parseBasicInfoSemNome(input);
    case 'medidas':
      return parseMeasurements(input);
    case 'objetivo':
      return parseObjective(input);
    case 'atividade':
      return parseActivityLevel(input);
    case 'treino_preferencias':
      return parseTreinoPreferencias(input);
    case 'dieta_preferencias':
      return parseDietaPreferencias(input);
    case 'saude':
      return parseHealthInfo(input);
    default:
      return null;
  }
}

/**
 * Get the next personal info step
 * Note: treino_preferencias and dieta_preferencias are asked on-demand
 * when user requests workout or diet generation
 */
export function getNextPersonalInfoStep(currentStep: PersonalInfoStep): PersonalInfoStep {
  const steps: PersonalInfoStep[] = [
    'info_basica',
    'medidas',
    'objetivo',
    'atividade',
    'saude',
    'complete',
  ];

  // Handle special case for info_basica_sem_nome (same next step as info_basica)
  if (currentStep === 'info_basica_sem_nome') {
    return 'medidas';
  }

  const currentIndex = steps.indexOf(currentStep);
  return steps[currentIndex + 1] || 'complete';
}

/**
 * Check if personal info is complete
 */
export function isPersonalInfoComplete(step: PersonalInfoStep): boolean {
  return step === 'complete';
}
