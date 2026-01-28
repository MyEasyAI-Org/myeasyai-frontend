// =============================================
// MyEasyDocs - Main Component
// =============================================
// This is the main entry point for the MyEasyDocs module.
// It manages file/folder navigation, preview, and AI chat.
// =============================================

import { useState, useCallback, useMemo } from 'react';
import type { DocsDocument, DocsFolder, DocsViewMode, BreadcrumbItem, DocsChatMessage } from './types';
import { MOCK_FOLDERS, MOCK_DOCUMENTS } from './mockData';
import { generateId } from './utils';
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

  // Preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // Upload state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  // Item being edited (for modals)
  const [itemToEdit, setItemToEdit] = useState<{
    item: DocsFolder | DocsDocument;
    type: 'folder' | 'document';
  } | null>(null);

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
      setPreviewOpen(true);
      setIsEditing(false);

      // Load text content for text files and code files
      const needsContent = isTextFile(doc.mime_type) || isCode(doc.mime_type, doc.name);
      if (needsContent) {
        setIsLoadingContent(true);
        // TODO: Implement with real service to fetch content
        setTimeout(() => {
          // Example content based on file type
          const sampleContent = isCode(doc.mime_type, doc.name)
            ? `// ${doc.name}\n// Conteúdo de exemplo\n\nfunction helloWorld() {\n  console.log('Hello, World!');\n}\n\nhelloWorld();`
            : 'Este é um conteúdo de exemplo para o arquivo.\n\nO conteúdo real será carregado do servidor.';
          setTextContent(sampleContent);
          setIsLoadingContent(false);
        }, 500);
      } else {
        setTextContent(null);
      }
    }
  }, []);

  // Get current folder name for breadcrumb
  const currentFolderName = useMemo(() => {
    if (!currentFolderId) return 'Meus Documentos';
    const folder = MOCK_FOLDERS.find((f) => f.id === currentFolderId);
    return folder?.name || 'Meus Documentos';
  }, [currentFolderId]);

  // Handlers for sidebar actions
  const handleCreateFolder = useCallback(() => {
    setCreateFolderModalOpen(true);
  }, []);

  const handleCreateFile = useCallback(() => {
    setCreateFileModalOpen(true);
  }, []);

  const handleUpload = useCallback(() => {
    setUploadModalOpen(true);
  }, []);

  // Upload handlers
  const handleUploadFiles = useCallback((files: File[], folderId: string | null) => {
    setIsUploading(true);
    // TODO: Implement with real service
    console.log('Upload files:', files, 'to folder:', folderId);
    setTimeout(() => {
      setIsUploading(false);
      setUploadModalOpen(false);
    }, 2000);
  }, []);

  const handleCloseUploadModal = useCallback(() => {
    if (!isUploading) {
      setUploadModalOpen(false);
    }
  }, [isUploading]);

  // Preview handlers
  const handleClosePreview = useCallback(() => {
    setPreviewOpen(false);
    setSelectedDocument(null);
    setTextContent(null);
    setIsEditing(false);
  }, []);

  const handleEditDocument = useCallback(() => {
    setEditorModalOpen(true);
    setIsEditing(true);
  }, []);

  const handleSaveDocument = useCallback((content: string) => {
    setIsSaving(true);
    // TODO: Implement with real service
    console.log('Save document:', selectedDocument?.id, content);
    setTimeout(() => {
      setTextContent(content);
      setIsSaving(false);
      setEditorModalOpen(false);
      setIsEditing(false);
    }, 500);
  }, [selectedDocument]);

  const handleCloseEditorModal = useCallback(() => {
    setEditorModalOpen(false);
    setIsEditing(false);
  }, []);

  const handleDownloadDocument = useCallback(() => {
    if (selectedDocument?.r2_url) {
      window.open(selectedDocument.r2_url, '_blank', 'noopener,noreferrer');
    }
  }, [selectedDocument]);

  const handleToggleFavorite = useCallback(() => {
    // TODO: Implement with real service
    console.log('Toggle favorite:', selectedDocument?.id);
  }, [selectedDocument]);

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

  // Chat handlers
  const handleSendMessage = useCallback((content: string) => {
    const userMessage: DocsChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setIsChatLoading(true);

    // TODO: Implement with real AI service
    setTimeout(() => {
      const assistantMessage: DocsChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: 'Esta é uma resposta de exemplo. A integração com a IA será implementada em breve.',
        sources: MOCK_DOCUMENTS.slice(0, 2).map((d) => ({
          document_id: d.id,
          document_name: d.name,
        })),
        created_at: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, assistantMessage]);
      setIsChatLoading(false);
    }, 1500);
  }, []);

  const handleClearChat = useCallback(() => {
    setChatMessages([]);
  }, []);

  const handleOpenDocumentFromChat = useCallback((documentId: string) => {
    const doc = MOCK_DOCUMENTS.find((d) => d.id === documentId);
    if (doc) {
      setSelectedDocument(doc);
      setPreviewOpen(true);
      setChatOpen(false);
    }
  }, []);

  // Modal action handlers
  const handleCreateFolderSubmit = useCallback((name: string) => {
    // TODO: Implement with real service
    console.log('Create folder:', name, 'in:', currentFolderId);
    setCreateFolderModalOpen(false);
  }, [currentFolderId]);

  const handleCreateFileSubmit = useCallback((name: string, extension: 'txt' | 'md') => {
    // TODO: Implement with real service
    const fullName = `${name}.${extension}`;
    console.log('Create file:', fullName, 'in:', currentFolderId);

    // Create a mock document and open it for editing
    const newDoc: DocsDocument = {
      id: generateId(),
      user_id: 'user-1',
      folder_id: currentFolderId,
      name: fullName,
      original_name: fullName,
      mime_type: extension === 'md' ? 'text/markdown' : 'text/plain',
      size: 0,
      r2_key: '',
      r2_url: '',
      text_extraction_status: 'pending',
      is_favorite: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setSelectedDocument(newDoc);
    setTextContent('');
    setCreateFileModalOpen(false);
    setEditorModalOpen(true);
    setIsEditing(true);
  }, [currentFolderId]);

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

  const handleRenameSubmit = useCallback((newName: string) => {
    if (!itemToEdit) return;
    // TODO: Implement with real service
    console.log('Rename:', itemToEdit.item.id, 'to:', newName);
    setRenameModalOpen(false);
    setItemToEdit(null);
  }, [itemToEdit]);

  const handleDeleteItem = useCallback(
    (item: DocsFolder | DocsDocument, type: 'folder' | 'document') => {
      setItemToEdit({ item, type });
      setDeleteModalOpen(true);
    },
    []
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!itemToEdit) return;
    // TODO: Implement with real service
    console.log('Delete:', itemToEdit.item.id);
    setDeleteModalOpen(false);
    setItemToEdit(null);
  }, [itemToEdit]);

  const handleMoveItem = useCallback(
    (item: DocsFolder | DocsDocument, type: 'folder' | 'document') => {
      setItemToEdit({ item, type });
      setMoveModalOpen(true);
    },
    []
  );

  const handleMoveSubmit = useCallback(
    (destinationFolderId: string | null) => {
      if (!itemToEdit) return;
      // TODO: Implement with real service
      console.log('Move:', itemToEdit.item.id, 'to:', destinationFolderId);
      setMoveModalOpen(false);
      setItemToEdit(null);
    },
    [itemToEdit]
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
          <div className="flex-1 flex overflow-hidden">
            {/* File explorer */}
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
                  onRenameItem={handleRenameItem}
                  onDeleteItem={handleDeleteItem}
                  onMoveItem={handleMoveItem}
                />
              ) : (
                <FileList
                  folders={currentFolders}
                  documents={currentDocuments}
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
        hasDocuments={MOCK_DOCUMENTS.length > 0}
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
            ? MOCK_FOLDERS.some((f) => f.parent_id === itemToEdit.item.id) ||
              MOCK_DOCUMENTS.some((d) => d.folder_id === itemToEdit.item.id)
            : false
        }
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
      />

      <MoveItemModal
        isOpen={moveModalOpen}
        item={itemToEdit?.item || null}
        itemType={itemToEdit?.type || 'document'}
        folders={MOCK_FOLDERS}
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
