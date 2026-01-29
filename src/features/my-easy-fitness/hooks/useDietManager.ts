/**
 * useDietManager Hook
 *
 * Manages diet (dieta) and meal (refeição) state with auto-save integration.
 */

import { useCallback } from 'react';
import type { Alimento, Dieta, Refeicao } from '../types';
import type { ChangeType } from './useAutoSave';

interface UseDietManagerProps {
  dieta: Dieta | null;
  setDieta: React.Dispatch<React.SetStateAction<Dieta | null>>;
  scheduleAutoSave: (changeType: ChangeType) => void;
}

interface UseDietManagerReturn {
  updateDieta: (newDieta: Dieta | null) => void;
  updateDietaMacros: (macros: Partial<Pick<Dieta, 'calorias' | 'proteinas' | 'carboidratos' | 'gorduras'>>) => void;
  updateRefeicao: (index: number, updates: Partial<Refeicao>) => void;
  addRefeicao: (refeicao: Refeicao) => void;
  removeRefeicao: (index: number) => void;
  updateAlimento: (refeicaoIndex: number, alimentoIndex: number, updates: Partial<Alimento>) => void;
  addAlimento: (refeicaoIndex: number, alimento: Alimento) => void;
  removeAlimento: (refeicaoIndex: number, alimentoIndex: number) => void;
}

/**
 * Hook for managing diet operations
 */
export function useDietManager({
  dieta,
  setDieta,
  scheduleAutoSave,
}: UseDietManagerProps): UseDietManagerReturn {
  const updateDieta = useCallback(
    (newDieta: Dieta | null) => {
      setDieta(newDieta);
      scheduleAutoSave('dieta');
    },
    [setDieta, scheduleAutoSave]
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
    [setDieta, scheduleAutoSave]
  );

  const updateRefeicao = useCallback(
    (index: number, updates: Partial<Refeicao>) => {
      setDieta((prev) => {
        if (!prev) return null;
        const newRefeicoes = [...prev.refeicoes];
        newRefeicoes[index] = { ...newRefeicoes[index], ...updates };
        return { ...prev, refeicoes: newRefeicoes };
      });
      scheduleAutoSave('dieta');
    },
    [setDieta, scheduleAutoSave]
  );

  const addRefeicao = useCallback(
    (refeicao: Refeicao) => {
      setDieta((prev) => {
        if (!prev) return null;
        return { ...prev, refeicoes: [...prev.refeicoes, refeicao] };
      });
      scheduleAutoSave('dieta');
    },
    [setDieta, scheduleAutoSave]
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
    [setDieta, scheduleAutoSave]
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
    [setDieta, scheduleAutoSave]
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
    [setDieta, scheduleAutoSave]
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
    [setDieta, scheduleAutoSave]
  );

  return {
    updateDieta,
    updateDietaMacros,
    updateRefeicao,
    addRefeicao,
    removeRefeicao,
    updateAlimento,
    addAlimento,
    removeAlimento,
  };
}
