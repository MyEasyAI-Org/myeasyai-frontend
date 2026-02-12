// =============================================
// SelectionToolbar - Barra de ações para seleção múltipla
// =============================================

import { memo } from 'react';
import { X, Trash2, FolderInput, Star } from 'lucide-react';

interface SelectionToolbarProps {
  visible: boolean;
  selectedCount: number;
  hasDocumentsSelected?: boolean;
  onDelete: () => void;
  onMove: () => void;
  onToggleFavorite?: () => void;
  onClearSelection: () => void;
}

export const SelectionToolbar = memo(function SelectionToolbar({
  visible,
  selectedCount,
  hasDocumentsSelected = false,
  onDelete,
  onMove,
  onToggleFavorite,
  onClearSelection,
}: SelectionToolbarProps) {
  if (!visible) return null;

  const hasSelection = selectedCount > 0;

  return (
    <div className="fixed bottom-6 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 px-2 sm:px-4 py-2 sm:py-3 max-w-[calc(100vw-2rem)] sm:max-w-none bg-slate-800 border border-slate-700 rounded-xl shadow-2xl">
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
        {/* Counter */}
        <span className="text-xs sm:text-sm font-medium text-slate-200 text-center sm:min-w-[120px]">
          {hasSelection
            ? `${selectedCount} ${selectedCount === 1 ? 'item' : 'itens'}`
            : 'Selecione itens'}
        </span>

        {/* Divider - Hidden on mobile */}
        <div className="hidden sm:block w-px h-6 bg-slate-700" />

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Favoritar - somente se houver documentos */}
          {hasDocumentsSelected && onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              disabled={!hasSelection}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-300 hover:text-yellow-400 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-slate-300 disabled:hover:bg-transparent"
              title="Favoritar selecionados"
            >
              <Star className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Favoritar</span>
            </button>
          )}

          {/* Mover */}
          <button
            onClick={onMove}
            disabled={!hasSelection}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-300 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-slate-300 disabled:hover:bg-transparent"
            title="Mover selecionados"
          >
            <FolderInput className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Mover</span>
          </button>

          {/* Excluir */}
          <button
            onClick={onDelete}
            disabled={!hasSelection}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-300 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-slate-300 disabled:hover:bg-transparent"
            title="Excluir selecionados"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Excluir</span>
          </button>
        </div>

        {/* Divider - Hidden on mobile */}
        <div className="hidden sm:block w-px h-6 bg-slate-700" />

        {/* Clear */}
        <button
          onClick={onClearSelection}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
          title="Cancelar seleção (Esc)"
        >
          <X className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Cancelar</span>
        </button>
      </div>
    </div>
  );
});

export default SelectionToolbar;
