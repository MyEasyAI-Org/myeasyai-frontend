import { Sparkles, User, X } from 'lucide-react';
import type { Notification } from '../types/Notification';

type NotificationDetailModalProps = {
  notification: Notification | null;
  onClose: () => void;
};

// Função helper para formatar data completa
function formatFullDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
}

export default function NotificationDetailModal({
  notification,
  onClose,
}: NotificationDetailModalProps) {
  if (!notification) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 rounded-xl border border-slate-700 bg-slate-800 shadow-2xl shadow-black/50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-700 p-6">
            <div className="flex items-start space-x-3 flex-1 min-w-0 pr-4">
              {/* Ícone por tipo */}
              <div className="flex-shrink-0 pt-1">
                {notification.type === 'platform_update' ? (
                  <div className="rounded-lg bg-purple-500/20 p-3">
                    <Sparkles className="h-6 w-6 text-purple-400" />
                  </div>
                ) : (
                  <div className="rounded-lg bg-blue-500/20 p-3">
                    <User className="h-6 w-6 text-blue-400" />
                  </div>
                )}
              </div>

              {/* Título e badge */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-white mb-2">
                  {notification.title}
                </h2>
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      notification.type === 'platform_update'
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}
                  >
                    {notification.type === 'platform_update'
                      ? 'Atualização da Plataforma'
                      : 'Notificação Pessoal'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatFullDate(notification.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Botão fechar */}
            <button
              onClick={onClose}
              className="flex-shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="p-6">
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {notification.fullContent}
              </p>
            </div>

            {/* Link opcional */}
            {notification.linkUrl && (
              <div className="mt-6">
                <a
                  href={notification.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-sm font-medium text-white transition-all hover:from-blue-600 hover:to-purple-600 hover:shadow-lg hover:shadow-purple-500/25"
                >
                  Saiba mais
                </a>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-700 px-6 py-4">
            <button
              onClick={onClose}
              className="w-full rounded-lg border border-slate-600 bg-slate-700/30 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
