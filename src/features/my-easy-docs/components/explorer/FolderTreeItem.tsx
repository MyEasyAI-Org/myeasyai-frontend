// =============================================
// FolderTreeItem - Single folder item in the tree
// =============================================

import { memo } from 'react';
import { ChevronRight, Folder } from 'lucide-react';
import type { DocsFolder } from '../../types';

// =============================================
// Types
// =============================================

interface FolderTreeItemProps {
  folder: DocsFolder;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  hasChildren: boolean;
  documentsCount: number;
  onToggle: (folderId: string) => void;
  onSelect: (folderId: string) => void;
}

// =============================================
// Component
// =============================================

export const FolderTreeItem = memo(function FolderTreeItem({
  folder,
  level,
  isExpanded,
  isSelected,
  hasChildren,
  documentsCount,
  onToggle,
  onSelect,
}: FolderTreeItemProps) {
  const handleClick = () => {
    onSelect(folder.id);
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(folder.id);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
        isSelected
          ? 'bg-blue-500/20 text-blue-400'
          : 'text-slate-300 hover:bg-slate-800'
      }`}
      style={{ paddingLeft: `${12 + level * 16}px` }}
    >
      {/* Expand/Collapse Toggle */}
      {hasChildren ? (
        <span
          role="button"
          tabIndex={0}
          onClick={handleToggleClick}
          onKeyDown={(e) => e.key === 'Enter' && handleToggleClick(e as unknown as React.MouseEvent)}
          className="p-0.5 hover:bg-slate-700 rounded flex-shrink-0 cursor-pointer"
        >
          <ChevronRight
            className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
        </span>
      ) : (
        <span className="w-4 flex-shrink-0" />
      )}

      {/* Folder Icon */}
      <Folder className="w-4 h-4 text-yellow-500 flex-shrink-0" />

      {/* Folder Name */}
      <span className="truncate flex-1 text-left">{folder.name}</span>

      {/* Documents Count */}
      {documentsCount > 0 && (
        <span className="text-xs text-slate-500 flex-shrink-0">{documentsCount}</span>
      )}
    </button>
  );
});

export default FolderTreeItem;
