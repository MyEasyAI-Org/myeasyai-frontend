/**
 * Anamnese Input Parser
 *
 * Functions to parse user input during the anamnese flow.
 * Handles natural language input and extracts structured data.
 */

import type { AnamneseParseResult, AnamneseStep, UserAnamnese } from '../types';
import { INJURY_KEYWORDS, NEGATIVE_RESPONSES, SEX_KEYWORDS } from '../constants';

/**
 * Parse basic info (name, sex, age) from user input
 * Example: "Joao, masculino, 28 anos"
 */
export function parseBasicInfo(input: string): AnamneseParseResult {
  const lowerInput = input.toLowerCase().trim();
  const result: Partial<UserAnamnese> = {};

  // Extract age (number followed by optional "anos")
  const ageMatch = input.match(/(\d+)\s*(anos?)?/i);
  if (ageMatch) {
    const idade = parseInt(ageMatch[1]);
    if (idade > 0 && idade < 120) {
      result.idade = idade;
    }
  }

  // Extract sex
  if (
    SEX_KEYWORDS.masculino.some((k) => lowerInput.includes(k)) ||
    /\bm\b/.test(lowerInput)
  ) {
    result.sexo = 'masculino';
  } else if (
    SEX_KEYWORDS.feminino.some((k) => lowerInput.includes(k)) ||
    /\bf\b/.test(lowerInput)
  ) {
    result.sexo = 'feminino';
  }

  // Extract name (remove numbers, sex words, and common words)
  const cleanedName = input
    .replace(/\d+\s*(anos?)?/gi, '')
    .replace(/masculino|feminino|homem|mulher|masc|fem/gi, '')
    .replace(/[,.\-]/g, ' ')
    .trim();

  // Get first significant word as name
  const words = cleanedName.split(/\s+/).filter((p) => p.length > 1);
  if (words.length > 0) {
    result.nome =
      words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
  }

  // Validate: need at least name and age
  if (result.nome && result.idade) {
    return result;
  }

  return null;
}

/**
 * Parse measurements (weight, height) from user input
 * Example: "75kg e 175cm" or "75kg, 1.75m"
 */
export function parseMeasurements(input: string): AnamneseParseResult {
  const result: Partial<UserAnamnese> = {};

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
export function parseObjective(input: string): AnamneseParseResult {
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
export function parseActivityLevel(input: string): AnamneseParseResult {
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
 * Parse health info (restrictions and injuries) from user input
 * Automatically classifies items as restrictions or injuries based on keywords
 */
export function parseHealthInfo(input: string): AnamneseParseResult {
  const lowerInput = input.toLowerCase().trim();

  // Check for negative responses
  if (NEGATIVE_RESPONSES.includes(lowerInput)) {
    return {
      restricoesMedicas: [],
      lesoes: [],
    };
  }

  const result: Partial<UserAnamnese> = {
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
export function parseAnamneseResponse(
  step: AnamneseStep,
  input: string
): AnamneseParseResult {
  switch (step) {
    case 'info_basica':
      return parseBasicInfo(input);
    case 'medidas':
      return parseMeasurements(input);
    case 'objetivo':
      return parseObjective(input);
    case 'atividade':
      return parseActivityLevel(input);
    case 'saude':
      return parseHealthInfo(input);
    default:
      return null;
  }
}

/**
 * Get the next anamnese step
 */
export function getNextAnamneseStep(currentStep: AnamneseStep): AnamneseStep {
  const steps: AnamneseStep[] = [
    'info_basica',
    'medidas',
    'objetivo',
    'atividade',
    'saude',
    'complete',
  ];

  const currentIndex = steps.indexOf(currentStep);
  return steps[currentIndex + 1] || 'complete';
}

/**
 * Check if anamnese is complete
 */
export function isAnamneseComplete(step: AnamneseStep): boolean {
  return step === 'complete';
}
