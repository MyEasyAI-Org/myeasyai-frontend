// Serviço de Autenticação V2 - Com Fallback Automático
// PRIMARY: Cloudflare Workers
// FALLBACK: Supabase Auth (se Cloudflare falhar)
//
// O USUÁRIO NUNCA FICA SEM SERVIÇO!

import { supabase } from '../lib/api-clients/supabase-client';
import { d1Client } from '../lib/api-clients/d1-client';

const API_URL = import.meta.env.VITE_CLOUDFLARE_D1_API_URL;
const TOKEN_KEY = 'myeasyai_auth_token';
const USER_KEY = 'myeasyai_user';
const AUTH_SOURCE_KEY = 'myeasyai_auth_source';

/**
 * Tipo do usuário autenticado
 */
export interface AuthUser {
  uuid: string;
  email: string;
  name?: string;
  preferred_name?: string;
  avatar_url?: string;
  country?: string;
  preferred_language?: string;
}

/**
 * Resultado de autenticação
 */
export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  token?: string;
  error?: string;
  source: 'cloudflare' | 'supabase';
}

/**
 * Callbacks para mudança de estado
 */
type AuthStateChangeCallback = (user: AuthUser | null) => void;

/**
 * Serviço de Auth com Fallback Automático
 * Cloudflare Primary → Supabase Fallback
 */
class AuthServiceV2 {
  private currentUser: AuthUser | null = null;
  private listeners: Set<AuthStateChangeCallback> = new Set();
  private initialized = false;
  private authSource: 'cloudflare' | 'supabase' | null = null;

  constructor() {
    this.init();
  }

  /**
   * Inicializa o serviço
   */
  private async init(): Promise<void> {
    // Restaurar sessão
    await this.restoreSession();

    // Configurar listener do Supabase (para fallback)
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (this.authSource === 'supabase' && session?.user) {
        this.currentUser = this.mapSupabaseUser(session.user);
        localStorage.setItem(USER_KEY, JSON.stringify(this.currentUser));
        this.notifyListeners();
      }
    });

    this.initialized = true;
    console.log('📊 [AUTH V2] Initialized - Cloudflare Primary, Supabase Fallback');
  }

  /**
   * Restaura sessão existente
   */
  private async restoreSession(): Promise<void> {
    try {
      const source = localStorage.getItem(AUTH_SOURCE_KEY) as 'cloudflare' | 'supabase' | null;
      const token = localStorage.getItem(TOKEN_KEY);
      const userJson = localStorage.getItem(USER_KEY);

      if (source === 'cloudflare' && token) {
        // Validar token do Cloudflare
        const isValid = await this.validateCloudflareToken(token);
        if (isValid) {
          this.authSource = 'cloudflare';
          return;
        }
      }

      // Tentar Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        this.currentUser = this.mapSupabaseUser(session.user);
        this.authSource = 'supabase';
        localStorage.setItem(USER_KEY, JSON.stringify(this.currentUser));
        localStorage.setItem(AUTH_SOURCE_KEY, 'supabase');

        // Sincronizar usuário com D1
        await this.syncUserToD1(this.currentUser);

        console.log('✅ [AUTH V2] Session restored from Supabase');
        return;
      }

      // Nenhuma sessão válida
      this.clearSession();
    } catch (error) {
      console.error('❌ [AUTH V2] Error restoring session:', error);
      this.clearSession();
    }
  }

  /**
   * Valida token do Cloudflare
   */
  private async validateCloudflareToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const { user } = await response.json();
        this.currentUser = user;
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.notifyListeners();
        console.log('✅ [AUTH V2] Cloudflare token valid');
        return true;
      }
      return false;
    } catch (error) {
      console.warn('⚠️ [AUTH V2] Cloudflare validation failed:', error);
      return false;
    }
  }

  /**
   * Mapeia usuário do Supabase para formato padrão
   */
  private mapSupabaseUser(supabaseUser: any): AuthUser {
    return {
      uuid: supabaseUser.id,
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name,
      preferred_name: supabaseUser.user_metadata?.preferred_name,
      avatar_url: supabaseUser.user_metadata?.avatar_url,
    };
  }

  /**
   * Sincroniza usuário com D1 (Cloudflare)
   * Garante que o usuário existe no D1 mesmo quando logou via Supabase
   */
  private async syncUserToD1(user: AuthUser): Promise<void> {
    if (!d1Client.isEnabled()) {
      console.log('⚠️ [AUTH V2] D1 not enabled, skipping sync');
      return;
    }

    try {
      // Usar endpoint ensureUser que faz upsert
      const result = await d1Client.ensureUser({
        uuid: user.uuid,
        email: user.email,
        name: user.name,
        preferred_name: user.preferred_name,
        avatar_url: user.avatar_url,
      });

      if (result.error) {
        console.error('❌ [AUTH V2] Failed to sync user to D1:', result.error);
      } else {
        console.log('✅ [AUTH V2] User synced to D1:', user.email, result.data?.created ? '(created)' : '(existing)');
      }
    } catch (error) {
      // Não falhar o login se a sincronização falhar
      console.error('❌ [AUTH V2] Error syncing user to D1:', error);
    }
  }

  /**
   * Limpa sessão
   */
  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(AUTH_SOURCE_KEY);
    this.currentUser = null;
    this.authSource = null;
    this.notifyListeners();
  }

  /**
   * Notifica listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach((cb) => cb(this.currentUser));
  }

  /**
   * Salva sessão do Cloudflare
   */
  private saveCloudflareSession(token: string, user: AuthUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_SOURCE_KEY, 'cloudflare');
    this.currentUser = user;
    this.authSource = 'cloudflare';
    this.notifyListeners();
  }

  // ==================== PUBLIC API ====================

  /**
   * Login com Google
   * Tenta Cloudflare primeiro, fallback para Supabase
   */
  async signInWithGoogle(): Promise<AuthResult> {
    // 1️⃣ TENTAR CLOUDFLARE PRIMEIRO
    try {
      const cloudflareAvailable = await this.checkCloudflareHealth();

      if (cloudflareAvailable) {
        // Redirecionar para OAuth do Cloudflare com redirect_to para voltar ao frontend atual
        const currentOrigin = window.location.origin;
        window.location.href = `${API_URL}/auth/google?redirect_to=${encodeURIComponent(currentOrigin)}`;
        return { success: true, source: 'cloudflare' };
      }
    } catch (error) {
      console.warn('⚠️ [AUTH V2] Cloudflare OAuth unavailable:', error);
    }

    // 2️⃣ FALLBACK PARA SUPABASE
    console.log('⚠️ [AUTH V2] Falling back to Supabase for Google OAuth');

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { success: false, error: error.message, source: 'supabase' };
      }

      return { success: true, source: 'supabase' };
    } catch (error: any) {
      return { success: false, error: error.message, source: 'supabase' };
    }
  }

  /**
   * Processa callback de OAuth
   * Detecta automaticamente se veio do Cloudflare ou Supabase
   */
  async handleAuthCallback(): Promise<AuthResult> {
    const urlParams = new URLSearchParams(window.location.search);

    // Verificar se é callback do Cloudflare (tem token na URL)
    const cloudflareToken = urlParams.get('token');
    if (cloudflareToken) {
      const isValid = await this.validateCloudflareToken(cloudflareToken);
      if (isValid && this.currentUser) {
        this.saveCloudflareSession(cloudflareToken, this.currentUser);
        console.log('✅ [AUTH V2] Cloudflare OAuth callback successful');
        return { success: true, user: this.currentUser, token: cloudflareToken, source: 'cloudflare' };
      }
      return { success: false, error: 'Invalid Cloudflare token', source: 'cloudflare' };
    }

    // Verificar se é callback do Supabase
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      return { success: false, error: error.message, source: 'supabase' };
    }

    if (session?.user) {
      this.currentUser = this.mapSupabaseUser(session.user);
      this.authSource = 'supabase';
      localStorage.setItem(USER_KEY, JSON.stringify(this.currentUser));
      localStorage.setItem(AUTH_SOURCE_KEY, 'supabase');
      this.notifyListeners();

      // Sincronizar usuário com D1 (Cloudflare) para garantir que existe lá também
      await this.syncUserToD1(this.currentUser);

      console.log('✅ [AUTH V2] Supabase OAuth callback successful');
      return { success: true, user: this.currentUser, source: 'supabase' };
    }

    return { success: false, error: 'No session found', source: 'supabase' };
  }

  /**
   * Login com email/senha
   * Cloudflare Primary → Supabase Fallback
   */
  async signInWithPassword(email: string, password: string): Promise<AuthResult> {
    // 1️⃣ TENTAR CLOUDFLARE PRIMEIRO
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const { token, user } = await response.json();
        this.saveCloudflareSession(token, user);
        console.log('✅ [AUTH V2] Cloudflare login successful');
        return { success: true, user, token, source: 'cloudflare' };
      }

      // Se for erro de credenciais, não fazer fallback
      if (response.status === 401) {
        const { error } = await response.json();
        return { success: false, error: error || 'Invalid credentials', source: 'cloudflare' };
      }
    } catch (error) {
      console.warn('⚠️ [AUTH V2] Cloudflare login failed, trying Supabase:', error);
    }

    // 2️⃣ FALLBACK PARA SUPABASE
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message, source: 'supabase' };
      }

      if (data.user) {
        this.currentUser = this.mapSupabaseUser(data.user);
        this.authSource = 'supabase';
        localStorage.setItem(USER_KEY, JSON.stringify(this.currentUser));
        localStorage.setItem(AUTH_SOURCE_KEY, 'supabase');
        this.notifyListeners();

        // Sincronizar usuário com D1 (Cloudflare)
        await this.syncUserToD1(this.currentUser);

        console.log('✅ [AUTH V2] Supabase login successful (fallback)');
        return { success: true, user: this.currentUser, source: 'supabase' };
      }

      return { success: false, error: 'Login failed', source: 'supabase' };
    } catch (error: any) {
      return { success: false, error: error.message, source: 'supabase' };
    }
  }

  /**
   * Registro com email/senha
   * Cloudflare Primary → Supabase Fallback
   */
  async signUp(email: string, password: string, name?: string): Promise<AuthResult> {
    // 1️⃣ TENTAR CLOUDFLARE PRIMEIRO
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (response.ok) {
        const { token, user } = await response.json();
        this.saveCloudflareSession(token, user);
        console.log('✅ [AUTH V2] Cloudflare signup successful');
        return { success: true, user, token, source: 'cloudflare' };
      }

      // Se email já existe, retornar erro
      if (response.status === 409) {
        const { error } = await response.json();
        return { success: false, error: error || 'Email already registered', source: 'cloudflare' };
      }
    } catch (error) {
      console.warn('⚠️ [AUTH V2] Cloudflare signup failed, trying Supabase:', error);
    }

    // 2️⃣ FALLBACK PARA SUPABASE
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, name },
        },
      });

      if (error) {
        return { success: false, error: error.message, source: 'supabase' };
      }

      if (data.user) {
        this.currentUser = this.mapSupabaseUser(data.user);
        // Adicionar nome ao currentUser se fornecido
        if (name) {
          this.currentUser.name = name;
        }
        this.authSource = 'supabase';
        localStorage.setItem(USER_KEY, JSON.stringify(this.currentUser));
        localStorage.setItem(AUTH_SOURCE_KEY, 'supabase');
        this.notifyListeners();

        // Sincronizar usuário com D1 (Cloudflare)
        await this.syncUserToD1(this.currentUser);

        console.log('✅ [AUTH V2] Supabase signup successful (fallback)');
        return { success: true, user: this.currentUser, source: 'supabase' };
      }

      return { success: false, error: 'Signup failed', source: 'supabase' };
    } catch (error: any) {
      return { success: false, error: error.message, source: 'supabase' };
    }
  }

  /**
   * Logout
   */
  async signOut(): Promise<void> {
    try {
      // Logout do Cloudflare
      if (this.authSource === 'cloudflare') {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => {});
        }
      }

      // Logout do Supabase (sempre, para garantir)
      await supabase.auth.signOut().catch(() => {});
    } catch (error) {
      console.error('❌ [AUTH V2] Logout error:', error);
    } finally {
      this.clearSession();
      console.log('✅ [AUTH V2] Logged out');
    }
  }

  /**
   * Verifica se Cloudflare está disponível
   */
  private async checkCloudflareHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

      const response = await fetch(`${API_URL}/health`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Retorna usuário atual
   */
  getUser(): AuthUser | null {
    return this.currentUser;
  }

  /**
   * Retorna token (se autenticado via Cloudflare)
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Verifica se está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  /**
   * Retorna fonte da autenticação atual
   */
  getAuthSource(): 'cloudflare' | 'supabase' | null {
    return this.authSource;
  }

  /**
   * Aguarda inicialização
   */
  async waitForInit(): Promise<void> {
    while (!this.initialized) {
      await new Promise((r) => setTimeout(r, 50));
    }
  }

  /**
   * Registra listener de mudança de auth
   */
  onAuthStateChange(callback: AuthStateChangeCallback): () => void {
    this.listeners.add(callback);
    callback(this.currentUser);
    return () => this.listeners.delete(callback);
  }

  /**
   * Retorna headers de autenticação
   */
  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    if (this.authSource === 'cloudflare' && token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }
}

// Export singleton
export const authService = new AuthServiceV2();
export default authService;
