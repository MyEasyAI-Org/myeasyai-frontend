// =============================================================================
// TutorialTooltip - Tooltip that appears next to highlighted element
// =============================================================================

import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { TutorialStep } from '../../types/pricing.types';
import { PRICING_LABELS } from '../../constants/pricing.constants';

// =============================================================================
// Types
// =============================================================================

interface TutorialTooltipProps {
  isActive: boolean;
  currentStep: TutorialStep | null;
  stepNumber: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onFinish: () => void;
}

interface TooltipPosition {
  top: number;
  left: number;
  arrowPosition: 'top' | 'bottom' | 'left' | 'right';
}

// =============================================================================
// Constants
// =============================================================================

const TOOLTIP_WIDTH = 320;
const TOOLTIP_HEIGHT = 180;
const ARROW_SIZE = 12;
const MARGIN = 16;

// =============================================================================
// Component
// =============================================================================

export function TutorialTooltip({
  isActive,
  currentStep,
  stepNumber,
  totalSteps,
  isFirstStep,
  isLastStep,
  onNext,
  onPrevious,
  onSkip,
  onFinish,
}: TutorialTooltipProps) {
  const [position, setPosition] = useState<TooltipPosition | null>(null);
  const labels = PRICING_LABELS.tutorial;

  // ---------------------------------------------------------------------------
  // Calculate tooltip position based on target element
  // ---------------------------------------------------------------------------
  const updatePosition = useCallback(() => {
    if (!currentStep) {
      setPosition(null);
      return;
    }

    const targetElement = document.querySelector(currentStep.targetElement);
    if (!targetElement) {
      console.warn('[TutorialTooltip] Target element not found:', currentStep.targetElement);
      // Fallback to center of screen
      setPosition({
        top: window.innerHeight / 2 - TOOLTIP_HEIGHT / 2,
        left: window.innerWidth / 2 - TOOLTIP_WIDTH / 2,
        arrowPosition: 'top',
      });
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = 0;
    let left = 0;
    let arrowPosition: 'top' | 'bottom' | 'left' | 'right' = currentStep.position;

    switch (currentStep.position) {
      case 'right':
        top = rect.top + rect.height / 2 - TOOLTIP_HEIGHT / 2;
        left = rect.right + MARGIN + ARROW_SIZE;
        arrowPosition = 'left';
        break;

      case 'left':
        top = rect.top + rect.height / 2 - TOOLTIP_HEIGHT / 2;
        left = rect.left - TOOLTIP_WIDTH - MARGIN - ARROW_SIZE;
        arrowPosition = 'right';
        break;

      case 'bottom':
        top = rect.bottom + MARGIN + ARROW_SIZE;
        left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
        arrowPosition = 'top';
        break;

      case 'top':
        top = rect.top - TOOLTIP_HEIGHT - MARGIN - ARROW_SIZE;
        left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
        arrowPosition = 'bottom';
        break;
    }

    // Boundary checks - keep tooltip within viewport
    if (left < MARGIN) left = MARGIN;
    if (left + TOOLTIP_WIDTH > viewportWidth - MARGIN) {
      left = viewportWidth - TOOLTIP_WIDTH - MARGIN;
    }
    if (top < MARGIN) top = MARGIN;
    if (top + TOOLTIP_HEIGHT > viewportHeight - MARGIN) {
      top = viewportHeight - TOOLTIP_HEIGHT - MARGIN;
    }

    setPosition({ top, left, arrowPosition });
  }, [currentStep]);

  // ---------------------------------------------------------------------------
  // Update position on step change and window resize
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isActive) {
      setPosition(null);
      return;
    }

    // Delay initial calculation to allow DOM to settle
    const timeout = setTimeout(updatePosition, 150);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isActive, currentStep, updatePosition]);

  // ---------------------------------------------------------------------------
  // Don't render if not active or no position
  // ---------------------------------------------------------------------------
  if (!isActive || !currentStep || !position) return null;

  // ---------------------------------------------------------------------------
  // Arrow styles based on position
  // ---------------------------------------------------------------------------
  const getArrowStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      width: 0,
      height: 0,
      border: `${ARROW_SIZE}px solid transparent`,
    };

    switch (position.arrowPosition) {
      case 'left':
        return {
          ...baseStyles,
          left: -ARROW_SIZE * 2,
          top: '50%',
          transform: 'translateY(-50%)',
          borderRightColor: '#1e293b',
          borderLeftWidth: 0,
        };
      case 'right':
        return {
          ...baseStyles,
          right: -ARROW_SIZE * 2,
          top: '50%',
          transform: 'translateY(-50%)',
          borderLeftColor: '#1e293b',
          borderRightWidth: 0,
        };
      case 'top':
        return {
          ...baseStyles,
          top: -ARROW_SIZE * 2,
          left: '50%',
          transform: 'translateX(-50%)',
          borderBottomColor: '#1e293b',
          borderTopWidth: 0,
        };
      case 'bottom':
        return {
          ...baseStyles,
          bottom: -ARROW_SIZE * 2,
          left: '50%',
          transform: 'translateX(-50%)',
          borderTopColor: '#1e293b',
          borderBottomWidth: 0,
        };
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div
      className="fixed z-50 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-4"
      style={{
        top: position.top,
        left: position.left,
        width: TOOLTIP_WIDTH,
        minHeight: TOOLTIP_HEIGHT,
      }}
    >
      {/* Arrow */}
      <div style={getArrowStyles()} />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-yellow-600 text-white text-xs font-medium rounded-full">
            {stepNumber}/{totalSteps}
          </span>
          <h3 className="text-lg font-semibold text-white">{currentStep.title}</h3>
        </div>
        <button
          onClick={onSkip}
          className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
          title={labels.skip}
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Description */}
      <p className="text-slate-300 text-sm mb-4 leading-relaxed">
        {currentStep.description}
      </p>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-700 rounded-full mb-4">
        <div
          className="h-full bg-yellow-500 rounded-full transition-all duration-300"
          style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={onSkip}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          {labels.skip}
        </button>

        <div className="flex items-center gap-2">
          {!isFirstStep && (
            <button
              onClick={onPrevious}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {labels.previous}
            </button>
          )}

          {isLastStep ? (
            <button
              onClick={onFinish}
              className="px-4 py-1.5 text-sm bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-medium transition-colors"
            >
              {labels.finish}
            </button>
          ) : (
            <button
              onClick={onNext}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-medium transition-colors"
            >
              {labels.next}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
