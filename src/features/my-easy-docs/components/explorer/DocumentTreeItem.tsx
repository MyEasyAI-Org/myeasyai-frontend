// =============================================
// DocumentTreeItem - Single document item in the tree
// =============================================

import { memo } from 'react';
import { Star, FileText, /* FileImage, FileVideo, FileAudio, FileCode, */ File } from 'lucide-react';
import type { DocsDocument } from '../../types';
import { /* isImage, isVideo, isAudio, */ isPdf, /* isCode, */ isTextFile } from '../../utils';

// =============================================
// Types
// =============================================

interface DocumentTreeItemProps {
  document: DocsDocument;
  level: number;
  isSelected: boolean;
  onSelect: (documentId: string) => void;
}

// =============================================
// Get Icon for Document
// =============================================

function getDocumentIcon(mimeType: string, filename: string) {
  // TODO: v2 - Reativar suporte a imagens/mídia/código
  // if (isImage(mimeType)) {
  //   return <FileImage className="w-4 h-4 text-green-400 flex-shrink-0" />;
  // }
  if (isPdf(mimeType)) {
    return <FileText className="w-4 h-4 text-red-400 flex-shrink-0" />;
  }
  // TODO: v2 - Reativar suporte a vídeo/áudio
  // if (isVideo(mimeType)) {
  //   return <FileVideo className="w-4 h-4 text-purple-400 flex-shrink-0" />;
  // }
  // if (isAudio(mimeType)) {
  //   return <FileAudio className="w-4 h-4 text-pink-400 flex-shrink-0" />;
  // }
  // TODO: v2 - Reativar suporte a código (exceto HTML)
  // if (isCode(mimeType, filename)) {
  //   return <FileCode className="w-4 h-4 text-cyan-400 flex-shrink-0" />;
  // }
  if (isTextFile(mimeType)) {
    return <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />;
  }
  return <File className="w-4 h-4 text-slate-400 flex-shrink-0" />;
}

// =============================================
// Component
// =============================================

export const DocumentTreeItem = memo(function DocumentTreeItem({
  document,
  level,
  isSelected,
  onSelect,
}: DocumentTreeItemProps) {
  const handleClick = () => {
    onSelect(document.id);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
        isSelected
          ? 'bg-blue-500/20 text-blue-400'
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
      }`}
      style={{ paddingLeft: `${12 + level * 16 + 20}px` }}
      title={document.name}
    >
      {/* Document Icon */}
      {getDocumentIcon(document.mime_type, document.name)}

      {/* Document Name */}
      <span className="truncate flex-1 text-left">{document.name}</span>

      {/* Favorite Indicator */}
      {document.is_favorite && (
        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
      )}
    </button>
  );
});

export default DocumentTreeItem;
