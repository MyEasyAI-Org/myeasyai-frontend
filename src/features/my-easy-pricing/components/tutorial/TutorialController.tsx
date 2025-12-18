// =============================================================================
// TutorialController - Orchestrates the entire tutorial flow
// =============================================================================

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { TutorialOverlay } from './TutorialOverlay';
import { TutorialTooltip } from './TutorialTooltip';
import { TutorialFinishModal } from './TutorialFinishModal';
import { useTutorial } from '../../hooks/useTutorial';
import { tutorialDemoService } from '../../services/TutorialDemoService';
import type { Store, Product, IndirectCost, HiddenCost, TaxItem } from '../../types/pricing.types';

// =============================================================================
// Types
// =============================================================================

interface TutorialControllerProps {
  userUuid: string | null;
  onDemoDataCreated: (
    store: Store,
    product: Product,
    indirectCosts: IndirectCost[],
    hiddenCosts: HiddenCost[],
    taxItems: TaxItem[]
  ) => void;
  onDemoDataDeleted: (storeId: string) => void;
  onSelectStore: (storeId: string) => void;
}

// =============================================================================
// Component
// =============================================================================

export function TutorialController({
  userUuid,
  onDemoDataCreated,
  onDemoDataDeleted,
  onSelectStore,
}: TutorialControllerProps) {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------
  const {
    tutorialState,
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    startTutorial,
    nextStep,
    previousStep,
    skipTutorial,
    finishTutorial,
    resetTutorial,
  } = useTutorial();

  // ---------------------------------------------------------------------------
  // Local State
  // ---------------------------------------------------------------------------
  const [isLoading, setIsLoading] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);

  // ---------------------------------------------------------------------------
  // Start Tutorial - Create demo data
  // ---------------------------------------------------------------------------
  const handleStartTutorial = useCallback(async () => {
    if (!userUuid) {
      toast.error('Usuario nao autenticado');
      return;
    }

    setIsLoading(true);

    try {
      // Check for existing demo data
      const { hasDemoData, storeId: existingStoreId } = await tutorialDemoService.hasExistingDemoData(userUuid);

      if (hasDemoData && existingStoreId) {
        // Delete existing demo data first
        await tutorialDemoService.deleteDemoData(existingStoreId);
      }

      // Create new demo data
      const result = await tutorialDemoService.createDemoData(userUuid);

      if (!result.success || !result.data) {
        toast.error('Erro ao criar dados de demonstracao');
        return;
      }

      const { store, product, indirectCosts, hiddenCosts, taxItems } = result.data;

      // Notify parent component about new data
      onDemoDataCreated(store, product, indirectCosts, hiddenCosts, taxItems);

      // Select the demo store
      onSelectStore(store.id);

      // Start the tutorial
      startTutorial(store.id, product.id);

      toast.success('Tutorial iniciado!');
    } catch (error) {
      console.error('[TutorialController] Error starting tutorial:', error);
      toast.error('Erro ao iniciar tutorial');
    } finally {
      setIsLoading(false);
    }
  }, [userUuid, onDemoDataCreated, onSelectStore, startTutorial]);

  // ---------------------------------------------------------------------------
  // Skip Tutorial
  // ---------------------------------------------------------------------------
  const handleSkip = useCallback(() => {
    skipTutorial();
    setShowFinishModal(true);
  }, [skipTutorial]);

  // ---------------------------------------------------------------------------
  // Finish Tutorial
  // ---------------------------------------------------------------------------
  const handleFinish = useCallback(() => {
    finishTutorial();
    setShowFinishModal(true);
  }, [finishTutorial]);

  // ---------------------------------------------------------------------------
  // Keep Demo Data
  // ---------------------------------------------------------------------------
  const handleKeepDemoData = useCallback(async () => {
    if (!tutorialState.demoStoreId) {
      setShowFinishModal(false);
      resetTutorial();
      return;
    }

    setIsLoading(true);

    try {
      // Convert demo store to regular store
      const result = await tutorialDemoService.convertDemoToRegular(tutorialState.demoStoreId);

      if (result.success) {
        toast.success('Dados de demonstracao mantidos!');
      } else {
        toast.error('Erro ao manter dados');
      }
    } catch (error) {
      console.error('[TutorialController] Error keeping demo data:', error);
      toast.error('Erro ao manter dados');
    } finally {
      setIsLoading(false);
      setShowFinishModal(false);
      resetTutorial();
    }
  }, [tutorialState.demoStoreId, resetTutorial]);

  // ---------------------------------------------------------------------------
  // Delete Demo Data
  // ---------------------------------------------------------------------------
  const handleDeleteDemoData = useCallback(async () => {
    if (!tutorialState.demoStoreId) {
      setShowFinishModal(false);
      resetTutorial();
      return;
    }

    setIsLoading(true);

    try {
      const result = await tutorialDemoService.deleteDemoData(tutorialState.demoStoreId);

      if (result.success) {
        onDemoDataDeleted(tutorialState.demoStoreId);
        toast.success('Dados de demonstracao excluidos!');
      } else {
        toast.error('Erro ao excluir dados');
      }
    } catch (error) {
      console.error('[TutorialController] Error deleting demo data:', error);
      toast.error('Erro ao excluir dados');
    } finally {
      setIsLoading(false);
      setShowFinishModal(false);
      resetTutorial();
    }
  }, [tutorialState.demoStoreId, onDemoDataDeleted, resetTutorial]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <>
      {/* Tutorial Overlay */}
      <TutorialOverlay
        isActive={tutorialState.isActive}
        currentStep={currentStep}
      />

      {/* Tutorial Tooltip */}
      <TutorialTooltip
        isActive={tutorialState.isActive}
        currentStep={currentStep}
        stepNumber={tutorialState.currentStep + 1}
        totalSteps={totalSteps}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        onNext={nextStep}
        onPrevious={previousStep}
        onSkip={handleSkip}
        onFinish={handleFinish}
      />

      {/* Finish Modal */}
      <TutorialFinishModal
        isOpen={showFinishModal}
        onKeep={handleKeepDemoData}
        onDelete={handleDeleteDemoData}
        isLoading={isLoading}
      />
    </>
  );
}

// =============================================================================
// Export start function for external use
// =============================================================================

export { useTutorial };
