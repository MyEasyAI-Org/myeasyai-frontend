// =============================================================================
// InsightCard - Individual insight card with severity styling
// =============================================================================

import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  ChevronRight,
} from 'lucide-react';
import { PRICING_LABELS } from '../../constants/pricing.constants';
import type { Insight, InsightSeverity } from '../../types/insights.types';

// =============================================================================
// Types
// =============================================================================

interface InsightCardProps {
  insight: Insight;
  onAction?: (insight: Insight) => void;
  compact?: boolean;
}

// =============================================================================
// Severity Configuration
// =============================================================================

interface SeverityConfig {
  icon: React.ComponentType<{ className?: string }>;
  containerClass: string;
  iconBgClass: string;
  iconClass: string;
  titleClass: string;
}

const SEVERITY_CONFIG: Record<InsightSeverity, SeverityConfig> = {
  critical: {
    icon: AlertTriangle,
    containerClass: 'border-red-900/30 bg-red-950/20',
    iconBgClass: 'bg-red-500/20',
    iconClass: 'text-red-400',
    titleClass: 'text-red-300',
  },
  warning: {
    icon: AlertCircle,
    containerClass: 'border-amber-900/30 bg-amber-950/20',
    iconBgClass: 'bg-amber-500/20',
    iconClass: 'text-amber-400',
    titleClass: 'text-amber-300',
  },
  positive: {
    icon: CheckCircle,
    containerClass: 'border-emerald-900/30 bg-emerald-950/20',
    iconBgClass: 'bg-emerald-500/20',
    iconClass: 'text-emerald-400',
    titleClass: 'text-emerald-300',
  },
  tip: {
    icon: Lightbulb,
    containerClass: 'border-blue-900/30 bg-blue-950/20',
    iconBgClass: 'bg-blue-500/20',
    iconClass: 'text-blue-400',
    titleClass: 'text-blue-300',
  },
};

// =============================================================================
// Component
// =============================================================================

export function InsightCard({
  insight,
  onAction,
  compact = false,
}: InsightCardProps) {
  const labels = PRICING_LABELS.insights;
  const config = SEVERITY_CONFIG[insight.severity];
  const IconComponent = config.icon;

  const handleClick = () => {
    if (onAction && insight.action) {
      onAction(insight);
    }
  };

  const hasAction = !!insight.action && !!onAction;

  return (
    <div
      className={`
        ${compact ? 'p-3' : 'p-4'} rounded-lg border
        ${config.containerClass}
        ${hasAction ? 'cursor-pointer hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:ring-offset-2 focus:ring-offset-slate-900' : ''}
      `}
      onClick={hasAction ? handleClick : undefined}
      onKeyDown={hasAction ? (e) => (e.key === 'Enter' || e.key === ' ') && handleClick() : undefined}
      role={hasAction ? 'button' : 'article'}
      tabIndex={hasAction ? 0 : undefined}
      aria-label={hasAction ? `${insight.title}: ${insight.description}. ${labels.actions.learnMore}` : undefined}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`
            w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
            ${config.iconBgClass}
          `}
          aria-hidden="true"
        >
          <IconComponent className={`w-4 h-4 ${config.iconClass}`} aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4 className={`text-sm font-medium ${config.titleClass}`}>
            {insight.title}
          </h4>

          {/* Description */}
          <p className={`text-slate-400 mt-1 ${compact ? 'text-xs' : 'text-sm'}`}>
            {insight.description}
          </p>

          {/* Metric (if available) */}
          {insight.metric && !compact && (
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-slate-500">Atual:</span>
              <span className={`font-medium ${config.titleClass}`}>
                {insight.metric.current}
                {insight.metric.unit}
              </span>
              {insight.metric.target !== undefined && (
                <>
                  <span className="text-slate-500">→ Meta:</span>
                  <span className="text-slate-300 font-medium">
                    {insight.metric.target}
                    {insight.metric.unit}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Action button */}
          {insight.action && !compact && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              className={`
                mt-3 inline-flex items-center gap-1 text-xs font-medium
                ${config.titleClass} hover:brightness-125 transition-all
                focus:outline-none focus:ring-2 focus:ring-yellow-500/50 rounded
              `}
              aria-label={`${insight.action.label || labels.actions.learnMore} para ${insight.title}`}
            >
              {insight.action.label || labels.actions.learnMore}
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Arrow indicator for clickable cards */}
        {hasAction && compact && (
          <ChevronRight className={`w-4 h-4 flex-shrink-0 ${config.iconClass}`} aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
