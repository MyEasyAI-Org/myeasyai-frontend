// =============================================
// MyEasyDocs - useFolders Hook
// =============================================

import { useState, useCallback, useEffect } from 'react';
import { FolderService } from '../services';
import type { DocsFolder, BreadcrumbItem } from '../types';

interface UseFoldersReturn {
  /** All folders for the user */
  folders: DocsFolder[];
  /** Current folder ID (null = root) */
  currentFolderId: string | null;
  /** Current folder object (null = root) */
  currentFolder: DocsFolder | null;
  /** Breadcrumb path from root to current folder */
  currentPath: BreadcrumbItem[];
  /** Folders in the current folder */
  childFolders: DocsFolder[];
  /** Loading state */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Refresh all folders */
  refresh: () => Promise<void>;
  /** Navigate to a folder */
  navigateTo: (folderId: string | null) => Promise<void>;
  /** Create a new folder */
  createFolder: (name: string, parentId?: string | null) => Promise<DocsFolder>;
  /** Rename a folder */
  renameFolder: (id: string, newName: string) => Promise<DocsFolder>;
  /** Move a folder to another parent */
  moveFolder: (id: string, newParentId: string | null) => Promise<DocsFolder>;
  /** Delete a folder (returns deleted folder IDs for cascade cleanup) */
  deleteFolder: (id: string) => Promise<string[]>;
}

export function useFolders(): UseFoldersReturn {
  const [folders, setFolders] = useState<DocsFolder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<DocsFolder | null>(null);
  const [currentPath, setCurrentPath] = useState<BreadcrumbItem[]>([
    { id: null, name: 'Meus Documentos' },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all folders
  const fetchFolders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await FolderService.getAll();
      setFolders(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load folders';
      setError(message);
      console.error('[useFolders] Error fetching folders:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  // Update current folder when ID changes
  useEffect(() => {
    if (currentFolderId === null) {
      setCurrentFolder(null);
    } else {
      const folder = folders.find((f) => f.id === currentFolderId);
      setCurrentFolder(folder || null);
    }
  }, [currentFolderId, folders]);

  // Compute child folders of current folder
  const childFolders = folders.filter((f) => f.parent_id === currentFolderId);

  // Navigate to a folder
  const navigateTo = useCallback(
    async (folderId: string | null) => {
      setCurrentFolderId(folderId);

      // Update breadcrumb path
      try {
        const path = await FolderService.getPath(folderId);
        setCurrentPath(path);
      } catch (err) {
        console.error('[useFolders] Error getting path:', err);
        // Fallback to root
        setCurrentPath([{ id: null, name: 'Meus Documentos' }]);
      }
    },
    []
  );

  // Create folder
  const createFolder = useCallback(
    async (name: string, parentId?: string | null): Promise<DocsFolder> => {
      const effectiveParentId = parentId !== undefined ? parentId : currentFolderId;
      const folder = await FolderService.create(name, effectiveParentId);
      setFolders((prev) => [...prev, folder]);
      return folder;
    },
    [currentFolderId]
  );

  // Rename folder
  const renameFolder = useCallback(
    async (id: string, newName: string): Promise<DocsFolder> => {
      const updated = await FolderService.rename(id, newName);
      setFolders((prev) => prev.map((f) => (f.id === id ? updated : f)));

      // Update current path if renamed folder is in it
      setCurrentPath((prev) =>
        prev.map((item) => (item.id === id ? { ...item, name: newName } : item))
      );

      return updated;
    },
    []
  );

  // Move folder
  const moveFolder = useCallback(
    async (id: string, newParentId: string | null): Promise<DocsFolder> => {
      const updated = await FolderService.move(id, newParentId);
      setFolders((prev) => prev.map((f) => (f.id === id ? updated : f)));
      return updated;
    },
    []
  );

  // Delete folder (returns deleted folder IDs for cascade cleanup)
  const deleteFolder = useCallback(
    async (id: string): Promise<string[]> => {
      // Get descendant IDs before deleting
      const descendantIds = await FolderService.getDescendantIds(id);
      const idsToRemove = [id, ...descendantIds];

      await FolderService.delete(id);

      // Remove folder and all descendants from state
      const idsToRemoveSet = new Set(idsToRemove);
      setFolders((prev) => prev.filter((f) => !idsToRemoveSet.has(f.id)));

      // If we're inside the deleted folder, navigate to root
      if (currentFolderId === id || descendantIds.includes(currentFolderId || '')) {
        await navigateTo(null);
      }

      return idsToRemove;
    },
    [currentFolderId, navigateTo]
  );

  return {
    folders,
    currentFolderId,
    currentFolder,
    currentPath,
    childFolders,
    isLoading,
    error,
    refresh: fetchFolders,
    navigateTo,
    createFolder,
    renameFolder,
    moveFolder,
    deleteFolder,
  };
}

// Hook for a single folder
interface UseFolderReturn {
  folder: DocsFolder | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useFolder(id: string | null): UseFolderReturn {
  const [folder, setFolder] = useState<DocsFolder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFolder = useCallback(async () => {
    if (!id) {
      setFolder(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await FolderService.getById(id);
      setFolder(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load folder';
      setError(message);
      console.error('[useFolder] Error fetching folder:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFolder();
  }, [fetchFolder]);

  return {
    folder,
    isLoading,
    error,
    refresh: fetchFolder,
  };
}
