import { Sparkles, User, CheckCheck } from 'lucide-react';
import type { Notification } from '../types/notification';

type NotificationDropdownProps = {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAllAsRead: () => void;
  onViewAll: () => void;
};

// Função helper para formatar timestamp relativo
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'agora mesmo';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `há ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `há ${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'}`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `há ${diffInWeeks} ${diffInWeeks === 1 ? 'semana' : 'semanas'}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return `há ${diffInMonths} ${diffInMonths === 1 ? 'mês' : 'meses'}`;
}

export default function NotificationDropdown({
  notifications,
  onNotificationClick,
  onMarkAllAsRead,
  onViewAll,
}: NotificationDropdownProps) {
  const hasUnread = notifications.some(n => !n.isRead);

  return (
    <div className="absolute right-0 mt-2 w-80 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200 rounded-xl border border-slate-700 bg-slate-800/95 backdrop-blur-xl shadow-2xl shadow-black/50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700 p-3">
        <h3 className="text-base font-semibold text-white">Notificações</h3>
        {hasUnread && (
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center space-x-1 rounded-lg px-2 py-1 text-xs text-slate-400 transition-colors hover:bg-slate-700 hover:text-blue-400"
          >
            <CheckCheck className="h-3 w-3" />
            <span>Marcar todas como lidas</span>
          </button>
        )}
      </div>

      {/* Lista de notificações */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center space-y-2 py-12">
            <div className="rounded-full bg-slate-700/50 p-4">
              <Sparkles className="h-8 w-8 text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-400">Nenhuma notificação</p>
            <p className="text-xs text-slate-500">Você está em dia!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => onNotificationClick(notification)}
                className="w-full px-3 py-2.5 text-left transition-colors hover:bg-slate-700"
              >
                <div className="flex items-start space-x-2.5">
                  {/* Ícone por tipo */}
                  <div className="flex-shrink-0 pt-1">
                    {notification.type === 'platform_update' ? (
                      <div className="rounded-lg bg-purple-500/20 p-2">
                        <Sparkles className="h-4 w-4 text-purple-400" />
                      </div>
                    ) : (
                      <div className="rounded-lg bg-blue-500/20 p-2">
                        <User className="h-4 w-4 text-blue-400" />
                      </div>
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between space-x-2">
                      <p className="text-sm font-medium text-slate-200 line-clamp-1">
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-2 w-2 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50" />
                        </div>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-slate-400 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-slate-700 p-2">
          <button
            onClick={onViewAll}
            className="w-full rounded-lg px-3 py-2 text-center text-sm font-medium text-blue-400 transition-colors hover:bg-slate-700"
          >
            Ver todas as notificações
          </button>
        </div>
      )}
    </div>
  );
}
