// =============================================================================
// PricingServiceV2 - CRUD operations for MyEasyPricing
// PRIMARY: Cloudflare D1
// FALLBACK: Supabase
// =============================================================================

import { d1Client } from '../../../lib/api-clients/d1-client';
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
} from '../types/pricing.types';

// Helper type for operation results
interface OperationResult<T> {
  data: T | null;
  error: Error | null;
}

interface DeleteResult {
  success: boolean;
  error: Error | null;
}

// =============================================================================
// PricingServiceV2 - D1 Primary, Supabase Fallback
// =============================================================================

export class PricingServiceV2 {
  private d1Available: boolean | null = null;

  /**
   * Verifica se D1 está disponível
   */
  private async checkD1Health(): Promise<boolean> {
    if (this.d1Available !== null) {
      return this.d1Available;
    }

    if (!d1Client.isEnabled()) {
      this.d1Available = false;
      return false;
    }

    try {
      const result = await d1Client.healthCheck();
      this.d1Available = !result.error;
      console.log(`📊 [PRICING V2] D1 health check: ${this.d1Available ? 'OK' : 'FAILED'}`);
      return this.d1Available;
    } catch {
      this.d1Available = false;
      return false;
    }
  }

  // =============================================================================
  // Store Operations
  // =============================================================================

  /**
   * GET: Fetch all stores for the current user
   */
  async getStores(userUuid: string): Promise<OperationResult<Store[]>> {
    console.log('🔍 [PRICING V2] getStores for user:', userUuid);

    // Try D1 first
    if (await this.checkD1Health()) {
      try {
        const result = await d1Client.getPricingStores(userUuid);
        if (!result.error && result.data) {
          console.log('✅ [D1 PRIMARY] getStores success:', result.data.length);
          return { data: result.data as unknown as Store[], error: null };
        }
        console.warn('⚠️ [D1 PRIMARY] getStores failed:', result.error);
      } catch (error) {
        console.warn('⚠️ [D1 PRIMARY] getStores exception:', error);
      }
    }

    // Fallback to Supabase
    console.log('⚠️ [FALLBACK] Using Supabase for getStores');
    try {
      const { data, error } = await supabase
        .from('pricing_stores')
        .select('*')
        .eq('user_uuid', userUuid)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ [SUPABASE FALLBACK] getStores error:', error);
        return { data: null, error: new Error(error.message) };
      }

      console.log('✅ [SUPABASE FALLBACK] getStores success:', data?.length || 0);
      return { data: data as Store[], error: null };
    } catch (error) {
      console.error('❌ [SUPABASE FALLBACK] getStores exception:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * GET: Fetch a single store by ID
   */
  async getStoreById(storeId: string): Promise<OperationResult<Store>> {
    // Try D1 first
    if (await this.checkD1Health()) {
      try {
        const result = await d1Client.getPricingStoreById(storeId);
        if (!result.error && result.data) {
          return { data: result.data as unknown as Store, error: null };
        }
      } catch (error) {
        console.warn('⚠️ [D1 PRIMARY] getStoreById exception:', error);
      }
    }

    // Fallback to Supabase
    try {
      const { data, error } = await supabase
        .from('pricing_stores')
        .select('*')
        .eq('id', storeId)
        .eq('is_active', true)
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as Store, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * CREATE: Create a new store
   */
  async createStore(userUuid: string, formData: StoreFormData): Promise<OperationResult<Store>> {
    console.log('📝 [PRICING V2] createStore for user:', userUuid);

    const newStore = {
      user_uuid: userUuid,
      name: formData.name.trim(),
      description: formData.description?.trim() || undefined,
      currency: 'BRL',
      cost_allocation_method: formData.cost_allocation_method,
      is_demo: false,
    };

    // Try D1 first
    if (await this.checkD1Health()) {
      try {
        const result = await d1Client.createPricingStore(newStore);
        if (!result.error && result.data) {
          console.log('✅ [D1 PRIMARY] createStore success:', result.data.id);
          return { data: result.data as unknown as Store, error: null };
        }
        console.warn('⚠️ [D1 PRIMARY] createStore failed:', result.error);
      } catch (error) {
        console.warn('⚠️ [D1 PRIMARY] createStore exception:', error);
      }
    }

    // Fallback to Supabase
    console.log('⚠️ [FALLBACK] Using Supabase for createStore');
    try {
      const { data, error } = await supabase
        .from('pricing_stores')
        .insert({
          ...newStore,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('❌ [SUPABASE FALLBACK] createStore error:', error);
        return { data: null, error: new Error(error.message) };
      }

      console.log('✅ [SUPABASE FALLBACK] createStore success:', data.id);
      return { data: data as Store, error: null };
    } catch (error) {
      console.error('❌ [SUPABASE FALLBACK] createStore exception:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * UPDATE: Update an existing store
   */
  async updateStore(storeId: string, formData: Partial<StoreFormData>): Promise<OperationResult<Store>> {
    const updates: Record<string, unknown> = {};

    if (formData.name !== undefined) updates.name = formData.name.trim();
    if (formData.description !== undefined) updates.description = formData.description?.trim() || null;
    if (formData.cost_allocation_method !== undefined) updates.cost_allocation_method = formData.cost_allocation_method;

    // Try D1 first
    if (await this.checkD1Health()) {
      try {
        const result = await d1Client.updatePricingStore(storeId, updates);
        if (!result.error && result.data) {
          return { data: result.data as unknown as Store, error: null };
        }
      } catch (error) {
        console.warn('⚠️ [D1 PRIMARY] updateStore exception:', error);
      }
    }

    // Fallback to Supabase
    try {
      const { data, error } = await supabase
        .from('pricing_stores')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', storeId)
        .select()
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as Store, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * DELETE: Soft delete a store
   */
  async deleteStore(storeId: string): Promise<DeleteResult> {
    // Try D1 first
    if (await this.checkD1Health()) {
      try {
        const result = await d1Client.deletePricingStore(storeId);
        if (!result.error) {
          return { success: true, error: null };
        }
      } catch (error) {
        console.warn('⚠️ [D1 PRIMARY] deleteStore exception:', error);
      }
    }

    // Fallback to Supabase
    try {
      const { error } = await supabase
        .from('pricing_stores')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', storeId);

      if (error) {
        return { success: false, error: new Error(error.message) };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  // =============================================================================
  // Product Operations
  // =============================================================================

  /**
   * GET: Fetch all products for a store
   */
  async getProducts(storeId: string): Promise<OperationResult<Product[]>> {
    // Try D1 first
    if (await this.checkD1Health()) {
      try {
        const result = await d1Client.getPricingProducts(storeId);
        if (!result.error && result.data) {
          return { data: result.data as unknown as Product[], error: null };
        }
      } catch (error) {
        console.warn('⚠️ [D1 PRIMARY] getProducts exception:', error);
      }
    }

    // Fallback to Supabase
    try {
      const { data, error } = await supabase
        .from('pricing_products')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as Product[], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * GET: Fetch a single product by ID
   */
  async getProductById(productId: string): Promise<OperationResult<Product>> {
    // Try D1 first
    if (await this.checkD1Health()) {
      try {
        const result = await d1Client.getPricingProductById(productId);
        if (!result.error && result.data) {
          return { data: result.data as unknown as Product, error: null };
        }
      } catch (error) {
        console.warn('⚠️ [D1 PRIMARY] getProductById exception:', error);
      }
    }

    // Fallback to Supabase
    try {
      const { data, error } = await supabase
        .from('pricing_products')
        .select('*')
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as Product, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * CREATE: Create a new product
   */
  async createProduct(storeId: string, formData: ProductFormData): Promise<OperationResult<Product>> {
    const newProduct = {
      store_id: storeId,
      name: formData.name.trim(),
      description: formData.description?.trim() || undefined,
      category: formData.category?.trim() || undefined,
      direct_cost: formData.direct_cost,
      unit_type: formData.unit_type,
      desired_margin: formData.desired_margin,
      positioning: formData.positioning,
      market_price: formData.market_price,
      weight: formData.weight,
      monthly_units_estimate: formData.monthly_units_estimate,
      is_demo: false,
    };

    // Try D1 first
    if (await this.checkD1Health()) {
      try {
        const result = await d1Client.createPricingProduct(newProduct);
        if (!result.error && result.data) {
          return { data: result.data as unknown as Product, error: null };
        }
      } catch (error) {
        console.warn('⚠️ [D1 PRIMARY] createProduct exception:', error);
      }
    }

    // Fallback to Supabase
    try {
      const { data, error } = await supabase
        .from('pricing_products')
        .insert({
          ...newProduct,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as Product, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * UPDATE: Update an existing product
   */
  async updateProduct(productId: string, formData: Partial<ProductFormData>): Promise<OperationResult<Product>> {
    const updates: Record<string, unknown> = {};

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

    // Try D1 first
    if (await this.checkD1Health()) {
      try {
        const result = await d1Client.updatePricingProduct(productId, updates);
        if (!result.error && result.data) {
          return { data: result.data as unknown as Product, error: null };
        }
      } catch (error) {
        console.warn('⚠️ [D1 PRIMARY] updateProduct exception:', error);
      }
    }

    // Fallback to Supabase
    try {
      const { data, error } = await supabase
        .from('pricing_products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as Product, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * DELETE: Soft delete a product
   */
  async deleteProduct(productId: string): Promise<DeleteResult> {
    // Try D1 first
    if (await this.checkD1Health()) {
      try {
        const result = await d1Client.deletePricingProduct(productId);
        if (!result.error) {
          return { success: true, error: null };
        }
      } catch (error) {
        console.warn('⚠️ [D1 PRIMARY] deleteProduct exception:', error);
      }
    }

    // Fallback to Supabase
    try {
      const { error } = await supabase
        .from('pricing_products')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', productId);

      if (error) {
        return { success: false, error: new Error(error.message) };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  // =============================================================================
  // Indirect Costs Operations
  // =============================================================================

  async getIndirectCosts(storeId: string): Promise<OperationResult<IndirectCost[]>> {
    // Try D1 first
    if (await this.checkD1Health()) {
      try {
        const result = await d1Client.getPricingIndirectCosts(storeId);
        if (!result.error && result.data) {
          return { data: result.data as unknown as IndirectCost[], error: null };
        }
      } catch (error) {
        console.warn('⚠️ [D1 PRIMARY] getIndirectCosts exception:', error);
      }
    }

    // Fallback to Supabase
    try {
      const { data, error } = await supabase
        .from('pricing_indirect_costs')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: true });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as IndirectCost[], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

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
  ): Promise<OperationResult<IndirectCost>> {
    const newCost = {
      store_id: storeId,
      name: data.name.trim(),
      category: data.category,
      amount: data.amount,
      frequency: data.frequency,
      amortization_months: data.amortization_months || 12,
      notes: data.notes?.trim() || undefined,
    };

    // Try D1 first
    if (await this.checkD1Health()) {
      try {
        const result = await d1Client.createPricingIndirectCost(newCost);
        if (!result.error && result.data) {
          return { data: result.data as unknown as IndirectCost, error: null };
        }
      } catch (error) {
        console.warn('⚠️ [D1 PRIMARY] createIndirectCost exception:', error);
      }
    }

    // Fallback to Supabase
    try {
      const { data: createdCost, error } = await supabase
        .from('pricing_indirect_costs')
        .insert({
          ...newCost,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: createdCost as IndirectCost, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

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
  ): Promise<OperationResult<IndirectCost>> {
    const updates: Record<string, unknown> = {};

    if (data.name !== undefined) updates.name = data.name.trim();
    if (data.category !== undefined) updates.category = data.category;
    if (data.amount !== undefined) updates.amount = data.amount;
    if (data.frequency !== undefined) updates.frequency = data.frequency;
    if (data.amortization_months !== undefined) updates.amortization_months = data.amortization_months;
    if (data.notes !== undefined) updates.notes = data.notes?.trim() || null;

    // Try D1 first
    if (await this.checkD1Health()) {
      try {
        const result = await d1Client.updatePricingIndirectCost(costId, updates);
        if (!result.error && result.data) {
          return { data: result.data as unknown as IndirectCost, error: null };
        }
      } catch (error) {
        console.warn('⚠️ [D1 PRIMARY] updateIndirectCost exception:', error);
      }
    }

    // Fallback to Supabase
    try {
      const { data: updatedCost, error } = await supabase
        .from('pricing_indirect_costs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', costId)
        .select()
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: updatedCost as IndirectCost, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async deleteIndirectCost(costId: string): Promise<DeleteResult> {
    // Try D1 first
    if (await this.checkD1Health()) {
      try {
        const result = await d1Client.deletePricingIndirectCost(costId);
        if (!result.error) {
          return { success: true, error: null };
        }
      } catch (error) {
        console.warn('⚠️ [D1 PRIMARY] deleteIndirectCost exception:', error);
      }
    }

    // Fallback to Supabase
    try {
      const { error } = await supabase
        .from('pricing_indirect_costs')
        .delete()
        .eq('id', costId);

      if (error) {
        return { success: false, error: new Error(error.message) };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  // =============================================================================
  // Hidden Costs Operations
  // =============================================================================

  async getHiddenCosts(storeId: string): Promise<OperationResult<HiddenCost[]>> {
    // Try D1 first
    if (await this.checkD1Health()) {
      try {
        const result = await d1Client.getPricingHiddenCosts(storeId);
        if (!result.error && result.data) {
          // Parse auxiliary_data JSON
          const costs = result.data.map((cost: any) => ({
            ...cost,
            auxiliary_data: cost.auxiliary_data ? JSON.parse(cost.auxiliary_data) : null,
          }));
          return { data: costs as HiddenCost[], error: null };
        }
      } catch (error) {
        console.warn('⚠️ [D1 PRIMARY] getHiddenCosts exception:', error);
      }
    }

    // Fallback to Supabase
    try {
      const { data, error } = await supabase
        .from('pricing_hidden_costs')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: true });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as HiddenCost[], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

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
  ): Promise<OperationResult<HiddenCost>> {
    const newCost = {
      store_id: storeId,
      name: data.name.trim(),
      category: data.category,
      amount: data.amount,
      frequency: data.frequency,
      amortization_months: data.amortization_months || 12,
      is_auto_calculated: data.is_auto_calculated || false,
      auxiliary_data: data.auxiliary_data || undefined,
      notes: data.notes?.trim() || undefined,
    };

    // Try D1 first
    if (await this.checkD1Health()) {
      try {
        const result = await d1Client.createPricingHiddenCost(newCost);
        if (!result.error && result.data) {
          return { data: result.data as unknown as HiddenCost, error: null };
        }
      } catch (error) {
        console.warn('⚠️ [D1 PRIMARY] createHiddenCost exception:', error);
      }
    }

    // Fallback to Supabase
    try {
      const { data: createdCost, error } = await supabase
        .from('pricing_hidden_costs')
        .insert({
          ...newCost,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: createdCost as HiddenCost, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

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
  ): Promise<OperationResult<HiddenCost>> {
    const updates: Record<string, unknown> = {};

    if (data.name !== undefined) updates.name = data.name.trim();
    if (data.category !== undefined) updates.category = data.category;
    if (data.amount !== undefined) updates.amount = data.amount;
    if (data.frequency !== undefined) updates.frequency = data.frequency;
    if (data.amortization_months !== undefined) updates.amortization_months = data.amortization_months;
    if (data.is_auto_calculated !== undefined) updates.is_auto_calculated = data.is_auto_calculated;
    if (data.auxiliary_data !== undefined) updates.auxiliary_data = data.auxiliary_data;
    if (data.notes !== undefined) updates.notes = data.notes?.trim() || null;

    // Try D1 first
    if (await this.checkD1Health()) {
      try {
        const result = await d1Client.updatePricingHiddenCost(costId, updates);
        if (!result.error && result.data) {
          return { data: result.data as unknown as HiddenCost, error: null };
        }
      } catch (error) {
        console.warn('⚠️ [D1 PRIMARY] updateHiddenCost exception:', error);
      }
    }

    // Fallback to Supabase
    try {
      const { data: updatedCost, error } = await supabase
        .from('pricing_hidden_costs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', costId)
        .select()
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: updatedCost as HiddenCost, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async deleteHiddenCost(costId: string): Promise<DeleteResult> {
    // Try D1 first
    if (await this.checkD1Health()) {
      try {
        const result = await d1Client.deletePricingHiddenCost(costId);
        if (!result.error) {
          return { success: true, error: null };
        }
      } catch (error) {
        console.warn('⚠️ [D1 PRIMARY] deleteHiddenCost exception:', error);
      }
    }

    // Fallback to Supabase
    try {
      const { error } = await supabase
        .from('pricing_hidden_costs')
        .delete()
        .eq('id', costId);

      if (error) {
        return { success: false, error: new Error(error.message) };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  // =============================================================================
  // Tax Config Operations
  // =============================================================================

  async getTaxConfig(storeId: string): Promise<OperationResult<TaxConfig | null>> {
    // Try D1 first
    if (await this.checkD1Health()) {
      try {
        const result = await d1Client.getPricingTaxConfig(storeId);
        if (!result.error) {
          return { data: result.data as unknown as TaxConfig | null, error: null };
        }
      } catch (error) {
        console.warn('⚠️ [D1 PRIMARY] getTaxConfig exception:', error);
      }
    }

    // Fallback to Supabase
    try {
      const { data, error } = await supabase
        .from('pricing_tax_config')
        .select('*')
        .eq('store_id', storeId)
        .maybeSingle();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as TaxConfig | null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async upsertTaxConfig(storeId: string, taxRegime: TaxRegime): Promise<OperationResult<TaxConfig>> {
    // Try D1 first
    if (await this.checkD1Health()) {
      try {
        const result = await d1Client.upsertPricingTaxConfig(storeId, taxRegime);
        if (!result.error && result.data) {
          return { data: result.data as unknown as TaxConfig, error: null };
        }
      } catch (error) {
        console.warn('⚠️ [D1 PRIMARY] upsertTaxConfig exception:', error);
      }
    }

    // Fallback to Supabase
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
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as TaxConfig, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // =============================================================================
  // Tax Items Operations
  // =============================================================================

  async getTaxItems(storeId: string): Promise<OperationResult<TaxItem[]>> {
    // Try D1 first
    if (await this.checkD1Health()) {
      try {
        const result = await d1Client.getPricingTaxItems(storeId);
        if (!result.error && result.data) {
          return { data: result.data as unknown as TaxItem[], error: null };
        }
      } catch (error) {
        console.warn('⚠️ [D1 PRIMARY] getTaxItems exception:', error);
      }
    }

    // Fallback to Supabase
    try {
      const { data, error } = await supabase
        .from('pricing_tax_items')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: true });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as TaxItem[], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async createTaxItem(
    storeId: string,
    data: {
      name: string;
      category: TaxCategory;
      percentage: number;
    }
  ): Promise<OperationResult<TaxItem>> {
    const newItem = {
      store_id: storeId,
      name: data.name.trim(),
      category: data.category,
      percentage: data.percentage,
    };

    // Try D1 first
    if (await this.checkD1Health()) {
      try {
        const result = await d1Client.createPricingTaxItem(newItem);
        if (!result.error && result.data) {
          return { data: result.data as unknown as TaxItem, error: null };
        }
      } catch (error) {
        console.warn('⚠️ [D1 PRIMARY] createTaxItem exception:', error);
      }
    }

    // Fallback to Supabase
    try {
      const { data: createdItem, error } = await supabase
        .from('pricing_tax_items')
        .insert({
          ...newItem,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: createdItem as TaxItem, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async updateTaxItem(
    itemId: string,
    data: Partial<{
      name: string;
      category: TaxCategory;
      percentage: number;
    }>
  ): Promise<OperationResult<TaxItem>> {
    const updates: Record<string, unknown> = {};

    if (data.name !== undefined) updates.name = data.name.trim();
    if (data.category !== undefined) updates.category = data.category;
    if (data.percentage !== undefined) updates.percentage = data.percentage;

    // Try D1 first
    if (await this.checkD1Health()) {
      try {
        const result = await d1Client.updatePricingTaxItem(itemId, updates);
        if (!result.error && result.data) {
          return { data: result.data as unknown as TaxItem, error: null };
        }
      } catch (error) {
        console.warn('⚠️ [D1 PRIMARY] updateTaxItem exception:', error);
      }
    }

    // Fallback to Supabase
    try {
      const { data: updatedItem, error } = await supabase
        .from('pricing_tax_items')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', itemId)
        .select()
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: updatedItem as TaxItem, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async deleteTaxItem(itemId: string): Promise<DeleteResult> {
    // Try D1 first
    if (await this.checkD1Health()) {
      try {
        const result = await d1Client.deletePricingTaxItem(itemId);
        if (!result.error) {
          return { success: true, error: null };
        }
      } catch (error) {
        console.warn('⚠️ [D1 PRIMARY] deleteTaxItem exception:', error);
      }
    }

    // Fallback to Supabase
    try {
      const { error } = await supabase
        .from('pricing_tax_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        return { success: false, error: new Error(error.message) };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }
}

// Export singleton instance
export const pricingServiceV2 = new PricingServiceV2();
