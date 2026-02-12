// =============================================
// MyEasyDocs - Folder Service
// Using Cloudflare D1 via d1Client
// =============================================

import { d1Client, type D1DocsFolder } from '../../../lib/api-clients/d1-client';
import { authService } from '../../../services/AuthServiceV2';
import type { DocsFolder, BreadcrumbItem } from '../types';

/**
 * Gets the current authenticated user ID.
 * Works with both Cloudflare and Supabase auth sources.
 */
async function getCurrentUserId(): Promise<string> {
  await authService.waitForInit();
  const authUser = authService.getUser();

  if (authUser?.uuid) {
    return authUser.uuid;
  }

  throw new Error('[FolderService] User not authenticated');
}

/**
 * Converts D1 folder to frontend DocsFolder type
 */
function mapD1ToFolder(d1Folder: D1DocsFolder): DocsFolder {
  return {
    id: d1Folder.id,
    user_id: d1Folder.user_id,
    parent_id: d1Folder.parent_id,
    name: d1Folder.name,
    path: d1Folder.path,
    created_at: d1Folder.created_at,
    updated_at: d1Folder.updated_at ?? new Date().toISOString(),
  };
}

export const FolderService = {
  /**
   * Lista todas as pastas do usuário
   */
  async getAll(): Promise<DocsFolder[]> {
    const userId = await getCurrentUserId();
    const result = await d1Client.getDocsFolders(userId);

    if (result.error) {
      console.error('[FolderService] Error fetching folders:', result.error);
      throw new Error('Failed to fetch folders');
    }

    return (result.data || []).map(mapD1ToFolder);
  },

  /**
   * Busca pasta por ID
   */
  async getById(id: string): Promise<DocsFolder | null> {
    const result = await d1Client.getDocsFolderById(id);

    if (result.error) {
      if (result.error.includes('not found')) {
        return null;
      }
      console.error('[FolderService] Error fetching folder:', result.error);
      throw new Error('Failed to fetch folder');
    }

    return result.data ? mapD1ToFolder(result.data) : null;
  },

  /**
   * Lista pastas filhas de uma pasta
   * @param parentId - ID da pasta pai (null para root)
   */
  async getByParent(parentId: string | null): Promise<DocsFolder[]> {
    const userId = await getCurrentUserId();
    const result = await d1Client.getDocsFoldersByParent(userId, parentId);

    if (result.error) {
      console.error('[FolderService] Error fetching child folders:', result.error);
      throw new Error('Failed to fetch child folders');
    }

    return (result.data || []).map(mapD1ToFolder);
  },

  /**
   * Constrói o caminho completo para uma pasta
   * @param name - Nome da pasta
   * @param parentId - ID da pasta pai
   */
  async buildFolderPath(name: string, parentId: string | null): Promise<string> {
    if (!parentId) {
      return `/${name}`;
    }

    const parent = await this.getById(parentId);
    if (!parent) {
      throw new Error('Parent folder not found');
    }

    return `${parent.path}/${name}`;
  },

  /**
   * Cria uma nova pasta
   * @param name - Nome da pasta
   * @param parentId - ID da pasta pai (opcional, null para root)
   */
  async create(name: string, parentId?: string | null): Promise<DocsFolder> {
    const userId = await getCurrentUserId();
    const normalizedParentId = parentId ?? null;
    const path = await this.buildFolderPath(name.trim(), normalizedParentId);

    const result = await d1Client.createDocsFolder({
      user_id: userId,
      name: name.trim(),
      parent_id: normalizedParentId,
      path,
    });

    if (result.error || !result.data) {
      console.error('[FolderService] Error creating folder:', result.error);
      throw new Error('Failed to create folder');
    }

    return mapD1ToFolder(result.data);
  },

  /**
   * Renomeia uma pasta
   * @param id - ID da pasta
   * @param newName - Novo nome
   */
  async rename(id: string, newName: string): Promise<DocsFolder> {
    // Get current folder to rebuild path
    const folder = await this.getById(id);
    if (!folder) {
      throw new Error('Folder not found');
    }

    // Rebuild path with new name
    const newPath = await this.buildFolderPath(newName.trim(), folder.parent_id);

    const result = await d1Client.updateDocsFolder(id, {
      name: newName.trim(),
      path: newPath,
    });

    if (result.error || !result.data) {
      console.error('[FolderService] Error renaming folder:', result.error);
      throw new Error('Failed to rename folder');
    }

    return mapD1ToFolder(result.data);
  },

  /**
   * Move uma pasta para outra pasta pai
   * @param id - ID da pasta a mover
   * @param newParentId - ID da nova pasta pai (null para root)
   */
  async move(id: string, newParentId: string | null): Promise<DocsFolder> {
    // Get current folder
    const folder = await this.getById(id);
    if (!folder) {
      throw new Error('Folder not found');
    }

    // Prevent moving to self
    if (newParentId === id) {
      throw new Error('Cannot move folder into itself');
    }

    // Prevent moving to a descendant (would create circular reference)
    if (newParentId) {
      const descendants = await this.getDescendantIds(id);
      if (descendants.includes(newParentId)) {
        throw new Error('Cannot move folder into its descendant');
      }
    }

    // Rebuild path in new location
    const newPath = await this.buildFolderPath(folder.name, newParentId);

    const result = await d1Client.updateDocsFolder(id, {
      parent_id: newParentId,
      path: newPath,
    });

    if (result.error || !result.data) {
      console.error('[FolderService] Error moving folder:', result.error);
      throw new Error('Failed to move folder');
    }

    return mapD1ToFolder(result.data);
  },

  /**
   * Deleta uma pasta e todo seu conteúdo
   * @param id - ID da pasta
   */
  async delete(id: string): Promise<void> {
    const result = await d1Client.deleteDocsFolder(id);

    if (result.error) {
      console.error('[FolderService] Error deleting folder:', result.error);
      throw new Error('Failed to delete folder');
    }
  },

  /**
   * Retorna o caminho de breadcrumb da root até a pasta especificada
   * @param folderId - ID da pasta (null para root)
   * @returns Array de BreadcrumbItem do root até a pasta atual
   */
  async getPath(folderId: string | null): Promise<BreadcrumbItem[]> {
    const path: BreadcrumbItem[] = [
      { id: null, name: 'Meus Documentos' },
    ];

    if (!folderId) {
      return path;
    }

    // Build path by traversing up
    const visited = new Set<string>();
    let currentId: string | null = folderId;
    const ancestors: BreadcrumbItem[] = [];

    while (currentId) {
      if (visited.has(currentId)) {
        console.warn('[FolderService] Circular reference detected in folder hierarchy');
        break;
      }
      visited.add(currentId);

      const folder = await this.getById(currentId);
      if (!folder) break;

      ancestors.unshift({ id: folder.id, name: folder.name });
      currentId = folder.parent_id;
    }

    return [...path, ...ancestors];
  },

  /**
   * Retorna todos os IDs de subpastas de uma pasta (recursivo)
   * @param folderId - ID da pasta pai
   */
  async getDescendantIds(folderId: string): Promise<string[]> {
    const allFolders = await this.getAll();
    const descendants: string[] = [];

    const collectDescendants = (parentId: string) => {
      const children = allFolders.filter(f => f.parent_id === parentId);
      for (const child of children) {
        descendants.push(child.id);
        collectDescendants(child.id);
      }
    };

    collectDescendants(folderId);
    return descendants;
  },

  /**
   * Conta total de pastas do usuário
   */
  async count(): Promise<number> {
    const userId = await getCurrentUserId();
    const result = await d1Client.getDocsStats(userId);

    if (result.error) {
      console.error('[FolderService] Error getting stats:', result.error);
      throw new Error('Failed to count folders');
    }

    return result.data?.total_folders || 0;
  },
};
