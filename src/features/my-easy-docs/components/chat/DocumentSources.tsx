// =============================================
// MyEasyDocs - DocumentSources Component
// =============================================
// Shows document sources referenced in AI response.
// =============================================

import { memo } from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import type { DocumentSource } from '../../types';

// =============================================
// PROPS
// =============================================
interface DocumentSourcesProps {
  sources: DocumentSource[];
  onOpenDocument?: (documentId: string) => void;
}

// =============================================
// COMPONENT
// =============================================
export const DocumentSources = memo(function DocumentSources({
  sources,
  onOpenDocument,
}: DocumentSourcesProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  // Deduplicate sources by document_id
  const uniqueSources = sources.reduce((acc, source) => {
    if (!acc.find((s) => s.document_id === source.document_id)) {
      acc.push(source);
    }
    return acc;
  }, [] as DocumentSource[]);

  return (
    <div className="mt-3 pt-3 border-t border-slate-700">
      <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
        <FileText className="w-3 h-3" />
        Fontes consultadas:
      </p>
      <div className="flex flex-wrap gap-2">
        {uniqueSources.map((source) => (
          <button
            key={source.document_id}
            onClick={() => onOpenDocument?.(source.document_id)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-full transition-colors group"
            title={source.document_name}
          >
            <FileText className="w-3 h-3 text-slate-400" />
            <span className="truncate max-w-[150px]">{source.document_name}</span>
            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
});
