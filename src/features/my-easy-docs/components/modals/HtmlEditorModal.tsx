// =============================================
// MyEasyDocs - HtmlEditorModal Component
// =============================================
// Fullscreen modal for editing HTML files.
// Shows unsaved changes indicator and embeds HtmlEditor
// with code/split/preview modes.
// =============================================

import { useState, useCallback, useEffect } from 'react';
import { Save, X, AlertCircle, Loader2, Code2 } from 'lucide-react';
import { HtmlEditor } from '../preview/HtmlEditor';

// =============================================
// PROPS
// =============================================
interface HtmlEditorModalProps {
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
export function HtmlEditorModal({
  isOpen,
  content,
  fileName,
  isSaving = false,
  onSave,
  onClose,
}: HtmlEditorModalProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [hasChanges, setHasChanges] = useState(false);

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

  // Handle save
  const handleSave = useCallback(async (newContent: string) => {
    setEditedContent(newContent);
    if (!isSaving) {
      onSave(newContent);
    }
  }, [isSaving, onSave]);

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
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Code2 className="w-5 h-5 text-orange-400" />
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
              onClick={() => handleSave(editedContent)}
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

        {/* Editor area - HtmlEditor with all view modes */}
        <div className="flex-1 overflow-hidden">
          <HtmlEditor
            content={editedContent}
            isSaving={isSaving}
            onSave={handleSave}
            onCancel={handleClose}
          />
        </div>
      </div>
    </div>
  );
}
