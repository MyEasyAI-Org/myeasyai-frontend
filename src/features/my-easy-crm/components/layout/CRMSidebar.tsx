// =============================================
// MyEasyCRM - Sidebar Component
// =============================================

import { useState } from 'react';
import {
  Users,
  Building2,
  Target,
  CheckSquare,
  Activity,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  ArrowLeft,
} from 'lucide-react';
import type { CRMView } from '../../types';
import { useCRMTheme } from '../../contexts/ThemeContext';

interface CRMSidebarProps {
  currentView: CRMView;
  onViewChange: (view: CRMView) => void;
  onQuickAction?: (action: 'contact' | 'company' | 'deal' | 'task') => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onBackToDashboard?: () => void;
}

interface NavItem {
  id: CRMView;
  label: string;
  icon: typeof Users;
  badge?: number;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Visao Geral', icon: LayoutDashboard },
  { id: 'contacts', label: 'Contatos', icon: Users },
  { id: 'companies', label: 'Empresas', icon: Building2 },
  { id: 'deals', label: 'Vendas', icon: Target },
  { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
  { id: 'activities', label: 'Historico', icon: Activity },
];

export function CRMSidebar({
  currentView,
  onViewChange,
  onQuickAction,
  collapsed = false,
  onCollapsedChange,
  onBackToDashboard,
}: CRMSidebarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { isDark } = useCRMTheme();

  return (
    <aside
      className={`
        flex flex-col border-r transition-all duration-300
        ${collapsed ? 'w-16' : 'w-64'}
        ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}
      `}
    >
      {/* Header */}
      <div className={`flex items-center justify-between h-16 px-4 border-b ${
        isDark ? 'border-slate-700' : 'border-gray-200'
      }`}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              MyEasyCRM
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
        )}
        {onCollapsedChange && !collapsed && (
          <button
            type="button"
            onClick={() => onCollapsedChange(true)}
            className={`p-1.5 rounded-lg ${
              isDark
                ? 'hover:bg-slate-800 text-slate-500'
                : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Actions */}
      {!collapsed && onQuickAction && (
        <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onQuickAction('contact')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isDark
                  ? 'text-slate-300 bg-slate-800 hover:bg-slate-700'
                  : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <Plus className="w-4 h-4" />
              Contato
            </button>
            <button
              type="button"
              onClick={() => onQuickAction('deal')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isDark
                  ? 'text-slate-300 bg-slate-800 hover:bg-slate-700'
                  : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <Plus className="w-4 h-4" />
              Negocio
            </button>
            <button
              type="button"
              onClick={() => onQuickAction('company')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isDark
                  ? 'text-slate-300 bg-slate-800 hover:bg-slate-700'
                  : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <Plus className="w-4 h-4" />
              Empresa
            </button>
            <button
              type="button"
              onClick={() => onQuickAction('task')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isDark
                  ? 'text-slate-300 bg-slate-800 hover:bg-slate-700'
                  : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <Plus className="w-4 h-4" />
              Tarefa
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      {!collapsed && (
        <div className="px-4 py-3">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
              isDark ? 'text-slate-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Buscar..."
              className={`w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              type="button"
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                ${isActive
                  ? isDark
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-blue-50 text-blue-700'
                  : isDark
                    ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 ${isActive ? (isDark ? 'text-blue-400' : 'text-blue-600') : ''}`} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      isDark
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Button (when collapsed) */}
      {collapsed && onCollapsedChange && (
        <div className={`p-3 border-t ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
          <button
            type="button"
            onClick={() => onCollapsedChange(false)}
            className={`w-full p-2 rounded-lg ${
              isDark
                ? 'hover:bg-slate-800 text-slate-500'
                : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <ChevronRight className="w-4 h-4 mx-auto" />
          </button>
        </div>
      )}

      {/* Footer */}
      {!collapsed && (
        <div className={`p-4 border-t space-y-3 ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
          {onBackToDashboard && (
            <button
              type="button"
              onClick={onBackToDashboard}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Dashboard
            </button>
          )}
          <div className={`text-xs text-center ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
            MyEasyCRM v1.0
          </div>
        </div>
      )}
    </aside>
  );
}
