/**
 * MyEasyFitness
 *
 * Main component for the fitness assistant module.
 * Uses clean architecture with separated concerns:
 * - contexts/ for state management via React Context
 * - hooks/ for reusable logic
 * - utils/ for business logic
 * - components/ for UI
 * - types/ for type definitions
 * - constants/ for configuration
 */

import { ArrowLeft, MessageSquare } from 'lucide-react';
import { FitnessChatPanel } from './components/FitnessChatPanel';
import { FitnessVisualizationPanel } from './components/FitnessVisualizationPanel';
import { DemoProfilesButton } from './components/DemoProfilesButton';
import { FitnessErrorBoundary } from './components/FitnessErrorBoundary';
import { MobileDrawer, BottomNavigation, MoreMenuSheet } from './components/mobile';
import { FitnessProvider, useFitnessContext } from './contexts';
import { useMediaQuery } from './hooks';

type MyEasyFitnessProps = {
  onBackToDashboard: () => void;
  userName?: string;
};

/**
 * Inner content component that uses the fitness context
 */
function MyEasyFitnessContent({ onBackToDashboard }: { onBackToDashboard: () => void }) {
  const {
    updatePersonalInfo,
    mobileUI,
    setMobileChatDrawerOpen,
    setMoreMenuOpen,
    setActiveTab,
  } = useFitnessContext();
  const { isMobile } = useMediaQuery();

  const handleBack = () => {
    if (onBackToDashboard) {
      onBackToDashboard();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-black-main to-blue-main text-white flex flex-col relative">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-slate-800 bg-black-main/50 backdrop-blur-sm relative z-50">
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
            <div className="flex items-center gap-3">
              <DemoProfilesButton onLoadProfile={updatePersonalInfo} />
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Voltar ao Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden min-h-0 relative z-10">
        {/* Desktop/Tablet: Side-by-side chat panel */}
        <div className="hidden sm:flex sm:w-[35%] lg:w-[28%] min-w-0 border-r border-slate-800">
          <FitnessChatPanel />
        </div>

        {/* Right Panel - Dashboard with Tabs */}
        <FitnessVisualizationPanel />
      </main>

      {/* Mobile: Chat Drawer */}
      {isMobile && (
        <MobileDrawer
          isOpen={mobileUI.isChatDrawerOpen}
          onClose={() => setMobileChatDrawerOpen(false)}
          title="Assistente"
        >
          <FitnessChatPanel />
        </MobileDrawer>
      )}

      {/* Mobile: FAB for Chat */}
      <button
        onClick={() => setMobileChatDrawerOpen(true)}
        className="sm:hidden fixed bottom-20 right-4 z-30 w-14 h-14 bg-lime-500 hover:bg-lime-400 active:bg-lime-600 rounded-full shadow-lg shadow-lime-500/30 flex items-center justify-center transition-colors"
        aria-label="Abrir chat"
      >
        <MessageSquare className="w-6 h-6 text-slate-900" />
      </button>

      {/* Mobile: Bottom Navigation */}
      {isMobile && (
        <BottomNavigation
          activeTab={mobileUI.activeTab}
          onTabChange={setActiveTab}
          onMoreClick={() => setMoreMenuOpen(true)}
        />
      )}

      {/* Mobile: More Menu Sheet */}
      {isMobile && (
        <MoreMenuSheet
          isOpen={mobileUI.isMoreMenuOpen}
          onClose={() => setMoreMenuOpen(false)}
          onNavigate={setActiveTab}
          activeTab={mobileUI.activeTab}
        />
      )}
    </div>
  );
}

/**
 * Main component wrapped with FitnessProvider and ErrorBoundary
 */
export function MyEasyFitness({ onBackToDashboard, userName }: MyEasyFitnessProps) {
  return (
    <FitnessErrorBoundary>
      <FitnessProvider userName={userName}>
        <MyEasyFitnessContent onBackToDashboard={onBackToDashboard} />
      </FitnessProvider>
    </FitnessErrorBoundary>
  );
}
