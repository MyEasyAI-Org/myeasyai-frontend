// =============================================
// MyEasyDocs - FilePreview Component
// =============================================
// Main preview container that switches between
// different preview types based on file mime_type.
// =============================================

import { useState, useCallback, useEffect } from 'react';
import { X, Download, Edit3, Star, Trash2, MoreVertical, Move } from 'lucide-react';
import type { DocsDocument } from '../../types';
import { isImage, isPdf, isTextFile, isVideo, isAudio, isCode, isEditable, isSpreadsheet, formatFileSize, formatRelativeTime } from '../../utils';
import { UploadService } from '../../services/UploadService';
import { ImagePreview } from './ImagePreview';
import { PdfPreview } from './PdfPreview';
import { TextPreview } from './TextPreview';
import { VideoPreview } from './VideoPreview';
import { AudioPreview } from './AudioPreview';
import { CodePreview } from './CodePreview';
import { UnsupportedPreview } from './UnsupportedPreview';
import { SpreadsheetPreview } from './SpreadsheetPreview';

// =============================================
// PROPS
// =============================================
interface FilePreviewProps {
  document: DocsDocument;
  textContent?: string | null;
  isLoadingContent?: boolean;
  isSavingContent?: boolean;
  onClose: () => void;
  onFullscreen?: () => void;
  onSave?: (content: string) => Promise<void>;
  onDownload?: () => void;
  onDelete?: () => void;
  onMove?: () => void;
  onToggleFavorite?: () => void;
}

// =============================================
// COMPONENT
// =============================================
export function FilePreview({
  document,
  textContent = null,
  isLoadingContent = false,
  isSavingContent = false,
  onClose,
  onFullscreen,
  onSave,
  onDownload,
  onDelete,
  onMove,
  onToggleFavorite,
}: FilePreviewProps) {
  const [showMenu, setShowMenu] = useState(false);

  // Close menu on outside click
  useEffect(() => {
    if (showMenu) {
      const handleClick = () => setShowMenu(false);
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [showMenu]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleMenuClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu((prev) => !prev);
  }, []);

  const handleDownload = useCallback(() => {
    if (onDownload) {
      onDownload();
    } else if (document.r2_url) {
      // Fallback: open URL in new tab
      window.open(document.r2_url, '_blank', 'noopener,noreferrer');
    }
  }, [document.r2_url, onDownload]);

  // Determine which preview to show
  const renderPreview = () => {
    const { mime_type, r2_url, r2_key, name } = document;

    // Build file URL - use r2_url if available, otherwise build from r2_key
    const fileUrl = r2_url || (r2_key ? UploadService.getDownloadUrl(r2_key) : null);

    // DEBUG: Log mime_type to identify issues
    console.log('[FilePreview] Document:', {
      name,
      mime_type,
      r2_url: r2_url ? 'EXISTS' : 'MISSING',
      r2_key: r2_key ? 'EXISTS' : 'MISSING',
      fileUrl: fileUrl ? 'BUILT' : 'MISSING',
      isSpreadsheetResult: isSpreadsheet(mime_type),
      willShowSpreadsheet: isSpreadsheet(mime_type) && !!fileUrl
    });

    // Image preview
    if (isImage(mime_type) && fileUrl) {
      return <ImagePreview url={fileUrl} name={name} onDownload={handleDownload} />;
    }

    // PDF preview
    if (isPdf(mime_type) && fileUrl) {
      return <PdfPreview url={fileUrl} name={name} onDownload={handleDownload} />;
    }

    // Video preview
    if (isVideo(mime_type) && fileUrl) {
      return <VideoPreview url={fileUrl} name={name} onDownload={handleDownload} />;
    }

    // Audio preview
    if (isAudio(mime_type) && fileUrl) {
      return <AudioPreview url={fileUrl} name={name} onDownload={handleDownload} />;
    }

    // Spreadsheet preview (XLSX, XLS, CSV)
    if (isSpreadsheet(mime_type) && (fileUrl || r2_key)) {
      return <SpreadsheetPreview url={fileUrl || undefined} r2Key={r2_key} fileName={name} />;
    }

    // Code preview (with syntax highlighting)
    if (isCode(mime_type, name)) {
      return (
        <CodePreview
          content={textContent}
          name={name}
          isLoading={isLoadingContent}
        />
      );
    }

    // Text/Markdown preview
    if (isTextFile(mime_type)) {
      return (
        <TextPreview
          content={textContent}
          name={name}
          isLoading={isLoadingContent}
          isSaving={isSavingContent}
          onSave={isEditable(name) ? onSave : undefined}
          onFullscreen={isEditable(name) ? onFullscreen : undefined}
        />
      );
    }

    // Unsupported file type
    return <UnsupportedPreview document={document} onDownload={handleDownload} />;
  };

  const canEdit = isEditable(document.name) && onFullscreen;

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/50">
        <div className="flex-1 min-w-0 mr-4">
          <h3 className="text-white font-medium truncate">{document.name}</h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
            <span>{formatFileSize(document.size)}</span>
            <span>•</span>
            <span>{formatRelativeTime(document.updated_at)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Favorite button */}
          {onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              className={`p-2 rounded-lg transition-colors ${
                document.is_favorite
                  ? 'text-yellow-400 hover:bg-yellow-400/10'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-slate-300'
              }`}
              title={document.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Star className={`w-4 h-4 ${document.is_favorite ? 'fill-current' : ''}`} />
            </button>
          )}

          {/* Download button */}
          <button
            onClick={handleDownload}
            className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
            title="Baixar arquivo"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Fullscreen edit button (for editable files) */}
          {canEdit && (
            <button
              onClick={onFullscreen}
              className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
              title="Editar em tela cheia"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {/* More menu */}
          <div className="relative">
            <button
              onClick={handleMenuClick}
              className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
              title="Mais opções"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 py-1">
                {onMove && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onMove();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    <Move className="w-4 h-4" />
                    <span>Mover para...</span>
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors ml-1"
            title="Fechar preview (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview content */}
      <div className="flex-1 overflow-hidden">{renderPreview()}</div>
    </div>
  );
}
