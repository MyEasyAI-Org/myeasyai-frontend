// =============================================
// MyEasyDocs - HtmlEditor Component
// =============================================
// Split-view HTML editor: CodeMirror on the left,
// sandboxed iframe preview on the right.
// =============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { Save, X, Loader2, Code, Eye, Columns } from 'lucide-react';
import { MESSAGES } from '../../constants';

// =============================================
// PROPS
// =============================================
interface HtmlEditorProps {
  content: string;
  isSaving?: boolean;
  onSave: (content: string) => Promise<void>;
  onCancel: () => void;
}

type ViewMode = 'split' | 'code' | 'preview';

// =============================================
// COMPONENT
// =============================================
export function HtmlEditor({ content, isSaving = false, onSave, onCancel }: HtmlEditorProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [previewHtml, setPreviewHtml] = useState(content);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Sync with prop content when it changes
  useEffect(() => {
    setEditedContent(content);
    setPreviewHtml(content);
  }, [content]);

  // Debounced preview update
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setPreviewHtml(editedContent);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [editedContent]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!isSaving) {
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
  }, [editedContent, isSaving, onSave, onCancel]);

  const handleSave = useCallback(async () => {
    if (!isSaving) {
      await onSave(editedContent);
    }
  }, [editedContent, isSaving, onSave]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('code')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              viewMode === 'code' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Código</span>
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              viewMode === 'split' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            <Columns className="w-4 h-4" />
            <span>Split</span>
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              viewMode === 'preview' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
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
            disabled={isSaving}
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

      {/* Content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code editor */}
        {viewMode !== 'preview' && (
          <div className={`overflow-auto ${viewMode === 'split' ? 'w-1/2 border-r border-slate-700' : 'w-full'}`}>
            <CodeMirror
              value={editedContent}
              onChange={setEditedContent}
              extensions={[html()]}
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
        )}

        {/* Preview iframe */}
        {viewMode !== 'code' && (
          <div className={`bg-white ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
            <iframe
              srcDoc={previewHtml}
              sandbox="allow-same-origin"
              title="HTML Preview"
              className="w-full h-full border-0"
            />
          </div>
        )}
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
