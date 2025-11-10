// Serviço de gerenciamento de usuários
// Contém lógica de negócio para CRUD de usuários e onboarding

import { supabase } from '../lib/api-clients/supabase-client';

/**
 * Serviço responsável pelo gerenciamento do ciclo de vida dos usuários
 * Inclui criação, atualização, verificação de onboarding
 */
export class UserManagementService {
  /**
   * Garante que o usuário existe na tabela users após login social
   * Implementa lógica de criação ou atualização de usuários
   */
  async ensureUserInDatabase(user: any): Promise<void> {
    try {
      // Verificar se usuário já existe
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('uuid')
        .eq('email', user.email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 = "The result contains 0 rows"
        console.error('Erro ao verificar usuário existente:', checkError);
        return;
      }

      // Se usuário não existe, criar
      if (!existingUser) {
        const fullName =
          user.user_metadata?.full_name || user.user_metadata?.name || 'Usuário';
        const preferredName = user.user_metadata?.preferred_name || '';

        const { error: insertError } = await supabase.from('users').insert({
          uuid: user.id,
          email: user.email,
          name: fullName,
          preferred_name: preferredName || null,
          created_at: new Date().toISOString(),
          last_online: new Date().toISOString(),
          preferred_language: 'pt',
        });

        if (insertError) {
          console.error('Erro ao inserir usuário na tabela:', insertError);
        } else {
          console.log('✅ [USER SERVICE] Usuário registrado:', user.email);
        }
      } else {
        // Atualizar last_online se usuário já existe
        const { error: updateError } = await supabase
          .from('users')
          .update({ last_online: new Date().toISOString() })
          .eq('email', user.email);

        if (updateError) {
          console.error('Erro ao atualizar last_online:', updateError);
        } else {
          console.log('✅ [USER SERVICE] Last online atualizado:', user.email);
        }
      }
    } catch (error) {
      console.error('❌ [USER SERVICE] Erro em ensureUserInDatabase:', error);
    }
  }

  /**
   * Verifica se o usuário precisa completar o onboarding
   * Implementa regras de negócio para determinar se onboarding está completo
   */
  async checkUserNeedsOnboarding(user: any): Promise<boolean> {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select(
          'name, mobile_phone, country, postal_code, address, preferred_language',
        )
        .eq('email', user.email)
        .single();

      if (error) {
        console.error('Erro ao verificar dados do usuário:', error);
        return true; // Em caso de erro, assume que precisa de onboarding
      }

      // Verificar campos obrigatórios
      const missingRequiredFields =
        !userData.name || !userData.country || !userData.preferred_language;

      // Verificar se tem pelo menos alguns dados opcionais
      const hasOptionalData =
        userData.mobile_phone || userData.postal_code || userData.address;

      // Precisa de onboarding se faltam campos obrigatórios OU não tem dados opcionais
      const needsOnboarding = missingRequiredFields || !hasOptionalData;

      console.log(
        `🔍 [USER SERVICE] Usuário ${user.email} ${needsOnboarding ? 'precisa' : 'não precisa'} de onboarding`,
      );

      return needsOnboarding;
    } catch (error) {
      console.error('❌ [USER SERVICE] Erro na verificação de onboarding:', error);
      return true;
    }
  }

  /**
   * Atualiza os dados do usuário
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
    },
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          last_online: new Date().toISOString(),
        })
        .eq('email', email);

      if (error) {
        console.error('❌ [USER SERVICE] Erro ao atualizar perfil:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ [USER SERVICE] Perfil atualizado:', email);
      return { success: true };
    } catch (error: any) {
      console.error('❌ [USER SERVICE] Erro ao atualizar perfil:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtém os dados completos do usuário
   */
  async getUserProfile(email: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('❌ [USER SERVICE] Erro ao obter perfil:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ [USER SERVICE] Erro ao obter perfil:', error);
      return null;
    }
  }
}

// Export singleton instance
export const userManagementService = new UserManagementService();
