// =============================================
// FileGrid - Grid view for files and folders
// =============================================

import { memo } from 'react';
import type { DocsFolder, DocsDocument } from '../../types';
import { FileCard } from './FileCard';

// =============================================
// Types
// =============================================

interface FileGridProps {
  folders: DocsFolder[];
  documents: DocsDocument[];
  selectedDocumentId?: string | null;
  documentsCountByFolder?: Map<string, number>;
  // Multi-select props
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  hasAnySelection?: boolean;
  onToggleSelect?: (id: string, type: 'folder' | 'document') => void;
  // Action callbacks
  onOpenFolder: (folderId: string) => void;
  onSelectDocument: (documentId: string) => void;
  onOpenDocument?: (documentId: string) => void;
  onRenameItem?: (item: DocsFolder | DocsDocument, type: 'folder' | 'document') => void;
  onDeleteItem?: (item: DocsFolder | DocsDocument, type: 'folder' | 'document') => void;
  onMoveItem?: (item: DocsFolder | DocsDocument, type: 'folder' | 'document') => void;
  onToggleFavorite?: (item: DocsDocument) => void;
}

// =============================================
// Component
// =============================================

export const FileGrid = memo(function FileGrid({
  folders,
  documents,
  selectedDocumentId,
  documentsCountByFolder,
  selectionMode = false,
  selectedIds,
  hasAnySelection = false,
  onToggleSelect,
  onOpenFolder,
  onSelectDocument,
  onOpenDocument,
  onRenameItem,
  onDeleteItem,
  onMoveItem,
  onToggleFavorite,
}: FileGridProps) {
  return (
    <div className="flex flex-wrap gap-4">
      {/* Folders first */}
      {folders.map((folder) => (
        <div key={folder.id} className="flex-[1_1_160px] max-w-50">
          <FileCard
            item={folder}
            type="folder"
            documentsCount={documentsCountByFolder?.get(folder.id) ?? 0}
            selectionMode={selectionMode}
            isChecked={selectedIds?.has(folder.id) ?? false}
            hasAnySelection={hasAnySelection}
            onToggleSelect={onToggleSelect}
            onOpen={onOpenFolder}
            onRename={onRenameItem}
            onDelete={onDeleteItem}
            onMove={onMoveItem}
          />
        </div>
      ))}

      {/* Documents after folders */}
      {documents.map((doc) => (
        <div key={doc.id} className="flex-[1_1_160px] max-w-[200px]">
          <FileCard
            item={doc}
            type="document"
            isSelected={selectedDocumentId === doc.id}
            selectionMode={selectionMode}
            isChecked={selectedIds?.has(doc.id) ?? false}
            hasAnySelection={hasAnySelection}
            onToggleSelect={onToggleSelect}
            onOpen={onOpenDocument ?? onSelectDocument}
            onSelect={onSelectDocument}
            onRename={onRenameItem}
            onDelete={onDeleteItem}
            onMove={onMoveItem}
            onToggleFavorite={onToggleFavorite}
          />
        </div>
      ))}
    </div>
  );
});

export default FileGrid;
