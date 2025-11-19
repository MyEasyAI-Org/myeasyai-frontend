import { useRef } from 'react';
import type { UserProfile } from '../../hooks/useUserData';
import { useModalState } from '../../hooks/useModalState';
import type { Notification } from '../../types/notification';
import { Avatar } from './Avatar';
import NotificationBell from '../NotificationBell';
import NotificationDropdown from '../NotificationDropdown';
import { UserDropdown } from './UserDropdown';

type DashboardHeaderProps = {
  profile: UserProfile;
  onGoHome?: () => void;
  unreadCount: number;
  latestNotifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAllAsRead: () => void;
  onViewAllNotifications: () => void;
  onNavigateToProfile: () => void;
  onNavigateToSettings: () => void;
  onLogout: () => void;
};

export function DashboardHeader({
  profile,
  onGoHome,
  unreadCount,
  latestNotifications,
  onNotificationClick,
  onMarkAllAsRead,
  onViewAllNotifications,
  onNavigateToProfile,
  onNavigateToSettings,
  onLogout,
}: DashboardHeaderProps) {
  const notificationRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationModal = useModalState({ disableScrollLock: true });
  const dropdownModal = useModalState({ disableScrollLock: true });

  return (
    <header className="relative z-50 border-b border-slate-800 bg-black-main/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() =>
                onGoHome ? onGoHome() : (window.location.href = '/')
              }
              className="flex items-center gap-3 cursor-pointer"
            >
              <img
                src="/bone-logo.png"
                alt="MyEasyAI Logo"
                className="h-12 w-12 object-contain"
              />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent">
                MyEasyAI Dashboard
              </span>
            </button>
          </div>
          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <NotificationBell
                unreadCount={unreadCount}
                onClick={notificationModal.toggle}
                isOpen={notificationModal.isOpen}
              />
              {notificationModal.isOpen && (
                <NotificationDropdown
                  notifications={latestNotifications}
                  onNotificationClick={onNotificationClick}
                  onMarkAllAsRead={onMarkAllAsRead}
                  onViewAll={onViewAllNotifications}
                />
              )}
            </div>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={dropdownModal.toggle}
                className="flex items-center space-x-3 rounded-lg border border-slate-700 bg-slate-700/30 px-3 py-2 transition-all hover:border-slate-600 hover:bg-slate-600/40 hover:shadow-lg hover:shadow-purple-500/20"
              >
                <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-purple-500/30">
                  <Avatar
                    name={profile.name}
                    avatarUrl={profile.avatar_url}
                    size="sm"
                  />
                </div>
                <span className="text-sm font-medium text-slate-200">
                  Olá, {profile.preferred_name || profile.name.split(' ')[0]}
                </span>
              </button>

              {dropdownModal.isOpen && (
                <UserDropdown
                  profile={profile}
                  onNavigateToProfile={onNavigateToProfile}
                  onNavigateToSettings={onNavigateToSettings}
                  onLogout={onLogout}
                  onClose={dropdownModal.close}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
