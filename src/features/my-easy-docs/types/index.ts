// =============================================
// MyEasyDocs - Tipos TypeScript
// =============================================

// =============================================
// PASTA
// =============================================
export interface DocsFolder {
  id: string;
  user_id: string;
  parent_id: string | null;
  name: string;
  path: string;
  created_at: string;
  updated_at: string;
  children?: DocsFolder[];
  documents_count?: number;
}

export interface DocsFolderFormData {
  name: string;
  parent_id?: string | null;
}

// =============================================
// DOCUMENTO
// =============================================
export interface DocsDocument {
  id: string;
  user_id: string;
  folder_id: string | null;
  name: string;
  original_name: string;
  mime_type: string;
  size: number;
  r2_key: string;
  r2_url?: string;
  text_extraction_status: TextExtractionStatus;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocsDocumentFormData {
  name: string;
  folder_id?: string | null;
}

// =============================================
// STATUS DE EXTRAÇÃO DE TEXTO
// =============================================
export type TextExtractionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'unsupported';

// =============================================
// UPLOAD
// =============================================
export interface UploadProgress {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
  progress: number;
  status: UploadStatus;
  error?: string;
  documentId?: string;
}

export type UploadStatus =
  | 'pending'
  | 'uploading'
  | 'extracting'
  | 'completed'
  | 'error'
  | 'cancelled';

// =============================================
// CHAT E IA
// =============================================
export interface DocsChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: DocumentSource[];
  created_at: string;
}

export interface DocumentSource {
  document_id: string;
  document_name: string;
  chunk_index?: number;
  relevance_score?: number;
}

// =============================================
// CONTEÚDO E CHUNKS
// =============================================
export interface DocsContent {
  id: string;
  document_id: string;
  user_id: string;
  text_content: string;
  chunks_count: number;
  created_at: string;
}

export interface DocsChunk {
  id: string;
  document_id: string;
  content_id: string;
  user_id: string;
  chunk_index: number;
  chunk_text: string;
  created_at: string;
}

// =============================================
// NAVEGAÇÃO E VISUALIZAÇÃO
// =============================================
export type DocsViewMode = 'grid' | 'list';

export type DocsView =
  | 'explorer'
  | 'favorites'
  | 'recent'
  | 'search';

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}

// =============================================
// ITENS DO EXPLORER (UNIÃO DE PASTA + DOCUMENTO)
// =============================================
export type ExplorerItem =
  | { type: 'folder'; data: DocsFolder }
  | { type: 'document'; data: DocsDocument };

// =============================================
// FILTROS E BUSCA
// =============================================
export interface DocsFilters {
  search?: string;
  folder_id?: string | null;
  mime_type?: string;
  is_favorite?: boolean;
  created_after?: string;
  created_before?: string;
}

// =============================================
// ORDENAÇÃO
// =============================================
export type DocsSortField = 'name' | 'size' | 'mime_type' | 'created_at' | 'updated_at';
export type DocsSortOrder = 'asc' | 'desc';

export interface DocsSort {
  field: DocsSortField;
  order: DocsSortOrder;
}

// =============================================
// TIPOS DE CRIAÇÃO E ATUALIZAÇÃO (SERVICES)
// =============================================

/**
 * Dados para criar um novo documento
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
 * Dados para atualizar um documento
 */
export interface UpdateDocumentData {
  name?: string;
  folder_id?: string | null;
  r2_url?: string;
  text_extraction_status?: TextExtractionStatus;
  is_favorite?: boolean;
}

/**
 * Resultado de validação de arquivo
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Resultado de upload processado
 */
export interface ProcessedUploadResult {
  documentId: string;
  r2Key: string;
}

/**
 * Callback de progresso de upload
 */
export type ProgressCallback = (progress: number) => void;
