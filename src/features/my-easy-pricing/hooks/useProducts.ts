// =============================================================================
// useProducts - Hook for managing products
// =============================================================================

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { pricingServiceV2 } from '../services/PricingServiceV2';
import { CALCULATION_CONSTANTS } from '../constants/pricing.constants';
import type {
  Product,
  ProductFormData,
} from '../types/pricing.types';

// =============================================================================
// Types
// =============================================================================

interface UseProductsReturn {
  // State
  products: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadProducts: (storeId: string) => Promise<void>;
  selectProduct: (productId: string | null) => void;
  createProduct: (storeId: string, data: ProductFormData) => Promise<Product | null>;
  updateProduct: (productId: string, data: Partial<ProductFormData>) => Promise<boolean>;
  deleteProduct: (productId: string) => Promise<boolean>;
  clearProducts: () => void;
}

// =============================================================================
// Default Form Data
// =============================================================================

export const getDefaultProductFormData = (): ProductFormData => ({
  name: '',
  description: '',
  category: '',
  direct_cost: 0,
  unit_type: 'unit',
  desired_margin: CALCULATION_CONSTANTS.defaults.marginPercentage,
  positioning: 'intermediate',
  market_price: null,
  weight: CALCULATION_CONSTANTS.defaults.weight,
  monthly_units_estimate: CALCULATION_CONSTANTS.defaults.monthlyUnitsEstimate,
});

// =============================================================================
// Hook Implementation
// =============================================================================

export function useProducts(): UseProductsReturn {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Load products for a store
  // ---------------------------------------------------------------------------
  const loadProducts = useCallback(async (storeId: string) => {
    if (!storeId) {
      setProducts([]);
      setSelectedProduct(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await pricingServiceV2.getProducts(storeId);

      if (fetchError) {
        setError(fetchError.message);
        toast.error('Erro ao carregar produtos');
        return;
      }

      setProducts(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error('Erro ao carregar produtos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Select a product
  // ---------------------------------------------------------------------------
  const selectProduct = useCallback((productId: string | null) => {
    if (!productId) {
      setSelectedProduct(null);
      return;
    }

    const product = products.find(p => p.id === productId);
    setSelectedProduct(product || null);
  }, [products]);

  // ---------------------------------------------------------------------------
  // Create a new product
  // ---------------------------------------------------------------------------
  const createProduct = useCallback(async (
    storeId: string,
    data: ProductFormData
  ): Promise<Product | null> => {
    setIsLoading(true);

    try {
      const { data: newProduct, error: createError } = await pricingServiceV2.createProduct(
        storeId,
        data
      );

      if (createError || !newProduct) {
        toast.error('Erro ao criar produto');
        return null;
      }

      setProducts(prev => [...prev, newProduct]);
      setSelectedProduct(newProduct);
      toast.success('Produto criado!');
      return newProduct;
    } catch (err) {
      toast.error('Erro ao criar produto');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Update an existing product
  // ---------------------------------------------------------------------------
  const updateProduct = useCallback(async (
    productId: string,
    data: Partial<ProductFormData>
  ): Promise<boolean> => {
    try {
      const { data: updatedProduct, error: updateError } = await pricingServiceV2.updateProduct(
        productId,
        data
      );

      if (updateError || !updatedProduct) {
        toast.error('Erro ao atualizar produto');
        return false;
      }

      setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));

      // Update selected product if it's the one being edited
      if (selectedProduct?.id === productId) {
        setSelectedProduct(updatedProduct);
      }

      toast.success('Produto atualizado!');
      return true;
    } catch (err) {
      toast.error('Erro ao atualizar produto');
      return false;
    }
  }, [selectedProduct]);

  // ---------------------------------------------------------------------------
  // Delete a product
  // ---------------------------------------------------------------------------
  const deleteProduct = useCallback(async (productId: string): Promise<boolean> => {
    try {
      const { success, error: deleteError } = await pricingServiceV2.deleteProduct(productId);

      if (deleteError || !success) {
        toast.error('Erro ao excluir produto');
        return false;
      }

      setProducts(prev => prev.filter(p => p.id !== productId));

      // Clear selection if deleted product was selected
      if (selectedProduct?.id === productId) {
        setSelectedProduct(null);
      }

      toast.success('Produto excluído!');
      return true;
    } catch (err) {
      toast.error('Erro ao excluir produto');
      return false;
    }
  }, [selectedProduct]);

  // ---------------------------------------------------------------------------
  // Clear products (when changing store)
  // ---------------------------------------------------------------------------
  const clearProducts = useCallback(() => {
    setProducts([]);
    setSelectedProduct(null);
    setError(null);
  }, []);

  // ---------------------------------------------------------------------------
  // Return public API
  // ---------------------------------------------------------------------------
  return {
    // State
    products,
    selectedProduct,
    isLoading,
    error,

    // Actions
    loadProducts,
    selectProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    clearProducts,
  };
}
