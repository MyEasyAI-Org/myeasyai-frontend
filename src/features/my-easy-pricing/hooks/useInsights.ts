// =============================================================================
// useInsights - Hook for pricing analysis and insights
// =============================================================================

import { useMemo, useCallback } from 'react';
import type { Product } from '../types/pricing.types';
import type {
  PricingAnalysis,
  Insight,
  InsightSeverity,
  HealthScore,
  AnalysisSummary,
} from '../types/insights.types';
import type { ProductCalculation } from '../utils/calculations';
import {
  analyzePricing,
  filterInsightsBySeverity,
  countInsightsBySeverity,
  getInsightsForProduct,
} from '../utils/insights/analyzer';

// =============================================================================
// Types
// =============================================================================

interface UseInsightsParams {
  storeId: string | null;
  products: Product[];
  calculations: ProductCalculation[];
  totalIndirectCostsMonthly: number;
  totalHiddenCostsMonthly: number;
}

interface UseInsightsReturn {
  // Full analysis result
  analysis: PricingAnalysis | null;

  // Quick access to common properties
  healthScore: HealthScore | null;
  insights: Insight[];
  summary: AnalysisSummary | null;

  // Insight counts by severity
  insightCounts: Record<InsightSeverity, number>;

  // Helper functions
  getInsightsBySeverity: (severity: InsightSeverity) => Insight[];
  getProductInsights: (productId: string) => Insight[];
  getCriticalInsights: () => Insight[];
  getWarningInsights: () => Insight[];
  getPositiveInsights: () => Insight[];
  getTipInsights: () => Insight[];

  // Computed flags
  hasProblems: boolean;
  hasCriticalProblems: boolean;
  isHealthy: boolean;
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useInsights({
  storeId,
  products,
  calculations,
  totalIndirectCostsMonthly,
  totalHiddenCostsMonthly,
}: UseInsightsParams): UseInsightsReturn {
  // ---------------------------------------------------------------------------
  // Run analysis (memoized)
  // ---------------------------------------------------------------------------
  const analysis = useMemo(() => {
    // Don't analyze if no store or no data
    if (!storeId || products.length === 0 || calculations.length === 0) {
      return null;
    }

    return analyzePricing({
      storeId,
      products,
      calculations,
      totalIndirectCostsMonthly,
      totalHiddenCostsMonthly,
    });
  }, [storeId, products, calculations, totalIndirectCostsMonthly, totalHiddenCostsMonthly]);

  // ---------------------------------------------------------------------------
  // Quick access properties
  // ---------------------------------------------------------------------------
  const healthScore = analysis?.healthScore ?? null;
  const insights = analysis?.insights ?? [];
  const summary = analysis?.summary ?? null;

  // ---------------------------------------------------------------------------
  // Insight counts
  // ---------------------------------------------------------------------------
  const insightCounts = useMemo(() => {
    return countInsightsBySeverity(insights);
  }, [insights]);

  // ---------------------------------------------------------------------------
  // Helper functions
  // ---------------------------------------------------------------------------
  const getInsightsBySeverity = useCallback(
    (severity: InsightSeverity) => filterInsightsBySeverity(insights, severity),
    [insights]
  );

  const getProductInsights = useCallback(
    (productId: string) => getInsightsForProduct(insights, productId),
    [insights]
  );

  const getCriticalInsights = useCallback(
    () => filterInsightsBySeverity(insights, 'critical'),
    [insights]
  );

  const getWarningInsights = useCallback(
    () => filterInsightsBySeverity(insights, 'warning'),
    [insights]
  );

  const getPositiveInsights = useCallback(
    () => filterInsightsBySeverity(insights, 'positive'),
    [insights]
  );

  const getTipInsights = useCallback(
    () => filterInsightsBySeverity(insights, 'tip'),
    [insights]
  );

  // ---------------------------------------------------------------------------
  // Computed flags
  // ---------------------------------------------------------------------------
  const hasProblems = insightCounts.critical > 0 || insightCounts.warning > 0;
  const hasCriticalProblems = insightCounts.critical > 0;
  const isHealthy = healthScore !== null && healthScore.grade === 'excellent';

  // ---------------------------------------------------------------------------
  // Return public API
  // ---------------------------------------------------------------------------
  return {
    // Full analysis
    analysis,

    // Quick access
    healthScore,
    insights,
    summary,

    // Counts
    insightCounts,

    // Helper functions
    getInsightsBySeverity,
    getProductInsights,
    getCriticalInsights,
    getWarningInsights,
    getPositiveInsights,
    getTipInsights,

    // Flags
    hasProblems,
    hasCriticalProblems,
    isHealthy,
  };
}

// =============================================================================
// Re-export types for convenience
// =============================================================================

export type {
  PricingAnalysis,
  Insight,
  InsightSeverity,
  HealthScore,
  AnalysisSummary,
};
