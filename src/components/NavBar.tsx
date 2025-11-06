import type { User } from '@supabase/supabase-js';
import { Home, LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import type { Notification } from '../types/notification';
import { Button } from './Button';
import NotificationBell from './NotificationBell';
import NotificationDetailModal from './NotificationDetailModal';
import NotificationDropdown from './NotificationDropdown';

type NavBarProps = {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  user?: User | null;
  userName?: string;
  userAvatarUrl?: string;
  onDashboardClick?: () => void;
  onLogout?: () => void;
  onLogoClick?: () => void;
  isCheckingAuth?: boolean;
};

export default function NavBar({
  onLoginClick,
  onSignupClick,
  user,
  userName = 'Usuário',
  userAvatarUrl,
  onDashboardClick,
  onLogout,
  onLogoClick,
  isCheckingAuth = false,
}: NavBarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Hook de notificações
  const { getUnreadCount, getLatest, markAsRead, markAllAsRead } =
    useNotifications();

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };

    if (isDropdownOpen || isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isNotificationOpen]);

  // Função para gerar iniciais do nome
  const getInitials = (name: string) => {
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Função para obter avatar (foto ou iniciais)
  const getAvatarContent = () => {
    // Se tiver avatar_url, exibir imagem
    if (userAvatarUrl) {
      return (
        <img
          src={userAvatarUrl}
          alt={userName}
          className="h-full w-full rounded-full object-cover"
        />
      );
    }

    // Caso contrário, exibir iniciais
    return (
      <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white font-bold">
        {getInitials(userName)}
      </div>
    );
  };

  // Função para smooth scroll
  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string,
  ) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handlers de notificações
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setSelectedNotification(notification);
    setIsNotificationOpen(false);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleViewAllNotifications = () => {
    setIsNotificationOpen(false);
    // Aqui você pode adicionar navegação para uma página de notificações se existir
    console.log('Ver todas as notificações');
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-slate-800 bg-black-main/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={onLogoClick} className="cursor-pointer">
              <img
                src="/bone-logo.png"
                alt="MyEasyAI Logo"
                className="h-12 w-12 object-contain"
              />
            </button>
            <button onClick={onLogoClick} className="cursor-pointer">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent">
                MyEasyAI
              </span>
            </button>
          </div>

          <div className="hidden space-x-8 md:flex">
            <a
              href="#features"
              onClick={(e) => handleSmoothScroll(e, 'features')}
              className="text-slate-300 transition-colors hover:text-blue-400 cursor-pointer"
            >
              Features
            </a>
            <a
              href="#preview"
              onClick={(e) => handleSmoothScroll(e, 'preview')}
              className="text-slate-300 transition-colors hover:text-blue-400 cursor-pointer"
            >
              Preview
            </a>
            <a
              href="#packages"
              onClick={(e) => handleSmoothScroll(e, 'packages')}
              className="text-slate-300 transition-colors hover:text-blue-400 cursor-pointer"
            >
              Pacotes
            </a>
            <a
              href="#cursos"
              onClick={(e) => handleSmoothScroll(e, 'cursos')}
              className="text-slate-300 transition-colors hover:text-blue-400 cursor-pointer"
            >
              Cursos
            </a>
            <a
              href="#contato"
              onClick={(e) => handleSmoothScroll(e, 'contato')}
              className="text-slate-300 transition-colors hover:text-blue-400 cursor-pointer"
            >
              Contato
            </a>
          </div>

          <div className="flex space-x-2 sm:space-x-3">
            {user ? (
              // Usuário logado - mostrar sino de notificação e dropdown menu
              <div className="flex items-center space-x-3">
                {/* Sino de Notificação */}
                <div className="relative" ref={notificationRef}>
                  <NotificationBell
                    unreadCount={getUnreadCount()}
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    isOpen={isNotificationOpen}
                  />
                  {isNotificationOpen && (
                    <NotificationDropdown
                      notifications={getLatest(10)}
                      onNotificationClick={handleNotificationClick}
                      onMarkAllAsRead={handleMarkAllAsRead}
                      onViewAll={handleViewAllNotifications}
                    />
                  )}
                </div>

                {/* Dropdown do Usuário */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-3 rounded-lg border border-slate-700 bg-slate-700/30 px-3 py-2 transition-all hover:border-slate-600 hover:bg-slate-600/40 hover:shadow-lg hover:shadow-purple-500/20"
                  >
                    <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-purple-500/30">
                      {getAvatarContent()}
                    </div>
                    <span className="text-sm font-medium text-slate-200">
                      Olá, {userName}
                    </span>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200 rounded-xl border border-slate-700 bg-slate-800/99 backdrop-blur-xl shadow-2xl shadow-black/50">
                      <div className="p-4 border-b border-slate-700">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-purple-500/40">
                            {getAvatarContent()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                              {userName}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onDashboardClick?.();
                          }}
                          className="flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-left text-slate-200 transition-colors hover:bg-slate-700"
                        >
                          <Home className="h-4 w-4" />
                          <span className="text-sm">Dashboard</span>
                        </button>
                      </div>

                      <div className="border-t border-slate-700 p-2">
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onLogout?.();
                          }}
                          className="flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-left text-red-400 transition-colors hover:bg-red-500/10"
                        >
                          <LogOut className="h-4 w-4" />
                          <span className="text-sm font-medium">Sair</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : isCheckingAuth ? (
              // Verificando autenticação - mostrar loading
              <div className="flex items-center space-x-2 px-4 py-2">
                <span className="loading-dots text-slate-300">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              </div>
            ) : (
              // Usuário não logado - mostrar Inscreva-se e Login
              <>
                <Button variant="ghostNav" onClick={onSignupClick}>
                  <span className="hidden sm:inline">Inscreva-se</span>
                  <span className="sm:hidden">Cadastrar</span>
                </Button>
                <Button variant="nav" onClick={onLoginClick}>
                  Login
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes de Notificação */}
      <NotificationDetailModal
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />
    </nav>
  );
}
