// =============================================================================
// Market Rules - Regras de comparação com mercado (SRP)
// =============================================================================

import type { InsightRule } from '../../../types/insights.types';
import { INSIGHT_THRESHOLDS } from '../thresholds';

const { aboveWarning, belowOpportunity } = INSIGHT_THRESHOLDS.market;

export const marketRules: InsightRule[] = [
  {
    id: 'price_above_market',
    category: 'market',
    severity: 'warning',
    condition: (calc) => calc.marketComparison !== null && calc.marketComparison > aboveWarning,
    title: 'Preço Acima do Mercado',
    description: (calc, product) =>
      `"${product.name}" está ${calc.marketComparison?.toFixed(0)}% acima do preço de mercado. Pode estar perdendo vendas.`,
    priority: 6,
  },
  {
    id: 'price_below_market',
    category: 'market',
    severity: 'tip',
    condition: (calc) => calc.marketComparison !== null && calc.marketComparison < belowOpportunity,
    title: 'Oportunidade de Aumento',
    description: (calc, product) =>
      `"${product.name}" está ${Math.abs(calc.marketComparison!).toFixed(0)}% abaixo do mercado. Há espaço para aumentar o preço.`,
    priority: 5,
  },
  {
    id: 'price_aligned_market',
    category: 'market',
    severity: 'positive',
    condition: (calc) => {
      if (calc.marketComparison === null) return false;
      return calc.marketComparison >= belowOpportunity && calc.marketComparison <= aboveWarning;
    },
    title: 'Preço Alinhado ao Mercado',
    description: (calc, product) =>
      `"${product.name}" está bem posicionado em relação ao mercado (${calc.marketComparison! >= 0 ? '+' : ''}${calc.marketComparison?.toFixed(0)}%).`,
    priority: 2,
  },
];
