// =============================================
// DocsHeader - Header with breadcrumb and toolbar
// =============================================

import { memo } from 'react';
import { LayoutGrid, List, MessageSquare, Pointer, Menu } from 'lucide-react';
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
  // Multi-select props
  selectedCount?: number;
  totalItems?: number;
  allSelected?: boolean;
  someSelected?: boolean;
  onSelectAll?: () => void;
  // Callbacks
  onNavigate: (folderId: string | null) => void;
  onSearchChange: (query: string) => void;
  onViewModeChange: (mode: DocsViewMode) => void;
  onToggleChat: () => void;
  onMenuClick?: () => void; // NEW: Mobile menu button
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
  selectedCount = 0,
  totalItems = 0,
  allSelected = false,
  someSelected = false,
  onSelectAll,
  onNavigate,
  onSearchChange,
  onViewModeChange,
  onToggleChat,
  onMenuClick,
}: DocsHeaderProps) {
  return (
    <header className="flex-shrink-0 border-b border-slate-800 bg-slate-900/30">
      <div className="px-3 sm:px-6 py-3 sm:py-4">
        {/* Row 1: Menu + Breadcrumb */}
        <div className="flex items-center gap-2 mb-3">
          {/* Mobile menu button */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="sm:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors flex-shrink-0"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Breadcrumb */}
          <div className="flex-1 min-w-0">
            <Breadcrumb path={breadcrumb} onNavigate={onNavigate} />
          </div>
        </div>

        {/* Row 2 Mobile: Search + View toggle */}
        <div className="sm:hidden flex items-center gap-2 mb-3">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Buscar documentos..."
            className="flex-1"
          />
          <ViewModeToggle viewMode={viewMode} onChange={onViewModeChange} />
        </div>

        {/* Row 3 Mobile: Select all + Concierge button */}
        <div className="sm:hidden flex items-center justify-between gap-2 mb-3">
          {/* Select All Toggle */}
          {onSelectAll && totalItems > 0 ? (
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={onSelectAll}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                title={allSelected ? 'Desselecionar todos' : 'Selecionar todos'}
              />
              <span className="text-sm">
                {selectedCount > 0
                  ? `${selectedCount} selecionado${selectedCount > 1 ? 's' : ''}`
                  : 'Selecionar todos'}
              </span>
            </label>
          ) : (
            <div />
          )}

          {/* Pointer animation + Chat button */}
          <div className="flex items-center gap-2">
            <Pointer className="w-6 h-4 animate-pointing text-white" />
            <button
              onClick={onToggleChat}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                chatOpen
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              aria-label="Chat"
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
              <span className="text-sm font-medium">{avatarName || 'Concierge'}</span>
            </button>
          </div>
        </div>

        {/* Desktop: Search + View toggle + Select all + Chat */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Search + View Mode Toggle + Selection Mode */}
          <div className="flex items-center gap-3 flex-1">
            <SearchInput
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Buscar documentos..."
              className="flex-1 max-w-md"
            />
            <ViewModeToggle viewMode={viewMode} onChange={onViewModeChange} />

            {/* Select All Toggle */}
            {onSelectAll && totalItems > 0 && (
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={onSelectAll}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                  title={allSelected ? 'Desselecionar todos' : 'Selecionar todos'}
                />
                <span className="text-sm">
                  {selectedCount > 0
                    ? `${selectedCount} selecionado${selectedCount > 1 ? 's' : ''}`
                    : 'Selecionar todos'}
                </span>
              </label>
            )}
          </div>

          {/* Desktop: Dica + Chat Button */}
          <div className="flex items-center gap-3">
            {/* Dica para o assistente - Hidden on tablets */}
            <div className="hidden md:flex items-center gap-2 text-slate-400">
              <span className="text-sm">Se precisar de ajuda é só falar comigo!</span>
              <Pointer className="w-7 h-5 animate-pointing text-white" />
            </div>

            {/* Chat Button - Desktop */}
            <button
              onClick={onToggleChat}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors animate-pulse-glow ${
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
