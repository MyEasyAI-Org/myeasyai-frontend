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
  Moon,
  Sun,
} from 'lucide-react';
import type { CRMView } from '../../types';
import { useCRMTheme } from '../../contexts/ThemeContext';

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
  const { isDark, toggleTheme } = useCRMTheme();

  return (
    <header className={`h-16 border-b flex items-center justify-between px-4 lg:px-6 ${
      isDark
        ? 'bg-slate-900 border-slate-700'
        : 'bg-white border-gray-200'
    }`}>
      {/* Left side */}
      <div className="flex items-center gap-4">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            className={`lg:hidden p-2 rounded-lg ${
              isDark
                ? 'hover:bg-slate-800 text-slate-400'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {viewTitles[currentView]}
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Global Search */}
        <div className="hidden md:block relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
            isDark ? 'text-slate-500' : 'text-gray-400'
          }`} />
          <input
            type="text"
            placeholder="Buscar em tudo..."
            className={`w-64 pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
            }`}
          />
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-colors ${
            isDark
              ? 'hover:bg-slate-800 text-slate-400 hover:text-yellow-400'
              : 'hover:bg-gray-100 text-gray-600 hover:text-slate-900'
          }`}
          title={isDark ? 'Modo claro' : 'Modo noturno'}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-lg ${
              isDark
                ? 'hover:bg-slate-800 text-slate-400'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}
                onKeyDown={(e) => e.key === 'Escape' && setShowNotifications(false)}
              />
              <div className={`absolute right-0 mt-2 w-80 rounded-xl shadow-lg border z-20 ${
                isDark
                  ? 'bg-slate-800 border-slate-700'
                  : 'bg-white border-gray-200'
              }`}>
                <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Notificações
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className={`p-4 text-center text-sm ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                    Nenhuma notificação no momento
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Help */}
        <button
          type="button"
          className={`p-2 rounded-lg ${
            isDark
              ? 'hover:bg-slate-800 text-slate-400'
              : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Settings */}
        {onSettings && (
          <button
            type="button"
            onClick={onSettings}
            className={`p-2 rounded-lg ${
              isDark
                ? 'hover:bg-slate-800 text-slate-400'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Settings className="w-5 h-5" />
          </button>
        )}

        {/* User Menu */}
        <div className="relative ml-2">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center gap-2 p-1.5 rounded-lg ${
              isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className={`hidden md:block text-sm font-medium ${
              isDark ? 'text-slate-300' : 'text-gray-700'
            }`}>
              {userName}
            </span>
            <ChevronDown className={`hidden md:block w-4 h-4 ${
              isDark ? 'text-slate-500' : 'text-gray-500'
            }`} />
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
                onKeyDown={(e) => e.key === 'Escape' && setShowUserMenu(false)}
              />
              <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-lg border z-20 ${
                isDark
                  ? 'bg-slate-800 border-slate-700'
                  : 'bg-white border-gray-200'
              }`}>
                <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {userName}
                  </p>
                  {userEmail && (
                    <p className={`text-sm truncate ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {userEmail}
                    </p>
                  )}
                </div>
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      onSettings?.();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg ${
                      isDark
                        ? 'text-slate-300 hover:bg-slate-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    Configurações
                  </button>
                  {onLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg ${
                        isDark
                          ? 'text-red-400 hover:bg-red-500/10'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
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
