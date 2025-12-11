// =============================================================================
// useTutorial - Hook for managing the interactive tutorial
// =============================================================================

import { useState, useCallback, useMemo } from 'react';
import type { TutorialState, TutorialStep } from '../types/pricing.types';
import { PRICING_LABELS } from '../constants/pricing.constants';

// =============================================================================
// Types
// =============================================================================

export interface UseTutorialReturn {
  // State
  tutorialState: TutorialState;
  currentStep: TutorialStep | null;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  progress: number;

  // Actions
  startTutorial: (demoStoreId: string, demoProductId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTutorial: () => void;
  finishTutorial: () => void;
  resetTutorial: () => void;
  goToStep: (stepIndex: number) => void;
}

// =============================================================================
// Tutorial Steps Definition
// =============================================================================

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'store',
    targetElement: '[data-tutorial="store-selector"]',
    title: PRICING_LABELS.tutorial.steps.store.title,
    description: PRICING_LABELS.tutorial.steps.store.description,
    position: 'right',
  },
  {
    id: 'costsTabIntro',
    targetElement: '[data-tutorial="costs-tab"]',
    title: PRICING_LABELS.tutorial.steps.costsTabIntro.title,
    description: PRICING_LABELS.tutorial.steps.costsTabIntro.description,
    position: 'right',
  },
  {
    id: 'indirectCosts',
    targetElement: '[data-tutorial="indirect-costs-tab"]',
    title: PRICING_LABELS.tutorial.steps.indirectCosts.title,
    description: PRICING_LABELS.tutorial.steps.indirectCosts.description,
    position: 'right',
  },
  {
    id: 'hiddenCosts',
    targetElement: '[data-tutorial="hidden-costs-tab"]',
    title: PRICING_LABELS.tutorial.steps.hiddenCosts.title,
    description: PRICING_LABELS.tutorial.steps.hiddenCosts.description,
    position: 'right',
  },
  {
    id: 'taxes',
    targetElement: '[data-tutorial="taxes-tab"]',
    title: PRICING_LABELS.tutorial.steps.taxes.title,
    description: PRICING_LABELS.tutorial.steps.taxes.description,
    position: 'right',
  },
  {
    id: 'productTabIntro',
    targetElement: '[data-tutorial="product-tab"]',
    title: PRICING_LABELS.tutorial.steps.productTabIntro.title,
    description: PRICING_LABELS.tutorial.steps.productTabIntro.description,
    position: 'right',
  },
  {
    id: 'product',
    targetElement: '[data-tutorial="create-product-button"]',
    title: PRICING_LABELS.tutorial.steps.product.title,
    description: PRICING_LABELS.tutorial.steps.product.description,
    position: 'right',
  },
  {
    id: 'table',
    targetElement: '[data-tutorial="pricing-table"]',
    title: PRICING_LABELS.tutorial.steps.table.title,
    description: PRICING_LABELS.tutorial.steps.table.description,
    position: 'left',
  },
  {
    id: 'export',
    targetElement: '[data-tutorial="export-button"]',
    title: PRICING_LABELS.tutorial.steps.export.title,
    description: PRICING_LABELS.tutorial.steps.export.description,
    position: 'bottom',
  },
  {
    id: 'exportHide',
    targetElement: '[data-tutorial="export-hide-section"]',
    title: PRICING_LABELS.tutorial.steps.exportHide.title,
    description: PRICING_LABELS.tutorial.steps.exportHide.description,
    position: 'left',
  },
];

// =============================================================================
// Initial State
// =============================================================================

const INITIAL_STATE: TutorialState = {
  isActive: false,
  currentStep: 0,
  demoStoreId: null,
  demoProductId: null,
};

// =============================================================================
// Hook Implementation
// =============================================================================

export function useTutorial(): UseTutorialReturn {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [tutorialState, setTutorialState] = useState<TutorialState>(INITIAL_STATE);

  // ---------------------------------------------------------------------------
  // Computed Values
  // ---------------------------------------------------------------------------
  const totalSteps = TUTORIAL_STEPS.length;

  const currentStep = useMemo(() => {
    if (!tutorialState.isActive) return null;
    return TUTORIAL_STEPS[tutorialState.currentStep] || null;
  }, [tutorialState.isActive, tutorialState.currentStep]);

  const isFirstStep = tutorialState.currentStep === 0;
  const isLastStep = tutorialState.currentStep === totalSteps - 1;
  const progress = ((tutorialState.currentStep + 1) / totalSteps) * 100;

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  const startTutorial = useCallback((demoStoreId: string, demoProductId: string) => {
    setTutorialState({
      isActive: true,
      currentStep: 0,
      demoStoreId,
      demoProductId,
    });
  }, []);

  const nextStep = useCallback(() => {
    setTutorialState(prev => {
      if (!prev.isActive) return prev;
      if (prev.currentStep >= totalSteps - 1) return prev;

      return {
        ...prev,
        currentStep: prev.currentStep + 1,
      };
    });
  }, [totalSteps]);

  const previousStep = useCallback(() => {
    setTutorialState(prev => {
      if (!prev.isActive) return prev;
      if (prev.currentStep <= 0) return prev;

      return {
        ...prev,
        currentStep: prev.currentStep - 1,
      };
    });
  }, []);

  const skipTutorial = useCallback(() => {
    setTutorialState(prev => ({
      ...prev,
      isActive: false,
    }));
  }, []);

  const finishTutorial = useCallback(() => {
    setTutorialState(prev => ({
      ...prev,
      isActive: false,
    }));
  }, []);

  const resetTutorial = useCallback(() => {
    setTutorialState(INITIAL_STATE);
  }, []);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= totalSteps) return;

    setTutorialState(prev => ({
      ...prev,
      currentStep: stepIndex,
    }));
  }, [totalSteps]);

  // ---------------------------------------------------------------------------
  // Return Public API
  // ---------------------------------------------------------------------------
  return {
    // State
    tutorialState,
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    progress,

    // Actions
    startTutorial,
    nextStep,
    previousStep,
    skipTutorial,
    finishTutorial,
    resetTutorial,
    goToStep,
  };
}

// =============================================================================
// Export Tutorial Steps for external use
// =============================================================================

export { TUTORIAL_STEPS };
