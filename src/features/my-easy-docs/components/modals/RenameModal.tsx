// =============================================
// MyEasyDocs - RenameModal Component
// =============================================
// Modal for renaming a folder or document.
// =============================================

import { useState, useEffect, useCallback } from 'react';
import { X, Pencil, Loader2, Folder, FileText } from 'lucide-react';

// =============================================
// PROPS
// =============================================
interface RenameModalProps {
  isOpen: boolean;
  currentName: string;
  itemType: 'folder' | 'document';
  isRenaming?: boolean;
  onClose: () => void;
  onRename: (newName: string) => void;
}

// =============================================
// COMPONENT
// =============================================
export function RenameModal({
  isOpen,
  currentName,
  itemType,
  isRenaming = false,
  onClose,
  onRename,
}: RenameModalProps) {
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setNewName(currentName);
      setError('');
    }
  }, [isOpen, currentName]);

  // Validate name
  const validate = useCallback(
    (name: string): string => {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return `Nome ${itemType === 'folder' ? 'da pasta' : 'do arquivo'} é obrigatório`;
      }
      if (trimmedName === currentName) {
        return 'O novo nome deve ser diferente do atual';
      }
      if (trimmedName.length > 255) {
        return 'Nome muito longo (máximo 255 caracteres)';
      }
      // Check for invalid characters
      if (/[<>:"/\\|?*]/.test(trimmedName)) {
        return 'Nome contém caracteres inválidos';
      }
      return '';
    },
    [currentName, itemType]
  );

  // Handle input change
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setNewName(value);
      // Clear error when user types
      if (error) {
        setError('');
      }
    },
    [error]
  );

  // Handle form submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const validationError = validate(newName);
      if (validationError) {
        setError(validationError);
        return;
      }

      onRename(newName.trim());
    },
    [newName, validate, onRename]
  );

  // Handle close
  const handleClose = useCallback(() => {
    if (!isRenaming) {
      onClose();
    }
  }, [isRenaming, onClose]);

  // Handle keyboard
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && !isRenaming) {
        onClose();
      }
    },
    [isRenaming, onClose]
  );

  if (!isOpen) return null;

  const Icon = itemType === 'folder' ? Folder : FileText;
  const title = itemType === 'folder' ? 'Renomear Pasta' : 'Renomear Arquivo';
  const label = itemType === 'folder' ? 'Nome da pasta' : 'Nome do arquivo';

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
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl m-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Pencil className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isRenaming}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Current name preview */}
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg mb-4">
            <Icon className="w-5 h-5 text-slate-400" />
            <span className="text-sm text-slate-300 truncate">{currentName}</span>
          </div>

          <div>
            <label
              htmlFor="new-name"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              {label}
            </label>
            <input
              id="new-name"
              type="text"
              value={newName}
              onChange={handleNameChange}
              placeholder="Digite o novo nome..."
              disabled={isRenaming}
              autoFocus
              onFocus={(e) => {
                // Select text up to extension for files
                if (itemType === 'document') {
                  const lastDot = currentName.lastIndexOf('.');
                  if (lastDot > 0) {
                    e.target.setSelectionRange(0, lastDot);
                  } else {
                    e.target.select();
                  }
                } else {
                  e.target.select();
                }
              }}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 transition-colors"
            />
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isRenaming}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isRenaming || !newName.trim() || newName.trim() === currentName}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRenaming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Renomeando...</span>
                </>
              ) : (
                <span>Renomear</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
