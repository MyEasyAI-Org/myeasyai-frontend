// =============================================
// Shared - PreviewErrorState
// =============================================
// Reusable error state for all preview components.
// =============================================

import { AlertCircle, Download, RefreshCw } from 'lucide-react';

interface PreviewErrorStateProps {
  title: string;
  message: string;
  onDownload?: () => void;
  onRetry?: () => void;
}

export function PreviewErrorState({
  title,
  message,
  onDownload,
  onRetry,
}: PreviewErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 mb-4 flex items-center justify-center bg-red-500/10 rounded-full">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-slate-400 max-w-md mb-6">{message}</p>
      <div className="flex items-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Tentar novamente</span>
          </button>
        )}
        {onDownload && (
          <button
            onClick={onDownload}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Baixar arquivo</span>
          </button>
        )}
      </div>
    </div>
  );
}
