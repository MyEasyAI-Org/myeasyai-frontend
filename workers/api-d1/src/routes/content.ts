// Content API Routes - CRUD para MyEasyContent
// Gerencia perfis de negócio, biblioteca de conteúdo e calendário editorial

import { Hono } from 'hono';
import { eq, and, desc, asc } from 'drizzle-orm';
import {
  contentBusinessProfiles,
  contentLibrary,
  contentCalendar,
  type NewContentBusinessProfile,
  type NewContentLibraryItem,
  type NewContentCalendarEntry,
} from '../db/schema';
import type { Env, Variables } from '../index';

export const contentRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// =============================================================================
// BUSINESS PROFILES (Presets)
// =============================================================================

/**
 * GET /content/profiles/user/:userId
 * Lista todos os perfis de negócio de um usuário
 */
contentRoutes.get('/profiles/user/:userId', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');

  const profiles = await db.query.contentBusinessProfiles.findMany({
    where: eq(contentBusinessProfiles.user_id, userId),
    orderBy: [desc(contentBusinessProfiles.is_default), desc(contentBusinessProfiles.created_at)],
  });

  // Parse JSON fields
  const parsedProfiles = profiles.map((p) => ({
    ...p,
    selected_networks: p.selected_networks ? JSON.parse(p.selected_networks) : [],
    preferred_content_types: p.preferred_content_types ? JSON.parse(p.preferred_content_types) : [],
  }));

  return c.json({ data: parsedProfiles });
});

/**
 * GET /content/profiles/:id
 * Busca perfil por ID
 */
contentRoutes.get('/profiles/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');

  const profile = await db.query.contentBusinessProfiles.findFirst({
    where: eq(contentBusinessProfiles.id, id),
  });

  if (!profile) {
    return c.json({ error: 'Profile not found' }, 404);
  }

  // Parse JSON fields
  const parsedProfile = {
    ...profile,
    selected_networks: profile.selected_networks ? JSON.parse(profile.selected_networks) : [],
    preferred_content_types: profile.preferred_content_types
      ? JSON.parse(profile.preferred_content_types)
      : [],
  };

  return c.json({ data: parsedProfile });
});

/**
 * GET /content/profiles/default/user/:userId
 * Busca perfil padrão do usuário
 */
contentRoutes.get('/profiles/default/user/:userId', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');

  // Tenta encontrar o perfil padrão
  let profile = await db.query.contentBusinessProfiles.findFirst({
    where: and(
      eq(contentBusinessProfiles.user_id, userId),
      eq(contentBusinessProfiles.is_default, true)
    ),
  });

  // Se não houver padrão, pega o primeiro
  if (!profile) {
    profile = await db.query.contentBusinessProfiles.findFirst({
      where: eq(contentBusinessProfiles.user_id, userId),
      orderBy: desc(contentBusinessProfiles.created_at),
    });
  }

  if (!profile) {
    return c.json({ data: null });
  }

  // Parse JSON fields
  const parsedProfile = {
    ...profile,
    selected_networks: profile.selected_networks ? JSON.parse(profile.selected_networks) : [],
    preferred_content_types: profile.preferred_content_types
      ? JSON.parse(profile.preferred_content_types)
      : [],
  };

  return c.json({ data: parsedProfile });
});

/**
 * POST /content/profiles
 * Cria novo perfil de negócio
 */
contentRoutes.post('/profiles', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<
    Omit<NewContentBusinessProfile, 'selected_networks' | 'preferred_content_types'> & {
      selected_networks?: string[];
      preferred_content_types?: string[];
    }
  >();

  if (!body.user_id || !body.name || !body.business_niche) {
    return c.json({ error: 'user_id, name, and business_niche are required' }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  // Se for o primeiro perfil do usuário, marca como padrão
  const existingProfiles = await db.query.contentBusinessProfiles.findMany({
    where: eq(contentBusinessProfiles.user_id, body.user_id),
    columns: { id: true },
  });
  const isFirstProfile = existingProfiles.length === 0;

  const newProfile: NewContentBusinessProfile = {
    id,
    user_id: body.user_id,
    name: body.name,
    business_niche: body.business_niche,
    target_audience: body.target_audience || null,
    brand_voice: body.brand_voice || 'professional',
    selected_networks: body.selected_networks ? JSON.stringify(body.selected_networks) : null,
    preferred_content_types: body.preferred_content_types
      ? JSON.stringify(body.preferred_content_types)
      : null,
    icon: body.icon || null,
    is_default: isFirstProfile || body.is_default || false,
    created_at: now,
    updated_at: now,
  };

  const result = await db.insert(contentBusinessProfiles).values(newProfile).returning();

  // Parse JSON fields for response
  const parsedProfile = {
    ...result[0],
    selected_networks: body.selected_networks || [],
    preferred_content_types: body.preferred_content_types || [],
  };

  console.log(`✅ [D1] Content Profile created: ${id}`);
  return c.json({ data: parsedProfile, success: true }, 201);
});

/**
 * PATCH /content/profiles/:id
 * Atualiza perfil de negócio
 */
contentRoutes.patch('/profiles/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const body = await c.req.json();

  const { id: _, user_id: __, created_at: ___, selected_networks, preferred_content_types, ...updates } = body;

  const updateData: Record<string, unknown> = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (selected_networks !== undefined) {
    updateData.selected_networks = Array.isArray(selected_networks)
      ? JSON.stringify(selected_networks)
      : selected_networks;
  }

  if (preferred_content_types !== undefined) {
    updateData.preferred_content_types = Array.isArray(preferred_content_types)
      ? JSON.stringify(preferred_content_types)
      : preferred_content_types;
  }

  const result = await db
    .update(contentBusinessProfiles)
    .set(updateData)
    .where(eq(contentBusinessProfiles.id, id))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'Profile not found' }, 404);
  }

  // Parse JSON fields for response
  const parsedProfile = {
    ...result[0],
    selected_networks: result[0].selected_networks ? JSON.parse(result[0].selected_networks) : [],
    preferred_content_types: result[0].preferred_content_types
      ? JSON.parse(result[0].preferred_content_types)
      : [],
  };

  console.log(`✅ [D1] Content Profile updated: ${id}`);
  return c.json({ data: parsedProfile, success: true });
});

/**
 * PATCH /content/profiles/:id/set-default
 * Define um perfil como padrão (remove padrão dos outros)
 */
contentRoutes.patch('/profiles/:id/set-default', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');

  // Busca o perfil para obter o user_id
  const profile = await db.query.contentBusinessProfiles.findFirst({
    where: eq(contentBusinessProfiles.id, id),
  });

  if (!profile) {
    return c.json({ error: 'Profile not found' }, 404);
  }

  // Remove padrão de todos os outros perfis do usuário
  await db
    .update(contentBusinessProfiles)
    .set({ is_default: false, updated_at: new Date().toISOString() })
    .where(eq(contentBusinessProfiles.user_id, profile.user_id));

  // Define o perfil selecionado como padrão
  const result = await db
    .update(contentBusinessProfiles)
    .set({ is_default: true, updated_at: new Date().toISOString() })
    .where(eq(contentBusinessProfiles.id, id))
    .returning();

  // Parse JSON fields for response
  const parsedProfile = {
    ...result[0],
    selected_networks: result[0].selected_networks ? JSON.parse(result[0].selected_networks) : [],
    preferred_content_types: result[0].preferred_content_types
      ? JSON.parse(result[0].preferred_content_types)
      : [],
  };

  console.log(`✅ [D1] Content Profile set as default: ${id}`);
  return c.json({ data: parsedProfile, success: true });
});

/**
 * DELETE /content/profiles/:id
 * Remove perfil de negócio
 */
contentRoutes.delete('/profiles/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');

  const result = await db
    .delete(contentBusinessProfiles)
    .where(eq(contentBusinessProfiles.id, id))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'Profile not found' }, 404);
  }

  console.log(`✅ [D1] Content Profile deleted: ${id}`);
  return c.json({ success: true });
});

// =============================================================================
// CONTENT LIBRARY
// =============================================================================

/**
 * GET /content/library/profile/:profileId
 * Lista conteúdos salvos de um perfil
 */
contentRoutes.get('/library/profile/:profileId', async (c) => {
  const db = c.get('db');
  const profileId = c.req.param('profileId');
  const favoriteOnly = c.req.query('favorite') === 'true';
  const contentType = c.req.query('type');
  const network = c.req.query('network');

  let whereConditions = [eq(contentLibrary.profile_id, profileId)];

  if (favoriteOnly) {
    whereConditions.push(eq(contentLibrary.is_favorite, true));
  }

  const contents = await db.query.contentLibrary.findMany({
    where: and(...whereConditions),
    orderBy: desc(contentLibrary.created_at),
  });

  // Filter and parse
  let filteredContents = contents;
  if (contentType) {
    filteredContents = filteredContents.filter((c) => c.content_type === contentType);
  }
  if (network) {
    filteredContents = filteredContents.filter((c) => c.network === network);
  }

  const parsedContents = filteredContents.map((c) => ({
    ...c,
    hashtags: c.hashtags ? JSON.parse(c.hashtags) : [],
    variations: c.variations ? JSON.parse(c.variations) : [],
    tags: c.tags ? JSON.parse(c.tags) : [],
  }));

  return c.json({ data: parsedContents });
});

/**
 * GET /content/library/:id
 * Busca conteúdo por ID
 */
contentRoutes.get('/library/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');

  const content = await db.query.contentLibrary.findFirst({
    where: eq(contentLibrary.id, id),
  });

  if (!content) {
    return c.json({ error: 'Content not found' }, 404);
  }

  const parsedContent = {
    ...content,
    hashtags: content.hashtags ? JSON.parse(content.hashtags) : [],
    variations: content.variations ? JSON.parse(content.variations) : [],
    tags: content.tags ? JSON.parse(content.tags) : [],
  };

  return c.json({ data: parsedContent });
});

/**
 * POST /content/library
 * Salva conteúdo na biblioteca
 */
contentRoutes.post('/library', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<
    Omit<NewContentLibraryItem, 'hashtags' | 'variations' | 'tags'> & {
      hashtags?: string[];
      variations?: string[];
      tags?: string[];
    }
  >();

  if (!body.user_id || !body.profile_id || !body.content_type || !body.network || !body.content) {
    return c.json(
      { error: 'user_id, profile_id, content_type, network, and content are required' },
      400
    );
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const newContent: NewContentLibraryItem = {
    id,
    user_id: body.user_id,
    profile_id: body.profile_id,
    content_type: body.content_type,
    network: body.network,
    title: body.title || null,
    content: body.content,
    hashtags: body.hashtags ? JSON.stringify(body.hashtags) : null,
    image_description: body.image_description || null,
    best_time: body.best_time || null,
    variations: body.variations ? JSON.stringify(body.variations) : null,
    is_favorite: body.is_favorite || false,
    tags: body.tags ? JSON.stringify(body.tags) : null,
    folder: body.folder || null,
    created_at: now,
  };

  const result = await db.insert(contentLibrary).values(newContent).returning();

  const parsedContent = {
    ...result[0],
    hashtags: body.hashtags || [],
    variations: body.variations || [],
    tags: body.tags || [],
  };

  console.log(`✅ [D1] Content Library item created: ${id}`);
  return c.json({ data: parsedContent, success: true }, 201);
});

/**
 * PATCH /content/library/:id
 * Atualiza conteúdo na biblioteca
 */
contentRoutes.patch('/library/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const body = await c.req.json();

  const { id: _, user_id: __, profile_id: ___, created_at: ____, hashtags, variations, tags, ...updates } = body;

  const updateData: Record<string, unknown> = { ...updates };

  if (hashtags !== undefined) {
    updateData.hashtags = Array.isArray(hashtags) ? JSON.stringify(hashtags) : hashtags;
  }
  if (variations !== undefined) {
    updateData.variations = Array.isArray(variations) ? JSON.stringify(variations) : variations;
  }
  if (tags !== undefined) {
    updateData.tags = Array.isArray(tags) ? JSON.stringify(tags) : tags;
  }

  const result = await db
    .update(contentLibrary)
    .set(updateData)
    .where(eq(contentLibrary.id, id))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'Content not found' }, 404);
  }

  const parsedContent = {
    ...result[0],
    hashtags: result[0].hashtags ? JSON.parse(result[0].hashtags) : [],
    variations: result[0].variations ? JSON.parse(result[0].variations) : [],
    tags: result[0].tags ? JSON.parse(result[0].tags) : [],
  };

  console.log(`✅ [D1] Content Library item updated: ${id}`);
  return c.json({ data: parsedContent, success: true });
});

/**
 * PATCH /content/library/:id/toggle-favorite
 * Alterna favorito de um conteúdo
 */
contentRoutes.patch('/library/:id/toggle-favorite', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');

  const content = await db.query.contentLibrary.findFirst({
    where: eq(contentLibrary.id, id),
  });

  if (!content) {
    return c.json({ error: 'Content not found' }, 404);
  }

  const result = await db
    .update(contentLibrary)
    .set({ is_favorite: !content.is_favorite })
    .where(eq(contentLibrary.id, id))
    .returning();

  const parsedContent = {
    ...result[0],
    hashtags: result[0].hashtags ? JSON.parse(result[0].hashtags) : [],
    variations: result[0].variations ? JSON.parse(result[0].variations) : [],
    tags: result[0].tags ? JSON.parse(result[0].tags) : [],
  };

  console.log(`✅ [D1] Content Library item favorite toggled: ${id}`);
  return c.json({ data: parsedContent, success: true });
});

/**
 * DELETE /content/library/:id
 * Remove conteúdo da biblioteca
 */
contentRoutes.delete('/library/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');

  const result = await db.delete(contentLibrary).where(eq(contentLibrary.id, id)).returning();

  if (result.length === 0) {
    return c.json({ error: 'Content not found' }, 404);
  }

  console.log(`✅ [D1] Content Library item deleted: ${id}`);
  return c.json({ success: true });
});

// =============================================================================
// CONTENT CALENDAR
// =============================================================================

/**
 * GET /content/calendar/profile/:profileId
 * Lista entradas do calendário de um perfil
 */
contentRoutes.get('/calendar/profile/:profileId', async (c) => {
  const db = c.get('db');
  const profileId = c.req.param('profileId');
  const month = c.req.query('month'); // YYYY-MM format
  const status = c.req.query('status');

  let whereConditions = [eq(contentCalendar.profile_id, profileId)];

  const entries = await db.query.contentCalendar.findMany({
    where: and(...whereConditions),
    orderBy: asc(contentCalendar.scheduled_date),
  });

  // Filter by month and status
  let filteredEntries = entries;
  if (month) {
    filteredEntries = filteredEntries.filter((e) => e.scheduled_date.startsWith(month));
  }
  if (status) {
    filteredEntries = filteredEntries.filter((e) => e.status === status);
  }

  const parsedEntries = filteredEntries.map((e) => ({
    ...e,
    hashtags: e.hashtags ? JSON.parse(e.hashtags) : [],
  }));

  return c.json({ data: parsedEntries });
});

/**
 * GET /content/calendar/:id
 * Busca entrada do calendário por ID
 */
contentRoutes.get('/calendar/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');

  const entry = await db.query.contentCalendar.findFirst({
    where: eq(contentCalendar.id, id),
  });

  if (!entry) {
    return c.json({ error: 'Calendar entry not found' }, 404);
  }

  const parsedEntry = {
    ...entry,
    hashtags: entry.hashtags ? JSON.parse(entry.hashtags) : [],
  };

  return c.json({ data: parsedEntry });
});

/**
 * POST /content/calendar
 * Cria entrada no calendário
 */
contentRoutes.post('/calendar', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<
    Omit<NewContentCalendarEntry, 'hashtags'> & {
      hashtags?: string[];
    }
  >();

  if (
    !body.user_id ||
    !body.profile_id ||
    !body.scheduled_date ||
    !body.network ||
    !body.content_type ||
    !body.title
  ) {
    return c.json(
      {
        error:
          'user_id, profile_id, scheduled_date, network, content_type, and title are required',
      },
      400
    );
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  // Calculate day of week
  const date = new Date(body.scheduled_date);
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayOfWeek = days[date.getDay()];

  const newEntry: NewContentCalendarEntry = {
    id,
    user_id: body.user_id,
    profile_id: body.profile_id,
    library_content_id: body.library_content_id || null,
    scheduled_date: body.scheduled_date,
    day_of_week: dayOfWeek,
    network: body.network,
    content_type: body.content_type,
    title: body.title,
    description: body.description || null,
    hashtags: body.hashtags ? JSON.stringify(body.hashtags) : null,
    best_time: body.best_time || null,
    status: body.status || 'planned',
    created_at: now,
    updated_at: now,
  };

  const result = await db.insert(contentCalendar).values(newEntry).returning();

  const parsedEntry = {
    ...result[0],
    hashtags: body.hashtags || [],
  };

  console.log(`✅ [D1] Content Calendar entry created: ${id}`);
  return c.json({ data: parsedEntry, success: true }, 201);
});

/**
 * POST /content/calendar/bulk
 * Cria múltiplas entradas no calendário (para geração de calendário editorial)
 */
contentRoutes.post('/calendar/bulk', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<{
    entries: Array<
      Omit<NewContentCalendarEntry, 'hashtags'> & {
        hashtags?: string[];
      }
    >;
  }>();

  if (!body.entries || body.entries.length === 0) {
    return c.json({ error: 'entries array is required' }, 400);
  }

  const now = new Date().toISOString();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  const newEntries: NewContentCalendarEntry[] = body.entries.map((entry) => {
    const date = new Date(entry.scheduled_date);
    const dayOfWeek = days[date.getDay()];

    return {
      id: crypto.randomUUID(),
      user_id: entry.user_id,
      profile_id: entry.profile_id,
      library_content_id: entry.library_content_id || null,
      scheduled_date: entry.scheduled_date,
      day_of_week: dayOfWeek,
      network: entry.network,
      content_type: entry.content_type,
      title: entry.title,
      description: entry.description || null,
      hashtags: entry.hashtags ? JSON.stringify(entry.hashtags) : null,
      best_time: entry.best_time || null,
      status: entry.status || 'planned',
      created_at: now,
      updated_at: now,
    };
  });

  const result = await db.insert(contentCalendar).values(newEntries).returning();

  const parsedEntries = result.map((e) => ({
    ...e,
    hashtags: e.hashtags ? JSON.parse(e.hashtags) : [],
  }));

  console.log(`✅ [D1] Content Calendar bulk created: ${result.length} entries`);
  return c.json({ data: parsedEntries, success: true }, 201);
});

/**
 * PATCH /content/calendar/:id
 * Atualiza entrada do calendário
 */
contentRoutes.patch('/calendar/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const body = await c.req.json();

  const { id: _, user_id: __, profile_id: ___, created_at: ____, hashtags, scheduled_date, ...updates } = body;

  const updateData: Record<string, unknown> = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (hashtags !== undefined) {
    updateData.hashtags = Array.isArray(hashtags) ? JSON.stringify(hashtags) : hashtags;
  }

  // Recalculate day of week if date changed
  if (scheduled_date) {
    updateData.scheduled_date = scheduled_date;
    const date = new Date(scheduled_date);
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    updateData.day_of_week = days[date.getDay()];
  }

  const result = await db
    .update(contentCalendar)
    .set(updateData)
    .where(eq(contentCalendar.id, id))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'Calendar entry not found' }, 404);
  }

  const parsedEntry = {
    ...result[0],
    hashtags: result[0].hashtags ? JSON.parse(result[0].hashtags) : [],
  };

  console.log(`✅ [D1] Content Calendar entry updated: ${id}`);
  return c.json({ data: parsedEntry, success: true });
});

/**
 * DELETE /content/calendar/:id
 * Remove entrada do calendário
 */
contentRoutes.delete('/calendar/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');

  const result = await db.delete(contentCalendar).where(eq(contentCalendar.id, id)).returning();

  if (result.length === 0) {
    return c.json({ error: 'Calendar entry not found' }, 404);
  }

  console.log(`✅ [D1] Content Calendar entry deleted: ${id}`);
  return c.json({ success: true });
});

/**
 * DELETE /content/calendar/profile/:profileId
 * Remove todas as entradas do calendário de um perfil
 */
contentRoutes.delete('/calendar/profile/:profileId', async (c) => {
  const db = c.get('db');
  const profileId = c.req.param('profileId');

  const result = await db
    .delete(contentCalendar)
    .where(eq(contentCalendar.profile_id, profileId))
    .returning();

  console.log(`✅ [D1] Content Calendar cleared for profile: ${profileId} (${result.length} entries)`);
  return c.json({ success: true, deleted: result.length });
});
