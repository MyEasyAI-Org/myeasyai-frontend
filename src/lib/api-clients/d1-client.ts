// HTTP client para Cloudflare D1 API
// Este arquivo contém APENAS HTTP wrappers, sem lógica de negócio

const D1_API_URL = import.meta.env.VITE_CLOUDFLARE_D1_API_URL;

/**
 * Tipos que espelham o schema D1
 */
export interface D1User {
  uuid: string;
  email: string;
  name: string | null;
  preferred_name: string | null;
  mobile_phone: string | null;
  country: string | null;
  postal_code: string | null;
  address: string | null;
  avatar_url: string | null;
  preferred_language: string;
  subscription_plan: string | null;
  subscription_status: string | null;
  created_at: string;
  last_online: string | null;
}

export interface D1UserProduct {
  id: number;
  user_uuid: string;
  product_id: string;
  product_type: string | null;
  status: string;
  metadata: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface D1Site {
  id: number;
  user_uuid: string;
  slug: string;
  name: string;
  description: string | null;
  business_type: string | null;
  status: string;
  settings: string | null;
  created_at: string;
  updated_at: string | null;
  published_at: string | null;
}

export interface D1ApiResponse<T> {
  data?: T;
  error?: string;
  code?: string;
  success?: boolean;
  created?: boolean;
}

/**
 * Cliente HTTP para a API D1 (Cloudflare Worker)
 */
export class D1Client {
  private readonly baseUrl: string;
  private enabled: boolean;

  constructor() {
    this.baseUrl = D1_API_URL || '';
    this.enabled = !!D1_API_URL;

    if (!this.enabled) {
      console.warn('⚠️ [D1 CLIENT] VITE_CLOUDFLARE_D1_API_URL not configured - D1 disabled');
    }
  }

  /**
   * Verifica se o D1 está habilitado
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Wrapper para fetch com tratamento de erros
   */
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<D1ApiResponse<T>> {
    if (!this.enabled) {
      return { error: 'D1 not configured' };
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || `HTTP ${response.status}`,
          code: data.code,
        };
      }

      return data;
    } catch (error: any) {
      console.error(`❌ [D1 CLIENT] Fetch error:`, error);
      return { error: error.message };
    }
  }

  // ==================== USERS ====================

  /**
   * Busca usuário por UUID
   */
  async getUserByUuid(uuid: string): Promise<D1ApiResponse<D1User>> {
    return this.fetch<D1User>(`/users/${uuid}`);
  }

  /**
   * Busca usuário por email
   */
  async getUserByEmail(email: string): Promise<D1ApiResponse<D1User>> {
    return this.fetch<D1User>(`/users/email/${encodeURIComponent(email)}`);
  }

  /**
   * Cria novo usuário
   */
  async createUser(user: Partial<D1User>): Promise<D1ApiResponse<D1User>> {
    return this.fetch<D1User>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  /**
   * Atualiza usuário por UUID
   */
  async updateUserByUuid(
    uuid: string,
    updates: Partial<D1User>
  ): Promise<D1ApiResponse<D1User>> {
    return this.fetch<D1User>(`/users/${uuid}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Alias para updateUserByUuid
   */
  async updateUser(
    uuid: string,
    updates: Partial<D1User>
  ): Promise<D1ApiResponse<D1User>> {
    return this.updateUserByUuid(uuid, updates);
  }

  /**
   * Atualiza usuário por email
   */
  async updateUserByEmail(
    email: string,
    updates: Partial<D1User>
  ): Promise<D1ApiResponse<D1User>> {
    return this.fetch<D1User>(`/users/email/${encodeURIComponent(email)}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Garante que usuário existe (upsert após login)
   */
  async ensureUser(user: {
    uuid: string;
    email: string;
    name?: string;
    preferred_name?: string;
    avatar_url?: string;
  }): Promise<D1ApiResponse<D1User & { created: boolean }>> {
    return this.fetch<D1User & { created: boolean }>('/users/ensure', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  /**
   * Verifica se usuário precisa de onboarding
   */
  async checkOnboardingStatus(
    email: string
  ): Promise<D1ApiResponse<{ needsOnboarding: boolean; reason: string | null }>> {
    return this.fetch(`/users/email/${encodeURIComponent(email)}/onboarding-status`);
  }

  // ==================== PRODUCTS ====================

  /**
   * Lista produtos do usuário
   */
  async getUserProducts(userUuid: string): Promise<D1ApiResponse<D1UserProduct[]>> {
    return this.fetch<D1UserProduct[]>(`/products/user/${userUuid}`);
  }

  /**
   * Lista produtos ativos do usuário
   */
  async getActiveProducts(userUuid: string): Promise<D1ApiResponse<D1UserProduct[]>> {
    return this.fetch<D1UserProduct[]>(`/products/user/${userUuid}/active`);
  }

  /**
   * Adiciona produto para usuário
   */
  async addProduct(product: {
    user_uuid: string;
    product_id: string;
    product_type?: string;
    status?: string;
    metadata?: string;
  }): Promise<D1ApiResponse<D1UserProduct>> {
    return this.fetch<D1UserProduct>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  /**
   * Atualiza status do produto
   */
  async updateProductStatus(
    userUuid: string,
    productId: string,
    status: string
  ): Promise<D1ApiResponse<D1UserProduct>> {
    return this.fetch<D1UserProduct>(
      `/products/user/${userUuid}/product/${productId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
  }

  // ==================== SITES ====================

  /**
   * Lista sites do usuário
   */
  async getUserSites(userUuid: string): Promise<D1ApiResponse<D1Site[]>> {
    return this.fetch<D1Site[]>(`/sites/user/${userUuid}`);
  }

  /**
   * Busca site por slug
   */
  async getSiteBySlug(slug: string): Promise<D1ApiResponse<D1Site>> {
    return this.fetch<D1Site>(`/sites/slug/${slug}`);
  }

  /**
   * Verifica disponibilidade do slug
   */
  async checkSlugAvailability(
    slug: string
  ): Promise<D1ApiResponse<{ available: boolean; reason: string | null }>> {
    return this.fetch(`/sites/slug/${slug}/available`);
  }

  /**
   * Cria novo site
   */
  async createSite(site: {
    user_uuid: string;
    slug: string;
    name: string;
    description?: string;
    business_type?: string;
    settings?: string;
  }): Promise<D1ApiResponse<D1Site>> {
    return this.fetch<D1Site>('/sites', {
      method: 'POST',
      body: JSON.stringify(site),
    });
  }

  /**
   * Atualiza site
   */
  async updateSite(id: number, updates: Partial<D1Site>): Promise<D1ApiResponse<D1Site>> {
    return this.fetch<D1Site>(`/sites/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Publica site
   */
  async publishSite(slug: string): Promise<D1ApiResponse<D1Site>> {
    return this.fetch<D1Site>(`/sites/slug/${slug}/publish`, {
      method: 'PATCH',
    });
  }

  /**
   * Remove site
   */
  async deleteSite(id: number): Promise<D1ApiResponse<{ success: boolean }>> {
    return this.fetch(`/sites/${id}`, { method: 'DELETE' });
  }

  /**
   * Estatísticas dos sites do usuário
   */
  async getSiteStats(
    userUuid: string
  ): Promise<D1ApiResponse<{ total: number; active: number; building: number; inactive: number }>> {
    return this.fetch(`/sites/stats/user/${userUuid}`);
  }

  // ==================== SYNC HELPERS ====================
  // Métodos auxiliares para sincronização bidirecional Supabase ↔ D1

  /**
   * Upsert genérico de usuário (usado pelo DatabaseSyncService)
   * Se o usuário já existe, atualiza; se não, cria
   */
  async upsertUser(user: Partial<D1User> & { uuid: string }): Promise<D1ApiResponse<D1User>> {
    // Usa ensureUser para criar/atualizar
    const result = await this.ensureUser({
      uuid: user.uuid,
      email: user.email || '',
      name: user.name || undefined,
      preferred_name: user.preferred_name || undefined,
      avatar_url: user.avatar_url || undefined,
    });

    // Se criou, ainda precisamos atualizar campos extras
    if (result.data && (user.mobile_phone || user.country || user.postal_code || user.address || user.preferred_language)) {
      return this.updateUserByUuid(user.uuid, {
        mobile_phone: user.mobile_phone,
        country: user.country,
        postal_code: user.postal_code,
        address: user.address,
        preferred_language: user.preferred_language,
      });
    }

    return result as D1ApiResponse<D1User>;
  }

  /**
   * Upsert genérico de site (usado pelo DatabaseSyncService)
   */
  async upsertSite(site: Partial<D1Site> & { user_uuid: string; slug: string; name: string }): Promise<D1ApiResponse<D1Site>> {
    // Primeiro tenta buscar por slug para ver se existe
    const existing = await this.getSiteBySlug(site.slug);

    if (existing.data) {
      // Site existe, atualiza
      return this.updateSite(existing.data.id, {
        name: site.name,
        description: site.description,
        business_type: site.business_type,
        status: site.status,
        settings: site.settings,
      });
    } else {
      // Site não existe, cria
      return this.createSite({
        user_uuid: site.user_uuid,
        slug: site.slug,
        name: site.name,
        description: site.description ?? undefined,
        business_type: site.business_type ?? undefined,
        settings: site.settings ?? undefined,
      });
    }
  }

  /**
   * Upsert genérico de produto (usado pelo DatabaseSyncService)
   */
  async upsertProduct(product: {
    user_uuid: string;
    product_id: string;
    product_type?: string;
    status?: string;
    metadata?: string;
  }): Promise<D1ApiResponse<D1UserProduct>> {
    // Primeiro tenta atualizar status (assume que existe)
    const updateResult = await this.updateProductStatus(
      product.user_uuid,
      product.product_id,
      product.status || 'active'
    );

    // Se falhou (não existe), tenta criar
    if (updateResult.error) {
      return this.addProduct(product);
    }

    return updateResult;
  }

  /**
   * Delete de usuário por UUID
   * Nota: Soft delete ou hard delete dependendo da implementação do Worker
   */
  async deleteUser(uuid: string): Promise<D1ApiResponse<{ success: boolean }>> {
    return this.fetch(`/users/${uuid}`, { method: 'DELETE' });
  }

  /**
   * Delete de produto
   */
  async deleteProduct(userUuid: string, productId: string): Promise<D1ApiResponse<{ success: boolean }>> {
    return this.fetch(`/products/user/${userUuid}/product/${productId}`, { method: 'DELETE' });
  }

  // ==================== HEALTH ====================

  /**
   * Health check da API
   */
  async healthCheck(): Promise<D1ApiResponse<{ status: string; timestamp: string }>> {
    return this.fetch('/health');
  }

  /**
   * Health check detalhado
   */
  async detailedHealthCheck(): Promise<D1ApiResponse<any>> {
    return this.fetch('/health/detailed');
  }
}

// Export singleton instance
export const d1Client = new D1Client();
