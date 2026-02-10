// =============================================
// MyEasyDocs - LegacyFormatPreview Component
// =============================================
// Reusable component for legacy file formats with
// limited browser support (DOC, etc).
// =============================================

import { AlertTriangle, Download } from 'lucide-react';

// =============================================
// PROPS
// =============================================
interface LegacyFormatPreviewProps {
  title: string;
  message: string;
  suggestion?: string;
  onDownload: () => void;
}

// =============================================
// COMPONENT
// =============================================
export function LegacyFormatPreview({
  title,
  message,
  suggestion,
  onDownload,
}: LegacyFormatPreviewProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 mb-4 flex items-center justify-center bg-yellow-500/10 rounded-full">
        <AlertTriangle className="w-8 h-8 text-yellow-500" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-slate-400 max-w-md mb-2">{message}</p>
      {suggestion && (
        <p className="text-sm text-slate-500 max-w-md mb-6">{suggestion}</p>
      )}
      {!suggestion && <div className="mb-6" />}
      <button
        onClick={onDownload}
        className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        <Download className="w-4 h-4" />
        <span>Baixar arquivo</span>
      </button>
    </div>
  );
}
