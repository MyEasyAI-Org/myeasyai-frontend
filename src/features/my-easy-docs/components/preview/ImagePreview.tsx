// =============================================
// MyEasyDocs - ImagePreview Component
// =============================================
// Preview component for image files with zoom functionality.
// Supports: jpg, png, gif, webp, svg, bmp
// =============================================

import { useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';

// =============================================
// PROPS
// =============================================
interface ImagePreviewProps {
  url: string;
  name: string;
  onDownload?: () => void;
}

// =============================================
// COMPONENT
// =============================================
export function ImagePreview({ url, name, onDownload }: ImagePreviewProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.25, 0.25));
  }, []);

  const handleResetZoom = useCallback(() => {
    setScale(1);
    setRotation(0);
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  // Image load handlers
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setError(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setError(true);
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 mb-4 flex items-center justify-center bg-red-500/20 rounded-full">
          <span className="text-red-400 text-2xl">!</span>
        </div>
        <p className="text-slate-400 mb-2">Não foi possível carregar a imagem</p>
        <p className="text-sm text-slate-500 mb-4">{name}</p>
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
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-center gap-2 p-3 border-b border-slate-700 bg-slate-800/50">
        <button
          onClick={handleZoomOut}
          disabled={scale <= 0.25}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Diminuir zoom"
        >
          <ZoomOut className="w-4 h-4 text-slate-300" />
        </button>

        <button
          onClick={handleResetZoom}
          className="px-3 py-1 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors min-w-[60px]"
          title="Resetar zoom"
        >
          {Math.round(scale * 100)}%
        </button>

        <button
          onClick={handleZoomIn}
          disabled={scale >= 3}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Aumentar zoom"
        >
          <ZoomIn className="w-4 h-4 text-slate-300" />
        </button>

        <div className="w-px h-5 bg-slate-600 mx-2" />

        <button
          onClick={handleRotate}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          title="Girar 90°"
        >
          <RotateCw className="w-4 h-4 text-slate-300" />
        </button>
      </div>

      {/* Image container */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-slate-950/50">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <img
          src={url}
          alt={name}
          onLoad={handleLoad}
          onError={handleError}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            opacity: isLoading ? 0 : 1,
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}
