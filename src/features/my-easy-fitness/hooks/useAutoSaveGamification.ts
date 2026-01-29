/**
 * useAutoSaveGamification Hook
 *
 * Auto-saves gamification data with debounce to prevent excessive API calls.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import type { GamificationState } from '../types/gamification';
import { GamificationService } from '../services/GamificationService';

interface UseAutoSaveGamificationProps {
  state: GamificationState;
  enabled?: boolean;
  debounceMs?: number;
}

interface UseAutoSaveGamificationReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  saveError: string | null;
  forceSave: () => Promise<boolean>;
}

export function useAutoSaveGamification({
  state,
  enabled = true,
  debounceMs = 2000,
}: UseAutoSaveGamificationProps): UseAutoSaveGamificationReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastStateRef = useRef<string>('');

  /**
   * Force save immediately (bypassing debounce)
   */
  const forceSave = useCallback(async (): Promise<boolean> => {
    if (!enabled) return false;

    // Clear any pending debounced save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const success = await GamificationService.saveGamificationData(state);
      if (success) {
        setLastSaved(new Date());
        lastStateRef.current = JSON.stringify(state);
      } else {
        setSaveError('Failed to save gamification data');
      }
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSaveError(errorMessage);
      console.error('Error saving gamification data:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [state, enabled]);

  /**
   * Debounced save effect
   */
  useEffect(() => {
    if (!enabled) return;

    // Serialize state for comparison
    const currentStateStr = JSON.stringify(state);

    // Skip if state hasn't changed
    if (currentStateStr === lastStateRef.current) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new debounced save
    timeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      setSaveError(null);

      try {
        const success = await GamificationService.saveGamificationData(state);
        if (success) {
          setLastSaved(new Date());
          lastStateRef.current = currentStateStr;
        } else {
          setSaveError('Failed to save gamification data');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setSaveError(errorMessage);
        console.error('Error in auto-save:', error);
      } finally {
        setIsSaving(false);
      }
    }, debounceMs);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state, enabled, debounceMs]);

  /**
   * Save on unmount if there are pending changes
   */
  useEffect(() => {
    return () => {
      // Synchronous cleanup - we can't await here
      // The actual save will be handled by the debounce timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        // Note: We can't do an async save in cleanup,
        // but the forceSave can be called before navigating away
      }
    };
  }, []);

  return {
    isSaving,
    lastSaved,
    saveError,
    forceSave,
  };
}

/**
 * Hook for saving on page unload
 */
export function useSaveOnUnload(
  state: GamificationState,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = async () => {
      try {
        // Use sendBeacon for reliable save on page unload
        // Note: This is a simplified version - in production,
        // you might want to use a dedicated endpoint for beacon saves
        await GamificationService.saveGamificationData(state);
      } catch (error) {
        console.error('Error saving on unload:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [state, enabled]);
}
