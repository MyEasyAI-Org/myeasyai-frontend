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
}: FileGridProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
      {/* Folders first */}
      {folders.map((folder) => (
        <FileCard
          key={folder.id}
          item={folder}
          type="folder"
          documentsCount={documentsCountByFolder?.get(folder.id) ?? 0}
          onOpen={onOpenFolder}
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
        />
      ))}
    </div>
  );
});

export default FileGrid;
