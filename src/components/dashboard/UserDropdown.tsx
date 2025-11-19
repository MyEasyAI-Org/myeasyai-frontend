import { LogOut, Settings, User as UserIcon } from 'lucide-react';
import { useEffect } from 'react';
import type { UserProfile } from '../../hooks/useUserData';
import { Avatar } from './Avatar';

type UserDropdownProps = {
  profile: UserProfile;
  onNavigateToProfile: () => void;
  onNavigateToSettings: () => void;
  onLogout: () => void;
  onClose: () => void;
};

export function UserDropdown({
  profile,
  onNavigateToProfile,
  onNavigateToSettings,
  onLogout,
  onClose,
}: UserDropdownProps) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-user-dropdown]')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      data-user-dropdown
      className="absolute right-0 mt-2 w-64 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200 rounded-xl border border-slate-700 bg-slate-800/99 backdrop-blur-xl shadow-2xl shadow-black/50"
    >
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-purple-500/40">
            <Avatar
              name={profile.name}
              avatarUrl={profile.avatar_url}
              size="md"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {profile.name}
            </p>
            <p className="text-xs text-slate-400 truncate">{profile.email}</p>
          </div>
        </div>
      </div>

      <div className="p-2">
        <button
          onClick={() => {
            onClose();
            onNavigateToProfile();
          }}
          className="flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-left text-slate-200 transition-colors hover:bg-slate-700"
        >
          <UserIcon className="h-4 w-4" />
          <span className="text-sm">Perfil</span>
        </button>
        <button
          onClick={() => {
            onClose();
            onNavigateToSettings();
          }}
          className="flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-left text-slate-200 transition-colors hover:bg-slate-700"
        >
          <Settings className="h-4 w-4" />
          <span className="text-sm">Configurações</span>
        </button>
      </div>

      <div className="border-t border-slate-700 p-2">
        <button
          onClick={() => {
            onClose();
            onLogout();
          }}
          className="flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-left text-red-400 transition-colors hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
}
