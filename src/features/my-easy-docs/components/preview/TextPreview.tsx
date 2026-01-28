// =============================================
// MyEasyDocs - TextPreview Component
// =============================================
// Preview component for text files (TXT, MD).
// Shows content as read-only with option to edit.
// Basic markdown rendering for .md files.
// =============================================

import { useState, useEffect, useCallback } from 'react';
import { FileText, Edit3, Copy, Check, Loader2 } from 'lucide-react';
import { isEditable } from '../../utils';

// =============================================
// PROPS
// =============================================
interface TextPreviewProps {
  content: string | null;
  name: string;
  isLoading?: boolean;
  onEdit?: () => void;
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
export function TextPreview({ content, name, isLoading = false, onEdit }: TextPreviewProps) {
  const [copied, setCopied] = useState(false);
  const isMarkdown = name.endsWith('.md') || name.endsWith('.markdown');
  const canEdit = isEditable(name) && onEdit;

  // Reset copied state after timeout
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = useCallback(async () => {
    if (content) {
      try {
        await navigator.clipboard.writeText(content);
        setCopied(true);
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    }
  }, [content]);

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
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
            title="Copiar conteúdo"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar</span>
              </>
            )}
          </button>
          {canEdit && (
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Editar</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 bg-slate-900/50">
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

      {/* Footer with stats */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-slate-700 bg-slate-800/30 text-xs text-slate-500">
        <span>{content.length.toLocaleString()} caracteres</span>
        <span>{content.split('\n').length.toLocaleString()} linhas</span>
      </div>
    </div>
  );
}
