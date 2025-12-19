// =============================================================================
// HealthScoreGauge - Circular gauge showing health score (0-100)
// =============================================================================

import { PRICING_LABELS } from '../../constants/pricing.constants';
import type { HealthScore } from '../../types/insights.types';
import {
  HEALTH_GRADE_COLORS,
  HEALTH_GRADE_LABELS,
} from '../../utils/insights/healthScore';

// =============================================================================
// Types
// =============================================================================

interface HealthScoreGaugeProps {
  healthScore: HealthScore | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

// =============================================================================
// Size Configuration
// =============================================================================

const SIZE_CONFIG = {
  sm: {
    container: 'w-20 h-20',
    text: 'text-lg',
    label: 'text-xs',
  },
  md: {
    container: 'w-32 h-32',
    text: 'text-2xl',
    label: 'text-sm',
  },
  lg: {
    container: 'w-40 h-40',
    text: 'text-3xl',
    label: 'text-base',
  },
};

// =============================================================================
// Component
// =============================================================================

export function HealthScoreGauge({
  healthScore,
  size = 'md',
  showLabel = true,
}: HealthScoreGaugeProps) {
  const labels = PRICING_LABELS.insights.healthScore;
  const sizeConfig = SIZE_CONFIG[size];

  // Calculate stroke dash for the progress arc
  const circumference = 2 * Math.PI * 45; // radius = 45
  const progress = healthScore ? healthScore.total / 100 : 0;
  const strokeDasharray = `${progress * circumference} ${circumference}`;

  // Get colors based on grade
  const gradeColors = healthScore
    ? HEALTH_GRADE_COLORS[healthScore.grade]
    : HEALTH_GRADE_COLORS.critical;

  const gradeLabel = healthScore
    ? HEALTH_GRADE_LABELS[healthScore.grade]
    : '--';

  return (
    <div className="flex flex-col items-center" role="meter" aria-label={`${labels.title}: ${healthScore ? healthScore.total : 0} de 100`} aria-valuenow={healthScore?.total ?? 0} aria-valuemin={0} aria-valuemax={100}>
      {/* Circular Gauge */}
      <div className={`relative ${sizeConfig.container}`}>
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-700"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className={gradeColors.text}
            style={{
              transition: 'stroke-dasharray 0.5s ease-in-out',
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold text-white ${sizeConfig.text}`}>
            {healthScore ? Math.round(healthScore.total) : '--'}
          </span>
          {showLabel && (
            <span className={`${gradeColors.text} ${sizeConfig.label} font-medium`}>
              {gradeLabel}
            </span>
          )}
        </div>
      </div>

      {/* Title below gauge */}
      {showLabel && size !== 'sm' && (
        <span className="mt-2 text-sm text-slate-400">
          {labels.title}
        </span>
      )}
    </div>
  );
}
