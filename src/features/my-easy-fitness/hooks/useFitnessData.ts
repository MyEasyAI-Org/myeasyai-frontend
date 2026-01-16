/**
 * useFitnessData Hook
 *
 * Centralized state management for fitness data with D1 persistence.
 * Follows Single Responsibility Principle - manages data state and persistence.
 */

import { useCallback, useState, useEffect, useRef } from 'react';
import type { Alimento, Dieta, Exercise, Treino, UserPersonalInfo } from '../types';
import { DEFAULT_PERSONAL_INFO } from '../constants';
import { FitnessService } from '../services/FitnessService';
import { generatePersonalizedWorkoutPlan } from '../utils/workoutGenerator';
import { generateDiet } from '../utils/dietGenerator';

// Debounce delay for auto-save (in ms)
const AUTO_SAVE_DELAY = 2000;

// Fields that trigger workout regeneration
const WORKOUT_TRIGGER_FIELDS: (keyof UserPersonalInfo)[] = [
  'lesoes',
  'experienciaTreino',
  'diasTreinoSemana',
  'tempoTreinoMinutos',
  'preferenciaTreino',
];

// Fields that trigger diet regeneration
const DIET_TRIGGER_FIELDS: (keyof UserPersonalInfo)[] = [
  'peso',
  'altura',
  'idade',
  'sexo',
  'objetivo',
  'nivelAtividade',
  'restricoesAlimentares',
  'comidasFavoritas',
  'comidasEvitar',
  'numeroRefeicoes',
  'horarioTreino',
];

/**
 * Check if specific fields changed between two personal info objects
 */
function hasFieldsChanged(
  prev: UserPersonalInfo | null,
  current: UserPersonalInfo,
  fields: (keyof UserPersonalInfo)[]
): boolean {
  if (!prev) return false;

  for (const field of fields) {
    const prevValue = prev[field];
    const currValue = current[field];

    // Handle arrays
    if (Array.isArray(prevValue) && Array.isArray(currValue)) {
      if (prevValue.length !== currValue.length) return true;
      if (!prevValue.every((v, i) => v === currValue[i])) return true;
    } else if (prevValue !== currValue) {
      return true;
    }
  }

  return false;
}

/**
 * Check if user has minimum info to generate workouts
 */
function canGenerateWorkouts(info: UserPersonalInfo): boolean {
  return !!(info.diasTreinoSemana && info.diasTreinoSemana > 0);
}

/**
 * Check if user has minimum info to generate diet
 * Requires diet preferences (numeroRefeicoes) to be set to prevent auto-generation on profile load
 */
function canGenerateDiet(info: UserPersonalInfo): boolean {
  return !!(
    info.peso && info.peso > 0 &&
    info.altura && info.altura > 0 &&
    info.idade && info.idade > 0 &&
    info.numeroRefeicoes && info.numeroRefeicoes > 0
  );
}

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

  // Loading and saving states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Track if initial data has been loaded
  const hasLoadedRef = useRef(false);
  // Track pending changes for auto-save
  const pendingChangesRef = useRef<{
    personalInfo?: boolean;
    treinos?: boolean;
    dieta?: boolean;
  }>({});
  // Auto-save timeout ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Track previous personalInfo for change detection
  const prevPersonalInfoRef = useRef<UserPersonalInfo | null>(null);
  // Track if regeneration should be skipped (e.g., during initial load)
  const skipRegenerationRef = useRef(true);

  // Load data from D1 on mount
  useEffect(() => {
    const loadData = async () => {
      if (hasLoadedRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

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
        setError('Erro ao carregar dados');
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
        pendingChangesRef.current.treinos = true;
      }
    }

    // Check if diet-related fields changed
    if (hasFieldsChanged(prev, personalInfo, DIET_TRIGGER_FIELDS)) {
      if (canGenerateDiet(personalInfo)) {
        console.log('Regenerating diet due to personalInfo change');
        const newDieta = generateDiet(personalInfo);
        setDieta(newDieta);
        pendingChangesRef.current.dieta = true;
      }
    }

    // Update previous ref for next comparison
    prevPersonalInfoRef.current = personalInfo;
  }, [personalInfo]);

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
    (changeType: 'personalInfo' | 'treinos' | 'dieta') => {
      // Don't save if we haven't loaded yet
      if (!hasLoadedRef.current) return;

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
    [autoSave]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

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

  // Treino management
  const addTreino = useCallback(
    (treino: Treino) => {
      setTreinos((prev) => [...prev, treino]);
      scheduleAutoSave('treinos');
    },
    [scheduleAutoSave]
  );

  const updateTreino = useCallback(
    (id: string, updates: Partial<Treino>) => {
      setTreinos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
      scheduleAutoSave('treinos');
    },
    [scheduleAutoSave]
  );

  const removeTreino = useCallback(
    (id: string) => {
      setTreinos((prev) => prev.filter((t) => t.id !== id));
      scheduleAutoSave('treinos');
    },
    [scheduleAutoSave]
  );

  const updateTreinoNome = useCallback(
    (id: string, nome: string) => {
      setTreinos((prev) => prev.map((t) => (t.id === id ? { ...t, nome } : t)));
      scheduleAutoSave('treinos');
    },
    [scheduleAutoSave]
  );

  const updateTreinoDia = useCallback(
    (id: string, diaSemana: string) => {
      setTreinos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, diaSemana } : t))
      );
      scheduleAutoSave('treinos');
    },
    [scheduleAutoSave]
  );

  // Wrapper for setTreinos that triggers auto-save
  const setTreinosWithSave = useCallback(
    (newTreinos: Treino[] | ((prev: Treino[]) => Treino[])) => {
      setTreinos(newTreinos);
      scheduleAutoSave('treinos');
    },
    [scheduleAutoSave]
  );

  // Exercise management within treinos
  const addExercise = useCallback(
    (treinoId: string, exercise: Exercise) => {
      setTreinos((prev) =>
        prev.map((t) =>
          t.id === treinoId
            ? { ...t, exercicios: [...t.exercicios, exercise] }
            : t
        )
      );
      scheduleAutoSave('treinos');
    },
    [scheduleAutoSave]
  );

  const updateExercise = useCallback(
    (treinoId: string, exerciseIndex: number, updates: Partial<Exercise>) => {
      setTreinos((prev) =>
        prev.map((t) => {
          if (t.id !== treinoId) return t;
          const newExercicios = [...t.exercicios];
          newExercicios[exerciseIndex] = {
            ...newExercicios[exerciseIndex],
            ...updates,
          };
          return { ...t, exercicios: newExercicios };
        })
      );
      scheduleAutoSave('treinos');
    },
    [scheduleAutoSave]
  );

  const removeExercise = useCallback(
    (treinoId: string, exerciseIndex: number) => {
      setTreinos((prev) =>
        prev.map((t) => {
          if (t.id !== treinoId) return t;
          return {
            ...t,
            exercicios: t.exercicios.filter((_, i) => i !== exerciseIndex),
          };
        })
      );
      scheduleAutoSave('treinos');
    },
    [scheduleAutoSave]
  );

  // Dieta management
  const updateDieta = useCallback(
    (newDieta: Dieta | null) => {
      setDieta(newDieta);
      scheduleAutoSave('dieta');
    },
    [scheduleAutoSave]
  );

  const updateDietaMacros = useCallback(
    (
      macros: Partial<
        Pick<Dieta, 'calorias' | 'proteinas' | 'carboidratos' | 'gorduras'>
      >
    ) => {
      setDieta((prev) => (prev ? { ...prev, ...macros } : null));
      scheduleAutoSave('dieta');
    },
    [scheduleAutoSave]
  );

  const updateRefeicao = useCallback(
    (index: number, updates: Partial<Dieta['refeicoes'][0]>) => {
      setDieta((prev) => {
        if (!prev) return null;
        const newRefeicoes = [...prev.refeicoes];
        newRefeicoes[index] = { ...newRefeicoes[index], ...updates };
        return { ...prev, refeicoes: newRefeicoes };
      });
      scheduleAutoSave('dieta');
    },
    [scheduleAutoSave]
  );

  const addRefeicao = useCallback(
    (refeicao: Dieta['refeicoes'][0]) => {
      setDieta((prev) => {
        if (!prev) return null;
        return { ...prev, refeicoes: [...prev.refeicoes, refeicao] };
      });
      scheduleAutoSave('dieta');
    },
    [scheduleAutoSave]
  );

  const removeRefeicao = useCallback(
    (index: number) => {
      setDieta((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          refeicoes: prev.refeicoes.filter((_, i) => i !== index),
        };
      });
      scheduleAutoSave('dieta');
    },
    [scheduleAutoSave]
  );

  const updateAlimento = useCallback(
    (refeicaoIndex: number, alimentoIndex: number, updates: Partial<Alimento>) => {
      setDieta((prev) => {
        if (!prev) return null;
        const newRefeicoes = [...prev.refeicoes];
        const newAlimentos = [...newRefeicoes[refeicaoIndex].alimentos];
        newAlimentos[alimentoIndex] = { ...newAlimentos[alimentoIndex], ...updates };
        newRefeicoes[refeicaoIndex] = {
          ...newRefeicoes[refeicaoIndex],
          alimentos: newAlimentos,
        };
        return { ...prev, refeicoes: newRefeicoes };
      });
      scheduleAutoSave('dieta');
    },
    [scheduleAutoSave]
  );

  const addAlimento = useCallback(
    (refeicaoIndex: number, alimento: Alimento) => {
      setDieta((prev) => {
        if (!prev) return null;
        const newRefeicoes = [...prev.refeicoes];
        newRefeicoes[refeicaoIndex] = {
          ...newRefeicoes[refeicaoIndex],
          alimentos: [...newRefeicoes[refeicaoIndex].alimentos, alimento],
        };
        return { ...prev, refeicoes: newRefeicoes };
      });
      scheduleAutoSave('dieta');
    },
    [scheduleAutoSave]
  );

  const removeAlimento = useCallback(
    (refeicaoIndex: number, alimentoIndex: number) => {
      setDieta((prev) => {
        if (!prev) return null;
        const newRefeicoes = [...prev.refeicoes];
        newRefeicoes[refeicaoIndex] = {
          ...newRefeicoes[refeicaoIndex],
          alimentos: newRefeicoes[refeicaoIndex].alimentos.filter(
            (_, i) => i !== alimentoIndex
          ),
        };
        return { ...prev, refeicoes: newRefeicoes };
      });
      scheduleAutoSave('dieta');
    },
    [scheduleAutoSave]
  );

  // Reset all data
  const resetAll = useCallback(() => {
    setPersonalInfo(DEFAULT_PERSONAL_INFO);
    setTreinos([]);
    setDieta(null);
    // Don't schedule auto-save for reset - this is typically used for logout/cleanup
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

  // Reload data from server
  const reloadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

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

      // Clear pending changes since we just reloaded
      pendingChangesRef.current = {};
    } catch (err) {
      console.error('Error reloading fitness data:', err);
      setError('Erro ao recarregar dados');
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

    // Treinos
    setTreinos: setTreinosWithSave,
    addTreino,
    updateTreino,
    removeTreino,
    updateTreinoNome,
    updateTreinoDia,

    // Exercises
    addExercise,
    updateExercise,
    removeExercise,

    // Dieta
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
