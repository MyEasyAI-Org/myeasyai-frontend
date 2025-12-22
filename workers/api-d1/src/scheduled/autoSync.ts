// Auto Sync - Sincronização automática bidirecional D1 ↔ Supabase
// Executado via Cron Trigger a cada 5 minutos

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema';
import type { Env } from '../index';

/**
 * Executa sincronização automática bidirecional
 * 1. Verifica consistência entre D1 e Supabase
 * 2. Sincroniza registros faltantes em ambas as direções
 * 3. Atualiza registros com dados mais recentes
 */
export async function runAutoSync(env: Env): Promise<void> {
  const supabase = getSupabaseClient(env);

  if (!supabase) {
    console.warn('⚠️ [AUTO-SYNC] Supabase not configured, skipping sync');
    return;
  }

  const db = drizzle(env.DB, { schema });

  console.log('🔄 [AUTO-SYNC] Starting bidirectional sync...');

  try {
    // Sync users
    await syncUsers(db, supabase);

    // Sync sites
    await syncSites(db, supabase);

    console.log('✅ [AUTO-SYNC] Sync completed successfully');
  } catch (error: any) {
    console.error('❌ [AUTO-SYNC] Sync failed:', error.message);
  }
}

/**
 * Sincroniza usuários bidirecionalmente
 */
async function syncUsers(
  db: ReturnType<typeof drizzle>,
  supabase: SupabaseClient
): Promise<void> {
  // 1. Get all users from both databases
  const d1Users = await db.select().from(schema.users);
  const { data: supabaseUsers, error } = await supabase.from('users').select('*');

  if (error) {
    console.error('❌ [AUTO-SYNC] Failed to fetch Supabase users:', error.message);
    return;
  }

  const d1Map = new Map(d1Users.map(u => [u.email, u]));
  const supabaseMap = new Map((supabaseUsers || []).map(u => [u.email, u]));

  let synced = { d1ToSupabase: 0, supabaseToD1: 0, updated: 0 };

  // 2. D1 → Supabase: registros que existem no D1 mas não no Supabase
  for (const [email, d1User] of d1Map) {
    const supabaseUser = supabaseMap.get(email);

    if (!supabaseUser) {
      // Criar no Supabase
      const { error: insertError } = await supabase.from('users').insert({
        uuid: d1User.uuid,
        email: d1User.email,
        name: d1User.name,
        preferred_name: d1User.preferred_name,
        mobile_phone: d1User.mobile_phone,
        country: d1User.country,
        postal_code: d1User.postal_code,
        address: d1User.address,
        avatar_url: d1User.avatar_url,
        preferred_language: d1User.preferred_language || 'pt',
        subscription_plan: d1User.subscription_plan || 'individual',
        subscription_status: d1User.subscription_status || 'active',
        created_at: d1User.created_at,
        last_online: d1User.last_online,
      });

      if (!insertError) {
        synced.d1ToSupabase++;
        console.log(`✅ [AUTO-SYNC] User created in Supabase: ${email}`);
      }
    } else {
      // Verificar se precisa atualizar (D1 é a fonte primária)
      const d1LastOnline = new Date(d1User.last_online || 0).getTime();
      const supabaseLastOnline = new Date(supabaseUser.last_online || 0).getTime();

      if (d1LastOnline > supabaseLastOnline) {
        // D1 tem dados mais recentes, atualizar Supabase
        const { error: updateError } = await supabase
          .from('users')
          .update({
            uuid: d1User.uuid,
            name: d1User.name,
            preferred_name: d1User.preferred_name,
            mobile_phone: d1User.mobile_phone,
            country: d1User.country,
            postal_code: d1User.postal_code,
            address: d1User.address,
            avatar_url: d1User.avatar_url,
            preferred_language: d1User.preferred_language,
            subscription_plan: d1User.subscription_plan,
            subscription_status: d1User.subscription_status,
            last_online: d1User.last_online,
          })
          .eq('email', email);

        if (!updateError) {
          synced.updated++;
        }
      }
    }
  }

  // 3. Supabase → D1: registros que existem no Supabase mas não no D1
  for (const [email, supabaseUser] of supabaseMap) {
    if (!d1Map.has(email)) {
      // Criar no D1
      try {
        await db.insert(schema.users).values({
          uuid: supabaseUser.uuid,
          email: supabaseUser.email,
          name: supabaseUser.name,
          preferred_name: supabaseUser.preferred_name,
          mobile_phone: supabaseUser.mobile_phone,
          country: supabaseUser.country,
          postal_code: supabaseUser.postal_code,
          address: supabaseUser.address,
          avatar_url: supabaseUser.avatar_url,
          preferred_language: supabaseUser.preferred_language || 'pt',
          subscription_plan: supabaseUser.subscription_plan || 'individual',
          subscription_status: supabaseUser.subscription_status || 'active',
          created_at: supabaseUser.created_at,
          last_online: supabaseUser.last_online,
        });

        synced.supabaseToD1++;
        console.log(`✅ [AUTO-SYNC] User created in D1: ${email}`);
      } catch (err: any) {
        console.error(`❌ [AUTO-SYNC] Failed to create user in D1: ${email}`, err.message);
      }
    }
  }

  console.log(`📊 [AUTO-SYNC] Users: D1→Supabase=${synced.d1ToSupabase}, Supabase→D1=${synced.supabaseToD1}, Updated=${synced.updated}`);
}

/**
 * Sincroniza sites bidirecionalmente
 */
async function syncSites(
  db: ReturnType<typeof drizzle>,
  supabase: SupabaseClient
): Promise<void> {
  // 1. Get all sites from both databases
  const d1Sites = await db.select().from(schema.sites);
  const { data: supabaseSites, error } = await supabase.from('sites').select('*');

  if (error) {
    console.error('❌ [AUTO-SYNC] Failed to fetch Supabase sites:', error.message);
    return;
  }

  const d1Map = new Map(d1Sites.map(s => [s.slug, s]));
  const supabaseMap = new Map((supabaseSites || []).map(s => [s.slug, s]));

  let synced = { d1ToSupabase: 0, supabaseToD1: 0, updated: 0 };

  // 2. D1 → Supabase
  for (const [slug, d1Site] of d1Map) {
    const supabaseSite = supabaseMap.get(slug);

    if (!supabaseSite) {
      // Criar no Supabase
      const { error: insertError } = await supabase.from('sites').insert({
        id: d1Site.id,
        user_uuid: d1Site.user_uuid,
        slug: d1Site.slug,
        name: d1Site.name,
        description: d1Site.description,
        business_type: d1Site.business_type,
        status: d1Site.status || 'building',
        settings: d1Site.settings,
        created_at: d1Site.created_at,
        updated_at: d1Site.updated_at,
        published_at: d1Site.published_at,
      });

      if (!insertError) {
        synced.d1ToSupabase++;
        console.log(`✅ [AUTO-SYNC] Site created in Supabase: ${slug}`);
      }
    } else {
      // Verificar se precisa atualizar
      const d1Updated = new Date(d1Site.updated_at || 0).getTime();
      const supabaseUpdated = new Date(supabaseSite.updated_at || 0).getTime();

      if (d1Updated > supabaseUpdated) {
        const { error: updateError } = await supabase
          .from('sites')
          .update({
            name: d1Site.name,
            description: d1Site.description,
            business_type: d1Site.business_type,
            status: d1Site.status,
            settings: d1Site.settings,
            updated_at: d1Site.updated_at,
            published_at: d1Site.published_at,
          })
          .eq('slug', slug);

        if (!updateError) {
          synced.updated++;
        }
      }
    }
  }

  // 3. Supabase → D1
  for (const [slug, supabaseSite] of supabaseMap) {
    if (!d1Map.has(slug)) {
      try {
        await db.insert(schema.sites).values({
          user_uuid: supabaseSite.user_uuid,
          slug: supabaseSite.slug,
          name: supabaseSite.name,
          description: supabaseSite.description,
          business_type: supabaseSite.business_type,
          status: supabaseSite.status || 'building',
          settings: typeof supabaseSite.settings === 'object'
            ? JSON.stringify(supabaseSite.settings)
            : supabaseSite.settings,
          created_at: supabaseSite.created_at,
          updated_at: supabaseSite.updated_at,
          published_at: supabaseSite.published_at,
        });

        synced.supabaseToD1++;
        console.log(`✅ [AUTO-SYNC] Site created in D1: ${slug}`);
      } catch (err: any) {
        console.error(`❌ [AUTO-SYNC] Failed to create site in D1: ${slug}`, err.message);
      }
    }
  }

  console.log(`📊 [AUTO-SYNC] Sites: D1→Supabase=${synced.d1ToSupabase}, Supabase→D1=${synced.supabaseToD1}, Updated=${synced.updated}`);
}

// Helper para criar cliente Supabase
function getSupabaseClient(env: Env): SupabaseClient | null {
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
