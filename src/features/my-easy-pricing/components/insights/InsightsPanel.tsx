// =============================================================================
// InsightsPanel - Main container for the Insights dashboard
// =============================================================================

import { PRICING_LABELS } from '../../constants/pricing.constants';
import type { Store, Product } from '../../types/pricing.types';
import type { ProductCalculation, StoreCostsSummary } from '../../hooks/useCalculations';
import type { Insight } from '../../types/insights.types';
import { useInsights } from '../../hooks/useInsights';
import { HealthScoreGauge } from './HealthScoreGauge';
import { HealthScoreFactors } from './HealthScoreFactors';
import { InsightsList } from './InsightsList';
import { SummaryCards } from './SummaryCards';
import { ChartsSection } from './charts';
import { EmptyState } from '../shared/EmptyState';

// =============================================================================
// Types
// =============================================================================

interface InsightsPanelProps {
  store: Store | null;
  products: Product[];
  calculations: ProductCalculation[];
  costsSummary: StoreCostsSummary;
  onNavigateToProduct?: (productId: string) => void;
  onOpenCostsTab?: () => void;
  onOpenProductModal?: (productId: string) => void;
}

// =============================================================================
// Component
// =============================================================================

export function InsightsPanel({
  store,
  products,
  calculations,
  costsSummary,
  onNavigateToProduct,
  onOpenCostsTab,
  onOpenProductModal,
}: InsightsPanelProps) {
  const labels = PRICING_LABELS.insights;

  // Run insights analysis
  const {
    healthScore,
    insights,
    summary,
    insightCounts,
    hasProblems,
  } = useInsights({
    storeId: store?.id ?? null,
    products,
    calculations,
    totalIndirectCostsMonthly: costsSummary.totalIndirectCostsMonthly,
    totalHiddenCostsMonthly: costsSummary.totalHiddenCostsMonthly,
  });

  // Handle insight action clicks
  const handleInsightAction = (insight: Insight) => {
    if (!insight.action) return;

    switch (insight.action.type) {
      case 'navigate_product':
        // Navigate to product tab and select the product
        if (insight.action.productId && onNavigateToProduct) {
          onNavigateToProduct(insight.action.productId);
        }
        break;

      case 'adjust_price':
        // Open product modal for price adjustment
        if (insight.action.productId && onOpenProductModal) {
          onOpenProductModal(insight.action.productId);
        }
        break;

      case 'review_costs':
        if (onOpenCostsTab) {
          onOpenCostsTab();
        }
        break;

      case 'info':
      default:
        // Could open a modal or tooltip with more info
        break;
    }
  };

  // No store selected
  if (!store) {
    return (
      <div className="p-4 sm:p-6">
        <EmptyState
          icon="store"
          title={labels.empty.noStore}
          description="Selecione uma loja no painel esquerdo para ver a análise de precificação."
        />
      </div>
    );
  }

  // Store selected but no products
  if (products.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">{labels.title}</h2>
          <p className="text-sm text-slate-400">{labels.subtitle}</p>
        </div>

        <EmptyState
          icon="product"
          title={labels.empty.noProducts}
          description="Adicione produtos à sua loja para gerar insights e análises automáticas."
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-white">{labels.title}</h2>
        <p className="text-sm text-slate-400">{labels.subtitle}</p>
      </div>

      {/* Health Score Section */}
      <div className="p-6 rounded-xl border border-slate-700 bg-slate-800/50">
        <h3 className="text-lg font-medium text-white mb-4">
          {labels.healthScore.title}
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          {/* Gauge */}
          <HealthScoreGauge healthScore={healthScore} size="lg" />

          {/* Factors */}
          <div className="flex-1 w-full">
            <HealthScoreFactors factors={healthScore?.factors ?? null} />
          </div>
        </div>

        {/* Problems indicator */}
        {hasProblems && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              <span className="text-red-400 font-medium">{insightCounts.critical}</span> problemas críticos e{' '}
              <span className="text-amber-400 font-medium">{insightCounts.warning}</span> alertas encontrados.
            </p>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Resumo</h3>
        <SummaryCards summary={summary} />
      </div>

      {/* Charts Section */}
      <ChartsSection calculations={calculations} products={products} />

      {/* Insights List */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">
          Insights
          <span className="ml-2 text-sm font-normal text-slate-400">
            ({insights.length})
          </span>
        </h3>

        <InsightsList
          insights={insights}
          counts={insightCounts}
          onInsightAction={handleInsightAction}
          maxVisible={5}
        />
      </div>
    </div>
  );
}
