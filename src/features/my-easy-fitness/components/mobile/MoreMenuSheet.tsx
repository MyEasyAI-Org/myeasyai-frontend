/**
 * MoreMenuSheet Component
 *
 * Bottom sheet that slides up showing overflow navigation items.
 * Contains: Personal Info, Modalidade, Biblioteca de Exercícios
 */

import { useEffect } from 'react';
import { UserRound, PersonStanding, BookOpen, X } from 'lucide-react';
import type { TabId } from '../../contexts/FitnessContext';

interface MoreMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: TabId) => void;
  activeTab: TabId;
}

const MORE_ITEMS: Array<{
  id: TabId;
  label: string;
  icon: typeof UserRound;
  description: string;
}> = [
  {
    id: 'personal-info',
    label: 'Informações Pessoais',
    icon: UserRound,
    description: 'Dados do perfil e preferências',
  },
  {
    id: 'modalidade',
    label: 'Modalidade',
    icon: PersonStanding,
    description: 'Tipo de treino e objetivos',
  },
  {
    id: 'exercicios',
    label: 'Biblioteca de Exercícios',
    icon: BookOpen,
    description: 'Catálogo completo de exercícios',
  },
];

export function MoreMenuSheet({ isOpen, onClose, onNavigate, activeTab }: MoreMenuSheetProps) {
  // Lock body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNavigate = (tab: TabId) => {
    onNavigate(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 sm:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out"
        role="dialog"
        aria-modal="true"
        aria-label="Menu Mais"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-slate-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Mais opções</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="p-4 pb-8 space-y-2">
          {MORE_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-lime-400/10 border border-lime-400/30'
                    : 'bg-slate-800/50 hover:bg-slate-800 active:bg-slate-700'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    isActive ? 'bg-lime-400/20 text-lime-400' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left flex-1">
                  <div
                    className={`font-medium ${isActive ? 'text-lime-400' : 'text-white'}`}
                  >
                    {item.label}
                  </div>
                  <div className="text-sm text-slate-400">{item.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
