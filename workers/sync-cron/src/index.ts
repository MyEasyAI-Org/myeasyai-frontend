/**
 * MyEasyAI Sync Cron Worker
 *
 * Worker de reconciliação periódica entre Supabase e Cloudflare D1.
 * Roda a cada 5 minutos para garantir consistência mesmo quando o frontend está offline.
 *
 * Estratégia:
 * 1. Busca registros modificados nos últimos N minutos de ambos os bancos
 * 2. Compara timestamps de updated_at
 * 3. Sincroniza o registro mais recente para o banco desatualizado
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Types
interface Env {
  DB: D1Database;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SYNC_WINDOW_MINUTES: string;
  ENVIRONMENT: string;
}

type TableName = 'users' | 'sites' | 'user_products';

interface SyncStats {
  table: string;
  supabaseToD1: number;
  d1ToSupabase: number;
  errors: number;
}

interface RecordWithTimestamp {
  uuid?: string;
  id?: number | string;
  updated_at?: string;
  [key: string]: any;
}

// Helper to get Supabase client
function getSupabaseClient(env: Env): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Get unique identifier for a record based on table
function getRecordKey(table: TableName, record: RecordWithTimestamp): string | null {
  switch (table) {
    case 'users':
      return record.uuid || null;
    case 'sites':
      return record.id?.toString() || record.slug || null;
    case 'user_products':
      return record.id?.toString() || null;
    default:
      return record.id?.toString() || record.uuid || null;
  }
}

// Compare timestamps and return which is newer (1 = first, -1 = second, 0 = equal)
function compareTimestamps(ts1?: string, ts2?: string): number {
  if (!ts1 && !ts2) return 0;
  if (!ts1) return -1;
  if (!ts2) return 1;

  const d1 = new Date(ts1).getTime();
  const d2 = new Date(ts2).getTime();

  if (d1 > d2) return 1;
  if (d1 < d2) return -1;
  return 0;
}

// Fetch recently modified records from Supabase
async function fetchSupabaseRecords(
  supabase: SupabaseClient,
  table: TableName,
  cutoffDate: string
): Promise<RecordWithTimestamp[]> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .gte('updated_at', cutoffDate);

  if (error) {
    console.error(`❌ [CRON] Error fetching from Supabase ${table}:`, error.message);
    return [];
  }

  return data || [];
}

// Fetch recently modified records from D1
async function fetchD1Records(
  db: D1Database,
  table: TableName,
  cutoffDate: string
): Promise<RecordWithTimestamp[]> {
  try {
    const result = await db
      .prepare(`SELECT * FROM ${table} WHERE updated_at >= ?`)
      .bind(cutoffDate)
      .all();

    return (result.results as RecordWithTimestamp[]) || [];
  } catch (error) {
    console.error(`❌ [CRON] Error fetching from D1 ${table}:`, error);
    return [];
  }
}

// Upsert record to D1
async function upsertToD1(
  db: D1Database,
  table: TableName,
  record: RecordWithTimestamp
): Promise<boolean> {
  try {
    switch (table) {
      case 'users':
        await db
          .prepare(
            `INSERT INTO users (uuid, email, name, preferred_name, avatar_url, mobile_phone, country, postal_code, address, preferred_language, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(uuid) DO UPDATE SET
               email = excluded.email,
               name = excluded.name,
               preferred_name = excluded.preferred_name,
               avatar_url = excluded.avatar_url,
               mobile_phone = excluded.mobile_phone,
               country = excluded.country,
               postal_code = excluded.postal_code,
               address = excluded.address,
               preferred_language = excluded.preferred_language,
               updated_at = excluded.updated_at`
          )
          .bind(
            record.uuid,
            record.email,
            record.name,
            record.preferred_name,
            record.avatar_url,
            record.mobile_phone,
            record.country,
            record.postal_code,
            record.address,
            record.preferred_language,
            record.updated_at || new Date().toISOString()
          )
          .run();
        return true;

      case 'sites':
        const settings =
          typeof record.settings === 'object'
            ? JSON.stringify(record.settings)
            : record.settings;
        await db
          .prepare(
            `INSERT INTO sites (id, user_uuid, slug, name, description, business_type, status, settings, updated_at, published_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
               user_uuid = excluded.user_uuid,
               slug = excluded.slug,
               name = excluded.name,
               description = excluded.description,
               business_type = excluded.business_type,
               status = excluded.status,
               settings = excluded.settings,
               updated_at = excluded.updated_at,
               published_at = excluded.published_at`
          )
          .bind(
            record.id,
            record.user_uuid,
            record.slug,
            record.name,
            record.description,
            record.business_type,
            record.status,
            settings,
            record.updated_at || new Date().toISOString(),
            record.published_at
          )
          .run();
        return true;

      case 'user_products':
        const metadata =
          typeof record.metadata === 'object'
            ? JSON.stringify(record.metadata)
            : record.metadata;
        await db
          .prepare(
            `INSERT INTO user_products (id, user_uuid, product_id, product_type, status, metadata, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
               user_uuid = excluded.user_uuid,
               product_id = excluded.product_id,
               product_type = excluded.product_type,
               status = excluded.status,
               metadata = excluded.metadata,
               updated_at = excluded.updated_at`
          )
          .bind(
            record.id,
            record.user_uuid,
            record.product_id,
            record.product_type,
            record.status,
            metadata,
            record.updated_at || new Date().toISOString()
          )
          .run();
        return true;

      default:
        return false;
    }
  } catch (error) {
    console.error(`❌ [CRON] Error upserting to D1 ${table}:`, error);
    return false;
  }
}

// Upsert record to Supabase
async function upsertToSupabase(
  supabase: SupabaseClient,
  table: TableName,
  record: RecordWithTimestamp
): Promise<boolean> {
  try {
    // Parse JSON fields if they're strings
    const processedRecord = { ...record };

    if (table === 'sites' && typeof processedRecord.settings === 'string') {
      try {
        processedRecord.settings = JSON.parse(processedRecord.settings);
      } catch {
        // Keep as string if not valid JSON
      }
    }

    if (table === 'user_products' && typeof processedRecord.metadata === 'string') {
      try {
        processedRecord.metadata = JSON.parse(processedRecord.metadata);
      } catch {
        // Keep as string if not valid JSON
      }
    }

    const { error } = await supabase.from(table).upsert(processedRecord, {
      onConflict: table === 'users' ? 'uuid' : 'id',
    });

    if (error) {
      console.error(`❌ [CRON] Error upserting to Supabase ${table}:`, error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`❌ [CRON] Error upserting to Supabase ${table}:`, error);
    return false;
  }
}

// Reconcile a single table
async function reconcileTable(
  env: Env,
  supabase: SupabaseClient,
  table: TableName,
  cutoffDate: string
): Promise<SyncStats> {
  const stats: SyncStats = {
    table,
    supabaseToD1: 0,
    d1ToSupabase: 0,
    errors: 0,
  };

  console.log(`🔄 [CRON] Reconciling table: ${table}`);

  // Fetch records from both databases
  const [supabaseRecords, d1Records] = await Promise.all([
    fetchSupabaseRecords(supabase, table, cutoffDate),
    fetchD1Records(env.DB, table, cutoffDate),
  ]);

  console.log(
    `📊 [CRON] ${table}: ${supabaseRecords.length} Supabase records, ${d1Records.length} D1 records`
  );

  // Create maps for easy lookup
  const supabaseMap = new Map<string, RecordWithTimestamp>();
  const d1Map = new Map<string, RecordWithTimestamp>();

  for (const record of supabaseRecords) {
    const key = getRecordKey(table, record);
    if (key) supabaseMap.set(key, record);
  }

  for (const record of d1Records) {
    const key = getRecordKey(table, record);
    if (key) d1Map.set(key, record);
  }

  // Get all unique keys
  const allKeys = new Set([...supabaseMap.keys(), ...d1Map.keys()]);

  // Compare and sync each record
  for (const key of allKeys) {
    const supabaseRecord = supabaseMap.get(key);
    const d1Record = d1Map.get(key);

    if (supabaseRecord && !d1Record) {
      // Record exists only in Supabase -> sync to D1
      const success = await upsertToD1(env.DB, table, supabaseRecord);
      if (success) {
        stats.supabaseToD1++;
        console.log(`➡️ [CRON] ${table}:${key} synced Supabase → D1`);
      } else {
        stats.errors++;
      }
    } else if (d1Record && !supabaseRecord) {
      // Record exists only in D1 -> sync to Supabase
      const success = await upsertToSupabase(supabase, table, d1Record);
      if (success) {
        stats.d1ToSupabase++;
        console.log(`⬅️ [CRON] ${table}:${key} synced D1 → Supabase`);
      } else {
        stats.errors++;
      }
    } else if (supabaseRecord && d1Record) {
      // Record exists in both -> sync the newer one
      const comparison = compareTimestamps(
        supabaseRecord.updated_at,
        d1Record.updated_at
      );

      if (comparison > 0) {
        // Supabase is newer -> sync to D1
        const success = await upsertToD1(env.DB, table, supabaseRecord);
        if (success) {
          stats.supabaseToD1++;
          console.log(`➡️ [CRON] ${table}:${key} synced Supabase → D1 (newer)`);
        } else {
          stats.errors++;
        }
      } else if (comparison < 0) {
        // D1 is newer -> sync to Supabase
        const success = await upsertToSupabase(supabase, table, d1Record);
        if (success) {
          stats.d1ToSupabase++;
          console.log(`⬅️ [CRON] ${table}:${key} synced D1 → Supabase (newer)`);
        } else {
          stats.errors++;
        }
      }
      // If equal, no sync needed
    }
  }

  return stats;
}

// Main reconciliation function
async function reconcileAllTables(env: Env): Promise<SyncStats[]> {
  const supabase = getSupabaseClient(env);
  const syncWindowMinutes = parseInt(env.SYNC_WINDOW_MINUTES || '10', 10);
  const cutoffDate = new Date(Date.now() - syncWindowMinutes * 60 * 1000).toISOString();

  console.log(`🕐 [CRON] Sync window: last ${syncWindowMinutes} minutes (since ${cutoffDate})`);

  const tables: TableName[] = ['users', 'sites', 'user_products'];
  const allStats: SyncStats[] = [];

  for (const table of tables) {
    const stats = await reconcileTable(env, supabase, table, cutoffDate);
    allStats.push(stats);
  }

  return allStats;
}

// Cloudflare Worker export
export default {
  // Scheduled handler (Cron trigger)
  async scheduled(
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    console.log('========================================');
    console.log(`🔄 [CRON] Database reconciliation started`);
    console.log(`🕐 [CRON] Trigger time: ${new Date(event.scheduledTime).toISOString()}`);
    console.log(`🌍 [CRON] Environment: ${env.ENVIRONMENT}`);
    console.log('========================================');

    try {
      const stats = await reconcileAllTables(env);

      // Log summary
      console.log('========================================');
      console.log('📊 [CRON] Reconciliation Summary:');
      let totalSynced = 0;
      let totalErrors = 0;

      for (const stat of stats) {
        console.log(
          `   ${stat.table}: ${stat.supabaseToD1} Supabase→D1, ${stat.d1ToSupabase} D1→Supabase, ${stat.errors} errors`
        );
        totalSynced += stat.supabaseToD1 + stat.d1ToSupabase;
        totalErrors += stat.errors;
      }

      console.log(`   Total: ${totalSynced} records synced, ${totalErrors} errors`);
      console.log('✅ [CRON] Database reconciliation complete');
      console.log('========================================');
    } catch (error) {
      console.error('❌ [CRON] Reconciliation failed:', error);
      throw error;
    }
  },

  // HTTP handler for manual trigger (useful for testing)
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === '/health') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          service: 'myeasyai-sync-cron',
          environment: env.ENVIRONMENT,
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Manual sync trigger (for testing)
    if (url.pathname === '/trigger' && request.method === 'POST') {
      // Basic auth check (in production, use proper authentication)
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response('Unauthorized', { status: 401 });
      }

      console.log('🔄 [CRON] Manual trigger received');

      try {
        const stats = await reconcileAllTables(env);
        return new Response(
          JSON.stringify({
            success: true,
            stats,
            timestamp: new Date().toISOString(),
          }),
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};
