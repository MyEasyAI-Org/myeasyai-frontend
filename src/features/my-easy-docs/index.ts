// =============================================
// MyEasyDocs - Main Module Export
// =============================================
// This is the public API for the MyEasyDocs module.
// Import from here when using the Docs in other parts of the app.
// =============================================

// Main component
export { MyEasyDocs, default } from './MyEasyDocs';

// Types (for external use)
export type {
  DocsFolder,
  DocsFolderFormData,
  DocsDocument,
  DocsDocumentFormData,
  TextExtractionStatus,
  UploadProgress,
  UploadStatus,
  DocsChatMessage,
  DocumentSource,
  DocsContent,
  DocsChunk,
  DocsViewMode,
  DocsView,
  BreadcrumbItem,
  ExplorerItem,
  DocsFilters,
  DocsSortField,
  DocsSortOrder,
  DocsSort,
} from './types';

// Constants (for external use if needed)
export {
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_MB,
  SUPPORTED_TEXT_TYPES,
  EDITABLE_EXTENSIONS,
  FILE_TYPE_ICONS,
  EXTENSION_TO_MIME,
  TEXT_EXTRACTION_STATUS,
  UPLOAD_STATUS,
  VIEW_MODES,
  TEXT_CHUNK_SIZE,
  TEXT_CHUNK_OVERLAP,
  SIDEBAR_WIDTH,
  MESSAGES,
} from './constants';

// Utils (for external use if needed)
export {
  formatFileSize,
  getFileExtension,
  getFileNameWithoutExtension,
  getFileType,
  getFileIcon,
  getMimeTypeFromExtension,
  canExtractText,
  isEditable,
  isImage,
  isPdf,
  isVideo,
  isAudio,
  isTextFile,
  generateId,
  generateR2Key,
  sanitizeFileName,
  truncateText,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  countDocumentsInFolder,
  countDocumentsRecursive,
  getSubfolderIds,
} from './utils';

// Mock data (for development only)
export { MOCK_FOLDERS, MOCK_DOCUMENTS } from './mockData';
