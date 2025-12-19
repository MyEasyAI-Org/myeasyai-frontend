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
  private initPromise: Promise<void>;
  private authSource: 'cloudflare' | 'supabase' | null = null;

  constructor() {
    // Store the init promise so waitForInit() can properly await it
    this.initPromise = this.init();
  }

  /**
   * Inicializa o serviço
   */
  private async init(): Promise<void> {
    console.log('🔐 [AUTH V2] Starting initialization...');

    // Restaurar sessão FIRST and wait for it to complete
    await this.restoreSession();

    console.log('🔐 [AUTH V2] Session restore complete, user:', this.currentUser?.email);

    // Configurar listener do Supabase (para fallback e OAuth)
    // IMPORTANT: Always process Supabase auth events when there's a session
    // This is needed because OAuth with Google always goes through Supabase
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 [AUTH V2] Supabase auth event:', event, session?.user?.email);

      if (session?.user) {
        // If we have a Supabase session, update the state
        this.currentUser = this.mapSupabaseUser(session.user);
        this.authSource = 'supabase';
        localStorage.setItem(USER_KEY, JSON.stringify(this.currentUser));
        localStorage.setItem(AUTH_SOURCE_KEY, 'supabase');

        // Sync user to D1 for consistency
        if (event === 'SIGNED_IN') {
          await this.syncUserToD1(this.currentUser);
        }

        this.notifyListeners();
      } else if (event === 'SIGNED_OUT') {
        // Only clear if we were using Supabase auth
        if (this.authSource === 'supabase') {
          this.clearSession();
        }
      }
    });

    // Mark as initialized AFTER everything is done
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
    console.log('🔐 [AUTH V2] signInWithGoogle called');

    // 1️⃣ TENTAR CLOUDFLARE PRIMEIRO
    try {
      console.log('🔐 [AUTH V2] Checking Cloudflare health...');
      const cloudflareAvailable = await this.checkCloudflareHealth();
      console.log('🔐 [AUTH V2] Cloudflare available:', cloudflareAvailable);

      if (cloudflareAvailable) {
        // Redirecionar para OAuth do Cloudflare com redirect_to para voltar ao frontend atual
        const currentOrigin = window.location.origin;
        console.log('🔐 [AUTH V2] Redirecting to Cloudflare OAuth...');
        window.location.href = `${API_URL}/auth/google?redirect_to=${encodeURIComponent(currentOrigin)}`;
        return { success: true, source: 'cloudflare' };
      }
    } catch (error) {
      console.warn('⚠️ [AUTH V2] Cloudflare OAuth unavailable:', error);
    }

    // 2️⃣ FALLBACK PARA SUPABASE
    console.log('⚠️ [AUTH V2] Falling back to Supabase for Google OAuth');
    console.log('🔐 [AUTH V2] Redirect URL will be:', window.location.origin);

    try {
      // IMPORTANT: Don't use /auth/callback - let Supabase handle the redirect to origin
      // The detectSessionInUrl option in the client config will process the hash/params
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      console.log('🔐 [AUTH V2] Supabase signInWithOAuth result:', { data, error });

      if (error) {
        console.error('❌ [AUTH V2] Supabase OAuth error:', error);
        return { success: false, error: error.message, source: 'supabase' };
      }

      console.log('✅ [AUTH V2] Supabase OAuth initiated, redirecting...');
      return { success: true, source: 'supabase' };
    } catch (error: any) {
      console.error('❌ [AUTH V2] Exception in Supabase OAuth:', error);
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
   * Now properly awaits the init promise instead of polling
   */
  async waitForInit(): Promise<void> {
    if (this.initialized) {
      return;
    }
    // Wait for the actual init promise to complete
    await this.initPromise;
  }

  /**
   * Registra listener de mudança de auth
   * IMPORTANT: Now waits for initialization before calling callback
   * This prevents the callback from being called with undefined before session is restored
   */
  onAuthStateChange(callback: AuthStateChangeCallback): () => void {
    this.listeners.add(callback);

    // Wait for initialization before calling callback with current state
    // This prevents race conditions where callback fires before session restore
    this.initPromise.then(() => {
      // Only call if listener is still registered (wasn't unsubscribed)
      if (this.listeners.has(callback)) {
        callback(this.currentUser);
      }
    });

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
