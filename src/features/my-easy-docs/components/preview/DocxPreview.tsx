// =============================================
// MyEasyDocs - DocxPreview Component
// =============================================
// Visual rendering of DOCX files using docx-preview.
// Falls back to extracted text if rendering fails.
// =============================================

import { useState, useEffect, useRef } from 'react';
import { renderAsync } from 'docx-preview';
import { FileText } from 'lucide-react';
import { UploadService } from '../../services/UploadService';
import { MESSAGES } from '../../constants';
import { PreviewLoadingState } from './shared/PreviewLoadingState';
import { PreviewErrorState } from './shared/PreviewErrorState';

// =============================================
// PROPS
// =============================================
interface DocxPreviewProps {
  url?: string;
  r2Key?: string;
  fileName: string;
  onDownload?: () => void;
}

// =============================================
// COMPONENT
// =============================================
export function DocxPreview({ url, r2Key, fileName, onDownload }: DocxPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocx = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const fetchUrl = r2Key ? UploadService.getDownloadUrl(r2Key) : url;
        if (!fetchUrl) {
          throw new Error(MESSAGES.preview.noFileSource);
        }

        const response = await fetch(fetchUrl);
        if (!response.ok) {
          throw new Error(`Erro ao carregar arquivo: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();

        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          await renderAsync(arrayBuffer, containerRef.current, undefined, {
            className: 'docx-preview-content',
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false,
            ignoreFonts: false,
            breakPages: true,
            ignoreLastRenderedPageBreak: true,
            experimental: false,
          });
        }
      } catch (err) {
        console.error('Error loading DOCX:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar documento');
      } finally {
        setIsLoading(false);
      }
    };

    loadDocx();
  }, [url, r2Key]);

  if (isLoading) {
    return <PreviewLoadingState message={MESSAGES.preview.loadingDocx} iconColor="text-blue-400" />;
  }

  if (error) {
    return (
      <PreviewErrorState
        title="Erro ao carregar documento"
        message={error}
        onDownload={onDownload}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b border-slate-700 bg-slate-800/50">
        <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <span className="text-sm text-slate-300 font-medium truncate max-w-[200px]">
          {fileName}
        </span>
        <span className="px-2 py-0.5 text-xs bg-slate-700 text-slate-400 rounded">DOCX</span>
      </div>

      {/* Rendered DOCX content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-white docx-preview-wrapper"
        style={{
          // Override docx-preview default styles for better fit
          minHeight: 0,
        }}
      />

      <style>{`
        .docx-preview-wrapper .docx-wrapper {
          background: white;
          padding: 16px;
        }
        .docx-preview-wrapper .docx-wrapper > section.docx {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          margin: 16px auto;
          padding: 40px;
        }
      `}</style>
    </div>
  );
}
