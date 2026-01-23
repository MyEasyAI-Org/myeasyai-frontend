/**
 * useWorkoutManager Hook
 *
 * Manages workout (treino) and exercise state with auto-save integration.
 */

import { useCallback } from 'react';
import type { Exercise, Treino } from '../types';
import type { ChangeType } from './useAutoSave';

interface UseWorkoutManagerProps {
  treinos: Treino[];
  setTreinos: React.Dispatch<React.SetStateAction<Treino[]>>;
  scheduleAutoSave: (changeType: ChangeType) => void;
}

interface UseWorkoutManagerReturn {
  setTreinosWithSave: (newTreinos: Treino[] | ((prev: Treino[]) => Treino[])) => void;
  addTreino: (treino: Treino) => void;
  updateTreino: (id: string, updates: Partial<Treino>) => void;
  removeTreino: (id: string) => void;
  updateTreinoNome: (id: string, nome: string) => void;
  updateTreinoDia: (id: string, diaSemana: string) => void;
  addExercise: (treinoId: string, exercise: Exercise) => void;
  updateExercise: (treinoId: string, exerciseIndex: number, updates: Partial<Exercise>) => void;
  removeExercise: (treinoId: string, exerciseIndex: number) => void;
}

/**
 * Hook for managing workout operations
 */
export function useWorkoutManager({
  treinos,
  setTreinos,
  scheduleAutoSave,
}: UseWorkoutManagerProps): UseWorkoutManagerReturn {
  // Wrapper for setTreinos that triggers auto-save
  const setTreinosWithSave = useCallback(
    (newTreinos: Treino[] | ((prev: Treino[]) => Treino[])) => {
      setTreinos(newTreinos);
      scheduleAutoSave('treinos');
    },
    [setTreinos, scheduleAutoSave]
  );

  const addTreino = useCallback(
    (treino: Treino) => {
      setTreinos((prev) => [...prev, treino]);
      scheduleAutoSave('treinos');
    },
    [setTreinos, scheduleAutoSave]
  );

  const updateTreino = useCallback(
    (id: string, updates: Partial<Treino>) => {
      setTreinos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
      scheduleAutoSave('treinos');
    },
    [setTreinos, scheduleAutoSave]
  );

  const removeTreino = useCallback(
    (id: string) => {
      setTreinos((prev) => prev.filter((t) => t.id !== id));
      scheduleAutoSave('treinos');
    },
    [setTreinos, scheduleAutoSave]
  );

  const updateTreinoNome = useCallback(
    (id: string, nome: string) => {
      setTreinos((prev) => prev.map((t) => (t.id === id ? { ...t, nome } : t)));
      scheduleAutoSave('treinos');
    },
    [setTreinos, scheduleAutoSave]
  );

  const updateTreinoDia = useCallback(
    (id: string, diaSemana: string) => {
      setTreinos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, diaSemana } : t))
      );
      scheduleAutoSave('treinos');
    },
    [setTreinos, scheduleAutoSave]
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
    [setTreinos, scheduleAutoSave]
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
    [setTreinos, scheduleAutoSave]
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
    [setTreinos, scheduleAutoSave]
  );

  return {
    setTreinosWithSave,
    addTreino,
    updateTreino,
    removeTreino,
    updateTreinoNome,
    updateTreinoDia,
    addExercise,
    updateExercise,
    removeExercise,
  };
}
