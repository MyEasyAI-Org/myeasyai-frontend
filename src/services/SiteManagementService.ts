// Serviço de gerenciamento de sites - MyEasyWebsite
// Cloudflare D1 é PRIMARY, Supabase é SECONDARY (backup/espelho)

import { supabase } from '../lib/api-clients/supabase-client';
import { d1Client } from '../lib/api-clients/d1-client';

/**
 * Limites de sites por plano
 */
export const SITE_LIMITS: Record<string, number> = {
  individual: 1,
  plus: 3,
  premium: 5,
};

/**
 * Interface para dados do site
 */
export interface SiteData {
  id?: number;
  user_uuid: string;
  slug: string;
  name: string;
  description?: string | null;
  business_type?: string | null;
  status: 'building' | 'active' | 'inactive';
  settings?: string | null; // JSON string com todas as configurações do site
  created_at?: string;
  updated_at?: string;
  published_at?: string | null;
}

/**
 * Interface para configurações do site (armazenado em settings)
 */
export interface SiteSettings {
  // Informações básicas
  businessName: string;
  tagline?: string;
  description?: string;

  // Contato
  phone?: string;
  email?: string;
  whatsapp?: string;

  // Endereço
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  coordinates?: { lat: number; lng: number };

  // Redes sociais
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };

  // Aparência
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };

  // Conteúdo
  sections?: any[];

  // SEO
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };

  // HTML gerado
  generatedHtml?: string;
}

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
 * Serviço de gerenciamento de sites
 * D1 = Primary, Supabase = Backup/Espelho
 */
class SiteManagementService {
  /**
   * Verifica se D1 está habilitado
   */
  private isD1Enabled(): boolean {
    return d1Client.isEnabled();
  }

  /**
   * Obtém o limite de sites para um plano
   */
  getSiteLimit(plan: string): number {
    return SITE_LIMITS[plan.toLowerCase()] ?? SITE_LIMITS.individual;
  }

  /**
   * Verifica se usuário pode criar mais sites
   */
  async canCreateSite(userUuid: string, plan: string): Promise<{ allowed: boolean; current: number; limit: number }> {
    const limit = this.getSiteLimit(plan);
    const stats = await this.getUserSiteStats(userUuid);

    return {
      allowed: stats.total < limit,
      current: stats.total,
      limit,
    };
  }

  /**
   * Obtém estatísticas de sites do usuário
   */
  async getUserSiteStats(userUuid: string): Promise<{ total: number; active: number; building: number; inactive: number }> {
    // Tentar D1 primeiro
    if (this.isD1Enabled()) {
      try {
        const result = await d1Client.getSiteStats(userUuid);
        if (!result.error && result.data) {
          console.log('✅ [D1 PRIMARY] Stats obtidas:', result.data);
          return result.data;
        }
      } catch (error) {
        console.error('❌ [D1] Erro ao obter stats:', error);
      }
    }

    // Fallback para Supabase
    console.log('⚠️ [FALLBACK] Usando Supabase para stats');
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('status')
        .eq('user_uuid', userUuid);

      if (error) throw error;

      const sites = data || [];
      return {
        total: sites.length,
        active: sites.filter((s: any) => s.status === 'active').length,
        building: sites.filter((s: any) => s.status === 'building').length,
        inactive: sites.filter((s: any) => s.status === 'inactive').length,
      };
    } catch (error) {
      console.error('❌ [SUPABASE FALLBACK] Erro ao obter stats:', error);
      return { total: 0, active: 0, building: 0, inactive: 0 };
    }
  }

  /**
   * Lista todos os sites do usuário
   */
  async getUserSites(userUuid: string): Promise<OperationResult<SiteData[]>> {
    // ========== 1️⃣ TENTAR D1 PRIMEIRO ==========
    if (this.isD1Enabled()) {
      try {
        const result = await d1Client.getUserSites(userUuid);
        if (!result.error && result.data) {
          console.log('✅ [D1 PRIMARY] Sites obtidos:', result.data.length);
          return { success: true, data: result.data as SiteData[], source: 'd1' };
        }
        console.warn('⚠️ [D1] Sites não encontrados, tentando Supabase...');
      } catch (error) {
        console.error('❌ [D1] Erro ao listar sites:', error);
      }
    }

    // ========== 2️⃣ FALLBACK PARA SUPABASE ==========
    console.log('⚠️ [FALLBACK] Usando Supabase para listar sites');
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('user_uuid', userUuid)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('✅ [SUPABASE FALLBACK] Sites obtidos:', data?.length || 0);
      return { success: true, data: data as SiteData[], source: 'supabase' };
    } catch (error: any) {
      console.error('❌ [SUPABASE FALLBACK] Erro ao listar sites:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtém um site por slug
   */
  async getSiteBySlug(slug: string): Promise<OperationResult<SiteData>> {
    const normalizedSlug = slug.toLowerCase();

    // Tentar D1 primeiro
    if (this.isD1Enabled()) {
      try {
        const result = await d1Client.getSiteBySlug(normalizedSlug);
        if (!result.error && result.data) {
          console.log('✅ [D1 PRIMARY] Site obtido:', normalizedSlug);
          return { success: true, data: result.data as SiteData, source: 'd1' };
        }
      } catch (error) {
        console.error('❌ [D1] Erro ao obter site:', error);
      }
    }

    // Fallback para Supabase
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('slug', normalizedSlug)
        .single();

      if (error) throw error;
      return { success: true, data: data as SiteData, source: 'supabase' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Verifica se um slug está disponível
   */
  async checkSlugAvailability(slug: string, userUuid?: string): Promise<{ available: boolean; reason?: string; ownedByUser?: boolean }> {
    const normalizedSlug = slug.toLowerCase();

    // Tentar D1 primeiro
    if (this.isD1Enabled()) {
      try {
        const result = await d1Client.checkSlugAvailability(normalizedSlug);
        if (!result.error && result.data !== undefined) {
          // Se não está disponível, verificar se pertence ao usuário
          if (!result.data.available && userUuid) {
            const siteResult = await d1Client.getSiteBySlug(normalizedSlug);
            if (siteResult.data?.user_uuid === userUuid) {
              return { available: false, reason: 'owned', ownedByUser: true };
            }
          }
          return { available: result.data.available, reason: result.data.reason || undefined };
        }
      } catch (error) {
        console.error('❌ [D1] Erro ao verificar slug:', error);
      }
    }

    // Fallback para Supabase
    try {
      const { data } = await supabase
        .from('sites')
        .select('user_uuid')
        .eq('slug', normalizedSlug)
        .single();

      if (!data) {
        return { available: true };
      }

      if (userUuid && data.user_uuid === userUuid) {
        return { available: false, reason: 'owned', ownedByUser: true };
      }

      return { available: false, reason: 'taken' };
    } catch (error: any) {
      // PGRST116 = not found = disponível
      if (error.code === 'PGRST116') {
        return { available: true };
      }
      return { available: false, reason: 'error' };
    }
  }

  /**
   * Cria um novo site
   * D1 primeiro, depois replica para Supabase
   */
  async createSite(siteData: Omit<SiteData, 'id' | 'created_at' | 'updated_at'>): Promise<OperationResult<SiteData>> {
    const normalizedSlug = siteData.slug.toLowerCase();
    let d1Success = false;
    let createdSite: SiteData | null = null;

    // ========== 1️⃣ D1 PRIMEIRO (PRIMARY) ==========
    if (this.isD1Enabled()) {
      try {
        const result = await d1Client.createSite({
          user_uuid: siteData.user_uuid,
          slug: normalizedSlug,
          name: siteData.name,
          description: siteData.description || undefined,
          business_type: siteData.business_type || undefined,
          settings: siteData.settings || undefined,
        });

        if (result.error) {
          console.error('❌ [D1 PRIMARY] Erro ao criar site:', result.error);
          return { success: false, error: result.error };
        }

        d1Success = true;
        createdSite = result.data as SiteData;
        console.log('✅ [D1 PRIMARY] Site criado:', normalizedSlug);
      } catch (error: any) {
        console.error('❌ [D1 PRIMARY] Erro ao criar site:', error);
        return { success: false, error: error.message };
      }
    }

    // ========== 2️⃣ SUPABASE DEPOIS (BACKUP/ESPELHO) ==========
    try {
      const { data, error } = await supabase.from('sites').insert({
        user_uuid: siteData.user_uuid,
        slug: normalizedSlug,
        name: siteData.name,
        description: siteData.description,
        business_type: siteData.business_type,
        status: siteData.status || 'building',
        settings: siteData.settings,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).select().single();

      if (error) {
        console.error('❌ [SUPABASE BACKUP] Erro ao replicar site:', error);
      } else {
        console.log('✅ [SUPABASE BACKUP] Site replicado:', normalizedSlug);
        if (!createdSite) {
          createdSite = data as SiteData;
        }
      }
    } catch (error) {
      console.error('❌ [SUPABASE BACKUP] Erro ao replicar site:', error);
    }

    if (d1Success && createdSite) {
      return { success: true, data: createdSite, source: 'd1' };
    }

    return { success: false, error: 'Failed to create site' };
  }

  /**
   * Atualiza um site existente
   * D1 primeiro, depois replica para Supabase
   * @param siteId - ID do site para atualizar
   * @param currentSlug - Slug atual do site (usado para WHERE no Supabase)
   * @param updates - Dados a serem atualizados (pode incluir novo slug)
   */
  async updateSite(siteId: number, currentSlug: string, updates: Partial<SiteData>): Promise<OperationResult<SiteData>> {
    let d1Success = false;
    let updatedSite: SiteData | null = null;

    // ========== 1️⃣ D1 PRIMEIRO (PRIMARY) ==========
    if (this.isD1Enabled()) {
      try {
        const result = await d1Client.updateSite(siteId, updates);
        if (result.error) {
          console.error('❌ [D1 PRIMARY] Erro ao atualizar site:', result.error);
        } else {
          d1Success = true;
          updatedSite = result.data as SiteData;
          console.log('✅ [D1 PRIMARY] Site atualizado:', siteId);
        }
      } catch (error) {
        console.error('❌ [D1 PRIMARY] Erro ao atualizar site:', error);
      }
    }

    // ========== 2️⃣ SUPABASE DEPOIS (BACKUP/ESPELHO) ==========
    try {
      // Usar slug atual para encontrar, mas atualizar com novos dados (incluindo novo slug se houver)
      const { data, error } = await supabase
        .from('sites')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('slug', currentSlug)
        .select()
        .single();

      if (error) {
        console.error('❌ [SUPABASE BACKUP] Erro ao atualizar site:', error);
      } else {
        console.log('✅ [SUPABASE BACKUP] Site sincronizado:', updates.slug || currentSlug);
        if (!updatedSite) {
          updatedSite = data as SiteData;
        }
      }
    } catch (error) {
      console.error('❌ [SUPABASE BACKUP] Erro ao sincronizar site:', error);
    }

    if (d1Success && updatedSite) {
      return { success: true, data: updatedSite, source: 'd1' };
    }

    if (updatedSite) {
      return { success: true, data: updatedSite, source: 'supabase' };
    }

    return { success: false, error: 'Failed to update site' };
  }

  /**
   * Salva as configurações do site (settings JSON)
   */
  async saveSiteSettings(siteId: number, slug: string, settings: SiteSettings): Promise<OperationResult<SiteData>> {
    return this.updateSite(siteId, slug, {
      settings: JSON.stringify(settings),
    });
  }

  /**
   * Carrega as configurações do site
   */
  parseSiteSettings(site: SiteData): SiteSettings | null {
    if (!site.settings) return null;
    try {
      return JSON.parse(site.settings);
    } catch {
      return null;
    }
  }

  /**
   * Publica um site (marca como ativo e atualiza published_at)
   * D1 primeiro, depois replica para Supabase
   */
  async publishSite(slug: string): Promise<OperationResult<SiteData>> {
    const normalizedSlug = slug.toLowerCase();
    let d1Success = false;
    let publishedSite: SiteData | null = null;

    // ========== 1️⃣ D1 PRIMEIRO (PRIMARY) ==========
    if (this.isD1Enabled()) {
      try {
        const result = await d1Client.publishSite(normalizedSlug);
        if (result.error) {
          console.error('❌ [D1 PRIMARY] Erro ao publicar site:', result.error);
        } else {
          d1Success = true;
          publishedSite = result.data as SiteData;
          console.log('✅ [D1 PRIMARY] Site publicado:', normalizedSlug);
        }
      } catch (error) {
        console.error('❌ [D1 PRIMARY] Erro ao publicar site:', error);
      }
    }

    // ========== 2️⃣ SUPABASE DEPOIS (BACKUP/ESPELHO) ==========
    try {
      const { data, error } = await supabase
        .from('sites')
        .update({
          status: 'active',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('slug', normalizedSlug)
        .select()
        .single();

      if (error) {
        console.error('❌ [SUPABASE BACKUP] Erro ao publicar site:', error);
      } else {
        console.log('✅ [SUPABASE BACKUP] Publicação sincronizada:', normalizedSlug);
        if (!publishedSite) {
          publishedSite = data as SiteData;
        }
      }
    } catch (error) {
      console.error('❌ [SUPABASE BACKUP] Erro ao sincronizar publicação:', error);
    }

    if (d1Success && publishedSite) {
      return { success: true, data: publishedSite, source: 'd1' };
    }

    if (publishedSite) {
      return { success: true, data: publishedSite, source: 'supabase' };
    }

    return { success: false, error: 'Failed to publish site' };
  }

  /**
   * Deleta um site
   * D1 primeiro, depois remove do Supabase
   */
  async deleteSite(siteId: number, slug: string): Promise<OperationResult> {
    let d1Success = false;

    // ========== 1️⃣ D1 PRIMEIRO (PRIMARY) ==========
    if (this.isD1Enabled()) {
      try {
        const result = await d1Client.deleteSite(siteId);
        if (result.error) {
          console.error('❌ [D1 PRIMARY] Erro ao deletar site:', result.error);
        } else {
          d1Success = true;
          console.log('✅ [D1 PRIMARY] Site deletado:', siteId);
        }
      } catch (error) {
        console.error('❌ [D1 PRIMARY] Erro ao deletar site:', error);
      }
    }

    // ========== 2️⃣ SUPABASE DEPOIS (BACKUP/ESPELHO) ==========
    try {
      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('slug', slug);

      if (error) {
        console.error('❌ [SUPABASE BACKUP] Erro ao deletar site:', error);
      } else {
        console.log('✅ [SUPABASE BACKUP] Site removido:', slug);
      }
    } catch (error) {
      console.error('❌ [SUPABASE BACKUP] Erro ao sincronizar deleção:', error);
    }

    return { success: d1Success };
  }

  /**
   * Obtém o site atual do usuário (primeiro site, para planos com 1 site)
   */
  async getCurrentUserSite(userUuid: string): Promise<OperationResult<SiteData | null>> {
    const result = await this.getUserSites(userUuid);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const sites = result.data || [];

    if (sites.length === 0) {
      return { success: true, data: null };
    }

    // Retorna o primeiro site (mais recente ou único)
    return { success: true, data: sites[0], source: result.source };
  }
}

// Export singleton instance
export const siteManagementService = new SiteManagementService();
