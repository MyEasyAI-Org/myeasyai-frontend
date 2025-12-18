// Serviço de sincronização bidirecional Supabase ↔ Cloudflare D1
// Usa Supabase Realtime para detectar mudanças e replicar para D1

import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../lib/api-clients/supabase-client';
import { d1Client } from '../lib/api-clients/d1-client';

type TableName = 'users' | 'sites' | 'user_products';
type EventType = 'INSERT' | 'UPDATE' | 'DELETE';

interface SyncEvent {
  table: TableName;
  eventType: EventType;
  record: any;
  oldRecord?: any;
}

/**
 * Serviço de sincronização de banco de dados
 * - Escuta mudanças no Supabase via Realtime
 * - Replica automaticamente para D1
 * - Previne loops de sincronização
 */
class DatabaseSyncService {
  private channels: RealtimeChannel[] = [];
  private recentlySynced = new Map<string, number>();
  private isInitialized = false;
  private syncEnabled = true;

  // Tempo em ms para considerar um registro como "recentemente sincronizado"
  private readonly SYNC_DEBOUNCE_MS = 5000;

  /**
   * Inicializa as subscriptions do Realtime para todas as tabelas
   */
  initialize(): void {
    if (this.isInitialized) {
      console.log('⚠️ [SYNC] DatabaseSyncService já inicializado');
      return;
    }

    console.log('🔄 [SYNC] Inicializando DatabaseSyncService...');

    // Subscribe em cada tabela
    this.subscribeToTable('users');
    this.subscribeToTable('sites');
    this.subscribeToTable('user_products');

    this.isInitialized = true;
    console.log('✅ [SYNC] DatabaseSyncService inicializado com sucesso');
  }

  /**
   * Cria subscription para uma tabela específica
   */
  private subscribeToTable(table: TableName): void {
    const channel = supabase
      .channel(`db-sync-${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          this.handleDatabaseChange(table, payload);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ [SYNC] Subscrito em mudanças da tabela: ${table}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ [SYNC] Erro ao subscrever tabela: ${table}`);
        }
      });

    this.channels.push(channel);
  }

  /**
   * Processa mudanças recebidas do Supabase Realtime
   */
  private async handleDatabaseChange(
    table: TableName,
    payload: RealtimePostgresChangesPayload<any>
  ): Promise<void> {
    if (!this.syncEnabled) {
      console.log(`⏸️ [SYNC] Sync desabilitado, ignorando evento em ${table}`);
      return;
    }

    const eventType = payload.eventType as EventType;
    const newRecord = payload.new as any;
    const oldRecord = payload.old as any;

    // Determina o ID do registro
    const recordId = this.getRecordId(table, newRecord || oldRecord);

    if (!recordId) {
      console.warn(`⚠️ [SYNC] Não foi possível determinar ID do registro em ${table}`);
      return;
    }

    // Verifica se devemos sincronizar (evita loops)
    if (!this.shouldSync(table, recordId)) {
      console.log(`🔄 [SYNC] Ignorando evento em ${table}:${recordId} (sincronizado recentemente)`);
      return;
    }

    console.log(`📥 [SYNC] Mudança detectada: ${table}.${eventType} - ID: ${recordId}`);

    // Replica para D1
    try {
      await this.replicateToD1({
        table,
        eventType,
        record: newRecord,
        oldRecord,
      });
      console.log(`✅ [SYNC] Replicado para D1: ${table}.${eventType}`);
    } catch (error) {
      console.error(`❌ [SYNC] Erro ao replicar para D1:`, error);
    }
  }

  /**
   * Obtém o ID único do registro baseado na tabela
   */
  private getRecordId(table: TableName, record: any): string | null {
    if (!record) return null;

    switch (table) {
      case 'users':
        return record.uuid || record.email;
      case 'sites':
        return record.id?.toString() || record.slug;
      case 'user_products':
        return record.id?.toString();
      default:
        return record.id?.toString() || record.uuid;
    }
  }

  /**
   * Verifica se devemos sincronizar este registro
   * Retorna false se foi sincronizado recentemente (evita loops)
   */
  private shouldSync(table: TableName, recordId: string): boolean {
    const key = `${table}:${recordId}`;
    const lastSync = this.recentlySynced.get(key);
    const now = Date.now();

    if (lastSync && now - lastSync < this.SYNC_DEBOUNCE_MS) {
      return false;
    }

    // Não marca ainda - será marcado após sync bem-sucedido
    return true;
  }

  /**
   * Marca um registro como sincronizado recentemente
   * Chamado pelos services após operações de escrita
   */
  markAsSynced(table: TableName, recordId: string): void {
    const key = `${table}:${recordId}`;
    this.recentlySynced.set(key, Date.now());

    // Limpa após o tempo de debounce
    setTimeout(() => {
      this.recentlySynced.delete(key);
    }, this.SYNC_DEBOUNCE_MS + 1000);
  }

  /**
   * Replica uma mudança para o Cloudflare D1
   */
  private async replicateToD1(event: SyncEvent): Promise<void> {
    const { table, eventType, record, oldRecord } = event;

    switch (table) {
      case 'users':
        await this.syncUserToD1(eventType, record, oldRecord);
        break;
      case 'sites':
        await this.syncSiteToD1(eventType, record, oldRecord);
        break;
      case 'user_products':
        await this.syncProductToD1(eventType, record, oldRecord);
        break;
    }

    // Marca como sincronizado
    const recordId = this.getRecordId(table, record || oldRecord);
    if (recordId) {
      this.markAsSynced(table, recordId);
    }
  }

  /**
   * Sincroniza usuário para D1
   */
  private async syncUserToD1(
    eventType: EventType,
    record: any,
    oldRecord?: any
  ): Promise<void> {
    switch (eventType) {
      case 'INSERT':
      case 'UPDATE':
        if (record?.uuid) {
          // Usa upsertUser que já trata criação e atualização
          await d1Client.upsertUser({
            uuid: record.uuid,
            email: record.email,
            name: record.name,
            preferred_name: record.preferred_name,
            avatar_url: record.avatar_url,
            mobile_phone: record.mobile_phone,
            country: record.country,
            postal_code: record.postal_code,
            address: record.address,
            preferred_language: record.preferred_language,
          });
        }
        break;

      case 'DELETE':
        if (oldRecord?.uuid) {
          await d1Client.deleteUser(oldRecord.uuid);
        }
        break;
    }
  }

  /**
   * Sincroniza site para D1
   */
  private async syncSiteToD1(
    eventType: EventType,
    record: any,
    oldRecord?: any
  ): Promise<void> {
    switch (eventType) {
      case 'INSERT':
      case 'UPDATE':
        if (record?.slug && record?.user_uuid) {
          // Usa upsertSite que já trata criação e atualização
          await d1Client.upsertSite({
            user_uuid: record.user_uuid,
            slug: record.slug,
            name: record.name || 'Untitled',
            description: record.description,
            business_type: record.business_type,
            status: record.status,
            settings: typeof record.settings === 'object'
              ? JSON.stringify(record.settings)
              : record.settings,
          });
        }
        break;

      case 'DELETE':
        if (oldRecord?.id) {
          await d1Client.deleteSite(oldRecord.id);
        }
        break;
    }
  }

  /**
   * Sincroniza produto para D1
   */
  private async syncProductToD1(
    eventType: EventType,
    record: any,
    oldRecord?: any
  ): Promise<void> {
    switch (eventType) {
      case 'INSERT':
      case 'UPDATE':
        if (record?.user_uuid && record?.product_id) {
          // Usa upsertProduct que já trata criação e atualização
          await d1Client.upsertProduct({
            user_uuid: record.user_uuid,
            product_id: record.product_id,
            product_type: record.product_type,
            status: record.status,
            metadata: typeof record.metadata === 'object'
              ? JSON.stringify(record.metadata)
              : record.metadata,
          });
        }
        break;

      case 'DELETE':
        if (oldRecord?.user_uuid && oldRecord?.product_id) {
          await d1Client.deleteProduct(oldRecord.user_uuid, oldRecord.product_id);
        }
        break;
    }
  }

  /**
   * Habilita/desabilita a sincronização
   */
  setEnabled(enabled: boolean): void {
    this.syncEnabled = enabled;
    console.log(`🔄 [SYNC] Sincronização ${enabled ? 'habilitada' : 'desabilitada'}`);
  }

  /**
   * Retorna se o serviço está inicializado
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Limpa todas as subscriptions
   */
  destroy(): void {
    console.log('🔄 [SYNC] Destruindo DatabaseSyncService...');

    this.channels.forEach((channel) => {
      channel.unsubscribe();
    });

    this.channels = [];
    this.recentlySynced.clear();
    this.isInitialized = false;

    console.log('✅ [SYNC] DatabaseSyncService destruído');
  }
}

// Singleton instance
export const databaseSyncService = new DatabaseSyncService();

// Export class for testing
export { DatabaseSyncService };
