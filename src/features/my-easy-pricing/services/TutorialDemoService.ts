// =============================================================================
// TutorialDemoService - Creates and deletes demo data for the tutorial
// =============================================================================

import { supabase } from '../../../lib/api-clients/supabase-client';
import { PRICING_LABELS, CALCULATION_CONSTANTS } from '../constants/pricing.constants';
import type { Store, Product, IndirectCost, HiddenCost, TaxItem } from '../types/pricing.types';

// =============================================================================
// Types
// =============================================================================

export interface DemoData {
  store: Store;
  product: Product;
  indirectCosts: IndirectCost[];
  hiddenCosts: HiddenCost[];
  taxItems: TaxItem[];
}

export interface CreateDemoDataResult {
  success: boolean;
  data: DemoData | null;
  error: Error | null;
}

export interface DeleteDemoDataResult {
  success: boolean;
  error: Error | null;
}

// =============================================================================
// Demo Data Configuration
// =============================================================================

const DEMO_STORE_CONFIG = {
  name: PRICING_LABELS.tutorial.demoStoreName,
  description: 'Loja criada automaticamente para demonstracao do tutorial. Pode ser excluida a qualquer momento.',
  currency: 'BRL',
  cost_allocation_method: 'weighted' as const,
  is_demo: true,
};

const DEMO_PRODUCT_CONFIG = {
  name: PRICING_LABELS.tutorial.demoProductName,
  description: 'Produto de exemplo para demonstracao dos calculos de precificacao.',
  category: 'Exemplo',
  direct_cost: 25.0,
  unit_type: 'unit' as const,
  desired_margin: 40,
  positioning: 'intermediate' as const,
  market_price: 65.0,
  weight: 1,
  monthly_units_estimate: 100,
  is_demo: true,
};

const DEMO_INDIRECT_COSTS = [
  {
    name: 'Aluguel',
    category: 'rent' as const,
    amount: 1500,
    frequency: 'monthly' as const,
    amortization_months: 1,
    notes: 'Custo de exemplo',
  },
  {
    name: 'Energia e Agua',
    category: 'utilities' as const,
    amount: 300,
    frequency: 'monthly' as const,
    amortization_months: 1,
    notes: 'Custo de exemplo',
  },
  {
    name: 'Internet e Telefone',
    category: 'tools' as const,
    amount: 150,
    frequency: 'monthly' as const,
    amortization_months: 1,
    notes: 'Custo de exemplo',
  },
];

const DEMO_HIDDEN_COSTS = [
  {
    name: 'Depreciacao de Veiculo',
    category: 'vehicle_depreciation' as const,
    amount: 280,
    frequency: 'monthly' as const,
    amortization_months: 1,
    is_auto_calculated: false,
    auxiliary_data: null,
    notes: 'Calculado com base em 400km/mes a R$ 0,70/km',
  },
  {
    name: 'Alimentacao na rua',
    category: 'food' as const,
    amount: 440,
    frequency: 'monthly' as const,
    amortization_months: 1,
    is_auto_calculated: false,
    auxiliary_data: null,
    notes: 'R$ 20/dia x 22 dias uteis',
  },
];

const DEMO_TAX_ITEMS = [
  {
    name: 'Simples Nacional',
    category: 'tax_rate' as const,
    percentage: 6.0,
  },
  {
    name: 'Taxa de Cartao',
    category: 'card_fee' as const,
    percentage: 2.5,
  },
];

// =============================================================================
// Service Class
// =============================================================================

export class TutorialDemoService {
  // ---------------------------------------------------------------------------
  // CREATE: Create all demo data for tutorial
  // ---------------------------------------------------------------------------
  async createDemoData(userUuid: string): Promise<CreateDemoDataResult> {
    try {
      console.log('[TutorialDemoService] Creating demo data for user:', userUuid);

      // 1. Create demo store
      const { data: store, error: storeError } = await supabase
        .from('pricing_stores')
        .insert({
          user_uuid: userUuid,
          ...DEMO_STORE_CONFIG,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (storeError || !store) {
        console.error('[TutorialDemoService] Error creating demo store:', storeError);
        return { success: false, data: null, error: new Error(storeError?.message || 'Erro ao criar loja demo') };
      }

      console.log('[TutorialDemoService] Demo store created:', store.id);

      // 2. Create demo product
      const { data: product, error: productError } = await supabase
        .from('pricing_products')
        .insert({
          store_id: store.id,
          ...DEMO_PRODUCT_CONFIG,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (productError || !product) {
        console.error('[TutorialDemoService] Error creating demo product:', productError);
        // Cleanup: delete store
        await this.deleteDemoStore(store.id);
        return { success: false, data: null, error: new Error(productError?.message || 'Erro ao criar produto demo') };
      }

      console.log('[TutorialDemoService] Demo product created:', product.id);

      // 3. Create demo indirect costs
      const indirectCostsToInsert = DEMO_INDIRECT_COSTS.map(cost => ({
        store_id: store.id,
        ...cost,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { data: indirectCosts, error: indirectError } = await supabase
        .from('pricing_indirect_costs')
        .insert(indirectCostsToInsert)
        .select();

      if (indirectError) {
        console.error('[TutorialDemoService] Error creating indirect costs:', indirectError);
        // Continue anyway, these are not critical
      }

      console.log('[TutorialDemoService] Demo indirect costs created:', indirectCosts?.length || 0);

      // 4. Create demo hidden costs
      const hiddenCostsToInsert = DEMO_HIDDEN_COSTS.map(cost => ({
        store_id: store.id,
        ...cost,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { data: hiddenCosts, error: hiddenError } = await supabase
        .from('pricing_hidden_costs')
        .insert(hiddenCostsToInsert)
        .select();

      if (hiddenError) {
        console.error('[TutorialDemoService] Error creating hidden costs:', hiddenError);
        // Continue anyway
      }

      console.log('[TutorialDemoService] Demo hidden costs created:', hiddenCosts?.length || 0);

      // 5. Create demo tax items
      const taxItemsToInsert = DEMO_TAX_ITEMS.map(item => ({
        store_id: store.id,
        ...item,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { data: taxItems, error: taxError } = await supabase
        .from('pricing_tax_items')
        .insert(taxItemsToInsert)
        .select();

      if (taxError) {
        console.error('[TutorialDemoService] Error creating tax items:', taxError);
        // Continue anyway
      }

      console.log('[TutorialDemoService] Demo tax items created:', taxItems?.length || 0);

      console.log('[TutorialDemoService] All demo data created successfully');

      return {
        success: true,
        data: {
          store: store as Store,
          product: product as Product,
          indirectCosts: (indirectCosts || []) as IndirectCost[],
          hiddenCosts: (hiddenCosts || []) as HiddenCost[],
          taxItems: (taxItems || []) as TaxItem[],
        },
        error: null,
      };
    } catch (error) {
      console.error('[TutorialDemoService] Exception in createDemoData:', error);
      return { success: false, data: null, error: error as Error };
    }
  }

  // ---------------------------------------------------------------------------
  // DELETE: Delete all demo data by store ID
  // ---------------------------------------------------------------------------
  async deleteDemoData(storeId: string): Promise<DeleteDemoDataResult> {
    try {
      console.log('[TutorialDemoService] Deleting demo data for store:', storeId);

      // Delete in order: products, costs, taxes, then store
      // (due to foreign key constraints)

      // 1. Delete products
      const { error: productError } = await supabase
        .from('pricing_products')
        .delete()
        .eq('store_id', storeId);

      if (productError) {
        console.error('[TutorialDemoService] Error deleting products:', productError);
      }

      // 2. Delete indirect costs
      const { error: indirectError } = await supabase
        .from('pricing_indirect_costs')
        .delete()
        .eq('store_id', storeId);

      if (indirectError) {
        console.error('[TutorialDemoService] Error deleting indirect costs:', indirectError);
      }

      // 3. Delete hidden costs
      const { error: hiddenError } = await supabase
        .from('pricing_hidden_costs')
        .delete()
        .eq('store_id', storeId);

      if (hiddenError) {
        console.error('[TutorialDemoService] Error deleting hidden costs:', hiddenError);
      }

      // 4. Delete tax items
      const { error: taxError } = await supabase
        .from('pricing_tax_items')
        .delete()
        .eq('store_id', storeId);

      if (taxError) {
        console.error('[TutorialDemoService] Error deleting tax items:', taxError);
      }

      // 5. Delete tax config
      const { error: configError } = await supabase
        .from('pricing_tax_config')
        .delete()
        .eq('store_id', storeId);

      if (configError) {
        console.error('[TutorialDemoService] Error deleting tax config:', configError);
      }

      // 6. Delete store (hard delete for demo stores)
      const { error: storeError } = await supabase
        .from('pricing_stores')
        .delete()
        .eq('id', storeId)
        .eq('is_demo', true);

      if (storeError) {
        console.error('[TutorialDemoService] Error deleting store:', storeError);
        return { success: false, error: new Error(storeError.message) };
      }

      console.log('[TutorialDemoService] All demo data deleted successfully');
      return { success: true, error: null };
    } catch (error) {
      console.error('[TutorialDemoService] Exception in deleteDemoData:', error);
      return { success: false, error: error as Error };
    }
  }

  // ---------------------------------------------------------------------------
  // Helper: Delete demo store (used for cleanup on error)
  // ---------------------------------------------------------------------------
  private async deleteDemoStore(storeId: string): Promise<void> {
    try {
      await supabase
        .from('pricing_stores')
        .delete()
        .eq('id', storeId);
    } catch (error) {
      console.error('[TutorialDemoService] Error in cleanup:', error);
    }
  }

  // ---------------------------------------------------------------------------
  // CHECK: Check if user has existing demo data
  // ---------------------------------------------------------------------------
  async hasExistingDemoData(userUuid: string): Promise<{ hasDemoData: boolean; storeId: string | null; productId: string | null }> {
    try {
      // First, get the demo store
      const { data: storeData, error: storeError } = await supabase
        .from('pricing_stores')
        .select('id')
        .eq('user_uuid', userUuid)
        .eq('is_demo', true)
        .eq('is_active', true)
        .maybeSingle();

      if (storeError) {
        console.error('[TutorialDemoService] Error checking demo store:', storeError);
        return { hasDemoData: false, storeId: null, productId: null };
      }

      if (!storeData) {
        return { hasDemoData: false, storeId: null, productId: null };
      }

      // Then, get the demo product for this store
      const { data: productData, error: productError } = await supabase
        .from('pricing_products')
        .select('id')
        .eq('store_id', storeData.id)
        .eq('is_demo', true)
        .eq('is_active', true)
        .maybeSingle();

      if (productError) {
        console.error('[TutorialDemoService] Error checking demo product:', productError);
        // Return store even if product check fails
        return { hasDemoData: true, storeId: storeData.id, productId: null };
      }

      return {
        hasDemoData: true,
        storeId: storeData.id,
        productId: productData?.id || null,
      };
    } catch (error) {
      console.error('[TutorialDemoService] Exception in hasExistingDemoData:', error);
      return { hasDemoData: false, storeId: null, productId: null };
    }
  }

  // ===========================================================================
  // Convert Demo to Regular
  // ===========================================================================

  /**
   * Converts a demo store to a regular store by removing the demo flag
   * This allows the user to keep their demo data as real data
   */
  async convertDemoToRegular(storeId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('[TutorialDemoService] Converting demo store to regular:', storeId);

      const { error } = await supabase
        .from('pricing_stores')
        .update({
          is_demo: false,
          name: 'Minha Loja', // Rename from demo name
          updated_at: new Date().toISOString(),
        })
        .eq('id', storeId);

      if (error) {
        console.error('[TutorialDemoService] Error converting store:', error);
        return { success: false, error: error.message };
      }

      console.log('[TutorialDemoService] Store converted successfully');
      return { success: true };
    } catch (error) {
      console.error('[TutorialDemoService] Exception in convertDemoToRegular:', error);
      return { success: false, error: 'Erro ao converter loja de demonstração' };
    }
  }

}

// =============================================================================
// Export singleton instance
// =============================================================================

export const tutorialDemoService = new TutorialDemoService();
