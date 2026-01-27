// =============================================
// MyEasyDocs - MoveItemModal Component
// =============================================
// Modal for moving a folder or document to another location.
// Features a mini folder tree for destination selection.
// =============================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { X, FolderInput, Loader2, Folder, FileText, ChevronRight, ChevronDown, Home } from 'lucide-react';
import type { DocsFolder, DocsDocument } from '../../types';

// =============================================
// PROPS
// =============================================
interface MoveItemModalProps {
  isOpen: boolean;
  item: DocsFolder | DocsDocument | null;
  itemType: 'folder' | 'document';
  folders: DocsFolder[];
  currentFolderId: string | null;
  isMoving?: boolean;
  onClose: () => void;
  onMove: (destinationFolderId: string | null) => void;
}

// =============================================
// MINI FOLDER TREE ITEM
// =============================================
interface FolderTreeItemProps {
  folder: DocsFolder;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  childFolders: DocsFolder[];
  allFolders: DocsFolder[];
  expandedFolders: Set<string>;
  selectedFolderId: string | null;
  disabledFolderIds: Set<string>;
  onToggle: (folderId: string) => void;
  onSelect: (folderId: string | null) => void;
}

function MiniFolderTreeItem({
  folder,
  level,
  isExpanded,
  isSelected,
  isDisabled,
  childFolders,
  allFolders,
  expandedFolders,
  selectedFolderId,
  disabledFolderIds,
  onToggle,
  onSelect,
}: FolderTreeItemProps) {
  const hasChildren = childFolders.length > 0;

  return (
    <div>
      <div
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors
          ${isSelected ? 'bg-blue-500/20 border border-blue-500/50' : 'hover:bg-slate-800 border border-transparent'}
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={() => !isDisabled && onSelect(folder.id)}
      >
        {/* Expand/Collapse button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggle(folder.id);
          }}
          className={`w-5 h-5 flex items-center justify-center ${hasChildren ? 'text-slate-400' : 'text-transparent'}`}
        >
          {hasChildren && (isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
        </button>

        {/* Folder icon */}
        <Folder className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-amber-400'}`} />

        {/* Folder name */}
        <span className={`text-sm truncate ${isSelected ? 'text-blue-300' : 'text-slate-300'}`}>
          {folder.name}
        </span>

        {/* Disabled indicator */}
        {isDisabled && (
          <span className="text-xs text-slate-500 ml-auto">(atual)</span>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {childFolders.map((child) => (
            <MiniFolderTreeItem
              key={child.id}
              folder={child}
              level={level + 1}
              isExpanded={expandedFolders.has(child.id)}
              isSelected={selectedFolderId === child.id}
              isDisabled={disabledFolderIds.has(child.id)}
              childFolders={allFolders.filter((f) => f.parent_id === child.id)}
              allFolders={allFolders}
              expandedFolders={expandedFolders}
              selectedFolderId={selectedFolderId}
              disabledFolderIds={disabledFolderIds}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================
// MAIN COMPONENT
// =============================================
export function MoveItemModal({
  isOpen,
  item,
  itemType,
  folders,
  currentFolderId,
  isMoving = false,
  onClose,
  onMove,
}: MoveItemModalProps) {
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDestination(null);
      // Auto-expand all folders for better UX
      setExpandedFolders(new Set(folders.map((f) => f.id)));
    }
  }, [isOpen, folders]);

  // Get disabled folder IDs (current folder and its descendants for folders)
  const disabledFolderIds = useMemo(() => {
    const disabled = new Set<string>();

    // Current folder of the item is disabled
    if (currentFolderId) {
      disabled.add(currentFolderId);
    }

    // If moving a folder, disable the folder itself and all descendants
    if (itemType === 'folder' && item) {
      const folderId = item.id;
      disabled.add(folderId);

      // Find all descendants recursively
      const findDescendants = (parentId: string) => {
        for (const folder of folders) {
          if (folder.parent_id === parentId) {
            disabled.add(folder.id);
            findDescendants(folder.id);
          }
        }
      };
      findDescendants(folderId);
    }

    return disabled;
  }, [currentFolderId, itemType, item, folders]);

  // Get root level folders
  const rootFolders = useMemo(() => {
    return folders.filter((f) => f.parent_id === null);
  }, [folders]);

  // Toggle folder expansion
  const handleToggle = useCallback((folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  // Select destination
  const handleSelect = useCallback((folderId: string | null) => {
    setSelectedDestination(folderId);
  }, []);

  // Handle move
  const handleMove = useCallback(() => {
    // Only allow move if destination is different from current
    if (selectedDestination !== currentFolderId) {
      onMove(selectedDestination);
    }
  }, [selectedDestination, currentFolderId, onMove]);

  // Handle close
  const handleClose = useCallback(() => {
    if (!isMoving) {
      onClose();
    }
  }, [isMoving, onClose]);

  // Handle keyboard
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && !isMoving) {
        onClose();
      }
    },
    [isMoving, onClose]
  );

  if (!isOpen || !item) return null;

  const ItemIcon = itemType === 'folder' ? Folder : FileText;
  const itemName = 'name' in item ? item.name : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl m-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <FolderInput className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Mover Item</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isMoving}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-hidden flex flex-col">
          {/* Item preview */}
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg mb-4 flex-shrink-0">
            <ItemIcon className={`w-5 h-5 ${itemType === 'folder' ? 'text-amber-400' : 'text-slate-400'}`} />
            <span className="text-sm text-slate-300 truncate">{itemName}</span>
          </div>

          <p className="text-sm text-slate-400 mb-3 flex-shrink-0">
            Selecione a pasta de destino:
          </p>

          {/* Folder tree */}
          <div className="flex-1 overflow-y-auto bg-slate-800/30 rounded-lg border border-slate-700 p-2">
            {/* Root (Meus Documentos) */}
            <div
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors
                ${selectedDestination === null ? 'bg-blue-500/20 border border-blue-500/50' : 'hover:bg-slate-800 border border-transparent'}
                ${currentFolderId === null ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => currentFolderId !== null && handleSelect(null)}
            >
              <div className="w-5 h-5" /> {/* Spacer for alignment */}
              <Home className={`w-4 h-4 ${selectedDestination === null ? 'text-blue-400' : 'text-slate-400'}`} />
              <span className={`text-sm ${selectedDestination === null ? 'text-blue-300' : 'text-slate-300'}`}>
                Meus Documentos
              </span>
              {currentFolderId === null && (
                <span className="text-xs text-slate-500 ml-auto">(atual)</span>
              )}
            </div>

            {/* Folder tree */}
            {rootFolders.map((folder) => (
              <MiniFolderTreeItem
                key={folder.id}
                folder={folder}
                level={0}
                isExpanded={expandedFolders.has(folder.id)}
                isSelected={selectedDestination === folder.id}
                isDisabled={disabledFolderIds.has(folder.id)}
                childFolders={folders.filter((f) => f.parent_id === folder.id)}
                allFolders={folders}
                expandedFolders={expandedFolders}
                selectedFolderId={selectedDestination}
                disabledFolderIds={disabledFolderIds}
                onToggle={handleToggle}
                onSelect={handleSelect}
              />
            ))}

            {folders.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">
                Nenhuma pasta disponível
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-6 flex-shrink-0">
            <button
              type="button"
              onClick={handleClose}
              disabled={isMoving}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleMove}
              disabled={isMoving || selectedDestination === currentFolderId}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMoving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Movendo...</span>
                </>
              ) : (
                <>
                  <FolderInput className="w-4 h-4" />
                  <span>Mover</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
