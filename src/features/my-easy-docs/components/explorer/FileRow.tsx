// =============================================
// FileRow - Row component for list view
// =============================================

import { memo, useCallback, useState, useRef, useEffect } from 'react';
import { Folder, Star, MoreVertical, Pencil, Trash2, FolderInput } from 'lucide-react';
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
// Component
// =============================================

export const FileRow = memo(function FileRow({
  item,
  type,
  isSelected = false,
  selectionMode = false,
  isChecked = false,
  onToggleSelect,
  onOpen,
  onSelect,
  onRename,
  onDelete,
  onMove,
  onToggleFavorite,
}: FileRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle checkbox change
  const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onToggleSelect?.(item.id, type);
  }, [item.id, type, onToggleSelect]);

  const handleCheckboxClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

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
    if (type === 'folder') {
      onOpen(item.id);
    } else if (onSelect) {
      onSelect(item.id);
    }
  }, [type, item.id, onOpen, onSelect]);

  const handleDoubleClick = useCallback(() => {
    onOpen(item.id);
  }, [item.id, onOpen]);

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
    const folder = item as DocsFolder;

    return (
      <tr
        onClick={handleClick}
        className={`cursor-pointer transition-colors group ${
          isChecked ? 'bg-blue-500/10' : 'hover:bg-slate-800/50'
        }`}
      >
        {/* Checkbox column */}
        {onToggleSelect && (
          <td className="w-10 px-2" onClick={handleCheckboxClick}>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleCheckboxChange}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
            />
          </td>
        )}
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Folder className="w-5 h-5 text-yellow-500 shrink-0" />
            <span className="text-sm text-slate-200 truncate">{folder.name}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-slate-500">—</td>
        <td className="px-4 py-3 text-sm text-slate-500">Pasta</td>
        <td className="px-4 py-3 text-sm text-slate-500">
          {formatRelativeTime(folder.updated_at)}
        </td>
        {hasContextMenu && (
          <td className="px-4 py-3 text-right relative">
            <div ref={menuRef} className="inline-block">
              <button
                onClick={handleMenuClick}
                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-700 transition-all"
              >
                <MoreVertical className="w-4 h-4 text-slate-400" />
              </button>

              {menuOpen && (
                <div className="absolute right-4 top-full mt-1 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 py-1">
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
          </td>
        )}
      </tr>
    );
  }

  // Document row
  const doc = item as DocsDocument;

  return (
    <tr
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={`cursor-pointer transition-colors group ${
        isChecked
          ? 'bg-blue-500/10'
          : isSelected
            ? 'bg-blue-500/10'
            : doc.is_favorite
              ? 'bg-yellow-500/5 hover:bg-yellow-500/10'
              : 'hover:bg-slate-800/50'
      }`}
    >
      {/* Checkbox column */}
      {onToggleSelect && (
        <td className="w-10 px-2" onClick={handleCheckboxClick}>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
          />
        </td>
      )}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {doc.is_favorite && (
            <div className="p-1 bg-yellow-500/20 rounded border border-yellow-500/30 shrink-0">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            </div>
          )}
          <FileIcon mimeType={doc.mime_type} size="md" />
          <span className="text-sm text-slate-200 truncate">{doc.name}</span>
          {doc.is_favorite && (
            <span className="text-xs text-yellow-500/70 shrink-0">Favorito</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-500">{formatFileSize(doc.size)}</td>
      <td className="px-4 py-3 text-sm text-slate-500">{getFileTypeLabel(doc.mime_type)}</td>
      <td className="px-4 py-3 text-sm text-slate-500">{formatRelativeTime(doc.updated_at)}</td>
      {hasContextMenu && (
        <td className="px-4 py-3 text-right relative">
          <div ref={menuRef} className="inline-block">
            <button
              onClick={handleMenuClick}
              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-700 transition-all"
            >
              <MoreVertical className="w-4 h-4 text-slate-400" />
            </button>

            {menuOpen && (
              <div className="absolute right-4 top-full mt-1 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 py-1">
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
        </td>
      )}
    </tr>
  );
});

export default FileRow;
