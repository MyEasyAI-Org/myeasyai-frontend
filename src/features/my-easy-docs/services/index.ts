// =============================================
// MyEasyDocs - Services Export
// =============================================

export { FolderService } from './FolderService';
export { DocumentService } from './DocumentService';
export { UploadService } from './UploadService';
export { TextExtractionService } from './TextExtractionService';
export { DocsSearchService } from './DocsSearchService';
export { DocsAIService } from './DocsAIService';

// Re-export types from services
export type { CreateDocumentData, UpdateDocumentData } from './DocumentService';
export type { FileValidationResult, ProgressCallback, ProcessedUploadResult } from './UploadService';
export type { TextExtractionResult } from './TextExtractionService';
export type { SearchResult, DocumentContext } from './DocsSearchService';
export type { AIResponse } from './DocsAIService';
