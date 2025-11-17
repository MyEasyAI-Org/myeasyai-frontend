import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '../lib/api-clients/supabase-client';
import type { SubscriptionPlan } from '../constants/plans';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

/**
 * User profile information
 * @description Contains the user's personal and professional information
 */
export type UserProfile = {
  /** Full name of the user */
  name: string;
  /** Preferred display name (optional) */
  preferred_name?: string;
  /** User's email address */
  email: string;
  /** URL to the user's avatar image (optional) */
  avatar_url?: string;
  /** User's biography or description (optional) */
  bio?: string;
  /** User's phone number (optional) */
  phone?: string;
  /** User's company name (optional) */
  company?: string;
};

/**
 * Subscription data and usage information
 * @description Contains all subscription-related data including plan, status, and usage metrics
 */
export type SubscriptionData = {
  /** Current subscription plan */
  plan: SubscriptionPlan;
  /** Subscription status */
  status: 'active' | 'inactive' | 'cancelled';
  /** Subscription start date (ISO string) */
  start_date: string;
  /** Subscription end date (ISO string, optional) */
  end_date?: string;
  /** Number of tokens used in the current period */
  tokens_used: number;
  /** Total token limit for the current plan */
  tokens_limit: number;
  /** Number of API requests made this month */
  requests_this_month: number;
  /** Next billing date (ISO string, optional) */
  next_billing_date?: string;
  /** Billing cycle (e.g., "monthly", "yearly") */
  billing_cycle?: string;
  /** Payment method information (optional) */
  payment_method?: string;
};

/**
 * User product subscription information
 * @description Represents a product or service the user has subscribed to
 */
export type UserProduct = {
  /** Unique identifier for the product subscription */
  id: string;
  /** Name of the product */
  product_name: string;
  /** Current status of the product subscription */
  product_status: string;
  /** Date when the user subscribed to this product (ISO string) */
  subscribed_at: string;
  /** Number of sites created (for website products) */
  sites_created: number;
  /** Number of consultations made (for consultation products) */
  consultations_made: number;
};

/**
 * Cadastral (registration) information
 * @description Contains user's registration and location data
 */
export type CadastralInfo = {
  /** User's country of residence */
  country: string;
  /** Postal code / ZIP code */
  postal_code: string;
  /** Full address */
  address: string;
  /** User's preferred language (e.g., 'pt', 'en', 'es') */
  preferred_language: string;
  /** Account creation date (ISO string) */
  created_at: string;
  /** Last time the user was online (ISO string) */
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

/**
 * Cache Time-To-Live in milliseconds
 * @description Duration for which cached data remains valid before requiring a refresh
 * @constant {number} 300000 - 5 minutes
 */
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Timeout configurations for different operations (in milliseconds)
 * @description Maximum wait time for each type of operation before timing out
 */
const TIMEOUTS = {
  /** Session verification timeout (8 seconds) */
  SESSION: 8000,
  /** User data fetch timeout (6 seconds) */
  USER_DATA: 6000,
  /** Products fetch timeout (5 seconds) */
  PRODUCTS: 5000,
  /** Profile update timeout (10 seconds) */
  UPDATE: 10000,
} as const;

/**
 * Retry configuration for failed operations
 * @description Settings for automatic retry with exponential backoff
 */
const RETRY_CONFIG = {
  /** Maximum number of retry attempts */
  MAX_ATTEMPTS: 3,
  /** Delay between retries in milliseconds [1s, 2s, 4s] */
  DELAYS: [1000, 2000, 4000],
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Retry an async operation with exponential backoff
 * @description Attempts to execute an operation multiple times with increasing delays between attempts.
 * Uses exponential backoff strategy (1s → 2s → 4s) to avoid overwhelming services.
 * @template T - The return type of the operation
 * @param {() => Promise<T>} operation - The async function to retry
 * @param {number} [maxRetries=3] - Maximum number of retry attempts
 * @returns {Promise<T>} The result of the successful operation
 * @throws {Error} The last error encountered if all retries fail
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
 * @description Races a promise against a timeout, rejecting if the operation takes too long.
 * Useful for preventing hanging requests and providing better user experience.
 * @template T - The return type of the promise
 * @param {Promise<T>} promise - The promise to execute with timeout
 * @param {number} timeoutMs - Timeout duration in milliseconds
 * @param {string} operation - Description of the operation (used in error message)
 * @returns {Promise<T>} The result of the promise if completed within timeout
 * @throws {Error} Timeout error if the operation exceeds the specified duration
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

/**
 * Custom hook for managing user data with intelligent caching and retry logic
 *
 * @description
 * Provides centralized state management for user profile, subscription, products, and cadastral information.
 * Features include:
 * - **Auto-loading**: Fetches all user data automatically on mount
 * - **Smart caching**: 5-minute TTL to avoid unnecessary refetches
 * - **Retry logic**: Automatic retry with exponential backoff (3 attempts)
 * - **Timeout handling**: Configurable timeouts for all operations
 * - **Error handling**: Toast notifications and error state management
 * - **Progress tracking**: Loading states with progress percentage
 *
 * @returns {Object} User data and control functions
 * @returns {UserProfile} returns.profile - User profile information
 * @returns {SubscriptionData} returns.subscription - Subscription and usage data
 * @returns {UserProduct[]} returns.userProducts - Array of user's product subscriptions
 * @returns {CadastralInfo} returns.cadastralInfo - Registration and location data
 * @returns {string | null} returns.userUuid - Authenticated user's UUID
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {number} returns.loadingProgress - Loading progress (0-100)
 * @returns {string} returns.loadingStep - Current loading step description
 * @returns {Error | null} returns.error - Last error encountered
 * @returns {Function} returns.updateProfile - Update user profile
 * @returns {Function} returns.refreshSubscription - Refresh subscription data
 * @returns {Function} returns.refreshProducts - Refresh products data
 * @returns {Function} returns.refreshAll - Refresh all user data
 */
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
   * @description
   * Performs a complete refresh of all user-related data from the database.
   * Respects cache TTL unless forced. Shows loading states and progress during fetch.
   *
   * @param {boolean} [force=false] - If true, bypasses cache and forces a fresh fetch
   * @returns {Promise<void>} Resolves when all data has been refreshed
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
   * @description
   * Updates the user's profile information in the database and local state.
   * Automatically invalidates the profile cache and shows toast notifications.
   * Uses retry logic with exponential backoff for reliability.
   *
   * @param {Partial<UserProfile>} data - Profile fields to update (partial update supported)
   * @returns {Promise<void>} Resolves when the profile has been updated
   * @throws {Error} If user is not authenticated or update fails after retries
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
   * @description
   * Fetches updated subscription information including plan, status, and usage metrics.
   * Respects cache TTL unless forced. Useful for updating subscription after plan changes.
   *
   * @param {boolean} [force=false] - If true, bypasses cache and forces a fresh fetch
   * @returns {Promise<void>} Resolves when subscription data has been refreshed
   * @throws {Error} If user is not authenticated or fetch fails after retries
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
   * @description
   * Fetches updated list of user's product subscriptions and usage statistics.
   * Respects cache TTL unless forced. Useful for updating products after new subscription.
   *
   * @param {boolean} [force=false] - If true, bypasses cache and forces a fresh fetch
   * @returns {Promise<void>} Resolves when products data has been refreshed
   * @throws {Error} If user is not authenticated or fetch fails after retries
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
