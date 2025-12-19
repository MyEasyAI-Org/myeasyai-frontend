// =============================================================================
// Data Rules - Regras de completude de dados (SRP)
// =============================================================================

import type { InsightRule } from '../../../types/insights.types';

export const dataRules: InsightRule[] = [
  {
    id: 'missing_market_price',
    category: 'pricing_strategy',
    severity: 'tip',
    condition: (_, product) => product.market_price === null,
    title: 'Adicione Preço de Mercado',
    description: (_, product) =>
      `"${product.name}" não tem preço de mercado cadastrado. Adicione para comparar sua competitividade.`,
    priority: 2,
  },
  {
    id: 'low_volume_estimate',
    category: 'volume',
    severity: 'tip',
    condition: (_, product) => product.monthly_units_estimate === 0,
    title: 'Estime Volume de Vendas',
    description: (_, product) =>
      `"${product.name}" não tem estimativa de vendas mensais. Adicione para calcular ponto de equilíbrio.`,
    priority: 2,
  },
  {
    id: 'missing_description',
    category: 'pricing_strategy',
    severity: 'tip',
    condition: (_, product) => !product.description || product.description.trim() === '',
    title: 'Adicione Descrição',
    description: (_, product) =>
      `"${product.name}" não tem descrição. Adicione para melhor organização.`,
    priority: 1,
  },
  {
    id: 'zero_direct_cost',
    category: 'costs',
    severity: 'warning',
    condition: (calc) => calc.directCost === 0,
    title: 'Custo Direto Zerado',
    description: (_, product) =>
      `"${product.name}" tem custo direto zerado. Isso pode indicar dados incompletos.`,
    priority: 5,
  },
];
