// =============================================
// MyEasyCRM - Lost Reason Modal Component
// =============================================

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface LostReasonModalProps {
  isOpen: boolean;
  dealTitle: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isSubmitting?: boolean;
}

const COMMON_REASONS = [
  'Preço muito alto',
  'Optou pela concorrência',
  'Projeto cancelado',
  'Falta de orçamento',
  'Timing inadequado',
  'Mudança de prioridades',
  'Sem retorno do cliente',
  'Outro',
];

export function LostReasonModal({
  isOpen,
  dealTitle,
  onClose,
  onConfirm,
  isSubmitting = false,
}: LostReasonModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState('');

  const handleConfirm = () => {
    const reason = selectedReason === 'Outro' ? customReason : selectedReason;
    if (reason.trim()) {
      onConfirm(reason);
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Motivo da Perda</h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <p className="text-gray-600 mb-4">
              Por que o deal <span className="font-medium">"{dealTitle}"</span> foi perdido?
            </p>

            <div className="space-y-2">
              {COMMON_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                    ${selectedReason === reason
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="lostReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">{reason}</span>
                </label>
              ))}
            </div>

            {selectedReason === 'Outro' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descreva o motivo
                </label>
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 resize-none"
                  placeholder="Descreva o motivo da perda..."
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting || !selectedReason || (selectedReason === 'Outro' && !customReason.trim())}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Marcar como Perdido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
