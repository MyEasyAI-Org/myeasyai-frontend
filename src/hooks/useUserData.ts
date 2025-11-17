import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '../lib/api-clients/supabase-client';
import type { SubscriptionPlan } from '../constants/plans';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export type UserProfile = {
  name: string;
  preferred_name?: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  company?: string;
};

export type SubscriptionData = {
  plan: SubscriptionPlan;
  status: 'active' | 'inactive' | 'cancelled';
  start_date: string;
  end_date?: string;
  tokens_used: number;
  tokens_limit: number;
  requests_this_month: number;
  next_billing_date?: string;
  billing_cycle?: string;
  payment_method?: string;
};

export type UserProduct = {
  id: string;
  product_name: string;
  product_status: string;
  subscribed_at: string;
  sites_created: number;
  consultations_made: number;
};

export type CadastralInfo = {
  country: string;
  postal_code: string;
  address: string;
  preferred_language: string;
  created_at: string;
  last_online: string;
};

type CacheTimestamps = {
  profile: number | null;
  subscription: number | null;
  products: number | null;
};

// ============================================================================
// CONFIGURATION
// ============================================================================

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

const TIMEOUTS = {
  SESSION: 8000, // 8s
  USER_DATA: 6000, // 6s
  PRODUCTS: 5000, // 5s
  UPDATE: 10000, // 10s
} as const;

const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  DELAYS: [1000, 2000, 4000], // 1s, 2s, 4s
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Retry an async operation with exponential backoff
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = RETRY_CONFIG.MAX_ATTEMPTS,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on the last attempt
      if (attempt === maxRetries - 1) {
        break;
      }

      // Wait before retrying
      const delay = RETRY_CONFIG.DELAYS[attempt] || RETRY_CONFIG.DELAYS[RETRY_CONFIG.DELAYS.length - 1];
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // All retries failed
  throw lastError;
}

/**
 * Execute a promise with a timeout
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${operation} excedeu o tempo limite de ${timeoutMs / 1000}s`)),
        timeoutMs,
      ),
    ),
  ]);
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useUserData() {
  // ============================================================================
  // STATE
  // ============================================================================

  const [userUuid, setUserUuid] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Carregando...',
    email: 'Carregando...',
  });
  const [subscription, setSubscription] = useState<SubscriptionData>({
    plan: 'free',
    status: 'active',
    start_date: new Date().toISOString(),
    tokens_used: 0,
    tokens_limit: 1000,
    requests_this_month: 0,
  });
  const [userProducts, setUserProducts] = useState<UserProduct[]>([]);
  const [cadastralInfo, setCadastralInfo] = useState<CadastralInfo>({
    country: '',
    postal_code: '',
    address: '',
    preferred_language: '',
    created_at: '',
    last_online: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState('Iniciando...');
  const [error, setError] = useState<Error | null>(null);

  // Cache timestamps
  const cacheTimestamps = useRef<CacheTimestamps>({
    profile: null,
    subscription: null,
    products: null,
  });

  // ============================================================================
  // CACHE HELPERS
  // ============================================================================

  const isCacheValid = (resourceKey: keyof CacheTimestamps): boolean => {
    const timestamp = cacheTimestamps.current[resourceKey];
    if (!timestamp) return false;
    return Date.now() - timestamp < CACHE_TTL;
  };

  const invalidateCache = (resourceKey: keyof CacheTimestamps) => {
    cacheTimestamps.current[resourceKey] = null;
  };

  const updateCache = (resourceKey: keyof CacheTimestamps) => {
    cacheTimestamps.current[resourceKey] = Date.now();
  };

  // ============================================================================
  // DATA FETCHING FUNCTIONS
  // ============================================================================

  /**
   * Fetch user session with retry and timeout
   */
  const fetchSession = async () => {
    setLoadingStep('Verificando autenticação...');
    setLoadingProgress(10);

    const session = await retryWithBackoff(async () => {
      const { data, error } = await withTimeout(
        supabase.auth.getSession(),
        TIMEOUTS.SESSION,
        'Verificação de sessão',
      );

      if (error) throw error;
      if (!data?.session?.user) throw new Error('Usuário não autenticado');

      return data.session;
    });

    const userId = session.user.id;
    setUserUuid(userId);
    setLoadingProgress(25);

    return { session, userId };
  };

  /**
   * Fetch user data from database with retry and timeout
   */
  const fetchUserData = async (userId: string) => {
    setLoadingStep('Carregando dados do usuário...');
    setLoadingProgress(40);

    const userData = await retryWithBackoff(async () => {
      const result = await withTimeout(
        supabase.from('users').select('*').eq('uuid', userId).single() as unknown as Promise<any>,
        TIMEOUTS.USER_DATA,
        'Carregamento de dados do usuário',
      );

      const { data, error } = result;

      if (error) throw error;
      if (!data) throw new Error('Dados do usuário não encontrados');

      return data;
    });

    // Update profile
    setProfile({
      name: userData.name || 'Usuário',
      preferred_name: userData.preferred_name,
      email: userData.email || '',
      avatar_url: userData.avatar_url,
      bio: userData.bio,
      phone: userData.mobile_phone,
      company: userData.company_name,
    });

    // Update subscription
    setSubscription({
      plan: userData.subscription_plan || 'free',
      status: userData.subscription_status || 'active',
      start_date: userData.subscription_start_date || new Date().toISOString(),
      end_date: userData.subscription_end_date,
      tokens_used: userData.tokens_used || 0,
      tokens_limit: userData.tokens_limit || 1000,
      requests_this_month: userData.requests_this_month || 0,
      next_billing_date: userData.next_billing_date,
      billing_cycle: userData.billing_cycle,
      payment_method: userData.payment_method,
    });

    // Update cadastral info
    setCadastralInfo({
      country: userData.country || '',
      postal_code: userData.postal_code || '',
      address: userData.address || '',
      preferred_language: userData.preferred_language || 'pt',
      created_at: userData.created_at || '',
      last_online: userData.last_online || '',
    });

    updateCache('profile');
    updateCache('subscription');
    setLoadingProgress(65);
  };

  /**
   * Fetch user products with retry and timeout
   */
  const fetchProducts = async (userId: string) => {
    setLoadingStep('Carregando produtos...');
    setLoadingProgress(75);

    const products = await retryWithBackoff(async () => {
      const result = await withTimeout(
        supabase.from('user_products').select('*').eq('user_uuid', userId) as unknown as Promise<any>,
        TIMEOUTS.PRODUCTS,
        'Carregamento de produtos',
      );

      const { data, error } = result;

      if (error) throw error;
      return data || [];
    });

    setUserProducts(products);
    updateCache('products');
    setLoadingProgress(100);
  };

  // ============================================================================
  // PUBLIC API FUNCTIONS
  // ============================================================================

  /**
   * Refresh all user data (session, profile, subscription, products)
   */
  const refreshAll = async (force = false) => {
    // Check cache validity (skip if force=true)
    if (!force) {
      const allCacheValid =
        isCacheValid('profile') &&
        isCacheValid('subscription') &&
        isCacheValid('products');

      if (allCacheValid && userUuid) {
        // All data is fresh, no need to refetch
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setLoadingProgress(0);
    setLoadingStep('Iniciando...');

    try {
      const { userId } = await fetchSession();
      await fetchUserData(userId);
      await fetchProducts(userId);
      setLoadingStep('Concluído!');
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error(`Erro ao carregar dados: ${error.message}`);
      console.error('Erro em refreshAll:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    if (!userUuid) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const updateData = {
        name: data.name,
        preferred_name: data.preferred_name,
        mobile_phone: data.phone,
        company_name: data.company,
        bio: data.bio,
        last_online: new Date().toISOString(),
      };

      await retryWithBackoff(async () => {
        const result = await withTimeout(
          supabase.from('users').update(updateData).eq('uuid', userUuid) as unknown as Promise<any>,
          TIMEOUTS.UPDATE,
          'Atualização de perfil',
        );

        const { error } = result;

        if (error) throw error;
      });

      // Update local state
      setProfile((prev) => ({
        ...prev,
        ...data,
      }));

      // Invalidate cache to force fresh data on next fetch
      invalidateCache('profile');

      toast.success('Perfil atualizado com sucesso!');
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error(`Erro ao atualizar perfil: ${error.message}`);
      throw error;
    }
  };

  /**
   * Refresh only subscription data
   */
  const refreshSubscription = async (force = false): Promise<void> => {
    if (!force && isCacheValid('subscription')) {
      return; // Cache is still valid
    }

    if (!userUuid) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const userData = await retryWithBackoff(async () => {
        const result = await withTimeout(
          supabase.from('users').select('*').eq('uuid', userUuid).single() as unknown as Promise<any>,
          TIMEOUTS.USER_DATA,
          'Atualização de assinatura',
        );

        const { data, error } = result;

        if (error) throw error;
        if (!data) throw new Error('Dados do usuário não encontrados');

        return data;
      });

      setSubscription({
        plan: userData.subscription_plan || 'free',
        status: userData.subscription_status || 'active',
        start_date: userData.subscription_start_date || new Date().toISOString(),
        end_date: userData.subscription_end_date,
        tokens_used: userData.tokens_used || 0,
        tokens_limit: userData.tokens_limit || 1000,
        requests_this_month: userData.requests_this_month || 0,
        next_billing_date: userData.next_billing_date,
        billing_cycle: userData.billing_cycle,
        payment_method: userData.payment_method,
      });

      updateCache('subscription');
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error(`Erro ao atualizar assinatura: ${error.message}`);
      throw error;
    }
  };

  /**
   * Refresh only products data
   */
  const refreshProducts = async (force = false): Promise<void> => {
    if (!force && isCacheValid('products')) {
      return; // Cache is still valid
    }

    if (!userUuid) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const products = await retryWithBackoff(async () => {
        const result = await withTimeout(
          supabase.from('user_products').select('*').eq('user_uuid', userUuid) as unknown as Promise<any>,
          TIMEOUTS.PRODUCTS,
          'Atualização de produtos',
        );

        const { data, error } = result;

        if (error) throw error;
        return data || [];
      });

      setUserProducts(products);
      updateCache('products');
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error(`Erro ao atualizar produtos: ${error.message}`);
      throw error;
    }
  };

  // ============================================================================
  // AUTO-LOAD ON MOUNT
  // ============================================================================

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // ============================================================================
  // RETURN PUBLIC API
  // ============================================================================

  return {
    profile,
    subscription,
    userProducts,
    cadastralInfo,
    userUuid,
    isLoading,
    loadingProgress,
    loadingStep,
    error,
    updateProfile,
    refreshSubscription,
    refreshProducts,
    refreshAll,
  };
}
