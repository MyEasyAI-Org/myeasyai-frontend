import { Bell } from 'lucide-react';

type NotificationBellProps = {
  unreadCount: number;
  onClick: () => void;
  isOpen: boolean;
};

export default function NotificationBell({ unreadCount, onClick, isOpen }: NotificationBellProps) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-lg p-2 transition-all ${
        isOpen
          ? 'bg-slate-700/50 text-blue-400'
          : 'text-slate-300 hover:bg-slate-700/30 hover:text-blue-400'
      }`}
      aria-label="Notificações"
    >
      <Bell className={`h-6 w-6 ${unreadCount > 0 ? 'animate-pulse' : ''}`} />

      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg shadow-red-500/50">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}
