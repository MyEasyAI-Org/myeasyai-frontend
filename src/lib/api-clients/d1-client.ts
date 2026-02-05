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
  subscription_period_end: string | null;
  subscription_cancel_at_period_end: boolean | null;
  billing_cycle: string | null;
  payment_method_type: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  bio: string | null;
  company_name: string | null;
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

// =============================================================================
// Pricing Types
// =============================================================================

export interface D1PricingStore {
  id: string;
  user_uuid: string;
  name: string;
  description: string | null;
  currency: string;
  cost_allocation_method: string;
  is_active: boolean;
  is_demo: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface D1PricingProduct {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  category: string | null;
  direct_cost: number;
  unit_type: string;
  desired_margin: number;
  positioning: string;
  market_price: number | null;
  weight: number;
  monthly_units_estimate: number;
  is_active: boolean;
  is_demo: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface D1PricingIndirectCost {
  id: string;
  store_id: string;
  name: string;
  category: string;
  amount: number;
  frequency: string;
  amortization_months: number;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface D1PricingHiddenCost {
  id: string;
  store_id: string;
  name: string;
  category: string;
  amount: number;
  frequency: string;
  amortization_months: number;
  is_auto_calculated: boolean;
  auxiliary_data: string | null; // JSON string
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface D1PricingTaxConfig {
  id: string;
  store_id: string;
  tax_regime: string;
  created_at: string;
  updated_at: string | null;
}

export interface D1PricingTaxItem {
  id: string;
  store_id: string;
  name: string;
  category: string;
  percentage: number;
  created_at: string;
  updated_at: string | null;
}

// =============================================================================
// Fitness Types
// =============================================================================

export interface D1FitnessProfile {
  id: string;
  user_uuid: string;
  nome: string;
  idade: number;
  sexo: string;
  peso: number;
  altura: number;
  objetivo: string;
  nivel_atividade: string;
  restricoes_medicas: string | null; // JSON array as string
  lesoes: string | null; // JSON array as string
  // Training preferences
  dias_treino_semana: number | null;
  tempo_treino_minutos: number | null;
  preferencia_treino: string | null;
  experiencia_treino: string | null;
  local_treino: string | null;
  modalidade: string | null;
  // Diet preferences
  restricoes_alimentares: string | null; // JSON array as string
  comidas_favoritas: string | null; // JSON array as string
  comidas_evitar: string | null; // JSON array as string
  numero_refeicoes: number | null;
  horario_treino: string | null;
  // Gender
  genero: string | null;
  genero_outro: string | null;
  // Timestamps
  created_at: string;
  updated_at: string | null;
}

export interface D1FitnessTreino {
  id: string;
  user_uuid: string;
  nome: string;
  dia_semana: string;
  exercicios: string; // JSON array as string
  created_at: string;
  updated_at: string | null;
}

export interface D1FitnessDieta {
  id: string;
  user_uuid: string;
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  refeicoes: string; // JSON array as string
  created_at: string;
  updated_at: string | null;
}

export interface D1FitnessGamification {
  id: string;
  user_uuid: string;
  // Streak data
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  total_active_days: number;
  // XP data
  total_xp: number;
  current_level: number;
  // Stats
  total_workouts_completed: number;
  perfect_weeks: number;
  perfect_months: number;
  // New stats for trophies
  early_workouts?: number;
  night_workouts?: number;
  diet_days_followed?: number;
  workout_modalities?: string; // JSON array of strings
  consecutive_perfect_weeks?: number;
  // JSON stringified arrays
  badges: string; // JSON array of UserBadge (legacy)
  trophies?: string; // JSON array of UserTrophy
  unique_badges?: string; // JSON array of UserUniqueBadge
  challenges: string; // JSON array of Challenge
  goals: string; // JSON array of Goal
  activities: string; // JSON array of ActivityItem (limited to recent 50)
  // Timestamps
  created_at: string;
  updated_at: string | null;
}

// =============================================================================
// CRM Types
// =============================================================================

export interface D1CrmCompany {
  id: string;
  user_id: string;
  name: string;
  cnpj: string | null;
  industry: string | null;
  segment: string | null;
  size: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  linkedin: string | null;
  instagram: string | null;
  facebook: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface D1CrmContact {
  id: string;
  user_id: string;
  company_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  position: string | null;
  role: string | null;
  tags: string | null; // JSON array as string
  notes: string | null;
  source: string | null;
  lead_source: string | null;
  birth_date: string | null;
  address: string | null;
  linkedin: string | null;
  instagram: string | null;
  created_at: string;
  updated_at: string | null;
  company?: { id: string; name: string; industry?: string | null } | null;
}

export interface D1CrmDeal {
  id: string;
  user_id: string;
  contact_id: string | null;
  company_id: string | null;
  title: string;
  value: number;
  stage: string;
  probability: number;
  expected_close_date: string | null;
  actual_close_date: string | null;
  lost_reason: string | null;
  source: string | null;
  notes: string | null;
  products: string | null; // JSON array as string
  created_at: string;
  updated_at: string | null;
  contact?: { id: string; name: string; email?: string | null; phone?: string | null } | null;
  company?: { id: string; name: string } | null;
}

export interface D1CrmTask {
  id: string;
  user_id: string;
  contact_id: string | null;
  deal_id: string | null;
  title: string;
  description: string | null;
  due_date: string;
  type: string;
  priority: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  contact?: { id: string; name: string; email?: string | null } | null;
  deal?: { id: string; title: string; value?: number; stage?: string } | null;
}

export interface D1CrmActivity {
  id: string;
  user_id: string;
  contact_id: string | null;
  deal_id: string | null;
  type: string;
  description: string;
  metadata: string | null; // JSON as string
  created_at: string;
  contact?: { id: string; name: string; email?: string | null } | null;
  deal?: { id: string; title: string; value?: number; stage?: string } | null;
}

export interface D1CrmPipeline {
  columns: Array<{
    id: string;
    deals: D1CrmDeal[];
    total_value: number;
    count: number;
  }>;
  total_value: number;
  total_deals: number;
}

export interface D1CrmMetrics {
  total_value: number;
  weighted_value: number;
  open_deals: number;
  won_this_month: number;
  lost_this_month: number;
  revenue_this_month: number;
}

// =============================================================================
// Content Types (MyEasyContent)
// =============================================================================

export interface D1ContentBusinessProfile {
  id: string;
  user_id: string;
  name: string;
  business_niche: string;
  target_audience: string | null;
  brand_voice: string;
  selected_networks: string | null; // JSON array as string
  preferred_content_types: string | null; // JSON array as string
  icon: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface D1ContentLibraryItem {
  id: string;
  user_id: string;
  profile_id: string;
  content_type: string;
  network: string;
  title: string | null;
  content: string;
  hashtags: string | null; // JSON array as string
  image_description: string | null;
  best_time: string | null;
  variations: string | null; // JSON array as string
  is_favorite: boolean;
  tags: string | null; // JSON array as string
  folder: string | null;
  created_at: string;
}

export interface D1ContentCalendarEntry {
  id: string;
  user_id: string;
  profile_id: string;
  library_content_id: string | null;
  scheduled_date: string;
  day_of_week: string | null;
  network: string;
  content_type: string;
  title: string;
  description: string | null;
  hashtags: string | null; // JSON array as string
  best_time: string | null;
  status: string;
  created_at: string;
  updated_at: string | null;
}

// =============================================================================
// Docs Types (MyEasyDocs)
// =============================================================================

export interface D1DocsFolder {
  id: string;
  user_id: string;
  parent_id: string | null;
  name: string;
  path: string;
  created_at: string;
  updated_at: string | null;
}

export interface D1DocsDocument {
  id: string;
  user_id: string;
  folder_id: string | null;
  name: string;
  original_name: string;
  mime_type: string;
  size: number;
  r2_key: string;
  r2_url: string | null;
  extraction_status: 'pending' | 'processing' | 'completed' | 'failed' | 'unsupported';
  is_favorite: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface D1DocsContent {
  id: string;
  document_id: string;
  raw_text: string | null;
  word_count: number;
  extracted_at: string;
}

export interface D1DocsChunk {
  id: string;
  document_id: string;
  content_id: string;
  user_id: string;
  chunk_index: number;
  chunk_text: string;
  created_at: string;
}

export interface D1DocsSearchResult {
  chunk_id: string;
  document_id: string;
  document_name: string;
  content: string;
  chunk_index: number;
}

// =============================================================================
// Resume Types (MyEasyResume)
// =============================================================================

export interface D1ResumeProfile {
  id: string;
  user_id: string;
  name: string;
  career_level: string;
  target_role: string;
  industry: string;
  template_style: string;
  preferred_language: string;
  is_default: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface D1Resume {
  id: string;
  user_id: string;
  profile_id: string;
  version_name: string;
  personal_info: string; // JSON
  professional_summary: string;
  experiences: string; // JSON array
  education: string; // JSON array
  skills: string; // JSON array
  languages: string; // JSON array
  certifications: string; // JSON array
  projects: string; // JSON array
  is_favorite: boolean;
  tags: string; // JSON array
  created_at: string;
  updated_at: string | null;
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
   * Wrapper para fetch com tratamento de erros e timeout
   */
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {},
    timeoutMs = 5000
  ): Promise<D1ApiResponse<T>> {
    if (!this.enabled) {
      return { error: 'D1 not configured' };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || `HTTP ${response.status}`,
          code: data.code,
        };
      }

      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error(`❌ [D1 CLIENT] Request timeout (${timeoutMs}ms):`, endpoint);
        return { error: `Request timeout after ${timeoutMs}ms` };
      }
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
   * Garante que o usuário existe no D1 (sincroniza do Supabase se necessário)
   * Usado antes de criar documentos para evitar erro de foreign key
   */
  async syncEnsureUser(userId: string): Promise<D1ApiResponse<D1User & { synced: boolean }>> {
    return this.fetch<D1User & { synced: boolean }>(`/sync/ensure-user/${userId}`, {
      method: 'POST',
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

  // ==================== PRICING ====================

  // --- Stores ---

  /**
   * Lista lojas de pricing do usuário
   */
  async getPricingStores(userUuid: string): Promise<D1ApiResponse<D1PricingStore[]>> {
    return this.fetch<D1PricingStore[]>(`/pricing/stores/user/${userUuid}`);
  }

  /**
   * Busca loja de pricing por ID
   */
  async getPricingStoreById(storeId: string): Promise<D1ApiResponse<D1PricingStore>> {
    return this.fetch<D1PricingStore>(`/pricing/stores/${storeId}`);
  }

  /**
   * Cria nova loja de pricing
   */
  async createPricingStore(store: {
    user_uuid: string;
    name: string;
    description?: string;
    currency?: string;
    cost_allocation_method?: string;
    is_demo?: boolean;
  }): Promise<D1ApiResponse<D1PricingStore>> {
    return this.fetch<D1PricingStore>('/pricing/stores', {
      method: 'POST',
      body: JSON.stringify(store),
    });
  }

  /**
   * Atualiza loja de pricing
   */
  async updatePricingStore(
    storeId: string,
    updates: Partial<D1PricingStore>
  ): Promise<D1ApiResponse<D1PricingStore>> {
    return this.fetch<D1PricingStore>(`/pricing/stores/${storeId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Deleta loja de pricing (soft delete)
   */
  async deletePricingStore(storeId: string): Promise<D1ApiResponse<{ success: boolean }>> {
    return this.fetch(`/pricing/stores/${storeId}`, { method: 'DELETE' });
  }

  // --- Products ---

  /**
   * Lista produtos de pricing da loja
   */
  async getPricingProducts(storeId: string): Promise<D1ApiResponse<D1PricingProduct[]>> {
    return this.fetch<D1PricingProduct[]>(`/pricing/products/store/${storeId}`);
  }

  /**
   * Busca produto de pricing por ID
   */
  async getPricingProductById(productId: string): Promise<D1ApiResponse<D1PricingProduct>> {
    return this.fetch<D1PricingProduct>(`/pricing/products/${productId}`);
  }

  /**
   * Cria novo produto de pricing
   */
  async createPricingProduct(product: {
    store_id: string;
    name: string;
    description?: string;
    category?: string;
    direct_cost?: number;
    unit_type?: string;
    desired_margin?: number;
    positioning?: string;
    market_price?: number | null;
    weight?: number;
    monthly_units_estimate?: number;
    is_demo?: boolean;
  }): Promise<D1ApiResponse<D1PricingProduct>> {
    return this.fetch<D1PricingProduct>('/pricing/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  /**
   * Atualiza produto de pricing
   */
  async updatePricingProduct(
    productId: string,
    updates: Partial<D1PricingProduct>
  ): Promise<D1ApiResponse<D1PricingProduct>> {
    return this.fetch<D1PricingProduct>(`/pricing/products/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Deleta produto de pricing (soft delete)
   */
  async deletePricingProduct(productId: string): Promise<D1ApiResponse<{ success: boolean }>> {
    return this.fetch(`/pricing/products/${productId}`, { method: 'DELETE' });
  }

  // --- Indirect Costs ---

  /**
   * Lista custos indiretos da loja
   */
  async getPricingIndirectCosts(storeId: string): Promise<D1ApiResponse<D1PricingIndirectCost[]>> {
    return this.fetch<D1PricingIndirectCost[]>(`/pricing/indirect-costs/store/${storeId}`);
  }

  /**
   * Cria novo custo indireto
   */
  async createPricingIndirectCost(cost: {
    store_id: string;
    name: string;
    category: string;
    amount?: number;
    frequency?: string;
    amortization_months?: number;
    notes?: string;
  }): Promise<D1ApiResponse<D1PricingIndirectCost>> {
    return this.fetch<D1PricingIndirectCost>('/pricing/indirect-costs', {
      method: 'POST',
      body: JSON.stringify(cost),
    });
  }

  /**
   * Atualiza custo indireto
   */
  async updatePricingIndirectCost(
    costId: string,
    updates: Partial<D1PricingIndirectCost>
  ): Promise<D1ApiResponse<D1PricingIndirectCost>> {
    return this.fetch<D1PricingIndirectCost>(`/pricing/indirect-costs/${costId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Deleta custo indireto
   */
  async deletePricingIndirectCost(costId: string): Promise<D1ApiResponse<{ success: boolean }>> {
    return this.fetch(`/pricing/indirect-costs/${costId}`, { method: 'DELETE' });
  }

  // --- Hidden Costs ---

  /**
   * Lista custos ocultos da loja
   */
  async getPricingHiddenCosts(storeId: string): Promise<D1ApiResponse<D1PricingHiddenCost[]>> {
    return this.fetch<D1PricingHiddenCost[]>(`/pricing/hidden-costs/store/${storeId}`);
  }

  /**
   * Cria novo custo oculto
   */
  async createPricingHiddenCost(cost: {
    store_id: string;
    name: string;
    category: string;
    amount?: number;
    frequency?: string;
    amortization_months?: number;
    is_auto_calculated?: boolean;
    auxiliary_data?: any;
    notes?: string;
  }): Promise<D1ApiResponse<D1PricingHiddenCost>> {
    return this.fetch<D1PricingHiddenCost>('/pricing/hidden-costs', {
      method: 'POST',
      body: JSON.stringify(cost),
    });
  }

  /**
   * Atualiza custo oculto
   */
  async updatePricingHiddenCost(
    costId: string,
    updates: Partial<D1PricingHiddenCost>
  ): Promise<D1ApiResponse<D1PricingHiddenCost>> {
    return this.fetch<D1PricingHiddenCost>(`/pricing/hidden-costs/${costId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Deleta custo oculto
   */
  async deletePricingHiddenCost(costId: string): Promise<D1ApiResponse<{ success: boolean }>> {
    return this.fetch(`/pricing/hidden-costs/${costId}`, { method: 'DELETE' });
  }

  // --- Tax Config ---

  /**
   * Busca configuração de impostos da loja
   */
  async getPricingTaxConfig(storeId: string): Promise<D1ApiResponse<D1PricingTaxConfig | null>> {
    return this.fetch<D1PricingTaxConfig | null>(`/pricing/tax-config/store/${storeId}`);
  }

  /**
   * Cria ou atualiza configuração de impostos
   */
  async upsertPricingTaxConfig(
    storeId: string,
    taxRegime: string
  ): Promise<D1ApiResponse<D1PricingTaxConfig>> {
    return this.fetch<D1PricingTaxConfig>(`/pricing/tax-config/store/${storeId}`, {
      method: 'PUT',
      body: JSON.stringify({ tax_regime: taxRegime }),
    });
  }

  // --- Tax Items ---

  /**
   * Lista itens de impostos da loja
   */
  async getPricingTaxItems(storeId: string): Promise<D1ApiResponse<D1PricingTaxItem[]>> {
    return this.fetch<D1PricingTaxItem[]>(`/pricing/tax-items/store/${storeId}`);
  }

  /**
   * Cria novo item de imposto
   */
  async createPricingTaxItem(item: {
    store_id: string;
    name: string;
    category: string;
    percentage?: number;
  }): Promise<D1ApiResponse<D1PricingTaxItem>> {
    return this.fetch<D1PricingTaxItem>('/pricing/tax-items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  /**
   * Atualiza item de imposto
   */
  async updatePricingTaxItem(
    itemId: string,
    updates: Partial<D1PricingTaxItem>
  ): Promise<D1ApiResponse<D1PricingTaxItem>> {
    return this.fetch<D1PricingTaxItem>(`/pricing/tax-items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Deleta item de imposto
   */
  async deletePricingTaxItem(itemId: string): Promise<D1ApiResponse<{ success: boolean }>> {
    return this.fetch(`/pricing/tax-items/${itemId}`, { method: 'DELETE' });
  }

  // ==================== CRM ====================

  // --- Companies ---

  /**
   * Lista empresas do usuário
   */
  async getCrmCompanies(userId: string): Promise<D1ApiResponse<D1CrmCompany[]>> {
    return this.fetch<D1CrmCompany[]>(`/crm/companies/user/${userId}`);
  }

  /**
   * Busca empresa por ID
   */
  async getCrmCompanyById(id: string): Promise<D1ApiResponse<D1CrmCompany>> {
    return this.fetch<D1CrmCompany>(`/crm/companies/${id}`);
  }

  /**
   * Cria nova empresa
   */
  async createCrmCompany(company: {
    user_id: string;
    name: string;
    cnpj?: string;
    industry?: string;
    segment?: string;
    size?: string;
    website?: string;
    address?: string;
    city?: string;
    state?: string;
    phone?: string;
    email?: string;
    linkedin?: string;
    instagram?: string;
    facebook?: string;
    notes?: string;
  }): Promise<D1ApiResponse<D1CrmCompany>> {
    return this.fetch<D1CrmCompany>('/crm/companies', {
      method: 'POST',
      body: JSON.stringify(company),
    });
  }

  /**
   * Atualiza empresa
   */
  async updateCrmCompany(
    id: string,
    updates: Partial<D1CrmCompany>
  ): Promise<D1ApiResponse<D1CrmCompany>> {
    return this.fetch<D1CrmCompany>(`/crm/companies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Deleta empresa
   */
  async deleteCrmCompany(id: string): Promise<D1ApiResponse<{ success: boolean }>> {
    return this.fetch(`/crm/companies/${id}`, { method: 'DELETE' });
  }

  /**
   * Conta empresas do usuário
   */
  async countCrmCompanies(userId: string): Promise<D1ApiResponse<{ count: number }>> {
    return this.fetch(`/crm/companies/count/user/${userId}`);
  }

  // --- Contacts ---

  /**
   * Lista contatos do usuário
   */
  async getCrmContacts(
    userId: string,
    filters?: { search?: string; company_id?: string }
  ): Promise<D1ApiResponse<D1CrmContact[]>> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.company_id) params.append('company_id', filters.company_id);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.fetch<D1CrmContact[]>(`/crm/contacts/user/${userId}${query}`);
  }

  /**
   * Busca contato por ID
   */
  async getCrmContactById(id: string): Promise<D1ApiResponse<D1CrmContact>> {
    return this.fetch<D1CrmContact>(`/crm/contacts/${id}`);
  }

  /**
   * Cria novo contato
   */
  async createCrmContact(contact: {
    user_id: string;
    name: string;
    company_id?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    position?: string;
    role?: string;
    tags?: string[];
    notes?: string;
    source?: string;
    lead_source?: string;
    birth_date?: string;
    address?: string;
    linkedin?: string;
    instagram?: string;
  }): Promise<D1ApiResponse<D1CrmContact>> {
    return this.fetch<D1CrmContact>('/crm/contacts', {
      method: 'POST',
      body: JSON.stringify(contact),
    });
  }

  /**
   * Atualiza contato
   */
  async updateCrmContact(
    id: string,
    updates: Omit<Partial<D1CrmContact>, 'tags'> & { tags?: string[] }
  ): Promise<D1ApiResponse<D1CrmContact>> {
    return this.fetch<D1CrmContact>(`/crm/contacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Deleta contato
   */
  async deleteCrmContact(id: string): Promise<D1ApiResponse<{ success: boolean }>> {
    return this.fetch(`/crm/contacts/${id}`, { method: 'DELETE' });
  }

  /**
   * Busca contatos por empresa
   */
  async getCrmContactsByCompany(companyId: string): Promise<D1ApiResponse<D1CrmContact[]>> {
    return this.fetch<D1CrmContact[]>(`/crm/contacts/company/${companyId}`);
  }

  /**
   * Conta contatos do usuário
   */
  async countCrmContacts(userId: string): Promise<D1ApiResponse<{ count: number }>> {
    return this.fetch(`/crm/contacts/count/user/${userId}`);
  }

  /**
   * Contatos recentes do usuário
   */
  async getRecentCrmContacts(userId: string, limit = 5): Promise<D1ApiResponse<D1CrmContact[]>> {
    return this.fetch<D1CrmContact[]>(`/crm/contacts/recent/user/${userId}?limit=${limit}`);
  }

  // --- Deals ---

  /**
   * Lista deals do usuário
   */
  async getCrmDeals(
    userId: string,
    filters?: { stage?: string; contact_id?: string; company_id?: string }
  ): Promise<D1ApiResponse<D1CrmDeal[]>> {
    const params = new URLSearchParams();
    if (filters?.stage) params.append('stage', filters.stage);
    if (filters?.contact_id) params.append('contact_id', filters.contact_id);
    if (filters?.company_id) params.append('company_id', filters.company_id);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.fetch<D1CrmDeal[]>(`/crm/deals/user/${userId}${query}`);
  }

  /**
   * Busca deal por ID
   */
  async getCrmDealById(id: string): Promise<D1ApiResponse<D1CrmDeal>> {
    return this.fetch<D1CrmDeal>(`/crm/deals/${id}`);
  }

  /**
   * Cria novo deal
   */
  async createCrmDeal(deal: {
    user_id: string;
    title: string;
    contact_id?: string;
    company_id?: string;
    value?: number;
    stage?: string;
    probability?: number;
    expected_close_date?: string;
    source?: string;
    notes?: string;
  }): Promise<D1ApiResponse<D1CrmDeal>> {
    return this.fetch<D1CrmDeal>('/crm/deals', {
      method: 'POST',
      body: JSON.stringify(deal),
    });
  }

  /**
   * Atualiza deal
   */
  async updateCrmDeal(
    id: string,
    updates: Partial<D1CrmDeal>
  ): Promise<D1ApiResponse<D1CrmDeal>> {
    return this.fetch<D1CrmDeal>(`/crm/deals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Deleta deal
   */
  async deleteCrmDeal(id: string): Promise<D1ApiResponse<{ success: boolean }>> {
    return this.fetch(`/crm/deals/${id}`, { method: 'DELETE' });
  }

  /**
   * Busca pipeline (Kanban)
   */
  async getCrmPipeline(userId: string): Promise<D1ApiResponse<D1CrmPipeline>> {
    return this.fetch<D1CrmPipeline>(`/crm/deals/pipeline/user/${userId}`);
  }

  /**
   * Métricas do pipeline
   */
  async getCrmMetrics(userId: string): Promise<D1ApiResponse<D1CrmMetrics>> {
    return this.fetch<D1CrmMetrics>(`/crm/deals/metrics/user/${userId}`);
  }

  /**
   * Conta deals do usuário
   */
  async countCrmDeals(userId: string): Promise<D1ApiResponse<{ count: number }>> {
    return this.fetch(`/crm/deals/count/user/${userId}`);
  }

  // --- Tasks ---

  /**
   * Lista tarefas do usuário
   */
  async getCrmTasks(
    userId: string,
    filters?: {
      completed?: boolean;
      type?: string;
      priority?: string;
      contact_id?: string;
      deal_id?: string;
    }
  ): Promise<D1ApiResponse<D1CrmTask[]>> {
    const params = new URLSearchParams();
    if (filters?.completed !== undefined) params.append('completed', String(filters.completed));
    if (filters?.type) params.append('type', filters.type);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.contact_id) params.append('contact_id', filters.contact_id);
    if (filters?.deal_id) params.append('deal_id', filters.deal_id);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.fetch<D1CrmTask[]>(`/crm/tasks/user/${userId}${query}`);
  }

  /**
   * Busca tarefa por ID
   */
  async getCrmTaskById(id: string): Promise<D1ApiResponse<D1CrmTask>> {
    return this.fetch<D1CrmTask>(`/crm/tasks/${id}`);
  }

  /**
   * Cria nova tarefa
   */
  async createCrmTask(task: {
    user_id: string;
    title: string;
    due_date: string;
    contact_id?: string;
    deal_id?: string;
    description?: string;
    type?: string;
    priority?: string;
  }): Promise<D1ApiResponse<D1CrmTask>> {
    return this.fetch<D1CrmTask>('/crm/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  /**
   * Atualiza tarefa
   */
  async updateCrmTask(
    id: string,
    updates: Partial<D1CrmTask>
  ): Promise<D1ApiResponse<D1CrmTask>> {
    return this.fetch<D1CrmTask>(`/crm/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Marca tarefa como concluída
   */
  async completeCrmTask(id: string): Promise<D1ApiResponse<D1CrmTask>> {
    return this.fetch<D1CrmTask>(`/crm/tasks/${id}/complete`, { method: 'PATCH' });
  }

  /**
   * Marca tarefa como não concluída
   */
  async uncompleteCrmTask(id: string): Promise<D1ApiResponse<D1CrmTask>> {
    return this.fetch<D1CrmTask>(`/crm/tasks/${id}/uncomplete`, { method: 'PATCH' });
  }

  /**
   * Deleta tarefa
   */
  async deleteCrmTask(id: string): Promise<D1ApiResponse<{ success: boolean }>> {
    return this.fetch(`/crm/tasks/${id}`, { method: 'DELETE' });
  }

  /**
   * Tarefas atrasadas
   */
  async getOverdueCrmTasks(userId: string): Promise<D1ApiResponse<D1CrmTask[]>> {
    return this.fetch<D1CrmTask[]>(`/crm/tasks/overdue/user/${userId}`);
  }

  /**
   * Tarefas de hoje
   */
  async getTodayCrmTasks(userId: string): Promise<D1ApiResponse<D1CrmTask[]>> {
    return this.fetch<D1CrmTask[]>(`/crm/tasks/today/user/${userId}`);
  }

  /**
   * Conta tarefas pendentes
   */
  async countPendingCrmTasks(userId: string): Promise<D1ApiResponse<{ count: number }>> {
    return this.fetch(`/crm/tasks/count/pending/user/${userId}`);
  }

  /**
   * Conta tarefas atrasadas
   */
  async countOverdueCrmTasks(userId: string): Promise<D1ApiResponse<{ count: number }>> {
    return this.fetch(`/crm/tasks/count/overdue/user/${userId}`);
  }

  // --- Activities ---

  /**
   * Lista atividades do usuário
   */
  async getCrmActivities(
    userId: string,
    filters?: { limit?: number; type?: string; contact_id?: string; deal_id?: string }
  ): Promise<D1ApiResponse<D1CrmActivity[]>> {
    const params = new URLSearchParams();
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.type) params.append('type', filters.type);
    if (filters?.contact_id) params.append('contact_id', filters.contact_id);
    if (filters?.deal_id) params.append('deal_id', filters.deal_id);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.fetch<D1CrmActivity[]>(`/crm/activities/user/${userId}${query}`);
  }

  /**
   * Busca atividade por ID
   */
  async getCrmActivityById(id: string): Promise<D1ApiResponse<D1CrmActivity>> {
    return this.fetch<D1CrmActivity>(`/crm/activities/${id}`);
  }

  /**
   * Cria nova atividade
   */
  async createCrmActivity(activity: {
    user_id: string;
    type: string;
    description: string;
    contact_id?: string;
    deal_id?: string;
    metadata?: string;
  }): Promise<D1ApiResponse<D1CrmActivity>> {
    return this.fetch<D1CrmActivity>('/crm/activities', {
      method: 'POST',
      body: JSON.stringify(activity),
    });
  }

  /**
   * Deleta atividade
   */
  async deleteCrmActivity(id: string): Promise<D1ApiResponse<{ success: boolean }>> {
    return this.fetch(`/crm/activities/${id}`, { method: 'DELETE' });
  }

  /**
   * Atividades por contato
   */
  async getCrmActivitiesByContact(
    contactId: string,
    limit = 20
  ): Promise<D1ApiResponse<D1CrmActivity[]>> {
    return this.fetch<D1CrmActivity[]>(`/crm/activities/contact/${contactId}?limit=${limit}`);
  }

  /**
   * Atividades por deal
   */
  async getCrmActivitiesByDeal(
    dealId: string,
    limit = 20
  ): Promise<D1ApiResponse<D1CrmActivity[]>> {
    return this.fetch<D1CrmActivity[]>(`/crm/activities/deal/${dealId}?limit=${limit}`);
  }

  /**
   * Estatísticas de atividades por tipo
   */
  async getCrmActivityStats(userId: string): Promise<D1ApiResponse<Record<string, number>>> {
    return this.fetch(`/crm/activities/stats/user/${userId}`);
  }

  /**
   * Conta atividades por período
   */
  async countCrmActivities(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<D1ApiResponse<{ count: number }>> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.fetch(`/crm/activities/count/user/${userId}${query}`);
  }

  // ==================== FITNESS ====================

  // --- Profile ---

  /**
   * Busca perfil fitness do usuário
   */
  async getFitnessProfile(userUuid: string): Promise<D1ApiResponse<D1FitnessProfile | null>> {
    return this.fetch<D1FitnessProfile | null>(`/fitness/profile/user/${userUuid}`);
  }

  /**
   * Cria ou atualiza perfil fitness
   */
  async upsertFitnessProfile(profile: {
    user_uuid: string;
    nome: string;
    idade: number;
    sexo: string;
    peso: number;
    altura: number;
    objetivo: string;
    nivel_atividade: string;
    restricoes_medicas?: string[];
    lesoes?: string[];
    // Training preferences
    dias_treino_semana?: number;
    tempo_treino_minutos?: number;
    preferencia_treino?: string;
    experiencia_treino?: string;
    local_treino?: string;
    modalidade?: string;
    // Diet preferences
    restricoes_alimentares?: string[];
    comidas_favoritas?: string[];
    comidas_evitar?: string[];
    numero_refeicoes?: number;
    horario_treino?: string;
    // Gender
    genero?: string;
    genero_outro?: string;
  }): Promise<D1ApiResponse<D1FitnessProfile>> {
    return this.fetch<D1FitnessProfile>('/fitness/profile', {
      method: 'PUT',
      body: JSON.stringify({
        ...profile,
        restricoes_medicas: JSON.stringify(profile.restricoes_medicas || []),
        lesoes: JSON.stringify(profile.lesoes || []),
        restricoes_alimentares: JSON.stringify(profile.restricoes_alimentares || []),
        comidas_favoritas: JSON.stringify(profile.comidas_favoritas || []),
        comidas_evitar: JSON.stringify(profile.comidas_evitar || []),
      }),
    });
  }

  // --- Treinos ---

  /**
   * Lista treinos do usuário
   */
  async getFitnessTreinos(userUuid: string): Promise<D1ApiResponse<D1FitnessTreino[]>> {
    return this.fetch<D1FitnessTreino[]>(`/fitness/treinos/user/${userUuid}`);
  }

  /**
   * Cria novo treino
   */
  async createFitnessTreino(treino: {
    user_uuid: string;
    nome: string;
    dia_semana: string;
    exercicios: any[];
  }): Promise<D1ApiResponse<D1FitnessTreino>> {
    return this.fetch<D1FitnessTreino>('/fitness/treinos', {
      method: 'POST',
      body: JSON.stringify({
        ...treino,
        exercicios: JSON.stringify(treino.exercicios),
      }),
    });
  }

  /**
   * Atualiza treino
   */
  async updateFitnessTreino(
    id: string,
    updates: Partial<{
      nome: string;
      dia_semana: string;
      exercicios: any[];
    }>
  ): Promise<D1ApiResponse<D1FitnessTreino>> {
    const body: any = { ...updates };
    if (updates.exercicios) {
      body.exercicios = JSON.stringify(updates.exercicios);
    }
    return this.fetch<D1FitnessTreino>(`/fitness/treinos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  /**
   * Deleta treino
   */
  async deleteFitnessTreino(id: string): Promise<D1ApiResponse<{ success: boolean }>> {
    return this.fetch(`/fitness/treinos/${id}`, { method: 'DELETE' });
  }

  /**
   * Substitui todos os treinos do usuário
   */
  async replaceFitnessTreinos(
    userUuid: string,
    treinos: Array<{
      id?: string;
      nome: string;
      dia_semana: string;
      exercicios: any[];
    }>
  ): Promise<D1ApiResponse<D1FitnessTreino[]>> {
    return this.fetch<D1FitnessTreino[]>(`/fitness/treinos/user/${userUuid}/replace`, {
      method: 'PUT',
      body: JSON.stringify(
        treinos.map((t) => ({
          ...t,
          exercicios: JSON.stringify(t.exercicios),
        }))
      ),
    });
  }

  // --- Dieta ---

  /**
   * Busca dieta do usuário
   */
  async getFitnessDieta(userUuid: string): Promise<D1ApiResponse<D1FitnessDieta | null>> {
    return this.fetch<D1FitnessDieta | null>(`/fitness/dieta/user/${userUuid}`);
  }

  /**
   * Cria ou atualiza dieta
   */
  async upsertFitnessDieta(dieta: {
    user_uuid: string;
    calorias: number;
    proteinas: number;
    carboidratos: number;
    gorduras: number;
    refeicoes: any[];
  }): Promise<D1ApiResponse<D1FitnessDieta>> {
    return this.fetch<D1FitnessDieta>('/fitness/dieta', {
      method: 'PUT',
      body: JSON.stringify({
        ...dieta,
        refeicoes: JSON.stringify(dieta.refeicoes),
      }),
    });
  }

  /**
   * Deleta dieta do usuário
   */
  async deleteFitnessDieta(userUuid: string): Promise<D1ApiResponse<{ success: boolean }>> {
    return this.fetch(`/fitness/dieta/user/${userUuid}`, { method: 'DELETE' });
  }

  // --- Gamification ---

  /**
   * Busca dados de gamificação do usuário
   */
  async getFitnessGamification(userUuid: string): Promise<D1ApiResponse<D1FitnessGamification | null>> {
    return this.fetch<D1FitnessGamification | null>(`/fitness/gamification/user/${userUuid}`);
  }

  /**
   * Cria ou atualiza dados de gamificação
   */
  async upsertFitnessGamification(gamification: {
    user_uuid: string;
    current_streak: number;
    longest_streak: number;
    last_activity_date: string | null;
    total_active_days: number;
    total_xp: number;
    current_level: number;
    total_workouts_completed: number;
    perfect_weeks: number;
    perfect_months: number;
    // New stats for trophies
    early_workouts?: number;
    night_workouts?: number;
    diet_days_followed?: number;
    workout_modalities?: string;
    consecutive_perfect_weeks?: number;
    // JSON stringified arrays
    badges: string;
    trophies?: string;
    unique_badges?: string;
    challenges: string;
    goals: string;
    activities: string;
  }): Promise<D1ApiResponse<D1FitnessGamification>> {
    return this.fetch<D1FitnessGamification>('/fitness/gamification', {
      method: 'PUT',
      body: JSON.stringify(gamification),
    });
  }

  // ==================== CONTENT BUSINESS PROFILES ====================

  /**
   * Lista perfis de negócio do usuário
   */
  async getContentProfiles(userId: string): Promise<D1ApiResponse<D1ContentBusinessProfile[]>> {
    return this.fetch<D1ContentBusinessProfile[]>(`/content/profiles/user/${userId}`);
  }

  /**
   * Busca perfil por ID
   */
  async getContentProfile(id: string): Promise<D1ApiResponse<D1ContentBusinessProfile>> {
    return this.fetch<D1ContentBusinessProfile>(`/content/profiles/${id}`);
  }

  /**
   * Busca perfil padrão do usuário
   */
  async getDefaultContentProfile(userId: string): Promise<D1ApiResponse<D1ContentBusinessProfile>> {
    return this.fetch<D1ContentBusinessProfile>(`/content/profiles/default/user/${userId}`);
  }

  /**
   * Cria novo perfil de negócio
   */
  async createContentProfile(profile: {
    user_id: string;
    name: string;
    business_niche: string;
    target_audience?: string;
    brand_voice?: string;
    selected_networks?: string[];
    preferred_content_types?: string[];
    icon?: string;
    is_default?: boolean;
  }): Promise<D1ApiResponse<D1ContentBusinessProfile>> {
    return this.fetch<D1ContentBusinessProfile>('/content/profiles', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  /**
   * Atualiza perfil de negócio
   */
  async updateContentProfile(
    id: string,
    updates: Partial<{
      name: string;
      business_niche: string;
      target_audience: string;
      brand_voice: string;
      selected_networks: string[];
      preferred_content_types: string[];
      icon: string;
    }>
  ): Promise<D1ApiResponse<D1ContentBusinessProfile>> {
    return this.fetch<D1ContentBusinessProfile>(`/content/profiles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Define perfil como padrão
   */
  async setDefaultContentProfile(id: string): Promise<D1ApiResponse<D1ContentBusinessProfile>> {
    return this.fetch<D1ContentBusinessProfile>(`/content/profiles/${id}/set-default`, {
      method: 'PATCH',
    });
  }

  /**
   * Deleta perfil de negócio
   */
  async deleteContentProfile(id: string): Promise<D1ApiResponse<{ success: boolean }>> {
    return this.fetch(`/content/profiles/${id}`, { method: 'DELETE' });
  }

  // ==================== CONTENT LIBRARY ====================

  /**
   * Lista conteúdos da biblioteca por perfil
   */
  async getContentLibrary(
    profileId: string,
    options?: {
      is_favorite?: boolean;
      content_type?: string;
      network?: string;
      folder?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<D1ApiResponse<D1ContentLibraryItem[]>> {
    const params = new URLSearchParams();
    if (options?.is_favorite !== undefined) params.append('is_favorite', String(options.is_favorite));
    if (options?.content_type) params.append('content_type', options.content_type);
    if (options?.network) params.append('network', options.network);
    if (options?.folder) params.append('folder', options.folder);
    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.offset) params.append('offset', String(options.offset));
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.fetch<D1ContentLibraryItem[]>(`/content/library/profile/${profileId}${query}`);
  }

  /**
   * Busca item da biblioteca por ID
   */
  async getContentLibraryItem(id: string): Promise<D1ApiResponse<D1ContentLibraryItem>> {
    return this.fetch<D1ContentLibraryItem>(`/content/library/${id}`);
  }

  /**
   * Cria novo item na biblioteca
   */
  async createContentLibraryItem(item: {
    user_id: string;
    profile_id: string;
    content_type: string;
    network: string;
    content: string;
    title?: string;
    hashtags?: string[];
    image_description?: string;
    best_time?: string;
    variations?: string[];
    tags?: string[];
    folder?: string;
  }): Promise<D1ApiResponse<D1ContentLibraryItem>> {
    return this.fetch<D1ContentLibraryItem>('/content/library', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  /**
   * Atualiza item da biblioteca
   */
  async updateContentLibraryItem(
    id: string,
    updates: Partial<{
      title: string;
      content: string;
      hashtags: string[];
      image_description: string;
      best_time: string;
      variations: string[];
      tags: string[];
      folder: string;
    }>
  ): Promise<D1ApiResponse<D1ContentLibraryItem>> {
    return this.fetch<D1ContentLibraryItem>(`/content/library/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Alterna favorito do item
   */
  async toggleContentLibraryFavorite(id: string): Promise<D1ApiResponse<D1ContentLibraryItem>> {
    return this.fetch<D1ContentLibraryItem>(`/content/library/${id}/toggle-favorite`, {
      method: 'PATCH',
    });
  }

  /**
   * Deleta item da biblioteca
   */
  async deleteContentLibraryItem(id: string): Promise<D1ApiResponse<{ success: boolean }>> {
    return this.fetch(`/content/library/${id}`, { method: 'DELETE' });
  }

  // ==================== CONTENT CALENDAR ====================

  /**
   * Lista entradas do calendário por perfil
   */
  async getContentCalendar(
    profileId: string,
    options?: {
      start_date?: string;
      end_date?: string;
      status?: string;
      network?: string;
    }
  ): Promise<D1ApiResponse<D1ContentCalendarEntry[]>> {
    const params = new URLSearchParams();
    if (options?.start_date) params.append('start_date', options.start_date);
    if (options?.end_date) params.append('end_date', options.end_date);
    if (options?.status) params.append('status', options.status);
    if (options?.network) params.append('network', options.network);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.fetch<D1ContentCalendarEntry[]>(`/content/calendar/profile/${profileId}${query}`);
  }

  /**
   * Busca entrada do calendário por ID
   */
  async getContentCalendarEntry(id: string): Promise<D1ApiResponse<D1ContentCalendarEntry>> {
    return this.fetch<D1ContentCalendarEntry>(`/content/calendar/${id}`);
  }

  /**
   * Cria nova entrada no calendário
   */
  async createContentCalendarEntry(entry: {
    user_id: string;
    profile_id: string;
    scheduled_date: string;
    network: string;
    content_type: string;
    title: string;
    library_content_id?: string;
    day_of_week?: string;
    description?: string;
    hashtags?: string[];
    best_time?: string;
    status?: string;
  }): Promise<D1ApiResponse<D1ContentCalendarEntry>> {
    return this.fetch<D1ContentCalendarEntry>('/content/calendar', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  /**
   * Cria múltiplas entradas no calendário
   */
  async createContentCalendarBulk(entries: Array<{
    user_id: string;
    profile_id: string;
    scheduled_date: string;
    network: string;
    content_type: string;
    title: string;
    library_content_id?: string;
    day_of_week?: string;
    description?: string;
    hashtags?: string[];
    best_time?: string;
    status?: string;
  }>): Promise<D1ApiResponse<{ created: number; entries: D1ContentCalendarEntry[] }>> {
    return this.fetch('/content/calendar/bulk', {
      method: 'POST',
      body: JSON.stringify({ entries }),
    });
  }

  /**
   * Atualiza entrada do calendário
   */
  async updateContentCalendarEntry(
    id: string,
    updates: Partial<{
      scheduled_date: string;
      day_of_week: string;
      network: string;
      content_type: string;
      title: string;
      description: string;
      hashtags: string[];
      best_time: string;
      status: string;
      library_content_id: string;
    }>
  ): Promise<D1ApiResponse<D1ContentCalendarEntry>> {
    return this.fetch<D1ContentCalendarEntry>(`/content/calendar/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Deleta entrada do calendário
   */
  async deleteContentCalendarEntry(id: string): Promise<D1ApiResponse<{ success: boolean }>> {
    return this.fetch(`/content/calendar/${id}`, { method: 'DELETE' });
  }

  /**
   * Deleta todas entradas de um perfil
   */
  async clearContentCalendar(profileId: string): Promise<D1ApiResponse<{ deleted: number }>> {
    return this.fetch(`/content/calendar/profile/${profileId}`, { method: 'DELETE' });
  }

  // ==================== RESUME ====================

  // --- Resume Profiles ---

  /**
   * Lista perfis de currículo do usuário
   */
  async getResumeProfiles(userId: string): Promise<D1ApiResponse<D1ResumeProfile[]>> {
    return this.fetch<D1ResumeProfile[]>(`/resume/profiles/user/${userId}`);
  }

  /**
   * Busca perfil de currículo por ID
   */
  async getResumeProfile(id: string): Promise<D1ApiResponse<D1ResumeProfile>> {
    return this.fetch<D1ResumeProfile>(`/resume/profiles/${id}`);
  }

  /**
   * Busca perfil padrão do usuário
   */
  async getDefaultResumeProfile(userId: string): Promise<D1ApiResponse<D1ResumeProfile>> {
    return this.fetch<D1ResumeProfile>(`/resume/profiles/default/user/${userId}`);
  }

  /**
   * Cria novo perfil de currículo
   */
  async createResumeProfile(profile: {
    user_id: string;
    name: string;
    career_level: string;
    target_role: string;
    industry: string;
    template_style: string;
    preferred_language: string;
    is_default: boolean;
  }): Promise<D1ApiResponse<D1ResumeProfile>> {
    return this.fetch<D1ResumeProfile>('/resume/profiles', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  /**
   * Atualiza perfil de currículo
   */
  async updateResumeProfile(
    id: string,
    updates: Partial<D1ResumeProfile>
  ): Promise<D1ApiResponse<D1ResumeProfile>> {
    return this.fetch<D1ResumeProfile>(`/resume/profiles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Define perfil como padrão
   */
  async setDefaultResumeProfile(
    id: string,
    userId: string
  ): Promise<D1ApiResponse<D1ResumeProfile>> {
    return this.fetch<D1ResumeProfile>(`/resume/profiles/${id}/set-default`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  /**
   * Deleta perfil de currículo
   */
  async deleteResumeProfile(id: string): Promise<D1ApiResponse<{ success: boolean }>> {
    return this.fetch(`/resume/profiles/${id}`, { method: 'DELETE' });
  }

  // --- Resume Library ---

  /**
   * Lista currículos salvos de um perfil
   */
  async getResumeLibrary(
    profileId: string,
    filters?: {
      is_favorite?: boolean;
      tags?: string[];
    }
  ): Promise<D1ApiResponse<D1Resume[]>> {
    const params = new URLSearchParams();
    if (filters?.is_favorite !== undefined) {
      params.append('is_favorite', filters.is_favorite.toString());
    }
    if (filters?.tags && filters.tags.length > 0) {
      params.append('tags', filters.tags.join(','));
    }

    const query = params.toString();
    const endpoint = `/resume/library/profile/${profileId}${query ? `?${query}` : ''}`;
    return this.fetch<D1Resume[]>(endpoint);
  }

  /**
   * Busca currículo por ID
   */
  async getResume(id: string): Promise<D1ApiResponse<D1Resume>> {
    return this.fetch<D1Resume>(`/resume/library/${id}`);
  }

  /**
   * Salva novo currículo
   */
  async createResume(resume: {
    user_id: string;
    profile_id: string;
    version_name: string;
    personal_info: object;
    professional_summary: string;
    experiences: object[];
    education: object[];
    skills: object[];
    languages?: object[];
    certifications?: object[];
    projects?: object[];
    is_favorite?: boolean;
    tags?: string[];
  }): Promise<D1ApiResponse<D1Resume>> {
    return this.fetch<D1Resume>('/resume/library', {
      method: 'POST',
      body: JSON.stringify(resume),
    });
  }

  /**
   * Atualiza currículo
   */
  async updateResume(
    id: string,
    updates: Partial<{
      version_name: string;
      personal_info: object;
      professional_summary: string;
      experiences: object[];
      education: object[];
      skills: object[];
      languages: object[];
      certifications: object[];
      projects: object[];
      is_favorite: boolean;
      tags: string[];
    }>
  ): Promise<D1ApiResponse<D1Resume>> {
    return this.fetch<D1Resume>(`/resume/library/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Alterna favorito do currículo
   */
  async toggleResumeFavorite(id: string): Promise<D1ApiResponse<D1Resume>> {
    return this.fetch<D1Resume>(`/resume/library/${id}/toggle-favorite`, {
      method: 'POST',
    });
  }

  /**
   * Deleta currículo
   */
  async deleteResume(id: string): Promise<D1ApiResponse<{ success: boolean }>> {
    return this.fetch(`/resume/library/${id}`, { method: 'DELETE' });
  }

  // ==================== DOCS ====================

  // --- Folders ---

  /**
   * Lista pastas do usuário
   */
  async getDocsFolders(userId: string): Promise<D1ApiResponse<D1DocsFolder[]>> {
    return this.fetch<D1DocsFolder[]>(`/docs/folders/user/${userId}`);
  }

  /**
   * Busca pasta por ID
   */
  async getDocsFolderById(id: string): Promise<D1ApiResponse<D1DocsFolder>> {
    return this.fetch<D1DocsFolder>(`/docs/folders/${id}`);
  }

  /**
   * Lista pastas filhas de uma pasta
   */
  async getDocsFoldersByParent(
    userId: string,
    parentId: string | null
  ): Promise<D1ApiResponse<D1DocsFolder[]>> {
    const endpoint = parentId
      ? `/docs/folders/user/${userId}/parent/${parentId}`
      : `/docs/folders/user/${userId}/root`;
    return this.fetch<D1DocsFolder[]>(endpoint);
  }

  /**
   * Cria nova pasta
   */
  async createDocsFolder(folder: {
    user_id: string;
    name: string;
    parent_id?: string | null;
    path: string;
  }): Promise<D1ApiResponse<D1DocsFolder>> {
    return this.fetch<D1DocsFolder>('/docs/folders', {
      method: 'POST',
      body: JSON.stringify(folder),
    });
  }

  /**
   * Atualiza pasta
   */
  async updateDocsFolder(
    id: string,
    updates: Partial<{ name: string; parent_id: string | null; path: string }>
  ): Promise<D1ApiResponse<D1DocsFolder>> {
    return this.fetch<D1DocsFolder>(`/docs/folders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Deleta pasta (e todo conteúdo)
   */
  async deleteDocsFolder(id: string): Promise<D1ApiResponse<{ success: boolean }>> {
    return this.fetch(`/docs/folders/${id}`, { method: 'DELETE' });
  }

  // --- Documents ---

  /**
   * Lista documentos do usuário
   */
  async getDocsDocuments(
    userId: string,
    options?: { folder_id?: string | null; is_favorite?: boolean }
  ): Promise<D1ApiResponse<D1DocsDocument[]>> {
    const params = new URLSearchParams();
    if (options?.folder_id !== undefined) {
      params.append('folder_id', options.folder_id === null ? 'null' : options.folder_id);
    }
    if (options?.is_favorite !== undefined) {
      params.append('is_favorite', String(options.is_favorite));
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.fetch<D1DocsDocument[]>(`/docs/documents/user/${userId}${query}`);
  }

  /**
   * Busca documento por ID
   */
  async getDocsDocumentById(id: string): Promise<D1ApiResponse<D1DocsDocument>> {
    return this.fetch<D1DocsDocument>(`/docs/documents/${id}`);
  }

  /**
   * Lista documentos recentes do usuário
   */
  async getRecentDocsDocuments(
    userId: string,
    limit = 10
  ): Promise<D1ApiResponse<D1DocsDocument[]>> {
    return this.fetch<D1DocsDocument[]>(`/docs/documents/user/${userId}/recent?limit=${limit}`);
  }

  /**
   * Lista documentos favoritos do usuário
   */
  async getFavoriteDocsDocuments(userId: string): Promise<D1ApiResponse<D1DocsDocument[]>> {
    return this.fetch<D1DocsDocument[]>(`/docs/documents/user/${userId}/favorites`);
  }

  /**
   * Cria novo documento
   */
  async createDocsDocument(document: {
    user_id: string;
    folder_id?: string | null;
    name: string;
    original_name: string;
    mime_type: string;
    size: number;
    r2_key: string;
    r2_url?: string;
  }): Promise<D1ApiResponse<D1DocsDocument>> {
    return this.fetch<D1DocsDocument>('/docs/documents', {
      method: 'POST',
      body: JSON.stringify(document),
    });
  }

  /**
   * Atualiza documento
   */
  async updateDocsDocument(
    id: string,
    updates: Partial<{
      name: string;
      folder_id: string | null;
      r2_url: string;
      extraction_status: string;
      is_favorite: boolean;
    }>
  ): Promise<D1ApiResponse<D1DocsDocument>> {
    return this.fetch<D1DocsDocument>(`/docs/documents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Alterna favorito do documento
   */
  async toggleDocsDocumentFavorite(id: string): Promise<D1ApiResponse<D1DocsDocument>> {
    return this.fetch<D1DocsDocument>(`/docs/documents/${id}/toggle-favorite`, {
      method: 'PATCH',
    });
  }

  /**
   * Deleta documento
   */
  async deleteDocsDocument(id: string): Promise<D1ApiResponse<{ success: boolean; r2_key?: string }>> {
    return this.fetch(`/docs/documents/${id}`, { method: 'DELETE' });
  }

  // --- Content & Chunks ---

  /**
   * Busca conteúdo extraído de um documento
   */
  async getDocsContent(documentId: string): Promise<D1ApiResponse<D1DocsContent | null>> {
    return this.fetch<D1DocsContent | null>(`/docs/content/document/${documentId}`);
  }

  /**
   * Cria conteúdo extraído
   */
  async createDocsContent(content: {
    document_id: string;
    raw_text?: string | null;
    word_count?: number;
  }): Promise<D1ApiResponse<D1DocsContent>> {
    return this.fetch<D1DocsContent>('/docs/content', {
      method: 'POST',
      body: JSON.stringify(content),
    });
  }

  /**
   * Deleta conteúdo de um documento
   */
  async deleteDocsContent(documentId: string): Promise<D1ApiResponse<{ success: boolean }>> {
    return this.fetch(`/docs/content/document/${documentId}`, { method: 'DELETE' });
  }

  /**
   * Lista chunks de um documento
   */
  async getDocsChunks(documentId: string): Promise<D1ApiResponse<D1DocsChunk[]>> {
    return this.fetch<D1DocsChunk[]>(`/docs/chunks/document/${documentId}`);
  }

  /**
   * Cria múltiplos chunks
   */
  async createDocsChunks(chunks: Array<{
    document_id: string;
    user_id: string;
    chunk_index: number;
    content: string;
  }>): Promise<D1ApiResponse<{ success: boolean; count: number }>> {
    return this.fetch('/docs/chunks/batch', {
      method: 'POST',
      body: JSON.stringify({ chunks }),
    });
  }

  /**
   * Deleta chunks de um documento
   */
  async deleteDocsChunks(documentId: string): Promise<D1ApiResponse<{ success: boolean }>> {
    return this.fetch(`/docs/chunks/document/${documentId}`, { method: 'DELETE' });
  }

  /**
   * Busca full-text nos chunks do usuário
   */
  async searchDocsChunks(
    userId: string,
    query: string,
    limit = 10
  ): Promise<D1ApiResponse<D1DocsSearchResult[]>> {
    return this.fetch<D1DocsSearchResult[]>(
      `/docs/chunks/search?user_id=${encodeURIComponent(userId)}&query=${encodeURIComponent(query)}&limit=${limit}`
    );
  }

  /**
   * Estatísticas de documentos do usuário
   */
  async getDocsStats(userId: string): Promise<D1ApiResponse<{
    total_documents: number;
    total_folders: number;
    total_size: number;
    documents_by_type: Record<string, number>;
    extraction_status: Record<string, number>;
  }>> {
    return this.fetch(`/docs/stats/user/${userId}`);
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
