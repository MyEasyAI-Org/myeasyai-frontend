// =============================================
// MyEasyDocs - Services Export
// =============================================

export { FolderService } from './FolderService';
export { DocumentService } from './DocumentService';
export { UploadService } from './UploadService';

// Re-export types from services
export type { CreateDocumentData, UpdateDocumentData } from './DocumentService';
export type { FileValidationResult, ProgressCallback, ProcessedUploadResult } from './UploadService';
