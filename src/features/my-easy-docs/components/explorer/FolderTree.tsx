// =============================================
// FolderTree - Recursive folder tree navigation
// =============================================

import { memo, useCallback } from 'react';
import { FolderOpen } from 'lucide-react';
import type { DocsFolder, DocsDocument } from '../../types';
import { FolderTreeItem } from './FolderTreeItem';
import { countDocumentsInFolder } from '../../utils';

// =============================================
// Types
// =============================================

interface FolderTreeProps {
  folders: DocsFolder[];
  currentFolderId: string | null;
  expandedFolders: Set<string>;
  documents: DocsDocument[];
  onNavigate: (folderId: string | null) => void;
  onToggleExpand: (folderId: string) => void;
}

// =============================================
// Component
// =============================================

export const FolderTree = memo(function FolderTree({
  folders,
  currentFolderId,
  expandedFolders,
  documents,
  onNavigate,
  onToggleExpand,
}: FolderTreeProps) {
  // Get child folders for a given parent
  const getChildFolders = useCallback(
    (parentId: string | null): DocsFolder[] => {
      return folders.filter((f) => f.parent_id === parentId);
    },
    [folders]
  );

  // Check if a folder has children
  const hasChildren = useCallback(
    (folderId: string): boolean => {
      return folders.some((f) => f.parent_id === folderId);
    },
    [folders]
  );

  // Render folder tree recursively
  const renderFolderTree = useCallback(
    (parentId: string | null, level: number = 0): React.ReactNode => {
      const childFolders = getChildFolders(parentId);

      return childFolders.map((folder) => {
        const folderHasChildren = hasChildren(folder.id);
        const isExpanded = expandedFolders.has(folder.id);
        const isSelected = currentFolderId === folder.id;
        const docsCount = countDocumentsInFolder(folder.id, documents);

        return (
          <div key={folder.id}>
            <FolderTreeItem
              folder={folder}
              level={level}
              isExpanded={isExpanded}
              isSelected={isSelected}
              hasChildren={folderHasChildren}
              documentsCount={docsCount}
              onToggle={onToggleExpand}
              onSelect={onNavigate}
            />
            {/* Render children if expanded */}
            {folderHasChildren && isExpanded && renderFolderTree(folder.id, level + 1)}
          </div>
        );
      });
    },
    [getChildFolders, hasChildren, expandedFolders, currentFolderId, documents, onToggleExpand, onNavigate]
  );

  return (
    <div className="space-y-1">
      {/* Root folder - "Meus Documentos" */}
      <button
        onClick={() => onNavigate(null)}
        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
          currentFolderId === null
            ? 'bg-blue-500/20 text-blue-400'
            : 'text-slate-300 hover:bg-slate-800'
        }`}
      >
        <FolderOpen className="w-4 h-4 text-blue-400" />
        <span className="font-medium">Meus Documentos</span>
      </button>

      {/* Folder tree */}
      <div className="mt-1">{renderFolderTree(null)}</div>
    </div>
  );
});

export default FolderTree;
