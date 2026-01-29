// =============================================
// FileRow - Row component for list view
// =============================================

import { memo, useCallback } from 'react';
import { Folder, Star } from 'lucide-react';
import type { DocsFolder, DocsDocument } from '../../types';
import { formatFileSize, formatRelativeTime, getFileTypeLabel } from '../../utils';
import { FileIcon } from '../shared/FileIcon';

// =============================================
// Types
// =============================================

interface FileRowProps {
  item: DocsFolder | DocsDocument;
  type: 'folder' | 'document';
  isSelected?: boolean;
  onOpen: (id: string) => void;
  onSelect?: (id: string) => void;
}

// =============================================
// Component
// =============================================

export const FileRow = memo(function FileRow({
  item,
  type,
  isSelected = false,
  onOpen,
  onSelect,
}: FileRowProps) {
  const handleClick = useCallback(() => {
    if (type === 'folder') {
      onOpen(item.id);
    } else if (onSelect) {
      onSelect(item.id);
    }
  }, [type, item.id, onOpen, onSelect]);

  const handleDoubleClick = useCallback(() => {
    onOpen(item.id);
  }, [item.id, onOpen]);

  if (type === 'folder') {
    const folder = item as DocsFolder;

    return (
      <tr
        onClick={handleClick}
        className="hover:bg-slate-800/50 cursor-pointer transition-colors"
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Folder className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <span className="text-sm text-slate-200 truncate">{folder.name}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-slate-500">—</td>
        <td className="px-4 py-3 text-sm text-slate-500">Pasta</td>
        <td className="px-4 py-3 text-sm text-slate-500">
          {formatRelativeTime(folder.updated_at)}
        </td>
      </tr>
    );
  }

  // Document row
  const doc = item as DocsDocument;

  return (
    <tr
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={`cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-500/10' : 'hover:bg-slate-800/50'
      }`}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <FileIcon mimeType={doc.mime_type} size="md" />
          <span className="text-sm text-slate-200 truncate">{doc.name}</span>
          {doc.is_favorite && (
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-500">{formatFileSize(doc.size)}</td>
      <td className="px-4 py-3 text-sm text-slate-500">{getFileTypeLabel(doc.mime_type)}</td>
      <td className="px-4 py-3 text-sm text-slate-500">{formatRelativeTime(doc.updated_at)}</td>
    </tr>
  );
});

export default FileRow;
