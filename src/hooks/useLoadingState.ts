import { useCallback, useEffect, useRef, useState } from 'react';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

/**
 * Configuration options for useLoadingState hook
 * @description Customize the behavior of the loading state manager
 */
export type UseLoadingStateOptions = {
  /** Timeout duration in milliseconds after which loading auto-completes (default: 30000ms = 30s) */
  timeout?: number;
  /** Start in loading state immediately (default: false) */
  initialLoading?: boolean;
};

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default timeout duration for loading operations
 * @constant {number} 30000 - 30 seconds
 */
const DEFAULT_TIMEOUT = 30 * 1000; // 30 seconds

/**
 * Default initial step description
 * @constant {string}
 */
const DEFAULT_INITIAL_STEP = 'Iniciando...';

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Custom hook for managing loading states with progress tracking and auto-timeout
 *
 * @description
 * Provides a centralized way to manage loading operations with progress tracking.
 * Features include:
 * - **Loading state**: Boolean flag for loading status
 * - **Progress tracking**: 0-100 scale for visual progress indicators
 * - **Step descriptions**: Text descriptions of current loading step
 * - **Auto-timeout**: Automatically completes loading after specified duration
 * - **Lifecycle control**: Start, update, complete, and reset operations
 *
 * @param {UseLoadingStateOptions} [options] - Configuration options
 * @param {number} [options.timeout=30000] - Auto-timeout duration in milliseconds
 * @returns {Object} Loading state and control functions
 * @returns {boolean} returns.isLoading - Current loading status
 * @returns {number} returns.progress - Current progress (0-100)
 * @returns {string} returns.step - Current step description
 * @returns {Function} returns.startLoading - Start loading operation
 * @returns {Function} returns.updateProgress - Update progress and step
 * @returns {Function} returns.completeLoading - Complete loading operation
 * @returns {Function} returns.resetLoading - Reset to initial state
 */
export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const { timeout = DEFAULT_TIMEOUT, initialLoading = false } = options;

  // ============================================================================
  // STATE
  // ============================================================================

  const [isLoading, setIsLoading] = useState(initialLoading);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(DEFAULT_INITIAL_STEP);

  // Timeout timer reference
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Clear the auto-timeout timer
   */
  const clearTimeoutTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /**
   * Start the auto-timeout timer
   */
  const startTimeoutTimer = useCallback(() => {
    clearTimeoutTimer();

    timeoutRef.current = setTimeout(() => {
      // Auto-complete loading when timeout is reached
      setProgress(100);
      setIsLoading(false);
      timeoutRef.current = null;
    }, timeout);
  }, [timeout, clearTimeoutTimer]);

  // ============================================================================
  // PUBLIC API FUNCTIONS
  // ============================================================================

  /**
   * Start a loading operation
   * @description
   * Initiates loading state, resets progress to 0, and starts the auto-timeout timer.
   * The timeout will automatically complete loading if not manually completed.
   *
   * @param {string} [initialStep="Iniciando..."] - Initial step description
   * @returns {void}
   */
  const startLoading = useCallback(
    (initialStep: string = DEFAULT_INITIAL_STEP) => {
      setIsLoading(true);
      setProgress(0);
      setStep(initialStep);
      startTimeoutTimer();
    },
    [startTimeoutTimer],
  );

  /**
   * Update loading progress and/or step
   * @description
   * Updates the progress value and optionally the step description.
   * Progress should be between 0 and 100.
   *
   * @param {number} newProgress - New progress value (0-100)
   * @param {string} [newStep] - Optional new step description
   * @returns {void}
   */
  const updateProgress = useCallback((newProgress: number, newStep?: string) => {
    setProgress(newProgress);
    if (newStep !== undefined) {
      setStep(newStep);
    }
  }, []);

  /**
   * Complete the loading operation
   * @description
   * Sets progress to 100%, marks loading as complete, and clears the auto-timeout timer.
   * Should be called when the operation finishes successfully.
   *
   * @returns {void}
   */
  const completeLoading = useCallback(() => {
    clearTimeoutTimer();
    setProgress(100);
    setIsLoading(false);
  }, [clearTimeoutTimer]);

  /**
   * Reset loading state to initial values
   * @description
   * Resets all state to initial values: isLoading=false, progress=0, step="Iniciando...".
   * Clears any active timeout timers.
   *
   * @returns {void}
   */
  const resetLoading = useCallback(() => {
    clearTimeoutTimer();
    setIsLoading(false);
    setProgress(0);
    setStep(DEFAULT_INITIAL_STEP);
  }, [clearTimeoutTimer]);

  // ============================================================================
  // CLEANUP ON UNMOUNT
  // ============================================================================

  useEffect(() => {
    return () => {
      clearTimeoutTimer();
    };
  }, [clearTimeoutTimer]);

  // ============================================================================
  // RETURN PUBLIC API
  // ============================================================================

  return {
    isLoading,
    progress,
    step,
    startLoading,
    updateProgress,
    completeLoading,
    resetLoading,
  };
}
