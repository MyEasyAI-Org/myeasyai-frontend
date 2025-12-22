// =============================================================================
// Break-Even Rules - Regras de ponto de equilíbrio (SRP)
// =============================================================================

import type { InsightRule } from '../../../types/insights.types';
import { INSIGHT_THRESHOLDS } from '../thresholds';

const { safetyMargin } = INSIGHT_THRESHOLDS.breakeven;

export const breakEvenRules: InsightRule[] = [
  {
    id: 'below_breakeven',
    category: 'breakeven',
    severity: 'critical',
    condition: (calc, product) => {
      if (calc.breakEvenUnits === Infinity || calc.breakEvenUnits <= 0) return false;
      return product.monthly_units_estimate < calc.breakEvenUnits;
    },
    title: 'Abaixo do Break-even',
    description: (calc, product) =>
      `"${product.name}" precisa vender ${Math.ceil(calc.breakEvenUnits)} un/mês para cobrir custos, mas estima apenas ${product.monthly_units_estimate}. Risco de prejuízo!`,
    priority: 9,
  },
  {
    id: 'near_breakeven',
    category: 'breakeven',
    severity: 'warning',
    condition: (calc, product) => {
      if (calc.breakEvenUnits === Infinity || calc.breakEvenUnits <= 0) return false;
      const ratio = product.monthly_units_estimate / calc.breakEvenUnits;
      return ratio >= 1 && ratio < safetyMargin;
    },
    title: 'Próximo ao Break-even',
    description: (calc, product) => {
      const ratio = product.monthly_units_estimate / calc.breakEvenUnits;
      const percentage = ((ratio - 1) * 100).toFixed(0);
      return `"${product.name}" opera apenas ${percentage}% acima do ponto de equilíbrio. Margem de segurança baixa.`;
    },
    priority: 6,
  },
  {
    id: 'safe_breakeven',
    category: 'breakeven',
    severity: 'positive',
    condition: (calc, product) => {
      if (calc.breakEvenUnits === Infinity || calc.breakEvenUnits <= 0) return false;
      const ratio = product.monthly_units_estimate / calc.breakEvenUnits;
      return ratio >= safetyMargin;
    },
    title: 'Volume Seguro',
    description: (calc, product) => {
      const ratio = product.monthly_units_estimate / calc.breakEvenUnits;
      const percentage = ((ratio - 1) * 100).toFixed(0);
      return `"${product.name}" vende ${percentage}% acima do break-even. Boa margem de segurança!`;
    },
    priority: 2,
  },
];
