// =============================================
// MyEasyDocs - TextEditor Component
// =============================================
// Simple text editor for TXT and MD files.
// Shows unsaved changes indicator.
// =============================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { Save, X, AlertCircle, Loader2 } from 'lucide-react';

// =============================================
// PROPS
// =============================================
interface TextEditorProps {
  content: string;
  fileName: string;
  isSaving?: boolean;
  onSave: (content: string) => void;
  onCancel: () => void;
}

// =============================================
// COMPONENT
// =============================================
export function TextEditor({
  content,
  fileName,
  isSaving = false,
  onSave,
  onCancel,
}: TextEditorProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [hasChanges, setHasChanges] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Track changes
  useEffect(() => {
    setHasChanges(editedContent !== content);
  }, [editedContent, content]);

  // Focus on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
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
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasChanges, isSaving, editedContent]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);
  }, []);

  const handleSave = useCallback(() => {
    if (!isSaving) {
      onSave(editedContent);
    }
  }, [editedContent, isSaving, onSave]);

  const handleCancel = useCallback(() => {
    if (hasChanges) {
      const confirmed = window.confirm(
        'Você tem alterações não salvas. Deseja descartar?'
      );
      if (!confirmed) return;
    }
    onCancel();
  }, [hasChanges, onCancel]);

  // Calculate line count
  const lineCount = editedContent.split('\n').length;
  const charCount = editedContent.length;

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-200">{fileName}</span>
          {hasChanges && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded">
              <AlertCircle className="w-3 h-3" />
              Alterações não salvas
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            <span>Cancelar</span>
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Editor */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={editedContent}
          onChange={handleChange}
          disabled={isSaving}
          spellCheck={false}
          className="w-full h-full p-4 bg-slate-950 text-slate-200 font-mono text-sm leading-relaxed resize-none focus:outline-none disabled:opacity-50"
          style={{ tabSize: 2 }}
        />
      </div>

      {/* Footer with stats */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-slate-700 bg-slate-800/30 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span>{lineCount.toLocaleString()} linhas</span>
          <span>{charCount.toLocaleString()} caracteres</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">Ctrl+S</kbd>
          <span>para salvar</span>
        </div>
      </div>
    </div>
  );
}
