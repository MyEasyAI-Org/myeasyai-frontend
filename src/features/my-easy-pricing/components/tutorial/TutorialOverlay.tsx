// =============================================================================
// TutorialOverlay - Dark overlay with spotlight on target element
// =============================================================================

import { useEffect, useState, useCallback } from 'react';
import type { TutorialStep } from '../../types/pricing.types';

// =============================================================================
// Types
// =============================================================================

interface TutorialOverlayProps {
  isActive: boolean;
  currentStep: TutorialStep | null;
  onOverlayClick?: () => void;
}

interface SpotlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

// =============================================================================
// Component
// =============================================================================

export function TutorialOverlay({
  isActive,
  currentStep,
  onOverlayClick,
}: TutorialOverlayProps) {
  const [spotlightPosition, setSpotlightPosition] = useState<SpotlightPosition | null>(null);

  // ---------------------------------------------------------------------------
  // Calculate spotlight position based on target element
  // ---------------------------------------------------------------------------
  const updateSpotlightPosition = useCallback(() => {
    if (!currentStep) {
      setSpotlightPosition(null);
      return;
    }

    // Find all matching elements and get the one that's visible
    const targetElements = document.querySelectorAll(currentStep.targetElement);
    let targetElement: Element | null = null;

    for (const el of targetElements) {
      const rect = el.getBoundingClientRect();
      // Check if element is visible (has dimensions and is in viewport)
      if (rect.width > 0 && rect.height > 0) {
        targetElement = el;
        break;
      }
    }

    if (!targetElement) {
      console.warn('[TutorialOverlay] Target element not found or not visible:', currentStep.targetElement);
      setSpotlightPosition(null);
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    const padding = 8; // Extra padding around the element

    setSpotlightPosition({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });
  }, [currentStep]);

  // ---------------------------------------------------------------------------
  // Update position on step change and window resize
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isActive || !currentStep) {
      setSpotlightPosition(null);
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
          updateSpotlightPosition();
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(check, 100);
        } else {
          // Element not found after max attempts
          setSpotlightPosition(null);
        }
      };

      // Initial delay to allow tab change animation
      setTimeout(check, 350);
    };

    waitForVisibleElement(currentStep.targetElement);

    // Update on resize/scroll
    window.addEventListener('resize', updateSpotlightPosition);
    window.addEventListener('scroll', updateSpotlightPosition, true);

    // Also observe DOM changes (element might appear after render)
    // This handles sidebar open/close and other dynamic changes
    const observer = new MutationObserver(() => {
      setTimeout(updateSpotlightPosition, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    return () => {
      window.removeEventListener('resize', updateSpotlightPosition);
      window.removeEventListener('scroll', updateSpotlightPosition, true);
      observer.disconnect();
    };
  }, [isActive, currentStep, updateSpotlightPosition]);

  // ---------------------------------------------------------------------------
  // Don't render if not active
  // ---------------------------------------------------------------------------
  if (!isActive) return null;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div
      className="fixed inset-0 z-[45] pointer-events-auto"
      onClick={onOverlayClick}
      style={{
        background: spotlightPosition
          ? `radial-gradient(
              ellipse ${spotlightPosition.width + 40}px ${spotlightPosition.height + 40}px
              at ${spotlightPosition.left + spotlightPosition.width / 2}px ${spotlightPosition.top + spotlightPosition.height / 2}px,
              transparent 0%,
              transparent 70%,
              rgba(0, 0, 0, 0.5) 100%
            )`
          : 'rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Clickable area that doesn't block the target element */}
      {spotlightPosition && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: spotlightPosition.top,
            left: spotlightPosition.left,
            width: spotlightPosition.width,
            height: spotlightPosition.height,
            borderRadius: '8px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          }}
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
}
