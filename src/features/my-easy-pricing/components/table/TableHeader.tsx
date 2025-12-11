// =============================================================================
// TableHeader - Header with store name and export button
// =============================================================================

import { Download } from 'lucide-react';
import { PRICING_LABELS } from '../../constants/pricing.constants';

// =============================================================================
// Types
// =============================================================================

interface TableHeaderProps {
  storeName: string;
  onOpenExportModal?: () => void;
}

// =============================================================================
// Component
// =============================================================================

export function TableHeader({ storeName, onOpenExportModal }: TableHeaderProps) {
  const labels = PRICING_LABELS;

  return (
    <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80">
      <div className="flex items-center justify-between">
        {/* Store Name */}
        <h2 className="text-lg font-semibold text-white">
          {storeName}
        </h2>

        {/* Export Button */}
        <button
          onClick={onOpenExportModal}
          disabled={!onOpenExportModal}
          className="px-4 py-1.5 text-sm bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          {labels.export.title}
        </button>
      </div>
    </div>
  );
}
