// Sync Routes - Sincronização bidirecional D1 ↔ Supabase
// Endpoint para reconciliação manual e verificação de consistência

import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { users, sites, userProducts } from '../db/schema';
import type { Env, Variables } from '../index';

export const syncRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * GET /sync/status
 * Retorna status de sincronização entre D1 e Supabase
 */
syncRoutes.get('/status', async (c) => {
  const db = c.get('db');
  const supabase = getSupabaseClient(c.env);

  if (!supabase) {
    return c.json({ error: 'Supabase not configured' }, 500);
  }

  try {
    // Contar registros em D1
    const d1Users = await db.select().from(users);
    const d1Sites = await db.select().from(sites);

    // Contar registros em Supabase
    const { count: supabaseUsersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: supbaseSitesCount } = await supabase
      .from('sites')
      .select('*', { count: 'exact', head: true });

    return c.json({
      status: 'ok',
      d1: {
        users: d1Users.length,
        sites: d1Sites.length,
      },
      supabase: {
        users: supabaseUsersCount || 0,
        sites: supbaseSitesCount || 0,
      },
      inSync: {
        users: d1Users.length === (supabaseUsersCount || 0),
        sites: d1Sites.length === (supbaseSitesCount || 0),
      },
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /sync/d1-to-supabase
 * Sincroniza todos os dados do D1 para o Supabase
 * D1 é a fonte da verdade
 */
syncRoutes.post('/d1-to-supabase', async (c) => {
  const db = c.get('db');
  const supabase = getSupabaseClient(c.env);

  if (!supabase) {
    return c.json({ error: 'Supabase not configured' }, 500);
  }

  const results = {
    users: { synced: 0, errors: 0, details: [] as string[] },
    sites: { synced: 0, errors: 0, details: [] as string[] },
  };

  try {
    // 1. Sincronizar usuários
    const d1Users = await db.select().from(users);
    console.log(`🔄 [SYNC] Syncing ${d1Users.length} users from D1 to Supabase`);

    for (const user of d1Users) {
      try {
        // Upsert no Supabase (insert or update on conflict)
        const { error } = await supabase
          .from('users')
          .upsert({
            uuid: user.uuid,
            email: user.email,
            name: user.name,
            preferred_name: user.preferred_name,
            mobile_phone: user.mobile_phone,
            country: user.country,
            postal_code: user.postal_code,
            address: user.address,
            avatar_url: user.avatar_url,
            preferred_language: user.preferred_language || 'pt',
            subscription_plan: user.subscription_plan || 'individual',
            subscription_status: user.subscription_status || 'active',
            created_at: user.created_at,
            last_online: user.last_online,
          }, {
            onConflict: 'uuid',
          });

        if (error) {
          // Se conflito por email, tenta atualizar por email
          if (error.code === '23505') {
            const { error: updateError } = await supabase
              .from('users')
              .update({
                uuid: user.uuid,
                name: user.name,
                preferred_name: user.preferred_name,
                mobile_phone: user.mobile_phone,
                country: user.country,
                postal_code: user.postal_code,
                address: user.address,
                avatar_url: user.avatar_url,
                preferred_language: user.preferred_language || 'pt',
                subscription_plan: user.subscription_plan || 'individual',
                subscription_status: user.subscription_status || 'active',
                last_online: user.last_online,
              })
              .eq('email', user.email);

            if (updateError) {
              throw updateError;
            }
          } else {
            throw error;
          }
        }

        results.users.synced++;
        console.log(`✅ [SYNC] User synced: ${user.email}`);
      } catch (err: any) {
        results.users.errors++;
        results.users.details.push(`${user.email}: ${err.message}`);
        console.error(`❌ [SYNC] User error: ${user.email}`, err.message);
      }
    }

    // 2. Sincronizar sites
    const d1Sites = await db.select().from(sites);
    console.log(`🔄 [SYNC] Syncing ${d1Sites.length} sites from D1 to Supabase`);

    for (const site of d1Sites) {
      try {
        const { error } = await supabase
          .from('sites')
          .upsert({
            id: site.id,
            user_uuid: site.user_uuid,
            slug: site.slug,
            name: site.name,
            description: site.description,
            business_type: site.business_type,
            status: site.status || 'building',
            settings: site.settings,
            created_at: site.created_at,
            updated_at: site.updated_at || new Date().toISOString(),
            published_at: site.published_at,
          }, {
            onConflict: 'id',
          });

        if (error) {
          // Se conflito por slug, tenta atualizar por slug
          if (error.code === '23505') {
            const { error: updateError } = await supabase
              .from('sites')
              .update({
                user_uuid: site.user_uuid,
                name: site.name,
                description: site.description,
                business_type: site.business_type,
                status: site.status || 'building',
                settings: site.settings,
                updated_at: new Date().toISOString(),
                published_at: site.published_at,
              })
              .eq('slug', site.slug);

            if (updateError) {
              throw updateError;
            }
          } else {
            throw error;
          }
        }

        results.sites.synced++;
        console.log(`✅ [SYNC] Site synced: ${site.slug}`);
      } catch (err: any) {
        results.sites.errors++;
        results.sites.details.push(`${site.slug}: ${err.message}`);
        console.error(`❌ [SYNC] Site error: ${site.slug}`, err.message);
      }
    }

    return c.json({
      success: true,
      message: 'Sync completed',
      results,
    });
  } catch (error: any) {
    console.error('❌ [SYNC] Fatal error:', error);
    return c.json({ error: error.message, results }, 500);
  }
});

/**
 * POST /sync/supabase-to-d1
 * Sincroniza todos os dados do Supabase para o D1
 * Supabase é a fonte da verdade neste caso
 */
syncRoutes.post('/supabase-to-d1', async (c) => {
  const db = c.get('db');
  const supabase = getSupabaseClient(c.env);

  if (!supabase) {
    return c.json({ error: 'Supabase not configured' }, 500);
  }

  const results = {
    users: { synced: 0, errors: 0, details: [] as string[] },
    sites: { synced: 0, errors: 0, details: [] as string[] },
  };

  try {
    // 1. Sincronizar usuários do Supabase para D1
    const { data: supabaseUsers, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      throw usersError;
    }

    console.log(`🔄 [SYNC] Syncing ${supabaseUsers?.length || 0} users from Supabase to D1`);

    for (const user of supabaseUsers || []) {
      try {
        await db
          .insert(users)
          .values({
            uuid: user.uuid,
            email: user.email,
            name: user.name,
            preferred_name: user.preferred_name,
            mobile_phone: user.mobile_phone,
            country: user.country,
            postal_code: user.postal_code,
            address: user.address,
            avatar_url: user.avatar_url,
            preferred_language: user.preferred_language || 'pt',
            subscription_plan: user.subscription_plan || 'individual',
            subscription_status: user.subscription_status || 'active',
            created_at: user.created_at,
            last_online: user.last_online,
          })
          .onConflictDoUpdate({
            target: users.email,
            set: {
              uuid: user.uuid,
              name: user.name,
              preferred_name: user.preferred_name,
              mobile_phone: user.mobile_phone,
              country: user.country,
              postal_code: user.postal_code,
              address: user.address,
              avatar_url: user.avatar_url,
              preferred_language: user.preferred_language || 'pt',
              subscription_plan: user.subscription_plan || 'individual',
              subscription_status: user.subscription_status || 'active',
              last_online: user.last_online,
            },
          });

        results.users.synced++;
        console.log(`✅ [SYNC] User synced to D1: ${user.email}`);
      } catch (err: any) {
        results.users.errors++;
        results.users.details.push(`${user.email}: ${err.message}`);
        console.error(`❌ [SYNC] User error: ${user.email}`, err.message);
      }
    }

    // 2. Sincronizar sites do Supabase para D1
    const { data: supabaseSites, error: sitesError } = await supabase
      .from('sites')
      .select('*');

    if (sitesError) {
      throw sitesError;
    }

    console.log(`🔄 [SYNC] Syncing ${supabaseSites?.length || 0} sites from Supabase to D1`);

    for (const site of supabaseSites || []) {
      try {
        await db
          .insert(sites)
          .values({
            user_uuid: site.user_uuid,
            slug: site.slug,
            name: site.name,
            description: site.description,
            business_type: site.business_type,
            status: site.status || 'building',
            settings: typeof site.settings === 'object' ? JSON.stringify(site.settings) : site.settings,
            created_at: site.created_at,
            updated_at: site.updated_at,
            published_at: site.published_at,
          })
          .onConflictDoUpdate({
            target: sites.slug,
            set: {
              name: site.name,
              description: site.description,
              business_type: site.business_type,
              status: site.status || 'building',
              settings: typeof site.settings === 'object' ? JSON.stringify(site.settings) : site.settings,
              updated_at: site.updated_at,
              published_at: site.published_at,
            },
          });

        results.sites.synced++;
        console.log(`✅ [SYNC] Site synced to D1: ${site.slug}`);
      } catch (err: any) {
        results.sites.errors++;
        results.sites.details.push(`${site.slug}: ${err.message}`);
        console.error(`❌ [SYNC] Site error: ${site.slug}`, err.message);
      }
    }

    return c.json({
      success: true,
      message: 'Sync completed',
      results,
    });
  } catch (error: any) {
    console.error('❌ [SYNC] Fatal error:', error);
    return c.json({ error: error.message, results }, 500);
  }
});

/**
 * DELETE /sync/supabase-users
 * Limpa todos os usuários do Supabase (para re-sync)
 */
syncRoutes.delete('/supabase-users', async (c) => {
  const supabase = getSupabaseClient(c.env);

  if (!supabase) {
    return c.json({ error: 'Supabase not configured' }, 500);
  }

  try {
    // Primeiro, pegar todos os emails
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('email');

    if (fetchError) {
      throw fetchError;
    }

    if (!users || users.length === 0) {
      return c.json({ success: true, message: 'No users to delete', count: 0 });
    }

    // Deletar um por um
    let deleted = 0;
    for (const user of users) {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('email', user.email);

      if (!error) {
        deleted++;
      }
    }

    return c.json({ success: true, message: 'Supabase users deleted', count: deleted });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Helper para criar cliente Supabase
function getSupabaseClient(env: Env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
