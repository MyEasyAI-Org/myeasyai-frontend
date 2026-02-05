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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl">
      {/* Counter */}
      <span className="text-sm font-medium text-slate-200 min-w-[120px]">
        {hasSelection
          ? `${selectedCount} ${selectedCount === 1 ? 'item selecionado' : 'itens selecionados'}`
          : 'Selecione itens'}
      </span>

      {/* Divider */}
      <div className="w-px h-6 bg-slate-700" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Favoritar - somente se houver documentos */}
        {hasDocumentsSelected && onToggleFavorite && (
          <button
            onClick={onToggleFavorite}
            disabled={!hasSelection}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:text-yellow-400 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-slate-300 disabled:hover:bg-transparent"
            title="Favoritar selecionados"
          >
            <Star className="w-4 h-4" />
            <span>Favoritar</span>
          </button>
        )}

        {/* Mover */}
        <button
          onClick={onMove}
          disabled={!hasSelection}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-slate-300 disabled:hover:bg-transparent"
          title="Mover selecionados"
        >
          <FolderInput className="w-4 h-4" />
          <span>Mover</span>
        </button>

        {/* Excluir */}
        <button
          onClick={onDelete}
          disabled={!hasSelection}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-slate-300 disabled:hover:bg-transparent"
          title="Excluir selecionados"
        >
          <Trash2 className="w-4 h-4" />
          <span>Excluir</span>
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-slate-700" />

      {/* Clear */}
      <button
        onClick={onClearSelection}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
        title="Cancelar seleção (Esc)"
      >
        <X className="w-4 h-4" />
        <span>Cancelar</span>
      </button>
    </div>
  );
});

export default SelectionToolbar;
