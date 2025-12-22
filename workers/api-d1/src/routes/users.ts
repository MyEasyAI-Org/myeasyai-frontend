// Users API Routes - CRUD completo
// Equivalente às operações do Supabase
// Com sincronização automática para Supabase

import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { users, type NewUser } from '../db/schema';
import type { Env, Variables } from '../index';
import { syncUserToSupabase } from '../utils/supabaseSync';

export const usersRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * GET /users/:uuid
 * Busca usuário por UUID
 */
usersRoutes.get('/:uuid', async (c) => {
  const db = c.get('db');
  const uuid = c.req.param('uuid');

  const user = await db.query.users.findFirst({
    where: eq(users.uuid, uuid),
  });

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({ data: user });
});

/**
 * GET /users/email/:email
 * Busca usuário por email
 */
usersRoutes.get('/email/:email', async (c) => {
  const db = c.get('db');
  const email = decodeURIComponent(c.req.param('email'));

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return c.json({ error: 'User not found', code: 'PGRST116' }, 404);
  }

  return c.json({ data: user });
});

/**
 * POST /users
 * Cria novo usuário
 */
usersRoutes.post('/', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<NewUser>();

  // Validação básica
  if (!body.uuid || !body.email) {
    return c.json({ error: 'uuid and email are required' }, 400);
  }

  // Verificar se já existe
  const existing = await db.query.users.findFirst({
    where: eq(users.email, body.email),
  });

  if (existing) {
    return c.json({ error: 'User already exists', code: 'DUPLICATE' }, 409);
  }

  // Inserir usuário
  const newUser: NewUser = {
    uuid: body.uuid,
    email: body.email,
    name: body.name || null,
    preferred_name: body.preferred_name || null,
    mobile_phone: body.mobile_phone || null,
    country: body.country || null,
    postal_code: body.postal_code || null,
    address: body.address || null,
    avatar_url: body.avatar_url || null,
    preferred_language: body.preferred_language || 'pt',
    created_at: new Date().toISOString(),
    last_online: new Date().toISOString(),
  };

  await db.insert(users).values(newUser);

  console.log(`✅ [D1] User created: ${body.email}`);

  // Sync para Supabase (não-bloqueante)
  c.executionCtx.waitUntil(syncUserToSupabase(c.env, 'INSERT', newUser));

  return c.json({ data: newUser, success: true }, 201);
});

/**
 * PATCH /users/:uuid
 * Atualiza usuário por UUID
 */
usersRoutes.patch('/:uuid', async (c) => {
  const db = c.get('db');
  const uuid = c.req.param('uuid');
  const body = await c.req.json();

  // Remover campos que não devem ser atualizados
  const { uuid: _, email: __, created_at: ___, ...updates } = body;

  // Adicionar timestamp de atualização
  const updateData = {
    ...updates,
    last_online: new Date().toISOString(),
  };

  const result = await db
    .update(users)
    .set(updateData)
    .where(eq(users.uuid, uuid))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'User not found' }, 404);
  }

  console.log(`✅ [D1] User updated: ${uuid}`);

  // Sync para Supabase (não-bloqueante)
  c.executionCtx.waitUntil(syncUserToSupabase(c.env, 'UPDATE', { uuid, ...updateData }));

  return c.json({ data: result[0], success: true });
});

/**
 * PATCH /users/email/:email
 * Atualiza usuário por email (compatibilidade com código existente)
 */
usersRoutes.patch('/email/:email', async (c) => {
  const db = c.get('db');
  const email = decodeURIComponent(c.req.param('email'));
  const body = await c.req.json();

  // Remover campos que não devem ser atualizados
  const { uuid: _, email: __, created_at: ___, ...updates } = body;

  // Adicionar timestamp de atualização
  const updateData = {
    ...updates,
    last_online: new Date().toISOString(),
  };

  const result = await db
    .update(users)
    .set(updateData)
    .where(eq(users.email, email))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'User not found' }, 404);
  }

  console.log(`✅ [D1] User updated by email: ${email}`);

  // Sync para Supabase (não-bloqueante)
  c.executionCtx.waitUntil(syncUserToSupabase(c.env, 'UPDATE', { email, ...updateData }));

  return c.json({ data: result[0], success: true });
});

/**
 * DELETE /users/:uuid
 * Remove usuário (soft delete ou hard delete)
 */
usersRoutes.delete('/:uuid', async (c) => {
  const db = c.get('db');
  const uuid = c.req.param('uuid');

  const result = await db
    .delete(users)
    .where(eq(users.uuid, uuid))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'User not found' }, 404);
  }

  console.log(`✅ [D1] User deleted: ${uuid}`);

  // Sync para Supabase (não-bloqueante)
  c.executionCtx.waitUntil(syncUserToSupabase(c.env, 'DELETE', { uuid }));

  return c.json({ success: true });
});

/**
 * POST /users/ensure
 * Garante que usuário existe (upsert) - usado após login social
 */
usersRoutes.post('/ensure', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<{
    uuid: string;
    email: string;
    name?: string;
    preferred_name?: string;
    avatar_url?: string;
  }>();

  if (!body.uuid || !body.email) {
    return c.json({ error: 'uuid and email are required' }, 400);
  }

  // Verificar se usuário existe
  const existing = await db.query.users.findFirst({
    where: eq(users.email, body.email),
  });

  if (existing) {
    // Atualizar last_online
    const updateData = { last_online: new Date().toISOString() };
    await db
      .update(users)
      .set(updateData)
      .where(eq(users.email, body.email));

    console.log(`✅ [D1] User last_online updated: ${body.email}`);

    // Sync para Supabase (não-bloqueante)
    c.executionCtx.waitUntil(syncUserToSupabase(c.env, 'UPDATE', { email: body.email, ...updateData }));

    return c.json({ data: existing, created: false });
  }

  // Criar novo usuário
  const newUser: NewUser = {
    uuid: body.uuid,
    email: body.email,
    name: body.name || null,
    preferred_name: body.preferred_name || null,
    avatar_url: body.avatar_url || null,
    preferred_language: 'pt',
    created_at: new Date().toISOString(),
    last_online: new Date().toISOString(),
  };

  await db.insert(users).values(newUser);

  console.log(`✅ [D1] New user created: ${body.email}`);

  // Sync para Supabase (não-bloqueante)
  c.executionCtx.waitUntil(syncUserToSupabase(c.env, 'INSERT', newUser));

  return c.json({ data: newUser, created: true }, 201);
});

/**
 * GET /users/email/:email/onboarding-status
 * Verifica se usuário precisa completar onboarding
 */
usersRoutes.get('/email/:email/onboarding-status', async (c) => {
  const db = c.get('db');
  const email = decodeURIComponent(c.req.param('email'));
  console.log('[ONBOARDING] Checking status for:', email);

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return c.json({ data: { needsOnboarding: true, reason: 'user_not_found' } });
  }

  // Verificar campos obrigatórios
  const missingRequired = !user.name || !user.country || !user.preferred_language;

  // Verificar se tem dados opcionais
  const hasOptionalData = user.mobile_phone || user.postal_code || user.address;

  const needsOnboarding = missingRequired || !hasOptionalData;

  return c.json({
    data: {
      needsOnboarding,
      reason: missingRequired
        ? 'missing_required_fields'
        : !hasOptionalData
          ? 'missing_optional_data'
          : null,
      user: {
        name: user.name,
        country: user.country,
        preferred_language: user.preferred_language,
        has_optional_data: !!hasOptionalData,
      },
    },
  });
});
