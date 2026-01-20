import { useStore } from '@nanostores/react';
import { memo, useCallback, useEffect, useState } from 'react';
import {
  Code2,
  Eye,
  FolderTree,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  Terminal as TerminalIcon,
} from 'lucide-react';
import { workbenchStore } from '../../lib/stores';
import { CodeMirrorEditor } from '../editor';
import { FileTree } from './FileTree';
import { Preview } from './Preview';
import { Terminal } from '../terminal';
import type { ITerminal } from '../../types/terminal';

interface WorkbenchProps {
  className?: string;
  isLoading?: boolean;
  onTerminalReady?: (terminal: ITerminal) => void;
  onTerminalResize?: (cols: number, rows: number) => void;
}

type ViewMode = 'code' | 'preview' | 'split';

export const Workbench = memo(({
  className = '',
  isLoading = false,
  onTerminalReady,
  onTerminalResize,
}: WorkbenchProps) => {
  const files = useStore(workbenchStore.files);
  const selectedFile = useStore(workbenchStore.selectedFile);
  const currentDocument = useStore(workbenchStore.currentDocument);
  const showTerminal = useStore(workbenchStore.showTerminal);
  const previewUrl = useStore(workbenchStore.previewUrl);

  const [showSidebar, setShowSidebar] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('code');
  const [isMaximized, setIsMaximized] = useState(false);

  // Automatically switch to split view when preview URL becomes available
  useEffect(() => {
    if (previewUrl && viewMode === 'code') {
      console.log('[Workbench] Preview URL available, switching to split view:', previewUrl);
      setViewMode('split');
    }
  }, [previewUrl, viewMode]);

  // Handle file selection
  const handleFileSelect = useCallback((filePath: string) => {
    workbenchStore.setSelectedFile(filePath);
  }, []);

  // Handle editor changes
  const handleEditorChange = useCallback(
    (update: { content: string }) => {
      if (selectedFile) {
        workbenchStore.setCurrentDocumentContent(update.content);
      }
    },
    [selectedFile]
  );

  // Handle editor scroll
  const handleEditorScroll = useCallback(
    (scroll: { top?: number; left?: number }) => {
      if (selectedFile && scroll.top !== undefined && scroll.left !== undefined) {
        workbenchStore.setCurrentDocumentScrollPosition({ top: scroll.top, left: scroll.left });
      }
    },
    [selectedFile]
  );

  // Toggle terminal visibility
  const toggleTerminal = useCallback(() => {
    workbenchStore.toggleTerminal();
  }, []);

  // Get file extension for language detection
  const getFileExtension = (path: string): string => {
    const parts = path.split('.');
    return parts.length > 1 ? parts.pop() || '' : '';
  };

  return (
    <div className={`flex h-full flex-col bg-gray-900 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white"
            title={showSidebar ? 'Ocultar arquivos' : 'Mostrar arquivos'}
          >
            {showSidebar ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </button>

          <div className="mx-2 h-4 w-px bg-gray-700" />

          <div className="flex items-center rounded bg-gray-700">
            <button
              onClick={() => setViewMode('code')}
              className={`rounded-l px-3 py-1.5 text-sm ${
                viewMode === 'code'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Editor de código"
            >
              <Code2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 text-sm ${
                viewMode === 'split'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Dividir visualização"
            >
              <div className="flex gap-0.5">
                <Code2 className="h-4 w-4" />
                <Eye className="h-4 w-4" />
              </div>
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`rounded-r px-3 py-1.5 text-sm ${
                viewMode === 'preview'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Preview"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTerminal}
            className={`rounded p-1.5 ${
              showTerminal
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
            title={showTerminal ? 'Ocultar terminal' : 'Mostrar terminal'}
          >
            <TerminalIcon className="h-4 w-4" />
          </button>

          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white"
            title={isMaximized ? 'Restaurar' : 'Maximizar'}
          >
            {isMaximized ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - File Tree */}
        {showSidebar && (
          <div className="w-64 flex-shrink-0 border-r border-gray-700">
            <div className="flex h-8 items-center border-b border-gray-700 bg-gray-800 px-3">
              <FolderTree className="mr-2 h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">Arquivos</span>
            </div>
            <FileTree
              files={files}
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              className="h-[calc(100%-2rem)]"
            />
          </div>
        )}

        {/* Editor and Preview Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 overflow-hidden">
            {/* Code Editor */}
            {(viewMode === 'code' || viewMode === 'split') && (
              <div
                className={`flex flex-col overflow-hidden ${
                  viewMode === 'split' ? 'w-1/2 border-r border-gray-700' : 'flex-1'
                }`}
              >
                {currentDocument ? (
                  <>
                    {/* Editor Tab */}
                    <div className="flex h-8 items-center border-b border-gray-700 bg-gray-800 px-3">
                      <span className="text-sm text-gray-300">
                        {currentDocument.filePath.split('/').pop()}
                      </span>
                    </div>
                    <CodeMirrorEditor
                      doc={currentDocument}
                      editable={true}
                      onChange={handleEditorChange}
                      onScroll={handleEditorScroll}
                      className="flex-1"
                    />
                  </>
                ) : (
                  <div className="flex flex-1 items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Code2 className="mx-auto mb-3 h-12 w-12 text-gray-600" />
                      <p>Selecione um arquivo para editar</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Preview */}
            {(viewMode === 'preview' || viewMode === 'split') && (
              <div
                className={`overflow-hidden ${
                  viewMode === 'split' ? 'w-1/2' : 'flex-1'
                }`}
              >
                <Preview url={previewUrl} isLoading={isLoading} />
              </div>
            )}
          </div>

          {/* Terminal */}
          {showTerminal && (
            <div className="h-64 flex-shrink-0 border-t border-gray-700">
              <Terminal
                className="h-full"
                onTerminalReady={onTerminalReady}
                onTerminalResize={onTerminalResize}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

Workbench.displayName = 'Workbench';

export default Workbench;
