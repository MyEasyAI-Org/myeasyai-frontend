// =============================================
// MyEasyDocs - CreateFileModal Component
// =============================================
// Modal for creating a new text file (.txt or .md).
// =============================================

import { useState, useEffect, useCallback } from 'react';
import { X, FilePlus, Loader2, FileText, FileCode } from 'lucide-react';

// =============================================
// TYPES
// =============================================
type FileType = 'txt' | 'md';

// =============================================
// PROPS
// =============================================
interface CreateFileModalProps {
  isOpen: boolean;
  parentFolderName?: string;
  isCreating?: boolean;
  onClose: () => void;
  onCreate: (name: string, extension: FileType) => void;
}

// =============================================
// COMPONENT
// =============================================
export function CreateFileModal({
  isOpen,
  parentFolderName,
  isCreating = false,
  onClose,
  onCreate,
}: CreateFileModalProps) {
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<FileType>('txt');
  const [error, setError] = useState('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFileName('');
      setFileType('txt');
      setError('');
    }
  }, [isOpen]);

  // Validate file name
  const validate = useCallback((name: string): string => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return 'Nome do arquivo é obrigatório';
    }
    if (trimmedName.length > 255) {
      return 'Nome muito longo (máximo 255 caracteres)';
    }
    // Check for invalid characters
    if (/[<>:"/\\|?*]/.test(trimmedName)) {
      return 'Nome contém caracteres inválidos';
    }
    // Check if name already has extension
    if (trimmedName.endsWith('.txt') || trimmedName.endsWith('.md')) {
      return 'Não inclua a extensão no nome';
    }
    return '';
  }, []);

  // Handle input change
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFileName(value);
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

      const validationError = validate(fileName);
      if (validationError) {
        setError(validationError);
        return;
      }

      onCreate(fileName.trim(), fileType);
    },
    [fileName, fileType, validate, onCreate]
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

  // Get full file name with extension
  const fullFileName = fileName.trim() ? `${fileName.trim()}.${fileType}` : '';

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
            <div className="p-2 bg-green-500/20 rounded-lg">
              <FilePlus className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Novo Arquivo</h2>
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
              Criar arquivo em: <span className="text-slate-300">{parentFolderName}</span>
            </p>
          )}

          {/* File type selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tipo de arquivo
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFileType('txt')}
                disabled={isCreating}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all
                  ${fileType === 'txt'
                    ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                    : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
                  }
                  disabled:opacity-50
                `}
              >
                <FileText className="w-5 h-5" />
                <span>.txt</span>
              </button>
              <button
                type="button"
                onClick={() => setFileType('md')}
                disabled={isCreating}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all
                  ${fileType === 'md'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                    : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
                  }
                  disabled:opacity-50
                `}
              >
                <FileCode className="w-5 h-5" />
                <span>.md</span>
              </button>
            </div>
          </div>

          {/* File name input */}
          <div>
            <label
              htmlFor="file-name"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Nome do arquivo
            </label>
            <div className="relative">
              <input
                id="file-name"
                type="text"
                value={fileName}
                onChange={handleNameChange}
                placeholder="Digite o nome do arquivo..."
                disabled={isCreating}
                autoFocus
                className="w-full px-4 py-3 pr-16 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                .{fileType}
              </span>
            </div>
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          </div>

          {/* Preview */}
          {fullFileName && !error && (
            <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Arquivo será criado como:</p>
              <p className="text-sm font-medium text-white">{fullFileName}</p>
            </div>
          )}

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
              disabled={isCreating || !fileName.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Criando...</span>
                </>
              ) : (
                <span>Criar Arquivo</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
