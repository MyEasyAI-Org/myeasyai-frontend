// =============================================================================
// TableHeader - Header with store name and export buttons
// =============================================================================

import { FileSpreadsheet, FileText } from 'lucide-react';
import { PRICING_LABELS } from '../../constants/pricing.constants';

// =============================================================================
// Types
// =============================================================================

interface TableHeaderProps {
  storeName: string;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
}

// =============================================================================
// Component
// =============================================================================

export function TableHeader({ storeName, onExportExcel, onExportPdf }: TableHeaderProps) {
  const labels = PRICING_LABELS;

  return (
    <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80">
      {/* Store Name */}
      <h2 className="text-lg font-semibold text-center text-white">
        {storeName}
      </h2>

      {/* Export Buttons */}
      <div className="flex justify-center gap-4 mt-3">
        <button
          onClick={onExportExcel}
          disabled={!onExportExcel}
          className="px-4 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileSpreadsheet className="w-4 h-4" />
          {labels.export.exportExcel}
        </button>
        <button
          onClick={onExportPdf}
          disabled={!onExportPdf}
          className="px-4 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="w-4 h-4" />
          {labels.export.exportPdf}
        </button>
      </div>
    </div>
  );
}
