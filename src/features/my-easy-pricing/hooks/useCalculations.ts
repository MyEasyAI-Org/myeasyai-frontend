// =============================================================================
// useCalculations - Hook for calculating product pricing
// =============================================================================

import { useMemo } from 'react';
import type {
  Product,
  IndirectCost,
  HiddenCost,
  TaxItem,
  CostAllocationMethod,
} from '../types/pricing.types';
import {
  calculateAllProducts,
  type ProductCalculation,
  type StoreCostsSummary,
} from '../utils/calculations';

// =============================================================================
// Types
// =============================================================================

interface UseCalculationsParams {
  products: Product[];
  indirectCosts: IndirectCost[];
  hiddenCosts: HiddenCost[];
  taxItems: TaxItem[];
  allocationMethod: CostAllocationMethod;
}

interface UseCalculationsReturn {
  calculations: ProductCalculation[];
  summary: StoreCostsSummary;
  getCalculationByProductId: (productId: string) => ProductCalculation | undefined;
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useCalculations({
  products,
  indirectCosts,
  hiddenCosts,
  taxItems,
  allocationMethod,
}: UseCalculationsParams): UseCalculationsReturn {
  // Memoize calculations to avoid recalculating on every render
  const result = useMemo(() => {
    return calculateAllProducts({
      products,
      indirectCosts,
      hiddenCosts,
      taxItems,
      allocationMethod,
    });
  }, [products, indirectCosts, hiddenCosts, taxItems, allocationMethod]);

  // Helper to get calculation for a specific product
  const getCalculationByProductId = useMemo(() => {
    return (productId: string) => {
      return result.calculations.find(calc => calc.productId === productId);
    };
  }, [result.calculations]);

  return {
    calculations: result.calculations,
    summary: result.summary,
    getCalculationByProductId,
  };
}

// =============================================================================
// Re-export types for convenience
// =============================================================================

export type { ProductCalculation, StoreCostsSummary };
