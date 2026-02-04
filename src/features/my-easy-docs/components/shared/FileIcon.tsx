// =============================================
// FileIcon - Icon component based on file type
// =============================================

import { memo } from 'react';
import {
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  FileSpreadsheet,
  FileArchive,
  Folder,
} from 'lucide-react';

// =============================================
// Types
// =============================================

interface FileIconProps {
  mimeType: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

type IconSize = {
  sm: string;
  md: string;
  lg: string;
  xl: string;
};

// =============================================
// Constants
// =============================================

const SIZE_CLASSES: IconSize = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

// =============================================
// Helper Functions
// =============================================

function getIconComponent(mimeType: string) {
  // Folder
  if (mimeType === 'folder') {
    return { Icon: Folder, colorClass: 'text-yellow-500' };
  }

  // Images (green-400 - mesmo padrão do painel esquerdo)
  if (mimeType.startsWith('image/')) {
    return { Icon: FileImage, colorClass: 'text-green-400' };
  }

  // Videos (purple-400 - mesmo padrão do painel esquerdo)
  if (mimeType.startsWith('video/')) {
    return { Icon: FileVideo, colorClass: 'text-purple-400' };
  }

  // Audio (pink-400 - mesmo padrão do painel esquerdo)
  if (mimeType.startsWith('audio/')) {
    return { Icon: FileAudio, colorClass: 'text-pink-400' };
  }

  // PDF
  if (mimeType === 'application/pdf') {
    return { Icon: FileText, colorClass: 'text-red-400' };
  }

  // Documents (Word, etc.)
  if (
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/rtf'
  ) {
    return { Icon: FileText, colorClass: 'text-blue-400' };
  }

  // Spreadsheets (Excel, etc.)
  if (
    mimeType === 'application/vnd.ms-excel' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimeType === 'text/csv'
  ) {
    return { Icon: FileSpreadsheet, colorClass: 'text-green-500' };
  }

  // Archives
  if (
    mimeType === 'application/zip' ||
    mimeType === 'application/x-rar-compressed' ||
    mimeType === 'application/x-7z-compressed' ||
    mimeType === 'application/gzip' ||
    mimeType === 'application/x-tar'
  ) {
    return { Icon: FileArchive, colorClass: 'text-amber-400' };
  }

  // Code files
  if (
    mimeType === 'application/javascript' ||
    mimeType === 'application/typescript' ||
    mimeType === 'application/json' ||
    mimeType === 'application/xml' ||
    mimeType === 'text/html' ||
    mimeType === 'text/css' ||
    mimeType === 'text/javascript' ||
    mimeType === 'text/x-python' ||
    mimeType === 'text/x-java-source'
  ) {
    return { Icon: FileCode, colorClass: 'text-cyan-400' };
  }

  // Plain text and markdown (blue-400 - mesmo padrão do painel esquerdo)
  if (mimeType === 'text/plain' || mimeType === 'text/markdown') {
    return { Icon: FileText, colorClass: 'text-blue-400' };
  }

  // Default
  return { Icon: File, colorClass: 'text-slate-400' };
}

// =============================================
// Component
// =============================================

export const FileIcon = memo(function FileIcon({
  mimeType,
  size = 'md',
  className = '',
}: FileIconProps) {
  const { Icon, colorClass } = getIconComponent(mimeType);
  const sizeClass = SIZE_CLASSES[size];

  return <Icon className={`${sizeClass} ${colorClass} ${className}`} />;
});

export default FileIcon;
