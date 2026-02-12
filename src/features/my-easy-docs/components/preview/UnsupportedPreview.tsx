// =============================================
// MyEasyDocs - UnsupportedPreview Component
// =============================================
// Fallback preview for file types that can't be displayed.
// Shows file info and download button.
// =============================================

import { Download, FileQuestion, ExternalLink } from 'lucide-react';
import type { DocsDocument } from '../../types';
import { formatFileSize, getFileType, getFileTypeLabel } from '../../utils';
import { FileIcon } from '../shared/FileIcon';

// =============================================
// PROPS
// =============================================
interface UnsupportedPreviewProps {
  document: DocsDocument;
  onDownload?: () => void;
}

// =============================================
// COMPONENT
// =============================================
export function UnsupportedPreview({ document, onDownload }: UnsupportedPreviewProps) {
  const fileType = getFileType(document.mime_type);
  const fileTypeLabel = getFileTypeLabel(document.mime_type);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      {/* File icon */}
      <div className="w-24 h-24 mb-6 flex items-center justify-center bg-slate-800 rounded-2xl">
        <FileIcon mimeType={document.mime_type} size="xl" className="text-slate-400" />
      </div>

      {/* File info */}
      <h3 className="text-lg font-medium text-white mb-2 max-w-[300px] truncate">
        {document.name}
      </h3>

      <div className="flex items-center gap-3 text-sm text-slate-400 mb-6">
        <span className="px-2 py-1 bg-slate-800 rounded">
          {fileTypeLabel}
        </span>
        <span>{formatFileSize(document.size)}</span>
      </div>

      {/* Message */}
      <div className="flex items-center gap-2 text-slate-400 mb-8">
        <FileQuestion className="w-5 h-5" />
        <p>Visualização não disponível para este formato</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {document.r2_url && (
          <a
            href={document.r2_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Abrir em nova aba</span>
          </a>
        )}
        {onDownload && (
          <button
            onClick={onDownload}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Baixar arquivo</span>
          </button>
        )}
      </div>

      {/* Additional info */}
      <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700 max-w-md">
        <p className="text-xs text-slate-500">
          Para visualizar este arquivo, baixe-o e abra com um aplicativo compatível no seu dispositivo.
        </p>
      </div>
    </div>
  );
}
