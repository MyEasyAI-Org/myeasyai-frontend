// =============================================
// MyEasyDocs - Document Service
// Using Cloudflare D1 via d1Client + R2 via cloudflareClient
// =============================================

import { d1Client, type D1DocsDocument, type D1DocsContent } from '../../../lib/api-clients/d1-client';
import { cloudflareClient } from '../../../lib/api-clients/cloudflare-client';
import { authService } from '../../../services/AuthServiceV2';
import type { DocsDocument, DocsContent, TextExtractionStatus } from '../types';
import { generateId, generateR2Key } from '../utils';

/**
 * Gets the current authenticated user ID.
 */
async function getCurrentUserId(): Promise<string> {
  await authService.waitForInit();
  const authUser = authService.getUser();

  if (authUser?.uuid) {
    return authUser.uuid;
  }

  throw new Error('[DocumentService] User not authenticated');
}

/** Helper to convert null to undefined */
function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

/**
 * Converts D1 document to frontend DocsDocument type
 */
function mapD1ToDocument(d1Doc: D1DocsDocument): DocsDocument {
  return {
    id: d1Doc.id,
    user_id: d1Doc.user_id,
    folder_id: d1Doc.folder_id,
    name: d1Doc.name,
    original_name: d1Doc.original_name,
    mime_type: d1Doc.mime_type,
    size: d1Doc.size,
    r2_key: d1Doc.r2_key,
    r2_url: nullToUndefined(d1Doc.r2_url),
    text_extraction_status: d1Doc.text_extraction_status,
    is_favorite: d1Doc.is_favorite,
    created_at: d1Doc.created_at,
    updated_at: d1Doc.updated_at ?? new Date().toISOString(),
  };
}

/**
 * Converts D1 content to frontend DocsContent type
 */
function mapD1ToContent(d1Content: D1DocsContent): DocsContent {
  return {
    id: d1Content.id,
    document_id: d1Content.document_id,
    user_id: d1Content.user_id,
    text_content: d1Content.text_content,
    chunks_count: d1Content.chunks_count,
    created_at: d1Content.created_at,
  };
}

/**
 * Data for creating a new document
 */
export interface CreateDocumentData {
  folder_id?: string | null;
  name: string;
  original_name: string;
  mime_type: string;
  size: number;
  r2_key: string;
  r2_url?: string;
}

/**
 * Data for updating a document
 */
export interface UpdateDocumentData {
  name?: string;
  folder_id?: string | null;
  r2_url?: string;
  text_extraction_status?: TextExtractionStatus;
  is_favorite?: boolean;
}

export const DocumentService = {
  /**
   * Lista todos os documentos do usuário
   */
  async getAll(): Promise<DocsDocument[]> {
    const userId = await getCurrentUserId();
    const result = await d1Client.getDocsDocuments(userId);

    if (result.error) {
      console.error('[DocumentService] Error fetching documents:', result.error);
      throw new Error('Failed to fetch documents');
    }

    return (result.data || []).map(mapD1ToDocument);
  },

  /**
   * Lista documentos de uma pasta
   * @param folderId - ID da pasta (null para root)
   */
  async getByFolder(folderId: string | null): Promise<DocsDocument[]> {
    const userId = await getCurrentUserId();
    const result = await d1Client.getDocsDocuments(userId, {
      folder_id: folderId,
    });

    if (result.error) {
      console.error('[DocumentService] Error fetching folder documents:', result.error);
      throw new Error('Failed to fetch folder documents');
    }

    return (result.data || []).map(mapD1ToDocument);
  },

  /**
   * Busca documento por ID
   */
  async getById(id: string): Promise<DocsDocument | null> {
    const result = await d1Client.getDocsDocumentById(id);

    if (result.error) {
      if (result.error.includes('not found')) {
        return null;
      }
      console.error('[DocumentService] Error fetching document:', result.error);
      throw new Error('Failed to fetch document');
    }

    return result.data ? mapD1ToDocument(result.data) : null;
  },

  /**
   * Lista documentos recentes
   * @param limit - Número máximo de documentos (default: 10)
   */
  async getRecent(limit = 10): Promise<DocsDocument[]> {
    const userId = await getCurrentUserId();
    const result = await d1Client.getRecentDocsDocuments(userId, limit);

    if (result.error) {
      console.error('[DocumentService] Error fetching recent documents:', result.error);
      throw new Error('Failed to fetch recent documents');
    }

    return (result.data || []).map(mapD1ToDocument);
  },

  /**
   * Lista documentos favoritos
   */
  async getFavorites(): Promise<DocsDocument[]> {
    const userId = await getCurrentUserId();
    const result = await d1Client.getFavoriteDocsDocuments(userId);

    if (result.error) {
      console.error('[DocumentService] Error fetching favorites:', result.error);
      throw new Error('Failed to fetch favorite documents');
    }

    return (result.data || []).map(mapD1ToDocument);
  },

  /**
   * Cria um novo registro de documento
   * Usado após upload para R2 bem-sucedido
   */
  async create(data: CreateDocumentData): Promise<DocsDocument> {
    const userId = await getCurrentUserId();

    const result = await d1Client.createDocsDocument({
      user_id: userId,
      folder_id: data.folder_id ?? null,
      name: data.name,
      original_name: data.original_name,
      mime_type: data.mime_type,
      size: data.size,
      r2_key: data.r2_key,
      r2_url: data.r2_url,
    });

    if (result.error || !result.data) {
      console.error('[DocumentService] Error creating document:', result.error);
      throw new Error('Failed to create document');
    }

    return mapD1ToDocument(result.data);
  },

  /**
   * Cria um arquivo de texto vazio (.txt ou .md)
   * @param name - Nome do arquivo (sem extensão)
   * @param extension - Extensão do arquivo (.txt ou .md)
   * @param folderId - ID da pasta (opcional)
   */
  async createEmpty(
    name: string,
    extension: '.txt' | '.md',
    folderId?: string | null
  ): Promise<DocsDocument> {
    const userId = await getCurrentUserId();
    const fileName = `${name.trim()}${extension}`;
    const mimeType = extension === '.md' ? 'text/markdown' : 'text/plain';

    // Generate document ID and R2 key
    const documentId = generateId();
    const r2Key = generateR2Key(userId, documentId, fileName);

    // Upload empty content to R2
    try {
      await cloudflareClient.uploadFile(r2Key, '', mimeType);
    } catch (error) {
      console.error('[DocumentService] Failed to upload empty file:', error);
      throw new Error('Failed to create file in storage');
    }

    // Create document record
    const result = await d1Client.createDocsDocument({
      user_id: userId,
      folder_id: folderId ?? null,
      name: fileName,
      original_name: fileName,
      mime_type: mimeType,
      size: 0,
      r2_key: r2Key,
    });

    if (result.error || !result.data) {
      // Cleanup R2 on failure
      try {
        await cloudflareClient.deleteFile(r2Key);
      } catch (e) {
        console.warn('[DocumentService] Failed to cleanup R2 after error:', e);
      }
      console.error('[DocumentService] Error creating empty document:', result.error);
      throw new Error('Failed to create document');
    }

    // Create empty content record
    await d1Client.createDocsContent({
      document_id: result.data.id,
      user_id: userId,
      text_content: '',
      chunks_count: 0,
    });

    // Mark as completed since it's empty text
    await d1Client.updateDocsDocument(result.data.id, {
      text_extraction_status: 'completed',
    });

    return mapD1ToDocument({
      ...result.data,
      text_extraction_status: 'completed',
    });
  },

  /**
   * Atualiza metadados de um documento
   */
  async update(id: string, data: UpdateDocumentData): Promise<DocsDocument> {
    const updates: Parameters<typeof d1Client.updateDocsDocument>[1] = {};

    if (data.name !== undefined) updates.name = data.name;
    if (data.folder_id !== undefined) updates.folder_id = data.folder_id;
    if (data.r2_url !== undefined) updates.r2_url = data.r2_url;
    if (data.text_extraction_status !== undefined) {
      updates.text_extraction_status = data.text_extraction_status;
    }
    if (data.is_favorite !== undefined) updates.is_favorite = data.is_favorite;

    const result = await d1Client.updateDocsDocument(id, updates);

    if (result.error || !result.data) {
      console.error('[DocumentService] Error updating document:', result.error);
      throw new Error('Failed to update document');
    }

    return mapD1ToDocument(result.data);
  },

  /**
   * Move documento para outra pasta
   */
  async move(id: string, newFolderId: string | null): Promise<DocsDocument> {
    return this.update(id, { folder_id: newFolderId });
  },

  /**
   * Renomeia um documento
   */
  async rename(id: string, newName: string): Promise<DocsDocument> {
    return this.update(id, { name: newName.trim() });
  },

  /**
   * Alterna status de favorito
   */
  async toggleFavorite(id: string): Promise<DocsDocument> {
    const result = await d1Client.toggleDocsDocumentFavorite(id);

    if (result.error || !result.data) {
      console.error('[DocumentService] Error toggling favorite:', result.error);
      throw new Error('Failed to toggle favorite');
    }

    return mapD1ToDocument(result.data);
  },

  /**
   * Deleta documento do D1 e R2
   */
  async delete(id: string): Promise<void> {
    // Get document to get R2 key
    const document = await this.getById(id);
    if (!document) {
      throw new Error('Document not found');
    }

    // Delete from D1 (this also deletes content and chunks via cascade)
    const result = await d1Client.deleteDocsDocument(id);

    if (result.error) {
      console.error('[DocumentService] Error deleting document from D1:', result.error);
      throw new Error('Failed to delete document');
    }

    // Delete from R2
    try {
      await cloudflareClient.deleteFile(document.r2_key);
    } catch (error) {
      // Log but don't fail - the D1 record is already deleted
      console.warn('[DocumentService] Failed to delete from R2:', error);
    }
  },

  /**
   * Obtém o conteúdo de texto de um documento
   * @returns Conteúdo de texto ou null se não disponível
   */
  async getContent(id: string): Promise<DocsContent | null> {
    const result = await d1Client.getDocsContent(id);

    if (result.error) {
      console.error('[DocumentService] Error fetching content:', result.error);
      throw new Error('Failed to fetch document content');
    }

    return result.data ? mapD1ToContent(result.data) : null;
  },

  /**
   * Obtém apenas o texto do conteúdo de um documento
   * @returns Texto ou null se não disponível
   */
  async getTextContent(id: string): Promise<string | null> {
    const content = await this.getContent(id);
    return content?.text_content ?? null;
  },

  /**
   * Salva conteúdo de texto de um documento
   * Usado para editar arquivos .txt e .md
   */
  async saveContent(id: string, content: string): Promise<void> {
    const userId = await getCurrentUserId();
    const document = await this.getById(id);

    if (!document) {
      throw new Error('Document not found');
    }

    // Upload new content to R2
    try {
      await cloudflareClient.uploadFile(
        document.r2_key,
        content,
        document.mime_type
      );
    } catch (error) {
      console.error('[DocumentService] Failed to save content to R2:', error);
      throw new Error('Failed to save document content');
    }

    // Calculate new size
    const newSize = new Blob([content]).size;

    // Delete existing content and chunks
    await d1Client.deleteDocsContent(id);
    await d1Client.deleteDocsChunks(id);

    // Create new content record
    await d1Client.createDocsContent({
      document_id: id,
      user_id: userId,
      text_content: content,
      chunks_count: 0, // Will be updated by text extraction service if needed
    });

    // Update document size
    await d1Client.updateDocsDocument(id, {
      text_extraction_status: 'completed',
    });
  },

  /**
   * Conta total de documentos do usuário
   */
  async count(): Promise<number> {
    const userId = await getCurrentUserId();
    const result = await d1Client.getDocsStats(userId);

    if (result.error) {
      console.error('[DocumentService] Error getting stats:', result.error);
      throw new Error('Failed to count documents');
    }

    return result.data?.total_documents || 0;
  },

  /**
   * Obtém estatísticas dos documentos do usuário
   */
  async getStats(): Promise<{
    total_documents: number;
    total_folders: number;
    total_size: number;
    documents_by_type: Record<string, number>;
    extraction_status: Record<string, number>;
  }> {
    const userId = await getCurrentUserId();
    const result = await d1Client.getDocsStats(userId);

    if (result.error) {
      console.error('[DocumentService] Error getting stats:', result.error);
      throw new Error('Failed to get document stats');
    }

    return result.data || {
      total_documents: 0,
      total_folders: 0,
      total_size: 0,
      documents_by_type: {},
      extraction_status: {},
    };
  },
};
