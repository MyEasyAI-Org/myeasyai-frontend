// =============================================
// FileCard - Card component for grid view
// =============================================

import { memo, useCallback, useState, useRef, useEffect } from 'react';
import { Folder, Star, MoreVertical, Pencil, Trash2, FolderInput } from 'lucide-react';
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
  // Multi-select props
  selectionMode?: boolean;
  isChecked?: boolean;
  onToggleSelect?: (id: string, type: 'folder' | 'document') => void;
  // Action callbacks
  onOpen: (id: string) => void;
  onSelect?: (id: string) => void;
  onRename?: (item: DocsFolder | DocsDocument, type: 'folder' | 'document') => void;
  onDelete?: (item: DocsFolder | DocsDocument, type: 'folder' | 'document') => void;
  onMove?: (item: DocsFolder | DocsDocument, type: 'folder' | 'document') => void;
  onToggleFavorite?: (item: DocsDocument) => void;
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
  selectionMode = false,
  isChecked = false,
  onToggleSelect,
  onOpen,
  onSelect,
  onRename,
  onDelete,
  onMove,
  onToggleFavorite,
}: FileCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle checkbox click
  const handleCheckboxClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect?.(item.id, type);
  }, [item.id, type, onToggleSelect]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

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

  const handleMenuClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  }, []);

  const handleRename = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setMenuOpen(false);
      onRename?.(item, type);
    },
    [item, type, onRename]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setMenuOpen(false);
      onDelete?.(item, type);
    },
    [item, type, onDelete]
  );

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setMenuOpen(false);
      onMove?.(item, type);
    },
    [item, type, onMove]
  );

  const handleToggleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setMenuOpen(false);
      if (type === 'document' && onToggleFavorite) {
        onToggleFavorite(item as DocsDocument);
      }
    },
    [item, type, onToggleFavorite]
  );

  const hasContextMenu = onRename || onDelete || onMove || (type === 'document' && onToggleFavorite);

  if (type === 'folder') {
    return (
      <div className="relative group">
        {/* Checkbox - visible on hover or when in selection mode */}
        {onToggleSelect && (
          <div
            className={`absolute top-2 left-2 z-10 ${
              selectionMode || isChecked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            } transition-opacity`}
          >
            <label
              className="flex items-center justify-center w-6 h-6 bg-slate-800/90 border border-slate-600 rounded cursor-pointer hover:border-blue-500 transition-colors"
              onClick={handleCheckboxClick}
            >
              {isChecked && (
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </label>
          </div>
        )}

        <button
          onClick={handleSingleClick}
          className={`w-full flex flex-col items-center p-4 bg-slate-900/50 border rounded-xl transition-all ${
            isChecked
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/50'
          }`}
        >
          <Folder className="w-12 h-12 text-yellow-500 mb-3" />
          <span className="text-sm font-medium text-slate-200 truncate w-full text-center">
            {item.name}
          </span>
          <span className="text-xs text-slate-500 mt-1">
            {documentsCount} {documentsCount === 1 ? 'arquivo' : 'arquivos'}
          </span>
        </button>

        {/* Context Menu Button */}
        {hasContextMenu && (
          <div ref={menuRef} className="absolute top-2 right-2">
            <button
              onClick={handleMenuClick}
              className="p-1.5 rounded-lg bg-slate-800/80 opacity-0 group-hover:opacity-100 hover:bg-slate-700 transition-all"
            >
              <MoreVertical className="w-4 h-4 text-slate-400" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 py-1">
                {onRename && (
                  <button
                    onClick={handleRename}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    Renomear
                  </button>
                )}
                {onMove && (
                  <button
                    onClick={handleMove}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    <FolderInput className="w-4 h-4" />
                    Mover
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Document card
  const doc = item as DocsDocument;

  return (
    <div className="relative group">
      {/* Checkbox - visible on hover or when in selection mode */}
      {onToggleSelect && (
        <div
          className={`absolute top-2 left-2 z-20 ${
            selectionMode || isChecked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          } transition-opacity`}
        >
          <label
            className="flex items-center justify-center w-6 h-6 bg-slate-800/90 border border-slate-600 rounded cursor-pointer hover:border-blue-500 transition-colors"
            onClick={handleCheckboxClick}
          >
            {isChecked && (
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </label>
        </div>
      )}

      {/* Favorite indicator - adjusted position when checkbox exists */}
      {doc.is_favorite && (
        <div className={`absolute ${onToggleSelect ? 'top-10' : 'top-2'} left-2 z-10 p-1 bg-yellow-500/20 rounded-md border border-yellow-500/30`}>
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
        </div>
      )}

      <button
        onClick={handleSingleClick}
        onDoubleClick={handleDoubleClick}
        className={`w-full flex flex-col items-center p-4 bg-slate-900/50 border rounded-xl transition-all ${
          isChecked
            ? 'border-blue-500 bg-blue-500/10'
            : isSelected
              ? 'border-blue-500 bg-blue-500/10'
              : doc.is_favorite
                ? 'border-yellow-500/30 hover:border-yellow-500/50 hover:bg-slate-800/50'
                : 'border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/50'
        }`}
      >
        <FileIcon mimeType={doc.mime_type} size="xl" />
        <span className="text-sm font-medium text-slate-200 truncate w-full text-center mt-3">
          {doc.name}
        </span>
        <span className="text-xs text-slate-500 mt-1">{formatFileSize(doc.size)}</span>
      </button>

      {/* Context Menu Button */}
      {hasContextMenu && (
        <div ref={menuRef} className="absolute top-2 right-2">
          <button
            onClick={handleMenuClick}
            className="p-1.5 rounded-lg bg-slate-800/80 opacity-0 group-hover:opacity-100 hover:bg-slate-700 transition-all"
          >
            <MoreVertical className="w-4 h-4 text-slate-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 py-1">
              {onToggleFavorite && (
                <button
                  onClick={handleToggleFavorite}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  <Star className={`w-4 h-4 ${doc.is_favorite ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                  {doc.is_favorite ? 'Remover favorito' : 'Favoritar'}
                </button>
              )}
              {onRename && (
                <button
                  onClick={handleRename}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Renomear
                </button>
              )}
              {onMove && (
                <button
                  onClick={handleMove}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  <FolderInput className="w-4 h-4" />
                  Mover
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default FileCard;
