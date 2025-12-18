// Sites API Routes - CRUD para MyEasyWebsite
// Gerencia sites criados pelos usuários
// Com sincronização automática para Supabase

import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { sites, type NewSite } from '../db/schema';
import type { Env, Variables } from '../index';
import { syncSiteToSupabase } from '../utils/supabaseSync';

export const sitesRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * GET /sites/user/:userUuid
 * Lista todos os sites de um usuário
 */
sitesRoutes.get('/user/:userUuid', async (c) => {
  const db = c.get('db');
  const userUuid = c.req.param('userUuid');

  const userSites = await db.query.sites.findMany({
    where: eq(sites.user_uuid, userUuid),
  });

  return c.json({ data: userSites });
});

/**
 * GET /sites/:id
 * Busca site por ID
 */
sitesRoutes.get('/:id', async (c) => {
  const db = c.get('db');
  const id = parseInt(c.req.param('id'));

  if (isNaN(id)) {
    return c.json({ error: 'Invalid site ID' }, 400);
  }

  const site = await db.query.sites.findFirst({
    where: eq(sites.id, id),
  });

  if (!site) {
    return c.json({ error: 'Site not found' }, 404);
  }

  return c.json({ data: site });
});

/**
 * GET /sites/slug/:slug
 * Busca site por slug (subdomínio)
 */
sitesRoutes.get('/slug/:slug', async (c) => {
  const db = c.get('db');
  const slug = c.req.param('slug').toLowerCase();

  const site = await db.query.sites.findFirst({
    where: eq(sites.slug, slug),
  });

  if (!site) {
    return c.json({ error: 'Site not found' }, 404);
  }

  return c.json({ data: site });
});

/**
 * GET /sites/slug/:slug/available
 * Verifica se slug está disponível
 */
sitesRoutes.get('/slug/:slug/available', async (c) => {
  const db = c.get('db');
  const slug = c.req.param('slug').toLowerCase();

  // Validar formato do slug
  const slugRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
  if (!slugRegex.test(slug) || slug.length < 3 || slug.length > 63) {
    return c.json({
      available: false,
      reason: 'invalid_format',
      message: 'Slug must be 3-63 characters, alphanumeric and hyphens only',
    });
  }

  // Slugs reservados
  const reservedSlugs = [
    'www', 'api', 'app', 'admin', 'blog', 'mail', 'email',
    'support', 'help', 'docs', 'status', 'cdn', 'static',
    'assets', 'images', 'files', 'upload', 'download',
  ];

  if (reservedSlugs.includes(slug)) {
    return c.json({
      available: false,
      reason: 'reserved',
      message: 'This subdomain is reserved',
    });
  }

  const existing = await db.query.sites.findFirst({
    where: eq(sites.slug, slug),
  });

  return c.json({
    available: !existing,
    reason: existing ? 'taken' : null,
  });
});

/**
 * POST /sites
 * Cria novo site
 */
sitesRoutes.post('/', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<NewSite>();

  if (!body.user_uuid || !body.slug || !body.name) {
    return c.json({ error: 'user_uuid, slug, and name are required' }, 400);
  }

  const slug = body.slug.toLowerCase();

  // Verificar se slug já existe
  const existing = await db.query.sites.findFirst({
    where: eq(sites.slug, slug),
  });

  if (existing) {
    return c.json({ error: 'Slug already in use', code: 'DUPLICATE' }, 409);
  }

  const newSite: NewSite = {
    user_uuid: body.user_uuid,
    slug,
    name: body.name,
    description: body.description || null,
    business_type: body.business_type || null,
    status: body.status || 'building',
    settings: body.settings || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const result = await db.insert(sites).values(newSite).returning();

  console.log(`✅ [D1] Site created: ${slug} for user ${body.user_uuid}`);

  // Sync para Supabase (não-bloqueante)
  c.executionCtx.waitUntil(syncSiteToSupabase(c.env, 'INSERT', result[0]));

  return c.json({ data: result[0], success: true }, 201);
});

/**
 * PATCH /sites/:id
 * Atualiza site
 */
sitesRoutes.patch('/:id', async (c) => {
  const db = c.get('db');
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();

  if (isNaN(id)) {
    return c.json({ error: 'Invalid site ID' }, 400);
  }

  // Remover campos que não devem ser atualizados (slug PODE ser atualizado na primeira publicação)
  const { id: _, user_uuid: __, created_at: ___, ...updates } = body;

  // Se está atualizando o slug, normalizar para lowercase
  const updateData = {
    ...updates,
    ...(updates.slug && { slug: updates.slug.toLowerCase() }),
    updated_at: new Date().toISOString(),
  };

  const result = await db
    .update(sites)
    .set(updateData)
    .where(eq(sites.id, id))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'Site not found' }, 404);
  }

  console.log(`✅ [D1] Site updated: ${id}`);

  // Sync para Supabase (não-bloqueante)
  c.executionCtx.waitUntil(syncSiteToSupabase(c.env, 'UPDATE', result[0]));

  return c.json({ data: result[0], success: true });
});

/**
 * PATCH /sites/slug/:slug/publish
 * Marca site como publicado
 */
sitesRoutes.patch('/slug/:slug/publish', async (c) => {
  const db = c.get('db');
  const slug = c.req.param('slug').toLowerCase();

  const result = await db
    .update(sites)
    .set({
      status: 'active',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .where(eq(sites.slug, slug))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'Site not found' }, 404);
  }

  console.log(`✅ [D1] Site published: ${slug}`);

  // Sync para Supabase (não-bloqueante)
  c.executionCtx.waitUntil(syncSiteToSupabase(c.env, 'UPDATE', result[0]));

  return c.json({ data: result[0], success: true });
});

/**
 * DELETE /sites/:id
 * Remove site
 */
sitesRoutes.delete('/:id', async (c) => {
  const db = c.get('db');
  const id = parseInt(c.req.param('id'));

  if (isNaN(id)) {
    return c.json({ error: 'Invalid site ID' }, 400);
  }

  const result = await db
    .delete(sites)
    .where(eq(sites.id, id))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'Site not found' }, 404);
  }

  console.log(`✅ [D1] Site deleted: ${id}`);

  // Sync para Supabase (não-bloqueante) - passa o site deletado
  c.executionCtx.waitUntil(syncSiteToSupabase(c.env, 'DELETE', result[0]));

  return c.json({ success: true });
});

/**
 * GET /sites/stats/user/:userUuid
 * Estatísticas dos sites do usuário
 */
sitesRoutes.get('/stats/user/:userUuid', async (c) => {
  const db = c.get('db');
  const userUuid = c.req.param('userUuid');

  const userSites = await db.query.sites.findMany({
    where: eq(sites.user_uuid, userUuid),
  });

  const stats = {
    total: userSites.length,
    active: userSites.filter((s) => s.status === 'active').length,
    building: userSites.filter((s) => s.status === 'building').length,
    inactive: userSites.filter((s) => s.status === 'inactive').length,
  };

  return c.json({ data: stats });
});
