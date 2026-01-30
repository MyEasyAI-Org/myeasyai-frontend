// =============================================
// MyEasyDocs - Main Component
// =============================================
// This is the main entry point for the MyEasyDocs module.
// It manages file/folder navigation, preview, and AI chat.
// =============================================

import { useState, useCallback, useMemo } from 'react';
import type { DocsDocument, DocsFolder, DocsViewMode, DocsChatMessage } from './types';
import { generateId } from './utils';
import { useFolders, useDocuments, useFileUpload } from './hooks';
import { DocsSidebar } from './components/layout/DocsSidebar';
import { DocsHeader } from './components/layout/DocsHeader';
import { FileGrid } from './components/explorer/FileGrid';
import { FileList } from './components/explorer/FileList';
import { EmptyState } from './components/explorer/EmptyState';
import { FilePreview } from './components/preview';
import { UploadModal } from './components/upload';
import { DocsChatDrawer } from './components/chat';
import {
  CreateFolderModal,
  CreateFileModal,
  RenameModal,
  DeleteConfirmModal,
  MoveItemModal,
  TextEditorModal,
} from './components/modals';
import { isCode, isTextFile } from './utils';
import { Loader2 } from 'lucide-react';

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
  // =============================================
  // HOOKS - Real data from services
  // =============================================
  const {
    folders,
    currentFolderId,
    currentFolder,
    currentPath,
    childFolders,
    isLoading: isFoldersLoading,
    error: foldersError,
    navigateTo,
    createFolder,
    renameFolder,
    moveFolder,
    deleteFolder,
  } = useFolders();

  const {
    documents,
    selectedDocument,
    isLoading: isDocumentsLoading,
    error: documentsError,
    refresh: refreshDocuments,
    selectDocument,
    createDocument,
    createEmptyFile,
    renameDocument,
    moveDocument,
    toggleFavorite,
    deleteDocument,
    getContent,
    saveContent,
  } = useDocuments({ folderId: currentFolderId });

  // All documents for sidebar folder count (no folder filter)
  const {
    documents: allDocuments,
    refresh: refreshAllDocuments,
  } = useDocuments();

  const {
    isUploading,
    uploadFiles,
    clearCompleted,
  } = useFileUpload({
    folderId: currentFolderId,
    onDocumentCreated: () => {
      refreshDocuments();
      refreshAllDocuments();
    },
  });

  // =============================================
  // LOCAL STATE
  // =============================================
  // View state
  const [viewMode, setViewMode] = useState<DocsViewMode>('grid');
  const [chatOpen, setChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<DocsChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Sidebar state
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Modal states
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [createFileModalOpen, setCreateFileModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingFile, setIsCreatingFile] = useState(false);

  // Item being edited (for modals)
  const [itemToEdit, setItemToEdit] = useState<{
    item: DocsFolder | DocsDocument;
    type: 'folder' | 'document';
  } | null>(null);

  // =============================================
  // COMPUTED VALUES
  // =============================================
  // Get current folder name for display
  const currentFolderName = useMemo(() => {
    if (!currentFolderId) return 'Meus Documentos';
    return currentFolder?.name || 'Meus Documentos';
  }, [currentFolderId, currentFolder]);

  // Count documents by folder for display (uses allDocuments for accurate count)
  const documentsCountByFolder = useMemo(() => {
    const map = new Map<string, number>();
    for (const folder of childFolders) {
      const count = allDocuments.filter((d) => d.folder_id === folder.id).length;
      map.set(folder.id, count);
    }
    return map;
  }, [childFolders, allDocuments]);

  // Check if loading
  const isLoading = isFoldersLoading || isDocumentsLoading;

  // Check if current view is empty
  const isEmpty = !isLoading && childFolders.length === 0 && documents.length === 0;

  // Error message
  const error = foldersError || documentsError;

  // =============================================
  // NAVIGATION HANDLERS
  // =============================================
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

  const handleNavigateToFolder = useCallback((folderId: string | null) => {
    navigateTo(folderId);
    selectDocument(null);
    setPreviewOpen(false);
  }, [navigateTo, selectDocument]);

  const handleSelectDocument = useCallback((documentId: string) => {
    const doc = documents.find((d) => d.id === documentId);
    if (doc) {
      selectDocument(doc);
    }
  }, [documents, selectDocument]);

  const handleOpenDocument = useCallback(async (documentId: string) => {
    const doc = documents.find((d) => d.id === documentId);
    if (doc) {
      selectDocument(doc);
      setPreviewOpen(true);
      setIsEditing(false);

      // Load text content for text files and code files
      const needsContent = isTextFile(doc.mime_type) || isCode(doc.mime_type, doc.name);
      if (needsContent) {
        setIsLoadingContent(true);
        try {
          const content = await getContent(doc.id);
          setTextContent(content);
        } catch (err) {
          console.error('Error loading content:', err);
          setTextContent(null);
        } finally {
          setIsLoadingContent(false);
        }
      } else {
        setTextContent(null);
      }
    }
  }, [documents, selectDocument, getContent]);

  // =============================================
  // SIDEBAR ACTION HANDLERS
  // =============================================
  const handleCreateFolder = useCallback(() => {
    setCreateFolderModalOpen(true);
  }, []);

  const handleCreateFile = useCallback(() => {
    setCreateFileModalOpen(true);
  }, []);

  const handleUpload = useCallback(() => {
    setUploadModalOpen(true);
  }, []);

  const handleViewFavorites = useCallback(() => {
    // TODO: Implement favorites view
    console.log('View favorites');
  }, []);

  const handleViewRecent = useCallback(() => {
    // TODO: Implement recent view
    console.log('View recent');
  }, []);

  // =============================================
  // UPLOAD HANDLERS
  // =============================================
  const handleUploadFiles = useCallback(async (files: File[], folderId: string | null) => {
    await uploadFiles(files, folderId);
  }, [uploadFiles]);

  const handleCloseUploadModal = useCallback(() => {
    if (!isUploading) {
      setUploadModalOpen(false);
      clearCompleted();
    }
  }, [isUploading, clearCompleted]);

  // =============================================
  // PREVIEW HANDLERS
  // =============================================
  const handleClosePreview = useCallback(() => {
    setPreviewOpen(false);
    selectDocument(null);
    setTextContent(null);
    setIsEditing(false);
  }, [selectDocument]);

  const handleEditDocument = useCallback(() => {
    setEditorModalOpen(true);
    setIsEditing(true);
  }, []);

  const handleSaveDocument = useCallback(async (content: string) => {
    if (!selectedDocument) return;

    setIsSaving(true);
    try {
      await saveContent(selectedDocument.id, content);
      setTextContent(content);
      setEditorModalOpen(false);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving document:', err);
    } finally {
      setIsSaving(false);
    }
  }, [selectedDocument, saveContent]);

  const handleCloseEditorModal = useCallback(() => {
    setEditorModalOpen(false);
    setIsEditing(false);
  }, []);

  const handleDownloadDocument = useCallback(() => {
    if (selectedDocument?.r2_url) {
      window.open(selectedDocument.r2_url, '_blank', 'noopener,noreferrer');
    }
  }, [selectedDocument]);

  const handleToggleFavorite = useCallback(async () => {
    if (!selectedDocument) return;
    try {
      await toggleFavorite(selectedDocument.id);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  }, [selectedDocument, toggleFavorite]);

  const handleDeleteDocument = useCallback(() => {
    if (selectedDocument) {
      setItemToEdit({ item: selectedDocument, type: 'document' });
      setDeleteModalOpen(true);
    }
  }, [selectedDocument]);

  const handleMoveDocument = useCallback(() => {
    if (selectedDocument) {
      setItemToEdit({ item: selectedDocument, type: 'document' });
      setMoveModalOpen(true);
    }
  }, [selectedDocument]);

  // =============================================
  // CHAT HANDLERS
  // =============================================
  const handleSendMessage = useCallback((content: string) => {
    const userMessage: DocsChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setIsChatLoading(true);

    // TODO: Implement with real AI service in Phase 18
    setTimeout(() => {
      const assistantMessage: DocsChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: 'Esta é uma resposta de exemplo. A integração com a IA será implementada na Fase 18.',
        sources: documents.slice(0, 2).map((d) => ({
          document_id: d.id,
          document_name: d.name,
        })),
        created_at: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, assistantMessage]);
      setIsChatLoading(false);
    }, 1500);
  }, [documents]);

  const handleClearChat = useCallback(() => {
    setChatMessages([]);
  }, []);

  const handleOpenDocumentFromChat = useCallback((documentId: string) => {
    handleOpenDocument(documentId);
    setChatOpen(false);
  }, [handleOpenDocument]);

  // =============================================
  // MODAL ACTION HANDLERS
  // =============================================
  const handleCreateFolderSubmit = useCallback(async (name: string) => {
    try {
      await createFolder(name);
      setCreateFolderModalOpen(false);
    } catch (err) {
      console.error('Error creating folder:', err);
    }
  }, [createFolder]);

  const handleCreateFileSubmit = useCallback(async (name: string, extension: 'txt' | 'md') => {
    setIsCreatingFile(true);
    try {
      const ext = extension === 'md' ? '.md' : '.txt';
      const newDoc = await createEmptyFile(name, ext);
      selectDocument(newDoc);
      setTextContent('');
      setCreateFileModalOpen(false);
      setEditorModalOpen(true);
      setIsEditing(true);
      refreshAllDocuments();
    } catch (err) {
      console.error('Error creating file:', err);
      alert(`Erro ao criar arquivo: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setIsCreatingFile(false);
    }
  }, [createEmptyFile, selectDocument, refreshAllDocuments]);

  const handleCloseCreateFileModal = useCallback(() => {
    setCreateFileModalOpen(false);
  }, []);

  // Context menu handlers for items
  const handleRenameItem = useCallback(
    (item: DocsFolder | DocsDocument, type: 'folder' | 'document') => {
      setItemToEdit({ item, type });
      setRenameModalOpen(true);
    },
    []
  );

  const handleRenameSubmit = useCallback(async (newName: string) => {
    if (!itemToEdit) return;

    try {
      if (itemToEdit.type === 'folder') {
        await renameFolder(itemToEdit.item.id, newName);
      } else {
        await renameDocument(itemToEdit.item.id, newName);
      }
      setRenameModalOpen(false);
      setItemToEdit(null);
    } catch (err) {
      console.error('Error renaming:', err);
    }
  }, [itemToEdit, renameFolder, renameDocument]);

  const handleDeleteItem = useCallback(
    (item: DocsFolder | DocsDocument, type: 'folder' | 'document') => {
      setItemToEdit({ item, type });
      setDeleteModalOpen(true);
    },
    []
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!itemToEdit) return;

    try {
      if (itemToEdit.type === 'folder') {
        await deleteFolder(itemToEdit.item.id);
      } else {
        await deleteDocument(itemToEdit.item.id);
        if (selectedDocument?.id === itemToEdit.item.id) {
          setPreviewOpen(false);
        }
      }
      setDeleteModalOpen(false);
      setItemToEdit(null);
      refreshAllDocuments();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  }, [itemToEdit, deleteFolder, deleteDocument, selectedDocument, refreshAllDocuments]);

  const handleMoveItem = useCallback(
    (item: DocsFolder | DocsDocument, type: 'folder' | 'document') => {
      setItemToEdit({ item, type });
      setMoveModalOpen(true);
    },
    []
  );

  const handleMoveSubmit = useCallback(
    async (destinationFolderId: string | null) => {
      if (!itemToEdit) return;

      try {
        if (itemToEdit.type === 'folder') {
          await moveFolder(itemToEdit.item.id, destinationFolderId);
        } else {
          await moveDocument(itemToEdit.item.id, destinationFolderId);
        }
        setMoveModalOpen(false);
        setItemToEdit(null);
        refreshAllDocuments();
      } catch (err) {
        console.error('Error moving:', err);
      }
    },
    [itemToEdit, moveFolder, moveDocument, refreshAllDocuments]
  );

  // Close modal handlers
  const handleCloseCreateFolderModal = useCallback(() => {
    setCreateFolderModalOpen(false);
  }, []);

  const handleCloseRenameModal = useCallback(() => {
    setRenameModalOpen(false);
    setItemToEdit(null);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
    setItemToEdit(null);
  }, []);

  const handleCloseMoveModal = useCallback(() => {
    setMoveModalOpen(false);
    setItemToEdit(null);
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

  // =============================================
  // RENDER
  // =============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white">
      <div className="flex h-screen">
        {/* Sidebar */}
        <DocsSidebar
          folders={folders}
          currentFolderId={currentFolderId}
          expandedFolders={expandedFolders}
          documents={allDocuments}
          selectedDocumentId={selectedDocument?.id}
          onNavigate={handleNavigateToFolder}
          onToggleExpand={handleToggleFolderExpansion}
          onCreateFolder={handleCreateFolder}
          onCreateFile={handleCreateFile}
          onUpload={handleUpload}
          onSelectDocument={handleOpenDocument}
          onBackToDashboard={onBackToDashboard}
          onViewFavorites={handleViewFavorites}
          onViewRecent={handleViewRecent}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <DocsHeader
            breadcrumb={currentPath}
            searchQuery={searchQuery}
            viewMode={viewMode}
            chatOpen={chatOpen}
            onNavigate={handleNavigateToFolder}
            onSearchChange={handleSearchChange}
            onViewModeChange={handleViewModeChange}
            onToggleChat={handleToggleChat}
          />

          {/* Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* File explorer */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <p className="text-red-400 mb-2">Erro ao carregar dados</p>
                  <p className="text-slate-500 text-sm">{error}</p>
                </div>
              )}

              {/* Empty State */}
              {isEmpty && !error && (
                <EmptyState
                  onUpload={handleUpload}
                  onCreateFolder={handleCreateFolder}
                  showUploadButton={true}
                  showCreateFolderButton={true}
                />
              )}

              {/* Grid View */}
              {!isLoading && !error && !isEmpty && viewMode === 'grid' && (
                <FileGrid
                  folders={childFolders}
                  documents={documents}
                  selectedDocumentId={selectedDocument?.id}
                  documentsCountByFolder={documentsCountByFolder}
                  onOpenFolder={handleNavigateToFolder}
                  onSelectDocument={handleSelectDocument}
                  onOpenDocument={handleOpenDocument}
                  onRenameItem={handleRenameItem}
                  onDeleteItem={handleDeleteItem}
                  onMoveItem={handleMoveItem}
                />
              )}

              {/* List View */}
              {!isLoading && !error && !isEmpty && viewMode === 'list' && (
                <FileList
                  folders={childFolders}
                  documents={documents}
                  selectedDocumentId={selectedDocument?.id}
                  onOpenFolder={handleNavigateToFolder}
                  onSelectDocument={handleSelectDocument}
                  onOpenDocument={handleOpenDocument}
                  onRenameItem={handleRenameItem}
                  onDeleteItem={handleDeleteItem}
                  onMoveItem={handleMoveItem}
                />
              )}
            </div>

            {/* Preview Panel */}
            {previewOpen && selectedDocument && (
              <aside className="w-[480px] shrink-0 border-l border-slate-700">
                <FilePreview
                  document={selectedDocument}
                  textContent={textContent}
                  isLoadingContent={isLoadingContent}
                  onClose={handleClosePreview}
                  onEdit={handleEditDocument}
                  onDownload={handleDownloadDocument}
                  onDelete={handleDeleteDocument}
                  onMove={handleMoveDocument}
                  onToggleFavorite={handleToggleFavorite}
                />
              </aside>
            )}
          </div>
        </main>
      </div>

      {/* Chat Drawer */}
      <DocsChatDrawer
        isOpen={chatOpen}
        messages={chatMessages}
        isLoading={isChatLoading}
        hasDocuments={documents.length > 0}
        onClose={() => setChatOpen(false)}
        onSend={handleSendMessage}
        onClear={handleClearChat}
        onOpenDocument={handleOpenDocumentFromChat}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        currentFolderId={currentFolderId}
        currentFolderName={currentFolderName}
        isUploading={isUploading}
        onClose={handleCloseUploadModal}
        onUpload={handleUploadFiles}
      />

      {/* Modals */}
      <CreateFolderModal
        isOpen={createFolderModalOpen}
        parentFolderName={currentFolderName}
        onClose={handleCloseCreateFolderModal}
        onCreate={handleCreateFolderSubmit}
      />

      <RenameModal
        isOpen={renameModalOpen}
        currentName={itemToEdit?.item.name || ''}
        itemType={itemToEdit?.type || 'document'}
        onClose={handleCloseRenameModal}
        onRename={handleRenameSubmit}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        itemName={itemToEdit?.item.name || ''}
        itemType={itemToEdit?.type || 'document'}
        hasChildren={
          itemToEdit?.type === 'folder'
            ? folders.some((f) => f.parent_id === itemToEdit.item.id) ||
              documents.some((d) => d.folder_id === itemToEdit.item.id)
            : false
        }
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
      />

      <MoveItemModal
        isOpen={moveModalOpen}
        item={itemToEdit?.item || null}
        itemType={itemToEdit?.type || 'document'}
        folders={folders}
        currentFolderId={
          itemToEdit?.type === 'folder'
            ? (itemToEdit.item as DocsFolder).parent_id
            : (itemToEdit?.item as DocsDocument)?.folder_id ?? null
        }
        onClose={handleCloseMoveModal}
        onMove={handleMoveSubmit}
      />

      <CreateFileModal
        isOpen={createFileModalOpen}
        parentFolderName={currentFolderName}
        isCreating={isCreatingFile}
        onClose={handleCloseCreateFileModal}
        onCreate={handleCreateFileSubmit}
      />

      {/* Fullscreen Text Editor Modal */}
      {selectedDocument && (
        <TextEditorModal
          isOpen={editorModalOpen}
          content={textContent || ''}
          fileName={selectedDocument.name}
          isSaving={isSaving}
          onSave={handleSaveDocument}
          onClose={handleCloseEditorModal}
        />
      )}
    </div>
  );
}

export default MyEasyDocs;
