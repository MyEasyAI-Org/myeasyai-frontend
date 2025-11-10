// Serviço de autenticação
// Contém lógica de negócio para todas as operações de autenticação

import { supabase } from '../lib/api-clients/supabase-client';

/**
 * Serviço responsável por todas as operações de autenticação
 * Inclui login social, login com email, registro, logout, etc.
 */
export class AuthService {
  /**
   * Login com Google
   */
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { data, error };
  }

  /**
   * Login com Facebook
   */
  async signInWithFacebook() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { data, error };
  }

  /**
   * Login com Apple
   */
  async signInWithApple() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { data, error };
  }

  /**
   * Login com email e senha
   */
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  /**
   * Registro com email e senha
   */
  async signUpWithEmail(
    email: string,
    password: string,
    fullName: string,
    preferredName?: string,
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          name: fullName,
          preferred_name: preferredName || '',
        },
      },
    });
    return { data, error };
  }

  /**
   * Logout
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  /**
   * Obtém o usuário atual
   */
  async getCurrentUser() {
    return await supabase.auth.getUser();
  }

  /**
   * Obtém a sessão atual
   */
  async getCurrentSession() {
    return await supabase.auth.getSession();
  }

  /**
   * Verifica se há um usuário autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    const { data } = await this.getCurrentSession();
    return !!data.session;
  }
}

// Export singleton instance
export const authService = new AuthService();
