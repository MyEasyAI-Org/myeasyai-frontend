// =============================================
// MyEasyDocs - Main Component
// =============================================
// This is the main entry point for the MyEasyDocs module.
// It manages file/folder navigation, preview, and AI chat.
// =============================================

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { DocsDocument, DocsFolder, DocsViewMode } from './types';
import { useFolders, useDocuments, useFileUpload, useDocsChat, useDocsSearch } from './hooks';
import { avatarService } from '../my-easy-avatar/services/avatarService';
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
import { SelectionToolbar } from './components/shared/SelectionToolbar';
import { isCode, isTextFile } from './utils';
import { Loader2, Star, Clock } from 'lucide-react';

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
    removeDocumentsByFolderIds,
    toggleFavorite: toggleFavoriteAll,
  } = useDocuments();

  const {
    uploads,
    isUploading,
    uploadFiles,
    cancelUpload,
    clearCompleted,
  } = useFileUpload({
    folderId: currentFolderId,
    onDocumentCreated: () => {
      refreshDocuments();
      refreshAllDocuments();
    },
  });

  // =============================================
  // SEARCH HOOK
  // =============================================
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    matchedDocumentsByName,
    matchedDocumentsByContent,
    matchedDocumentIds,
    isSearchActive,
    isSearching,
  } = useDocsSearch({
    documents: documents, // Busca apenas no diretório atual
    searchInContent: true,
    minQueryLength: 1, // Permite busca a partir de 1 caractere
  });

  // =============================================
  // LOCAL STATE
  // =============================================
  // View state
  const [viewMode, setViewMode] = useState<DocsViewMode>('grid');
  const [chatOpen, setChatOpen] = useState(false);
  const [specialViewMode, setSpecialViewMode] = useState<'none' | 'favorites' | 'recent'>('none');

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Map<string, 'folder' | 'document'>>(new Map());

  // Preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Avatar state (from MyEasyAvatar)
  const [avatarName, setAvatarName] = useState<string>('Assistente Concierge');
  const [avatarSelfie, setAvatarSelfie] = useState<string | null>(null);

  // Chat state (using useDocsChat hook)
  const {
    messages: chatMessages,
    isLoading: isChatLoading,
    sendMessage,
    clearMessages: clearChat,
  } = useDocsChat({ hasDocuments: documents.length > 0 });

  // Load avatar data on mount
  useEffect(() => {
    const loadAvatarData = async () => {
      try {
        const { name, selfie } = await avatarService.getAvatarBasicInfo();
        if (name) {
          setAvatarName(name);
        }
        if (selfie) {
          setAvatarSelfie(selfie);
        }
      } catch (err) {
        console.warn('[MyEasyDocs] Could not load avatar data:', err);
      }
    };
    loadAvatarData();
  }, []);

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
    if (specialViewMode === 'favorites') return 'Favoritos';
    if (specialViewMode === 'recent') return 'Recentes';
    if (!currentFolderId) return 'Meus Documentos';
    return currentFolder?.name || 'Meus Documentos';
  }, [currentFolderId, currentFolder, specialViewMode]);

  // Custom breadcrumb for special view modes
  const displayedBreadcrumb = useMemo(() => {
    if (specialViewMode === 'favorites') {
      return [
        { id: null, name: 'Meus Documentos' },
        { id: 'favorites', name: 'Favoritos' },
      ];
    }
    if (specialViewMode === 'recent') {
      return [
        { id: null, name: 'Meus Documentos' },
        { id: 'recent', name: 'Recentes' },
      ];
    }
    return currentPath;
  }, [specialViewMode, currentPath]);

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

  // Multi-select computed values
  const hasDocumentsSelected = Array.from(selectedTypes.values()).some((type) => type === 'document');

  // Filter documents and folders based on search and special view mode
  const displayedDocuments = useMemo(() => {
    // Special view modes take priority
    if (specialViewMode === 'favorites') {
      const favoritesDocs = allDocuments.filter((doc) => doc.is_favorite);
      // If searching within favorites
      if (isSearchActive) {
        return favoritesDocs.filter((doc) => matchedDocumentIds.has(doc.id));
      }
      return favoritesDocs;
    }
    if (specialViewMode === 'recent') {
      // Sort by updated_at descending and take top 20
      const recentDocs = [...allDocuments]
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 20);
      // If searching within recent
      if (isSearchActive) {
        return recentDocs.filter((doc) => matchedDocumentIds.has(doc.id));
      }
      return recentDocs;
    }

    // Normal mode
    if (isSearchActive) {
      // When searching, show only documents from current folder that match
      return documents.filter((doc) => matchedDocumentIds.has(doc.id));
    }
    return documents;
  }, [isSearchActive, documents, matchedDocumentIds, specialViewMode]);

  const displayedFolders = useMemo(() => {
    // In special view modes, don't show folders
    if (specialViewMode === 'favorites' || specialViewMode === 'recent') {
      return [];
    }

    if (isSearchActive) {
      // When searching, show only child folders that match the search query
      const queryLower = searchQuery.toLowerCase();
      return childFolders.filter((f) => f.name.toLowerCase().includes(queryLower));
    }
    return childFolders;
  }, [isSearchActive, childFolders, searchQuery, specialViewMode]);

  // Check if current view is empty
  const isEmpty = !isLoading && !isSearchActive && specialViewMode === 'none' && childFolders.length === 0 && documents.length === 0;

  // Check if special view is empty
  const isSpecialViewEmpty = specialViewMode !== 'none' && !isLoading && displayedDocuments.length === 0;

  // Check if search has no results
  const isSearchEmpty = isSearchActive && !isSearching && displayedDocuments.length === 0 && displayedFolders.length === 0;

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
    setSpecialViewMode('none'); // Reset special view when navigating
    setSearchQuery(''); // Limpa a busca ao navegar para evitar pasta dentro dela mesma
    // Clear selection when navigating
    setSelectedIds(new Set());
    setSelectedTypes(new Map());
  }, [navigateTo, selectDocument, setSearchQuery]);

  // =============================================
  // MULTI-SELECT HANDLERS
  // =============================================
  const handleToggleSelect = useCallback((id: string, type: 'folder' | 'document') => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setSelectedTypes((prev) => {
      const next = new Map(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.set(id, type);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const allIds = new Set<string>();
    const allTypes = new Map<string, 'folder' | 'document'>();

    // Check if all are already selected
    const totalItems = displayedFolders.length + displayedDocuments.length;
    const allSelected = selectedIds.size === totalItems && totalItems > 0;

    if (allSelected) {
      // Deselect all
      setSelectedIds(new Set());
      setSelectedTypes(new Map());
    } else {
      // Select all
      displayedFolders.forEach((folder) => {
        allIds.add(folder.id);
        allTypes.set(folder.id, 'folder');
      });
      displayedDocuments.forEach((doc) => {
        allIds.add(doc.id);
        allTypes.set(doc.id, 'document');
      });
      setSelectedIds(allIds);
      setSelectedTypes(allTypes);
    }
  }, [displayedFolders, displayedDocuments, selectedIds.size]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setSelectedTypes(new Map());
  }, []);

  // Bulk delete selected items
  const handleBulkDelete = useCallback(() => {
    if (selectedIds.size === 0) return;

    // Create items array for the delete modal
    const items = Array.from(selectedIds).map((id) => {
      const type = selectedTypes.get(id) || 'document';
      let name = '';
      if (type === 'folder') {
        const folder = folders.find((f) => f.id === id);
        name = folder?.name || 'Pasta';
      } else {
        const doc = documents.find((d) => d.id === id) || allDocuments.find((d) => d.id === id);
        name = doc?.name || 'Documento';
      }
      return { id, name, type };
    });

    // Set itemToEdit with the first item for backwards compatibility
    // The modal will handle multiple items via the items prop
    if (items.length > 0) {
      const firstItem = items[0];
      const item = firstItem.type === 'folder'
        ? folders.find((f) => f.id === firstItem.id)
        : (documents.find((d) => d.id === firstItem.id) || allDocuments.find((d) => d.id === firstItem.id));
      if (item) {
        setItemToEdit({ item, type: firstItem.type });
      }
    }
    setDeleteModalOpen(true);
  }, [selectedIds, selectedTypes, folders, documents, allDocuments]);

  // Bulk move selected items
  const handleBulkMove = useCallback(() => {
    if (selectedIds.size === 0) return;

    // For bulk move, we'll use the first selected item
    const firstId = Array.from(selectedIds)[0];
    const type = selectedTypes.get(firstId) || 'document';

    let item;
    if (type === 'folder') {
      item = folders.find((f) => f.id === firstId);
    } else {
      item = documents.find((d) => d.id === firstId) || allDocuments.find((d) => d.id === firstId);
    }

    if (item) {
      setItemToEdit({ item, type });
      setMoveModalOpen(true);
    }
  }, [selectedIds, selectedTypes, folders, documents, allDocuments]);

  // Bulk favorite toggle (only for documents)
  const handleBulkToggleFavorite = useCallback(async () => {
    const docIds = Array.from(selectedIds).filter((id) => selectedTypes.get(id) === 'document');

    for (const docId of docIds) {
      try {
        await toggleFavoriteAll(docId);
      } catch (err) {
        console.error('Error toggling favorite:', err);
      }
    }

    refreshDocuments();
    refreshAllDocuments();
    handleClearSelection();
  }, [selectedIds, selectedTypes, toggleFavoriteAll, refreshDocuments, refreshAllDocuments, handleClearSelection]);

  // Keyboard handler for Escape to clear selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedIds.size > 0) {
        handleClearSelection();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds.size, handleClearSelection]);

  const handleSelectDocument = useCallback((documentId: string) => {
    // Busca primeiro na pasta atual, depois em todos os documentos
    const doc = documents.find((d) => d.id === documentId)
             || allDocuments.find((d) => d.id === documentId);
    if (doc) {
      selectDocument(doc);
    }
  }, [documents, allDocuments, selectDocument]);

  const handleOpenDocument = useCallback(async (documentId: string) => {
    // Busca primeiro na pasta atual, depois em todos os documentos
    const doc = documents.find((d) => d.id === documentId)
             || allDocuments.find((d) => d.id === documentId);
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
  }, [documents, allDocuments, selectDocument, getContent]);

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
    setSpecialViewMode((prev) => prev === 'favorites' ? 'none' : 'favorites');
    selectDocument(null);
    setPreviewOpen(false);
  }, [selectDocument]);

  const handleViewRecent = useCallback(() => {
    setSpecialViewMode((prev) => prev === 'recent' ? 'none' : 'recent');
    selectDocument(null);
    setPreviewOpen(false);
  }, [selectDocument]);

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

  // Open fullscreen editor
  const handleFullscreenEdit = useCallback(() => {
    setEditorModalOpen(true);
    setIsEditing(true);
  }, []);

  // Handle inline save from TextPreview
  const handleInlineSaveDocument = useCallback(async (content: string) => {
    if (!selectedDocument) return;

    setIsSaving(true);
    try {
      await saveContent(selectedDocument.id, content);
      setTextContent(content);
    } catch (err) {
      console.error('Error saving document:', err);
    } finally {
      setIsSaving(false);
    }
  }, [selectedDocument, saveContent]);

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
      // Atualiza allDocuments para refletir na view de favoritos
      refreshAllDocuments();
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  }, [selectedDocument, toggleFavorite, refreshAllDocuments]);

  const handleToggleFavoriteItem = useCallback(async (doc: DocsDocument) => {
    try {
      // Use toggleFavoriteAll to update the allDocuments state (used by favorites view)
      await toggleFavoriteAll(doc.id);
      // Refresh both current folder and all documents to keep UI in sync
      refreshDocuments();
      refreshAllDocuments();
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  }, [toggleFavoriteAll, refreshDocuments, refreshAllDocuments]);

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
    sendMessage(content);
  }, [sendMessage]);

  const handleClearChat = useCallback(() => {
    clearChat();
  }, [clearChat]);

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
    // Bulk delete mode
    if (selectedIds.size > 0) {
      try {
        const allDeletedFolderIds: string[] = [];

        for (const id of selectedIds) {
          const type = selectedTypes.get(id);
          if (type === 'folder') {
            const deletedFolderIds = await deleteFolder(id);
            allDeletedFolderIds.push(...deletedFolderIds);
          } else {
            await deleteDocument(id);
            if (selectedDocument?.id === id) {
              setPreviewOpen(false);
            }
          }
        }

        // Remove documents from deleted folders
        if (allDeletedFolderIds.length > 0) {
          removeDocumentsByFolderIds(allDeletedFolderIds);
        }

        setDeleteModalOpen(false);
        setItemToEdit(null);
        handleClearSelection();
        refreshAllDocuments();
      } catch (err) {
        console.error('Error deleting items:', err);
      }
      return;
    }

    // Single item delete mode
    if (!itemToEdit) return;

    try {
      if (itemToEdit.type === 'folder') {
        // deleteFolder returns the IDs of deleted folders (including descendants)
        const deletedFolderIds = await deleteFolder(itemToEdit.item.id);
        // Remove documents that belonged to deleted folders from state (cascade delete)
        removeDocumentsByFolderIds(deletedFolderIds);
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
  }, [itemToEdit, deleteFolder, deleteDocument, selectedDocument, refreshAllDocuments, removeDocumentsByFolderIds, selectedIds, selectedTypes, handleClearSelection]);

  const handleMoveItem = useCallback(
    (item: DocsFolder | DocsDocument, type: 'folder' | 'document') => {
      setItemToEdit({ item, type });
      setMoveModalOpen(true);
    },
    []
  );

  const handleMoveSubmit = useCallback(
    async (destinationFolderId: string | null) => {
      // Bulk move mode
      if (selectedIds.size > 0) {
        try {
          for (const id of selectedIds) {
            const type = selectedTypes.get(id);
            if (type === 'folder') {
              await moveFolder(id, destinationFolderId);
            } else {
              await moveDocument(id, destinationFolderId);
            }
          }
          setMoveModalOpen(false);
          setItemToEdit(null);
          handleClearSelection();
          refreshDocuments();
          refreshAllDocuments();
        } catch (err) {
          console.error('Error moving items:', err);
        }
        return;
      }

      // Single item move mode
      if (!itemToEdit) return;

      try {
        if (itemToEdit.type === 'folder') {
          await moveFolder(itemToEdit.item.id, destinationFolderId);
        } else {
          await moveDocument(itemToEdit.item.id, destinationFolderId);
        }
        setMoveModalOpen(false);
        setItemToEdit(null);
        // Refresh both current folder documents and all documents
        refreshDocuments();
        refreshAllDocuments();
      } catch (err) {
        console.error('Error moving:', err);
      }
    },
    [itemToEdit, moveFolder, moveDocument, refreshDocuments, refreshAllDocuments, selectedIds, selectedTypes, handleClearSelection]
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
  }, [setSearchQuery]);

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
          specialViewMode={specialViewMode}
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
            breadcrumb={displayedBreadcrumb}
            searchQuery={searchQuery}
            viewMode={viewMode}
            chatOpen={chatOpen}
            avatarName={avatarName}
            avatarSelfie={avatarSelfie}
            selectedCount={selectedIds.size}
            totalItems={displayedFolders.length + displayedDocuments.length}
            allSelected={displayedFolders.length + displayedDocuments.length > 0 && selectedIds.size === displayedFolders.length + displayedDocuments.length}
            someSelected={selectedIds.size > 0 && selectedIds.size < displayedFolders.length + displayedDocuments.length}
            onSelectAll={handleSelectAll}
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

              {/* Search Results Header */}
              {isSearchActive && !isLoading && (
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-sm">
                      {isSearching ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                          Buscando...
                        </>
                      ) : (
                        <>
                          {displayedDocuments.length} documento{displayedDocuments.length !== 1 ? 's' : ''} encontrado{displayedDocuments.length !== 1 ? 's' : ''}
                          {matchedDocumentsByContent.length > 0 && (
                            <span className="ml-1 text-blue-400">
                              ({matchedDocumentsByContent.length} por conteúdo)
                            </span>
                          )}
                        </>
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* Search Empty State */}
              {isSearchEmpty && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <p className="text-slate-400 mb-2">Nenhum resultado encontrado</p>
                  <p className="text-slate-500 text-sm">
                    Tente buscar por outros termos ou verifique a ortografia
                  </p>
                </div>
              )}

              {/* Special View Empty State (Favorites/Recent) */}
              {isSpecialViewEmpty && !isSearchEmpty && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  {specialViewMode === 'favorites' ? (
                    <>
                      <Star className="w-16 h-16 text-slate-600 mb-4" />
                      <p className="text-slate-400 mb-2">Nenhum favorito ainda</p>
                      <p className="text-slate-500 text-sm">
                        Clique no menu de um documento e selecione "Favoritar"
                      </p>
                    </>
                  ) : (
                    <>
                      <Clock className="w-16 h-16 text-slate-600 mb-4" />
                      <p className="text-slate-400 mb-2">Nenhum documento recente</p>
                      <p className="text-slate-500 text-sm">
                        Os documentos acessados recentemente aparecerão aqui
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Special View Header */}
              {specialViewMode !== 'none' && !isLoading && !isSpecialViewEmpty && (
                <div className="mb-4 flex items-center gap-2">
                  {specialViewMode === 'favorites' ? (
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-blue-400" />
                  )}
                  <span className="text-lg font-medium text-slate-200">
                    {currentFolderName}
                  </span>
                  <span className="text-slate-500 text-sm">
                    ({displayedDocuments.length} documento{displayedDocuments.length !== 1 ? 's' : ''})
                  </span>
                </div>
              )}

              {/* Grid View */}
              {!isLoading && !error && !isEmpty && !isSearchEmpty && !isSpecialViewEmpty && viewMode === 'grid' && (
                <FileGrid
                  folders={displayedFolders}
                  documents={displayedDocuments}
                  selectedDocumentId={selectedDocument?.id}
                  documentsCountByFolder={documentsCountByFolder}
                  selectedIds={selectedIds}
                  hasAnySelection={selectedIds.size > 0}
                  onToggleSelect={handleToggleSelect}
                  onOpenFolder={handleNavigateToFolder}
                  onSelectDocument={handleSelectDocument}
                  onOpenDocument={handleOpenDocument}
                  onRenameItem={handleRenameItem}
                  onDeleteItem={handleDeleteItem}
                  onMoveItem={handleMoveItem}
                  onToggleFavorite={handleToggleFavoriteItem}
                />
              )}

              {/* List View */}
              {!isLoading && !error && !isEmpty && !isSearchEmpty && !isSpecialViewEmpty && viewMode === 'list' && (
                <FileList
                  folders={displayedFolders}
                  documents={displayedDocuments}
                  selectedDocumentId={selectedDocument?.id}
                  selectedIds={selectedIds}
                  hasAnySelection={selectedIds.size > 0}
                  onToggleSelect={handleToggleSelect}
                  onSelectAll={handleSelectAll}
                  onOpenFolder={handleNavigateToFolder}
                  onSelectDocument={handleSelectDocument}
                  onOpenDocument={handleOpenDocument}
                  onRenameItem={handleRenameItem}
                  onDeleteItem={handleDeleteItem}
                  onMoveItem={handleMoveItem}
                  onToggleFavorite={handleToggleFavoriteItem}
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
                  isSavingContent={isSaving}
                  onClose={handleClosePreview}
                  onFullscreen={handleFullscreenEdit}
                  onSave={handleInlineSaveDocument}
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
        avatarName={avatarName}
        avatarSelfie={avatarSelfie}
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
        uploads={uploads}
        onClose={handleCloseUploadModal}
        onUpload={handleUploadFiles}
        onCancelUpload={cancelUpload}
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
        bulkCount={selectedIds.size > 0 ? selectedIds.size : 1}
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
        bulkCount={selectedIds.size > 0 ? selectedIds.size : 1}
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

      {/* Selection Toolbar */}
      <SelectionToolbar
        visible={selectedIds.size > 0}
        selectedCount={selectedIds.size}
        hasDocumentsSelected={hasDocumentsSelected}
        onDelete={handleBulkDelete}
        onMove={handleBulkMove}
        onToggleFavorite={hasDocumentsSelected ? handleBulkToggleFavorite : undefined}
        onClearSelection={handleClearSelection}
      />
    </div>
  );
}

export default MyEasyDocs;
