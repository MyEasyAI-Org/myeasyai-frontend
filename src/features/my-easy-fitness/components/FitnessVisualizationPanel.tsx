/**
 * FitnessVisualizationPanel
 *
 * Main visualization panel with tabs for different fitness data views.
 * Uses FitnessContext for state management.
 */

import {
  Dumbbell,
  LayoutDashboard,
  Salad,
  UserRound,
  BookOpen,
  PersonStanding,
  Trophy,
} from 'lucide-react';
import { useState } from 'react';
import { useFitnessContext } from '../contexts';
import { ModalidadeTab } from './ModalidadeTab';
import { TreinosTab } from './TreinosTab';
import { ExerciciosTab } from './ExerciciosTab';
import { TabButton } from './shared';
import { VisaoGeralTab, DietaTab, PersonalInfoTab, ProgressoTab } from './tabs';

type TabId = 'visao-geral' | 'personal-info' | 'modalidade' | 'treinos' | 'dieta' | 'exercicios' | 'progresso';

export function FitnessVisualizationPanel() {
  const {
    personalInfo,
    treinos,
    dieta,
    selectedModality,
    updatePersonalInfo,
    setTreinos,
    updateDieta,
    setSelectedModality,
  } = useFitnessContext();

  const [activeTab, setActiveTab] = useState<TabId>('visao-geral');

  const tabs = [
    { id: 'visao-geral' as TabId, label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'progresso' as TabId, label: 'Progresso', icon: Trophy },
    { id: 'personal-info' as TabId, label: 'Informações Pessoais', icon: UserRound },
    { id: 'modalidade' as TabId, label: 'Modalidade', icon: PersonStanding },
    { id: 'treinos' as TabId, label: 'Treinos', icon: Dumbbell },
    { id: 'dieta' as TabId, label: 'Dieta', icon: Salad },
    { id: 'exercicios' as TabId, label: 'Biblioteca de exercícios', icon: BookOpen },
  ];

  return (
    <div className="flex-1 min-h-0 bg-slate-900/30 flex flex-col relative overflow-hidden">
      {/* Tabs */}
      <div className="flex-shrink-0 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center">
          <div className="flex overflow-x-auto flex-1">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                icon={tab.icon}
                label={tab.label}
              />
            ))}
          </div>
          {/* Disclaimer */}
          <div className="flex-shrink-0 px-2 text-center">
            <div
              className="border border-[#4285F4]/50 rounded px-2 py-1 bg-[#4285F4]/5"
              style={{
                animation: 'subtle-pulse 3s ease-in-out infinite',
              }}
            >
              <style>
                {`
                  @keyframes subtle-pulse {
                    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(66, 133, 244, 0); }
                    50% { opacity: 0.8; box-shadow: 0 0 12px 4px rgba(66, 133, 244, 0.3); }
                  }
                `}
              </style>
              <p className="text-[9px] text-[#4285F4] leading-tight">
                Esse módulo não substitui
                <br />
                a orientação e acompanhamento
                <br />
                de profissionais habilitados
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === 'visao-geral' && (
          <VisaoGeralTab
            personalInfo={personalInfo}
            treinos={treinos}
            dieta={dieta}
          />
        )}
        {activeTab === 'progresso' && <ProgressoTab />}
        {activeTab === 'personal-info' && (
          <PersonalInfoTab personalInfo={personalInfo} onUpdate={updatePersonalInfo} />
        )}
        {activeTab === 'modalidade' && (
          <ModalidadeTab
            selectedModality={selectedModality}
            onSelectModality={setSelectedModality}
          />
        )}
        {activeTab === 'treinos' && (
          <TreinosTab
            treinos={treinos}
            personalInfo={personalInfo}
            onUpdateTreinos={setTreinos}
          />
        )}
        {activeTab === 'exercicios' && <ExerciciosTab />}
        {activeTab === 'dieta' && <DietaTab dieta={dieta} onUpdate={updateDieta} />}
      </div>
    </div>
  );
}
