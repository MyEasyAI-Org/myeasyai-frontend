import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Copy, ExternalLink, Maximize2, Minimize2, RefreshCw } from 'lucide-react';

interface PreviewProps {
  url?: string;
  isLoading?: boolean;
  className?: string;
}

export const Preview = memo(({ url, isLoading = false, className = '' }: PreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentUrl, setCurrentUrl] = useState(url || '');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState<string | null>(null);

  useEffect(() => {
    if (url) {
      console.log('[Preview] URL received:', url);
      console.log('[Preview] URL protocol:', url.startsWith('http') ? 'valid' : 'invalid');
      setCurrentUrl(url);
      setIframeLoaded(false);
      setIframeError(null);

      // For WebContainer URLs, they may take a moment to be ready
      // Set a timeout to mark as loaded if onLoad doesn't fire
      const timeout = setTimeout(() => {
        console.log('[Preview] Timeout reached, marking iframe as loaded');
        setIframeLoaded(true);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [url]);

  const handleRefresh = useCallback(() => {
    if (iframeRef.current && currentUrl) {
      setIsRefreshing(true);
      setIframeLoaded(false);
      setIframeError(null);
      iframeRef.current.src = currentUrl;
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, [currentUrl]);

  const handleCopyUrl = useCallback(() => {
    if (currentUrl) {
      navigator.clipboard.writeText(currentUrl).then(() => {
        setShowCopiedToast(true);
        setTimeout(() => setShowCopiedToast(false), 2000);
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = currentUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setShowCopiedToast(true);
        setTimeout(() => setShowCopiedToast(false), 2000);
      });
    }
  }, [currentUrl]);

  const handleOpenExternal = useCallback(() => {
    if (currentUrl) {
      console.log('[Preview] Opening external URL:', currentUrl);
      // WebContainer URLs work best when opened directly
      // They require the same origin context, so we open in a new window
      const newWindow = window.open(currentUrl, '_blank');
      if (!newWindow) {
        // Popup blocked - copy URL instead
        handleCopyUrl();
        alert('Popup bloqueado! A URL foi copiada para a área de transferência.\n\nCole em uma nova aba para visualizar o projeto.');
      }
    }
  }, [currentUrl, handleCopyUrl]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  if (!url && !isLoading) {
    return (
      <div className={`flex h-full items-center justify-center bg-gray-900 text-gray-400 ${className}`}>
        <div className="text-center">
          <p className="text-lg">Nenhum preview disponível</p>
          <p className="mt-2 text-sm text-gray-500">
            Execute um servidor de desenvolvimento para visualizar
          </p>
        </div>
      </div>
    );
  }

  // Fullscreen container styles
  const fullscreenStyles = isFullscreen
    ? 'fixed inset-0 z-50'
    : '';

  return (
    <div className={`flex h-full flex-col bg-gray-900 ${className} ${fullscreenStyles}`}>
      {/* Copied Toast */}
      {showCopiedToast && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
          ✓ URL copiada!
        </div>
      )}

      {/* Preview Header */}
      <div className="flex items-center gap-2 border-b border-gray-700 bg-gray-800 px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            disabled={!currentUrl || isRefreshing}
            className="rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50"
            title="Recarregar"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleCopyUrl}
            disabled={!currentUrl}
            className="rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50"
            title="Copiar URL"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={handleOpenExternal}
            disabled={!currentUrl}
            className="rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50"
            title="Abrir em nova aba"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
            title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="flex-1">
          <input
            type="text"
            value={currentUrl}
            onChange={(e) => setCurrentUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && iframeRef.current) {
                iframeRef.current.src = currentUrl;
              }
            }}
            className="w-full rounded bg-gray-700 px-3 py-1 text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="URL do preview..."
          />
        </div>
      </div>

      {/* Preview Content */}
      <div className="relative flex-1">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/80">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500" />
              <p className="text-sm text-gray-400">Iniciando servidor...</p>
            </div>
          </div>
        )}

        {currentUrl ? (
          <>
            {/* Loading overlay while iframe loads */}
            {!iframeLoaded && !iframeError && (
              <div className="absolute inset-0 z-5 flex items-center justify-center bg-gray-800">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500" />
                  <p className="text-sm text-gray-400">Carregando preview...</p>
                  <p className="text-xs text-gray-500 max-w-xs text-center truncate">{currentUrl}</p>
                </div>
              </div>
            )}
            {/* Error state */}
            {iframeError && (
              <div className="absolute inset-0 z-5 flex items-center justify-center bg-gray-800">
                <div className="flex flex-col items-center gap-3 text-center p-4">
                  <p className="text-red-400">Erro ao carregar preview</p>
                  <p className="text-xs text-gray-500">{iframeError}</p>
                  <button
                    onClick={handleRefresh}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Tentar novamente
                  </button>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={currentUrl}
              className="h-full w-full border-0 bg-white"
              title="Preview"
              sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
              allow="cross-origin-isolated; clipboard-read; clipboard-write"
              onLoad={() => {
                console.log('[Preview] iframe loaded successfully for URL:', currentUrl);
                setIframeLoaded(true);
                setIframeError(null);
              }}
              onError={(e) => {
                console.error('[Preview] iframe error:', e);
                setIframeError('Não foi possível carregar o conteúdo');
              }}
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            Aguardando URL do servidor...
          </div>
        )}
      </div>
    </div>
  );
});

Preview.displayName = 'Preview';

export default Preview;
