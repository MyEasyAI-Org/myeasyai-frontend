// =============================================================================
// Insights Types - Tipos para o sistema de analise de precificacao
// =============================================================================

import type { ProductCalculation } from '../utils/calculations';
import type { Product } from './pricing.types';

// =============================================================================
// Severidade e Categoria
// =============================================================================

export type InsightSeverity = 'critical' | 'warning' | 'positive' | 'tip';

export type InsightCategory =
  | 'margin'           // Analise de margens
  | 'market'           // Comparacao com mercado
  | 'costs'            // Analise de custos
  | 'breakeven'        // Ponto de equilibrio
  | 'mix'              // Mix de produtos
  | 'tax'              // Otimizacao fiscal
  | 'pricing_strategy' // Estrategia de precos
  | 'volume';          // Analise de volume

// =============================================================================
// Insight
// =============================================================================

export interface InsightAction {
  label: string;
  type: 'adjust_price' | 'review_costs' | 'navigate_product' | 'info';
  productId?: string;
  payload?: Record<string, unknown>;
}

export interface Insight {
  id: string;
  category: InsightCategory;
  severity: InsightSeverity;
  title: string;
  description: string;
  metric?: {
    current: number;
    target?: number;
    unit: '%' | 'R$' | 'unidades';
  };
  affectedProductIds?: string[];
  action?: InsightAction;
  priority: number; // 1-10 (maior = mais importante)
}

// =============================================================================
// Health Score
// =============================================================================

export type HealthGrade = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

export interface HealthScoreFactors {
  marginHealth: number;      // 0-25 pts
  marketAlignment: number;   // 0-20 pts
  costEfficiency: number;    // 0-20 pts
  breakEvenSafety: number;   // 0-20 pts
  dataCompleteness: number;  // 0-15 pts
}

export interface HealthScore {
  total: number; // 0-100
  grade: HealthGrade;
  factors: HealthScoreFactors;
}

// =============================================================================
// Analise
// =============================================================================

export interface AnalysisSummary {
  totalProducts: number;
  avgNetMargin: number;
  avgGrossMargin: number;
  totalMonthlyCosts: number;
  hiddenCostsPercentage: number;
  productsAboveBreakeven: number;
  productsWithMarketPrice: number;
}

export interface PricingAnalysis {
  storeId: string;
  analyzedAt: Date;
  healthScore: HealthScore;
  insights: Insight[];
  summary: AnalysisSummary;
}

// =============================================================================
// Regras de Insight
// =============================================================================

export interface InsightRule {
  id: string;
  category: InsightCategory;
  severity: InsightSeverity;
  condition: (calc: ProductCalculation, product: Product) => boolean;
  title: string;
  description: (calc: ProductCalculation, product: Product) => string;
  priority: number;
  isStoreLevel?: boolean; // Se true, aplica a loja toda, nao por produto
}

// =============================================================================
// Chat
// =============================================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  relatedInsightIds?: string[];
  isLoading?: boolean;
}
