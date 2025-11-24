import { useState } from 'react';
import { toast } from 'sonner';
import { useModalState } from '../../hooks/useModalState';

export function DangerZoneModal() {
  const [isDangerZoneOpen, setIsDangerZoneOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const confirmationModal = useModalState();
  const cancelModal = useModalState();

  return (
    <>
      {/* Danger Zone Accordion */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
        <div className="border-t border-slate-700 pt-6">
          <button
            onClick={() => setIsDangerZoneOpen(!isDangerZoneOpen)}
            className="flex w-full items-center justify-between text-left"
          >
            <div>
              <h3 className="text-sm font-medium text-rose-300">
                Zona de Perigo
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ações irreversíveis que afetam sua conta
              </p>
            </div>
            <svg
              className={`h-5 w-5 text-rose-300 transition-transform ${isDangerZoneOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isDangerZoneOpen && (
            <div className="mt-4 rounded-lg border border-rose-900/30 bg-rose-950/20 p-4">
              <p className="text-sm text-slate-400 mb-4">
                As ações aqui realizadas são permanentes e não podem ser
                desfeitas.
              </p>
              <button
                onClick={confirmationModal.open}
                className="rounded-lg border border-rose-800/50 bg-rose-900/30 px-4 py-2 text-sm text-rose-300 hover:bg-rose-900/50 transition-colors"
              >
                Acessar Zona de Perigo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal - Type YES */}
      {confirmationModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="mx-4 max-w-md rounded-lg border border-rose-900/50 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-rose-300">
              ⚠️ Zona de Perigo
            </h2>
            <p className="mt-4 text-slate-300">
              Você está prestes a acessar a{' '}
              <strong className="text-rose-300">Zona de Perigo</strong>.
            </p>
            <p className="mt-2 text-sm text-slate-400">
              As ações realizadas aqui são{' '}
              <strong className="text-rose-400">
                permanentes e irreversíveis
              </strong>
              . Tenha certeza absoluta antes de prosseguir.
            </p>

            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Digite <strong className="text-rose-300">YES</strong> (em
                maiúsculas) para confirmar:
              </label>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-rose-500 focus:outline-none"
                placeholder="YES"
                autoFocus
              />
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  confirmationModal.close();
                  setConfirmationText('');
                }}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (confirmationText === 'YES') {
                    confirmationModal.close();
                    cancelModal.open();
                    setConfirmationText('');
                  }
                }}
                disabled={confirmationText !== 'YES'}
                className={`flex-1 rounded-lg px-4 py-2 text-white transition-colors ${
                  confirmationText === 'YES'
                    ? 'bg-rose-800 hover:bg-rose-700'
                    : 'bg-slate-700 cursor-not-allowed opacity-50'
                }`}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription Modal - Final Warning */}
      {cancelModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="mx-4 max-w-lg rounded-lg border border-rose-900/50 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-rose-400">
              🚨 Cancelar Assinatura
            </h2>

            <div className="mt-4 space-y-3">
              <p className="text-slate-300">
                Tem certeza que deseja cancelar sua assinatura?
              </p>

              <div className="rounded-lg border border-blue-900/50 bg-blue-950/30 p-4">
                <p className="text-sm text-blue-300 font-semibold mb-2">
                  💡 Considere antes de cancelar:
                </p>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Você perderá acesso a todos os recursos premium</li>
                  <li>
                    • Seus dados e projetos serão mantidos por apenas 30 dias
                  </li>
                  <li>• Tokens não utilizados serão perdidos</li>
                  <li>• Esta ação não pode ser desfeita</li>
                </ul>
              </div>

              <p className="text-xs text-slate-500 italic">
                💬 Que tal conversar com nosso suporte antes? Podemos ajudar
                com qualquer problema que esteja enfrentando.
              </p>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={cancelModal.close}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700 transition-colors font-semibold"
              >
                Manter Assinatura
              </button>
              <button
                onClick={() => {
                  toast.warning('Cancelamento solicitado', {
                    description: 'Nossa equipe entrará em contato em breve.',
                  });
                  cancelModal.close();
                  setIsDangerZoneOpen(false);
                }}
                className="flex-1 rounded-lg border border-rose-800/50 bg-rose-900/30 px-4 py-2.5 text-rose-300 hover:bg-rose-900/50 transition-colors"
              >
                Cancelar Mesmo Assim
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
