/**
 * Diet Generator
 *
 * Functions to generate personalized diet plans based on user profile.
 */

import type { Dieta, UserAnamnese } from '../types';
import { DEFAULT_DIET_TEMPLATE } from '../constants';
import { calculateMacrosFromAnamnese } from './fitnessCalculations';

/**
 * Generate a diet plan based on user profile
 */
export function generateDiet(anamnese: UserAnamnese): Dieta {
  const macros = calculateMacrosFromAnamnese(anamnese);

  if (macros) {
    return {
      calorias: macros.calorias,
      proteinas: macros.proteinas,
      carboidratos: macros.carboidratos,
      gorduras: macros.gorduras,
      refeicoes: [...DEFAULT_DIET_TEMPLATE.refeicoes],
    };
  }

  // Default values if calculation not possible
  return {
    calorias: 2000,
    proteinas: 150,
    carboidratos: 200,
    gorduras: 67,
    refeicoes: [...DEFAULT_DIET_TEMPLATE.refeicoes],
  };
}

/**
 * Generate diet response message
 */
export function generateDietResponseMessage(
  anamnese: UserAnamnese,
  dieta: Dieta
): string {
  let resposta = `Criei um plano alimentar personalizado para voce, ${anamnese.nome}! Confira na aba "Dieta".\n\n`;

  resposta += `📊 Seus macros diarios:\n`;
  resposta += `• ${dieta.calorias} kcal\n`;
  resposta += `• ${dieta.proteinas}g proteinas\n`;
  resposta += `• ${dieta.carboidratos}g carboidratos\n`;
  resposta += `• ${dieta.gorduras}g gorduras\n\n`;

  if (anamnese.objetivo) {
    resposta += `Este plano foi ajustado para seu objetivo de "${anamnese.objetivo}".\n\n`;
  }

  if (anamnese.restricoesMedicas.length > 0) {
    resposta += `⚠️ Lembre-se de suas restricoes: ${anamnese.restricoesMedicas.join(', ')}. Consulte um nutricionista para ajustes especificos.\n\n`;
  }

  resposta += 'Voce pode editar os alimentos e horarios diretamente na aba Dieta!';

  return resposta;
}

/**
 * Check if user asked for diet in message
 */
export function isDietRequest(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return (
    lowerMessage.includes('dieta') ||
    lowerMessage.includes('nutricao') ||
    lowerMessage.includes('alimentacao') ||
    lowerMessage.includes('comer') ||
    lowerMessage.includes('caloria')
  );
}

/**
 * Check if user asked for status/summary
 */
export function isStatusRequest(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return (
    lowerMessage.includes('status') ||
    lowerMessage.includes('resumo') ||
    lowerMessage.includes('meus dados')
  );
}
