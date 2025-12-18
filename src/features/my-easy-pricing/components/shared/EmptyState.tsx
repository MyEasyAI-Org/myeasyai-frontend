// =============================================================================
// EmptyState - Empty state component for various scenarios
// =============================================================================

import { Store, Package, BarChart3 } from 'lucide-react';

// =============================================================================
// Types
// =============================================================================

type EmptyStateIcon = 'store' | 'product' | 'chart';

interface EmptyStateProps {
  icon: EmptyStateIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

// =============================================================================
// Icon Map
// =============================================================================

const ICON_MAP = {
  store: Store,
  product: Package,
  chart: BarChart3,
};

// =============================================================================
// Component
// =============================================================================

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  const IconComponent = ICON_MAP[icon];

  return (
    <div className="p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-800 mx-auto mb-4 flex items-center justify-center">
        <IconComponent className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-lg font-medium text-slate-300 mb-2">
        {title}
      </h3>
      <p className="text-slate-500 max-w-md mx-auto">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 px-6 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors font-medium"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
