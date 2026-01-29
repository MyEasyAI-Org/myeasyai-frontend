// =============================================
// Breadcrumb - Navigation breadcrumb for folder path
// =============================================

import { memo } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import type { BreadcrumbItem } from '../../types';

// =============================================
// Types
// =============================================

interface BreadcrumbProps {
  path: BreadcrumbItem[];
  onNavigate: (folderId: string | null) => void;
}

// =============================================
// Component
// =============================================

export const Breadcrumb = memo(function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumb">
      {path.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === path.length - 1;

        return (
          <div key={item.id ?? 'root'} className="flex items-center gap-1">
            {/* Separator */}
            {!isFirst && (
              <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
            )}

            {/* Breadcrumb Item */}
            <button
              onClick={() => onNavigate(item.id)}
              disabled={isLast}
              className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded transition-colors ${
                isLast
                  ? 'text-white font-medium cursor-default'
                  : 'text-slate-400 hover:text-blue-400 hover:bg-slate-800/50'
              }`}
            >
              {/* Home icon for root */}
              {isFirst && <Home className="w-3.5 h-3.5" />}
              <span className="truncate max-w-[150px]">{item.name}</span>
            </button>
          </div>
        );
      })}
    </nav>
  );
});

export default Breadcrumb;
