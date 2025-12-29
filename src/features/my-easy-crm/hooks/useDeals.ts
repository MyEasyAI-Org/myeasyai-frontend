// =============================================
// MyEasyCRM - useDeals Hook
// =============================================

import { useState, useCallback, useEffect } from 'react';
import { DealService } from '../services';
import type { Deal, DealFormData, DealFilters, DealStage, Pipeline } from '../types';

interface UseDealsReturn {
  deals: Deal[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  refresh: () => Promise<void>;
  createDeal: (data: DealFormData) => Promise<Deal>;
  updateDeal: (id: string, data: Partial<DealFormData>) => Promise<Deal>;
  deleteDeal: (id: string) => Promise<void>;
  moveDealToStage: (id: string, stage: DealStage, lostReason?: string) => Promise<Deal>;
  setFilters: (filters: DealFilters) => void;
  filters: DealFilters;
}

export function useDeals(initialFilters?: DealFilters): UseDealsReturn {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<DealFilters>(initialFilters || {});

  const fetchDeals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await DealService.getAll(filters);
      setDeals(data);
      setTotalCount(data.length);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load deals';
      setError(message);
      console.error('Error fetching deals:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const createDeal = useCallback(async (data: DealFormData): Promise<Deal> => {
    const deal = await DealService.create(data);
    setDeals((prev) => [deal, ...prev]);
    setTotalCount((prev) => prev + 1);
    return deal;
  }, []);

  const updateDeal = useCallback(async (id: string, data: Partial<DealFormData>): Promise<Deal> => {
    const updated = await DealService.update(id, data);
    setDeals((prev) => prev.map((d) => (d.id === id ? updated : d)));
    return updated;
  }, []);

  const deleteDeal = useCallback(async (id: string): Promise<void> => {
    await DealService.delete(id);
    setDeals((prev) => prev.filter((d) => d.id !== id));
    setTotalCount((prev) => prev - 1);
  }, []);

  const moveDealToStage = useCallback(async (id: string, stage: DealStage, lostReason?: string): Promise<Deal> => {
    const updated = await DealService.moveToStage(id, stage, lostReason);
    setDeals((prev) => prev.map((d) => (d.id === id ? updated : d)));
    return updated;
  }, []);

  return {
    deals,
    isLoading,
    error,
    totalCount,
    refresh: fetchDeals,
    createDeal,
    updateDeal,
    deleteDeal,
    moveDealToStage,
    setFilters,
    filters,
  };
}

// Hook para o Pipeline (Kanban)
interface UsePipelineReturn {
  pipeline: Pipeline | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  moveDealToStage: (dealId: string, stage: DealStage, lostReason?: string) => Promise<void>;
  createDeal: (data: DealFormData) => Promise<Deal>;
  updateDeal: (id: string, data: Partial<DealFormData>) => Promise<Deal>;
  deleteDeal: (id: string) => Promise<void>;
}

export function usePipeline(): UsePipelineReturn {
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPipeline = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await DealService.getPipeline();
      setPipeline(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load pipeline';
      setError(message);
      console.error('Error fetching pipeline:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  const moveDealToStage = useCallback(async (dealId: string, stage: DealStage, lostReason?: string) => {
    await DealService.moveToStage(dealId, stage, lostReason);
    // Refresh pipeline after move
    await fetchPipeline();
  }, [fetchPipeline]);

  const createDeal = useCallback(async (data: DealFormData): Promise<Deal> => {
    const deal = await DealService.create(data);
    // Refresh pipeline after create
    await fetchPipeline();
    return deal;
  }, [fetchPipeline]);

  const updateDeal = useCallback(async (id: string, data: Partial<DealFormData>): Promise<Deal> => {
    const deal = await DealService.update(id, data);
    // Refresh pipeline after update
    await fetchPipeline();
    return deal;
  }, [fetchPipeline]);

  const deleteDeal = useCallback(async (id: string): Promise<void> => {
    await DealService.delete(id);
    // Refresh pipeline after delete
    await fetchPipeline();
  }, [fetchPipeline]);

  return {
    pipeline,
    isLoading,
    error,
    refresh: fetchPipeline,
    moveDealToStage,
    createDeal,
    updateDeal,
    deleteDeal,
  };
}

// Hook para um único deal
interface UseDealReturn {
  deal: Deal | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateDeal: (data: Partial<DealFormData>) => Promise<Deal>;
  moveDealToStage: (stage: DealStage, lostReason?: string) => Promise<Deal>;
}

export function useDeal(id: string | null): UseDealReturn {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeal = useCallback(async () => {
    if (!id) {
      setDeal(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await DealService.getById(id);
      setDeal(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load deal';
      setError(message);
      console.error('Error fetching deal:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDeal();
  }, [fetchDeal]);

  const updateDeal = useCallback(async (data: Partial<DealFormData>): Promise<Deal> => {
    if (!id) throw new Error('Deal ID not provided');
    const updated = await DealService.update(id, data);
    setDeal(updated);
    return updated;
  }, [id]);

  const moveDealToStage = useCallback(async (stage: DealStage, lostReason?: string): Promise<Deal> => {
    if (!id) throw new Error('Deal ID not provided');
    const updated = await DealService.moveToStage(id, stage, lostReason);
    setDeal(updated);
    return updated;
  }, [id]);

  return {
    deal,
    isLoading,
    error,
    refresh: fetchDeal,
    updateDeal,
    moveDealToStage,
  };
}

// Hook para métricas do pipeline
interface UseDealMetricsReturn {
  metrics: {
    total_value: number;
    weighted_value: number;
    open_deals: number;
    won_this_month: number;
    lost_this_month: number;
    revenue_this_month: number;
  } | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useDealMetrics(): UseDealMetricsReturn {
  const [metrics, setMetrics] = useState<UseDealMetricsReturn['metrics']>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await DealService.getMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching deal metrics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    isLoading,
    refresh: fetchMetrics,
  };
}
