import { memo } from 'react';
import { AlertTriangle, Save, X, LogOut } from 'lucide-react';

// ============================================================================
// UnsavedPlanModal - Warning modal when user tries to leave without saving
// ============================================================================

interface UnsavedPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onLeave: () => void;
  planName?: string;
}

export const UnsavedPlanModal = memo(function UnsavedPlanModal({
  isOpen,
  onClose,
  onSave,
  onLeave,
  planName,
}: UnsavedPlanModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md animate-in zoom-in-95 duration-200">
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl shadow-amber-500/10">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Warning icon */}
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20 ring-4 ring-amber-500/30">
              <AlertTriangle className="h-8 w-8 text-amber-400 animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <h2 className="mb-2 text-center text-xl font-bold text-white">
            Eita! Tem certeza? 🤔
          </h2>

          {/* Message */}
          <div className="mb-6 space-y-3 text-center">
            <p className="text-slate-300">
              {planName ? (
                <>
                  Seu plano <span className="font-semibold text-amber-400">"{planName}"</span> ainda não foi salvo!
                </>
              ) : (
                <>Seu plano de estudos ainda <span className="font-semibold text-amber-400">não foi salvo!</span></>
              )}
            </p>
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
              <p className="text-sm text-red-300">
                <strong>⚠️ Atenção:</strong> Se você sair agora, vai perder todo o plano e o progresso das lições.
                Você terá que criar tudo de novo do zero!
              </p>
            </div>
            <p className="text-sm text-slate-400">
              Salve agora pra não perder seu trabalho! 💾
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {/* Save button - Primary */}
            <button
              type="button"
              onClick={onSave}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3 font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Save className="h-5 w-5" />
              Salvar meu plano
            </button>

            {/* Leave button - Danger */}
            <button
              type="button"
              onClick={onLeave}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-medium text-red-400 transition-all hover:bg-red-500/20 hover:border-red-500/50"
            >
              <LogOut className="h-5 w-5" />
              Sair mesmo assim (perder tudo)
            </button>

            {/* Cancel */}
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors py-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default UnsavedPlanModal;
