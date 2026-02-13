import { Menu } from 'lucide-react';
import type { EmployerView } from '../../../types';

interface EmployerHeaderProps {
  currentView: EmployerView;
  onMenuToggle?: () => void;
}

const VIEW_TITLES: Record<EmployerView, string> = {
  overview: 'Visão Geral',
  jobs: 'Vagas',
  candidates: 'Candidatos',
  screening: 'Triagem com IA',
};

export function EmployerHeader({ currentView, onMenuToggle }: EmployerHeaderProps) {
  return (
    <header className="flex h-16 items-center border-b border-slate-700 bg-slate-900 px-4 lg:px-6">
      <div className="flex items-center gap-4">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-xl font-semibold text-white">
          {VIEW_TITLES[currentView]}
        </h1>
      </div>
    </header>
  );
}
