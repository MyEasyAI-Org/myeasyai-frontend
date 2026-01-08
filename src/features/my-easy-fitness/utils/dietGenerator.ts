/**
 * Diet Generator
 *
 * Functions to generate personalized diet plans based on user profile.
 * Now creates truly personalized diets based on:
 * - Calculated macros (protein, carbs, fat targets)
 * - Dietary restrictions (lactose, gluten, vegetarian, etc)
 * - Favorite foods to include
 * - Foods to avoid
 * - Number of meals per day
 * - Training time (to adjust pre/post workout meals)
 */

import type { Alimento, Dieta, Refeicao, UserPersonalInfo } from '../types';
import { getNutritionalInfo, NUTRITIONAL_DATABASE } from '../constants';
import { calculateMacrosFromPersonalInfo } from './fitnessCalculations';

/**
 * Food substitutions for dietary restrictions
 */
const FOOD_SUBSTITUTIONS: Record<string, { original: string[]; substitute: string }[]> = {
  lactose: [
    { original: ['leite', 'iogurte'], substitute: 'leite de amendoas' },
    { original: ['queijo'], substitute: 'queijo vegano' },
    { original: ['whey'], substitute: 'proteina vegetal (ervilha)' },
  ],
  gluten: [
    { original: ['pao', 'pão'], substitute: 'pao sem gluten' },
    { original: ['macarrao', 'macarrão', 'massa'], substitute: 'macarrao de arroz' },
    { original: ['aveia'], substitute: 'aveia sem gluten' },
  ],
  vegetariano: [
    { original: ['frango', 'carne', 'peixe', 'atum'], substitute: 'tofu grelhado' },
    { original: ['ovo'], substitute: 'ovo' }, // Keep eggs for vegetarians
  ],
  vegano: [
    { original: ['frango', 'carne', 'peixe', 'atum'], substitute: 'tofu grelhado' },
    { original: ['ovo', 'ovos'], substitute: 'tofu mexido' },
    { original: ['leite', 'iogurte'], substitute: 'leite de amendoas' },
    { original: ['queijo'], substitute: 'queijo vegano' },
    { original: ['whey'], substitute: 'proteina vegetal (ervilha)' },
  ],
};

/**
 * Create an Alimento object with calculated macros
 */
function createAlimento(nome: string, gramas: number): Alimento {
  const info = getNutritionalInfo(nome);
  if (info) {
    const multiplier = gramas / 100;
    return {
      nome,
      gramas,
      proteinas: Math.round(info.proteinas * multiplier * 10) / 10,
      carboidratos: Math.round(info.carboidratos * multiplier * 10) / 10,
      gorduras: Math.round(info.gorduras * multiplier * 10) / 10,
      calorias: Math.round(info.calorias * multiplier),
    };
  }
  // Default for unknown foods
  return { nome, gramas };
}

/**
 * Get typical portion size for a food
 */
function getTypicalPortion(foodName: string): number {
  const info = getNutritionalInfo(foodName);
  return info?.porcaoTipica ?? 100;
}

/**
 * Apply food substitutions based on restrictions
 */
function applyRestrictions(foodName: string, restricoes: string[]): string {
  let result = foodName.toLowerCase();

  for (const restricao of restricoes) {
    const lowerRestricao = restricao.toLowerCase();
    const substitutions = FOOD_SUBSTITUTIONS[lowerRestricao];

    if (substitutions) {
      for (const sub of substitutions) {
        if (sub.original.some((orig) => result.includes(orig))) {
          result = sub.substitute;
          break;
        }
      }
    }
  }

  return result;
}

/**
 * Check if food should be avoided
 */
function shouldAvoidFood(foodName: string, comidasEvitar: string[]): boolean {
  if (!comidasEvitar || comidasEvitar.length === 0) return false;
  const lowerFood = foodName.toLowerCase();
  return comidasEvitar.some((evitar) => lowerFood.includes(evitar.toLowerCase()));
}

/**
 * Calculate meal distribution percentages based on number of meals and training time
 */
function getMealDistribution(
  numRefeicoes: number,
  horarioTreino: string
): { nome: string; horario: string; percentualCalorias: number; isPreTreino?: boolean; isPosTreino?: boolean }[] {
  // Base distributions by number of meals
  const distributions: Record<number, { nome: string; horario: string; percentualCalorias: number }[]> = {
    3: [
      { nome: 'Cafe da Manha', horario: '07:00', percentualCalorias: 30 },
      { nome: 'Almoco', horario: '12:30', percentualCalorias: 40 },
      { nome: 'Jantar', horario: '19:30', percentualCalorias: 30 },
    ],
    4: [
      { nome: 'Cafe da Manha', horario: '07:00', percentualCalorias: 25 },
      { nome: 'Almoco', horario: '12:30', percentualCalorias: 35 },
      { nome: 'Lanche da Tarde', horario: '16:00', percentualCalorias: 15 },
      { nome: 'Jantar', horario: '19:30', percentualCalorias: 25 },
    ],
    5: [
      { nome: 'Cafe da Manha', horario: '07:00', percentualCalorias: 20 },
      { nome: 'Lanche da Manha', horario: '10:00', percentualCalorias: 10 },
      { nome: 'Almoco', horario: '12:30', percentualCalorias: 30 },
      { nome: 'Lanche da Tarde', horario: '16:00', percentualCalorias: 15 },
      { nome: 'Jantar', horario: '19:30', percentualCalorias: 25 },
    ],
    6: [
      { nome: 'Cafe da Manha', horario: '07:00', percentualCalorias: 18 },
      { nome: 'Lanche da Manha', horario: '10:00', percentualCalorias: 10 },
      { nome: 'Almoco', horario: '12:30', percentualCalorias: 25 },
      { nome: 'Lanche da Tarde', horario: '16:00', percentualCalorias: 12 },
      { nome: 'Jantar', horario: '19:30', percentualCalorias: 22 },
      { nome: 'Ceia', horario: '21:30', percentualCalorias: 13 },
    ],
  };

  let meals = distributions[numRefeicoes] || distributions[5];
  meals = meals.map((m) => ({ ...m })); // Clone

  // Adjust for training time
  if (horarioTreino === 'manha') {
    // Pre-workout: early breakfast, Post-workout: mid-morning snack
    meals[0] = { ...meals[0], horario: '06:00', isPreTreino: true } as any;
    if (meals.length > 1) {
      meals[1] = { nome: 'Pos-Treino', horario: '09:00', percentualCalorias: meals[1].percentualCalorias + 5, isPosTreino: true } as any;
      meals[0].percentualCalorias -= 5;
    }
  } else if (horarioTreino === 'noite') {
    // Pre-workout: late afternoon, Post-workout: dinner
    const lastIndex = meals.length - 1;
    if (lastIndex > 0) {
      meals[lastIndex - 1] = { ...meals[lastIndex - 1], nome: 'Pre-Treino', horario: '18:00', isPreTreino: true } as any;
      meals[lastIndex] = { ...meals[lastIndex], nome: 'Pos-Treino / Jantar', horario: '21:00', isPosTreino: true } as any;
    }
  }

  return meals;
}

/**
 * Generate food items for a meal based on macro targets
 */
function generateMealFoods(
  targetCalorias: number,
  targetProteinas: number,
  targetCarboidratos: number,
  targetGorduras: number,
  mealType: string,
  personalInfo: UserPersonalInfo,
  isPreTreino?: boolean,
  isPosTreino?: boolean
): Alimento[] {
  const alimentos: Alimento[] = [];
  const restricoes = personalInfo.restricoesAlimentares || [];
  const comidasEvitar = personalInfo.comidasEvitar || [];
  const comidasFavoritas = personalInfo.comidasFavoritas || [];

  let remainingProteinas = targetProteinas;
  let remainingCarboidratos = targetCarboidratos;
  let remainingGorduras = targetGorduras;

  // Helper to add food if not avoided
  const tryAddFood = (foodName: string, gramas: number): boolean => {
    const substituted = applyRestrictions(foodName, restricoes);
    if (shouldAvoidFood(substituted, comidasEvitar)) return false;

    const alimento = createAlimento(substituted, gramas);
    alimentos.push(alimento);

    if (alimento.proteinas) remainingProteinas -= alimento.proteinas;
    if (alimento.carboidratos) remainingCarboidratos -= alimento.carboidratos;
    if (alimento.gorduras) remainingGorduras -= alimento.gorduras;

    return true;
  };

  // Calculate portion sizes based on macro targets
  const calculateProteinPortion = (foodName: string, targetProtein: number): number => {
    const info = getNutritionalInfo(foodName);
    if (!info || info.proteinas === 0) return getTypicalPortion(foodName);
    return Math.round((targetProtein / info.proteinas) * 100);
  };

  const calculateCarbPortion = (foodName: string, targetCarbs: number): number => {
    const info = getNutritionalInfo(foodName);
    if (!info || info.carboidratos === 0) return getTypicalPortion(foodName);
    return Math.round((targetCarbs / info.carboidratos) * 100);
  };

  // Meal-specific food selection
  const mealLower = mealType.toLowerCase();

  if (mealLower.includes('cafe') || mealLower.includes('manha')) {
    // Breakfast foods
    if (isPreTreino) {
      // Light pre-workout: easy digestion carbs
      tryAddFood('banana', 120);
      tryAddFood('aveia', Math.min(50, calculateCarbPortion('aveia', remainingCarboidratos * 0.6)));
      if (remainingCarboidratos > 15) {
        tryAddFood('mel', 15);
      }
    } else if (isPosTreino) {
      // Post-workout: protein + fast carbs
      const proteinPortion = calculateProteinPortion('whey protein', remainingProteinas * 0.7);
      tryAddFood('whey protein', Math.min(40, proteinPortion));
      tryAddFood('banana', 120);
      tryAddFood('aveia', 40);
    } else {
      // Regular breakfast
      const eggPortion = calculateProteinPortion('ovos mexidos', remainingProteinas * 0.6);
      tryAddFood('ovos mexidos', Math.min(150, Math.max(100, eggPortion)));
      tryAddFood('pao integral', 50);
      tryAddFood('banana', 120);
    }
    tryAddFood('cafe', 100);

  } else if (mealLower.includes('lanche')) {
    // Snacks
    if (isPosTreino) {
      const proteinPortion = calculateProteinPortion('whey protein', remainingProteinas * 0.8);
      tryAddFood('whey protein', Math.min(40, proteinPortion));
      tryAddFood('banana', 120);
    } else if (isPreTreino) {
      // Pre-workout snack
      tryAddFood('batata doce', Math.min(200, calculateCarbPortion('batata doce', remainingCarboidratos * 0.7)));
      const proteinPortion = calculateProteinPortion('frango grelhado', remainingProteinas * 0.5);
      tryAddFood('frango grelhado', Math.min(100, proteinPortion));
    } else {
      // Regular snack
      tryAddFood('iogurte natural', 170);
      tryAddFood('granola', 40);
      tryAddFood('frutas vermelhas', 100);
    }

  } else if (mealLower.includes('almoco')) {
    // Lunch - main meal
    // Protein source
    const proteinPortion = calculateProteinPortion('frango grelhado', remainingProteinas * 0.7);
    tryAddFood('frango grelhado', Math.min(200, Math.max(120, proteinPortion)));

    // Carb sources
    const carbPortion = calculateCarbPortion('arroz integral', remainingCarboidratos * 0.5);
    tryAddFood('arroz integral', Math.min(200, Math.max(100, carbPortion)));
    tryAddFood('feijao', Math.min(100, calculateCarbPortion('feijao', remainingCarboidratos * 0.3)));

    // Vegetables and fat
    tryAddFood('salada verde', 100);
    tryAddFood('azeite', Math.min(15, Math.round(remainingGorduras * 0.3)));

  } else if (mealLower.includes('jantar') || mealLower.includes('pos-treino')) {
    // Dinner
    if (isPosTreino) {
      // Post-workout dinner: more protein and carbs
      const proteinPortion = calculateProteinPortion('frango grelhado', remainingProteinas * 0.8);
      tryAddFood('frango grelhado', Math.min(200, Math.max(150, proteinPortion)));

      const carbPortion = calculateCarbPortion('arroz integral', remainingCarboidratos * 0.6);
      tryAddFood('arroz integral', Math.min(200, Math.max(120, carbPortion)));
    } else {
      // Regular dinner
      const proteinPortion = calculateProteinPortion('peixe assado', remainingProteinas * 0.7);
      tryAddFood('peixe assado', Math.min(200, Math.max(120, proteinPortion)));

      const carbPortion = calculateCarbPortion('batata doce', remainingCarboidratos * 0.5);
      tryAddFood('batata doce', Math.min(250, Math.max(150, carbPortion)));
    }
    tryAddFood('legumes', 150);
    tryAddFood('salada', 100);

  } else if (mealLower.includes('ceia')) {
    // Late night snack - lighter
    tryAddFood('iogurte grego', 170);
    tryAddFood('castanhas', 30);

  } else if (mealLower.includes('pre-treino')) {
    // Pre-workout meal
    const carbPortion = calculateCarbPortion('batata doce', remainingCarboidratos * 0.6);
    tryAddFood('batata doce', Math.min(200, carbPortion));
    const proteinPortion = calculateProteinPortion('frango grelhado', remainingProteinas * 0.5);
    tryAddFood('frango grelhado', Math.min(120, proteinPortion));
    tryAddFood('salada', 80);
  }

  // Try to include favorite foods if they fit the meal type
  for (const favorita of comidasFavoritas) {
    const lowerFav = favorita.toLowerCase();
    const info = getNutritionalInfo(lowerFav);

    // Skip if already added or if it doesn't fit remaining macros
    if (alimentos.some((a) => a.nome.toLowerCase().includes(lowerFav))) continue;
    if (!info) continue;

    // Add favorite if it fits the meal context
    const isProtein = info.categoria === 'proteina';
    const isCarb = info.categoria === 'carboidrato';
    const isMealWithProtein = mealLower.includes('almoco') || mealLower.includes('jantar');
    const isMealWithCarbs = !mealLower.includes('ceia');

    if ((isProtein && isMealWithProtein && remainingProteinas > 10) ||
        (isCarb && isMealWithCarbs && remainingCarboidratos > 20)) {
      tryAddFood(lowerFav, info.porcaoTipica);
    }
  }

  return alimentos;
}

/**
 * Generate personalized meals based on macro targets
 */
function generatePersonalizedMeals(personalInfo: UserPersonalInfo, macros: { calorias: number; proteinas: number; carboidratos: number; gorduras: number }): Refeicao[] {
  const numRefeicoes = personalInfo.numeroRefeicoes || 5;
  const horarioTreino = personalInfo.horarioTreino || 'tarde';

  const mealDistribution = getMealDistribution(numRefeicoes, horarioTreino);

  return mealDistribution.map((meal) => {
    const mealCalorias = Math.round(macros.calorias * (meal.percentualCalorias / 100));
    const mealProteinas = Math.round(macros.proteinas * (meal.percentualCalorias / 100));
    const mealCarboidratos = Math.round(macros.carboidratos * (meal.percentualCalorias / 100));
    const mealGorduras = Math.round(macros.gorduras * (meal.percentualCalorias / 100));

    const alimentos = generateMealFoods(
      mealCalorias,
      mealProteinas,
      mealCarboidratos,
      mealGorduras,
      meal.nome,
      personalInfo,
      (meal as any).isPreTreino,
      (meal as any).isPosTreino
    );

    return {
      nome: meal.nome,
      horario: meal.horario,
      alimentos,
    };
  });
}

/**
 * Generate a diet plan based on user profile
 */
export function generateDiet(personalInfo: UserPersonalInfo): Dieta {
  const macros = calculateMacrosFromPersonalInfo(personalInfo);

  const targetMacros = macros || {
    calorias: 2000,
    proteinas: 150,
    carboidratos: 200,
    gorduras: 67,
  };

  const refeicoes = generatePersonalizedMeals(personalInfo, targetMacros);

  return {
    calorias: targetMacros.calorias,
    proteinas: targetMacros.proteinas,
    carboidratos: targetMacros.carboidratos,
    gorduras: targetMacros.gorduras,
    refeicoes,
  };
}

/**
 * Calculate total macros from a meal's foods
 */
function calculateMealTotals(alimentos: Alimento[]): { calorias: number; proteinas: number; carboidratos: number; gorduras: number } {
  return alimentos.reduce(
    (acc, alimento) => ({
      calorias: acc.calorias + (alimento.calorias || 0),
      proteinas: acc.proteinas + (alimento.proteinas || 0),
      carboidratos: acc.carboidratos + (alimento.carboidratos || 0),
      gorduras: acc.gorduras + (alimento.gorduras || 0),
    }),
    { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }
  );
}

/**
 * Generate diet response message
 */
export function generateDietResponseMessage(
  personalInfo: UserPersonalInfo,
  dieta: Dieta
): string {
  let resposta = `Criei um plano alimentar PERSONALIZADO para voce, ${personalInfo.nome}!\n\n`;

  // Macros summary
  resposta += `**Seus macros diarios (calculados para seu perfil):**\n`;
  resposta += `- ${dieta.calorias} kcal\n`;
  resposta += `- ${dieta.proteinas}g proteinas\n`;
  resposta += `- ${dieta.carboidratos}g carboidratos\n`;
  resposta += `- ${dieta.gorduras}g gorduras\n\n`;

  // Explain how macros were calculated
  resposta += `**Como calculei:**\n`;
  if (personalInfo.peso && personalInfo.altura && personalInfo.idade) {
    resposta += `- TMB baseada em: ${personalInfo.peso}kg, ${personalInfo.altura}cm, ${personalInfo.idade} anos, ${personalInfo.sexo || 'masculino'}\n`;
  }
  if (personalInfo.nivelAtividade) {
    resposta += `- Nivel de atividade: ${personalInfo.nivelAtividade}\n`;
  }
  if (personalInfo.objetivo) {
    resposta += `- Calorias ajustadas para: "${personalInfo.objetivo}"\n`;
  }

  // Personalizations applied
  resposta += `\n**Personalizacoes aplicadas:**\n`;

  if (personalInfo.numeroRefeicoes) {
    resposta += `- ${dieta.refeicoes.length} refeicoes com quantidades calculadas\n`;
  }

  if (personalInfo.restricoesAlimentares && personalInfo.restricoesAlimentares.length > 0) {
    resposta += `- Substituicoes para: ${personalInfo.restricoesAlimentares.join(', ')}\n`;
  }

  if (personalInfo.comidasFavoritas && personalInfo.comidasFavoritas.length > 0) {
    resposta += `- Inclui suas comidas favoritas quando possivel\n`;
  }

  if (personalInfo.comidasEvitar && personalInfo.comidasEvitar.length > 0) {
    resposta += `- Removidos: ${personalInfo.comidasEvitar.join(', ')}\n`;
  }

  if (personalInfo.horarioTreino) {
    const horarioLabel = { manha: 'manha', tarde: 'tarde', noite: 'noite' }[personalInfo.horarioTreino];
    resposta += `- Refeicoes pre/pos treino ajustadas para treino pela ${horarioLabel}\n`;
  }

  // Meals with quantities
  resposta += `\n**Suas refeicoes (com quantidades em gramas):**\n`;
  for (const refeicao of dieta.refeicoes) {
    const totals = calculateMealTotals(refeicao.alimentos);
    resposta += `\n**${refeicao.nome}** (${refeicao.horario}) - ~${totals.calorias} kcal\n`;
    for (const alimento of refeicao.alimentos) {
      resposta += `  - ${alimento.nome}: ${alimento.gramas}g`;
      if (alimento.proteinas || alimento.carboidratos) {
        resposta += ` (P:${alimento.proteinas || 0}g C:${alimento.carboidratos || 0}g G:${alimento.gorduras || 0}g)`;
      }
      resposta += '\n';
    }
  }

  if (personalInfo.restricoesMedicas && personalInfo.restricoesMedicas.length > 0) {
    resposta += `\n⚠️ Lembre-se de suas restricoes medicas: ${personalInfo.restricoesMedicas.join(', ')}. Consulte um nutricionista para ajustes especificos.\n`;
  }

  resposta += `\nConfira todos os detalhes na aba "Dieta". Voce pode editar os alimentos, quantidades e horarios!`;

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
