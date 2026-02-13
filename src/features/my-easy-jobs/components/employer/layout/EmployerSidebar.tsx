import { useState } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Brain,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import type { EmployerView } from '../../../types';

interface EmployerSidebarProps {
  currentView: EmployerView;
  onViewChange: (view: EmployerView) => void;
  onBackToLanding: () => void;
}

interface NavItem {
  id: EmployerView;
  label: string;
  icon: typeof LayoutDashboard;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'jobs', label: 'Vagas', icon: Briefcase },
  { id: 'candidates', label: 'Candidatos', icon: Users },
  { id: 'screening', label: 'Triagem IA', icon: Brain },
];

export function EmployerSidebar({
  currentView,
  onViewChange,
  onBackToLanding,
}: EmployerSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col border-r border-slate-700 bg-slate-900 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-700 px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-white">Contratante</span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
        )}
        {!collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              type="button"
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-400' : ''}`} />
              {!collapsed && (
                <span className="flex-1 text-left font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Button (when collapsed) */}
      {collapsed && (
        <div className="border-t border-slate-700 p-3">
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="w-full rounded-lg p-2 text-slate-500 hover:bg-slate-800"
          >
            <ChevronRight className="mx-auto h-4 w-4" />
          </button>
        </div>
      )}

      {/* Footer */}
      {!collapsed && (
        <div className="space-y-3 border-t border-slate-700 p-4">
          <button
            type="button"
            onClick={onBackToLanding}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Trocar Perfil
          </button>
        </div>
      )}
    </aside>
  );
}
