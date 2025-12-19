// =============================================================================
// useHiddenCosts - Hook for managing hidden costs
// =============================================================================

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { pricingServiceV2 } from '../services/PricingServiceV2';
import { CALCULATION_CONSTANTS } from '../constants/pricing.constants';
import { calculateMonthlyCost } from './useIndirectCosts';
import type {
  HiddenCost,
  HiddenCostCategory,
  HiddenCostAuxiliaryData,
  CostFrequency,
} from '../types/pricing.types';

// =============================================================================
// Types
// =============================================================================

export interface HiddenCostFormData {
  name: string;
  category: HiddenCostCategory;
  amount: number;
  frequency: CostFrequency;
  amortization_months: number;
  is_auto_calculated: boolean;
  auxiliary_data: HiddenCostAuxiliaryData | null;
  notes?: string;
}

interface UseHiddenCostsReturn {
  // State
  costs: HiddenCost[];
  isLoading: boolean;
  error: string | null;
  totalMonthly: number;

  // Actions
  loadCosts: (storeId: string) => Promise<void>;
  addCost: (storeId: string, data: HiddenCostFormData) => Promise<HiddenCost | null>;
  updateCost: (costId: string, data: Partial<HiddenCostFormData>) => Promise<boolean>;
  deleteCost: (costId: string) => Promise<boolean>;
  clearCosts: () => void;
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useHiddenCosts(): UseHiddenCostsReturn {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [costs, setCosts] = useState<HiddenCost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Calculate total monthly cost
  // ---------------------------------------------------------------------------
  const totalMonthly = costs.reduce((total, cost) => {
    return total + calculateMonthlyCost(cost.amount, cost.frequency, cost.amortization_months);
  }, 0);

  // ---------------------------------------------------------------------------
  // Load costs for a store
  // ---------------------------------------------------------------------------
  const loadCosts = useCallback(async (storeId: string) => {
    if (!storeId) {
      setCosts([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await pricingServiceV2.getHiddenCosts(storeId);

      if (fetchError) {
        setError(fetchError.message);
        toast.error('Erro ao carregar custos ocultos');
        return;
      }

      setCosts(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error('Erro ao carregar custos ocultos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Add a new cost
  // ---------------------------------------------------------------------------
  const addCost = useCallback(async (
    storeId: string,
    data: HiddenCostFormData
  ): Promise<HiddenCost | null> => {
    setIsLoading(true);

    try {
      const { data: newCost, error: createError } = await pricingServiceV2.createHiddenCost(
        storeId,
        {
          name: data.name,
          category: data.category,
          amount: data.amount,
          frequency: data.frequency,
          amortization_months: data.amortization_months,
          is_auto_calculated: data.is_auto_calculated,
          auxiliary_data: data.auxiliary_data,
          notes: data.notes,
        }
      );

      if (createError || !newCost) {
        toast.error('Erro ao adicionar custo');
        return null;
      }

      setCosts(prev => [...prev, newCost]);
      toast.success('Custo adicionado!');
      return newCost;
    } catch (err) {
      toast.error('Erro ao adicionar custo');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Update an existing cost
  // ---------------------------------------------------------------------------
  const updateCost = useCallback(async (
    costId: string,
    data: Partial<HiddenCostFormData>
  ): Promise<boolean> => {
    try {
      const { data: updatedCost, error: updateError } = await pricingServiceV2.updateHiddenCost(
        costId,
        data
      );

      if (updateError || !updatedCost) {
        toast.error('Erro ao atualizar custo');
        return false;
      }

      setCosts(prev => prev.map(c => c.id === costId ? updatedCost : c));
      return true;
    } catch (err) {
      toast.error('Erro ao atualizar custo');
      return false;
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Delete a cost
  // ---------------------------------------------------------------------------
  const deleteCost = useCallback(async (costId: string): Promise<boolean> => {
    try {
      const { success, error: deleteError } = await pricingServiceV2.deleteHiddenCost(costId);

      if (deleteError || !success) {
        toast.error('Erro ao remover custo');
        return false;
      }

      setCosts(prev => prev.filter(c => c.id !== costId));
      toast.success('Custo removido!');
      return true;
    } catch (err) {
      toast.error('Erro ao remover custo');
      return false;
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Clear costs (when changing store)
  // ---------------------------------------------------------------------------
  const clearCosts = useCallback(() => {
    setCosts([]);
    setError(null);
  }, []);

  // ---------------------------------------------------------------------------
  // Return public API
  // ---------------------------------------------------------------------------
  return {
    // State
    costs,
    isLoading,
    error,
    totalMonthly,

    // Actions
    loadCosts,
    addCost,
    updateCost,
    deleteCost,
    clearCosts,
  };
}
