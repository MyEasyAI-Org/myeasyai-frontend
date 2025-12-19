// =============================================================================
// Health Score Calculator - Calcula pontuação de saúde da precificação
// =============================================================================

import type { HealthScore, HealthScoreFactors, HealthGrade, AnalysisSummary } from '../../types/insights.types';
import type { ProductCalculation } from '../calculations';
import type { Product } from '../../types/pricing.types';
import { INSIGHT_THRESHOLDS } from './thresholds';

// =============================================================================
// Types
// =============================================================================

interface HealthScoreParams {
  calculations: ProductCalculation[];
  products: Product[];
  summary: AnalysisSummary;
}

// =============================================================================
// Grade Determination
// =============================================================================

function determineGrade(total: number): HealthGrade {
  if (total >= 85) return 'excellent';
  if (total >= 70) return 'good';
  if (total >= 50) return 'fair';
  if (total >= 30) return 'poor';
  return 'critical';
}

// =============================================================================
// Factor Calculations
// =============================================================================

/**
 * Calcula pontuação de saúde das margens (0-25 pontos)
 * Baseado na margem líquida média
 */
function calculateMarginHealth(avgNetMargin: number): number {
  const { marginHealth } = INSIGHT_THRESHOLDS.healthScore;

  if (avgNetMargin >= marginHealth.excellent) return 25;
  if (avgNetMargin >= marginHealth.good) return 20;
  if (avgNetMargin >= marginHealth.fair) return 15;
  if (avgNetMargin >= marginHealth.poor) return 10;
  if (avgNetMargin >= marginHealth.critical) return 5;
  return 0;
}

/**
 * Calcula alinhamento com mercado (0-20 pontos)
 * Baseado em quantos produtos têm preço de mercado e estão alinhados
 */
function calculateMarketAlignment(calculations: ProductCalculation[]): number {
  const productsWithMarket = calculations.filter(c => c.marketComparison !== null);

  if (productsWithMarket.length === 0) {
    // Se não tem dados de mercado, assume pontuação neutra
    return 10;
  }

  const tolerance = INSIGHT_THRESHOLDS.healthScore.marketAlignmentTolerance;
  const alignedProducts = productsWithMarket.filter(c =>
    Math.abs(c.marketComparison!) <= tolerance
  );

  return Math.round((alignedProducts.length / productsWithMarket.length) * 20);
}

/**
 * Calcula eficiência de custos (0-20 pontos)
 * Baseado na proporção de custos ocultos
 */
function calculateCostEfficiency(hiddenCostsPercentage: number): number {
  const { hiddenCostThresholds } = INSIGHT_THRESHOLDS.healthScore;

  if (hiddenCostsPercentage > hiddenCostThresholds.high) return 5;
  if (hiddenCostsPercentage > hiddenCostThresholds.medium) return 10;
  if (hiddenCostsPercentage > hiddenCostThresholds.low) return 15;
  return 20;
}

/**
 * Calcula segurança do break-even (0-20 pontos)
 * Baseado em quantos produtos estão acima do break-even
 */
function calculateBreakEvenSafety(
  productsAboveBreakeven: number,
  totalProducts: number
): number {
  if (totalProducts === 0) return 0;
  return Math.round((productsAboveBreakeven / totalProducts) * 20);
}

/**
 * Calcula completude de dados (0-15 pontos)
 * Baseado em preenchimento de dados opcionais
 */
function calculateDataCompleteness(
  products: Product[],
  productsWithMarketPrice: number
): number {
  if (products.length === 0) return 0;

  const hasMarketPriceRatio = productsWithMarketPrice / products.length;
  const hasVolumeEstimate = products.filter(p => p.monthly_units_estimate > 0).length / products.length;
  const hasDescription = products.filter(p => p.description && p.description.trim() !== '').length / products.length;

  // Peso: mercado (40%), volume (40%), descrição (20%)
  const completeness = (hasMarketPriceRatio * 0.4) + (hasVolumeEstimate * 0.4) + (hasDescription * 0.2);

  return Math.round(completeness * 15);
}

// =============================================================================
// Main Calculator
// =============================================================================

/**
 * Calcula o Health Score completo da loja
 */
export function calculateHealthScore(params: HealthScoreParams): HealthScore {
  const { calculations, products, summary } = params;

  // Se não há produtos, retorna score zerado
  if (calculations.length === 0 || products.length === 0) {
    return {
      total: 0,
      grade: 'critical',
      factors: {
        marginHealth: 0,
        marketAlignment: 0,
        costEfficiency: 0,
        breakEvenSafety: 0,
        dataCompleteness: 0,
      },
    };
  }

  // Calcula cada fator
  const factors: HealthScoreFactors = {
    marginHealth: calculateMarginHealth(summary.avgNetMargin),
    marketAlignment: calculateMarketAlignment(calculations),
    costEfficiency: calculateCostEfficiency(summary.hiddenCostsPercentage),
    breakEvenSafety: calculateBreakEvenSafety(
      summary.productsAboveBreakeven,
      summary.totalProducts
    ),
    dataCompleteness: calculateDataCompleteness(
      products,
      summary.productsWithMarketPrice
    ),
  };

  // Calcula total
  const total = Math.min(100, Math.max(0,
    factors.marginHealth +
    factors.marketAlignment +
    factors.costEfficiency +
    factors.breakEvenSafety +
    factors.dataCompleteness
  ));

  // Determina grade
  const grade = determineGrade(total);

  return {
    total,
    grade,
    factors,
  };
}

// =============================================================================
// Constants for UI
// =============================================================================

export const HEALTH_GRADE_LABELS: Record<HealthGrade, string> = {
  excellent: 'Excelente',
  good: 'Bom',
  fair: 'Regular',
  poor: 'Ruim',
  critical: 'Crítico',
};

export const HEALTH_GRADE_COLORS: Record<HealthGrade, { text: string; bg: string; border: string }> = {
  excellent: {
    text: 'text-green-400',
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
  },
  good: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/30',
  },
  fair: {
    text: 'text-yellow-400',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/30',
  },
  poor: {
    text: 'text-orange-400',
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/30',
  },
  critical: {
    text: 'text-red-400',
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
  },
};

// Pontuação máxima de cada fator
export const HEALTH_FACTOR_MAX_POINTS: Record<keyof HealthScoreFactors, number> = {
  marginHealth: 25,
  marketAlignment: 20,
  costEfficiency: 20,
  breakEvenSafety: 20,
  dataCompleteness: 15,
};
