// =============================================================================
// Pricing Analyzer - Orquestrador de analise de precificacao
// =============================================================================

import type { PricingAnalysis, Insight, AnalysisSummary, InsightAction } from '../../types/insights.types';
import type { ProductCalculation } from '../calculations';
import type { Product } from '../../types/pricing.types';
import { ALL_RULES } from './rules';
import { calculateHealthScore } from './healthScore';

// =============================================================================
// Types
// =============================================================================

interface AnalyzeParams {
  storeId: string;
  products: Product[];
  calculations: ProductCalculation[];
  totalIndirectCostsMonthly: number;
  totalHiddenCostsMonthly: number;
}

// =============================================================================
// Summary Calculation
// =============================================================================

/**
 * Calcula o resumo da analise
 */
function calculateSummary(
  products: Product[],
  calculations: ProductCalculation[],
  totalIndirectCostsMonthly: number,
  totalHiddenCostsMonthly: number
): AnalysisSummary {
  if (products.length === 0 || calculations.length === 0) {
    return {
      totalProducts: 0,
      avgNetMargin: 0,
      avgGrossMargin: 0,
      totalMonthlyCosts: 0,
      hiddenCostsPercentage: 0,
      productsAboveBreakeven: 0,
      productsWithMarketPrice: 0,
    };
  }

  // Margem media (ponderada por volume se disponivel, senao simples)
  const totalVolume = products.reduce((sum, p) => sum + p.monthly_units_estimate, 0);

  let avgNetMargin: number;
  let avgGrossMargin: number;

  if (totalVolume > 0) {
    // Margem ponderada por volume
    avgNetMargin = calculations.reduce((sum, calc) => {
      const product = products.find(p => p.id === calc.productId);
      const weight = product ? product.monthly_units_estimate / totalVolume : 0;
      return sum + calc.netMargin * weight;
    }, 0);

    avgGrossMargin = calculations.reduce((sum, calc) => {
      const product = products.find(p => p.id === calc.productId);
      const weight = product ? product.monthly_units_estimate / totalVolume : 0;
      return sum + calc.grossMargin * weight;
    }, 0);
  } else {
    // Margem simples (media aritmetica)
    avgNetMargin = calculations.reduce((sum, c) => sum + c.netMargin, 0) / calculations.length;
    avgGrossMargin = calculations.reduce((sum, c) => sum + c.grossMargin, 0) / calculations.length;
  }

  // Custos totais mensais
  const totalMonthlyCosts = totalIndirectCostsMonthly + totalHiddenCostsMonthly;

  // Percentual de custos ocultos
  const hiddenCostsPercentage = totalMonthlyCosts > 0
    ? (totalHiddenCostsMonthly / totalMonthlyCosts) * 100
    : 0;

  // Produtos acima do break-even
  const productsAboveBreakeven = calculations.filter(calc => {
    const product = products.find(p => p.id === calc.productId);
    if (!product) return false;
    if (calc.breakEvenUnits === Infinity || calc.breakEvenUnits <= 0) return true;
    return product.monthly_units_estimate >= calc.breakEvenUnits;
  }).length;

  // Produtos com preco de mercado
  const productsWithMarketPrice = products.filter(p => p.market_price !== null).length;

  return {
    totalProducts: products.length,
    avgNetMargin,
    avgGrossMargin,
    totalMonthlyCosts,
    hiddenCostsPercentage,
    productsAboveBreakeven,
    productsWithMarketPrice,
  };
}

// =============================================================================
// Insight Generation
// =============================================================================

/**
 * Gera action para um insight baseado na categoria
 */
function generateAction(
  rule: typeof ALL_RULES[number],
  productId?: string
): InsightAction | undefined {
  switch (rule.category) {
    case 'margin':
    case 'breakeven':
      return productId ? {
        label: 'Ver Produto',
        type: 'navigate_product',
        productId,
      } : undefined;

    case 'market':
      return productId ? {
        label: 'Ajustar Preco',
        type: 'adjust_price',
        productId,
      } : undefined;

    case 'costs':
      return {
        label: 'Revisar Custos',
        type: 'review_costs',
      };

    default:
      return {
        label: 'Saiba Mais',
        type: 'info',
      };
  }
}

/**
 * Aplica todas as regras e gera insights
 */
function generateInsights(
  products: Product[],
  calculations: ProductCalculation[]
): Insight[] {
  const insights: Insight[] = [];
  const seenStoreLevelRules = new Set<string>();

  // Para cada produto, aplica todas as regras
  for (const calc of calculations) {
    const product = products.find(p => p.id === calc.productId);
    if (!product) continue;

    for (const rule of ALL_RULES) {
      // Regras de nivel de loja so devem ser aplicadas uma vez
      if (rule.isStoreLevel) {
        if (seenStoreLevelRules.has(rule.id)) continue;

        if (rule.condition(calc, product)) {
          seenStoreLevelRules.add(rule.id);

          insights.push({
            id: `${rule.id}_store`,
            category: rule.category,
            severity: rule.severity,
            title: rule.title,
            description: rule.description(calc, product),
            priority: rule.priority,
            action: generateAction(rule),
          });
        }
      } else {
        // Regras de nivel de produto
        if (rule.condition(calc, product)) {
          insights.push({
            id: `${rule.id}_${product.id}`,
            category: rule.category,
            severity: rule.severity,
            title: rule.title,
            description: rule.description(calc, product),
            priority: rule.priority,
            affectedProductIds: [product.id],
            action: generateAction(rule, product.id),
          });
        }
      }
    }
  }

  // Ordena por prioridade (maior primeiro) e severidade
  const severityOrder = { critical: 0, warning: 1, tip: 2, positive: 3 };
  insights.sort((a, b) => {
    // Primeiro por severidade
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    // Depois por prioridade
    return b.priority - a.priority;
  });

  return insights;
}

// =============================================================================
// Main Analyzer
// =============================================================================

/**
 * Executa analise completa de precificacao
 */
export function analyzePricing(params: AnalyzeParams): PricingAnalysis {
  const {
    storeId,
    products,
    calculations,
    totalIndirectCostsMonthly,
    totalHiddenCostsMonthly,
  } = params;

  // Calcula resumo
  const summary = calculateSummary(
    products,
    calculations,
    totalIndirectCostsMonthly,
    totalHiddenCostsMonthly
  );

  // Gera insights
  const insights = generateInsights(products, calculations);

  // Calcula health score
  const healthScore = calculateHealthScore({
    calculations,
    products,
    summary,
  });

  return {
    storeId,
    analyzedAt: new Date(),
    healthScore,
    insights,
    summary,
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Filtra insights por severidade
 */
export function filterInsightsBySeverity(
  insights: Insight[],
  severity: Insight['severity']
): Insight[] {
  return insights.filter(i => i.severity === severity);
}

/**
 * Conta insights por severidade
 */
export function countInsightsBySeverity(
  insights: Insight[]
): Record<Insight['severity'], number> {
  return {
    critical: insights.filter(i => i.severity === 'critical').length,
    warning: insights.filter(i => i.severity === 'warning').length,
    positive: insights.filter(i => i.severity === 'positive').length,
    tip: insights.filter(i => i.severity === 'tip').length,
  };
}

/**
 * Obtem insights relacionados a um produto especifico
 */
export function getInsightsForProduct(
  insights: Insight[],
  productId: string
): Insight[] {
  return insights.filter(i =>
    i.affectedProductIds?.includes(productId)
  );
}
