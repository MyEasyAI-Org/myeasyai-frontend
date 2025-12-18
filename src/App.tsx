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
import { BusinessGuru } from './features/business-guru/BusinessGuru';
import { MyEasyCRM } from './features/my-easy-crm';
import { MyEasyWebsite } from './features/my-easy-website/MyEasyWebsite';
import { useInactivityTimeout } from './hooks/useInactivityTimeout';
import { useModalState } from './hooks/useModalState';
import { useRealtimeSync } from './hooks/useRealtimeSync';
import { supabase } from './lib/api-clients/supabase-client';
<<<<<<< HEAD
import { ROUTES } from './router';
import { userManagementService } from './services/UserManagementService';
=======
import { userManagementServiceV2 } from './services/UserManagementServiceV2';
import { authService, type AuthUser } from './services/AuthServiceV2';
>>>>>>> 3cbaa27 (feat: ajustes do dashboard e onboarding)

// Configuration: Enable/Disable Splash Screen
// Change to `true` to re-enable the splash screen "Welcome to the future of AI"
const ENABLE_SPLASH_SCREEN = false;

/**
<<<<<<< HEAD
 * ProtectedRoute - Component that protects routes requiring authentication
 */
function ProtectedRoute({
  children,
  user,
  needsOnboarding,
  onOpenOnboarding,
  isLoading,
}: {
  children: React.ReactNode;
  user: User | null;
  needsOnboarding: boolean;
  onOpenOnboarding: () => void;
  isLoading: boolean;
}) {
  const location = useLocation();

  // Wait for auth check to complete before redirecting
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black-main to-blue-main flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.HOME} state={{ from: location }} replace />;
  }

  if (needsOnboarding) {
    onOpenOnboarding();
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
}

/**
 * AppContent - Main application content with routing logic
 * Separated to allow useNavigate hook usage inside BrowserRouter
 */
function AppContent() {
  const navigate = useNavigate();
=======
 * Converte AuthUser do AuthServiceV2 para formato compatível com Supabase User
 * Permite usar o mesmo fluxo de UI para ambos os provedores
 */
function authUserToUser(authUser: AuthUser | null): User | null {
  if (!authUser) return null;
  return {
    id: authUser.uuid,
    email: authUser.email,
    user_metadata: {
      full_name: authUser.name,
      preferred_name: authUser.preferred_name,
      avatar_url: authUser.avatar_url,
    },
    app_metadata: {},
    aud: 'authenticated',
    created_at: '',
  } as User;
}

function App() {
  // Inicializa sincronização bidirecional Supabase ↔ D1
  useRealtimeSync();
>>>>>>> 3cbaa27 (feat: ajustes do dashboard e onboarding)

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
  const [currentView, setCurrentView] = useState<
    'home' | 'dashboard' | 'preview' | 'myeasywebsite' | 'businessguru' | 'myeasypricing'
  >('home');
  const onboardingModal = useModalState();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const isInitialLoadRef = useRef(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(() => {
    return !localStorage.getItem('userName');
  });
  const [dashboardKey, setDashboardKey] = useState(Date.now());
<<<<<<< HEAD
  const isUserActionRef = useRef(false);
  const wasPageHiddenRef = useRef(false);
  const ignoreNextAuthEventRef = useRef(false);
=======
  const [dashboardInitialTab, setDashboardInitialTab] = useState<'overview' | 'subscription' | 'products' | 'usage' | 'settings' | 'profile'>('overview');
  const isUserActionRef = useRef(false); // Track if action is user-initiated
  const wasPageHiddenRef = useRef(false); // Track if page was hidden (tab switch/minimize)
  const ignoreNextAuthEventRef = useRef(false); // Ignore auth events after visibility change
>>>>>>> 3cbaa27 (feat: ajustes do dashboard e onboarding)

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

      if (data?.preferred_name) {
        displayName = data.preferred_name;
      } else if (data?.name) {
        displayName = data.name.split(' ')[0];
      }

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

<<<<<<< HEAD
  const handleLogout = () => {
    isUserActionRef.current = true;
    setIsAuthLoading(true);

    setTimeout(() => {
=======
  const handleLogout = async () => {
    // Mark as user-initiated action
    isUserActionRef.current = true;

    // Enable loading bar FIRST
    setIsAuthLoading(true);

    // Use setTimeout to avoid blocking - clear UI immediately but after bar renders
    setTimeout(async () => {
      // Clear React states for UI to update (dropdown menu disappears)
>>>>>>> 3cbaa27 (feat: ajustes do dashboard e onboarding)
      setUser(null);
      setUserName('Usuário');
      setNeedsOnboarding(false);
      onboardingModal.close();
      loginModal.close();
      signupModal.close();
      setIsCheckingAuth(false);

<<<<<<< HEAD
=======
      // Clear localStorage (Supabase keys)
>>>>>>> 3cbaa27 (feat: ajustes do dashboard e onboarding)
      const localKeys = Object.keys(localStorage);
      for (const key of localKeys) {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      }
      localStorage.removeItem('userName');
      localStorage.removeItem('userAvatarUrl');
      localStorage.removeItem('userProfile');

      const sessionKeys = Object.keys(sessionStorage);
      for (const key of sessionKeys) {
        if (key.startsWith('sb-')) {
          sessionStorage.removeItem(key);
        }
      }

<<<<<<< HEAD
      supabase.auth.signOut().catch((error) => {
=======
      // Sign out from AuthServiceV2 (handles both Cloudflare and Supabase)
      try {
        await authService.signOut();
        console.log('✅ [APP] Logout successful via AuthServiceV2');
      } catch (error) {
>>>>>>> 3cbaa27 (feat: ajustes do dashboard e onboarding)
        console.error('Erro ao fazer logout:', error);
      }

      // Navigate to home after logout
      navigate(ROUTES.HOME);

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
    setCurrentView('myeasypricing');
  };

  const goToSubscription = () => {
    setDashboardInitialTab('subscription');
    setCurrentView('dashboard');
    setDashboardKey(Date.now()); // Force remount to apply new initial tab
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
    const handleVisibilityChange = () => {
      if (document.hidden) {
        wasPageHiddenRef.current = true;
      } else if (wasPageHiddenRef.current) {
        ignoreNextAuthEventRef.current = true;
        wasPageHiddenRef.current = false;

<<<<<<< HEAD
=======
        // Reset the ignore flag after a short delay to catch the revalidation event
>>>>>>> 3cbaa27 (feat: ajustes do dashboard e onboarding)
        setTimeout(() => {
          ignoreNextAuthEventRef.current = false;
        }, 2000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

<<<<<<< HEAD
    const checkUser = async () => {
=======
    // Intercept clicks on navigation links
    const handleNavigationClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');

      if (link && link.href) {
        const url = new URL(link.href);
        if (url.pathname === '/myeasywebsite') {
          e.preventDefault();
          setCurrentView('myeasywebsite');
        } else if (url.pathname === '/business-guru') {
          e.preventDefault();
          setCurrentView('businessguru');
        } else if (url.pathname === '/') {
          e.preventDefault();
          setCurrentView('home');
        }
      }
    };

    // Add click listener
    document.addEventListener('click', handleNavigationClick);

    // ==================== CLOUDFLARE AUTH CALLBACK ====================
    // Handle OAuth callback from Cloudflare (when redirected with ?token=...)
    const handleCloudflareCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const cloudflareToken = urlParams.get('token');

      if (cloudflareToken) {
        console.log('🔄 [APP] Processing Cloudflare OAuth callback...');
        setIsAuthLoading(true);
        isUserActionRef.current = true;

        try {
          const result = await authService.handleAuthCallback();

          if (result.success && result.user) {
            console.log('✅ [APP] Cloudflare OAuth successful:', result.user.email);

            // Convert AuthUser to User format for compatibility
            const convertedUser = authUserToUser(result.user);
            setUser(convertedUser);

            // Fetch user data and update display name
            if (result.user.email) {
              const userData = await fetchUserData(result.user.email);
              setUserName(userData.name);
            }

            // Check if needs onboarding
            if (convertedUser) {
              const needsOnboardingCheck = await userManagementServiceV2.checkUserNeedsOnboarding(
                convertedUser,
              );
              setNeedsOnboarding(needsOnboardingCheck);

              // Navigate based on onboarding status
              if (needsOnboardingCheck) {
                setCurrentView('home');
                setTimeout(() => {
                  onboardingModal.open();
                }, 100);
              } else {
                setCurrentView('dashboard');
              }
            }

            // Clean URL (remove token from address bar)
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            console.error('❌ [APP] Cloudflare OAuth failed:', result.error);
          }
        } catch (error) {
          console.error('❌ [APP] Error processing Cloudflare callback:', error);
        } finally {
          setTimeout(() => {
            setIsAuthLoading(false);
            isUserActionRef.current = false;
          }, 1500);
        }

        setLoading(false);
        setIsCheckingAuth(false);
        return true; // Indicates callback was handled
      }
      return false;
    };

    // ==================== INIT AUTH ====================
    const initAuth = async () => {
      // First, check if this is a Cloudflare OAuth callback
      const wasCallback = await handleCloudflareCallback();
      if (wasCallback) return;

      // Then check AuthServiceV2 for existing session (Cloudflare or Supabase)
      await authService.waitForInit();
      const authUser = authService.getUser();

      if (authUser) {
        console.log('✅ [APP] Session restored from AuthServiceV2:', authUser.email);
        const convertedUser = authUserToUser(authUser);
        setUser(convertedUser);

        if (authUser.email) {
          const userData = await fetchUserData(authUser.email);
          setUserName(userData.name);
        }

        if (convertedUser) {
          const needsOnboardingCheck = await userManagementServiceV2.checkUserNeedsOnboarding(
            convertedUser,
          );
          setNeedsOnboarding(needsOnboardingCheck);
        }

        setLoading(false);
        setIsCheckingAuth(false);
        isInitialLoadRef.current = false;
        return;
      }

      // Fallback: Check Supabase session directly
>>>>>>> 3cbaa27 (feat: ajustes do dashboard e onboarding)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);

        if (session?.user?.email) {
          const userData = await fetchUserData(session.user.email);
          setUserName(userData.name);
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

    const timeoutId = setTimeout(() => {
      setLoading(false);
      setIsCheckingAuth(false);
    }, 5000);

<<<<<<< HEAD
=======
    // ==================== AUTHSERVICE V2 LISTENER ====================
    // Listen for auth state changes from AuthServiceV2 (Cloudflare PRIMARY)
    const unsubscribeAuthV2 = authService.onAuthStateChange(async (authUser) => {
      console.log('🔄 [APP] AuthServiceV2 state change:', authUser?.email || 'null');

      if (authUser && !isInitialLoadRef.current) {
        const convertedUser = authUserToUser(authUser);
        setUser(convertedUser);

        if (authUser.email) {
          const userData = await fetchUserData(authUser.email);
          setUserName(userData.name);
        }
      } else if (!authUser) {
        // Only clear if this is intentional logout (not initial load)
        if (!isInitialLoadRef.current && user) {
          setUser(null);
          setUserName('Usuário');
          setUserAvatarUrl(undefined);
          setCurrentView('home');
          setNeedsOnboarding(false);
        }
      }
    });

    // ==================== SUPABASE LISTENER (FALLBACK) ====================
    // Listen for authentication changes from Supabase (FALLBACK)
>>>>>>> 3cbaa27 (feat: ajustes do dashboard e onboarding)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Only process Supabase events if we're using Supabase as auth source
      const authSource = authService.getAuthSource();
      if (authSource === 'cloudflare') {
        console.log('📢 [APP] Ignoring Supabase event (using Cloudflare):', event);
        return;
      }

      console.log('Auth event:', event, 'isInitialLoad:', isInitialLoadRef.current);
      setUser(session?.user ?? null);

      if (event === 'INITIAL_SESSION') {
        if (session?.user) {
          await userManagementServiceV2.ensureUserInDatabase(session.user);

          if (session.user.email) {
            const userData = await fetchUserData(session.user.email);
            setUserName(userData.name);
          }

          const needsOnboardingCheck = await userManagementServiceV2.checkUserNeedsOnboarding(
            session.user,
          );
          setNeedsOnboarding(needsOnboardingCheck);
        }
        isInitialLoadRef.current = false;
      }

      if (event === 'SIGNED_IN' && !isInitialLoadRef.current) {
        if (ignoreNextAuthEventRef.current) {
          console.log('Ignoring SIGNED_IN event after tab visibility change');
          return;
        }

        if (isUserActionRef.current) {
          setIsAuthLoading(true);
        }
        loginModal.close();
        signupModal.close();

        if (session?.user) {
          await userManagementServiceV2.ensureUserInDatabase(session.user);

          if (session.user.email) {
            const userData = await fetchUserData(session.user.email);
            setUserName(userData.name);
          }

<<<<<<< HEAD
          const needsOnboardingCheck = await userManagementService.checkUserNeedsOnboarding(
=======
          // Check if needs onboarding
          const needsOnboardingCheck = await userManagementServiceV2.checkUserNeedsOnboarding(
>>>>>>> 3cbaa27 (feat: ajustes do dashboard e onboarding)
            session.user,
          );
          setNeedsOnboarding(needsOnboardingCheck);

          if (needsOnboardingCheck) {
            navigate(ROUTES.HOME);
            setTimeout(() => {
              onboardingModal.open();
            }, 100);
          } else {
            navigate(ROUTES.DASHBOARD);
          }

          if (isUserActionRef.current) {
            setTimeout(() => {
              setIsAuthLoading(false);
              isUserActionRef.current = false;
            }, 1500);
          }
        }
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserName('Usuário');
        setUserAvatarUrl(undefined);
        setNeedsOnboarding(false);
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

  // Rendering based on current view and user state
  if (user && currentView === 'dashboard') {
    return (
      <>
        {/* Authentication loading bar */}
        <LoadingBar isLoading={isAuthLoading} duration={2300} />
        <Dashboard
          key={dashboardKey}
          onGoHome={goToHome}
          onGoToMyEasyWebsite={goToMyEasyWebsite}
          onGoToBusinessGuru={goToBusinessGuru}
<<<<<<< HEAD
          onGoToMyEasyPricing={goToMyEasyPricing}
=======
          initialTab={dashboardInitialTab}
>>>>>>> 3cbaa27 (feat: ajustes do dashboard e onboarding)
          onLoadingComplete={() => {
            // Callback when dashboard loading finishes
            console.log('Dashboard loaded successfully!');
            // Reset initial tab to overview for next time
            setDashboardInitialTab('overview');
          }}
        />
      </>
    );
  }

  if (user && currentView === 'myeasywebsite') {
    return <MyEasyWebsite onBackToDashboard={goToDashboard} onGoToSubscription={goToSubscription} />;
  }
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
            <FinalCta />
            <Footer />

            {user && (
              <OnboardingModal
                isOpen={onboardingModal.isOpen}
                onClose={closeOnboarding}
                onComplete={handleOnboardingComplete}
                user={user}
                disableClose={needsOnboarding}
              />
            )}

            <PWAInstallBanner />
          </main>
        }
      />

      {/* Protected routes */}
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute
            user={user}
            needsOnboarding={needsOnboarding}
            onOpenOnboarding={() => onboardingModal.open()}
            isLoading={loading}
          >
            <div>
              <LoadingBar isLoading={isAuthLoading} duration={2300} />
              <Dashboard
                key={dashboardKey}
                onGoHome={goToHome}
                onGoToMyEasyWebsite={goToMyEasyWebsite}
                onGoToBusinessGuru={goToBusinessGuru}
                onGoToMyEasyCRM={goToMyEasyCRM}
                onLoadingComplete={() => {
                  console.log('Dashboard loaded successfully!');
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
            onOpenOnboarding={() => onboardingModal.open()}
            isLoading={loading}
          >
            <MyEasyWebsite onBackToDashboard={goToDashboard} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.BUSINESS_GURU}
        element={
          <ProtectedRoute
            user={user}
            needsOnboarding={needsOnboarding}
            onOpenOnboarding={() => onboardingModal.open()}
            isLoading={loading}
          >
            <BusinessGuru onBackToDashboard={goToDashboard} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.MY_EASY_CRM}
        element={
          <ProtectedRoute
            user={user}
            needsOnboarding={needsOnboarding}
            onOpenOnboarding={() => onboardingModal.open()}
            isLoading={loading}
          >
            <MyEasyCRM
              userName={userName}
              userEmail={user?.email}
              onLogout={handleLogout}
              onBackToMain={goToDashboard}
            />
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
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
