import { useState, useCallback, useEffect } from 'react';
import { CandidateService } from '../services/CandidateService';
import type { Candidate, CandidateFormData, CandidateFilters } from '../types';

export function useCandidates(initialFilters?: CandidateFilters) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CandidateFilters>(initialFilters ?? {});

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await CandidateService.getAll(filters);
      setCandidates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar candidatos');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createCandidate = useCallback(async (data: CandidateFormData): Promise<Candidate> => {
    const candidate = await CandidateService.create(data);
    setCandidates((prev) => [candidate, ...prev]);
    return candidate;
  }, []);

  const updateCandidate = useCallback(async (id: string, data: Partial<CandidateFormData>): Promise<Candidate> => {
    const updated = await CandidateService.update(id, data);
    setCandidates((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const deleteCandidate = useCallback(async (id: string): Promise<void> => {
    await CandidateService.delete(id);
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateScreening = useCallback(
    async (id: string, score: number, grade: Candidate['screening_grade'], aiNotes: string): Promise<Candidate> => {
      const updated = await CandidateService.updateScreening(id, score, grade, aiNotes);
      setCandidates((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    },
    [],
  );

  return {
    candidates,
    isLoading,
    error,
    totalCount: candidates.length,
    filters,
    setFilters,
    refresh,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    updateScreening,
  };
}
