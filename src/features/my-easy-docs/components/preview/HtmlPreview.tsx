// =============================================
// MyEasyDocs - HtmlPreview Component
// =============================================
// Wraps CodePreview (read mode) and HtmlEditor (edit mode)
// for HTML files, following the TextPreview editing pattern.
// =============================================

import { useState, useCallback } from 'react';
import { HtmlEditor } from './HtmlEditor';
import { Edit3, Maximize2 } from 'lucide-react';

// =============================================
// PROPS
// =============================================
interface HtmlPreviewProps {
  content: string | null;
  name: string;
  isLoading?: boolean;
  isSaving?: boolean;
  onSave?: (content: string) => Promise<void>;
  onFullscreen?: () => void;
}

// =============================================
// COMPONENT
// =============================================
export function HtmlPreview({
  content,
  name,
  isLoading = false,
  isSaving = false,
  onSave,
  onFullscreen,
}: HtmlPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = useCallback(async (editedContent: string) => {
    if (onSave) {
      try {
        await onSave(editedContent);
        setIsEditing(false);
      } catch (err) {
        console.error('Error saving HTML:', err);
      }
    }
  }, [onSave]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  if (isEditing && content !== null) {
    return (
      <HtmlEditor
        content={content}
        isSaving={isSaving}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      {onSave && (
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
          <span className="text-sm text-slate-400">Visualização HTML</span>
          <div className="flex items-center gap-2">
            {onFullscreen && (
              <button
                onClick={onFullscreen}
                disabled={isLoading || !content}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Maximize2 className="w-4 h-4" />
                Tela cheia
              </button>
            )}
            <button
              onClick={() => setIsEditing(true)}
              disabled={isLoading || !content}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit3 className="w-4 h-4" />
              Editar
            </button>
          </div>
        </div>
      )}

      {/* HTML Preview */}
      <div className="flex-1 overflow-auto p-4 bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            Carregando...
          </div>
        ) : content ? (
          <iframe
            srcDoc={content}
            title="HTML Preview"
            className="w-full h-full border-0"
            sandbox="allow-scripts"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            Nenhum conteúdo para exibir
          </div>
        )}
      </div>
    </div>
  );
}
