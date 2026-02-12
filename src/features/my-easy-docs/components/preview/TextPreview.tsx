// =============================================
// MyEasyDocs - TextPreview Component
// =============================================
// Preview component for text files (TXT, MD).
// Shows content as read-only with option to edit.
// Basic markdown rendering for .md files.
// =============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { FileText, Edit3, Maximize2, Save, X, Loader2 } from 'lucide-react';
import { isEditable } from '../../utils';

// =============================================
// PROPS
// =============================================
interface TextPreviewProps {
  content: string | null;
  name: string;
  isLoading?: boolean;
  isSaving?: boolean;
  onSave?: (content: string) => Promise<void>;
  onFullscreen?: () => void;
}

// =============================================
// SIMPLE MARKDOWN RENDERER
// =============================================
function renderMarkdown(text: string): string {
  // Very basic markdown to HTML conversion
  let html = text
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-slate-200 mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold text-slate-200 mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-slate-100 mt-6 mb-3">$1</h1>')
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-200">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    .replace(/__(.+?)__/g, '<strong class="font-semibold text-slate-200">$1</strong>')
    .replace(/_(.+?)_/g, '<em class="italic">$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-slate-700 rounded text-blue-300 text-sm font-mono">$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-blue-400 hover:underline">$1</a>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="my-4 border-slate-700" />')
    // Unordered lists
    .replace(/^[*-] (.+)$/gm, '<li class="ml-4 list-disc text-slate-300">$1</li>')
    // Paragraphs (simple line breaks)
    .replace(/\n\n/g, '</p><p class="mb-3 text-slate-300">')
    .replace(/\n/g, '<br />');

  return `<p class="mb-3 text-slate-300">${html}</p>`;
}

// =============================================
// COMPONENT
// =============================================
export function TextPreview({
  content,
  name,
  isLoading = false,
  isSaving = false,
  onSave,
  onFullscreen
}: TextPreviewProps) {
  // Inline editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isMarkdown = name.endsWith('.md') || name.endsWith('.markdown');
  const canEdit = isEditable(name);

  // Sync editedContent when content prop changes (and not editing)
  useEffect(() => {
    if (!isEditing && content !== null) {
      setEditedContent(content);
    }
  }, [content, isEditing]);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Position cursor at end
      textareaRef.current.selectionStart = textareaRef.current.value.length;
      textareaRef.current.selectionEnd = textareaRef.current.value.length;
    }
  }, [isEditing]);

  // Enter edit mode
  const handleStartEditing = useCallback(() => {
    setEditedContent(content || '');
    setIsEditing(true);
  }, [content]);

  // Save changes
  const handleSave = useCallback(async () => {
    if (onSave && !isSaving) {
      try {
        await onSave(editedContent);
        setIsEditing(false);
      } catch (err) {
        console.error('Error saving:', err);
      }
    }
  }, [editedContent, onSave, isSaving]);

  // Cancel editing
  const handleCancel = useCallback(() => {
    setEditedContent(content || '');
    setIsEditing(false);
  }, [content]);

  // Handle textarea change
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);
  }, []);

  // Keyboard shortcuts for editing
  useEffect(() => {
    if (!isEditing) return;

    const handleKeyDown = async (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (onSave && !isSaving) {
          try {
            await onSave(editedContent);
            setIsEditing(false);
          } catch (err) {
            console.error('Error saving:', err);
          }
        }
      }
      // Escape to cancel
      if (e.key === 'Escape') {
        e.preventDefault();
        setEditedContent(content || '');
        setIsEditing(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, editedContent, content, onSave, isSaving]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-4" />
        <p className="text-slate-400">Carregando conteúdo...</p>
      </div>
    );
  }

  if (content === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 mb-4 flex items-center justify-center bg-slate-800 rounded-full">
          <FileText className="w-8 h-8 text-slate-500" />
        </div>
        <p className="text-slate-400">Não foi possível carregar o conteúdo</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-2 text-slate-300">
          <FileText className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium truncate max-w-[200px]">{name}</span>
          {isMarkdown && (
            <span className="px-2 py-0.5 text-xs bg-slate-700 text-slate-400 rounded">
              Markdown
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Non-editing mode buttons */}
          {!isEditing && (
            <>
              {/* Fullscreen button - Hidden on mobile */}
              {onFullscreen && canEdit && (
                <button
                  onClick={onFullscreen}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Abrir em tela cheia"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Tela cheia</span>
                </button>
              )}
              {/* Edit button - now starts inline editing */}
              {canEdit && onSave && (
                <button
                  onClick={handleStartEditing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Editar</span>
                </button>
              )}
            </>
          )}
          {/* Editing mode buttons */}
          {isEditing && (
            <>
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
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
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
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-slate-900/50">
        {isEditing ? (
          /* Editing mode - textarea */
          <textarea
            ref={textareaRef}
            value={editedContent}
            onChange={handleContentChange}
            disabled={isSaving}
            spellCheck={false}
            className="w-full h-full p-4 bg-transparent text-slate-300 font-mono text-sm leading-relaxed resize-none focus:outline-none disabled:opacity-50"
            style={{ tabSize: 2 }}
            placeholder="Digite o conteúdo do arquivo..."
          />
        ) : (
          /* Read-only mode */
          <div className="p-4">
            {isMarkdown ? (
              <div
                className="prose prose-invert max-w-none font-sans leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
              />
            ) : (
              <pre className="whitespace-pre-wrap font-mono text-sm text-slate-300 leading-relaxed">
                {content}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Footer with stats */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-slate-700 bg-slate-800/30 text-xs text-slate-500">
        <span>{(isEditing ? editedContent : content).length.toLocaleString()} caracteres</span>
        <div className="flex items-center gap-4">
          <span>{(isEditing ? editedContent : content).split('\n').length.toLocaleString()} linhas</span>
          {isEditing && (
            <div className="flex items-center gap-2 text-slate-400">
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">Ctrl+S</kbd>
              <span>salvar</span>
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px] ml-2">Esc</kbd>
              <span>cancelar</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
