// =============================================
// MyEasyDocs - PdfPreview Component
// =============================================
// Preview component for PDF files using iframe/object.
// Falls back to download link if browser doesn't support.
// =============================================

import { useState, useCallback } from 'react';
import { FileText, Download, ExternalLink, AlertCircle } from 'lucide-react';

// =============================================
// PROPS
// =============================================
interface PdfPreviewProps {
  url: string;
  name: string;
  onDownload?: () => void;
}

// =============================================
// COMPONENT
// =============================================
export function PdfPreview({ url, name, onDownload }: PdfPreviewProps) {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setError(true);
  }, []);

  const handleOpenInNewTab = useCallback(() => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [url]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 mb-4 flex items-center justify-center bg-slate-800 rounded-full">
          <AlertCircle className="w-8 h-8 text-yellow-400" />
        </div>
        <p className="text-slate-300 font-medium mb-2">
          Não foi possível exibir o PDF
        </p>
        <p className="text-sm text-slate-500 mb-6">
          Seu navegador pode não suportar a visualização de PDFs embutidos.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenInNewTab}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Abrir em nova aba</span>
          </button>
          {onDownload && (
            <button
              onClick={onDownload}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Baixar</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-2 text-slate-300">
          <FileText className="w-4 h-4 text-red-400" />
          <span className="text-sm font-medium truncate max-w-[200px]">{name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenInNewTab}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Nova aba</span>
          </button>
          {onDownload && (
            <button
              onClick={onDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Baixar</span>
            </button>
          )}
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 relative bg-slate-950">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-400">Carregando PDF...</p>
            </div>
          </div>
        )}

        <object
          data={url}
          type="application/pdf"
          className="w-full h-full"
          onLoad={handleLoad}
          onError={handleError}
        >
          <iframe
            src={url}
            title={name}
            className="w-full h-full border-0"
            onLoad={handleLoad}
            onError={handleError}
          />
        </object>
      </div>
    </div>
  );
}
