// =============================================
// MyEasyDocs - Utilitários
// =============================================

import {
  FILE_TYPE_ICONS,
  EXTENSION_TO_MIME,
  SUPPORTED_TEXT_TYPES,
  EDITABLE_EXTENSIONS,
} from '../constants';
import type { DocsFolder, DocsDocument } from '../types';

// =============================================
// FORMATAÇÃO DE TAMANHO DE ARQUIVO
// =============================================

/**
 * Formata bytes para uma string legível (KB, MB, GB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}

// =============================================
// EXTENSÃO DE ARQUIVO
// =============================================

/**
 * Extrai a extensão de um nome de arquivo
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === 0) return '';
  return filename.slice(lastDot).toLowerCase();
}

/**
 * Remove a extensão de um nome de arquivo
 */
export function getFileNameWithoutExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === 0) return filename;
  return filename.slice(0, lastDot);
}

// =============================================
// TIPO DE ARQUIVO
// =============================================

/**
 * Retorna o label curto do tipo de arquivo para exibição em lista
 */
export function getFileTypeLabel(mimeType: string): string {
  // Extrai a parte após o /
  const parts = mimeType.split('/');
  if (parts.length === 2) {
    const subtype = parts[1];

    // Casos especiais
    if (subtype.includes('wordprocessingml')) return 'DOCX';
    if (subtype.includes('spreadsheetml')) return 'XLSX';
    if (subtype.includes('presentationml')) return 'PPTX';
    if (subtype === 'msword') return 'DOC';
    if (subtype === 'vnd.ms-excel') return 'XLS';
    if (subtype === 'vnd.ms-powerpoint') return 'PPT';
    if (subtype === 'plain') return 'TXT';
    if (subtype === 'markdown') return 'MD';

    // Retorna uppercase do subtipo
    return subtype.toUpperCase();
  }

  return 'Arquivo';
}

/**
 * Retorna uma descrição amigável do tipo de arquivo
 */
export function getFileType(mimeType: string): string {
  const typeMap: Record<string, string> = {
    // Documentos
    'text/plain': 'Texto',
    'text/markdown': 'Markdown',
    'text/csv': 'CSV',
    'text/html': 'HTML',
    'text/xml': 'XML',
    'application/pdf': 'PDF',
    'application/msword': 'Word',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
    'application/vnd.ms-excel': 'Excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
    'application/vnd.ms-powerpoint': 'PowerPoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
    'application/vnd.oasis.opendocument.text': 'OpenDocument',
    'application/rtf': 'Rich Text',

    // Imagens
    'image/jpeg': 'Imagem',
    'image/png': 'Imagem',
    'image/gif': 'Imagem',
    'image/webp': 'Imagem',
    'image/svg+xml': 'Imagem',
    'image/bmp': 'Imagem',

    // Vídeos
    'video/mp4': 'Vídeo',
    'video/webm': 'Vídeo',
    'video/quicktime': 'Vídeo',
    'video/x-msvideo': 'Vídeo',

    // Áudios
    'audio/mpeg': 'Áudio',
    'audio/wav': 'Áudio',
    'audio/ogg': 'Áudio',
    'audio/webm': 'Áudio',

    // Arquivos compactados
    'application/zip': 'Arquivo ZIP',
    'application/x-rar-compressed': 'Arquivo RAR',
    'application/x-7z-compressed': 'Arquivo 7z',
    'application/gzip': 'Arquivo GZ',

    // Código
    'application/javascript': 'JavaScript',
    'application/json': 'JSON',
    'application/typescript': 'TypeScript',
  };

  return typeMap[mimeType] || 'Arquivo';
}

/**
 * Retorna o nome do ícone Lucide para o tipo de arquivo
 */
export function getFileIcon(mimeType: string | 'folder'): string {
  return FILE_TYPE_ICONS[mimeType] || FILE_TYPE_ICONS.default;
}

/**
 * Detecta o MIME type pela extensão do arquivo
 */
export function getMimeTypeFromExtension(filename: string): string | null {
  const ext = getFileExtension(filename);
  return EXTENSION_TO_MIME[ext] || null;
}

// =============================================
// VERIFICAÇÕES DE TIPO
// =============================================

/**
 * Verifica se o arquivo suporta extração de texto
 */
export function canExtractText(mimeType: string): boolean {
  return SUPPORTED_TEXT_TYPES.includes(mimeType);
}

/**
 * Verifica se o arquivo é editável (TXT, MD)
 */
export function isEditable(filename: string): boolean {
  const ext = getFileExtension(filename);
  return EDITABLE_EXTENSIONS.includes(ext);
}

/**
 * Verifica se o arquivo é uma imagem
 */
export function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Verifica se o arquivo é um PDF
 */
export function isPdf(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}

/**
 * Verifica se o arquivo é um vídeo
 */
export function isVideo(mimeType: string): boolean {
  return mimeType.startsWith('video/');
}

/**
 * Verifica se o arquivo é um áudio
 */
export function isAudio(mimeType: string): boolean {
  return mimeType.startsWith('audio/');
}

/**
 * Verifica se o arquivo é texto puro ou markdown
 */
export function isTextFile(mimeType: string): boolean {
  return mimeType === 'text/plain' || mimeType === 'text/markdown';
}

// =============================================
// GERAÇÃO DE IDs
// =============================================

/**
 * Gera um ID único usando crypto.randomUUID ou fallback
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback para ambientes sem crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// =============================================
// CAMINHOS E NOMES
// =============================================

/**
 * Gera uma chave R2 para o documento
 */
export function generateR2Key(userId: string, documentId: string, filename: string): string {
  const ext = getFileExtension(filename);
  return `docs/${userId}/${documentId}${ext}`;
}

/**
 * Sanitiza nome de arquivo removendo caracteres inválidos
 */
export function sanitizeFileName(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '') // Remove caracteres inválidos
    .replace(/\s+/g, ' ')          // Normaliza espaços
    .trim();
}

/**
 * Trunca texto mantendo final
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// =============================================
// CONTAGEM DE DOCUMENTOS
// =============================================

/**
 * Conta documentos diretamente dentro de uma pasta (sem subpastas)
 */
export function countDocumentsInFolder(
  folderId: string | null,
  documents: DocsDocument[]
): number {
  return documents.filter(doc => doc.folder_id === folderId).length;
}

/**
 * Conta documentos em uma pasta incluindo todas as subpastas (recursivo)
 */
export function countDocumentsRecursive(
  folderId: string | null,
  folders: DocsFolder[],
  documents: DocsDocument[]
): number {
  // Conta documentos diretamente na pasta
  let count = countDocumentsInFolder(folderId, documents);

  // Encontra subpastas e conta recursivamente
  const subfolders = folders.filter(f => f.parent_id === folderId);
  for (const subfolder of subfolders) {
    count += countDocumentsRecursive(subfolder.id, folders, documents);
  }

  return count;
}

/**
 * Retorna todas as subpastas de uma pasta (recursivo)
 */
export function getSubfolderIds(
  folderId: string,
  folders: DocsFolder[]
): string[] {
  const directChildren = folders.filter(f => f.parent_id === folderId);
  const allIds: string[] = [];

  for (const child of directChildren) {
    allIds.push(child.id);
    allIds.push(...getSubfolderIds(child.id, folders));
  }

  return allIds;
}

// =============================================
// DATA E HORA
// =============================================

/**
 * Formata data para exibição
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formata data e hora para exibição
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Retorna texto relativo (há X minutos, ontem, etc)
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Agora mesmo';
  if (diffMin < 60) return `Há ${diffMin} min`;
  if (diffHour < 24) return `Há ${diffHour}h`;
  if (diffDay === 1) return 'Ontem';
  if (diffDay < 7) return `Há ${diffDay} dias`;
  return formatDate(dateString);
}
