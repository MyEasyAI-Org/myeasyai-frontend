// =============================================
// MyEasyDocs - DeleteConfirmModal Component
// =============================================
// Modal for confirming deletion of a folder or document.
// =============================================

import { useCallback } from 'react';
import { X, Trash2, Loader2, AlertTriangle, Folder, FileText } from 'lucide-react';

// =============================================
// PROPS
// =============================================
interface DeleteConfirmModalProps {
  isOpen: boolean;
  itemName: string;
  itemType: 'folder' | 'document';
  hasChildren?: boolean;
  childrenCount?: number;
  isDeleting?: boolean;
  /** Number of items selected for bulk delete (when > 1, shows bulk delete UI) */
  bulkCount?: number;
  onClose: () => void;
  onConfirm: () => void;
}

// =============================================
// COMPONENT
// =============================================
export function DeleteConfirmModal({
  isOpen,
  itemName,
  itemType,
  hasChildren = false,
  childrenCount = 0,
  isDeleting = false,
  bulkCount = 1,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  // Handle close
  const handleClose = useCallback(() => {
    if (!isDeleting) {
      onClose();
    }
  }, [isDeleting, onClose]);

  // Handle keyboard
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    },
    [isDeleting, onClose]
  );

  if (!isOpen) return null;

  const isBulkDelete = bulkCount > 1;
  const Icon = isBulkDelete ? Trash2 : (itemType === 'folder' ? Folder : FileText);
  const title = isBulkDelete
    ? `Excluir ${bulkCount} itens`
    : (itemType === 'folder' ? 'Excluir Pasta' : 'Excluir Arquivo');

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
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Item preview */}
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg mb-4">
            <Icon className="w-5 h-5 text-slate-400" />
            <span className="text-sm text-slate-300 truncate">
              {isBulkDelete ? `${bulkCount} itens selecionados` : itemName}
            </span>
          </div>

          {/* Warning message */}
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-slate-200">
                {isBulkDelete ? (
                  <>Tem certeza que deseja excluir <strong>{bulkCount} itens</strong>?</>
                ) : (
                  <>
                    Tem certeza que deseja excluir{' '}
                    {itemType === 'folder' ? 'esta pasta' : 'este arquivo'}?
                  </>
                )}
              </p>
              {!isBulkDelete && hasChildren && itemType === 'folder' && (
                <p className="mt-2 text-red-300">
                  <strong>Atenção:</strong> Esta pasta contém{' '}
                  {childrenCount > 0 ? `${childrenCount} item(ns)` : 'subpastas ou arquivos'} que
                  também serão excluídos permanentemente.
                </p>
              )}
              {isBulkDelete && (
                <p className="mt-2 text-red-300">
                  <strong>Atenção:</strong> Todos os itens selecionados serão excluídos permanentemente,
                  incluindo o conteúdo de pastas.
                </p>
              )}
              <p className="mt-2 text-slate-400">Esta ação não pode ser desfeita.</p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isDeleting}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Excluindo...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
