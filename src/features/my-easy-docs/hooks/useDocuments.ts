// =============================================
// MyEasyDocs - useDocuments Hook
// =============================================

import { useState, useCallback, useEffect } from 'react';
import { DocumentService } from '../services';
import type { DocsDocument, DocsDocumentFormData, DocsContent } from '../types';

interface UseDocumentsOptions {
  /** Filter by folder ID (null = root, undefined = all) */
  folderId?: string | null;
  /** Only load favorites */
  favoritesOnly?: boolean;
  /** Only load recent documents */
  recentOnly?: boolean;
  /** Limit for recent documents */
  recentLimit?: number;
}

interface UseDocumentsReturn {
  /** Documents list */
  documents: DocsDocument[];
  /** Selected document */
  selectedDocument: DocsDocument | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Total count */
  totalCount: number;
  /** Refresh documents */
  refresh: () => Promise<void>;
  /** Select a document */
  selectDocument: (document: DocsDocument | null) => void;
  /** Create a new document record (after upload) */
  createDocument: (data: {
    folder_id?: string | null;
    name: string;
    original_name: string;
    mime_type: string;
    size: number;
    r2_key: string;
    r2_url?: string;
  }) => Promise<DocsDocument>;
  /** Create an empty text file */
  createEmptyFile: (
    name: string,
    extension: '.txt' | '.md',
    folderId?: string | null
  ) => Promise<DocsDocument>;
  /** Rename a document */
  renameDocument: (id: string, newName: string) => Promise<DocsDocument>;
  /** Move a document to another folder */
  moveDocument: (id: string, newFolderId: string | null) => Promise<DocsDocument>;
  /** Toggle favorite status */
  toggleFavorite: (id: string) => Promise<DocsDocument>;
  /** Delete a document */
  deleteDocument: (id: string) => Promise<void>;
  /** Get document text content */
  getContent: (id: string) => Promise<string | null>;
  /** Save document text content */
  saveContent: (id: string, content: string) => Promise<void>;
}

export function useDocuments(options?: UseDocumentsOptions): UseDocumentsReturn {
  const [documents, setDocuments] = useState<DocsDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocsDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const { folderId, favoritesOnly, recentOnly, recentLimit = 10 } = options || {};

  // Fetch documents based on options
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let data: DocsDocument[];

      if (favoritesOnly) {
        data = await DocumentService.getFavorites();
      } else if (recentOnly) {
        data = await DocumentService.getRecent(recentLimit);
      } else if (folderId !== undefined) {
        data = await DocumentService.getByFolder(folderId);
      } else {
        data = await DocumentService.getAll();
      }

      setDocuments(data);
      setTotalCount(data.length);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load documents';
      setError(message);
      console.error('[useDocuments] Error fetching documents:', err);
    } finally {
      setIsLoading(false);
    }
  }, [folderId, favoritesOnly, recentOnly, recentLimit]);

  // Initial fetch and refetch on options change
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Select document
  const selectDocument = useCallback((document: DocsDocument | null) => {
    setSelectedDocument(document);
  }, []);

  // Create document record
  const createDocument = useCallback(
    async (data: {
      folder_id?: string | null;
      name: string;
      original_name: string;
      mime_type: string;
      size: number;
      r2_key: string;
      r2_url?: string;
    }): Promise<DocsDocument> => {
      const document = await DocumentService.create(data);
      setDocuments((prev) => [document, ...prev]);
      setTotalCount((prev) => prev + 1);
      return document;
    },
    []
  );

  // Create empty file
  const createEmptyFile = useCallback(
    async (
      name: string,
      extension: '.txt' | '.md',
      targetFolderId?: string | null
    ): Promise<DocsDocument> => {
      const effectiveFolderId = targetFolderId !== undefined ? targetFolderId : folderId;
      const document = await DocumentService.createEmpty(name, extension, effectiveFolderId);
      setDocuments((prev) => [document, ...prev]);
      setTotalCount((prev) => prev + 1);
      return document;
    },
    [folderId]
  );

  // Rename document
  const renameDocument = useCallback(
    async (id: string, newName: string): Promise<DocsDocument> => {
      const updated = await DocumentService.rename(id, newName);
      setDocuments((prev) => prev.map((d) => (d.id === id ? updated : d)));

      // Update selected if it's the renamed one
      if (selectedDocument?.id === id) {
        setSelectedDocument(updated);
      }

      return updated;
    },
    [selectedDocument]
  );

  // Move document
  const moveDocument = useCallback(
    async (id: string, newFolderId: string | null): Promise<DocsDocument> => {
      const updated = await DocumentService.move(id, newFolderId);

      // If filtering by folder, remove from list if moved out
      if (folderId !== undefined && updated.folder_id !== folderId) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        setTotalCount((prev) => prev - 1);

        // Deselect if moved out
        if (selectedDocument?.id === id) {
          setSelectedDocument(null);
        }
      } else {
        setDocuments((prev) => prev.map((d) => (d.id === id ? updated : d)));

        if (selectedDocument?.id === id) {
          setSelectedDocument(updated);
        }
      }

      return updated;
    },
    [folderId, selectedDocument]
  );

  // Toggle favorite
  const toggleFavorite = useCallback(
    async (id: string): Promise<DocsDocument> => {
      const updated = await DocumentService.toggleFavorite(id);
      setDocuments((prev) => prev.map((d) => (d.id === id ? updated : d)));

      // If filtering by favorites and unfavorited, remove from list
      if (favoritesOnly && !updated.is_favorite) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        setTotalCount((prev) => prev - 1);

        if (selectedDocument?.id === id) {
          setSelectedDocument(null);
        }
      }

      if (selectedDocument?.id === id) {
        setSelectedDocument(updated);
      }

      return updated;
    },
    [favoritesOnly, selectedDocument]
  );

  // Delete document
  const deleteDocument = useCallback(
    async (id: string): Promise<void> => {
      await DocumentService.delete(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      setTotalCount((prev) => prev - 1);

      // Deselect if deleted
      if (selectedDocument?.id === id) {
        setSelectedDocument(null);
      }
    },
    [selectedDocument]
  );

  // Get content
  const getContent = useCallback(async (id: string): Promise<string | null> => {
    return DocumentService.getTextContent(id);
  }, []);

  // Save content
  const saveContent = useCallback(async (id: string, content: string): Promise<void> => {
    await DocumentService.saveContent(id, content);

    // Update the document in the list (size might have changed)
    const updated = await DocumentService.getById(id);
    if (updated) {
      setDocuments((prev) => prev.map((d) => (d.id === id ? updated : d)));

      if (selectedDocument?.id === id) {
        setSelectedDocument(updated);
      }
    }
  }, [selectedDocument]);

  return {
    documents,
    selectedDocument,
    isLoading,
    error,
    totalCount,
    refresh: fetchDocuments,
    selectDocument,
    createDocument,
    createEmptyFile,
    renameDocument,
    moveDocument,
    toggleFavorite,
    deleteDocument,
    getContent,
    saveContent,
  };
}

// Hook for a single document
interface UseDocumentReturn {
  document: DocsDocument | null;
  content: DocsContent | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadContent: () => Promise<void>;
  saveContent: (content: string) => Promise<void>;
}

export function useDocument(id: string | null): UseDocumentReturn {
  const [document, setDocument] = useState<DocsDocument | null>(null);
  const [content, setContent] = useState<DocsContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocument = useCallback(async () => {
    if (!id) {
      setDocument(null);
      setContent(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await DocumentService.getById(id);
      setDocument(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load document';
      setError(message);
      console.error('[useDocument] Error fetching document:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  const loadContent = useCallback(async () => {
    if (!id) return;

    try {
      const data = await DocumentService.getContent(id);
      setContent(data);
    } catch (err) {
      console.error('[useDocument] Error loading content:', err);
    }
  }, [id]);

  const saveContent = useCallback(
    async (newContent: string): Promise<void> => {
      if (!id) throw new Error('Document ID not provided');

      await DocumentService.saveContent(id, newContent);

      // Refresh document to get updated metadata
      const updated = await DocumentService.getById(id);
      if (updated) {
        setDocument(updated);
      }

      // Refresh content
      await loadContent();
    },
    [id, loadContent]
  );

  return {
    document,
    content,
    isLoading,
    error,
    refresh: fetchDocument,
    loadContent,
    saveContent,
  };
}
