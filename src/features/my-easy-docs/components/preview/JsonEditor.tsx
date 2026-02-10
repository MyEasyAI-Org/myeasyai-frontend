// =============================================
// MyEasyDocs - JsonEditor Component
// =============================================
// Editable JSON with syntax highlighting, validation,
// and formatting using CodeMirror.
// =============================================

import { useState, useEffect, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { Save, X, Loader2, CheckCircle, AlertCircle, AlignLeft } from 'lucide-react';
import { MESSAGES } from '../../constants';

// =============================================
// PROPS
// =============================================
interface JsonEditorProps {
  content: string;
  isSaving?: boolean;
  onSave: (content: string) => Promise<void>;
  onCancel: () => void;
}

// =============================================
// HELPERS
// =============================================
function validateJson(content: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(content);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }
}

// =============================================
// COMPONENT
// =============================================
export function JsonEditor({ content, isSaving = false, onSave, onCancel }: JsonEditorProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [validation, setValidation] = useState<{ valid: boolean; error?: string }>({ valid: true });

  // Validate on every change
  useEffect(() => {
    setValidation(validateJson(editedContent));
  }, [editedContent]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!isSaving && validation.valid) {
          await onSave(editedContent);
        }
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editedContent, isSaving, validation.valid, onSave, onCancel]);

  const handleFormat = useCallback(() => {
    try {
      const parsed = JSON.parse(editedContent);
      setEditedContent(JSON.stringify(parsed, null, 2));
    } catch {
      // Cannot format invalid JSON
    }
  }, [editedContent]);

  const handleSave = useCallback(async () => {
    if (!isSaving && validation.valid) {
      await onSave(editedContent);
    }
  }, [editedContent, isSaving, validation.valid, onSave]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-2">
          {/* Validation status */}
          {validation.valid ? (
            <div className="flex items-center gap-1.5 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>{MESSAGES.preview.jsonValid}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-red-400 text-sm max-w-[300px] truncate" title={validation.error}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{validation.error}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFormat}
            disabled={!validation.valid || isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            title="Formatar JSON"
          >
            <AlignLeft className="w-4 h-4" />
            <span>{MESSAGES.preview.jsonFormat}</span>
          </button>
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            <span>{MESSAGES.preview.cancelAction}</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !validation.valid}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{MESSAGES.preview.savingAction}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{MESSAGES.preview.saveAction}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* CodeMirror Editor */}
      <div className="flex-1 overflow-auto">
        <CodeMirror
          value={editedContent}
          onChange={setEditedContent}
          extensions={[json()]}
          theme={vscodeDark}
          editable={!isSaving}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            indentOnInput: true,
          }}
          style={{ height: '100%', fontSize: '13px' }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-slate-700 bg-slate-800/30 text-xs text-slate-500">
        <span>{editedContent.length.toLocaleString()} caracteres</span>
        <div className="flex items-center gap-2 text-slate-400">
          <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">Ctrl+S</kbd>
          <span>salvar</span>
          <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px] ml-2">Esc</kbd>
          <span>cancelar</span>
        </div>
      </div>
    </div>
  );
}
