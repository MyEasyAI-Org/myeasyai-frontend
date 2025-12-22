// =============================================================================
// TutorialFinishModal - Modal shown when tutorial is completed
// =============================================================================

import { Trash2, Save } from 'lucide-react';

// =============================================================================
// Types
// =============================================================================

interface TutorialFinishModalProps {
  isOpen: boolean;
  onKeep: () => void;
  onDelete: () => void;
  isLoading: boolean;
}

// =============================================================================
// Component
// =============================================================================

export function TutorialFinishModal({
  isOpen,
  onKeep,
  onDelete,
  isLoading,
}: TutorialFinishModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-slate-800 p-6 shadow-2xl border border-slate-700">
        {/* Content */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
            <span className="text-3xl">🎉</span>
          </div>

          <h2 className="mb-2 text-2xl font-bold text-white">
            Parabéns! Tutorial Concluído!
          </h2>

          <p className="mb-6 text-slate-300">
            Você completou o tutorial do MyEasyPricing. O que deseja fazer com os dados de demonstração?
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onKeep}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 font-semibold text-white transition-all hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {isLoading ? 'Processando...' : 'Manter dados e continuar'}
            </button>

            <button
              onClick={onDelete}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-semibold text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
            >
              <Trash2 className="h-5 w-5" />
              {isLoading ? 'Processando...' : 'Excluir dados de demonstração'}
            </button>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Se mantiver, a loja de demonstração será convertida em uma loja normal.
          </p>
        </div>
      </div>
    </div>
  );
}
