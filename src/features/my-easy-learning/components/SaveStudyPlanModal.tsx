import { X } from 'lucide-react';
import { useState } from 'react';

interface SaveStudyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (planName: string) => void;
  defaultName?: string;
  isSaving?: boolean;
}

export function SaveStudyPlanModal({
  isOpen,
  onClose,
  onSave,
  defaultName = '',
  isSaving = false,
}: SaveStudyPlanModalProps) {
  const [planName, setPlanName] = useState(defaultName);

  if (!isOpen) return null;

  const handleSave = () => {
    if (planName.trim()) {
      onSave(planName.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && planName.trim()) {
      handleSave();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Salvar Plano de Estudos</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            disabled={isSaving}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <label htmlFor="plan-name" className="block text-sm font-medium text-slate-300 mb-2">
              Nome do Plano
            </label>
            <input
              id="plan-name"
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex: Aprender Python para Data Science"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              autoFocus
              disabled={isSaving}
            />
            <p className="mt-2 text-xs text-slate-400">
              Dê um nome descritivo para identificar este plano facilmente
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!planName.trim() || isSaving}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Salvando...' : 'Salvar Plano'}
          </button>
        </div>
      </div>
    </div>
  );
}
