// Health Check Routes
// Endpoints para monitoramento, verificação de status e sync manual

import { Hono } from 'hono';
import { sql, eq } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';
import { users, type NewUser } from '../db/schema';
import type { Env, Variables } from '../index';

// Env estendido para sync
interface HealthEnv extends Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

export const healthRoutes = new Hono<{ Bindings: HealthEnv; Variables: Variables }>();

/**
 * GET /health
 * Health check básico
 */
healthRoutes.get('/', async (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT,
  });
});

/**
 * GET /health/db
 * Verifica conexão com D1
 */
healthRoutes.get('/db', async (c) => {
  const db = c.get('db');

  try {
    // Query simples para verificar conexão
    await db.run(sql`SELECT 1 as test`);

    return c.json({
      status: 'healthy',
      database: 'd1',
      connection: 'ok',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Database health check failed:', error);

    return c.json(
      {
        status: 'unhealthy',
        database: 'd1',
        connection: 'failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      503
    );
  }
});

/**
 * GET /health/detailed
 * Health check detalhado com métricas
 */
healthRoutes.get('/detailed', async (c) => {
  const db = c.get('db');

  let dbStatus = 'unknown';
  let tableStats: Record<string, number> = {};

  try {
    // Verificar conexão
    await db.run(sql`SELECT 1`);
    dbStatus = 'connected';

    // Contar registros em cada tabela
    const usersCount = await db.run(sql`SELECT COUNT(*) as count FROM users`);
    const productsCount = await db.run(sql`SELECT COUNT(*) as count FROM user_products`);
    const sitesCount = await db.run(sql`SELECT COUNT(*) as count FROM sites`);

    tableStats = {
      users: (usersCount.results[0] as any)?.count || 0,
      user_products: (productsCount.results[0] as any)?.count || 0,
      sites: (sitesCount.results[0] as any)?.count || 0,
    };
  } catch (error: any) {
    dbStatus = `error: ${error.message}`;
  }

  return c.json({
    status: dbStatus === 'connected' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT,
    services: {
      database: {
        type: 'd1',
        status: dbStatus,
        tables: tableStats,
      },
      api: {
        status: 'running',
        version: '1.0.0',
      },
    },
  });
});

/**
 * GET /health/ping
 * Ping simples (para load balancers)
 */
healthRoutes.get('/ping', (c) => {
  return c.text('pong');
});

/**
 * POST /health/sync
 * Sincronização bidirecional COMPLETA entre D1 e Supabase
 * Sincroniza TODAS as tabelas: users, sites, user_products, pricing_*, crm_*, etc.
 */
healthRoutes.post('/sync', async (c) => {
  const db = c.get('db');

  if (!c.env.SUPABASE_URL || !c.env.SUPABASE_SERVICE_ROLE_KEY) {
    return c.json({
      error: 'Supabase credentials not configured',
      debug: {
        supabase_url: c.env.SUPABASE_URL ? 'set' : 'missing',
        service_role_key: c.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'missing',
      }
    }, 500);
  }

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Configuração das tabelas a sincronizar
  // Ordem importa! Tabelas com foreign keys devem vir depois das tabelas referenciadas
  const tables = [
    { name: 'users', idField: 'uuid', keyField: 'email' },
    { name: 'user_products', idField: 'id', keyField: 'id' },
    { name: 'sites', idField: 'id', keyField: 'slug' },
    { name: 'billing_history', idField: 'id', keyField: 'id' },
    { name: 'pricing_stores', idField: 'id', keyField: 'id' },
    { name: 'pricing_products', idField: 'id', keyField: 'id' },
    { name: 'pricing_hidden_costs', idField: 'id', keyField: 'id' },
    { name: 'pricing_indirect_costs', idField: 'id', keyField: 'id' },
    { name: 'pricing_tax_config', idField: 'id', keyField: 'id' },
    { name: 'pricing_tax_items', idField: 'id', keyField: 'id' },
    { name: 'usage_logs', idField: 'id', keyField: 'id' },
    { name: 'crm_companies', idField: 'id', keyField: 'id' },
    { name: 'crm_contacts', idField: 'id', keyField: 'id' },
    { name: 'crm_deals', idField: 'id', keyField: 'id' },
    { name: 'crm_activities', idField: 'id', keyField: 'id' },
    { name: 'crm_tasks', idField: 'id', keyField: 'id' },
    { name: 'crm_deal_metrics', idField: 'id', keyField: 'id' },
  ];

  const results: Record<string, { d1: number; supabase: number; synced_to_d1: number; synced_to_supabase: number; errors: string[] }> = {};

  try {
    for (const table of tables) {
      console.log(`🔄 [SYNC] Processing table: ${table.name}`);

      results[table.name] = { d1: 0, supabase: 0, synced_to_d1: 0, synced_to_supabase: 0, errors: [] };

      // Buscar dados do D1
      const d1Result = await db.run(sql.raw(`SELECT * FROM ${table.name}`));
      const d1Data = d1Result.results as any[];
      results[table.name].d1 = d1Data.length;

      // Buscar dados do Supabase
      const { data: supabaseData, error: sbError } = await supabase
        .from(table.name)
        .select('*');

      if (sbError) {
        results[table.name].errors.push(`Supabase fetch: ${sbError.message}`);
        continue;
      }

      results[table.name].supabase = supabaseData?.length || 0;

      // Criar maps por ID
      const d1Map = new Map(d1Data.map((row) => [String(row[table.idField]), row]));
      const sbMap = new Map((supabaseData || []).map((row: any) => [String(row[table.idField]), row]));

      // Obter colunas existentes no D1 para esta tabela
      const d1ColumnsResult = await db.run(sql.raw(`PRAGMA table_info(${table.name})`));
      const d1Columns = new Set((d1ColumnsResult.results as any[]).map(c => c.name));

      // Supabase → D1
      for (const sbRow of supabaseData || []) {
        const id = String(sbRow[table.idField]);
        const d1Row = d1Map.get(id);

        if (!d1Row) {
          // INSERT: registro não existe no D1
          try {
            const columns = Object.keys(sbRow).filter(k => sbRow[k] !== null && d1Columns.has(k));
            const values = columns.map(k => {
              const val = sbRow[k];
              if (val === null || val === undefined) return 'NULL';
              if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
              if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
              return val;
            });

            if (columns.length > 0) {
              const insertSql = `INSERT INTO ${table.name} (${columns.join(', ')}) VALUES (${values.join(', ')})`;
              const insertResult = await db.run(sql.raw(insertSql));
              if (insertResult.meta?.changes && insertResult.meta.changes > 0) {
                results[table.name].synced_to_d1++;
              }
            }
          } catch (err: any) {
            if (!err.message?.includes('UNIQUE constraint failed')) {
              results[table.name].errors.push(`D1 insert ${id}: ${err.message}`);
            }
          }
        } else {
          // UPDATE: registro existe, atualizar colunas que estão NULL no D1 mas têm valor no Supabase
          try {
            const updates: string[] = [];
            for (const col of Object.keys(sbRow)) {
              if (!d1Columns.has(col)) continue;
              if (col === table.idField) continue;

              const sbVal = sbRow[col];
              const d1Val = d1Row[col];

              // Atualizar se D1 tem NULL e Supabase tem valor
              if ((d1Val === null || d1Val === undefined) && sbVal !== null && sbVal !== undefined) {
                let formattedVal: string;
                if (typeof sbVal === 'string') {
                  formattedVal = `'${sbVal.replace(/'/g, "''")}'`;
                } else if (typeof sbVal === 'object') {
                  formattedVal = `'${JSON.stringify(sbVal).replace(/'/g, "''")}'`;
                } else {
                  formattedVal = String(sbVal);
                }
                updates.push(`${col} = ${formattedVal}`);
              }
            }

            if (updates.length > 0) {
              const updateSql = `UPDATE ${table.name} SET ${updates.join(', ')} WHERE ${table.idField} = '${id}'`;
              await db.run(sql.raw(updateSql));
              results[table.name].synced_to_d1++;
            }
          } catch (err: any) {
            results[table.name].errors.push(`D1 update ${id}: ${err.message}`);
          }
        }
      }

      // D1 → Supabase
      for (const d1Row of d1Data) {
        const id = String(d1Row[table.idField]);
        const sbRow = sbMap.get(id);

        if (!sbRow) {
          // INSERT: registro não existe no Supabase
          try {
            const { error: insertError } = await supabase.from(table.name).insert(d1Row);
            if (insertError && insertError.code !== '23505') {
              results[table.name].errors.push(`Supabase insert ${id}: ${insertError.message}`);
            } else if (!insertError) {
              results[table.name].synced_to_supabase++;
            }
          } catch (err: any) {
            results[table.name].errors.push(`Supabase insert ${id}: ${err.message}`);
          }
        } else {
          // UPDATE: registro existe, atualizar colunas que estão NULL no Supabase mas têm valor no D1
          try {
            const updates: Record<string, any> = {};
            for (const col of Object.keys(d1Row)) {
              if (col === table.idField) continue;

              const d1Val = d1Row[col];
              const sbVal = sbRow[col];

              // Atualizar se Supabase tem NULL e D1 tem valor
              if ((sbVal === null || sbVal === undefined) && d1Val !== null && d1Val !== undefined) {
                updates[col] = d1Val;
              }
            }

            if (Object.keys(updates).length > 0) {
              const { error: updateError } = await supabase
                .from(table.name)
                .update(updates)
                .eq(table.idField, id);

              if (updateError) {
                results[table.name].errors.push(`Supabase update ${id}: ${updateError.message}`);
              } else {
                results[table.name].synced_to_supabase++;
              }
            }
          } catch (err: any) {
            results[table.name].errors.push(`Supabase update ${id}: ${err.message}`);
          }
        }
      }

      console.log(`✅ [SYNC] ${table.name}: D1=${results[table.name].d1}, Supabase=${results[table.name].supabase}, →D1=${results[table.name].synced_to_d1}, →SB=${results[table.name].synced_to_supabase}`);
    }

    return c.json({
      success: true,
      timestamp: new Date().toISOString(),
      tables: results,
    });
  } catch (error: any) {
    console.error('❌ [SYNC] Error:', error);
    return c.json({ error: error.message, tables: results }, 500);
  }
});
