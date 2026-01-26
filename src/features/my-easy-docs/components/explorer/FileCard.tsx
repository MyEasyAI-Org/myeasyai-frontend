// =============================================
// FileCard - Card component for grid view
// =============================================

import { memo, useCallback } from 'react';
import { Folder, Star } from 'lucide-react';
import type { DocsFolder, DocsDocument } from '../../types';
import { formatFileSize } from '../../utils';
import { FileIcon } from '../shared/FileIcon';

// =============================================
// Types
// =============================================

interface FileCardProps {
  item: DocsFolder | DocsDocument;
  type: 'folder' | 'document';
  isSelected?: boolean;
  documentsCount?: number;
  onOpen: (id: string) => void;
  onSelect?: (id: string) => void;
}

// =============================================
// Type Guards
// =============================================

function isDocument(item: DocsFolder | DocsDocument): item is DocsDocument {
  return 'mime_type' in item;
}

// =============================================
// Component
// =============================================

export const FileCard = memo(function FileCard({
  item,
  type,
  isSelected = false,
  documentsCount = 0,
  onOpen,
  onSelect,
}: FileCardProps) {
  const handleClick = useCallback(() => {
    if (onSelect) {
      onSelect(item.id);
    }
  }, [item.id, onSelect]);

  const handleDoubleClick = useCallback(() => {
    onOpen(item.id);
  }, [item.id, onOpen]);

  // For folders, single click opens; for documents, single click selects
  const handleSingleClick = useCallback(() => {
    if (type === 'folder') {
      onOpen(item.id);
    } else {
      handleClick();
    }
  }, [type, item.id, onOpen, handleClick]);

  if (type === 'folder') {
    return (
      <button
        onClick={handleSingleClick}
        className="flex flex-col items-center p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-blue-500/50 hover:bg-slate-800/50 transition-all group"
      >
        <Folder className="w-12 h-12 text-yellow-500 mb-3" />
        <span className="text-sm font-medium text-slate-200 truncate w-full text-center">
          {item.name}
        </span>
        <span className="text-xs text-slate-500 mt-1">
          {documentsCount} {documentsCount === 1 ? 'arquivo' : 'arquivos'}
        </span>
      </button>
    );
  }

  // Document card
  const doc = item as DocsDocument;

  return (
    <button
      onClick={handleSingleClick}
      onDoubleClick={handleDoubleClick}
      className={`flex flex-col items-center p-4 bg-slate-900/50 border rounded-xl transition-all group ${
        isSelected
          ? 'border-blue-500 bg-blue-500/10'
          : 'border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/50'
      }`}
    >
      <div className="relative">
        <FileIcon mimeType={doc.mime_type} size="xl" />
        {doc.is_favorite && (
          <Star className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500 fill-yellow-500" />
        )}
      </div>
      <span className="text-sm font-medium text-slate-200 truncate w-full text-center mt-3">
        {doc.name}
      </span>
      <span className="text-xs text-slate-500 mt-1">{formatFileSize(doc.size)}</span>
    </button>
  );
});

export default FileCard;
