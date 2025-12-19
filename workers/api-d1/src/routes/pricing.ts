// Routes de Pricing para Cloudflare D1 API
// CRUD completo para pricing_stores, pricing_products, pricing_indirect_costs,
// pricing_hidden_costs, pricing_tax_config, pricing_tax_items

import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import {
  pricingStores,
  pricingProducts,
  pricingIndirectCosts,
  pricingHiddenCosts,
  pricingTaxConfig,
  pricingTaxItems,
} from '../db/schema';
import type { Env, Variables } from '../index';

export const pricingRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// Helper to generate UUID
const generateId = () => crypto.randomUUID();

// Helper to get current ISO timestamp
const now = () => new Date().toISOString();

// =============================================================================
// STORES
// =============================================================================

// GET /pricing/stores/user/:userUuid - List all stores for a user
pricingRoutes.get('/stores/user/:userUuid', async (c) => {
  const db = c.get('db');
  const { userUuid } = c.req.param();

  try {
    const stores = await db
      .select()
      .from(pricingStores)
      .where(and(eq(pricingStores.user_uuid, userUuid), eq(pricingStores.is_active, true)))
      .orderBy(pricingStores.created_at);

    return c.json({ data: stores });
  } catch (error: any) {
    console.error('[PRICING] Error fetching stores:', error);
    return c.json({ error: error.message }, 500);
  }
});

// GET /pricing/stores/:id - Get a single store
pricingRoutes.get('/stores/:id', async (c) => {
  const db = c.get('db');
  const { id } = c.req.param();

  try {
    const [store] = await db
      .select()
      .from(pricingStores)
      .where(and(eq(pricingStores.id, id), eq(pricingStores.is_active, true)));

    if (!store) {
      return c.json({ error: 'Store not found' }, 404);
    }

    return c.json({ data: store });
  } catch (error: any) {
    console.error('[PRICING] Error fetching store:', error);
    return c.json({ error: error.message }, 500);
  }
});

// POST /pricing/stores - Create a new store
pricingRoutes.post('/stores', async (c) => {
  const db = c.get('db');
  const body = await c.req.json();

  try {
    const newStore = {
      id: generateId(),
      user_uuid: body.user_uuid,
      name: body.name,
      description: body.description || null,
      currency: body.currency || 'BRL',
      cost_allocation_method: body.cost_allocation_method || 'equal',
      is_active: true,
      is_demo: body.is_demo || false,
      created_at: now(),
      updated_at: now(),
    };

    await db.insert(pricingStores).values(newStore);

    return c.json({ data: newStore }, 201);
  } catch (error: any) {
    console.error('[PRICING] Error creating store:', error);
    return c.json({ error: error.message }, 500);
  }
});

// PATCH /pricing/stores/:id - Update a store
pricingRoutes.patch('/stores/:id', async (c) => {
  const db = c.get('db');
  const { id } = c.req.param();
  const body = await c.req.json();

  try {
    const updates: Record<string, any> = { updated_at: now() };

    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.currency !== undefined) updates.currency = body.currency;
    if (body.cost_allocation_method !== undefined) updates.cost_allocation_method = body.cost_allocation_method;

    await db.update(pricingStores).set(updates).where(eq(pricingStores.id, id));

    const [updated] = await db.select().from(pricingStores).where(eq(pricingStores.id, id));

    return c.json({ data: updated });
  } catch (error: any) {
    console.error('[PRICING] Error updating store:', error);
    return c.json({ error: error.message }, 500);
  }
});

// DELETE /pricing/stores/:id - Soft delete a store
pricingRoutes.delete('/stores/:id', async (c) => {
  const db = c.get('db');
  const { id } = c.req.param();

  try {
    await db
      .update(pricingStores)
      .set({ is_active: false, updated_at: now() })
      .where(eq(pricingStores.id, id));

    return c.json({ success: true });
  } catch (error: any) {
    console.error('[PRICING] Error deleting store:', error);
    return c.json({ error: error.message }, 500);
  }
});

// =============================================================================
// PRODUCTS
// =============================================================================

// GET /pricing/products/store/:storeId - List all products for a store
pricingRoutes.get('/products/store/:storeId', async (c) => {
  const db = c.get('db');
  const { storeId } = c.req.param();

  try {
    const products = await db
      .select()
      .from(pricingProducts)
      .where(and(eq(pricingProducts.store_id, storeId), eq(pricingProducts.is_active, true)))
      .orderBy(pricingProducts.created_at);

    return c.json({ data: products });
  } catch (error: any) {
    console.error('[PRICING] Error fetching products:', error);
    return c.json({ error: error.message }, 500);
  }
});

// GET /pricing/products/:id - Get a single product
pricingRoutes.get('/products/:id', async (c) => {
  const db = c.get('db');
  const { id } = c.req.param();

  try {
    const [product] = await db
      .select()
      .from(pricingProducts)
      .where(and(eq(pricingProducts.id, id), eq(pricingProducts.is_active, true)));

    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    return c.json({ data: product });
  } catch (error: any) {
    console.error('[PRICING] Error fetching product:', error);
    return c.json({ error: error.message }, 500);
  }
});

// POST /pricing/products - Create a new product
pricingRoutes.post('/products', async (c) => {
  const db = c.get('db');
  const body = await c.req.json();

  try {
    const newProduct = {
      id: generateId(),
      store_id: body.store_id,
      name: body.name,
      description: body.description || null,
      category: body.category || null,
      direct_cost: body.direct_cost || 0,
      unit_type: body.unit_type || 'unit',
      desired_margin: body.desired_margin || 30,
      positioning: body.positioning || 'intermediate',
      market_price: body.market_price || null,
      weight: body.weight || 100,
      monthly_units_estimate: body.monthly_units_estimate || 100,
      is_active: true,
      is_demo: body.is_demo || false,
      created_at: now(),
      updated_at: now(),
    };

    await db.insert(pricingProducts).values(newProduct);

    return c.json({ data: newProduct }, 201);
  } catch (error: any) {
    console.error('[PRICING] Error creating product:', error);
    return c.json({ error: error.message }, 500);
  }
});

// PATCH /pricing/products/:id - Update a product
pricingRoutes.patch('/products/:id', async (c) => {
  const db = c.get('db');
  const { id } = c.req.param();
  const body = await c.req.json();

  try {
    const updates: Record<string, any> = { updated_at: now() };

    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.category !== undefined) updates.category = body.category;
    if (body.direct_cost !== undefined) updates.direct_cost = body.direct_cost;
    if (body.unit_type !== undefined) updates.unit_type = body.unit_type;
    if (body.desired_margin !== undefined) updates.desired_margin = body.desired_margin;
    if (body.positioning !== undefined) updates.positioning = body.positioning;
    if (body.market_price !== undefined) updates.market_price = body.market_price;
    if (body.weight !== undefined) updates.weight = body.weight;
    if (body.monthly_units_estimate !== undefined) updates.monthly_units_estimate = body.monthly_units_estimate;

    await db.update(pricingProducts).set(updates).where(eq(pricingProducts.id, id));

    const [updated] = await db.select().from(pricingProducts).where(eq(pricingProducts.id, id));

    return c.json({ data: updated });
  } catch (error: any) {
    console.error('[PRICING] Error updating product:', error);
    return c.json({ error: error.message }, 500);
  }
});

// DELETE /pricing/products/:id - Soft delete a product
pricingRoutes.delete('/products/:id', async (c) => {
  const db = c.get('db');
  const { id } = c.req.param();

  try {
    await db
      .update(pricingProducts)
      .set({ is_active: false, updated_at: now() })
      .where(eq(pricingProducts.id, id));

    return c.json({ success: true });
  } catch (error: any) {
    console.error('[PRICING] Error deleting product:', error);
    return c.json({ error: error.message }, 500);
  }
});

// =============================================================================
// INDIRECT COSTS
// =============================================================================

// GET /pricing/indirect-costs/store/:storeId - List all indirect costs for a store
pricingRoutes.get('/indirect-costs/store/:storeId', async (c) => {
  const db = c.get('db');
  const { storeId } = c.req.param();

  try {
    const costs = await db
      .select()
      .from(pricingIndirectCosts)
      .where(eq(pricingIndirectCosts.store_id, storeId))
      .orderBy(pricingIndirectCosts.created_at);

    return c.json({ data: costs });
  } catch (error: any) {
    console.error('[PRICING] Error fetching indirect costs:', error);
    return c.json({ error: error.message }, 500);
  }
});

// POST /pricing/indirect-costs - Create a new indirect cost
pricingRoutes.post('/indirect-costs', async (c) => {
  const db = c.get('db');
  const body = await c.req.json();

  try {
    const newCost = {
      id: generateId(),
      store_id: body.store_id,
      name: body.name,
      category: body.category,
      amount: body.amount || 0,
      frequency: body.frequency || 'monthly',
      amortization_months: body.amortization_months || 12,
      notes: body.notes || null,
      created_at: now(),
      updated_at: now(),
    };

    await db.insert(pricingIndirectCosts).values(newCost);

    return c.json({ data: newCost }, 201);
  } catch (error: any) {
    console.error('[PRICING] Error creating indirect cost:', error);
    return c.json({ error: error.message }, 500);
  }
});

// PATCH /pricing/indirect-costs/:id - Update an indirect cost
pricingRoutes.patch('/indirect-costs/:id', async (c) => {
  const db = c.get('db');
  const { id } = c.req.param();
  const body = await c.req.json();

  try {
    const updates: Record<string, any> = { updated_at: now() };

    if (body.name !== undefined) updates.name = body.name;
    if (body.category !== undefined) updates.category = body.category;
    if (body.amount !== undefined) updates.amount = body.amount;
    if (body.frequency !== undefined) updates.frequency = body.frequency;
    if (body.amortization_months !== undefined) updates.amortization_months = body.amortization_months;
    if (body.notes !== undefined) updates.notes = body.notes;

    await db.update(pricingIndirectCosts).set(updates).where(eq(pricingIndirectCosts.id, id));

    const [updated] = await db.select().from(pricingIndirectCosts).where(eq(pricingIndirectCosts.id, id));

    return c.json({ data: updated });
  } catch (error: any) {
    console.error('[PRICING] Error updating indirect cost:', error);
    return c.json({ error: error.message }, 500);
  }
});

// DELETE /pricing/indirect-costs/:id - Delete an indirect cost
pricingRoutes.delete('/indirect-costs/:id', async (c) => {
  const db = c.get('db');
  const { id } = c.req.param();

  try {
    await db.delete(pricingIndirectCosts).where(eq(pricingIndirectCosts.id, id));

    return c.json({ success: true });
  } catch (error: any) {
    console.error('[PRICING] Error deleting indirect cost:', error);
    return c.json({ error: error.message }, 500);
  }
});

// =============================================================================
// HIDDEN COSTS
// =============================================================================

// GET /pricing/hidden-costs/store/:storeId - List all hidden costs for a store
pricingRoutes.get('/hidden-costs/store/:storeId', async (c) => {
  const db = c.get('db');
  const { storeId } = c.req.param();

  try {
    const costs = await db
      .select()
      .from(pricingHiddenCosts)
      .where(eq(pricingHiddenCosts.store_id, storeId))
      .orderBy(pricingHiddenCosts.created_at);

    return c.json({ data: costs });
  } catch (error: any) {
    console.error('[PRICING] Error fetching hidden costs:', error);
    return c.json({ error: error.message }, 500);
  }
});

// POST /pricing/hidden-costs - Create a new hidden cost
pricingRoutes.post('/hidden-costs', async (c) => {
  const db = c.get('db');
  const body = await c.req.json();

  try {
    const newCost = {
      id: generateId(),
      store_id: body.store_id,
      name: body.name,
      category: body.category,
      amount: body.amount || 0,
      frequency: body.frequency || 'monthly',
      amortization_months: body.amortization_months || 12,
      is_auto_calculated: body.is_auto_calculated || false,
      auxiliary_data: body.auxiliary_data ? JSON.stringify(body.auxiliary_data) : null,
      notes: body.notes || null,
      created_at: now(),
      updated_at: now(),
    };

    await db.insert(pricingHiddenCosts).values(newCost);

    return c.json({ data: newCost }, 201);
  } catch (error: any) {
    console.error('[PRICING] Error creating hidden cost:', error);
    return c.json({ error: error.message }, 500);
  }
});

// PATCH /pricing/hidden-costs/:id - Update a hidden cost
pricingRoutes.patch('/hidden-costs/:id', async (c) => {
  const db = c.get('db');
  const { id } = c.req.param();
  const body = await c.req.json();

  try {
    const updates: Record<string, any> = { updated_at: now() };

    if (body.name !== undefined) updates.name = body.name;
    if (body.category !== undefined) updates.category = body.category;
    if (body.amount !== undefined) updates.amount = body.amount;
    if (body.frequency !== undefined) updates.frequency = body.frequency;
    if (body.amortization_months !== undefined) updates.amortization_months = body.amortization_months;
    if (body.is_auto_calculated !== undefined) updates.is_auto_calculated = body.is_auto_calculated;
    if (body.auxiliary_data !== undefined) {
      updates.auxiliary_data = body.auxiliary_data ? JSON.stringify(body.auxiliary_data) : null;
    }
    if (body.notes !== undefined) updates.notes = body.notes;

    await db.update(pricingHiddenCosts).set(updates).where(eq(pricingHiddenCosts.id, id));

    const [updated] = await db.select().from(pricingHiddenCosts).where(eq(pricingHiddenCosts.id, id));

    return c.json({ data: updated });
  } catch (error: any) {
    console.error('[PRICING] Error updating hidden cost:', error);
    return c.json({ error: error.message }, 500);
  }
});

// DELETE /pricing/hidden-costs/:id - Delete a hidden cost
pricingRoutes.delete('/hidden-costs/:id', async (c) => {
  const db = c.get('db');
  const { id } = c.req.param();

  try {
    await db.delete(pricingHiddenCosts).where(eq(pricingHiddenCosts.id, id));

    return c.json({ success: true });
  } catch (error: any) {
    console.error('[PRICING] Error deleting hidden cost:', error);
    return c.json({ error: error.message }, 500);
  }
});

// =============================================================================
// TAX CONFIG
// =============================================================================

// GET /pricing/tax-config/store/:storeId - Get tax config for a store
pricingRoutes.get('/tax-config/store/:storeId', async (c) => {
  const db = c.get('db');
  const { storeId } = c.req.param();

  try {
    const [config] = await db
      .select()
      .from(pricingTaxConfig)
      .where(eq(pricingTaxConfig.store_id, storeId));

    return c.json({ data: config || null });
  } catch (error: any) {
    console.error('[PRICING] Error fetching tax config:', error);
    return c.json({ error: error.message }, 500);
  }
});

// PUT /pricing/tax-config/store/:storeId - Upsert tax config for a store
pricingRoutes.put('/tax-config/store/:storeId', async (c) => {
  const db = c.get('db');
  const { storeId } = c.req.param();
  const body = await c.req.json();

  try {
    // Check if exists
    const [existing] = await db
      .select()
      .from(pricingTaxConfig)
      .where(eq(pricingTaxConfig.store_id, storeId));

    if (existing) {
      // Update
      await db
        .update(pricingTaxConfig)
        .set({
          tax_regime: body.tax_regime,
          updated_at: now(),
        })
        .where(eq(pricingTaxConfig.store_id, storeId));

      const [updated] = await db.select().from(pricingTaxConfig).where(eq(pricingTaxConfig.store_id, storeId));
      return c.json({ data: updated });
    } else {
      // Create
      const newConfig = {
        id: generateId(),
        store_id: storeId,
        tax_regime: body.tax_regime || 'simples',
        created_at: now(),
        updated_at: now(),
      };

      await db.insert(pricingTaxConfig).values(newConfig);

      return c.json({ data: newConfig }, 201);
    }
  } catch (error: any) {
    console.error('[PRICING] Error upserting tax config:', error);
    return c.json({ error: error.message }, 500);
  }
});

// =============================================================================
// TAX ITEMS
// =============================================================================

// GET /pricing/tax-items/store/:storeId - List all tax items for a store
pricingRoutes.get('/tax-items/store/:storeId', async (c) => {
  const db = c.get('db');
  const { storeId } = c.req.param();

  try {
    const items = await db
      .select()
      .from(pricingTaxItems)
      .where(eq(pricingTaxItems.store_id, storeId))
      .orderBy(pricingTaxItems.created_at);

    return c.json({ data: items });
  } catch (error: any) {
    console.error('[PRICING] Error fetching tax items:', error);
    return c.json({ error: error.message }, 500);
  }
});

// POST /pricing/tax-items - Create a new tax item
pricingRoutes.post('/tax-items', async (c) => {
  const db = c.get('db');
  const body = await c.req.json();

  try {
    const newItem = {
      id: generateId(),
      store_id: body.store_id,
      name: body.name,
      category: body.category,
      percentage: body.percentage || 0,
      created_at: now(),
      updated_at: now(),
    };

    await db.insert(pricingTaxItems).values(newItem);

    return c.json({ data: newItem }, 201);
  } catch (error: any) {
    console.error('[PRICING] Error creating tax item:', error);
    return c.json({ error: error.message }, 500);
  }
});

// PATCH /pricing/tax-items/:id - Update a tax item
pricingRoutes.patch('/tax-items/:id', async (c) => {
  const db = c.get('db');
  const { id } = c.req.param();
  const body = await c.req.json();

  try {
    const updates: Record<string, any> = { updated_at: now() };

    if (body.name !== undefined) updates.name = body.name;
    if (body.category !== undefined) updates.category = body.category;
    if (body.percentage !== undefined) updates.percentage = body.percentage;

    await db.update(pricingTaxItems).set(updates).where(eq(pricingTaxItems.id, id));

    const [updated] = await db.select().from(pricingTaxItems).where(eq(pricingTaxItems.id, id));

    return c.json({ data: updated });
  } catch (error: any) {
    console.error('[PRICING] Error updating tax item:', error);
    return c.json({ error: error.message }, 500);
  }
});

// DELETE /pricing/tax-items/:id - Delete a tax item
pricingRoutes.delete('/tax-items/:id', async (c) => {
  const db = c.get('db');
  const { id } = c.req.param();

  try {
    await db.delete(pricingTaxItems).where(eq(pricingTaxItems.id, id));

    return c.json({ success: true });
  } catch (error: any) {
    console.error('[PRICING] Error deleting tax item:', error);
    return c.json({ error: error.message }, 500);
  }
});
