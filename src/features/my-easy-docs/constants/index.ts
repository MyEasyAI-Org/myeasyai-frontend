// =============================================
// MyEasyDocs - Constantes
// =============================================

import type {
  TextExtractionStatus,
  UploadStatus,
  DocsViewMode,
} from '../types';

// =============================================
// LIMITES DE ARQUIVO
// =============================================
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB em bytes
export const MAX_FILE_SIZE_MB = 100;

// =============================================
// SEGURANÇA: EXTENSÕES BLOQUEADAS
// =============================================
export const BLOCKED_EXTENSIONS: string[] = [
  // Executáveis Windows
  '.exe', '.msi', '.bat', '.cmd', '.com', '.scr', '.pif',
  // Scripts Windows
  '.vbs', '.vbe', '.js', '.jse', '.ws', '.wsf', '.wsc', '.wsh',
  // PowerShell
  '.ps1', '.psm1', '.psd1',
  // Executáveis Unix/Mac
  '.sh', '.bash', '.zsh', '.csh', '.ksh',
  '.app', '.command',
  // Java
  '.jar', '.class',
  // Bibliotecas e drivers
  '.dll', '.sys', '.drv',
  // Configuração perigosa do Windows
  '.inf', '.reg',
  // Shortcuts (podem apontar para malware)
  '.lnk',
  // HTML Application (executa código)
  '.hta',
  // Arquivos compactados (risco de segurança - podem conter executáveis maliciosos)
  '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz', '.tgz', '.tbz2',
  '.cab', '.iso', '.dmg', '.pkg', '.deb', '.rpm',
];

// MIME types bloqueados (backup de segurança)
export const BLOCKED_MIME_TYPES: string[] = [
  // Executáveis
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-sh',
  'application/x-shellscript',
  // Arquivos compactados
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/gzip',
  'application/x-gzip',
  'application/x-tar',
  'application/x-bzip2',
  'application/x-xz',
  'application/x-iso9660-image',
  'application/x-apple-diskimage',
];

// =============================================
// TIPOS DE ARQUIVO SUPORTADOS PARA EXTRAÇÃO DE TEXTO
// =============================================
export const SUPPORTED_TEXT_TYPES: string[] = [
  // Documentos de texto
  'text/plain',
  'text/markdown',
  'text/csv',
  'text/html',
  'text/xml',
  // PDF
  'application/pdf',
  // Microsoft Office
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  // OpenDocument
  'application/vnd.oasis.opendocument.text', // .odt
  // Rich Text
  'application/rtf',
];

// Extensões editáveis
export const EDITABLE_EXTENSIONS: string[] = ['.txt', '.md', '.markdown', '.json', '.csv', '.html', '.htm'];

// =============================================
// MAPEAMENTO DE MIME TYPE → ÍCONE LUCIDE
// =============================================
export const FILE_TYPE_ICONS: Record<string, string> = {
  // Pastas
  folder: 'Folder',
  folder_open: 'FolderOpen',

  // Documentos de texto
  'text/plain': 'FileText',
  'text/markdown': 'FileCode',
  'text/csv': 'FileSpreadsheet',
  'text/html': 'FileCode',
  'text/xml': 'FileCode',

  // PDF
  'application/pdf': 'FileText',

  // Microsoft Word
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'FileText',
  'application/msword': 'FileText',

  // Microsoft Excel
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'FileSpreadsheet',
  'application/vnd.ms-excel': 'FileSpreadsheet',

  // Microsoft PowerPoint
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'Presentation',
  'application/vnd.ms-powerpoint': 'Presentation',

  // Imagens
  'image/jpeg': 'Image',
  'image/png': 'Image',
  'image/gif': 'Image',
  'image/webp': 'Image',
  'image/svg+xml': 'Image',
  'image/bmp': 'Image',

  // Vídeos
  'video/mp4': 'Video',
  'video/webm': 'Video',
  'video/quicktime': 'Video',
  'video/x-msvideo': 'Video',

  // Áudios
  'audio/mpeg': 'Music',
  'audio/wav': 'Music',
  'audio/ogg': 'Music',
  'audio/webm': 'Music',

  // Código
  'application/javascript': 'FileCode',
  'application/json': 'FileJson',
  'application/typescript': 'FileCode',

  // Padrão
  default: 'File',
};

// Mapeamento de extensão → MIME type (para casos onde o browser não detecta)
export const EXTENSION_TO_MIME: Record<string, string> = {
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.markdown': 'text/markdown',
  '.csv': 'text/csv',
  '.html': 'text/html',
  '.htm': 'text/html',
  '.xml': 'text/xml',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.odt': 'application/vnd.oasis.opendocument.text',
  '.rtf': 'application/rtf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.bmp': 'image/bmp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.js': 'application/javascript',
  '.ts': 'application/typescript',
  '.json': 'application/json',
};

// =============================================
// STATUS DE EXTRAÇÃO DE TEXTO
// =============================================
export const TEXT_EXTRACTION_STATUS: Record<TextExtractionStatus, { label: string; color: string; icon: string }> = {
  pending: {
    label: 'Aguardando',
    color: 'text-slate-400',
    icon: 'Clock',
  },
  processing: {
    label: 'Processando',
    color: 'text-blue-400',
    icon: 'Loader2',
  },
  completed: {
    label: 'Indexado',
    color: 'text-green-400',
    icon: 'CheckCircle',
  },
  failed: {
    label: 'Falhou',
    color: 'text-red-400',
    icon: 'XCircle',
  },
  unsupported: {
    label: 'Não suportado',
    color: 'text-slate-500',
    icon: 'AlertCircle',
  },
};

// =============================================
// STATUS DE UPLOAD
// =============================================
export const UPLOAD_STATUS: Record<UploadStatus, { label: string; color: string; icon: string }> = {
  pending: {
    label: 'Na fila',
    color: 'text-slate-400',
    icon: 'Clock',
  },
  uploading: {
    label: 'Enviando',
    color: 'text-blue-400',
    icon: 'Upload',
  },
  extracting: {
    label: 'Indexando',
    color: 'text-yellow-400',
    icon: 'Loader2',
  },
  completed: {
    label: 'Concluído',
    color: 'text-green-400',
    icon: 'CheckCircle',
  },
  error: {
    label: 'Erro',
    color: 'text-red-400',
    icon: 'XCircle',
  },
  cancelled: {
    label: 'Cancelado',
    color: 'text-slate-500',
    icon: 'X',
  },
};

// =============================================
// MODOS DE VISUALIZAÇÃO
// =============================================
export const VIEW_MODES: Record<DocsViewMode, { label: string; icon: string }> = {
  grid: {
    label: 'Grade',
    icon: 'LayoutGrid',
  },
  list: {
    label: 'Lista',
    icon: 'List',
  },
};

// =============================================
// CHUNK DE TEXTO PARA INDEXAÇÃO
// =============================================
export const TEXT_CHUNK_SIZE = 1000; // caracteres por chunk
export const TEXT_CHUNK_OVERLAP = 200; // sobreposição entre chunks

// =============================================
// SIDEBAR
// =============================================
export const SIDEBAR_WIDTH = 280; // pixels

// =============================================
// MENSAGENS
// =============================================
export const MESSAGES = {
  upload: {
    success: 'Arquivo enviado com sucesso',
    error: 'Erro ao enviar arquivo',
    sizeTooLarge: `Arquivo muito grande. O limite é ${MAX_FILE_SIZE_MB}MB`,
    invalidType: 'Tipo de arquivo não suportado',
  },
  folder: {
    createSuccess: 'Pasta criada com sucesso',
    createError: 'Erro ao criar pasta',
    renameSuccess: 'Pasta renomeada com sucesso',
    renameError: 'Erro ao renomear pasta',
    deleteSuccess: 'Pasta excluída com sucesso',
    deleteError: 'Erro ao excluir pasta',
    deleteWithContent: 'Esta pasta contém arquivos. Todos serão excluídos.',
  },
  document: {
    renameSuccess: 'Arquivo renomeado com sucesso',
    renameError: 'Erro ao renomear arquivo',
    deleteSuccess: 'Arquivo excluído com sucesso',
    deleteError: 'Erro ao excluir arquivo',
    moveSuccess: 'Arquivo movido com sucesso',
    moveError: 'Erro ao mover arquivo',
    downloadError: 'Erro ao baixar arquivo',
  },
  chat: {
    noDocuments: 'Nenhum documento indexado. Faça upload de arquivos para conversar com a IA.',
    error: 'Erro ao processar sua pergunta. Tente novamente.',
  },
  preview: {
    loadingSpreadsheet: 'Carregando planilha...',
    loadingContent: 'Carregando conteúdo...',
    loadingCode: 'Carregando código...',
    loadingDocx: 'Carregando documento...',
    loadError: 'Não foi possível carregar o conteúdo',
    spreadsheetError: 'Erro ao carregar planilha',
    spreadsheetEmpty: 'Planilha vazia',
    spreadsheetSheetEmpty: 'Esta aba está vazia',
    noFileSource: 'Nenhuma fonte de arquivo disponível',
    videoError: 'Não foi possível reproduzir o vídeo',
    videoUnsupported: 'Seu navegador pode não suportar este formato de vídeo.',
    audioUnsupported: 'Seu navegador pode não suportar este formato de áudio.',
    imageError: 'Não foi possível carregar a imagem',
    codeError: 'Não foi possível carregar o código',
    docLegacyTitle: 'Formato DOC (legado)',
    docLegacyMessage: 'O formato .doc tem suporte limitado no navegador. Para melhor visualização, converta para .docx usando Microsoft Word ou LibreOffice.',
    movFallbackTitle: 'Formato MOV com suporte limitado',
    movFallbackMessage: 'Seu navegador pode não suportar o formato MOV. Recomendamos converter para MP4 para melhor compatibilidade.',
    downloadAction: 'Baixar arquivo',
    jsonInvalid: 'JSON inválido',
    jsonValid: 'JSON válido',
    jsonFormat: 'Formatar',
    editAction: 'Editar',
    saveAction: 'Salvar',
    cancelAction: 'Cancelar',
    savingAction: 'Salvando...',
  },
} as const;
