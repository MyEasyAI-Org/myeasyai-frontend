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
  onOpenFolder,
  onSelectDocument,
  onOpenDocument,
  onRenameItem,
  onDeleteItem,
  onMoveItem,
  onToggleFavorite,
}: FileGridProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,170px))] gap-4">
      {/* Folders first */}
      {folders.map((folder) => (
        <FileCard
          key={folder.id}
          item={folder}
          type="folder"
          documentsCount={documentsCountByFolder?.get(folder.id) ?? 0}
          onOpen={onOpenFolder}
          onRename={onRenameItem}
          onDelete={onDeleteItem}
          onMove={onMoveItem}
        />
      ))}

      {/* Documents after folders */}
      {documents.map((doc) => (
        <FileCard
          key={doc.id}
          item={doc}
          type="document"
          isSelected={selectedDocumentId === doc.id}
          onOpen={onOpenDocument ?? onSelectDocument}
          onSelect={onSelectDocument}
          onRename={onRenameItem}
          onDelete={onDeleteItem}
          onMove={onMoveItem}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
});

export default FileGrid;
