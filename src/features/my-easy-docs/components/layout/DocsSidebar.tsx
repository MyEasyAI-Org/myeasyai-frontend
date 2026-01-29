// =============================================
// DocsSidebar - Sidebar navigation for My Easy Docs
// =============================================

import { memo } from 'react';
import { ArrowLeft, FolderOpen, Upload, Plus, Star, Clock } from 'lucide-react';
import type { DocsFolder, DocsDocument } from '../../types';
import { SIDEBAR_WIDTH } from '../../constants';
import { FolderTree } from '../explorer/FolderTree';

// =============================================
// Types
// =============================================

interface DocsSidebarProps {
  folders: DocsFolder[];
  currentFolderId: string | null;
  expandedFolders: Set<string>;
  documents: DocsDocument[];
  onNavigate: (folderId: string | null) => void;
  onToggleExpand: (folderId: string) => void;
  onCreateFolder: () => void;
  onUpload: () => void;
  onBackToDashboard?: () => void;
  onViewFavorites?: () => void;
  onViewRecent?: () => void;
}

// =============================================
// Component
// =============================================

export const DocsSidebar = memo(function DocsSidebar({
  folders,
  currentFolderId,
  expandedFolders,
  documents,
  onNavigate,
  onToggleExpand,
  onCreateFolder,
  onUpload,
  onBackToDashboard,
  onViewFavorites,
  onViewRecent,
}: DocsSidebarProps) {
  return (
    <aside
      className="flex-shrink-0 bg-slate-900/50 border-r border-slate-800 flex flex-col"
      style={{ width: SIDEBAR_WIDTH }}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
              title="Voltar ao Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-blue-400" />
            <h1 className="text-lg font-semibold text-white">My Easy Docs</h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onUpload}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
          <button
            onClick={onCreateFolder}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium text-white transition-colors"
            title="Nova Pasta"
          >
            <Plus className="w-4 h-4" />
            Pasta
          </button>
        </div>
      </div>

      {/* Folder Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        <FolderTree
          folders={folders}
          currentFolderId={currentFolderId}
          expandedFolders={expandedFolders}
          documents={documents}
          onNavigate={onNavigate}
          onToggleExpand={onToggleExpand}
        />
      </div>

      {/* Quick Links */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        {onViewFavorites && (
          <button
            onClick={onViewFavorites}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Star className="w-4 h-4" />
            Favoritos
          </button>
        )}
        {onViewRecent && (
          <button
            onClick={onViewRecent}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Clock className="w-4 h-4" />
            Recentes
          </button>
        )}
      </div>
    </aside>
  );
});

export default DocsSidebar;
