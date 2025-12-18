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
  arrowOffset: number; // Offset from center (in pixels)
}

// =============================================================================
// Constants
// =============================================================================

const TOOLTIP_WIDTH_DESKTOP = 320;
const TOOLTIP_WIDTH_MOBILE = 280;
const TOOLTIP_HEIGHT = 180;
const ARROW_SIZE = 12;
const MARGIN = 16;
const MOBILE_BREAKPOINT = 768;

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
  const [isMobile, setIsMobile] = useState(false);
  const [displayedStep, setDisplayedStep] = useState<TutorialStep | null>(null);
  const labels = PRICING_LABELS.tutorial;

  // Get current tooltip width based on screen size
  const tooltipWidth = isMobile ? TOOLTIP_WIDTH_MOBILE : TOOLTIP_WIDTH_DESKTOP;

  // ---------------------------------------------------------------------------
  // Calculate tooltip position based on target element
  // ---------------------------------------------------------------------------
  const updatePosition = useCallback(() => {
    if (!currentStep) {
      setPosition(null);
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const mobile = viewportWidth < MOBILE_BREAKPOINT;
    setIsMobile(mobile);

    const currentTooltipWidth = mobile ? TOOLTIP_WIDTH_MOBILE : TOOLTIP_WIDTH_DESKTOP;

    // Find all matching elements and get the one that's visible
    const targetElements = document.querySelectorAll(currentStep.targetElement);
    let targetElement: Element | null = null;

    for (const el of targetElements) {
      const elRect = el.getBoundingClientRect();
      // Check if element is visible (has dimensions)
      if (elRect.width > 0 && elRect.height > 0) {
        targetElement = el;
        break;
      }
    }

    if (!targetElement) {
      console.warn('[TutorialTooltip] Target element not found or not visible:', currentStep.targetElement);
      // Fallback to center of screen
      setPosition({
        top: viewportHeight / 2 - TOOLTIP_HEIGHT / 2,
        left: viewportWidth / 2 - currentTooltipWidth / 2,
        arrowPosition: 'top',
        arrowOffset: 0,
      });
      return;
    }

    const rect = targetElement.getBoundingClientRect();

    let top = 0;
    let left = 0;
    let arrowPosition: 'top' | 'bottom' | 'left' | 'right' = currentStep.position;

    // Target element center coordinates
    const targetCenterX = rect.left + rect.width / 2;
    const targetCenterY = rect.top + rect.height / 2;

    // On mobile, prefer bottom/top positioning over left/right
    let preferredPosition = currentStep.position;
    if (mobile && (preferredPosition === 'left' || preferredPosition === 'right')) {
      // Check if there's more space above or below
      const spaceAbove = rect.top;
      const spaceBelow = viewportHeight - rect.bottom;
      preferredPosition = spaceBelow >= spaceAbove ? 'bottom' : 'top';
    }

    switch (preferredPosition) {
      case 'right':
        top = rect.top + rect.height / 2 - TOOLTIP_HEIGHT / 2;
        left = rect.right + MARGIN + ARROW_SIZE;
        arrowPosition = 'left';
        break;

      case 'left':
        top = rect.top + rect.height / 2 - TOOLTIP_HEIGHT / 2;
        left = rect.left - currentTooltipWidth - MARGIN - ARROW_SIZE;
        arrowPosition = 'right';
        break;

      case 'bottom':
        top = rect.bottom + MARGIN + ARROW_SIZE;
        left = rect.left + rect.width / 2 - currentTooltipWidth / 2;
        arrowPosition = 'top';
        break;

      case 'top':
        top = rect.top - TOOLTIP_HEIGHT - MARGIN - ARROW_SIZE;
        left = rect.left + rect.width / 2 - currentTooltipWidth / 2;
        arrowPosition = 'bottom';
        break;
    }

    // Boundary checks - keep tooltip within viewport
    if (left < MARGIN) left = MARGIN;
    if (left + currentTooltipWidth > viewportWidth - MARGIN) {
      left = viewportWidth - currentTooltipWidth - MARGIN;
    }
    if (top < MARGIN) top = MARGIN;
    if (top + TOOLTIP_HEIGHT > viewportHeight - MARGIN) {
      top = viewportHeight - TOOLTIP_HEIGHT - MARGIN;
    }

    // Calculate arrow offset based on how much the tooltip was shifted
    let arrowOffset = 0;
    if (arrowPosition === 'top' || arrowPosition === 'bottom') {
      // Horizontal arrow - calculate offset from tooltip center to target center
      const tooltipCenterX = left + currentTooltipWidth / 2;
      arrowOffset = targetCenterX - tooltipCenterX;
      // Clamp arrow offset to stay within tooltip bounds (with padding)
      const maxOffset = currentTooltipWidth / 2 - ARROW_SIZE - 16;
      arrowOffset = Math.max(-maxOffset, Math.min(maxOffset, arrowOffset));
    } else {
      // Vertical arrow - calculate offset from tooltip center to target center
      const tooltipCenterY = top + TOOLTIP_HEIGHT / 2;
      arrowOffset = targetCenterY - tooltipCenterY;
      // Clamp arrow offset to stay within tooltip bounds (with padding)
      const maxOffset = TOOLTIP_HEIGHT / 2 - ARROW_SIZE - 16;
      arrowOffset = Math.max(-maxOffset, Math.min(maxOffset, arrowOffset));
    }

    setPosition({ top, left, arrowPosition, arrowOffset });
  }, [currentStep]);

  // ---------------------------------------------------------------------------
  // Update position on step change and window resize
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isActive || !currentStep) {
      setPosition(null);
      setDisplayedStep(null);
      return;
    }

    // Function to wait for visible element to appear in DOM
    const waitForVisibleElement = (selector: string, maxAttempts = 15) => {
      let attempts = 0;

      const check = () => {
        const elements = document.querySelectorAll(selector);
        let found = false;

        for (const el of elements) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            found = true;
            break;
          }
        }

        if (found) {
          // Update both position and displayed step simultaneously
          // so text changes at the exact same moment as position
          setDisplayedStep(currentStep);
          updatePosition();
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(check, 100);
        } else {
          // Fallback: show tooltip in center if element not found
          updatePosition();
          setDisplayedStep(currentStep);
        }
      };

      // Initial delay to allow tab change animation
      setTimeout(check, 350);
    };

    waitForVisibleElement(currentStep.targetElement);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    // Observe DOM changes for sidebar open/close
    const observer = new MutationObserver(() => {
      setTimeout(updatePosition, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      observer.disconnect();
    };
  }, [isActive, currentStep, updatePosition]);

  // ---------------------------------------------------------------------------
  // Don't render if not active or no position or no displayed step
  // ---------------------------------------------------------------------------
  if (!isActive || !currentStep || !position || !displayedStep) return null;

  // ---------------------------------------------------------------------------
  // Arrow styles based on position (using rotated square approach)
  // ---------------------------------------------------------------------------
  const getArrowStyles = (): React.CSSProperties => {
    const size = ARROW_SIZE;
    const offset = Math.round(position.arrowOffset);

    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      width: size,
      height: size,
      backgroundColor: '#1e293b',
      transform: 'rotate(45deg)',
    };

    switch (position.arrowPosition) {
      case 'left':
        return {
          ...baseStyles,
          left: -size / 2,
          top: `calc(50% + ${offset}px)`,
          marginTop: -size / 2,
        };
      case 'right':
        return {
          ...baseStyles,
          right: -size / 2,
          top: `calc(50% + ${offset}px)`,
          marginTop: -size / 2,
        };
      case 'top':
        return {
          ...baseStyles,
          top: -size / 2,
          left: `calc(50% + ${offset}px)`,
          marginLeft: -size / 2,
        };
      case 'bottom':
        return {
          ...baseStyles,
          bottom: -size / 2,
          left: `calc(50% + ${offset}px)`,
          marginLeft: -size / 2,
        };
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div
      className="fixed z-50 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-3 md:p-4"
      style={{
        top: position.top,
        left: position.left,
        width: tooltipWidth,
        minHeight: TOOLTIP_HEIGHT,
      }}
    >
      {/* Arrow */}
      <div style={getArrowStyles()} />

      {/* Header */}
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-yellow-600 text-white text-[10px] md:text-xs font-medium rounded-full">
            {stepNumber}/{totalSteps}
          </span>
          <h3 className="text-sm md:text-lg font-semibold text-white">{displayedStep.title}</h3>
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
      <p className="text-slate-300 text-xs md:text-sm mb-3 md:mb-4 leading-relaxed">
        {displayedStep.description}
      </p>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-700 rounded-full mb-3 md:mb-4">
        <div
          className="h-full bg-yellow-500 rounded-full transition-all duration-300"
          style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={onSkip}
          className="text-xs md:text-sm text-slate-400 hover:text-white transition-colors"
        >
          {labels.skip}
        </button>

        <div className="flex items-center gap-1 md:gap-2">
          {!isFirstStep && (
            <button
              onClick={onPrevious}
              className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">{labels.previous}</span>
            </button>
          )}

          {isLastStep ? (
            <button
              onClick={onFinish}
              className="px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-sm bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-medium transition-colors"
            >
              {labels.finish}
            </button>
          ) : (
            <button
              onClick={onNext}
              className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-medium transition-colors"
            >
              <span className="hidden sm:inline">{labels.next}</span>
              <span className="sm:hidden">OK</span>
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
