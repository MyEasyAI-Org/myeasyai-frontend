/**
 * Nutritional Database
 *
 * Nutritional information for common foods.
 */

/**
 * Nutritional information interface - macros per 100g
 */
export interface NutritionalInfo {
  proteinas: number; // g per 100g
  carboidratos: number;
  gorduras: number;
  calorias: number;
  porcaoTipica: number; // typical serving size in grams
  categoria: 'proteina' | 'carboidrato' | 'gordura' | 'fruta' | 'vegetal' | 'laticinio' | 'outro';
}

/**
 * Nutritional database - macros per 100g
 * Used to calculate proper food quantities based on user's macro targets
 */
export const NUTRITIONAL_DATABASE: Record<string, NutritionalInfo> = {
  // Proteínas
  'frango grelhado': { proteinas: 31, carboidratos: 0, gorduras: 3.6, calorias: 165, porcaoTipica: 150, categoria: 'proteina' },
  'frango desfiado': { proteinas: 31, carboidratos: 0, gorduras: 3.6, calorias: 165, porcaoTipica: 150, categoria: 'proteina' },
  'peito de frango': { proteinas: 31, carboidratos: 0, gorduras: 3.6, calorias: 165, porcaoTipica: 150, categoria: 'proteina' },
  'carne moída': { proteinas: 26, carboidratos: 0, gorduras: 15, calorias: 250, porcaoTipica: 150, categoria: 'proteina' },
  'carne vermelha': { proteinas: 26, carboidratos: 0, gorduras: 15, calorias: 250, porcaoTipica: 150, categoria: 'proteina' },
  'peixe assado': { proteinas: 26, carboidratos: 0, gorduras: 5, calorias: 150, porcaoTipica: 150, categoria: 'proteina' },
  'peixe': { proteinas: 26, carboidratos: 0, gorduras: 5, calorias: 150, porcaoTipica: 150, categoria: 'proteina' },
  'tilápia': { proteinas: 26, carboidratos: 0, gorduras: 2.7, calorias: 128, porcaoTipica: 150, categoria: 'proteina' },
  'salmão': { proteinas: 25, carboidratos: 0, gorduras: 13, calorias: 208, porcaoTipica: 150, categoria: 'proteina' },
  'atum': { proteinas: 30, carboidratos: 0, gorduras: 1, calorias: 130, porcaoTipica: 100, categoria: 'proteina' },
  'ovo': { proteinas: 13, carboidratos: 1, gorduras: 11, calorias: 155, porcaoTipica: 50, categoria: 'proteina' },
  'ovos': { proteinas: 13, carboidratos: 1, gorduras: 11, calorias: 155, porcaoTipica: 50, categoria: 'proteina' },
  'ovos mexidos': { proteinas: 13, carboidratos: 1, gorduras: 11, calorias: 155, porcaoTipica: 100, categoria: 'proteina' },
  'clara de ovo': { proteinas: 11, carboidratos: 0.7, gorduras: 0.2, calorias: 52, porcaoTipica: 100, categoria: 'proteina' },
  'tofu': { proteinas: 8, carboidratos: 2, gorduras: 4, calorias: 76, porcaoTipica: 150, categoria: 'proteina' },
  'tofu grelhado': { proteinas: 8, carboidratos: 2, gorduras: 4, calorias: 76, porcaoTipica: 150, categoria: 'proteina' },
  'tofu mexido': { proteinas: 8, carboidratos: 2, gorduras: 4, calorias: 76, porcaoTipica: 150, categoria: 'proteina' },

  // Carboidratos
  'arroz': { proteinas: 2.7, carboidratos: 28, gorduras: 0.3, calorias: 130, porcaoTipica: 150, categoria: 'carboidrato' },
  'arroz integral': { proteinas: 2.6, carboidratos: 23, gorduras: 0.9, calorias: 111, porcaoTipica: 150, categoria: 'carboidrato' },
  'arroz branco': { proteinas: 2.7, carboidratos: 28, gorduras: 0.3, calorias: 130, porcaoTipica: 150, categoria: 'carboidrato' },
  'batata doce': { proteinas: 1.6, carboidratos: 20, gorduras: 0.1, calorias: 86, porcaoTipica: 200, categoria: 'carboidrato' },
  'batata': { proteinas: 2, carboidratos: 17, gorduras: 0.1, calorias: 77, porcaoTipica: 200, categoria: 'carboidrato' },
  'macarrão': { proteinas: 5, carboidratos: 25, gorduras: 1, calorias: 131, porcaoTipica: 100, categoria: 'carboidrato' },
  'macarrão de arroz': { proteinas: 3, carboidratos: 24, gorduras: 0.4, calorias: 109, porcaoTipica: 100, categoria: 'carboidrato' },
  'pão integral': { proteinas: 9, carboidratos: 41, gorduras: 3.4, calorias: 247, porcaoTipica: 50, categoria: 'carboidrato' },
  'pão': { proteinas: 9, carboidratos: 49, gorduras: 3.2, calorias: 265, porcaoTipica: 50, categoria: 'carboidrato' },
  'pão sem glúten': { proteinas: 4, carboidratos: 45, gorduras: 5, calorias: 240, porcaoTipica: 50, categoria: 'carboidrato' },
  'aveia': { proteinas: 17, carboidratos: 66, gorduras: 7, calorias: 389, porcaoTipica: 40, categoria: 'carboidrato' },
  'aveia sem glúten': { proteinas: 17, carboidratos: 66, gorduras: 7, calorias: 389, porcaoTipica: 40, categoria: 'carboidrato' },
  'feijão': { proteinas: 9, carboidratos: 24, gorduras: 0.5, calorias: 127, porcaoTipica: 100, categoria: 'carboidrato' },
  'granola': { proteinas: 10, carboidratos: 64, gorduras: 15, calorias: 450, porcaoTipica: 40, categoria: 'carboidrato' },
  'tapioca': { proteinas: 0.5, carboidratos: 22, gorduras: 0, calorias: 90, porcaoTipica: 30, categoria: 'carboidrato' },

  // Gorduras
  'azeite': { proteinas: 0, carboidratos: 0, gorduras: 100, calorias: 884, porcaoTipica: 10, categoria: 'gordura' },
  'amendoim': { proteinas: 26, carboidratos: 16, gorduras: 49, calorias: 567, porcaoTipica: 30, categoria: 'gordura' },
  'castanhas': { proteinas: 14, carboidratos: 30, gorduras: 44, calorias: 553, porcaoTipica: 30, categoria: 'gordura' },
  'pasta de amendoim': { proteinas: 25, carboidratos: 20, gorduras: 50, calorias: 588, porcaoTipica: 20, categoria: 'gordura' },
  'abacate': { proteinas: 2, carboidratos: 9, gorduras: 15, calorias: 160, porcaoTipica: 100, categoria: 'gordura' },

  // Frutas
  'banana': { proteinas: 1.1, carboidratos: 23, gorduras: 0.3, calorias: 89, porcaoTipica: 120, categoria: 'fruta' },
  'maçã': { proteinas: 0.3, carboidratos: 14, gorduras: 0.2, calorias: 52, porcaoTipica: 180, categoria: 'fruta' },
  'morango': { proteinas: 0.7, carboidratos: 8, gorduras: 0.3, calorias: 32, porcaoTipica: 150, categoria: 'fruta' },
  'frutas vermelhas': { proteinas: 1, carboidratos: 12, gorduras: 0.5, calorias: 50, porcaoTipica: 100, categoria: 'fruta' },
  'laranja': { proteinas: 0.9, carboidratos: 12, gorduras: 0.1, calorias: 47, porcaoTipica: 180, categoria: 'fruta' },
  'mamão': { proteinas: 0.5, carboidratos: 11, gorduras: 0.3, calorias: 43, porcaoTipica: 150, categoria: 'fruta' },
  'melancia': { proteinas: 0.6, carboidratos: 8, gorduras: 0.2, calorias: 30, porcaoTipica: 200, categoria: 'fruta' },

  // Vegetais
  'salada verde': { proteinas: 1.5, carboidratos: 3, gorduras: 0.2, calorias: 15, porcaoTipica: 100, categoria: 'vegetal' },
  'salada': { proteinas: 1.5, carboidratos: 3, gorduras: 0.2, calorias: 15, porcaoTipica: 100, categoria: 'vegetal' },
  'legumes': { proteinas: 2, carboidratos: 10, gorduras: 0.3, calorias: 40, porcaoTipica: 150, categoria: 'vegetal' },
  'brócolis': { proteinas: 2.8, carboidratos: 7, gorduras: 0.4, calorias: 34, porcaoTipica: 100, categoria: 'vegetal' },
  'espinafre': { proteinas: 2.9, carboidratos: 3.6, gorduras: 0.4, calorias: 23, porcaoTipica: 100, categoria: 'vegetal' },
  'cenoura': { proteinas: 0.9, carboidratos: 10, gorduras: 0.2, calorias: 41, porcaoTipica: 100, categoria: 'vegetal' },

  // Laticínios
  'leite': { proteinas: 3.4, carboidratos: 5, gorduras: 3.3, calorias: 64, porcaoTipica: 200, categoria: 'laticinio' },
  'leite de amêndoas': { proteinas: 1, carboidratos: 1.5, gorduras: 2.5, calorias: 30, porcaoTipica: 200, categoria: 'laticinio' },
  'iogurte natural': { proteinas: 10, carboidratos: 3.6, gorduras: 0.7, calorias: 59, porcaoTipica: 170, categoria: 'laticinio' },
  'iogurte grego': { proteinas: 10, carboidratos: 4, gorduras: 5, calorias: 100, porcaoTipica: 170, categoria: 'laticinio' },
  'queijo': { proteinas: 25, carboidratos: 1.3, gorduras: 33, calorias: 402, porcaoTipica: 30, categoria: 'laticinio' },
  'queijo cottage': { proteinas: 11, carboidratos: 3.4, gorduras: 4.3, calorias: 98, porcaoTipica: 100, categoria: 'laticinio' },
  'queijo vegano': { proteinas: 2, carboidratos: 5, gorduras: 7, calorias: 90, porcaoTipica: 30, categoria: 'laticinio' },

  // Suplementos e outros
  'whey protein': { proteinas: 80, carboidratos: 10, gorduras: 3, calorias: 387, porcaoTipica: 30, categoria: 'outro' },
  'whey': { proteinas: 80, carboidratos: 10, gorduras: 3, calorias: 387, porcaoTipica: 30, categoria: 'outro' },
  'proteína vegetal': { proteinas: 75, carboidratos: 8, gorduras: 5, calorias: 380, porcaoTipica: 30, categoria: 'outro' },
  'proteína vegetal (ervilha)': { proteinas: 75, carboidratos: 8, gorduras: 5, calorias: 380, porcaoTipica: 30, categoria: 'outro' },
  'mel': { proteinas: 0.3, carboidratos: 82, gorduras: 0, calorias: 304, porcaoTipica: 15, categoria: 'outro' },
  'café': { proteinas: 0, carboidratos: 0, gorduras: 0, calorias: 2, porcaoTipica: 100, categoria: 'outro' },
  'chá': { proteinas: 0, carboidratos: 0, gorduras: 0, calorias: 1, porcaoTipica: 200, categoria: 'outro' },
  'chá de camomila': { proteinas: 0, carboidratos: 0, gorduras: 0, calorias: 1, porcaoTipica: 200, categoria: 'outro' },
};

/**
 * Get nutritional info for a food item
 */
export function getNutritionalInfo(foodName: string): NutritionalInfo | null {
  const lowerFood = foodName.toLowerCase().trim();

  // Direct match
  if (NUTRITIONAL_DATABASE[lowerFood]) {
    return NUTRITIONAL_DATABASE[lowerFood];
  }

  // Partial match
  for (const [key, value] of Object.entries(NUTRITIONAL_DATABASE)) {
    if (lowerFood.includes(key) || key.includes(lowerFood)) {
      return value;
    }
  }

  return null;
}
