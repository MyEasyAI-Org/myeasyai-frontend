// =============================================================================
// InsightsList - List of insights with filtering tabs
// =============================================================================

import { useState } from 'react';
import { PRICING_LABELS } from '../../constants/pricing.constants';
import type { Insight, InsightSeverity } from '../../types/insights.types';
import { InsightCard } from './InsightCard';

// =============================================================================
// Types
// =============================================================================

type FilterOption = 'all' | InsightSeverity;

interface InsightsListProps {
  insights: Insight[];
  counts: Record<InsightSeverity, number>;
  onInsightAction?: (insight: Insight) => void;
  maxVisible?: number;
}

// =============================================================================
// Filter Configuration
// =============================================================================

interface FilterConfig {
  label: string;
  color: string;
  activeColor: string;
}

const FILTER_CONFIG: Record<FilterOption, FilterConfig> = {
  all: {
    label: 'Todos',
    color: 'text-slate-400 border-slate-700',
    activeColor: 'text-white bg-slate-700 border-slate-600',
  },
  critical: {
    label: PRICING_LABELS.insights.severity.critical,
    color: 'text-red-400 border-red-900/50',
    activeColor: 'text-red-300 bg-red-900/30 border-red-700',
  },
  warning: {
    label: PRICING_LABELS.insights.severity.warning,
    color: 'text-amber-400 border-amber-900/50',
    activeColor: 'text-amber-300 bg-amber-900/30 border-amber-700',
  },
  positive: {
    label: PRICING_LABELS.insights.severity.positive,
    color: 'text-emerald-400 border-emerald-900/50',
    activeColor: 'text-emerald-300 bg-emerald-900/30 border-emerald-700',
  },
  tip: {
    label: PRICING_LABELS.insights.severity.tip,
    color: 'text-blue-400 border-blue-900/50',
    activeColor: 'text-blue-300 bg-blue-900/30 border-blue-700',
  },
};

const FILTER_ORDER: FilterOption[] = ['all', 'critical', 'warning', 'tip', 'positive'];

// =============================================================================
// Component
// =============================================================================

export function InsightsList({
  insights,
  counts,
  onInsightAction,
  maxVisible = 10,
}: InsightsListProps) {
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [showAll, setShowAll] = useState(false);

  // Filter insights
  const filteredInsights = activeFilter === 'all'
    ? insights
    : insights.filter(i => i.severity === activeFilter);

  // Limit visible insights
  const visibleInsights = showAll
    ? filteredInsights
    : filteredInsights.slice(0, maxVisible);

  const hasMore = filteredInsights.length > maxVisible;

  // Get count for a filter
  const getCount = (filter: FilterOption): number => {
    if (filter === 'all') return insights.length;
    return counts[filter];
  };

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar insights por severidade">
        {FILTER_ORDER.map((filter) => {
          const count = getCount(filter);
          const config = FILTER_CONFIG[filter];
          const isActive = activeFilter === filter;

          // Hide filters with 0 count (except 'all')
          if (count === 0 && filter !== 'all') return null;

          return (
            <button
              key={filter}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="insights-list"
              onClick={() => {
                setActiveFilter(filter);
                setShowAll(false);
              }}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-full border
                transition-all duration-200
                ${isActive ? config.activeColor : config.color}
                hover:brightness-110
                focus:outline-none focus:ring-2 focus:ring-yellow-500/50
              `}
            >
              {config.label}
              <span className="ml-1.5 opacity-70" aria-label={`${count} insights`}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Insights list */}
      {visibleInsights.length > 0 ? (
        <div id="insights-list" role="tabpanel" className="space-y-3" aria-live="polite">
          {visibleInsights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onAction={onInsightAction}
            />
          ))}

          {/* Show more button */}
          {hasMore && !showAll && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="w-full py-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              Ver mais {filteredInsights.length - maxVisible} insights
            </button>
          )}

          {/* Show less button */}
          {showAll && hasMore && (
            <button
              type="button"
              onClick={() => setShowAll(false)}
              className="w-full py-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              Mostrar menos
            </button>
          )}
        </div>
      ) : (
        <div className="py-8 text-center text-slate-500">
          Nenhum insight {activeFilter !== 'all' ? `do tipo "${FILTER_CONFIG[activeFilter].label}"` : ''} encontrado.
        </div>
      )}
    </div>
  );
}
