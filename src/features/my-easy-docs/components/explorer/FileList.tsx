// =============================================
// FileList - List/table view for files and folders
// =============================================

import { memo, useState, useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { DocsFolder, DocsDocument, DocsSortField, DocsSortOrder } from '../../types';
import { FileRow } from './FileRow';

// =============================================
// Types
// =============================================

interface FileListProps {
  folders: DocsFolder[];
  documents: DocsDocument[];
  selectedDocumentId?: string | null;
  onOpenFolder: (folderId: string) => void;
  onSelectDocument: (documentId: string) => void;
  onOpenDocument?: (documentId: string) => void;
  onRenameItem?: (item: DocsFolder | DocsDocument, type: 'folder' | 'document') => void;
  onDeleteItem?: (item: DocsFolder | DocsDocument, type: 'folder' | 'document') => void;
  onMoveItem?: (item: DocsFolder | DocsDocument, type: 'folder' | 'document') => void;
}

interface ColumnConfig {
  key: DocsSortField | 'none';
  label: string;
  sortable: boolean;
}

// =============================================
// Constants
// =============================================

const COLUMNS: ColumnConfig[] = [
  { key: 'name', label: 'Nome', sortable: true },
  { key: 'size', label: 'Tamanho', sortable: true },
  { key: 'mime_type', label: 'Tipo', sortable: true },
  { key: 'updated_at', label: 'Modificado', sortable: true },
];

// =============================================
// Component
// =============================================

export const FileList = memo(function FileList({
  folders,
  documents,
  selectedDocumentId,
  onOpenFolder,
  onSelectDocument,
  onOpenDocument,
  onRenameItem,
  onDeleteItem,
  onMoveItem,
}: FileListProps) {
  const [sortField, setSortField] = useState<DocsSortField>('name');
  const [sortOrder, setSortOrder] = useState<DocsSortOrder>('asc');

  const handleSort = useCallback((field: DocsSortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  }, [sortField]);

  // Sort documents (folders are always at the top)
  const sortedDocuments = [...documents].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'mime_type':
        comparison = a.mime_type.localeCompare(b.mime_type);
        break;
      case 'updated_at':
      case 'created_at':
        comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        break;
      default:
        comparison = 0;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Sort folders by name
  const sortedFolders = [...folders].sort((a, b) => {
    const comparison = a.name.localeCompare(b.name);
    return sortField === 'name' && sortOrder === 'desc' ? -comparison : comparison;
  });

  const hasContextMenu = onRenameItem || onDeleteItem || onMoveItem;

  return (
    <div className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-800">
            {COLUMNS.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
              >
                {column.sortable ? (
                  <button
                    onClick={() => handleSort(column.key as DocsSortField)}
                    className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                  >
                    {column.label}
                    {sortField === column.key && (
                      sortOrder === 'asc' ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )
                    )}
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
            {hasContextMenu && (
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider w-16">
                Ações
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {/* Folders always first */}
          {sortedFolders.map((folder) => (
            <FileRow
              key={folder.id}
              item={folder}
              type="folder"
              onOpen={onOpenFolder}
              onRename={onRenameItem}
              onDelete={onDeleteItem}
              onMove={onMoveItem}
            />
          ))}

          {/* Documents after folders */}
          {sortedDocuments.map((doc) => (
            <FileRow
              key={doc.id}
              item={doc}
              type="document"
              isSelected={selectedDocumentId === doc.id}
              onOpen={onOpenDocument ?? onSelectDocument}
              onSelect={onSelectDocument}
              onRename={onRenameItem}
              onDelete={onDeleteItem}
              onMove={onMoveItem}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default FileList;
