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
      className={`relative rounded-lg px-3 py-3.5 transition-all ${
        isOpen
          ? 'bg-slate-700/50 text-blue-400'
          : 'text-slate-300 hover:bg-slate-700/30 hover:text-blue-400'
      }`}
      aria-label="Notificações"
    >
      <Bell className={`h-6 w-6 ${unreadCount > 0 ? 'animate-pulse' : ''}`} />

      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg shadow-red-500/50 leading-none">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}
