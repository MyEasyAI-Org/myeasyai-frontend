// =============================================================================
// useStoreData - Hook for managing pricing stores
// =============================================================================

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { authService } from '../../../services/AuthServiceV2';
import { pricingServiceV2 } from '../services/PricingServiceV2';
import type { Store, StoreFormData } from '../types/pricing.types';

// =============================================================================
// Types
// =============================================================================

interface UseStoreDataReturn {
  // State
  stores: Store[];
  selectedStore: Store | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadStores: () => Promise<void>;
  selectStore: (storeIdOrStore: string | Store | null) => void;
  createStore: (data: StoreFormData) => Promise<Store | null>;
  updateStore: (storeId: string, data: Partial<StoreFormData>) => Promise<boolean>;
  deleteStore: (storeId: string) => Promise<boolean>;
  refreshStores: () => Promise<void>;
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useStoreData(): UseStoreDataReturn {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userUuid, setUserUuid] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Get current user UUID from AuthServiceV2 (supports both Cloudflare and Supabase)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange((user) => {
      if (user) {
        console.log('[useStoreData] User authenticated:', user.uuid);
        setUserUuid(user.uuid);
      } else {
        console.log('[useStoreData] No user authenticated');
        setUserUuid(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // ---------------------------------------------------------------------------
  // Load stores when user is available
  // ---------------------------------------------------------------------------
  const loadStores = useCallback(async () => {
    if (!userUuid) {
      console.log('[useStoreData] No userUuid yet, skipping load');
      return;
    }

    console.log('[useStoreData] Loading stores for user:', userUuid);
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await pricingServiceV2.getStores(userUuid);

      if (fetchError) {
        console.error('[useStoreData] Error loading stores:', fetchError.message);
        setError(fetchError.message);
        toast.error('Erro ao carregar lojas: ' + fetchError.message);
        return;
      }

      console.log('[useStoreData] Loaded stores:', data?.length || 0);
      setStores(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('[useStoreData] Exception loading stores:', errorMessage);
      setError(errorMessage);
      toast.error('Erro ao carregar lojas');
    } finally {
      setIsLoading(false);
    }
  }, [userUuid]);

  // Auto-load stores when userUuid becomes available
  useEffect(() => {
    if (userUuid) {
      loadStores();
    }
  }, [userUuid, loadStores]);

  // ---------------------------------------------------------------------------
  // Select a store (accepts either store ID or Store object)
  // ---------------------------------------------------------------------------
  const selectStore = useCallback((storeIdOrStore: string | Store | null) => {
    if (!storeIdOrStore) {
      setSelectedStore(null);
      return;
    }

    // If it's a Store object, use it directly
    if (typeof storeIdOrStore === 'object') {
      setSelectedStore(storeIdOrStore);
      return;
    }

    // If it's a string (ID), find in stores
    const store = stores.find(s => s.id === storeIdOrStore);
    setSelectedStore(store || null);
  }, [stores]);

  // ---------------------------------------------------------------------------
  // Create a new store
  // ---------------------------------------------------------------------------
  const createStore = useCallback(async (data: StoreFormData): Promise<Store | null> => {
    if (!userUuid) {
      console.error('[useStoreData] Cannot create store: no userUuid');
      toast.error('Usuário não autenticado');
      return null;
    }

    console.log('[useStoreData] Creating store:', data.name);
    setIsLoading(true);

    try {
      const { data: newStore, error: createError } = await pricingServiceV2.createStore(userUuid, data);

      if (createError) {
        console.error('[useStoreData] Error creating store:', createError.message);
        toast.error('Erro ao criar loja: ' + createError.message);
        return null;
      }

      if (!newStore) {
        console.error('[useStoreData] No store returned from create');
        toast.error('Erro ao criar loja: resposta vazia');
        return null;
      }

      console.log('[useStoreData] Store created successfully:', newStore.id);

      // Update local state (add at end since list is ordered by created_at ascending)
      setStores(prev => [...prev, newStore]);
      // Also set as selected store immediately (avoids stale closure issue)
      setSelectedStore(newStore);
      toast.success('Loja criada com sucesso!');

      return newStore;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('[useStoreData] Exception creating store:', errorMessage);
      toast.error('Erro ao criar loja');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userUuid]);

  // ---------------------------------------------------------------------------
  // Update an existing store
  // ---------------------------------------------------------------------------
  const updateStore = useCallback(async (
    storeId: string,
    data: Partial<StoreFormData>
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      const { data: updatedStore, error: updateError } = await pricingServiceV2.updateStore(storeId, data);

      if (updateError || !updatedStore) {
        toast.error('Erro ao atualizar loja');
        return false;
      }

      // Update local state
      setStores(prev => prev.map(s => s.id === storeId ? updatedStore : s));

      // Update selected store if it's the one being edited
      if (selectedStore?.id === storeId) {
        setSelectedStore(updatedStore);
      }

      toast.success('Loja atualizada com sucesso!');
      return true;
    } catch (err) {
      toast.error('Erro ao atualizar loja');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedStore]);

  // ---------------------------------------------------------------------------
  // Delete a store (soft delete)
  // ---------------------------------------------------------------------------
  const deleteStore = useCallback(async (storeId: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const { success, error: deleteError } = await pricingServiceV2.deleteStore(storeId);

      if (deleteError || !success) {
        toast.error('Erro ao excluir loja');
        return false;
      }

      // Update local state
      setStores(prev => prev.filter(s => s.id !== storeId));

      // Clear selection if deleted store was selected
      if (selectedStore?.id === storeId) {
        setSelectedStore(null);
      }

      toast.success('Loja excluída com sucesso!');
      return true;
    } catch (err) {
      toast.error('Erro ao excluir loja');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedStore]);

  // ---------------------------------------------------------------------------
  // Refresh stores (force reload)
  // ---------------------------------------------------------------------------
  const refreshStores = useCallback(async () => {
    await loadStores();
  }, [loadStores]);

  // ---------------------------------------------------------------------------
  // Return public API
  // ---------------------------------------------------------------------------
  return {
    // State
    stores,
    selectedStore,
    isLoading,
    error,

    // Actions
    loadStores,
    selectStore,
    createStore,
    updateStore,
    deleteStore,
    refreshStores,
  };
}
