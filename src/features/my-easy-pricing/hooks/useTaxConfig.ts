// =============================================================================
// useTaxConfig - Hook for managing tax configuration
// =============================================================================

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { pricingService } from '../services/PricingService';
import type {
  TaxConfig,
  TaxItem,
  TaxRegime,
  TaxCategory,
} from '../types/pricing.types';

// =============================================================================
// Types
// =============================================================================

export interface TaxItemFormData {
  name: string;
  category: TaxCategory;
  percentage: number;
}

interface UseTaxConfigReturn {
  // State
  taxConfig: TaxConfig | null;
  taxItems: TaxItem[];
  isLoading: boolean;
  error: string | null;
  totalTaxPercentage: number;

  // Config Actions
  loadTaxData: (storeId: string) => Promise<void>;
  updateTaxRegime: (storeId: string, regime: TaxRegime) => Promise<boolean>;

  // Item Actions
  addTaxItem: (storeId: string, data: TaxItemFormData) => Promise<TaxItem | null>;
  updateTaxItem: (itemId: string, data: Partial<TaxItemFormData>) => Promise<boolean>;
  deleteTaxItem: (itemId: string) => Promise<boolean>;
  clearTaxData: () => void;
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useTaxConfig(): UseTaxConfigReturn {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [taxConfig, setTaxConfig] = useState<TaxConfig | null>(null);
  const [taxItems, setTaxItems] = useState<TaxItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Calculate total tax percentage
  // ---------------------------------------------------------------------------
  const totalTaxPercentage = taxItems.reduce((total, item) => {
    return total + item.percentage;
  }, 0);

  // ---------------------------------------------------------------------------
  // Load tax config and items for a store
  // ---------------------------------------------------------------------------
  const loadTaxData = useCallback(async (storeId: string) => {
    if (!storeId) {
      setTaxConfig(null);
      setTaxItems([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Load both config and items in parallel
      const [configResult, itemsResult] = await Promise.all([
        pricingService.getTaxConfig(storeId),
        pricingService.getTaxItems(storeId),
      ]);

      if (configResult.error) {
        setError(configResult.error.message);
        toast.error('Erro ao carregar configuração de impostos');
        return;
      }

      if (itemsResult.error) {
        setError(itemsResult.error.message);
        toast.error('Erro ao carregar taxas');
        return;
      }

      setTaxConfig(configResult.data);
      setTaxItems(itemsResult.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error('Erro ao carregar dados de impostos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Update tax regime
  // ---------------------------------------------------------------------------
  const updateTaxRegime = useCallback(async (
    storeId: string,
    regime: TaxRegime
  ): Promise<boolean> => {
    try {
      const { data, error: updateError } = await pricingService.upsertTaxConfig(
        storeId,
        regime
      );

      if (updateError || !data) {
        toast.error('Erro ao atualizar regime tributário');
        return false;
      }

      setTaxConfig(data);
      toast.success('Regime tributário atualizado!');
      return true;
    } catch (err) {
      toast.error('Erro ao atualizar regime tributário');
      return false;
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Add a new tax item
  // ---------------------------------------------------------------------------
  const addTaxItem = useCallback(async (
    storeId: string,
    data: TaxItemFormData
  ): Promise<TaxItem | null> => {
    setIsLoading(true);

    try {
      const { data: newItem, error: createError } = await pricingService.createTaxItem(
        storeId,
        {
          name: data.name,
          category: data.category,
          percentage: data.percentage,
        }
      );

      if (createError || !newItem) {
        toast.error('Erro ao adicionar taxa');
        return null;
      }

      setTaxItems(prev => [...prev, newItem]);
      toast.success('Taxa adicionada!');
      return newItem;
    } catch (err) {
      toast.error('Erro ao adicionar taxa');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Update an existing tax item
  // ---------------------------------------------------------------------------
  const updateTaxItem = useCallback(async (
    itemId: string,
    data: Partial<TaxItemFormData>
  ): Promise<boolean> => {
    try {
      const { data: updatedItem, error: updateError } = await pricingService.updateTaxItem(
        itemId,
        data
      );

      if (updateError || !updatedItem) {
        toast.error('Erro ao atualizar taxa');
        return false;
      }

      setTaxItems(prev => prev.map(item => item.id === itemId ? updatedItem : item));
      return true;
    } catch (err) {
      toast.error('Erro ao atualizar taxa');
      return false;
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Delete a tax item
  // ---------------------------------------------------------------------------
  const deleteTaxItem = useCallback(async (itemId: string): Promise<boolean> => {
    try {
      const { success, error: deleteError } = await pricingService.deleteTaxItem(itemId);

      if (deleteError || !success) {
        toast.error('Erro ao remover taxa');
        return false;
      }

      setTaxItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Taxa removida!');
      return true;
    } catch (err) {
      toast.error('Erro ao remover taxa');
      return false;
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Clear tax data (when changing store)
  // ---------------------------------------------------------------------------
  const clearTaxData = useCallback(() => {
    setTaxConfig(null);
    setTaxItems([]);
    setError(null);
  }, []);

  // ---------------------------------------------------------------------------
  // Return public API
  // ---------------------------------------------------------------------------
  return {
    // State
    taxConfig,
    taxItems,
    isLoading,
    error,
    totalTaxPercentage,

    // Config Actions
    loadTaxData,
    updateTaxRegime,

    // Item Actions
    addTaxItem,
    updateTaxItem,
    deleteTaxItem,
    clearTaxData,
  };
}
