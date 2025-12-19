// =============================================================================
// Margin Rules - Regras de análise de margem (SRP)
// =============================================================================

import type { InsightRule } from '../../../types/insights.types';
import { INSIGHT_THRESHOLDS } from '../thresholds';

const { critical, warning, excellent } = INSIGHT_THRESHOLDS.margin;

export const marginRules: InsightRule[] = [
  {
    id: 'margin_critical',
    category: 'margin',
    severity: 'critical',
    condition: (calc) => calc.netMargin < critical,
    title: 'Margem Crítica',
    description: (calc, product) =>
      `"${product.name}" tem margem líquida de apenas ${calc.netMargin.toFixed(1)}%. Considere aumentar o preço ou reduzir custos urgentemente.`,
    priority: 10,
  },
  {
    id: 'margin_low',
    category: 'margin',
    severity: 'warning',
    condition: (calc) => calc.netMargin >= critical && calc.netMargin < warning,
    title: 'Margem Baixa',
    description: (calc, product) =>
      `"${product.name}" tem margem líquida de ${calc.netMargin.toFixed(1)}%. Considere revisar custos ou aumentar preço.`,
    priority: 7,
  },
  {
    id: 'margin_excellent',
    category: 'margin',
    severity: 'positive',
    condition: (calc) => calc.netMargin > excellent,
    title: 'Excelente Margem',
    description: (calc, product) =>
      `"${product.name}" tem ótima margem de ${calc.netMargin.toFixed(1)}%. Continue assim!`,
    priority: 3,
  },
  {
    id: 'negative_margin',
    category: 'margin',
    severity: 'critical',
    condition: (calc) => calc.netMargin < 0,
    title: 'Margem Negativa',
    description: (calc, product) =>
      `"${product.name}" está dando prejuízo! Margem de ${calc.netMargin.toFixed(1)}%. Ação imediata necessária.`,
    priority: 10,
  },
];
