// =============================================
// MyEasyCRM - Header Component
// =============================================

import { useState } from 'react';
import {
  Bell,
  Settings,
  HelpCircle,
  User,
  LogOut,
  ChevronDown,
  Search,
  Menu,
} from 'lucide-react';
import type { CRMView } from '../../types';

interface CRMHeaderProps {
  currentView: CRMView;
  onMenuToggle?: () => void;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
  onSettings?: () => void;
}

const viewTitles: Record<CRMView, string> = {
  dashboard: 'Dashboard',
  contacts: 'Contatos',
  companies: 'Empresas',
  deals: 'Pipeline de Vendas',
  tasks: 'Tarefas',
  activities: 'Atividades',
  'contact-detail': 'Detalhes do Contato',
  'company-detail': 'Detalhes da Empresa',
  'deal-detail': 'Detalhes do Deal',
};

export function CRMHeader({
  currentView,
  onMenuToggle,
  userName = 'Usuário',
  userEmail,
  onLogout,
  onSettings,
}: CRMHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      {/* Left side */}
      <div className="flex items-center gap-4">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-xl font-semibold text-gray-900">
          {viewTitles[currentView]}
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Global Search */}
        <div className="hidden md:block relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar em tudo..."
            className="w-64 pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-20">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notificações</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-4 text-center text-gray-500 text-sm">
                    Nenhuma notificação no momento
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Help */}
        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Settings */}
        {onSettings && (
          <button
            onClick={onSettings}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}

        {/* User Menu */}
        <div className="relative ml-2">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700">
              {userName}
            </span>
            <ChevronDown className="hidden md:block w-4 h-4 text-gray-500" />
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-20">
                <div className="p-4 border-b border-gray-200">
                  <p className="font-medium text-gray-900">{userName}</p>
                  {userEmail && (
                    <p className="text-sm text-gray-500 truncate">{userEmail}</p>
                  )}
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onSettings?.();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4" />
                    Configurações
                  </button>
                  {onLogout && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
