/**
 * MyEasyFitness
 *
 * Main component for the fitness assistant module.
 * Uses clean architecture with separated concerns:
 * - hooks/ for state management
 * - utils/ for business logic
 * - components/ for UI
 * - types/ for type definitions
 * - constants/ for configuration
 */

import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { FitnessChatPanel } from './components/FitnessChatPanel';
import { FitnessVisualizationPanel } from './components/FitnessVisualizationPanel';
import { useFitnessData } from './hooks/useFitnessData';
import { usePersonalInfoFlow } from './hooks/useAnamneseFlow';

type MyEasyFitnessProps = {
  onBackToDashboard: () => void;
  userName?: string;
};

export function MyEasyFitness({ onBackToDashboard, userName }: MyEasyFitnessProps) {
  // Data state management
  const {
    personalInfo,
    treinos,
    dieta,
    updatePersonalInfo,
    addTreino,
    updateDieta,
    setTreinos,
  } = useFitnessData(userName);

  // Conversation flow management
  const {
    messages,
    inputMessage,
    isGenerating,
    setInputMessage,
    handleSendMessage,
  } = usePersonalInfoFlow({
    personalInfo,
    treinos,
    dieta,
    onUpdatePersonalInfo: updatePersonalInfo,
    onAddTreino: addTreino,
    onSetTreinos: setTreinos,
    onUpdateDieta: updateDieta,
  });

  const handleBack = () => {
    if (onBackToDashboard) {
      onBackToDashboard();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-black-main to-blue-main text-white flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-slate-800 bg-black-main/50 backdrop-blur-sm">
        <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <img
                src="/bone-logo.png"
                alt="MyEasyAI Logo"
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
              />
              <div>
                <span className="bg-gradient-to-r from-lime-400 to-green-500 bg-clip-text text-lg sm:text-xl font-bold text-transparent">
                  MyEasyFitness
                </span>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Seu assistente de treinos e saude
                </p>
              </div>
            </div>
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Voltar ao Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      {/* Disclaimer Banner */}
      <div className="flex-shrink-0 bg-amber-900/30 border-b border-amber-700/50 px-4 py-2">
        <div className="mx-auto max-w-[1920px] flex items-center justify-center gap-2 text-amber-200 text-xs sm:text-sm">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>
            Este assistente de IA nao substitui o acompanhamento de profissionais de saude, educacao fisica ou nutricao.
          </span>
        </div>
      </div>

      {/* Main Content - Two Panels */}
      <main className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Panel - Chat */}
        <FitnessChatPanel
          messages={messages}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          isGenerating={isGenerating}
          onSendMessage={handleSendMessage}
        />

        {/* Right Panel - Dashboard with Tabs */}
        <FitnessVisualizationPanel
          personalInfo={personalInfo}
          treinos={treinos}
          dieta={dieta}
          onUpdatePersonalInfo={updatePersonalInfo}
          onUpdateTreinos={setTreinos}
          onUpdateDieta={updateDieta}
        />
      </main>
    </div>
  );
}
