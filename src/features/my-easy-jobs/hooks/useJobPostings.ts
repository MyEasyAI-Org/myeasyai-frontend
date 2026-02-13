import { useState, useCallback, useEffect } from 'react';
import { JobPostingService } from '../services/JobPostingService';
import type { JobPosting, JobPostingFormData, JobPostingFilters } from '../types';

export function useJobPostings(initialFilters?: JobPostingFilters) {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<JobPostingFilters>(initialFilters ?? {});

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await JobPostingService.getAll(filters);
      setJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar vagas');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createJob = useCallback(async (data: JobPostingFormData): Promise<JobPosting> => {
    const job = await JobPostingService.create(data);
    setJobs((prev) => [job, ...prev]);
    return job;
  }, []);

  const updateJob = useCallback(async (id: string, data: Partial<JobPostingFormData>): Promise<JobPosting> => {
    const updated = await JobPostingService.update(id, data);
    setJobs((prev) => prev.map((j) => (j.id === id ? updated : j)));
    return updated;
  }, []);

  const deleteJob = useCallback(async (id: string): Promise<void> => {
    await JobPostingService.delete(id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }, []);

  return {
    jobs,
    isLoading,
    error,
    totalCount: jobs.length,
    filters,
    setFilters,
    refresh,
    createJob,
    updateJob,
    deleteJob,
  };
}
