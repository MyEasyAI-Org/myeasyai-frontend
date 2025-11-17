import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// GLOBAL STATE FOR SCROLL LOCK MANAGEMENT
// ============================================================================

/**
 * Global counter to track number of open modals with scroll lock enabled
 * @description Prevents body scroll unlock until ALL modals are closed
 */
let openModalsCount = 0;

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

/**
 * Configuration options for useModalState hook
 * @description Customize modal behavior with optional settings
 */
export type UseModalStateOptions = {
  /** Disable closing modal with Escape key (default: false) */
  disableEscape?: boolean;
  /** Disable body scroll lock when modal is open (default: false) */
  disableScrollLock?: boolean;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Lock body scroll by setting overflow to hidden
 * @description Prevents page scrolling while modal is open
 */
function lockBodyScroll(): void {
  document.body.style.overflow = 'hidden';
}

/**
 * Unlock body scroll by removing overflow style
 * @description Restores page scrolling when all modals are closed
 */
function unlockBodyScroll(): void {
  document.body.style.overflow = '';
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Custom hook for managing modal state with keyboard and scroll lock support
 *
 * @description
 * Provides a simple and consistent way to manage modal open/close state.
 * Features include:
 * - **State management**: Boolean isOpen state with open/close/toggle functions
 * - **ESC key handling**: Automatically closes modal when Escape is pressed
 * - **Body scroll lock**: Prevents page scrolling while modal is open
 * - **Multiple modals**: Global counter ensures scroll stays locked until all modals close
 * - **Configurable**: Options to disable ESC or scroll lock per modal
 *
 * @param {UseModalStateOptions} [options] - Configuration options
 * @param {boolean} [options.disableEscape=false] - Disable ESC key to close
 * @param {boolean} [options.disableScrollLock=false] - Disable body scroll locking
 * @returns {Object} Modal state and control functions
 * @returns {boolean} returns.isOpen - Current modal open state
 * @returns {Function} returns.open - Open the modal
 * @returns {Function} returns.close - Close the modal
 * @returns {Function} returns.toggle - Toggle modal state
 */
export function useModalState(options: UseModalStateOptions = {}) {
  const { disableEscape = false, disableScrollLock = false } = options;

  // ============================================================================
  // STATE
  // ============================================================================

  const [isOpen, setIsOpen] = useState(false);

  // ============================================================================
  // MODAL CONTROL FUNCTIONS
  // ============================================================================

  /**
   * Open the modal
   * @description
   * Sets isOpen to true and locks body scroll (if enabled).
   * Increments global modal counter.
   *
   * @returns {void}
   */
  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  /**
   * Close the modal
   * @description
   * Sets isOpen to false and unlocks body scroll (if enabled and no other modals open).
   * Decrements global modal counter.
   *
   * @returns {void}
   */
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Toggle modal state
   * @description
   * Switches between open and closed states.
   *
   * @returns {void}
   */
  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // ============================================================================
  // BODY SCROLL LOCK EFFECT
  // ============================================================================

  useEffect(() => {
    if (disableScrollLock) return;

    if (isOpen) {
      // Modal opened - lock scroll
      openModalsCount++;
      if (openModalsCount === 1) {
        // First modal opened
        lockBodyScroll();
      }
    } else {
      // Modal closed - unlock scroll if no other modals are open
      if (openModalsCount > 0) {
        openModalsCount--;
        if (openModalsCount === 0) {
          // Last modal closed
          unlockBodyScroll();
        }
      }
    }

    return () => {
      // Cleanup on unmount
      if (isOpen && !disableScrollLock && openModalsCount > 0) {
        openModalsCount--;
        if (openModalsCount === 0) {
          unlockBodyScroll();
        }
      }
    };
  }, [isOpen, disableScrollLock]);

  // ============================================================================
  // ESC KEY HANDLER EFFECT
  // ============================================================================

  useEffect(() => {
    if (disableEscape || !isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, disableEscape, close]);

  // ============================================================================
  // RETURN PUBLIC API
  // ============================================================================

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
