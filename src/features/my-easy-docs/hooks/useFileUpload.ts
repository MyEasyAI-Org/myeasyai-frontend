// =============================================
// MyEasyDocs - useFileUpload Hook
// =============================================

import { useState, useCallback } from 'react';
import { UploadService, DocumentService } from '../services';
import type { UploadProgress, UploadStatus, DocsDocument } from '../types';
import { generateId, canExtractText } from '../utils';

interface UseFileUploadOptions {
  /** Default folder ID for uploads */
  folderId?: string | null;
  /** Callback when a document is created */
  onDocumentCreated?: (document: DocsDocument) => void;
  /** Callback when all uploads complete */
  onAllComplete?: () => void;
  /** Callback on upload error */
  onError?: (fileName: string, error: string) => void;
}

interface UseFileUploadReturn {
  /** List of uploads with progress */
  uploads: UploadProgress[];
  /** Whether any upload is in progress */
  isUploading: boolean;
  /** Add files to upload queue and start uploading */
  uploadFiles: (files: File[], folderId?: string | null) => Promise<void>;
  /** Cancel a specific upload */
  cancelUpload: (uploadId: string) => void;
  /** Clear completed/error uploads from list */
  clearCompleted: () => void;
  /** Clear all uploads from list */
  clearAll: () => void;
  /** Retry a failed upload */
  retryUpload: (uploadId: string) => Promise<void>;
}

export function useFileUpload(options?: UseFileUploadOptions): UseFileUploadReturn {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  const { folderId: defaultFolderId, onDocumentCreated, onAllComplete, onError } = options || {};

  // Check if any upload is in progress
  const isUploading = uploads.some(
    (u) => u.status === 'uploading' || u.status === 'extracting' || u.status === 'pending'
  );

  // Update a specific upload
  const updateUpload = useCallback((id: string, updates: Partial<UploadProgress>) => {
    setUploads((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
  }, []);

  // Process a single file upload
  const processFile = useCallback(
    async (upload: UploadProgress, folderId: string | null) => {
      const { id, file, fileName } = upload;

      try {
        // Validate
        const validation = UploadService.validateFile(file);
        if (!validation.valid) {
          updateUpload(id, { status: 'error', error: validation.error });
          onError?.(fileName, validation.error || 'Validation failed');
          return;
        }

        // Start upload
        updateUpload(id, { status: 'uploading', progress: 0 });

        // Generate IDs and upload to R2
        const documentId = UploadService.generateDocumentId();
        const r2Key = await UploadService.generateR2Key(documentId, fileName);

        await UploadService.uploadToR2WithProgress(file, r2Key, (progress) => {
          updateUpload(id, { progress });
        });

        // Create document record
        updateUpload(id, { status: 'extracting', progress: 100 });

        const document = await DocumentService.create({
          folder_id: folderId,
          name: fileName,
          original_name: fileName,
          mime_type: file.type || 'application/octet-stream',
          size: file.size,
          r2_key: r2Key,
        });

        // Update extraction status based on file type
        if (!canExtractText(file.type)) {
          await DocumentService.update(document.id, {
            extraction_status: 'unsupported',
          });
        }

        // Success
        updateUpload(id, {
          status: 'completed',
          documentId: document.id,
        });

        onDocumentCreated?.(document);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';
        updateUpload(id, { status: 'error', error: errorMessage });
        onError?.(fileName, errorMessage);
        console.error('[useFileUpload] Upload error:', err);
      }
    },
    [updateUpload, onDocumentCreated, onError]
  );

  // Upload multiple files
  const uploadFiles = useCallback(
    async (files: File[], folderId?: string | null) => {
      const effectiveFolderId = folderId !== undefined ? folderId : defaultFolderId ?? null;

      // Create upload entries
      const newUploads: UploadProgress[] = files.map((file) => ({
        id: generateId(),
        file,
        fileName: file.name,
        fileSize: file.size,
        progress: 0,
        status: 'pending' as UploadStatus,
      }));

      setUploads((prev) => [...prev, ...newUploads]);

      // Process uploads sequentially to avoid overwhelming the server
      for (const upload of newUploads) {
        // Check if cancelled before starting
        const currentUpload = uploads.find((u) => u.id === upload.id);
        if (currentUpload?.status === 'cancelled') {
          continue;
        }

        await processFile(upload, effectiveFolderId);
      }

      // Check if all complete
      setUploads((prev) => {
        const allDone = prev.every(
          (u) => u.status === 'completed' || u.status === 'error' || u.status === 'cancelled'
        );
        if (allDone) {
          onAllComplete?.();
        }
        return prev;
      });
    },
    [defaultFolderId, processFile, onAllComplete, uploads]
  );

  // Cancel upload
  const cancelUpload = useCallback((uploadId: string) => {
    updateUpload(uploadId, { status: 'cancelled' });
  }, [updateUpload]);

  // Clear completed uploads
  const clearCompleted = useCallback(() => {
    setUploads((prev) =>
      prev.filter((u) => u.status !== 'completed' && u.status !== 'error' && u.status !== 'cancelled')
    );
  }, []);

  // Clear all uploads
  const clearAll = useCallback(() => {
    setUploads([]);
  }, []);

  // Retry failed upload
  const retryUpload = useCallback(
    async (uploadId: string) => {
      const upload = uploads.find((u) => u.id === uploadId);
      if (!upload || upload.status !== 'error') return;

      updateUpload(uploadId, { status: 'pending', progress: 0, error: undefined });
      await processFile(upload, defaultFolderId ?? null);
    },
    [uploads, updateUpload, processFile, defaultFolderId]
  );

  return {
    uploads,
    isUploading,
    uploadFiles,
    cancelUpload,
    clearCompleted,
    clearAll,
    retryUpload,
  };
}

// Hook for drag and drop support
interface UseDropZoneOptions {
  /** Callback when files are dropped */
  onFilesDropped: (files: File[]) => void;
  /** Whether drop zone is disabled */
  disabled?: boolean;
}

interface UseDropZoneReturn {
  /** Whether dragging over the zone */
  isDragging: boolean;
  /** Props to spread on the drop zone element */
  dropZoneProps: {
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
}

export function useDropZone(options: UseDropZoneOptions): UseDropZoneReturn {
  const [isDragging, setIsDragging] = useState(false);
  const { onFilesDropped, disabled } = options;

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onFilesDropped(files);
      }
    },
    [disabled, onFilesDropped]
  );

  return {
    isDragging,
    dropZoneProps: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
  };
}
