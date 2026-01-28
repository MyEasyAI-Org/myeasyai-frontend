// =============================================
// MyEasyDocs - Upload Service
// Handles file upload to Cloudflare R2
// =============================================

import { cloudflareClient } from '../../../lib/api-clients/cloudflare-client';
import { authService } from '../../../services/AuthServiceV2';
import { MAX_FILE_SIZE, MAX_FILE_SIZE_MB } from '../constants';
import { generateId, getFileExtension } from '../utils';

/**
 * Gets the current authenticated user ID.
 */
async function getCurrentUserId(): Promise<string> {
  await authService.waitForInit();
  const authUser = authService.getUser();

  if (authUser?.uuid) {
    return authUser.uuid;
  }

  throw new Error('[UploadService] User not authenticated');
}

/**
 * Result of file validation
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Callback for upload progress updates
 */
export type ProgressCallback = (progress: number) => void;

/**
 * Result of a processed upload
 */
export interface ProcessedUploadResult {
  documentId: string;
  r2Key: string;
}

export const UploadService = {
  /**
   * Valida um arquivo antes do upload
   * @param file - Arquivo a validar
   * @returns Resultado da validação
   */
  validateFile(file: File): FileValidationResult {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `Arquivo muito grande. O limite é ${MAX_FILE_SIZE_MB}MB.`,
      };
    }

    // Check if file has a name
    if (!file.name || file.name.trim() === '') {
      return {
        valid: false,
        error: 'Nome de arquivo inválido.',
      };
    }

    // Check for empty file
    if (file.size === 0) {
      return {
        valid: false,
        error: 'O arquivo está vazio.',
      };
    }

    // File is valid
    return { valid: true };
  },

  /**
   * Gera a chave R2 para armazenamento do arquivo
   * Formato: docs/{userId}/{documentId}{extension}
   * @param documentId - ID do documento
   * @param filename - Nome original do arquivo
   */
  async generateR2Key(documentId: string, filename: string): Promise<string> {
    const userId = await getCurrentUserId();
    const ext = getFileExtension(filename);
    return `docs/${userId}/${documentId}${ext}`;
  },

  /**
   * Faz upload de um arquivo para o R2
   * @param file - Arquivo a enviar
   * @param r2Key - Chave R2 gerada
   * @param onProgress - Callback de progresso (opcional)
   * @returns URL ou chave R2 do arquivo
   */
  async uploadToR2(
    file: File,
    r2Key: string,
    onProgress?: ProgressCallback
  ): Promise<string> {
    // Start progress
    onProgress?.(0);

    try {
      await cloudflareClient.uploadFile(r2Key, file, file.type);
      onProgress?.(100);

      // Return the R2 key
      return r2Key;
    } catch (error) {
      console.error('[UploadService] Upload failed:', error);
      throw new Error('Failed to upload file to storage');
    }
  },

  /**
   * Faz upload com suporte a progresso real usando XMLHttpRequest
   * @param file - Arquivo a enviar
   * @param r2Key - Chave R2 gerada
   * @param onProgress - Callback de progresso
   */
  async uploadToR2WithProgress(
    file: File,
    r2Key: string,
    onProgress: ProgressCallback
  ): Promise<string> {
    const uploadWorkerUrl = import.meta.env.VITE_CLOUDFLARE_UPLOAD_WORKER;

    if (!uploadWorkerUrl) {
      // Fallback to basic upload without real progress
      return this.uploadToR2(file, r2Key, onProgress);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(r2Key);
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was cancelled'));
      });

      xhr.open('PUT', uploadWorkerUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.setRequestHeader('X-File-Path', r2Key);
      xhr.send(file);
    });
  },

  /**
   * Constrói a URL pública de download para um arquivo
   * @param r2Key - Chave R2 do arquivo
   */
  getDownloadUrl(r2Key: string): string {
    const r2Domain = import.meta.env.VITE_R2_PUBLIC_DOMAIN;

    if (r2Domain) {
      return `${r2Domain}/${r2Key}`;
    }

    // Fallback - return key as path
    console.warn('[UploadService] R2 public domain not configured');
    return r2Key;
  },

  /**
   * Cria um ID único para um novo documento
   */
  generateDocumentId(): string {
    return generateId();
  },

  /**
   * Processo completo de upload: validar, gerar key, upload
   * @param file - Arquivo a processar
   * @param onProgress - Callback de progresso (opcional)
   * @returns Object with documentId and r2Key
   */
  async processUpload(
    file: File,
    onProgress?: ProgressCallback
  ): Promise<ProcessedUploadResult> {
    // Validate
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Generate IDs
    const documentId = this.generateDocumentId();
    const r2Key = await this.generateR2Key(documentId, file.name);

    // Upload
    if (onProgress) {
      await this.uploadToR2WithProgress(file, r2Key, onProgress);
    } else {
      await this.uploadToR2(file, r2Key);
    }

    return { documentId, r2Key };
  },

  /**
   * Deleta um arquivo do R2
   * @param r2Key - Chave R2 do arquivo
   */
  async deleteFromR2(r2Key: string): Promise<void> {
    try {
      await cloudflareClient.deleteFile(r2Key);
    } catch (error) {
      console.warn('[UploadService] Failed to delete from R2:', error);
      // Don't throw - R2 deletion failures shouldn't block other operations
    }
  },

  /**
   * Upload de conteúdo texto para R2 (para criar arquivos vazios)
   * @param r2Key - Chave R2 do arquivo
   * @param content - Conteúdo texto
   * @param mimeType - Tipo MIME do arquivo
   */
  async uploadTextContent(
    r2Key: string,
    content: string,
    mimeType: string
  ): Promise<void> {
    try {
      await cloudflareClient.uploadFile(r2Key, content, mimeType);
    } catch (error) {
      console.error('[UploadService] Text upload failed:', error);
      throw new Error('Failed to upload text content');
    }
  },
};
