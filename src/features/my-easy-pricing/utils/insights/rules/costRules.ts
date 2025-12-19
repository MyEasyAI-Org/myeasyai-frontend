// =============================================================================
// Cost Rules - Regras de análise de custos (SRP)
// =============================================================================

import type { InsightRule } from '../../../types/insights.types';
import { INSIGHT_THRESHOLDS } from '../thresholds';

const { hiddenHighRatio, indirectHighRatio } = INSIGHT_THRESHOLDS.costs;

export const costRules: InsightRule[] = [
  {
    id: 'high_hidden_costs',
    category: 'costs',
    severity: 'warning',
    condition: (calc) => {
      if (calc.totalCost === 0) return false;
      const ratio = (calc.hiddenCostAllocated / calc.totalCost) * 100;
      return ratio > hiddenHighRatio;
    },
    title: 'Custos Ocultos Elevados',
    description: (calc) => {
      const ratio = ((calc.hiddenCostAllocated / calc.totalCost) * 100).toFixed(0);
      return `Custos ocultos representam ${ratio}% do custo total deste produto. Considere revisar e reduzir.`;
    },
    priority: 6,
    isStoreLevel: true,
  },
  {
    id: 'high_indirect_costs',
    category: 'costs',
    severity: 'warning',
    condition: (calc) => {
      if (calc.totalCost === 0) return false;
      const ratio = (calc.indirectCostAllocated / calc.totalCost) * 100;
      return ratio > indirectHighRatio;
    },
    title: 'Custos Indiretos Altos',
    description: (calc) => {
      const ratio = ((calc.indirectCostAllocated / calc.totalCost) * 100).toFixed(0);
      return `Custos indiretos representam ${ratio}% do custo total. Pode indicar estrutura fixa elevada.`;
    },
    priority: 5,
    isStoreLevel: true,
  },
  {
    id: 'low_direct_cost_ratio',
    category: 'costs',
    severity: 'tip',
    condition: (calc) => {
      if (calc.totalCost === 0) return false;
      const directRatio = (calc.directCost / calc.totalCost) * 100;
      return directRatio < 30; // Custo direto < 30% do total
    },
    title: 'Estrutura de Custos Pesada',
    description: (calc) => {
      const directRatio = ((calc.directCost / calc.totalCost) * 100).toFixed(0);
      return `Apenas ${directRatio}% do custo é custo direto. Custos fixos estão pesando muito.`;
    },
    priority: 4,
    isStoreLevel: true,
  },
];
