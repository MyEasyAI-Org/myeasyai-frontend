// =============================================
// MyEasyDocs - DeleteConfirmModal Component
// =============================================
// Modal for confirming deletion of a folder or document.
// =============================================

import { useCallback, useEffect, useState } from 'react';
import { X, Trash2, Loader2, AlertTriangle, Folder, FileText, CheckCircle, XCircle } from 'lucide-react';

// =============================================
// TYPES
// =============================================
type DeleteStatus = 'idle' | 'deleting' | 'success' | 'error';

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
  const [status, setStatus] = useState<DeleteStatus>('idle');
  const [progress, setProgress] = useState(0);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setProgress(0);
    }
  }, [isOpen]);

  // Track deletion progress
  useEffect(() => {
    if (isDeleting && status !== 'deleting') {
      setStatus('deleting');
      setProgress(0);
    }
  }, [isDeleting, status]);

  // Animate progress during deletion
  useEffect(() => {
    if (status === 'deleting') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev; // Cap at 90% until complete
          return prev + Math.random() * 15;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [status]);

  // Handle deletion completion
  useEffect(() => {
    if (!isDeleting && status === 'deleting') {
      setProgress(100);
      setStatus('success');
      // Auto close after success
      const timeout = setTimeout(() => {
        onClose();
      }, 1200);
      return () => clearTimeout(timeout);
    }
  }, [isDeleting, status, onClose]);

  // Handle close
  const handleClose = useCallback(() => {
    if (!isDeleting && status !== 'success') {
      onClose();
    }
  }, [isDeleting, status, onClose]);

  // Handle keyboard
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting && status !== 'success') {
        onClose();
      }
    },
    [isDeleting, status, onClose]
  );

  if (!isOpen) return null;

  const isBulkDelete = bulkCount > 1;
  const Icon = isBulkDelete ? Trash2 : (itemType === 'folder' ? Folder : FileText);
  const title = isBulkDelete
    ? `Excluir ${bulkCount} itens`
    : (itemType === 'folder' ? 'Excluir Pasta' : 'Excluir Arquivo');

  // Status-based styles
  const getStatusStyles = () => {
    switch (status) {
      case 'success':
        return {
          headerBg: 'bg-green-500/20',
          headerIcon: <CheckCircle className="w-5 h-5 text-green-400" />,
          title: 'Excluído com sucesso!',
          borderColor: 'border-green-500/30',
        };
      case 'error':
        return {
          headerBg: 'bg-red-500/20',
          headerIcon: <XCircle className="w-5 h-5 text-red-400" />,
          title: 'Erro ao excluir',
          borderColor: 'border-red-500/30',
        };
      default:
        return {
          headerBg: 'bg-red-500/20',
          headerIcon: <Trash2 className="w-5 h-5 text-red-400" />,
          title: title,
          borderColor: 'border-slate-700',
        };
    }
  };

  const statusStyles = getStatusStyles();

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
      <div className={`relative w-full max-w-md bg-slate-900 border rounded-xl shadow-2xl m-4 transition-all duration-300 ${statusStyles.borderColor}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-all duration-300 ${statusStyles.headerBg}`}>
              {statusStyles.headerIcon}
            </div>
            <h2 className="text-lg font-semibold text-white">{statusStyles.title}</h2>
          </div>
          {status !== 'success' && (
            <button
              onClick={handleClose}
              disabled={isDeleting}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Success state */}
          {status === 'success' && (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 animate-[scale_0.3s_ease-out]">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-slate-300 text-center">
                {isBulkDelete
                  ? `${bulkCount} itens foram excluídos.`
                  : `"${itemName}" foi excluído.`}
              </p>
            </div>
          )}

          {/* Deleting state */}
          {status === 'deleting' && (
            <div className="py-4">
              <div className="flex flex-col items-center mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-3">
                  <Trash2 className="w-6 h-6 text-red-400 animate-pulse" />
                </div>
                <p className="text-slate-300 text-sm">
                  {isBulkDelete ? 'Excluindo itens...' : 'Excluindo...'}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 text-center mt-2">
                {Math.round(progress)}%
              </p>
            </div>
          )}

          {/* Idle state - confirmation UI */}
          {status === 'idle' && (
            <>
              {/* Item preview */}
              <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg mb-4 border border-slate-700">
                <div className="p-2 bg-slate-700/50 rounded-lg">
                  <Icon className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-slate-300 truncate block">
                    {isBulkDelete ? `${bulkCount} itens selecionados` : itemName}
                  </span>
                  {!isBulkDelete && itemType === 'folder' && hasChildren && (
                    <span className="text-xs text-slate-500">
                      Contém {childrenCount} item(ns)
                    </span>
                  )}
                </div>
              </div>

              {/* Warning message */}
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-slate-200">
                    {isBulkDelete ? (
                      <>Tem certeza que deseja excluir <strong className="text-red-300">{bulkCount} itens</strong>?</>
                    ) : (
                      <>
                        Tem certeza que deseja excluir{' '}
                        <strong className="text-red-300">
                          {itemType === 'folder' ? 'esta pasta' : 'este arquivo'}
                        </strong>?
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
                  <p className="mt-2 text-slate-400 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    Esta ação não pode ser desfeita.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isDeleting}
                  className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir{isBulkDelete ? ` (${bulkCount})` : ''}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
