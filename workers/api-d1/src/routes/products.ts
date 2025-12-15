// Products API Routes - CRUD para user_products
// Gerencia produtos/licenças dos usuários
// Com sincronização automática para Supabase

import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { userProducts, type NewUserProduct } from '../db/schema';
import type { Env, Variables } from '../index';
import { syncProductToSupabase } from '../utils/supabaseSync';

export const productsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * GET /products/user/:userUuid
 * Lista todos os produtos de um usuário
 */
productsRoutes.get('/user/:userUuid', async (c) => {
  const db = c.get('db');
  const userUuid = c.req.param('userUuid');

  const products = await db.query.userProducts.findMany({
    where: eq(userProducts.user_uuid, userUuid),
  });

  return c.json({ data: products });
});

/**
 * GET /products/:id
 * Busca produto específico por ID
 */
productsRoutes.get('/:id', async (c) => {
  const db = c.get('db');
  const id = parseInt(c.req.param('id'));

  if (isNaN(id)) {
    return c.json({ error: 'Invalid product ID' }, 400);
  }

  const product = await db.query.userProducts.findFirst({
    where: eq(userProducts.id, id),
  });

  if (!product) {
    return c.json({ error: 'Product not found' }, 404);
  }

  return c.json({ data: product });
});

/**
 * POST /products
 * Adiciona produto para usuário
 */
productsRoutes.post('/', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<NewUserProduct>();

  if (!body.user_uuid || !body.product_id) {
    return c.json({ error: 'user_uuid and product_id are required' }, 400);
  }

  // Verificar se produto já existe para este usuário
  const existing = await db.query.userProducts.findFirst({
    where: and(
      eq(userProducts.user_uuid, body.user_uuid),
      eq(userProducts.product_id, body.product_id)
    ),
  });

  if (existing) {
    return c.json({ error: 'Product already exists for this user', code: 'DUPLICATE' }, 409);
  }

  const newProduct: NewUserProduct = {
    user_uuid: body.user_uuid,
    product_id: body.product_id,
    product_type: body.product_type || null,
    status: body.status || 'active',
    metadata: body.metadata || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const result = await db.insert(userProducts).values(newProduct).returning();

  console.log(`✅ [D1] Product added: ${body.product_id} for user ${body.user_uuid}`);

  // Sync para Supabase (não-bloqueante)
  c.executionCtx.waitUntil(syncProductToSupabase(c.env, 'INSERT', result[0]));

  return c.json({ data: result[0], success: true }, 201);
});

/**
 * PATCH /products/:id
 * Atualiza produto
 */
productsRoutes.patch('/:id', async (c) => {
  const db = c.get('db');
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();

  if (isNaN(id)) {
    return c.json({ error: 'Invalid product ID' }, 400);
  }

  // Remover campos que não devem ser atualizados
  const { id: _, user_uuid: __, created_at: ___, ...updates } = body;

  const updateData = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const result = await db
    .update(userProducts)
    .set(updateData)
    .where(eq(userProducts.id, id))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'Product not found' }, 404);
  }

  console.log(`✅ [D1] Product updated: ${id}`);

  // Sync para Supabase (não-bloqueante)
  c.executionCtx.waitUntil(syncProductToSupabase(c.env, 'UPDATE', result[0]));

  return c.json({ data: result[0], success: true });
});

/**
 * PATCH /products/user/:userUuid/product/:productId/status
 * Atualiza status de um produto específico do usuário
 */
productsRoutes.patch('/user/:userUuid/product/:productId/status', async (c) => {
  const db = c.get('db');
  const userUuid = c.req.param('userUuid');
  const productId = c.req.param('productId');
  const { status } = await c.req.json<{ status: string }>();

  if (!status) {
    return c.json({ error: 'status is required' }, 400);
  }

  const result = await db
    .update(userProducts)
    .set({ status, updated_at: new Date().toISOString() })
    .where(
      and(
        eq(userProducts.user_uuid, userUuid),
        eq(userProducts.product_id, productId)
      )
    )
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'Product not found' }, 404);
  }

  console.log(`✅ [D1] Product status updated: ${productId} -> ${status}`);

  // Sync para Supabase (não-bloqueante)
  c.executionCtx.waitUntil(syncProductToSupabase(c.env, 'UPDATE', result[0]));

  return c.json({ data: result[0], success: true });
});

/**
 * DELETE /products/:id
 * Remove produto
 */
productsRoutes.delete('/:id', async (c) => {
  const db = c.get('db');
  const id = parseInt(c.req.param('id'));

  if (isNaN(id)) {
    return c.json({ error: 'Invalid product ID' }, 400);
  }

  const result = await db
    .delete(userProducts)
    .where(eq(userProducts.id, id))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'Product not found' }, 404);
  }

  console.log(`✅ [D1] Product deleted: ${id}`);

  // Sync para Supabase (não-bloqueante)
  c.executionCtx.waitUntil(syncProductToSupabase(c.env, 'DELETE', result[0]));

  return c.json({ success: true });
});

/**
 * GET /products/user/:userUuid/active
 * Lista apenas produtos ativos do usuário
 */
productsRoutes.get('/user/:userUuid/active', async (c) => {
  const db = c.get('db');
  const userUuid = c.req.param('userUuid');

  const products = await db.query.userProducts.findMany({
    where: and(
      eq(userProducts.user_uuid, userUuid),
      eq(userProducts.status, 'active')
    ),
  });

  return c.json({ data: products });
});
