// =============================================================================
// PricingService - CRUD operations for MyEasyPricing
// =============================================================================

import { supabase } from '../../../lib/api-clients/supabase-client';
import type { Store, StoreFormData } from '../types/pricing.types';

// =============================================================================
// Store Operations
// =============================================================================

export class PricingService {
  // ---------------------------------------------------------------------------
  // GET: Fetch all stores for the current user
  // ---------------------------------------------------------------------------
  async getStores(userUuid: string): Promise<{ data: Store[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('pricing_stores')
        .select('*')
        .eq('user_uuid', userUuid)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[PricingService] Error fetching stores:', error);
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as Store[], error: null };
    } catch (error) {
      console.error('[PricingService] Exception in getStores:', error);
      return { data: null, error: error as Error };
    }
  }

  // ---------------------------------------------------------------------------
  // GET: Fetch a single store by ID
  // ---------------------------------------------------------------------------
  async getStoreById(storeId: string): Promise<{ data: Store | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('pricing_stores')
        .select('*')
        .eq('id', storeId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('[PricingService] Error fetching store:', error);
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as Store, error: null };
    } catch (error) {
      console.error('[PricingService] Exception in getStoreById:', error);
      return { data: null, error: error as Error };
    }
  }

  // ---------------------------------------------------------------------------
  // CREATE: Create a new store
  // ---------------------------------------------------------------------------
  async createStore(
    userUuid: string,
    formData: StoreFormData
  ): Promise<{ data: Store | null; error: Error | null }> {
    try {
      const newStore = {
        user_uuid: userUuid,
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        currency: 'BRL',
        cost_allocation_method: formData.cost_allocation_method,
        is_active: true,
        is_demo: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('pricing_stores')
        .insert(newStore)
        .select()
        .single();

      if (error) {
        console.error('[PricingService] Error creating store:', error);
        return { data: null, error: new Error(error.message) };
      }

      console.log('[PricingService] Store created successfully:', data.id);
      return { data: data as Store, error: null };
    } catch (error) {
      console.error('[PricingService] Exception in createStore:', error);
      return { data: null, error: error as Error };
    }
  }

  // ---------------------------------------------------------------------------
  // UPDATE: Update an existing store
  // ---------------------------------------------------------------------------
  async updateStore(
    storeId: string,
    formData: Partial<StoreFormData>
  ): Promise<{ data: Store | null; error: Error | null }> {
    try {
      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (formData.name !== undefined) {
        updates.name = formData.name.trim();
      }
      if (formData.description !== undefined) {
        updates.description = formData.description?.trim() || null;
      }
      if (formData.cost_allocation_method !== undefined) {
        updates.cost_allocation_method = formData.cost_allocation_method;
      }

      const { data, error } = await supabase
        .from('pricing_stores')
        .update(updates)
        .eq('id', storeId)
        .select()
        .single();

      if (error) {
        console.error('[PricingService] Error updating store:', error);
        return { data: null, error: new Error(error.message) };
      }

      console.log('[PricingService] Store updated successfully:', storeId);
      return { data: data as Store, error: null };
    } catch (error) {
      console.error('[PricingService] Exception in updateStore:', error);
      return { data: null, error: error as Error };
    }
  }

  // ---------------------------------------------------------------------------
  // DELETE: Soft delete a store (set is_active to false)
  // ---------------------------------------------------------------------------
  async deleteStore(storeId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('pricing_stores')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', storeId);

      if (error) {
        console.error('[PricingService] Error deleting store:', error);
        return { success: false, error: new Error(error.message) };
      }

      console.log('[PricingService] Store deleted successfully:', storeId);
      return { success: true, error: null };
    } catch (error) {
      console.error('[PricingService] Exception in deleteStore:', error);
      return { success: false, error: error as Error };
    }
  }
}

// Export singleton instance
export const pricingService = new PricingService();
