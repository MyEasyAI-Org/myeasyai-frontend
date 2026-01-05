/**
 * useFitnessData Hook
 *
 * Centralized state management for fitness data with D1 persistence.
 * Follows Single Responsibility Principle - manages data state and persistence.
 */

import { useCallback, useState, useEffect, useRef } from 'react';
import type { Dieta, Exercise, Treino, UserAnamnese } from '../types';
import { DEFAULT_ANAMNESE } from '../constants';
import { FitnessService } from '../services/FitnessService';

// Debounce delay for auto-save (in ms)
const AUTO_SAVE_DELAY = 2000;

/**
 * Hook for managing fitness data state with persistence
 */
export function useFitnessData(initialAnamnese?: Partial<UserAnamnese>) {
  const [anamnese, setAnamnese] = useState<UserAnamnese>({
    ...DEFAULT_ANAMNESE,
    ...initialAnamnese,
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
    anamnese?: boolean;
    treinos?: boolean;
    dieta?: boolean;
  }>({});
  // Auto-save timeout ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

        if (data.anamnese) {
          setAnamnese(data.anamnese);
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
  }, []);

  // Auto-save function
  const autoSave = useCallback(async () => {
    const changes = pendingChangesRef.current;
    if (!changes.anamnese && !changes.treinos && !changes.dieta) return;

    try {
      setIsSaving(true);

      const isAuth = await FitnessService.isAuthenticated();
      if (!isAuth) {
        console.log('User not authenticated, skipping save');
        return;
      }

      const promises: Promise<boolean>[] = [];

      if (changes.anamnese) {
        promises.push(FitnessService.saveProfile(anamnese));
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
  }, [anamnese, treinos, dieta]);

  // Schedule auto-save when data changes
  const scheduleAutoSave = useCallback(
    (changeType: 'anamnese' | 'treinos' | 'dieta') => {
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

  // Anamnese updates
  const updateAnamnese = useCallback(
    (updates: Partial<UserAnamnese>) => {
      setAnamnese((prev) => ({ ...prev, ...updates }));
      scheduleAutoSave('anamnese');
    },
    [scheduleAutoSave]
  );

  const resetAnamnese = useCallback(() => {
    setAnamnese(DEFAULT_ANAMNESE);
    scheduleAutoSave('anamnese');
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
    (refeicaoIndex: number, alimentoIndex: number, value: string) => {
      setDieta((prev) => {
        if (!prev) return null;
        const newRefeicoes = [...prev.refeicoes];
        const newAlimentos = [...newRefeicoes[refeicaoIndex].alimentos];
        newAlimentos[alimentoIndex] = value;
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
    (refeicaoIndex: number, alimento: string) => {
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
    setAnamnese(DEFAULT_ANAMNESE);
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
      anamnese: true,
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

      if (data.anamnese) {
        setAnamnese(data.anamnese);
      } else {
        setAnamnese(DEFAULT_ANAMNESE);
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
    anamnese,
    treinos,
    dieta,

    // Loading/saving status
    isLoading,
    isSaving,
    lastSavedAt,
    error,

    // Anamnese
    updateAnamnese,
    resetAnamnese,

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
