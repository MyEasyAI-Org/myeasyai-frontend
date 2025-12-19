// =============================================================================
// HealthScoreFactors - Progress bars showing health score breakdown
// =============================================================================

import { PRICING_LABELS } from '../../constants/pricing.constants';
import type { HealthScoreFactors as HealthScoreFactorsType } from '../../types/insights.types';
import { HEALTH_FACTOR_MAX_POINTS } from '../../utils/insights/healthScore';

// =============================================================================
// Types
// =============================================================================

interface HealthScoreFactorsProps {
  factors: HealthScoreFactorsType | null;
  compact?: boolean;
}

// =============================================================================
// Factor Configuration
// =============================================================================

type FactorKey = keyof HealthScoreFactorsType;

const FACTOR_ORDER: FactorKey[] = [
  'marginHealth',
  'marketAlignment',
  'costEfficiency',
  'breakEvenSafety',
  'dataCompleteness',
];

// Color based on percentage
function getFactorColor(value: number, max: number): string {
  const percentage = (value / max) * 100;
  if (percentage >= 80) return 'bg-green-500';
  if (percentage >= 60) return 'bg-emerald-500';
  if (percentage >= 40) return 'bg-yellow-500';
  if (percentage >= 20) return 'bg-orange-500';
  return 'bg-red-500';
}

// =============================================================================
// Component
// =============================================================================

export function HealthScoreFactors({
  factors,
  compact = false,
}: HealthScoreFactorsProps) {
  const labels = PRICING_LABELS.insights.healthScore.factors;

  return (
    <div className={`space-y-${compact ? '2' : '3'}`}>
      {FACTOR_ORDER.map((key) => {
        const value = factors?.[key] ?? 0;
        const maxValue = HEALTH_FACTOR_MAX_POINTS[key];
        const percentage = (value / maxValue) * 100;
        const label = labels[key];

        return (
          <div key={key} className="space-y-1">
            {/* Label and value */}
            <div className="flex items-center justify-between">
              <span className={`text-slate-400 ${compact ? 'text-xs' : 'text-sm'}`}>
                {label}
              </span>
              <span className={`text-slate-300 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
                {value}/{maxValue}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getFactorColor(value, maxValue)}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
