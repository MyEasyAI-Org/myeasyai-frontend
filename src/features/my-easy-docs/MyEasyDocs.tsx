// =============================================
// MyEasyDocs - Main Component
// =============================================
// This is the main entry point for the MyEasyDocs module.
// It manages file/folder navigation, preview, and AI chat.
// =============================================

import { useState, useCallback, useMemo } from 'react';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import type { DocsDocument, DocsViewMode, BreadcrumbItem } from './types';
import { MOCK_FOLDERS, MOCK_DOCUMENTS } from './mockData';
import { DocsSidebar } from './components/layout/DocsSidebar';
import { DocsHeader } from './components/layout/DocsHeader';
import { FileGrid } from './components/explorer/FileGrid';
import { FileList } from './components/explorer/FileList';
import { EmptyState } from './components/explorer/EmptyState';

// =============================================
// PROPS
// =============================================
interface MyEasyDocsProps {
  onBackToDashboard?: () => void;
}

// =============================================
// MAIN COMPONENT
// =============================================
export function MyEasyDocs({ onBackToDashboard }: MyEasyDocsProps) {
  // Navigation state
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocsDocument | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<DocsViewMode>('grid');
  const [chatOpen, setChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sidebar state
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Get current path for breadcrumb
  const breadcrumb = useMemo((): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [{ id: null, name: 'Meus Documentos' }];

    if (currentFolderId) {
      const folder = MOCK_FOLDERS.find((f) => f.id === currentFolderId);
      if (folder) {
        // Build full path by traversing up
        const pathItems: BreadcrumbItem[] = [];
        let currentFolder = folder;

        while (currentFolder) {
          pathItems.unshift({ id: currentFolder.id, name: currentFolder.name });
          if (currentFolder.parent_id) {
            const parent = MOCK_FOLDERS.find((f) => f.id === currentFolder.parent_id);
            if (parent) {
              currentFolder = parent;
            } else {
              break;
            }
          } else {
            break;
          }
        }

        items.push(...pathItems);
      }
    }

    return items;
  }, [currentFolderId]);

  // Get items for current folder
  const currentFolders = useMemo(() => {
    return MOCK_FOLDERS.filter((f) => f.parent_id === currentFolderId);
  }, [currentFolderId]);

  const currentDocuments = useMemo(() => {
    return MOCK_DOCUMENTS.filter((d) => d.folder_id === currentFolderId);
  }, [currentFolderId]);

  // Count documents by folder for display
  const documentsCountByFolder = useMemo(() => {
    const map = new Map<string, number>();
    for (const folder of currentFolders) {
      const count = MOCK_DOCUMENTS.filter((d) => d.folder_id === folder.id).length;
      map.set(folder.id, count);
    }
    return map;
  }, [currentFolders]);

  // Check if current view is empty
  const isEmpty = currentFolders.length === 0 && currentDocuments.length === 0;

  // Toggle folder expansion in sidebar
  const handleToggleFolderExpansion = useCallback((folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  // Navigate to folder
  const handleNavigateToFolder = useCallback((folderId: string | null) => {
    setCurrentFolderId(folderId);
    setSelectedDocument(null);
  }, []);

  // Select document
  const handleSelectDocument = useCallback((documentId: string) => {
    const doc = MOCK_DOCUMENTS.find((d) => d.id === documentId);
    if (doc) {
      setSelectedDocument(doc);
    }
  }, []);

  // Open document (preview)
  const handleOpenDocument = useCallback((documentId: string) => {
    const doc = MOCK_DOCUMENTS.find((d) => d.id === documentId);
    if (doc) {
      setSelectedDocument(doc);
      // TODO: Open preview panel
      console.log('Open document preview:', doc.name);
    }
  }, []);

  // Handlers for sidebar actions
  const handleCreateFolder = useCallback(() => {
    // TODO: Open create folder modal
    console.log('Create folder');
  }, []);

  const handleUpload = useCallback(() => {
    // TODO: Open upload modal
    console.log('Upload');
  }, []);

  const handleViewFavorites = useCallback(() => {
    // TODO: Switch to favorites view
    console.log('View favorites');
  }, []);

  const handleViewRecent = useCallback(() => {
    // TODO: Switch to recent view
    console.log('View recent');
  }, []);

  // Header handlers
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    // TODO: Implement search filtering
  }, []);

  const handleViewModeChange = useCallback((mode: DocsViewMode) => {
    setViewMode(mode);
  }, []);

  const handleToggleChat = useCallback(() => {
    setChatOpen((prev) => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white">
      <div className="flex h-screen">
        {/* Sidebar */}
        <DocsSidebar
          folders={MOCK_FOLDERS}
          currentFolderId={currentFolderId}
          expandedFolders={expandedFolders}
          documents={MOCK_DOCUMENTS}
          onNavigate={handleNavigateToFolder}
          onToggleExpand={handleToggleFolderExpansion}
          onCreateFolder={handleCreateFolder}
          onUpload={handleUpload}
          onBackToDashboard={onBackToDashboard}
          onViewFavorites={handleViewFavorites}
          onViewRecent={handleViewRecent}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <DocsHeader
            breadcrumb={breadcrumb}
            searchQuery={searchQuery}
            viewMode={viewMode}
            chatOpen={chatOpen}
            onNavigate={handleNavigateToFolder}
            onSearchChange={handleSearchChange}
            onViewModeChange={handleViewModeChange}
            onToggleChat={handleToggleChat}
          />

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {isEmpty ? (
              <EmptyState
                onUpload={handleUpload}
                onCreateFolder={handleCreateFolder}
                showUploadButton={true}
                showCreateFolderButton={true}
              />
            ) : viewMode === 'grid' ? (
              <FileGrid
                folders={currentFolders}
                documents={currentDocuments}
                selectedDocumentId={selectedDocument?.id}
                documentsCountByFolder={documentsCountByFolder}
                onOpenFolder={handleNavigateToFolder}
                onSelectDocument={handleSelectDocument}
                onOpenDocument={handleOpenDocument}
              />
            ) : (
              <FileList
                folders={currentFolders}
                documents={currentDocuments}
                selectedDocumentId={selectedDocument?.id}
                onOpenFolder={handleNavigateToFolder}
                onSelectDocument={handleSelectDocument}
                onOpenDocument={handleOpenDocument}
              />
            )}
          </div>
        </main>

        {/* Chat Drawer (placeholder) */}
        {chatOpen && (
          <aside className="w-[400px] flex-shrink-0 bg-slate-900/50 border-l border-slate-800 flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <h2 className="font-semibold">Assistente de Documentos</h2>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 text-center">
              <div>
                <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">
                  Chat com seus documentos
                </h3>
                <p className="text-sm text-slate-500">
                  Faça perguntas sobre seus arquivos e a IA irá buscar as respostas nos documentos
                  indexados.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Pergunte sobre seus documentos..."
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default MyEasyDocs;
