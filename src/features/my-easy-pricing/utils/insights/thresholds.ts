// =============================================================================
// Insight Thresholds - Constantes configuraveis para analise de insights
// =============================================================================
// Permite ajustar limites sem alterar logica das regras (OCP)

export const INSIGHT_THRESHOLDS = {
  // Limiares de margem liquida (%)
  margin: {
    critical: 5,      // Margem liquida abaixo de 5% = critico
    warning: 15,      // Margem liquida abaixo de 15% = atencao
    excellent: 40,    // Margem liquida acima de 40% = excelente
  },

  // Limiares de comparacao com mercado (%)
  market: {
    aboveWarning: 30,      // Acima de 30% do mercado = atencao
    belowOpportunity: -20, // Abaixo de 20% do mercado = oportunidade de aumento
  },

  // Limiares de custos (% do custo total)
  costs: {
    hiddenHighRatio: 25,    // Custos ocultos > 25% do custo total = atencao
    indirectHighRatio: 40,  // Custos indiretos > 40% do custo total = atencao
  },

  // Limiares de break-even
  breakeven: {
    safetyMargin: 1.3, // Volume estimado deve ser 30% acima do break-even para seguranca
  },

  // Limiares de Health Score por fator
  healthScore: {
    marginHealth: {
      excellent: 30,  // >= 30% margem = 25 pontos
      good: 20,       // >= 20% margem = 20 pontos
      fair: 15,       // >= 15% margem = 15 pontos
      poor: 10,       // >= 10% margem = 10 pontos
      critical: 5,    // >= 5% margem = 5 pontos
    },
    marketAlignmentTolerance: 20, // +/- 20% do mercado = alinhado
    hiddenCostThresholds: {
      high: 30,    // > 30% = 5 pontos
      medium: 25,  // > 25% = 10 pontos
      low: 20,     // > 20% = 15 pontos
    },
  },
} as const;

// Tipos derivados das constantes
export type MarginThresholds = typeof INSIGHT_THRESHOLDS.margin;
export type MarketThresholds = typeof INSIGHT_THRESHOLDS.market;
export type CostThresholds = typeof INSIGHT_THRESHOLDS.costs;
export type BreakevenThresholds = typeof INSIGHT_THRESHOLDS.breakeven;
