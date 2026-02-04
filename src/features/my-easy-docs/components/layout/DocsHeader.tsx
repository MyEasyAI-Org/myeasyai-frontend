// =============================================
// DocsHeader - Header with breadcrumb and toolbar
// =============================================

import { memo } from 'react';
import { LayoutGrid, List, MessageSquare } from 'lucide-react';
import type { BreadcrumbItem, DocsViewMode } from '../../types';
import { Breadcrumb } from '../shared/Breadcrumb';
import { SearchInput } from '../shared/SearchInput';

// =============================================
// Types
// =============================================

interface DocsHeaderProps {
  breadcrumb: BreadcrumbItem[];
  searchQuery: string;
  viewMode: DocsViewMode;
  chatOpen: boolean;
  avatarName?: string;
  avatarSelfie?: string | null;
  onNavigate: (folderId: string | null) => void;
  onSearchChange: (query: string) => void;
  onViewModeChange: (mode: DocsViewMode) => void;
  onToggleChat: () => void;
}

// =============================================
// Component
// =============================================

export const DocsHeader = memo(function DocsHeader({
  breadcrumb,
  searchQuery,
  viewMode,
  chatOpen,
  avatarName,
  avatarSelfie,
  onNavigate,
  onSearchChange,
  onViewModeChange,
  onToggleChat,
}: DocsHeaderProps) {
  return (
    <header className="flex-shrink-0 border-b border-slate-800 bg-slate-900/30">
      <div className="px-6 py-4">
        {/* Breadcrumb */}
        <div className="mb-3">
          <Breadcrumb path={breadcrumb} onNavigate={onNavigate} />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Buscar documentos..."
            className="flex-1 max-w-md"
          />

          {/* View Toggle & Chat */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <ViewModeToggle viewMode={viewMode} onChange={onViewModeChange} />

            {/* Chat Button */}
            <button
              onClick={onToggleChat}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                chatOpen
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {avatarSelfie ? (
                <img
                  src={avatarSelfie}
                  alt={avatarName || 'Assistente Concierge'}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <MessageSquare className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{avatarName || 'Assistente Concierge'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
});

// =============================================
// ViewModeToggle - Grid/List toggle buttons
// =============================================

interface ViewModeToggleProps {
  viewMode: DocsViewMode;
  onChange: (mode: DocsViewMode) => void;
}

const ViewModeToggle = memo(function ViewModeToggle({
  viewMode,
  onChange,
}: ViewModeToggleProps) {
  return (
    <div className="flex items-center bg-slate-800 rounded-lg p-1">
      <button
        onClick={() => onChange('grid')}
        className={`p-2 rounded-md transition-colors ${
          viewMode === 'grid'
            ? 'bg-slate-700 text-white'
            : 'text-slate-400 hover:text-white'
        }`}
        title="Visualização em grade"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        onClick={() => onChange('list')}
        className={`p-2 rounded-md transition-colors ${
          viewMode === 'list'
            ? 'bg-slate-700 text-white'
            : 'text-slate-400 hover:text-white'
        }`}
        title="Visualização em lista"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
});

export default DocsHeader;
