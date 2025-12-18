// =============================================================================
// TutorialFinishModal - Modal shown when tutorial finishes
// Asks user whether to keep or delete demo data
// =============================================================================

import { Modal } from '../../../../components/Modal';

interface TutorialFinishModalProps {
  isOpen: boolean;
  onKeep: () => void;
  onDelete: () => void;
  isLoading: boolean;
}

export function TutorialFinishModal({
  isOpen,
  onKeep,
  onDelete,
  isLoading,
}: TutorialFinishModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onDelete}
      title="🎉 Tutorial Concluido!"
      disableClose={isLoading}
    >
      <div className="space-y-4">
        <p className="text-slate-300">
          Parabéns! Você completou o tutorial de precificação.
        </p>
        <p className="text-slate-400 text-sm">
          O que você gostaria de fazer com os dados de demonstração?
        </p>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onDelete}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Excluindo...' : 'Excluir dados demo'}
          </button>
          <button
            onClick={onKeep}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Mantendo...' : 'Manter e usar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
