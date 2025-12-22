// Utility para sincronizar dados do D1 para o Supabase
// Usado após cada mutação no D1 para manter os bancos espelhados

import { createClient, SupabaseClient } from '@supabase/supabase-js';

type SyncOperation = 'INSERT' | 'UPDATE' | 'DELETE';
type TableName = 'users' | 'sites' | 'user_products';

interface SyncResult {
  success: boolean;
  error?: string;
}

// Cache do cliente Supabase (criado sob demanda)
let supabaseClient: SupabaseClient | null = null;

/**
 * Obtém ou cria o cliente Supabase com service_role key
 * Service role é necessário para bypass RLS
 */
function getSupabaseClient(env: {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}): SupabaseClient | null {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('⚠️ [SYNC] Supabase credentials not configured');
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseClient;
}

/**
 * Sincroniza uma operação do D1 para o Supabase
 * Esta função é assíncrona e não deve bloquear a resposta da API
 */
export async function syncToSupabase(
  env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string },
  table: TableName,
  operation: SyncOperation,
  data: Record<string, any>,
  identifier?: { field: string; value: string | number }
): Promise<SyncResult> {
  const supabase = getSupabaseClient(env);

  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    console.log(`🔄 [SYNC → SUPABASE] ${table}.${operation}`);

    switch (operation) {
      case 'INSERT': {
        const { error } = await supabase.from(table).insert(prepareDataForSupabase(table, data));

        if (error) {
          // Se já existe, tenta upsert
          if (error.code === '23505') {
            console.log(`⚠️ [SYNC] Record already exists, trying upsert...`);
            return syncToSupabase(env, table, 'UPDATE', data, identifier);
          }
          throw error;
        }
        break;
      }

      case 'UPDATE': {
        if (!identifier) {
          // Determina o identificador baseado na tabela
          identifier = getDefaultIdentifier(table, data);
        }

        if (!identifier) {
          throw new Error('No identifier provided for UPDATE');
        }

        const updateData = prepareDataForSupabase(table, data);
        // Remove o campo identificador do update
        delete updateData[identifier.field];

        const { error } = await supabase
          .from(table)
          .update(updateData)
          .eq(identifier.field, identifier.value);

        if (error) throw error;
        break;
      }

      case 'DELETE': {
        if (!identifier) {
          identifier = getDefaultIdentifier(table, data);
        }

        if (!identifier) {
          throw new Error('No identifier provided for DELETE');
        }

        const { error } = await supabase.from(table).delete().eq(identifier.field, identifier.value);

        if (error) throw error;
        break;
      }
    }

    console.log(`✅ [SYNC → SUPABASE] ${table}.${operation} completed`);
    return { success: true };
  } catch (error: any) {
    console.error(`❌ [SYNC → SUPABASE] ${table}.${operation} failed:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Prepara os dados para inserção no Supabase
 * Converte formatos e remove campos não necessários
 */
function prepareDataForSupabase(table: TableName, data: Record<string, any>): Record<string, any> {
  const prepared = { ...data };

  // Adiciona updated_at se não existir
  if (!prepared.updated_at) {
    prepared.updated_at = new Date().toISOString();
  }

  // Converte settings de string para JSON se necessário (Supabase usa JSONB)
  if (table === 'sites' && prepared.settings && typeof prepared.settings === 'string') {
    try {
      prepared.settings = JSON.parse(prepared.settings);
    } catch {
      // Mantém como string se não for JSON válido
    }
  }

  // Remove campos que não devem ser sincronizados
  delete prepared._sync_source;

  return prepared;
}

/**
 * Determina o identificador padrão para cada tabela
 */
function getDefaultIdentifier(
  table: TableName,
  data: Record<string, any>
): { field: string; value: string | number } | null {
  switch (table) {
    case 'users':
      if (data.uuid) return { field: 'uuid', value: data.uuid };
      if (data.email) return { field: 'email', value: data.email };
      break;
    case 'sites':
      if (data.id) return { field: 'id', value: data.id };
      if (data.slug) return { field: 'slug', value: data.slug };
      break;
    case 'user_products':
      if (data.id) return { field: 'id', value: data.id };
      break;
  }
  return null;
}

/**
 * Wrapper para sync de usuário
 */
export async function syncUserToSupabase(
  env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string },
  operation: SyncOperation,
  userData: Record<string, any>
): Promise<SyncResult> {
  return syncToSupabase(env, 'users', operation, userData, userData.uuid ? { field: 'uuid', value: userData.uuid } : undefined);
}

/**
 * Wrapper para sync de site
 */
export async function syncSiteToSupabase(
  env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string },
  operation: SyncOperation,
  siteData: Record<string, any>
): Promise<SyncResult> {
  return syncToSupabase(env, 'sites', operation, siteData, siteData.id ? { field: 'id', value: siteData.id } : undefined);
}

/**
 * Wrapper para sync de produto
 */
export async function syncProductToSupabase(
  env: { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string },
  operation: SyncOperation,
  productData: Record<string, any>
): Promise<SyncResult> {
  return syncToSupabase(env, 'user_products', operation, productData, productData.id ? { field: 'id', value: productData.id } : undefined);
}
