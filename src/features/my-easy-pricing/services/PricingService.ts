// =============================================================================
// PricingService - CRUD operations for MyEasyPricing
// =============================================================================

import { supabase } from '../../../lib/api-clients/supabase-client';
import type {
  Store,
  StoreFormData,
  IndirectCost,
  IndirectCostCategory,
  HiddenCost,
  HiddenCostCategory,
  HiddenCostAuxiliaryData,
  CostFrequency,
  TaxConfig,
  TaxItem,
  TaxRegime,
  TaxCategory,
  Product,
  ProductFormData,
  UnitType,
  Positioning,
} from '../types/pricing.types';

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

  // ===========================================================================
  // Indirect Costs Operations
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // GET: Fetch all indirect costs for a store
  // ---------------------------------------------------------------------------
  async getIndirectCosts(storeId: string): Promise<{ data: IndirectCost[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('pricing_indirect_costs')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[PricingService] Error fetching indirect costs:', error);
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as IndirectCost[], error: null };
    } catch (error) {
      console.error('[PricingService] Exception in getIndirectCosts:', error);
      return { data: null, error: error as Error };
    }
  }

  // ---------------------------------------------------------------------------
  // CREATE: Create a new indirect cost
  // ---------------------------------------------------------------------------
  async createIndirectCost(
    storeId: string,
    data: {
      name: string;
      category: IndirectCostCategory;
      amount: number;
      frequency: CostFrequency;
      amortization_months?: number;
      notes?: string;
    }
  ): Promise<{ data: IndirectCost | null; error: Error | null }> {
    try {
      const newCost = {
        store_id: storeId,
        name: data.name.trim(),
        category: data.category,
        amount: data.amount,
        frequency: data.frequency,
        amortization_months: data.amortization_months || 12,
        notes: data.notes?.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: createdCost, error } = await supabase
        .from('pricing_indirect_costs')
        .insert(newCost)
        .select()
        .single();

      if (error) {
        console.error('[PricingService] Error creating indirect cost:', error);
        return { data: null, error: new Error(error.message) };
      }

      console.log('[PricingService] Indirect cost created:', createdCost.id);
      return { data: createdCost as IndirectCost, error: null };
    } catch (error) {
      console.error('[PricingService] Exception in createIndirectCost:', error);
      return { data: null, error: error as Error };
    }
  }

  // ---------------------------------------------------------------------------
  // UPDATE: Update an existing indirect cost
  // ---------------------------------------------------------------------------
  async updateIndirectCost(
    costId: string,
    data: Partial<{
      name: string;
      category: IndirectCostCategory;
      amount: number;
      frequency: CostFrequency;
      amortization_months: number;
      notes: string;
    }>
  ): Promise<{ data: IndirectCost | null; error: Error | null }> {
    try {
      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (data.name !== undefined) updates.name = data.name.trim();
      if (data.category !== undefined) updates.category = data.category;
      if (data.amount !== undefined) updates.amount = data.amount;
      if (data.frequency !== undefined) updates.frequency = data.frequency;
      if (data.amortization_months !== undefined) updates.amortization_months = data.amortization_months;
      if (data.notes !== undefined) updates.notes = data.notes?.trim() || null;

      const { data: updatedCost, error } = await supabase
        .from('pricing_indirect_costs')
        .update(updates)
        .eq('id', costId)
        .select()
        .single();

      if (error) {
        console.error('[PricingService] Error updating indirect cost:', error);
        return { data: null, error: new Error(error.message) };
      }

      console.log('[PricingService] Indirect cost updated:', costId);
      return { data: updatedCost as IndirectCost, error: null };
    } catch (error) {
      console.error('[PricingService] Exception in updateIndirectCost:', error);
      return { data: null, error: error as Error };
    }
  }

  // ---------------------------------------------------------------------------
  // DELETE: Delete an indirect cost
  // ---------------------------------------------------------------------------
  async deleteIndirectCost(costId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('pricing_indirect_costs')
        .delete()
        .eq('id', costId);

      if (error) {
        console.error('[PricingService] Error deleting indirect cost:', error);
        return { success: false, error: new Error(error.message) };
      }

      console.log('[PricingService] Indirect cost deleted:', costId);
      return { success: true, error: null };
    } catch (error) {
      console.error('[PricingService] Exception in deleteIndirectCost:', error);
      return { success: false, error: error as Error };
    }
  }

  // ===========================================================================
  // Hidden Costs Operations
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // GET: Fetch all hidden costs for a store
  // ---------------------------------------------------------------------------
  async getHiddenCosts(storeId: string): Promise<{ data: HiddenCost[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('pricing_hidden_costs')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[PricingService] Error fetching hidden costs:', error);
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as HiddenCost[], error: null };
    } catch (error) {
      console.error('[PricingService] Exception in getHiddenCosts:', error);
      return { data: null, error: error as Error };
    }
  }

  // ---------------------------------------------------------------------------
  // CREATE: Create a new hidden cost
  // ---------------------------------------------------------------------------
  async createHiddenCost(
    storeId: string,
    data: {
      name: string;
      category: HiddenCostCategory;
      amount: number;
      frequency: CostFrequency;
      amortization_months?: number;
      is_auto_calculated?: boolean;
      auxiliary_data?: HiddenCostAuxiliaryData | null;
      notes?: string;
    }
  ): Promise<{ data: HiddenCost | null; error: Error | null }> {
    try {
      const newCost = {
        store_id: storeId,
        name: data.name.trim(),
        category: data.category,
        amount: data.amount,
        frequency: data.frequency,
        amortization_months: data.amortization_months || 12,
        is_auto_calculated: data.is_auto_calculated || false,
        auxiliary_data: data.auxiliary_data || null,
        notes: data.notes?.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: createdCost, error } = await supabase
        .from('pricing_hidden_costs')
        .insert(newCost)
        .select()
        .single();

      if (error) {
        console.error('[PricingService] Error creating hidden cost:', error);
        return { data: null, error: new Error(error.message) };
      }

      console.log('[PricingService] Hidden cost created:', createdCost.id);
      return { data: createdCost as HiddenCost, error: null };
    } catch (error) {
      console.error('[PricingService] Exception in createHiddenCost:', error);
      return { data: null, error: error as Error };
    }
  }

  // ---------------------------------------------------------------------------
  // UPDATE: Update an existing hidden cost
  // ---------------------------------------------------------------------------
  async updateHiddenCost(
    costId: string,
    data: Partial<{
      name: string;
      category: HiddenCostCategory;
      amount: number;
      frequency: CostFrequency;
      amortization_months: number;
      is_auto_calculated: boolean;
      auxiliary_data: HiddenCostAuxiliaryData | null;
      notes: string;
    }>
  ): Promise<{ data: HiddenCost | null; error: Error | null }> {
    try {
      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (data.name !== undefined) updates.name = data.name.trim();
      if (data.category !== undefined) updates.category = data.category;
      if (data.amount !== undefined) updates.amount = data.amount;
      if (data.frequency !== undefined) updates.frequency = data.frequency;
      if (data.amortization_months !== undefined) updates.amortization_months = data.amortization_months;
      if (data.is_auto_calculated !== undefined) updates.is_auto_calculated = data.is_auto_calculated;
      if (data.auxiliary_data !== undefined) updates.auxiliary_data = data.auxiliary_data;
      if (data.notes !== undefined) updates.notes = data.notes?.trim() || null;

      const { data: updatedCost, error } = await supabase
        .from('pricing_hidden_costs')
        .update(updates)
        .eq('id', costId)
        .select()
        .single();

      if (error) {
        console.error('[PricingService] Error updating hidden cost:', error);
        return { data: null, error: new Error(error.message) };
      }

      console.log('[PricingService] Hidden cost updated:', costId);
      return { data: updatedCost as HiddenCost, error: null };
    } catch (error) {
      console.error('[PricingService] Exception in updateHiddenCost:', error);
      return { data: null, error: error as Error };
    }
  }

  // ---------------------------------------------------------------------------
  // DELETE: Delete a hidden cost
  // ---------------------------------------------------------------------------
  async deleteHiddenCost(costId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('pricing_hidden_costs')
        .delete()
        .eq('id', costId);

      if (error) {
        console.error('[PricingService] Error deleting hidden cost:', error);
        return { success: false, error: new Error(error.message) };
      }

      console.log('[PricingService] Hidden cost deleted:', costId);
      return { success: true, error: null };
    } catch (error) {
      console.error('[PricingService] Exception in deleteHiddenCost:', error);
      return { success: false, error: error as Error };
    }
  }

  // ===========================================================================
  // Tax Config Operations
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // GET: Fetch tax config for a store
  // ---------------------------------------------------------------------------
  async getTaxConfig(storeId: string): Promise<{ data: TaxConfig | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('pricing_tax_config')
        .select('*')
        .eq('store_id', storeId)
        .maybeSingle();

      if (error) {
        console.error('[PricingService] Error fetching tax config:', error);
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as TaxConfig | null, error: null };
    } catch (error) {
      console.error('[PricingService] Exception in getTaxConfig:', error);
      return { data: null, error: error as Error };
    }
  }

  // ---------------------------------------------------------------------------
  // UPSERT: Create or update tax config for a store
  // ---------------------------------------------------------------------------
  async upsertTaxConfig(
    storeId: string,
    taxRegime: TaxRegime
  ): Promise<{ data: TaxConfig | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('pricing_tax_config')
        .upsert(
          {
            store_id: storeId,
            tax_regime: taxRegime,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'store_id' }
        )
        .select()
        .single();

      if (error) {
        console.error('[PricingService] Error upserting tax config:', error);
        return { data: null, error: new Error(error.message) };
      }

      console.log('[PricingService] Tax config upserted for store:', storeId);
      return { data: data as TaxConfig, error: null };
    } catch (error) {
      console.error('[PricingService] Exception in upsertTaxConfig:', error);
      return { data: null, error: error as Error };
    }
  }

  // ===========================================================================
  // Tax Items Operations
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // GET: Fetch all tax items for a store
  // ---------------------------------------------------------------------------
  async getTaxItems(storeId: string): Promise<{ data: TaxItem[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('pricing_tax_items')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[PricingService] Error fetching tax items:', error);
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as TaxItem[], error: null };
    } catch (error) {
      console.error('[PricingService] Exception in getTaxItems:', error);
      return { data: null, error: error as Error };
    }
  }

  // ---------------------------------------------------------------------------
  // CREATE: Create a new tax item
  // ---------------------------------------------------------------------------
  async createTaxItem(
    storeId: string,
    data: {
      name: string;
      category: TaxCategory;
      percentage: number;
    }
  ): Promise<{ data: TaxItem | null; error: Error | null }> {
    try {
      const newItem = {
        store_id: storeId,
        name: data.name.trim(),
        category: data.category,
        percentage: data.percentage,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: createdItem, error } = await supabase
        .from('pricing_tax_items')
        .insert(newItem)
        .select()
        .single();

      if (error) {
        console.error('[PricingService] Error creating tax item:', error);
        return { data: null, error: new Error(error.message) };
      }

      console.log('[PricingService] Tax item created:', createdItem.id);
      return { data: createdItem as TaxItem, error: null };
    } catch (error) {
      console.error('[PricingService] Exception in createTaxItem:', error);
      return { data: null, error: error as Error };
    }
  }

  // ---------------------------------------------------------------------------
  // UPDATE: Update an existing tax item
  // ---------------------------------------------------------------------------
  async updateTaxItem(
    itemId: string,
    data: Partial<{
      name: string;
      category: TaxCategory;
      percentage: number;
    }>
  ): Promise<{ data: TaxItem | null; error: Error | null }> {
    try {
      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (data.name !== undefined) updates.name = data.name.trim();
      if (data.category !== undefined) updates.category = data.category;
      if (data.percentage !== undefined) updates.percentage = data.percentage;

      const { data: updatedItem, error } = await supabase
        .from('pricing_tax_items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();

      if (error) {
        console.error('[PricingService] Error updating tax item:', error);
        return { data: null, error: new Error(error.message) };
      }

      console.log('[PricingService] Tax item updated:', itemId);
      return { data: updatedItem as TaxItem, error: null };
    } catch (error) {
      console.error('[PricingService] Exception in updateTaxItem:', error);
      return { data: null, error: error as Error };
    }
  }

  // ---------------------------------------------------------------------------
  // DELETE: Delete a tax item
  // ---------------------------------------------------------------------------
  async deleteTaxItem(itemId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('pricing_tax_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('[PricingService] Error deleting tax item:', error);
        return { success: false, error: new Error(error.message) };
      }

      console.log('[PricingService] Tax item deleted:', itemId);
      return { success: true, error: null };
    } catch (error) {
      console.error('[PricingService] Exception in deleteTaxItem:', error);
      return { success: false, error: error as Error };
    }
  }

  // ===========================================================================
  // Product Operations
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // GET: Fetch all products for a store
  // ---------------------------------------------------------------------------
  async getProducts(storeId: string): Promise<{ data: Product[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('pricing_products')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[PricingService] Error fetching products:', error);
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as Product[], error: null };
    } catch (error) {
      console.error('[PricingService] Exception in getProducts:', error);
      return { data: null, error: error as Error };
    }
  }

  // ---------------------------------------------------------------------------
  // GET: Fetch a single product by ID
  // ---------------------------------------------------------------------------
  async getProductById(productId: string): Promise<{ data: Product | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('pricing_products')
        .select('*')
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('[PricingService] Error fetching product:', error);
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as Product, error: null };
    } catch (error) {
      console.error('[PricingService] Exception in getProductById:', error);
      return { data: null, error: error as Error };
    }
  }

  // ---------------------------------------------------------------------------
  // CREATE: Create a new product
  // ---------------------------------------------------------------------------
  async createProduct(
    storeId: string,
    formData: ProductFormData
  ): Promise<{ data: Product | null; error: Error | null }> {
    try {
      const newProduct = {
        store_id: storeId,
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        category: formData.category?.trim() || null,
        direct_cost: formData.direct_cost,
        unit_type: formData.unit_type,
        desired_margin: formData.desired_margin,
        positioning: formData.positioning,
        market_price: formData.market_price,
        weight: formData.weight,
        monthly_units_estimate: formData.monthly_units_estimate,
        is_active: true,
        is_demo: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('pricing_products')
        .insert(newProduct)
        .select()
        .single();

      if (error) {
        console.error('[PricingService] Error creating product:', error);
        return { data: null, error: new Error(error.message) };
      }

      console.log('[PricingService] Product created:', data.id);
      return { data: data as Product, error: null };
    } catch (error) {
      console.error('[PricingService] Exception in createProduct:', error);
      return { data: null, error: error as Error };
    }
  }

  // ---------------------------------------------------------------------------
  // UPDATE: Update an existing product
  // ---------------------------------------------------------------------------
  async updateProduct(
    productId: string,
    formData: Partial<ProductFormData>
  ): Promise<{ data: Product | null; error: Error | null }> {
    try {
      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (formData.name !== undefined) updates.name = formData.name.trim();
      if (formData.description !== undefined) updates.description = formData.description?.trim() || null;
      if (formData.category !== undefined) updates.category = formData.category?.trim() || null;
      if (formData.direct_cost !== undefined) updates.direct_cost = formData.direct_cost;
      if (formData.unit_type !== undefined) updates.unit_type = formData.unit_type;
      if (formData.desired_margin !== undefined) updates.desired_margin = formData.desired_margin;
      if (formData.positioning !== undefined) updates.positioning = formData.positioning;
      if (formData.market_price !== undefined) updates.market_price = formData.market_price;
      if (formData.weight !== undefined) updates.weight = formData.weight;
      if (formData.monthly_units_estimate !== undefined) updates.monthly_units_estimate = formData.monthly_units_estimate;

      const { data, error } = await supabase
        .from('pricing_products')
        .update(updates)
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        console.error('[PricingService] Error updating product:', error);
        return { data: null, error: new Error(error.message) };
      }

      console.log('[PricingService] Product updated:', productId);
      return { data: data as Product, error: null };
    } catch (error) {
      console.error('[PricingService] Exception in updateProduct:', error);
      return { data: null, error: error as Error };
    }
  }

  // ---------------------------------------------------------------------------
  // DELETE: Soft delete a product
  // ---------------------------------------------------------------------------
  async deleteProduct(productId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('pricing_products')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId);

      if (error) {
        console.error('[PricingService] Error deleting product:', error);
        return { success: false, error: new Error(error.message) };
      }

      console.log('[PricingService] Product soft deleted:', productId);
      return { success: true, error: null };
    } catch (error) {
      console.error('[PricingService] Exception in deleteProduct:', error);
      return { success: false, error: error as Error };
    }
  }
}

// Export singleton instance
export const pricingService = new PricingService();
