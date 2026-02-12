// =============================================
// MyEasyDocs - CreateFolderModal Component
// =============================================
// Modal for creating a new folder.
// =============================================

import { useState, useEffect, useCallback } from 'react';
import { X, FolderPlus, Loader2 } from 'lucide-react';

// =============================================
// PROPS
// =============================================
interface CreateFolderModalProps {
  isOpen: boolean;
  parentFolderName?: string;
  isCreating?: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

// =============================================
// COMPONENT
// =============================================
export function CreateFolderModal({
  isOpen,
  parentFolderName,
  isCreating = false,
  onClose,
  onCreate,
}: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFolderName('');
      setError('');
    }
  }, [isOpen]);

  // Validate folder name
  const validate = useCallback((name: string): string => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return 'Nome da pasta é obrigatório';
    }
    if (trimmedName.length > 255) {
      return 'Nome muito longo (máximo 255 caracteres)';
    }
    // Check for invalid characters
    if (/[<>:"/\\|?*]/.test(trimmedName)) {
      return 'Nome contém caracteres inválidos';
    }
    return '';
  }, []);

  // Handle input change
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFolderName(value);
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

      const validationError = validate(folderName);
      if (validationError) {
        setError(validationError);
        return;
      }

      onCreate(folderName.trim());
    },
    [folderName, validate, onCreate]
  );

  // Handle close
  const handleClose = useCallback(() => {
    if (!isCreating) {
      onClose();
    }
  }, [isCreating, onClose]);

  // Handle keyboard
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && !isCreating) {
        onClose();
      }
    },
    [isCreating, onClose]
  );

  if (!isOpen) return null;

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
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FolderPlus className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Nova Pasta</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isCreating}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {parentFolderName && (
            <p className="text-sm text-slate-400 mb-4">
              Criar pasta em: <span className="text-slate-300">{parentFolderName}</span>
            </p>
          )}

          <div>
            <label
              htmlFor="folder-name"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Nome da pasta
            </label>
            <input
              id="folder-name"
              type="text"
              value={folderName}
              onChange={handleNameChange}
              placeholder="Digite o nome da pasta..."
              disabled={isCreating}
              autoFocus
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-colors"
            />
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreating}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCreating || !folderName.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Criando...</span>
                </>
              ) : (
                <span>Criar Pasta</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
