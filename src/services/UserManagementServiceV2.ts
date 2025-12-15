// Serviço de gerenciamento de usuários - V2 com Dual Write
// Cloudflare D1 é PRIMARY, Supabase é SECONDARY (backup)

import { supabase } from '../lib/api-clients/supabase-client';
import { d1Client, type D1User } from '../lib/api-clients/d1-client';

/**
 * Configuração do modo de operação
 * - 'd1-primary': D1 é source of truth, Supabase é backup (PADRÃO)
 * - 'supabase-primary': Supabase é source of truth, D1 é secundário
 * - 'd1-only': Apenas D1 (sem backup no Supabase)
 * - 'supabase-only': Apenas Supabase (modo legado)
 */
type DatabaseMode = 'd1-primary' | 'supabase-primary' | 'd1-only' | 'supabase-only';

// Configuração via env var - PADRÃO É D1 PRIMARY
const DB_MODE: DatabaseMode =
  (import.meta.env.VITE_DATABASE_MODE as DatabaseMode) || 'd1-primary';

/**
 * Resultado padronizado das operações
 */
interface OperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  source?: 'supabase' | 'd1';
}

/**
 * Serviço V2 - Cloudflare D1 como banco principal
 * Supabase é usado apenas como backup/fallback
 */
export class UserManagementServiceV2 {
  private mode: DatabaseMode;

  constructor() {
    this.mode = DB_MODE;
    console.log(`📊 [USER SERVICE V2] Mode: ${this.mode} (D1 = Primary)`);
  }

  /**
   * Verifica se D1 está habilitado no modo atual
   */
  private isD1Enabled(): boolean {
    return (
      d1Client.isEnabled() &&
      (this.mode === 'd1-primary' ||
        this.mode === 'supabase-primary' ||
        this.mode === 'd1-only')
    );
  }

  /**
   * Verifica se Supabase está habilitado no modo atual
   */
  private isSupabaseEnabled(): boolean {
    return (
      this.mode === 'd1-primary' ||
      this.mode === 'supabase-primary' ||
      this.mode === 'supabase-only'
    );
  }

  /**
   * Garante que o usuário existe na tabela users após login social
   * D1 é PRIMARY - escreve primeiro no D1, depois replica para Supabase
   */
  async ensureUserInDatabase(user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      name?: string;
      preferred_name?: string;
      avatar_url?: string;
    };
  }): Promise<OperationResult> {
    if (!user.email) {
      console.warn('⚠️ [ensureUserInDatabase] Email não fornecido');
      return { success: false, error: 'Email não fornecido' };
    }
    const fullName =
      user.user_metadata?.full_name || user.user_metadata?.name || 'Usuário';
    const preferredName = user.user_metadata?.preferred_name || '';
    const avatarUrl = user.user_metadata?.avatar_url || '';

    let d1Success = false;

    // ========== 1️⃣ D1 PRIMEIRO (PRIMARY) ==========
    if (this.isD1Enabled()) {
      try {
        const result = await d1Client.ensureUser({
          uuid: user.id,
          email: user.email,
          name: fullName,
          preferred_name: preferredName,
          avatar_url: avatarUrl,
        });

        if (result.error) {
          console.error('❌ [D1] Erro em ensureUser:', result.error);
        } else {
          d1Success = true;
          console.log(
            `✅ [D1 PRIMARY] Usuário ${result.created ? 'criado' : 'atualizado'}:`,
            user.email
          );
        }
      } catch (error) {
        console.error('❌ [D1] Erro em ensureUserInDatabase:', error);
      }
    }

    // ========== 2️⃣ SUPABASE DEPOIS (BACKUP) ==========
    if (this.isSupabaseEnabled()) {
      try {
        // Verificar se usuário já existe
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('uuid')
          .eq('email', user.email)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('❌ [SUPABASE BACKUP] Erro ao verificar usuário:', checkError);
        }

        if (!existingUser) {
          // Criar novo usuário
          const { error: insertError } = await supabase.from('users').insert({
            uuid: user.id,
            email: user.email,
            name: fullName,
            preferred_name: preferredName || null,
            avatar_url: avatarUrl || null,
            created_at: new Date().toISOString(),
            last_online: new Date().toISOString(),
            preferred_language: 'pt',
          });

          if (insertError) {
            console.error('❌ [SUPABASE BACKUP] Erro ao inserir usuário:', insertError);
          } else {
            console.log('✅ [SUPABASE BACKUP] Usuário replicado:', user.email);
          }
        } else {
          // Atualizar last_online
          await supabase
            .from('users')
            .update({ last_online: new Date().toISOString() })
            .eq('email', user.email);
          console.log('✅ [SUPABASE BACKUP] Last online sincronizado:', user.email);
        }
      } catch (error) {
        console.error('❌ [SUPABASE BACKUP] Erro em ensureUserInDatabase:', error);
        // Não falha a operação - Supabase é apenas backup
      }
    }

    // Sucesso se D1 funcionou (ou se está em modo supabase-only)
    return {
      success: d1Success || this.mode === 'supabase-only',
      source: 'd1'
    };
  }

  /**
   * Verifica se o usuário precisa completar o onboarding
   * Lê do D1 (PRIMARY), fallback para Supabase se D1 falhar
   */
  async checkUserNeedsOnboarding(user: { email?: string }): Promise<boolean> {
    if (!user.email) {
      console.warn('⚠️ [ONBOARDING] Email não fornecido, assumindo que precisa de onboarding');
      return true;
    }
    // ========== 1️⃣ TENTAR D1 PRIMEIRO ==========
    if (this.isD1Enabled()) {
      try {
        const result = await d1Client.checkOnboardingStatus(user.email);
        console.log('🔍 [D1] checkOnboardingStatus raw result:', JSON.stringify(result));
        if (!result.error && result.data !== undefined) {
          console.log(
            `🔍 [D1 PRIMARY] Onboarding: ${result.data.needsOnboarding ? 'necessário' : 'completo'}`
          );
          return result.data.needsOnboarding;
        }
        console.warn('⚠️ [D1] Resposta inválida, tentando fallback...', { error: result.error, hasData: !!result.data });
      } catch (error) {
        console.error('❌ [D1] Erro no check de onboarding:', error);
      }
    }

    // ========== 2️⃣ FALLBACK PARA SUPABASE ==========
    if (this.isSupabaseEnabled() && this.mode !== 'd1-only') {
      console.log('⚠️ [FALLBACK] Usando Supabase para onboarding check');
      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('name, mobile_phone, country, postal_code, address, preferred_language')
          .eq('email', user.email)
          .single();

        if (error) {
          console.error('❌ [SUPABASE FALLBACK] Erro ao verificar onboarding:', error);
          return true;
        }

        const missingRequired =
          !userData.name || !userData.country || !userData.preferred_language;
        const hasOptionalData =
          userData.mobile_phone || userData.postal_code || userData.address;

        const needsOnboarding = missingRequired || !hasOptionalData;

        console.log(
          `🔍 [SUPABASE FALLBACK] Onboarding: ${needsOnboarding ? 'necessário' : 'completo'}`
        );

        return needsOnboarding;
      } catch (error) {
        console.error('❌ [SUPABASE FALLBACK] Erro em checkUserNeedsOnboarding:', error);
      }
    }

    // Se tudo falhar, assume que precisa de onboarding
    return true;
  }

  /**
   * Atualiza os dados do usuário
   * D1 primeiro (PRIMARY), depois replica para Supabase (BACKUP)
   */
  async updateUserProfile(
    email: string,
    updates: {
      name?: string;
      preferred_name?: string;
      mobile_phone?: string;
      country?: string;
      postal_code?: string;
      address?: string;
      preferred_language?: string;
    }
  ): Promise<OperationResult> {
    let d1Success = false;

    // ========== 1️⃣ D1 PRIMEIRO (PRIMARY) ==========
    if (this.isD1Enabled()) {
      try {
        const result = await d1Client.updateUserByEmail(email, updates);
        if (result.error) {
          console.error('❌ [D1 PRIMARY] Erro ao atualizar perfil:', result.error);
        } else {
          d1Success = true;
          console.log('✅ [D1 PRIMARY] Perfil atualizado:', email);
        }
      } catch (error) {
        console.error('❌ [D1 PRIMARY] Erro em updateUserProfile:', error);
      }
    }

    // ========== 2️⃣ SUPABASE DEPOIS (BACKUP) ==========
    if (this.isSupabaseEnabled()) {
      try {
        const { error } = await supabase
          .from('users')
          .update({
            ...updates,
            last_online: new Date().toISOString(),
          })
          .eq('email', email);

        if (error) {
          console.error('❌ [SUPABASE BACKUP] Erro ao atualizar perfil:', error);
        } else {
          console.log('✅ [SUPABASE BACKUP] Perfil replicado:', email);
        }
      } catch (error) {
        console.error('❌ [SUPABASE BACKUP] Erro em updateUserProfile:', error);
        // Não falha - Supabase é apenas backup
      }
    }

    return {
      success: d1Success || this.mode === 'supabase-only',
      source: 'd1',
    };
  }

  /**
   * Obtém os dados completos do usuário
   * D1 primeiro (PRIMARY), fallback para Supabase se falhar
   */
  async getUserProfile(email: string): Promise<OperationResult<D1User | any>> {
    // ========== 1️⃣ TENTAR D1 PRIMEIRO ==========
    if (this.isD1Enabled()) {
      try {
        const result = await d1Client.getUserByEmail(email);
        if (!result.error && result.data) {
          console.log('✅ [D1 PRIMARY] Perfil obtido:', email);
          return { success: true, data: result.data, source: 'd1' };
        }
        console.warn('⚠️ [D1] Usuário não encontrado, tentando fallback...');
      } catch (error) {
        console.error('❌ [D1] Erro ao obter perfil:', error);
      }
    }

    // ========== 2️⃣ FALLBACK PARA SUPABASE ==========
    if (this.isSupabaseEnabled() && this.mode !== 'd1-only') {
      console.log('⚠️ [FALLBACK] Usando Supabase para getUserProfile');
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (error) {
          console.error('❌ [SUPABASE FALLBACK] Erro ao obter perfil:', error);
          return { success: false, error: error.message };
        }

        console.log('✅ [SUPABASE FALLBACK] Perfil obtido:', email);
        return { success: true, data, source: 'supabase' };
      } catch (error: any) {
        console.error('❌ [SUPABASE FALLBACK] Erro em getUserProfile:', error);
        return { success: false, error: error.message };
      }
    }

    return { success: false, error: 'User not found' };
  }

  /**
   * Sincroniza dados do Supabase para D1
   * Útil para migração inicial de dados existentes
   */
  async syncUserFromSupabaseToD1(email: string): Promise<OperationResult> {
    if (!this.isD1Enabled()) {
      return { success: false, error: 'D1 not enabled' };
    }

    try {
      // Buscar do Supabase
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        return { success: false, error: 'User not found in Supabase' };
      }

      // Inserir/atualizar no D1
      const result = await d1Client.ensureUser({
        uuid: data.uuid,
        email: data.email,
        name: data.name,
        preferred_name: data.preferred_name,
        avatar_url: data.avatar_url,
      });

      if (result.error) {
        return { success: false, error: result.error };
      }

      // Atualizar campos adicionais
      await d1Client.updateUserByEmail(email, {
        mobile_phone: data.mobile_phone,
        country: data.country,
        postal_code: data.postal_code,
        address: data.address,
        preferred_language: data.preferred_language,
      });

      console.log('✅ [SYNC] Usuário migrado Supabase → D1:', email);

      return { success: true };
    } catch (error: any) {
      console.error('❌ [SYNC] Erro ao sincronizar:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sincroniza TODOS os usuários do Supabase para D1
   * Usar uma vez durante a migração inicial
   */
  async syncAllUsersFromSupabaseToD1(): Promise<OperationResult<{ synced: number; failed: number }>> {
    if (!this.isD1Enabled()) {
      return { success: false, error: 'D1 not enabled' };
    }

    try {
      // Buscar todos os usuários do Supabase
      const { data: users, error } = await supabase
        .from('users')
        .select('*');

      if (error || !users) {
        return { success: false, error: 'Failed to fetch users from Supabase' };
      }

      let synced = 0;
      let failed = 0;

      for (const user of users) {
        const result = await this.syncUserFromSupabaseToD1(user.email);
        if (result.success) {
          synced++;
        } else {
          failed++;
          console.error(`❌ [SYNC] Falha ao migrar: ${user.email}`);
        }
      }

      console.log(`✅ [SYNC COMPLETO] ${synced} migrados, ${failed} falhas`);

      return {
        success: failed === 0,
        data: { synced, failed }
      };
    } catch (error: any) {
      console.error('❌ [SYNC] Erro na migração em massa:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Retorna o modo atual de operação
   */
  getMode(): DatabaseMode {
    return this.mode;
  }

  /**
   * Altera o modo de operação em runtime (para testes)
   */
  setMode(mode: DatabaseMode): void {
    this.mode = mode;
    console.log(`📊 [USER SERVICE V2] Mode changed to: ${mode}`);
  }
}

// Export singleton instance
export const userManagementServiceV2 = new UserManagementServiceV2();

// Export para compatibilidade com código existente
export { userManagementServiceV2 as userManagementService };
