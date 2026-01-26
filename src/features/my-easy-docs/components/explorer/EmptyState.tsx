// =============================================
// EmptyState - Empty folder state display
// =============================================

import { memo } from 'react';
import { FolderOpen, Upload, Plus } from 'lucide-react';

// =============================================
// Types
// =============================================

interface EmptyStateProps {
  title?: string;
  description?: string;
  onUpload?: () => void;
  onCreateFolder?: () => void;
  showUploadButton?: boolean;
  showCreateFolderButton?: boolean;
}

// =============================================
// Component
// =============================================

export const EmptyState = memo(function EmptyState({
  title = 'Nenhum arquivo nesta pasta',
  description = 'Faça upload de arquivos ou crie uma nova pasta para começar',
  onUpload,
  onCreateFolder,
  showUploadButton = true,
  showCreateFolderButton = false,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-12">
      <FolderOpen className="w-16 h-16 text-slate-600 mb-4" />

      <h3 className="text-lg font-medium text-slate-300 mb-2">{title}</h3>

      <p className="text-sm text-slate-500 mb-6 max-w-md">{description}</p>

      <div className="flex items-center gap-3">
        {showUploadButton && onUpload && (
          <button
            onClick={onUpload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors"
          >
            <Upload className="w-4 h-4" />
            Fazer Upload
          </button>
        )}

        {showCreateFolderButton && onCreateFolder && (
          <button
            onClick={onCreateFolder}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Pasta
          </button>
        )}
      </div>
    </div>
  );
});

export default EmptyState;
