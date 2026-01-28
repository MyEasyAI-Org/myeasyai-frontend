// =============================================
// MyEasyDocs - TextEditorModal Component
// =============================================
// Fullscreen modal for editing TXT and MD files.
// Shows unsaved changes indicator and keyboard shortcuts.
// =============================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { Save, X, AlertCircle, Loader2, FileText } from 'lucide-react';

// =============================================
// PROPS
// =============================================
interface TextEditorModalProps {
  isOpen: boolean;
  content: string;
  fileName: string;
  isSaving?: boolean;
  onSave: (content: string) => void;
  onClose: () => void;
}

// =============================================
// COMPONENT
// =============================================
export function TextEditorModal({
  isOpen,
  content,
  fileName,
  isSaving = false,
  onSave,
  onClose,
}: TextEditorModalProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [hasChanges, setHasChanges] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset content when modal opens with new content
  useEffect(() => {
    if (isOpen) {
      setEditedContent(content);
      setHasChanges(false);
    }
  }, [isOpen, content]);

  // Track changes
  useEffect(() => {
    setHasChanges(editedContent !== content);
  }, [editedContent, content]);

  // Focus on mount
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isOpen]);

  // Handle save
  const handleSave = useCallback(() => {
    if (!isSaving) {
      onSave(editedContent);
    }
  }, [editedContent, isSaving, onSave]);

  // Handle close with confirmation
  const handleClose = useCallback(() => {
    if (hasChanges) {
      const confirmed = window.confirm(
        'Você tem alterações não salvas. Deseja descartar?'
      );
      if (!confirmed) return;
    }
    onClose();
  }, [hasChanges, onClose]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasChanges && !isSaving) {
          handleSave();
        }
      }
      // Escape to cancel (with confirmation if changes)
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasChanges, isSaving, handleSave, handleClose]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);
  }, []);

  // Calculate line count
  const lineCount = editedContent.split('\n').length;
  const charCount = editedContent.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal - fullscreen */}
      <div className="relative flex flex-col w-full h-full bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-base font-medium text-white">{fileName}</span>
              {hasChanges && (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                  <AlertCircle className="w-3 h-3" />
                  Alterações não salvas
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              <span>Cancelar</span>
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Editor area - takes all available space */}
        <div className="flex-1 overflow-hidden">
          <textarea
            ref={textareaRef}
            value={editedContent}
            onChange={handleChange}
            disabled={isSaving}
            spellCheck={false}
            className="w-full h-full p-6 bg-slate-950 text-slate-200 font-mono text-sm leading-relaxed resize-none focus:outline-none disabled:opacity-50"
            style={{ tabSize: 2 }}
            placeholder="Digite o conteúdo do arquivo..."
          />
        </div>

        {/* Footer with stats and shortcuts */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-700 bg-slate-800/50 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>{lineCount.toLocaleString()} linhas</span>
            <span>•</span>
            <span>{charCount.toLocaleString()} caracteres</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">Ctrl+S</kbd>
              <span>salvar</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">Esc</kbd>
              <span>fechar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
