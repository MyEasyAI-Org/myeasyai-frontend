// =============================================
// FolderTree - Recursive folder tree navigation
// =============================================

import { memo, useCallback } from 'react';
import { FolderOpen } from 'lucide-react';
import type { DocsFolder, DocsDocument } from '../../types';
import { FolderTreeItem } from './FolderTreeItem';
import { DocumentTreeItem } from './DocumentTreeItem';
import { countDocumentsInFolder } from '../../utils';

// =============================================
// Types
// =============================================

interface FolderTreeProps {
  folders: DocsFolder[];
  currentFolderId: string | null;
  expandedFolders: Set<string>;
  documents: DocsDocument[];
  selectedDocumentId?: string | null;
  onNavigate: (folderId: string | null) => void;
  onToggleExpand: (folderId: string) => void;
  onSelectDocument?: (documentId: string) => void;
}

// =============================================
// Component
// =============================================

export const FolderTree = memo(function FolderTree({
  folders,
  currentFolderId,
  expandedFolders,
  documents,
  selectedDocumentId,
  onNavigate,
  onToggleExpand,
  onSelectDocument,
}: FolderTreeProps) {
  // Get child folders for a given parent
  const getChildFolders = useCallback(
    (parentId: string | null): DocsFolder[] => {
      return folders.filter((f) => f.parent_id === parentId);
    },
    [folders]
  );

  // Check if a folder has children (subfolders or documents)
  const hasChildren = useCallback(
    (folderId: string): boolean => {
      const hasSubfolders = folders.some((f) => f.parent_id === folderId);
      const hasDocs = documents.some((d) => d.folder_id === folderId);
      return hasSubfolders || hasDocs;
    },
    [folders, documents]
  );

  // Get documents in a folder
  const getDocumentsInFolder = useCallback(
    (folderId: string | null): DocsDocument[] => {
      return documents.filter((d) => d.folder_id === folderId);
    },
    [documents]
  );

  // Render documents in a folder
  const renderDocuments = useCallback(
    (folderId: string | null, level: number): React.ReactNode => {
      if (!onSelectDocument) return null;

      const folderDocs = getDocumentsInFolder(folderId);
      if (folderDocs.length === 0) return null;

      return folderDocs.map((doc) => (
        <DocumentTreeItem
          key={doc.id}
          document={doc}
          level={level}
          isSelected={selectedDocumentId === doc.id}
          onSelect={onSelectDocument}
        />
      ));
    },
    [getDocumentsInFolder, selectedDocumentId, onSelectDocument]
  );

  // Render folder tree recursively
  const renderFolderTree = useCallback(
    (parentId: string | null, level: number = 0): React.ReactNode => {
      const childFolders = getChildFolders(parentId);
      const folderDocs = getDocumentsInFolder(parentId);

      return (
        <>
          {/* Render subfolders first */}
          {childFolders.map((folder) => {
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
                {/* Render children (folders and documents) if expanded */}
                {folderHasChildren && isExpanded && renderFolderTree(folder.id, level + 1)}
              </div>
            );
          })}
          {/* Render documents after folders */}
          {renderDocuments(parentId, level)}
        </>
      );
    },
    [getChildFolders, getDocumentsInFolder, hasChildren, expandedFolders, currentFolderId, documents, onToggleExpand, onNavigate, renderDocuments]
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
