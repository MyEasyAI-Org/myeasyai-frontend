// =============================================================================
// useIndirectCosts - Hook for managing indirect costs
// =============================================================================

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { pricingService } from '../services/PricingService';
import { CALCULATION_CONSTANTS } from '../constants/pricing.constants';
import type {
  IndirectCost,
  IndirectCostCategory,
  CostFrequency,
} from '../types/pricing.types';

// =============================================================================
// Types
// =============================================================================

export interface IndirectCostFormData {
  name: string;
  category: IndirectCostCategory;
  amount: number;
  frequency: CostFrequency;
  amortization_months: number;
  notes?: string;
}

interface UseIndirectCostsReturn {
  // State
  costs: IndirectCost[];
  isLoading: boolean;
  error: string | null;
  totalMonthly: number;

  // Actions
  loadCosts: (storeId: string) => Promise<void>;
  addCost: (storeId: string, data: IndirectCostFormData) => Promise<IndirectCost | null>;
  updateCost: (costId: string, data: Partial<IndirectCostFormData>) => Promise<boolean>;
  deleteCost: (costId: string) => Promise<boolean>;
  clearCosts: () => void;
}

// =============================================================================
// Helper: Calculate monthly cost based on frequency
// =============================================================================

export function calculateMonthlyCost(
  amount: number,
  frequency: CostFrequency,
  amortizationMonths: number = CALCULATION_CONSTANTS.defaults.amortizationMonths
): number {
  switch (frequency) {
    case 'monthly':
      return amount;
    case 'yearly':
      return amount / 12;
    case 'one_time':
      return amount / amortizationMonths;
    default:
      return amount;
  }
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useIndirectCosts(): UseIndirectCostsReturn {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [costs, setCosts] = useState<IndirectCost[]>([]);
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
      const { data, error: fetchError } = await pricingService.getIndirectCosts(storeId);

      if (fetchError) {
        setError(fetchError.message);
        toast.error('Erro ao carregar custos indiretos');
        return;
      }

      setCosts(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error('Erro ao carregar custos indiretos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Add a new cost
  // ---------------------------------------------------------------------------
  const addCost = useCallback(async (
    storeId: string,
    data: IndirectCostFormData
  ): Promise<IndirectCost | null> => {
    setIsLoading(true);

    try {
      const { data: newCost, error: createError } = await pricingService.createIndirectCost(
        storeId,
        {
          name: data.name,
          category: data.category,
          amount: data.amount,
          frequency: data.frequency,
          amortization_months: data.amortization_months,
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
    data: Partial<IndirectCostFormData>
  ): Promise<boolean> => {
    try {
      const { data: updatedCost, error: updateError } = await pricingService.updateIndirectCost(
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
      const { success, error: deleteError } = await pricingService.deleteIndirectCost(costId);

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
