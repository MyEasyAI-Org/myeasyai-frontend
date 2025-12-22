// Serviço de Autenticação - Cloudflare Workers
// Substitui Supabase Auth completamente

const API_URL = import.meta.env.VITE_CLOUDFLARE_D1_API_URL;
const TOKEN_KEY = 'myeasyai_auth_token';
const USER_KEY = 'myeasyai_user';

/**
 * Tipo do usuário autenticado
 */
export interface CloudflareUser {
  uuid: string;
  email: string;
  name?: string;
  preferred_name?: string;
  avatar_url?: string;
  country?: string;
  preferred_language?: string;
}

/**
 * Tipo do resultado de autenticação
 */
export interface AuthResult {
  success: boolean;
  user?: CloudflareUser;
  token?: string;
  error?: string;
}

/**
 * Callbacks para mudança de estado de auth
 */
type AuthStateChangeCallback = (user: CloudflareUser | null) => void;

/**
 * Serviço de Autenticação usando Cloudflare Workers
 */
class CloudflareAuthService {
  private currentUser: CloudflareUser | null = null;
  private listeners: Set<AuthStateChangeCallback> = new Set();
  private initialized = false;

  constructor() {
    // Restaurar sessão do localStorage
    this.restoreSession();
  }

  /**
   * Restaura sessão do localStorage
   */
  private restoreSession(): void {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userJson = localStorage.getItem(USER_KEY);

      if (token && userJson) {
        this.currentUser = JSON.parse(userJson);
        // Validar token em background
        this.validateToken(token);
      }

      this.initialized = true;
    } catch (error) {
      console.error('❌ [AUTH] Error restoring session:', error);
      this.clearSession();
    }
  }

  /**
   * Valida token com o servidor
   */
  private async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const { user } = await response.json();
        this.currentUser = user;
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.notifyListeners();
        return true;
      } else {
        // Token inválido, limpar sessão
        this.clearSession();
        return false;
      }
    } catch (error) {
      console.error('❌ [AUTH] Token validation error:', error);
      return false;
    }
  }

  /**
   * Limpa sessão local
   */
  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser = null;
    this.notifyListeners();
  }

  /**
   * Notifica listeners sobre mudança de auth
   */
  private notifyListeners(): void {
    this.listeners.forEach((callback) => callback(this.currentUser));
  }

  /**
   * Salva sessão no localStorage
   */
  private saveSession(token: string, user: CloudflareUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUser = user;
    this.notifyListeners();
  }

  // ==================== PUBLIC API ====================

  /**
   * Inicia login com Google (redirect)
   */
  signInWithGoogle(): void {
    // Redirecionar para o endpoint OAuth do Worker com redirect_to para voltar ao frontend atual
    const currentOrigin = window.location.origin;
    window.location.href = `${API_URL}/auth/google?redirect_to=${encodeURIComponent(currentOrigin)}`;
  }

  /**
   * Processa callback do OAuth (chamado na página /auth/callback)
   */
  async handleAuthCallback(): Promise<AuthResult> {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (error) {
      return { success: false, error };
    }

    if (!token) {
      return { success: false, error: 'No token received' };
    }

    // Validar e salvar token
    const isValid = await this.validateToken(token);

    if (isValid && this.currentUser) {
      this.saveSession(token, this.currentUser);
      return { success: true, user: this.currentUser, token };
    }

    return { success: false, error: 'Invalid token' };
  }

  /**
   * Login com Google usando popup/token (alternativa ao redirect)
   * Útil se você tiver o Google Sign-In SDK no frontend
   */
  async signInWithGoogleToken(accessToken: string): Promise<AuthResult> {
    try {
      const response = await fetch(`${API_URL}/auth/google/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: accessToken }),
      });

      const data = await response.json();

      if (response.ok && data.token && data.user) {
        this.saveSession(data.token, data.user);
        console.log('✅ [AUTH] Google login successful:', data.user.email);
        return { success: true, user: data.user, token: data.token };
      }

      return { success: false, error: data.error || 'Login failed' };
    } catch (error: any) {
      console.error('❌ [AUTH] Google token login error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Login com email/senha
   */
  async signInWithPassword(email: string, password: string): Promise<AuthResult> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token && data.user) {
        this.saveSession(data.token, data.user);
        console.log('✅ [AUTH] Login successful:', data.user.email);
        return { success: true, user: data.user, token: data.token };
      }

      return { success: false, error: data.error || 'Login failed' };
    } catch (error: any) {
      console.error('❌ [AUTH] Login error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Registro com email/senha
   */
  async signUp(email: string, password: string, name?: string): Promise<AuthResult> {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (response.ok && data.token && data.user) {
        this.saveSession(data.token, data.user);
        console.log('✅ [AUTH] Signup successful:', data.user.email);
        return { success: true, user: data.user, token: data.token };
      }

      return { success: false, error: data.error || 'Signup failed' };
    } catch (error: any) {
      console.error('❌ [AUTH] Signup error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Logout
   */
  async signOut(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('❌ [AUTH] Logout error:', error);
    } finally {
      this.clearSession();
      console.log('✅ [AUTH] Logged out');
    }
  }

  /**
   * Retorna usuário atual
   */
  getUser(): CloudflareUser | null {
    return this.currentUser;
  }

  /**
   * Retorna token atual
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Verifica se está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.currentUser && !!this.getToken();
  }

  /**
   * Aguarda inicialização do auth
   */
  async waitForInit(): Promise<void> {
    if (this.initialized) return;

    return new Promise((resolve) => {
      const check = () => {
        if (this.initialized) {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });
  }

  /**
   * Registra callback para mudança de estado de auth
   */
  onAuthStateChange(callback: AuthStateChangeCallback): () => void {
    this.listeners.add(callback);

    // Chamar imediatamente com estado atual
    callback(this.currentUser);

    // Retornar função de unsubscribe
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Renova o token
   */
  async refreshToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const { token: newToken } = await response.json();
        localStorage.setItem(TOKEN_KEY, newToken);
        console.log('✅ [AUTH] Token refreshed');
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ [AUTH] Token refresh error:', error);
      return false;
    }
  }

  /**
   * Retorna headers de autenticação para requests
   */
  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    if (!token) return {};

    return {
      Authorization: `Bearer ${token}`,
    };
  }
}

// Export singleton
export const cloudflareAuth = new CloudflareAuthService();

// Export como default também
export default cloudflareAuth;
