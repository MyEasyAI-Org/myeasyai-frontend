// =============================================
// MyEasyDocs - UploadModal Component
// =============================================
// Modal for uploading files with drag-and-drop.
// =============================================

import { useState, useCallback, useEffect } from 'react';
import { X, Upload, Loader2, AlertTriangle } from 'lucide-react';
import type { UploadProgress } from '../../types';
import { generateId } from '../../utils';
import { isBlockedFile } from '../../services/UploadService';
import { DropZone } from './DropZone';
import { UploadProgressList } from './UploadProgressList';

// Interface for blocked file info
interface BlockedFile {
  name: string;
  reason: string;
}

// =============================================
// PROPS
// =============================================
interface UploadModalProps {
  isOpen: boolean;
  currentFolderId: string | null;
  currentFolderName?: string;
  isUploading?: boolean;
  onClose: () => void;
  onUpload: (files: File[], folderId: string | null) => void;
}

// =============================================
// COMPONENT
// =============================================
export function UploadModal({
  isOpen,
  currentFolderId,
  currentFolderName,
  isUploading = false,
  onClose,
  onUpload,
}: UploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [blockedFiles, setBlockedFiles] = useState<BlockedFile[]>([]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedFiles([]);
      setUploads([]);
      setBlockedFiles([]);
    }
  }, [isOpen]);

  // Handle files selected from DropZone
  const handleFilesSelected = useCallback((files: File[]) => {
    // Separate allowed and blocked files
    const allowed: File[] = [];
    const blocked: BlockedFile[] = [];

    files.forEach((file) => {
      const blockCheck = isBlockedFile(file);
      if (blockCheck.blocked) {
        blocked.push({
          name: file.name,
          reason: blockCheck.reason || 'Arquivo não permitido',
        });
      } else {
        allowed.push(file);
      }
    });

    // Show blocked files
    if (blocked.length > 0) {
      setBlockedFiles((prev) => {
        const existingNames = new Set(prev.map((f) => f.name));
        const newBlocked = blocked.filter((f) => !existingNames.has(f.name));
        return [...prev, ...newBlocked];
      });
    }

    // Add allowed files to list (avoid duplicates by name+size)
    if (allowed.length > 0) {
      setSelectedFiles((prev) => {
        const existingKeys = new Set(prev.map((f) => `${f.name}-${f.size}`));
        const newFiles = allowed.filter((f) => !existingKeys.has(`${f.name}-${f.size}`));
        return [...prev, ...newFiles];
      });

      // Create upload progress items for allowed files only
      const newUploads: UploadProgress[] = allowed.map((file) => ({
        id: generateId(),
        file,
        fileName: file.name,
        fileSize: file.size,
        progress: 0,
        status: 'pending',
      }));

      setUploads((prev) => {
        const existingKeys = new Set(prev.map((u) => `${u.fileName}-${u.fileSize}`));
        const filtered = newUploads.filter(
          (u) => !existingKeys.has(`${u.fileName}-${u.fileSize}`)
        );
        return [...prev, ...filtered];
      });
    }
  }, []);

  // Dismiss blocked file warning
  const dismissBlockedFile = useCallback((fileName: string) => {
    setBlockedFiles((prev) => prev.filter((f) => f.name !== fileName));
  }, []);

  // Handle upload start
  const handleUpload = useCallback(() => {
    if (selectedFiles.length === 0) return;
    onUpload(selectedFiles, currentFolderId);
  }, [selectedFiles, currentFolderId, onUpload]);

  // Handle cancel single upload
  const handleCancelUpload = useCallback((uploadId: string) => {
    setUploads((prev) =>
      prev.map((u) => (u.id === uploadId ? { ...u, status: 'cancelled' } : u))
    );
    setSelectedFiles((prev) => {
      const upload = uploads.find((u) => u.id === uploadId);
      if (!upload) return prev;
      return prev.filter((f) => f.name !== upload.fileName || f.size !== upload.fileSize);
    });
  }, [uploads]);

  // Handle close
  const handleClose = useCallback(() => {
    if (!isUploading) {
      onClose();
    }
  }, [isUploading, onClose]);

  // Handle keyboard
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && !isUploading) {
        onClose();
      }
    },
    [isUploading, onClose]
  );

  // Count active uploads
  const pendingCount = uploads.filter(
    (u) => u.status === 'pending' || u.status === 'uploading' || u.status === 'extracting'
  ).length;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl m-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Upload className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Upload de Arquivos</h2>
              {currentFolderName && (
                <p className="text-sm text-slate-400">
                  Destino: <span className="text-slate-300">{currentFolderName}</span>
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Drop zone */}
          <DropZone
            onFilesSelected={handleFilesSelected}
            disabled={isUploading}
            multiple
          />

          {/* Blocked files warning */}
          {blockedFiles.length > 0 && (
            <div className="space-y-2">
              {blockedFiles.map((file) => (
                <div
                  key={file.name}
                  className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                >
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-red-300 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-red-400/80">
                      {file.reason}
                    </p>
                  </div>
                  <button
                    onClick={() => dismissBlockedFile(file.name)}
                    className="p-1 hover:bg-red-500/20 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload progress list */}
          {uploads.length > 0 && (
            <UploadProgressList
              uploads={uploads}
              onCancelUpload={!isUploading ? handleCancelUpload : undefined}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700 bg-slate-800/30">
          <p className="text-sm text-slate-400">
            {selectedFiles.length === 0
              ? 'Nenhum arquivo selecionado'
              : `${selectedFiles.length} arquivo${selectedFiles.length > 1 ? 's' : ''} selecionado${selectedFiles.length > 1 ? 's' : ''}`}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading || selectedFiles.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>
                    Enviar {selectedFiles.length > 0 && `(${selectedFiles.length})`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
