// =============================================================================
// SummaryCards - Key metrics cards from analysis summary
// =============================================================================

import {
  Package,
  TrendingUp,
  Target,
  DollarSign,
} from 'lucide-react';
import type { AnalysisSummary } from '../../types/insights.types';

// =============================================================================
// Types
// =============================================================================

interface SummaryCardsProps {
  summary: AnalysisSummary | null;
}

// =============================================================================
// Helper Functions
// =============================================================================

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

// Get color based on margin value
function getMarginColor(margin: number): string {
  if (margin >= 30) return 'text-green-400';
  if (margin >= 15) return 'text-yellow-400';
  if (margin >= 5) return 'text-orange-400';
  return 'text-red-400';
}

// =============================================================================
// Card Component
// =============================================================================

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subValue?: string;
  valueColor?: string;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  subValue,
  valueColor = 'text-white',
}: MetricCardProps) {
  return (
    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-slate-700/50">
          <Icon className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 truncate">{label}</p>
          <p className={`text-lg font-semibold ${valueColor}`}>{value}</p>
          {subValue && (
            <p className="text-xs text-slate-500">{subValue}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function SummaryCards({ summary }: SummaryCardsProps) {
  if (!summary) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30 animate-pulse"
          >
            <div className="h-4 w-20 bg-slate-700 rounded mb-2" />
            <div className="h-6 w-16 bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const { totalProducts, avgNetMargin, productsAboveBreakeven, totalMonthlyCosts } = summary;

  // Calculate break-even percentage
  const breakEvenPercentage = totalProducts > 0
    ? (productsAboveBreakeven / totalProducts) * 100
    : 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Total Products */}
      <MetricCard
        icon={Package}
        label="Produtos"
        value={totalProducts.toString()}
        subValue={`${summary.productsWithMarketPrice} com preço de mercado`}
      />

      {/* Average Net Margin */}
      <MetricCard
        icon={TrendingUp}
        label="Margem Líquida Média"
        value={formatPercentage(avgNetMargin)}
        valueColor={getMarginColor(avgNetMargin)}
        subValue={`Bruta: ${formatPercentage(summary.avgGrossMargin)}`}
      />

      {/* Break-even Status */}
      <MetricCard
        icon={Target}
        label="Acima do Break-even"
        value={`${productsAboveBreakeven}/${totalProducts}`}
        valueColor={breakEvenPercentage >= 80 ? 'text-green-400' : breakEvenPercentage >= 50 ? 'text-yellow-400' : 'text-red-400'}
        subValue={`${formatPercentage(breakEvenPercentage)} dos produtos`}
      />

      {/* Monthly Costs */}
      <MetricCard
        icon={DollarSign}
        label="Custos Mensais"
        value={formatCurrency(totalMonthlyCosts)}
        subValue={`${formatPercentage(summary.hiddenCostsPercentage)} sao ocultos`}
      />
    </div>
  );
}
