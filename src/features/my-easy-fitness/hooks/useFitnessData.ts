/**
 * useFitnessData Hook
 *
 * Centralized state management for fitness data with D1 persistence.
 * Orchestrates specialized hooks for auto-save, workout, and diet management.
 */

import { useCallback, useState, useEffect, useRef } from 'react';
import type { Dieta, Treino, UserPersonalInfo } from '../types';
import { DEFAULT_PERSONAL_INFO } from '../constants';
import { FitnessService } from '../services/FitnessService';
import { generatePersonalizedWorkoutPlan } from '../utils/workoutGenerator';
import { generateDiet } from '../utils/dietGenerator';
import {
  WORKOUT_TRIGGER_FIELDS,
  DIET_TRIGGER_FIELDS,
  hasFieldsChanged,
  canGenerateWorkouts,
  canGenerateDiet,
} from './fitnessDataHelpers';
import { useAutoSave } from './useAutoSave';
import { useWorkoutManager } from './useWorkoutManager';
import { useDietManager } from './useDietManager';

/**
 * Hook for managing fitness data state with persistence
 * @param userName - Optional user name from profile to auto-populate personalInfo.nome
 */
export function useFitnessData(userName?: string) {
  const [personalInfo, setPersonalInfo] = useState<UserPersonalInfo>({
    ...DEFAULT_PERSONAL_INFO,
    nome: userName || DEFAULT_PERSONAL_INFO.nome,
  });
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [dieta, setDieta] = useState<Dieta | null>(null);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Track if initial data has been loaded
  const hasLoadedRef = useRef(false);
  // Track previous personalInfo for change detection
  const prevPersonalInfoRef = useRef<UserPersonalInfo | null>(null);
  // Track if regeneration should be skipped (e.g., during initial load)
  const skipRegenerationRef = useRef(true);

  // Auto-save hook
  const {
    isSaving,
    lastSavedAt,
    error: saveError,
    scheduleAutoSave,
    saveNow,
  } = useAutoSave({
    personalInfo,
    treinos,
    dieta,
    hasLoaded: hasLoadedRef.current,
  });

  // Workout manager hook
  const {
    setTreinosWithSave,
    addTreino,
    updateTreino,
    removeTreino,
    updateTreinoNome,
    updateTreinoDia,
    addExercise,
    updateExercise,
    removeExercise,
  } = useWorkoutManager({
    treinos,
    setTreinos,
    scheduleAutoSave,
  });

  // Diet manager hook
  const {
    updateDieta,
    updateDietaMacros,
    updateRefeicao,
    addRefeicao,
    removeRefeicao,
    updateAlimento,
    addAlimento,
    removeAlimento,
  } = useDietManager({
    dieta,
    setDieta,
    scheduleAutoSave,
  });

  // Combined error from load or save
  const error = loadError || saveError;

  // Load data from D1 on mount
  useEffect(() => {
    const loadData = async () => {
      if (hasLoadedRef.current) return;

      try {
        setIsLoading(true);
        setLoadError(null);

        const isAuth = await FitnessService.isAuthenticated();
        if (!isAuth) {
          console.log('User not authenticated, using local state only');
          setIsLoading(false);
          hasLoadedRef.current = true;
          return;
        }

        const data = await FitnessService.loadAllData();

        if (data.personalInfo) {
          // If saved data doesn't have a nome but we have userName from profile, use it
          const nome = data.personalInfo.nome || userName || DEFAULT_PERSONAL_INFO.nome;
          setPersonalInfo({ ...data.personalInfo, nome });
        } else if (userName) {
          // No saved data, but we have userName - set it
          setPersonalInfo(prev => ({ ...prev, nome: userName }));
        }
        if (data.treinos.length > 0) {
          setTreinos(data.treinos);
        }
        if (data.dieta) {
          setDieta(data.dieta);
        }

        hasLoadedRef.current = true;
        console.log('Fitness data loaded from D1');
      } catch (err) {
        console.error('Error loading fitness data:', err);
        setLoadError('Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userName]);

  // Auto-regeneration effect - regenerates workouts/diet when relevant personalInfo fields change
  useEffect(() => {
    // Skip regeneration during initial load or if not loaded yet
    if (!hasLoadedRef.current || skipRegenerationRef.current) {
      // After first render with loaded data, enable regeneration
      if (hasLoadedRef.current && skipRegenerationRef.current) {
        skipRegenerationRef.current = false;
        prevPersonalInfoRef.current = personalInfo;
      }
      return;
    }

    const prev = prevPersonalInfoRef.current;

    // Check if workout-related fields changed
    if (hasFieldsChanged(prev, personalInfo, WORKOUT_TRIGGER_FIELDS)) {
      if (canGenerateWorkouts(personalInfo)) {
        console.log('Regenerating workouts due to personalInfo change');
        const newTreinos = generatePersonalizedWorkoutPlan(personalInfo);
        setTreinos(newTreinos);
        scheduleAutoSave('treinos');
      }
    }

    // Check if diet-related fields changed
    if (hasFieldsChanged(prev, personalInfo, DIET_TRIGGER_FIELDS)) {
      if (canGenerateDiet(personalInfo)) {
        console.log('Regenerating diet due to personalInfo change');
        const newDieta = generateDiet(personalInfo);
        setDieta(newDieta);
        scheduleAutoSave('dieta');
      }
    }

    // Update previous ref for next comparison
    prevPersonalInfoRef.current = personalInfo;
  }, [personalInfo, scheduleAutoSave]);

  // Personal info updates
  const updatePersonalInfo = useCallback(
    (updates: Partial<UserPersonalInfo>) => {
      setPersonalInfo((prev) => ({ ...prev, ...updates }));
      scheduleAutoSave('personalInfo');
    },
    [scheduleAutoSave]
  );

  const resetPersonalInfo = useCallback(() => {
    setPersonalInfo(DEFAULT_PERSONAL_INFO);
    scheduleAutoSave('personalInfo');
  }, [scheduleAutoSave]);

  // Reset all data
  const resetAll = useCallback(() => {
    setPersonalInfo(DEFAULT_PERSONAL_INFO);
    setTreinos([]);
    setDieta(null);
    // Don't schedule auto-save for reset - this is typically used for logout/cleanup
  }, []);

  // Reload data from server
  const reloadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);

      const isAuth = await FitnessService.isAuthenticated();
      if (!isAuth) {
        setIsLoading(false);
        return;
      }

      const data = await FitnessService.loadAllData();

      if (data.personalInfo) {
        setPersonalInfo(data.personalInfo);
      } else {
        setPersonalInfo(DEFAULT_PERSONAL_INFO);
      }
      setTreinos(data.treinos);
      setDieta(data.dieta);
    } catch (err) {
      console.error('Error reloading fitness data:', err);
      setLoadError('Erro ao recarregar dados');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    personalInfo,
    treinos,
    dieta,

    // Loading/saving status
    isLoading,
    isSaving,
    lastSavedAt,
    error,

    // Personal info
    updatePersonalInfo,
    resetPersonalInfo,

    // Treinos (from useWorkoutManager)
    setTreinos: setTreinosWithSave,
    addTreino,
    updateTreino,
    removeTreino,
    updateTreinoNome,
    updateTreinoDia,

    // Exercises (from useWorkoutManager)
    addExercise,
    updateExercise,
    removeExercise,

    // Dieta (from useDietManager)
    updateDieta,
    updateDietaMacros,
    updateRefeicao,
    addRefeicao,
    removeRefeicao,
    updateAlimento,
    addAlimento,
    removeAlimento,

    // Reset
    resetAll,

    // Manual controls
    saveNow,
    reloadData,
  };
}
