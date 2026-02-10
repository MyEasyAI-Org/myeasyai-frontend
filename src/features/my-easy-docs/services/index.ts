// =============================================
// MyEasyDocs - Services Export
// =============================================

export { FolderService } from './FolderService';
export { DocumentService } from './DocumentService';
export { UploadService } from './UploadService';
export { TextExtractionService } from './TextExtractionService';
export { DocsSearchService } from './DocsSearchService';
export { DocsAIService } from './DocsAIService';

// Image services (SRP)
export { ImageTransformService } from './ImageTransformService';
export { ImageFilterService } from './ImageFilterService';
export { ImageExportService } from './ImageExportService';
export { ImageConversionService } from './ImageConversionService';

// Spreadsheet services
export { SpreadsheetConversionService } from './SpreadsheetConversionService';

// Re-export types from services
export type { CreateDocumentData, UpdateDocumentData } from './DocumentService';
export type { FileValidationResult, ProgressCallback, ProcessedUploadResult } from './UploadService';
export type { TextExtractionResult } from './TextExtractionService';
export type { SearchResult, DocumentContext } from './DocsSearchService';
export type { AIResponse } from './DocsAIService';
export type { ImageFormat } from './ImageExportService';
