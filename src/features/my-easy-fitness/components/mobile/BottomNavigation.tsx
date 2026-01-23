/**
 * BottomNavigation Component
 *
 * Fixed bottom navigation bar for mobile devices.
 * Shows 5 main tabs: Visão Geral, Progresso, Treinos, Dieta, Mais
 */

import { LayoutDashboard, Trophy, Dumbbell, Salad, MoreHorizontal } from 'lucide-react';
import type { TabId } from '../../contexts/FitnessContext';

interface BottomNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onMoreClick: () => void;
}

const NAV_ITEMS: Array<{
  id: TabId | 'more';
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: 'visao-geral', label: 'Geral', icon: LayoutDashboard },
  { id: 'progresso', label: 'Progresso', icon: Trophy },
  { id: 'treinos', label: 'Treinos', icon: Dumbbell },
  { id: 'dieta', label: 'Dieta', icon: Salad },
  { id: 'more', label: 'Mais', icon: MoreHorizontal },
];

// Tabs that appear in "More" menu
const MORE_TABS: TabId[] = ['personal-info', 'modalidade', 'exercicios'];

export function BottomNavigation({ activeTab, onTabChange, onMoreClick }: BottomNavigationProps) {
  const isMoreActive = MORE_TABS.includes(activeTab);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700 sm:hidden">
      <div className="flex items-center justify-around h-16 px-2 pb-safe">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === 'more' ? isMoreActive : activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'more') {
                  onMoreClick();
                } else {
                  onTabChange(item.id as TabId);
                }
              }}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[56px] rounded-lg transition-colors ${
                isActive
                  ? 'text-lime-400 bg-lime-400/10'
                  : 'text-slate-400 hover:text-slate-300 active:bg-slate-800'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
