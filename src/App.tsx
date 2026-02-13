import type { User } from '@supabase/supabase-js';
import { useEffect, useRef, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';
import { Courses } from './components/Courses';
import { Dashboard } from './components/Dashboard';
import { Features } from './components/Features';
import { FinalCta } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { LoadingBar } from './components/LoadingBar';
import { LoadingIntro } from './components/LoadingIntro';
import { MidStats } from './components/MidStats';
import NavBar from './components/NavBar';
import { OnboardingModal } from './components/OnboardingModal';
import { Packages } from './components/Packages';
import { Preview } from './components/Preview';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { AuthCallback } from './components/AuthCallback';
import { BusinessGuru } from './features/business-guru/BusinessGuru';
import { MyEasyAvatar } from './features/my-easy-avatar';
import { MyEasyCode } from './features/my-easy-code';
import { MyEasyContent } from './features/my-easy-content';
import { MyEasyCRM } from './features/my-easy-crm';
import { MyEasyPricing } from './features/my-easy-pricing/MyEasyPricing';
import { MyEasyFitness } from './features/my-easy-fitness';
import { MyEasyWebsite } from './features/my-easy-website/MyEasyWebsite';
import { MyEasyJobs } from './features/my-easy-jobs';
import { MyEasyLearning } from './features/my-easy-learning/MyEasyLearning';
import { MyEasyDocs } from './features/my-easy-docs';
import { SupportPage } from './pages/SupportPage';
import { CreateTicketPage } from './pages/CreateTicketPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { CheckoutSuccessPage } from './pages/CheckoutSuccessPage';
import { CheckoutCancelPage } from './pages/CheckoutCancelPage';
import { useInactivityTimeout } from './hooks/useInactivityTimeout';
import { useModalState } from './hooks/useModalState';
import { useRealtimeSync } from './hooks/useRealtimeSync';
import { supabase } from './lib/api-clients/supabase-client';
import { ROUTES } from './router';
import { AvatarWidgetProvider } from './contexts/AvatarWidgetContext';
import { authService, type AuthUser } from './services/AuthServiceV2';
import { userManagementServiceV2 } from './services/UserManagementServiceV2';

// Configuration: Enable/Disable Splash Screen
// Change to `true` to re-enable the splash screen "Welcome to the future of AI"
const ENABLE_SPLASH_SCREEN = false;

/**
 * Converte AuthUser do AuthServiceV2 para formato compatível com Supabase User
 * Permite usar o mesmo fluxo de UI para ambos os provedores
 */
function authUserToUser(authUser: AuthUser | null): User | null {
  if (!authUser) return null;
  return {
    id: authUser.uuid,
    email: authUser.email,
    user_metadata: {
      name: authUser.name,
      full_name: authUser.name,
      preferred_name: authUser.preferred_name,
      avatar_url: authUser.avatar_url,
    },
    app_metadata: {},
    aud: 'authenticated',
    created_at: '',
  } as User;
}

/**
 * ProtectedRoute - Component that protects routes requiring authentication
 * No loading spinner here - NavBar shows shimmer on "Olá, ..." and Dashboard has its own LoadingScreen
 *
 * IMPORTANT: During auth check (isLoading=true), we render children to:
 * 1. Show the Dashboard's LoadingScreen instead of a blank page
 * 2. Keep the user on the same URL so they stay on the same page after F5
 *
 * PAYMENT BLOCKING: If needsPayment is true, user cannot access protected routes
 * They are redirected to home and the onboarding modal opens for payment step
 */
function ProtectedRoute({
  children,
  user,
  needsOnboarding,
  needsPayment,
  onOpenOnboarding,
  isLoading,
  isCheckingAuth,
}: {
  children: React.ReactNode;
  user: User | null;
  needsOnboarding: boolean;
  needsPayment: boolean;
  onOpenOnboarding: () => void;
  isLoading: boolean;
  isCheckingAuth: boolean;
}) {
  const location = useLocation();

  // If we have a user, check additional requirements
  if (user) {
    // If needs onboarding, redirect to home and open onboarding modal
    if (needsOnboarding) {
      onOpenOnboarding();
      return <Navigate to={ROUTES.HOME} replace />;
    }

    // If needs payment (no active subscription), redirect to home and open onboarding for payment
    // This blocks access when: no subscription, past_due, cancelled, or inactive
    if (needsPayment) {
      console.log('🚫 [ProtectedRoute] Blocking access - payment required');
      onOpenOnboarding();
      return <Navigate to={ROUTES.HOME} replace />;
    }

    // User has active subscription - allow access
    return <>{children}</>;
  }

  // If still checking auth OR loading, render children anyway
  // This allows Dashboard to show its own LoadingScreen instead of a blank spinner
  // The NavBar will show loading dots on "Olá, ..." while checking
  // CRITICAL: This prevents redirect during F5 - keeps user on same page
  if (isLoading || isCheckingAuth) {
    return <>{children}</>;
  }

  // No user and not loading = redirect to home
  return <Navigate to={ROUTES.HOME} state={{ from: location }} replace />;
}

/**
 * AppContent - Main application content with routing logic
 * Separated to allow useNavigate hook usage inside BrowserRouter
 */
function AppContent() {
  // Inicializa sincronização bidirecional Supabase ↔ D1
  useRealtimeSync();

  const navigate = useNavigate();

  const loginModal = useModalState();
  const signupModal = useModalState();
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('userName') || 'Usuário';
  });
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | undefined>(() => {
    return localStorage.getItem('userAvatarUrl') || undefined;
  });
  const [loading, setLoading] = useState(true);
  const onboardingModal = useModalState();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const isInitialLoadRef = useRef(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(() => {
    return !localStorage.getItem('userName');
  });
  // Track if we've already processed initial auth to prevent duplicate processing
  const hasProcessedInitialAuthRef = useRef(false);
  const [dashboardKey, setDashboardKey] = useState(Date.now());
  const [dashboardInitialTab, setDashboardInitialTab] = useState<
    'overview' | 'subscription' | 'products' | 'usage' | 'settings' | 'profile'
  >('overview');
  const isUserActionRef = useRef(false);
  // Subscription status for payment blocking
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [needsPayment, setNeedsPayment] = useState(false);
  const wasPageHiddenRef = useRef(false);
  const ignoreNextAuthEventRef = useRef(false);

  const openLogin = () => {
    isUserActionRef.current = true;
    loginModal.open();
  };
  const closeLogin = () => loginModal.close();

  const openSignup = () => {
    isUserActionRef.current = true;
    signupModal.open();
  };
  const closeSignup = () => signupModal.close();

  // Function to check subscription status and determine if payment is needed
  const checkSubscriptionStatus = async (userEmail: string): Promise<{ status: string | null; needsPayment: boolean }> => {
    try {
      const result = await userManagementServiceV2.getUserProfile(userEmail);
      if (!result.success || !result.data) {
        console.log('🔴 [APP] Could not fetch subscription status');
        return { status: null, needsPayment: true }; // Block if we can't verify
      }

      const status = result.data.subscription_status;
      console.log('💳 [APP] Subscription status:', status);

      // User needs payment if:
      // - No status (never subscribed)
      // - inactive (no active subscription)
      // - past_due (payment failed)
      // - cancelled (subscription cancelled)
      const needsPaymentCheck = !status || status === 'inactive' || status === 'past_due' || status === 'cancelled';

      return { status, needsPayment: needsPaymentCheck };
    } catch (error) {
      console.error('🔴 [APP] Error checking subscription status:', error);
      return { status: null, needsPayment: true }; // Block if error
    }
  };

  // Function to fetch user data from database (D1 Primary + Supabase Fallback)
  const fetchUserData = async (userEmail: string) => {
    try {
      // Use UserManagementServiceV2 (D1 Primary + Supabase Fallback)
      const result = await userManagementServiceV2.getUserProfile(userEmail);

      if (!result.success || !result.data) {
        console.error('Erro ao buscar dados do usuário:', result.error);
        return { name: 'Usuário', avatarUrl: undefined };
      }

      const data = result.data;
      let displayName = 'Usuário';

      // Prioritize preferred_name, otherwise use first name
      if (data?.preferred_name) {
        displayName = data.preferred_name;
      } else if (data?.name) {
        displayName = data.name.split(' ')[0];
      }

      // Save to localStorage to persist between reloads
      localStorage.setItem('userName', displayName);
      if (data?.avatar_url) {
        localStorage.setItem('userAvatarUrl', data.avatar_url);
        setUserAvatarUrl(data.avatar_url);
      } else {
        localStorage.removeItem('userAvatarUrl');
        setUserAvatarUrl(undefined);
      }

      return { name: displayName, avatarUrl: data?.avatar_url };
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return { name: 'Usuário', avatarUrl: undefined };
    }
  };

  const handleLogout = () => {
    isUserActionRef.current = true;
    setIsAuthLoading(true);

    setTimeout(async () => {
      // Clear React states for UI to update
      setUser(null);
      setUserName('Usuário');
      setUserAvatarUrl(undefined);
      setNeedsOnboarding(false);
      onboardingModal.close();
      loginModal.close();
      signupModal.close();
      setIsCheckingAuth(false);

      // Clear localStorage (Supabase keys)
      const localKeys = Object.keys(localStorage);
      localKeys.forEach((key) => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });
      // Clear user profile data
      localStorage.removeItem('userName');
      localStorage.removeItem('userAvatarUrl');
      localStorage.removeItem('userProfile');

      // Clear sessionStorage
      const sessionKeys = Object.keys(sessionStorage);
      sessionKeys.forEach((key) => {
        if (key.startsWith('sb-')) {
          sessionStorage.removeItem(key);
        }
      });

      // Sign out from AuthServiceV2 (handles both Cloudflare and Supabase)
      try {
        await authService.signOut();
        console.log('✅ [APP] Logout successful via AuthServiceV2');
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
      }

      // Navigate to home after logout
      navigate(ROUTES.HOME);

      // Disable loading bar after completion
      setTimeout(() => {
        setIsAuthLoading(false);
      }, 2500);
    }, 50);
  };

  const goToDashboard = () => {
    if (needsOnboarding) {
      onboardingModal.open();
    } else {
      setDashboardKey(Date.now());
      setDashboardInitialTab('overview');
      navigate(ROUTES.DASHBOARD);
    }
  };

  // Navega para o Dashboard na aba "Meus Produtos"
  // Usado quando o usuário volta de um módulo (CRM, MyEasyWebsite, etc.)
  const goToDashboardProducts = () => {
    if (needsOnboarding) {
      onboardingModal.open();
    } else {
      setDashboardKey(Date.now());
      setDashboardInitialTab('products');
      navigate(ROUTES.DASHBOARD);
    }
  };

  // Navega para o Dashboard na aba "Perfil"
  const goToDashboardProfile = () => {
    if (needsOnboarding) {
      onboardingModal.open();
    } else {
      setDashboardKey(Date.now());
      setDashboardInitialTab('profile');
      navigate(ROUTES.DASHBOARD);
    }
  };

  // Navega para o Dashboard na aba "Configurações"
  const goToDashboardSettings = () => {
    if (needsOnboarding) {
      onboardingModal.open();
    } else {
      setDashboardKey(Date.now());
      setDashboardInitialTab('settings');
      navigate(ROUTES.DASHBOARD);
    }
  };

  const goToHome = () => {
    navigate(ROUTES.HOME);
  };

  const goToMyEasyWebsite = () => {
    navigate(ROUTES.MY_EASY_WEBSITE);
  };

  const goToBusinessGuru = () => {
    navigate(ROUTES.BUSINESS_GURU);
  };

  const goToMyEasyCRM = () => {
    navigate(ROUTES.MY_EASY_CRM);
  };

  const goToMyEasyPricing = () => {
    navigate(ROUTES.MY_EASY_PRICING);
  };

  const goToMyEasyAvatar = () => {
    navigate(ROUTES.MY_EASY_AVATAR);
  };

  const goToMyEasyCode = () => {
    navigate(ROUTES.MY_EASY_CODE);
  };

  const goToMyEasyContent = () => {
    navigate(ROUTES.MY_EASY_CONTENT);
  };

  const goToMyEasyFitness = () => {
    navigate(ROUTES.MY_EASY_FITNESS);
  };

  const goToMyEasyJobs = () => {
    navigate(ROUTES.MY_EASY_JOBS);
  };

  const goToMyEasyLearning = () => {
    navigate(ROUTES.MY_EASY_LEARNING);
  };

  const goToMyEasyDocs = () => {
    navigate(ROUTES.MY_EASY_DOCS);
  };

  const goToSupport = () => {
    navigate(ROUTES.SUPPORT);
  };

  const goToSubscription = () => {
    navigate(ROUTES.DASHBOARD);
    // TODO: Add subscription tab navigation when available
  };

  const handleOnboardingComplete = () => {
    onboardingModal.close();
    setNeedsOnboarding(false);
    navigate(ROUTES.DASHBOARD);
  };

  const closeOnboarding = () => {
    onboardingModal.close();
  };

  // Inactivity timer - 10 minutes (600000ms)
  useInactivityTimeout({
    timeout: 10 * 60 * 1000,
    onTimeout: handleLogout,
    enabled: !!user,
  });

  useEffect(() => {
    // Monitor page visibility to ignore auth events when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.hidden) {
        wasPageHiddenRef.current = true;
      } else if (wasPageHiddenRef.current) {
        ignoreNextAuthEventRef.current = true;
        wasPageHiddenRef.current = false;

        setTimeout(() => {
          ignoreNextAuthEventRef.current = false;
        }, 2000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initialize auth - check for OAuth callback first, then check existing sessions
    const initAuth = async () => {
      // Prevent duplicate processing
      if (hasProcessedInitialAuthRef.current) {
        console.log('🔐 [APP] Already processed initial auth, skipping...');
        return;
      }
      hasProcessedInitialAuthRef.current = true;

      console.log('🔐 [APP] Initializing auth...');
      console.log('🔐 [APP] URL hash:', window.location.hash);
      console.log('🔐 [APP] URL search:', window.location.search);
      console.log('🔐 [APP] Full URL:', window.location.href);

      // Check if this is an OAuth callback (contains access_token in hash or code in params)
      const isOAuthCallback = window.location.hash.includes('access_token') ||
                               window.location.search.includes('code=');

      if (isOAuthCallback) {
        console.log('🔐 [APP] OAuth callback detected, waiting for Supabase to process...');
        // Let the Supabase onAuthStateChange handler process the callback
        // The detectSessionInUrl option in supabase client will handle this
        // Just wait a bit and then set loading to false - the auth listener will update the user
        setLoading(false);
        setIsCheckingAuth(false);
        return;
      }

      // Not an OAuth callback - check for existing sessions

      // IMPORTANT: Wait for AuthServiceV2 to finish initializing
      // This ensures restoreSession() completes before we check for a user
      await authService.waitForInit();

      // First, try AuthServiceV2 (Cloudflare Primary)
      const authUser = authService.getUser();
      if (authUser) {
        console.log('✅ [APP] Found Cloudflare session:', authUser.email);

        // Fetch user data FIRST, before setting user state
        // This prevents Dashboard from rendering before data is ready
        let userData = { name: 'Usuário', avatarUrl: undefined as string | undefined };
        if (authUser.email) {
          userData = await fetchUserData(authUser.email);
        }

        // Check onboarding
        const needsOnboardingCheck =
          await userManagementServiceV2.checkUserNeedsOnboarding(
            authUserToUser(authUser)!
          );

        // Check subscription status (only if doesn't need onboarding)
        let paymentCheck = { status: null as string | null, needsPayment: false };
        if (!needsOnboardingCheck && authUser.email) {
          paymentCheck = await checkSubscriptionStatus(authUser.email);
        }

        // NOW set all states together to prevent partial renders
        setUserName(userData.name);
        setUser(authUserToUser(authUser));
        setNeedsOnboarding(needsOnboardingCheck);
        setSubscriptionStatus(paymentCheck.status);
        setNeedsPayment(paymentCheck.needsPayment);
        setLoading(false);
        setIsCheckingAuth(false);
        return;
      }

      // Fallback: Check Supabase session directly
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        console.log('🔐 [APP] Supabase getSession result:', session?.user?.email);

        if (session?.user) {
          // Fetch user data FIRST, before setting user state
          let userData = { name: 'Usuário', avatarUrl: undefined as string | undefined };
          if (session.user.email) {
            userData = await fetchUserData(session.user.email);
          }

          // Check onboarding
          const needsOnboardingCheck =
            await userManagementServiceV2.checkUserNeedsOnboarding(session.user);

          // Check subscription status (only if doesn't need onboarding)
          let paymentCheck = { status: null as string | null, needsPayment: false };
          if (!needsOnboardingCheck && session.user.email) {
            paymentCheck = await checkSubscriptionStatus(session.user.email);
          }

          // NOW set all states together
          setUserName(userData.name);
          setUser(session.user);
          setNeedsOnboarding(needsOnboardingCheck);
          setSubscriptionStatus(paymentCheck.status);
          setNeedsPayment(paymentCheck.needsPayment);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        setUser(null);
      } finally {
        setLoading(false);
        setIsCheckingAuth(false);
      }
    };

    initAuth();

    // Safety fallback - ensure loading is false after 5 seconds
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setIsCheckingAuth(false);
    }, 5000);

    // ==================== AUTHSERVICE V2 LISTENER ====================
    // Listen for auth state changes from AuthServiceV2 (Cloudflare PRIMARY)
    const unsubscribeAuthV2 = authService.onAuthStateChange(
      async (authUser) => {
        console.log('🔄 [APP] AuthServiceV2 state change:', authUser?.email);

        if (authUser) {
          const convertedUser = authUserToUser(authUser);
          setUser(convertedUser);

          // Close login/signup modals on successful auth
          loginModal.close();
          signupModal.close();

          // Ensure user is in database
          if (convertedUser) {
            await userManagementServiceV2.ensureUserInDatabase(convertedUser);
          }

          // Fetch user data
          if (authUser.email) {
            const userData = await fetchUserData(authUser.email);
            setUserName(userData.name);
          }

          // Check onboarding
          if (convertedUser) {
            const needsOnboardingCheck =
              await userManagementServiceV2.checkUserNeedsOnboarding(
                convertedUser
              );
            setNeedsOnboarding(needsOnboardingCheck);

            // Check subscription status (only if doesn't need onboarding)
            if (!needsOnboardingCheck && authUser.email) {
              const paymentCheck = await checkSubscriptionStatus(authUser.email);
              setSubscriptionStatus(paymentCheck.status);
              setNeedsPayment(paymentCheck.needsPayment);

              // If needs payment, redirect to home and open onboarding for payment step
              if (paymentCheck.needsPayment) {
                console.log('💳 [APP] User needs payment, redirecting to onboarding...');
                navigate(ROUTES.HOME);
                setTimeout(() => {
                  onboardingModal.open();
                }, 100);
              }
            } else if (needsOnboardingCheck) {
              navigate(ROUTES.HOME);
              setTimeout(() => {
                onboardingModal.open();
              }, 100);
            }
            // Don't auto-navigate to dashboard - let user stay on current page
          }

          // Disable loading bar after completion
          if (isUserActionRef.current) {
            setTimeout(() => {
              setIsAuthLoading(false);
              isUserActionRef.current = false;
            }, 1500);
          }
        } else {
          // User signed out from Cloudflare
          setUser(null);
          setUserName('Usuário');
          setUserAvatarUrl(undefined);
          setSubscriptionStatus(null);
          setNeedsPayment(false);
        }

        setLoading(false);
        setIsCheckingAuth(false);
      }
    );

    // ==================== SUPABASE AUTH LISTENER ====================
    // FALLBACK: Supabase Auth is used for OAuth (Google, etc.) when D1/Cloudflare is unavailable
    // D1 is PRIMARY for data storage. This listener only activates when:
    // 1. OAuth callback (access_token in URL)
    // 2. User-initiated login action
    // 3. No D1 session exists
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        'Auth event:',
        event,
        'isInitialLoad:',
        isInitialLoadRef.current,
        'session:',
        session?.user?.email
      );

      // CRITICAL: Check if D1/AuthServiceV2 already has a session
      // If so, DON'T let Supabase override it for INITIAL_SESSION events
      const cloudflareUser = authService.getUser();

      // For INITIAL_SESSION: Only process if D1 doesn't have a user already
      // This prevents race conditions where Supabase fires before initAuth completes
      if (event === 'INITIAL_SESSION') {
        // If initAuth already processed and set a user, skip Supabase processing
        if (hasProcessedInitialAuthRef.current && cloudflareUser) {
          console.log('🔄 [APP] D1 already processed auth, skipping Supabase INITIAL_SESSION');
          isInitialLoadRef.current = false;
          return;
        }

        if (session?.user) {
          console.log('✅ [APP] Processing Supabase INITIAL_SESSION (D1 fallback):', session.user.email);

          // Fetch user data FIRST before setting state
          let userData = { name: 'Usuário', avatarUrl: undefined as string | undefined };
          if (session.user.email) {
            userData = await fetchUserData(session.user.email);
          }

          await userManagementServiceV2.ensureUserInDatabase(session.user);

          const needsOnboardingCheck =
            await userManagementServiceV2.checkUserNeedsOnboarding(
              session.user
            );

          // Set all states together to prevent partial renders
          setUserName(userData.name);
          setUser(session.user);
          setNeedsOnboarding(needsOnboardingCheck);

          // Check if this is an OAuth callback
          const isOAuthCallback = window.location.hash.includes('access_token') ||
                                   window.location.search.includes('code=');

          if (isOAuthCallback || isUserActionRef.current) {
            console.log('🔐 [APP] OAuth callback detected, staying on home...');
            loginModal.close();
            signupModal.close();

            if (needsOnboardingCheck) {
              navigate(ROUTES.HOME);
              setTimeout(() => {
                onboardingModal.open();
              }, 100);
            }

            // Clean URL hash/params after OAuth
            if (isOAuthCallback) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }

            isUserActionRef.current = false;
          }

          setLoading(false);
          setIsCheckingAuth(false);
        }
        isInitialLoadRef.current = false;
        return;
      }

      // For non-INITIAL_SESSION events, handle normally
      if (session?.user) {
        console.log('✅ [APP] Setting user from Supabase:', session.user.email);
        setUser(session.user);
      } else {
        // Check if we have a Cloudflare session before clearing
        if (!cloudflareUser) {
          console.log('🔄 [APP] No Supabase session and no Cloudflare session, clearing user');
          setUser(null);
        } else {
          console.log('🔄 [APP] No Supabase session but Cloudflare session exists, keeping user:', cloudflareUser.email);
        }
      }

      // Process intentional login (email, OAuth, etc)
      if (event === 'SIGNED_IN' && !isInitialLoadRef.current) {
        // IGNORE auth events that occur after tab visibility change (revalidation)
        if (ignoreNextAuthEventRef.current) {
          console.log('Ignoring SIGNED_IN event after tab visibility change');
          return;
        }

        // Enable loading bar ONLY if this is a user-initiated action
        if (isUserActionRef.current) {
          setIsAuthLoading(true);
        }
        loginModal.close();
        signupModal.close();

        // Register user in users table (especially for social login)
        if (session?.user) {
          // Fetch user data FIRST before setting state
          let userData = { name: 'Usuário', avatarUrl: undefined as string | undefined };
          if (session.user.email) {
            userData = await fetchUserData(session.user.email);
          }

          await userManagementServiceV2.ensureUserInDatabase(session.user);

          // Check if needs onboarding
          const needsOnboardingCheck =
            await userManagementServiceV2.checkUserNeedsOnboarding(
              session.user
            );

          // Set all states together
          setUserName(userData.name);
          setNeedsOnboarding(needsOnboardingCheck);

          // Check subscription status (only if doesn't need onboarding)
          if (!needsOnboardingCheck && session.user.email) {
            const paymentCheck = await checkSubscriptionStatus(session.user.email);
            setSubscriptionStatus(paymentCheck.status);
            setNeedsPayment(paymentCheck.needsPayment);

            // If needs payment, redirect to home and open onboarding for payment step
            if (paymentCheck.needsPayment) {
              console.log('💳 [APP] User needs payment, redirecting to onboarding...');
              navigate(ROUTES.HOME);
              setTimeout(() => {
                onboardingModal.open();
              }, 100);
            }
          } else if (needsOnboardingCheck) {
            // If needs onboarding, stay on home and show onboarding modal
            navigate(ROUTES.HOME);
            setTimeout(() => {
              onboardingModal.open();
            }, 100);
          }
          // Don't auto-navigate to dashboard - let user stay on current page

          // Disable loading bar after completion (only if it was enabled)
          if (isUserActionRef.current) {
            setTimeout(() => {
              setIsAuthLoading(false);
              isUserActionRef.current = false;
            }, 1500);
          }
        }
      }

      // Clear states after logout
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserName('Usuário');
        setUserAvatarUrl(undefined);
        setNeedsOnboarding(false);
        setSubscriptionStatus(null);
        setNeedsPayment(false);
        onboardingModal.close();
        loginModal.close();
        signupModal.close();
        setIsAuthLoading(false);
        isInitialLoadRef.current = true;
        isUserActionRef.current = false;
        navigate(ROUTES.HOME);
      }
    });

    return () => {
      subscription.unsubscribe();
      unsubscribeAuthV2();
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [navigate]);

  if (loading && ENABLE_SPLASH_SCREEN) {
    return <LoadingIntro />;
  }

  // Debug log to track user state
  console.log('🎨 [APP] Rendering with user:', user?.email, 'userName:', userName);

  return (
    <Routes>
      {/* Public route - Home */}
      <Route
        path={ROUTES.HOME}
        element={
          <main className="min-h-screen bg-gradient-to-br from-black-main to-blue-main">
            <Toaster
              position="top-right"
              richColors
              closeButton
              duration={4000}
              toastOptions={{
                style: {
                  background: '#1e293b',
                  color: '#f1f5f9',
                  border: '1px solid #334155',
                },
              }}
            />

            <LoadingBar isLoading={isAuthLoading} duration={2300} />

            <NavBar
              onLoginClick={openLogin}
              onSignupClick={openSignup}
              user={user}
              userName={userName}
              userAvatarUrl={userAvatarUrl}
              onDashboardClick={goToDashboard}
              onProfileClick={goToDashboardProfile}
              onSettingsClick={goToDashboardSettings}
              onLogout={handleLogout}
              onLogoClick={goToHome}
              isCheckingAuth={isCheckingAuth}
            />

            <Hero
              isLoginOpen={loginModal.isOpen}
              onOpenLogin={openLogin}
              onCloseLogin={closeLogin}
              isSignupOpen={signupModal.isOpen}
              onOpenSignup={openSignup}
              onCloseSignup={closeSignup}
              user={user}
              onDashboardClick={goToDashboard}
            />
            <Features />
            <Preview />
            <Packages user={user} />
            <MidStats />
            <Courses />
            <FinalCta onSignupClick={openSignup} />
            <Footer onNavigateToSupport={user ? goToSupport : undefined} />

            {user && (
              <OnboardingModal
                isOpen={onboardingModal.isOpen}
                onClose={closeOnboarding}
                onComplete={handleOnboardingComplete}
                user={user}
                disableClose={needsOnboarding || needsPayment}
                initialStep={needsPayment && !needsOnboarding ? 2 : 0}
              />
            )}

            <PWAInstallBanner />
          </main>
        }
      />

      {/* Auth callback route - processes OAuth redirects from Cloudflare/Supabase */}
      <Route path={ROUTES.AUTH_CALLBACK} element={<AuthCallback />} />

      {/* Checkout routes - require auth but accessible during onboarding */}
      <Route path={ROUTES.CHECKOUT_SUCCESS} element={<CheckoutSuccessPage />} />
      <Route path={ROUTES.CHECKOUT_CANCEL} element={<CheckoutCancelPage />} />

      {/* Protected routes */}
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute
            user={user}
            needsOnboarding={needsOnboarding}
            needsPayment={needsPayment}
            onOpenOnboarding={() => onboardingModal.open()}
            isLoading={loading}
            isCheckingAuth={isCheckingAuth}
          >
            <div>
              <LoadingBar isLoading={isAuthLoading} duration={2300} />
              <Dashboard
                key={dashboardKey}
                onGoHome={goToHome}
                onGoToMyEasyWebsite={goToMyEasyWebsite}
                onGoToBusinessGuru={goToBusinessGuru}
                onGoToMyEasyPricing={goToMyEasyPricing}
                onGoToMyEasyCRM={goToMyEasyCRM}
                onGoToMyEasyContent={goToMyEasyContent}
                onGoToMyEasyFitness={goToMyEasyFitness}
                onGoToMyEasyAvatar={goToMyEasyAvatar}
                onGoToMyEasyCode={goToMyEasyCode}
                onGoToMyEasyJobs={goToMyEasyJobs}
                onGoToMyEasyLearning={goToMyEasyLearning}
                onGoToMyEasyDocs={goToMyEasyDocs}
                onGoToSupport={goToSupport}
                initialTab={dashboardInitialTab}
                onLoadingComplete={() => {
                  console.log('Dashboard loaded successfully!');
                  setDashboardInitialTab('overview');
                }}
              />
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.MY_EASY_WEBSITE}
        element={
          <ProtectedRoute
            user={user}
            needsOnboarding={needsOnboarding}
            needsPayment={needsPayment}
            onOpenOnboarding={() => onboardingModal.open()}
            isLoading={loading}
            isCheckingAuth={isCheckingAuth}
          >
            <MyEasyWebsite
              onBackToDashboard={goToDashboardProducts}
              onGoToSubscription={goToSubscription}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.BUSINESS_GURU}
        element={
          <ProtectedRoute
            user={user}
            needsOnboarding={needsOnboarding}
            needsPayment={needsPayment}
            onOpenOnboarding={() => onboardingModal.open()}
            isLoading={loading}
            isCheckingAuth={isCheckingAuth}
          >
            <BusinessGuru onBackToDashboard={goToDashboardProducts} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.MY_EASY_CRM}
        element={
          <ProtectedRoute
            user={user}
            needsOnboarding={needsOnboarding}
            needsPayment={needsPayment}
            onOpenOnboarding={() => onboardingModal.open()}
            isLoading={loading}
            isCheckingAuth={isCheckingAuth}
          >
            <MyEasyCRM
              userName={userName}
              userEmail={user?.email}
              onLogout={handleLogout}
              onBackToMain={goToDashboardProducts}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.MY_EASY_PRICING}
        element={
          <ProtectedRoute
            user={user}
            needsOnboarding={needsOnboarding}
            needsPayment={needsPayment}
            onOpenOnboarding={() => onboardingModal.open()}
            isLoading={loading}
            isCheckingAuth={isCheckingAuth}
          >
            <MyEasyPricing onBackToDashboard={goToDashboardProducts} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.MY_EASY_CONTENT}
        element={
          <ProtectedRoute
            user={user}
            needsOnboarding={needsOnboarding}
            needsPayment={needsPayment}
            onOpenOnboarding={() => onboardingModal.open()}
            isLoading={loading}
            isCheckingAuth={isCheckingAuth}
          >
            <MyEasyContent onBackToDashboard={goToDashboardProducts} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.MY_EASY_FITNESS}
        element={
          <ProtectedRoute
            user={user}
            needsOnboarding={needsOnboarding}
            needsPayment={needsPayment}
            onOpenOnboarding={() => onboardingModal.open()}
            isLoading={loading}
            isCheckingAuth={isCheckingAuth}
          >
            <MyEasyFitness onBackToDashboard={goToDashboardProducts} userName={userName} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.MY_EASY_AVATAR}
        element={
          <ProtectedRoute
            user={user}
            needsOnboarding={needsOnboarding}
            needsPayment={needsPayment}
            onOpenOnboarding={() => onboardingModal.open()}
            isLoading={loading}
            isCheckingAuth={isCheckingAuth}
          >
            <MyEasyAvatar onBack={goToDashboardProducts} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.MY_EASY_CODE}
        element={
          <ProtectedRoute
            user={user}
            needsOnboarding={needsOnboarding}
            needsPayment={needsPayment}
            onOpenOnboarding={() => onboardingModal.open()}
            isLoading={loading}
            isCheckingAuth={isCheckingAuth}
          >
            <MyEasyCode onBack={goToDashboardProducts} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.MY_EASY_JOBS}
        element={
          <ProtectedRoute
            user={user}
            needsOnboarding={needsOnboarding}
            needsPayment={needsPayment}
            onOpenOnboarding={() => onboardingModal.open()}
            isLoading={loading}
            isCheckingAuth={isCheckingAuth}
          >
            <MyEasyJobs onBackToDashboard={goToDashboardProducts} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.MY_EASY_LEARNING}
        element={
          <ProtectedRoute
            user={user}
            needsOnboarding={needsOnboarding}
            needsPayment={needsPayment}
            onOpenOnboarding={() => onboardingModal.open()}
            isLoading={loading}
            isCheckingAuth={isCheckingAuth}
          >
            <MyEasyLearning onBackToDashboard={goToDashboardProducts} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.MY_EASY_DOCS}
        element={
          <ProtectedRoute
            user={user}
            needsOnboarding={needsOnboarding}
            needsPayment={needsPayment}
            onOpenOnboarding={() => onboardingModal.open()}
            isLoading={loading}
            isCheckingAuth={isCheckingAuth}
          >
            <MyEasyDocs onBackToDashboard={goToDashboardProducts} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.SUPPORT}
        element={
          <ProtectedRoute
            user={user}
            needsOnboarding={needsOnboarding}
            needsPayment={needsPayment}
            onOpenOnboarding={() => onboardingModal.open()}
            isLoading={loading}
            isCheckingAuth={isCheckingAuth}
          >
            <SupportPage onBackToDashboard={goToDashboardProducts} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.SUPPORT_TICKET}
        element={
          <ProtectedRoute
            user={user}
            needsOnboarding={needsOnboarding}
            needsPayment={needsPayment}
            onOpenOnboarding={() => onboardingModal.open()}
            isLoading={loading}
            isCheckingAuth={isCheckingAuth}
          >
            <CreateTicketPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.SUPPORT_TICKETS}
        element={
          <ProtectedRoute
            user={user}
            needsOnboarding={needsOnboarding}
            needsPayment={needsPayment}
            onOpenOnboarding={() => onboardingModal.open()}
            isLoading={loading}
            isCheckingAuth={isCheckingAuth}
          >
            <MyTicketsPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback - redirect unknown routes to home */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}

/**
 * App - Main application component wrapped with BrowserRouter
 */
function App() {
  return (
    <BrowserRouter>
      <AvatarWidgetProvider>
        <AppContent />
      </AvatarWidgetProvider>
    </BrowserRouter>
  );
}

export default App;
