/**
 * useAutoSave Hook
 *
 * Manages auto-save logic for fitness data with debouncing.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dieta, Treino, UserPersonalInfo } from '../types';
import { FitnessService } from '../services/FitnessService';
import { AUTO_SAVE_DELAY } from './fitnessDataHelpers';

export type ChangeType = 'personalInfo' | 'treinos' | 'dieta';

interface PendingChanges {
  personalInfo?: boolean;
  treinos?: boolean;
  dieta?: boolean;
}

interface UseAutoSaveProps {
  personalInfo: UserPersonalInfo;
  treinos: Treino[];
  dieta: Dieta | null;
  hasLoaded: boolean;
}

interface UseAutoSaveReturn {
  isSaving: boolean;
  lastSavedAt: Date | null;
  error: string | null;
  scheduleAutoSave: (changeType: ChangeType) => void;
  saveNow: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for managing auto-save functionality
 */
export function useAutoSave({
  personalInfo,
  treinos,
  dieta,
  hasLoaded,
}: UseAutoSaveProps): UseAutoSaveReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Track pending changes for auto-save
  const pendingChangesRef = useRef<PendingChanges>({});
  // Auto-save timeout ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save function
  const autoSave = useCallback(async () => {
    const changes = pendingChangesRef.current;
    if (!changes.personalInfo && !changes.treinos && !changes.dieta) return;

    try {
      setIsSaving(true);

      const isAuth = await FitnessService.isAuthenticated();
      if (!isAuth) {
        console.log('User not authenticated, skipping save');
        return;
      }

      const promises: Promise<boolean>[] = [];

      if (changes.personalInfo) {
        promises.push(FitnessService.saveProfile(personalInfo));
      }
      if (changes.treinos) {
        promises.push(FitnessService.replaceTreinos(treinos));
      }
      if (changes.dieta && dieta) {
        promises.push(FitnessService.saveDieta(dieta));
      }

      const results = await Promise.all(promises);
      const allSucceeded = results.every((r) => r);

      if (allSucceeded) {
        setLastSavedAt(new Date());
        pendingChangesRef.current = {};
        console.log('Fitness data auto-saved');
      } else {
        setError('Erro ao salvar alguns dados');
      }
    } catch (err) {
      console.error('Error auto-saving fitness data:', err);
      setError('Erro ao salvar dados');
    } finally {
      setIsSaving(false);
    }
  }, [personalInfo, treinos, dieta]);

  // Schedule auto-save when data changes
  const scheduleAutoSave = useCallback(
    (changeType: ChangeType) => {
      // Don't save if we haven't loaded yet
      if (!hasLoaded) return;

      pendingChangesRef.current[changeType] = true;

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Schedule new save
      saveTimeoutRef.current = setTimeout(() => {
        autoSave();
      }, AUTO_SAVE_DELAY);
    },
    [autoSave, hasLoaded]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Manual save function
  const saveNow = useCallback(async () => {
    // Cancel any pending auto-save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Mark all as changed and save
    pendingChangesRef.current = {
      personalInfo: true,
      treinos: true,
      dieta: dieta !== null,
    };

    await autoSave();
  }, [autoSave, dieta]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isSaving,
    lastSavedAt,
    error,
    scheduleAutoSave,
    saveNow,
    clearError,
  };
}
