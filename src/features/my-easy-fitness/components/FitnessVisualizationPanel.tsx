/**
 * FitnessVisualizationPanel
 *
 * Main visualization panel with tabs for different fitness data views.
 * Uses FitnessContext for state management.
 */

import {
  Activity,
  Dumbbell,
  LayoutDashboard,
  Salad,
  UserRound,
  Library,
} from 'lucide-react';
import {
  IconRun,
  IconYoga,
  IconStretching,
  IconBarbell,
  IconBike,
  IconSwimming,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useFitnessContext } from '../contexts';
import { ModalidadeTab } from './ModalidadeTab';
import { TreinosTab } from './TreinosTab';
import { ExerciciosTab } from './ExerciciosTab';
import { TabButton } from './shared';
import { VisaoGeralTab, DietaTab, PersonalInfoTab } from './tabs';

type TabId = 'visao-geral' | 'personal-info' | 'modalidade' | 'treinos' | 'dieta' | 'exercicios';

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
    { id: 'personal-info' as TabId, label: 'Informações Pessoais', icon: UserRound },
    { id: 'modalidade' as TabId, label: 'Modalidade', icon: Activity },
    { id: 'treinos' as TabId, label: 'Treinos', icon: Dumbbell },
    { id: 'dieta' as TabId, label: 'Dieta', icon: Salad },
    { id: 'exercicios' as TabId, label: 'Biblioteca de exercícios', icon: Library },
  ];

  return (
    <div className="flex-1 min-h-0 bg-slate-900/30 flex flex-col relative overflow-hidden">
      {/* Decorative watermark background icons */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top row */}
        <IconYoga className="absolute top-8 left-[10%] w-12 h-12 text-lime-400 opacity-[0.12]" />
        <IconBarbell className="absolute top-12 left-[40%] w-14 h-14 text-lime-400 opacity-[0.12]" />
        <IconRun className="absolute top-6 right-[15%] w-12 h-12 text-lime-400 opacity-[0.12]" />
        {/* Middle row */}
        <IconBike className="absolute top-[35%] left-[5%] w-14 h-14 text-lime-400 opacity-[0.12]" />
        <IconSwimming className="absolute top-[40%] left-[30%] w-12 h-12 text-lime-400 opacity-[0.12]" />
        <IconStretching className="absolute top-[38%] right-[25%] w-14 h-14 text-lime-400 opacity-[0.12]" />
        <IconYoga className="absolute top-[32%] right-[5%] w-12 h-12 text-lime-400 opacity-[0.12]" />
        {/* Bottom row */}
        <IconBarbell className="absolute bottom-[30%] left-[15%] w-12 h-12 text-lime-400 opacity-[0.12]" />
        <IconRun className="absolute bottom-[25%] left-[45%] w-14 h-14 text-lime-400 opacity-[0.12]" />
        <IconBike className="absolute bottom-[28%] right-[10%] w-12 h-12 text-lime-400 opacity-[0.12]" />
        {/* Very bottom */}
        <IconSwimming className="absolute bottom-8 left-[20%] w-12 h-12 text-lime-400 opacity-[0.12]" />
        <IconStretching className="absolute bottom-12 left-[55%] w-14 h-14 text-lime-400 opacity-[0.12]" />
        <IconYoga className="absolute bottom-6 right-[12%] w-12 h-12 text-lime-400 opacity-[0.12]" />
      </div>

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
          <div className="flex-shrink-0 px-3 hidden lg:block text-center">
            <div
              className="border border-[#4285F4]/50 rounded-md px-3 py-1.5 bg-[#4285F4]/5"
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
              <p className="text-[10px] text-[#4285F4] leading-tight">
                Esse módulo não substitui a orientação
                <br />
                e acompanhamento de profissionais habilitados
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === 'visao-geral' && (
          <VisaoGeralTab personalInfo={personalInfo} treinos={treinos} dieta={dieta} />
        )}
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
