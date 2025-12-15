import { useEffect, useRef, useState } from 'react';
import './App.css';
import type { User } from '@supabase/supabase-js';
import { Toaster } from 'sonner';
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
import { MyEasyWebsite } from './features/my-easy-website/MyEasyWebsite';
import { useInactivityTimeout } from './hooks/useInactivityTimeout';
import { useModalState } from './hooks/useModalState';
import { useRealtimeSync } from './hooks/useRealtimeSync';
import { supabase } from './lib/api-clients/supabase-client';
import { userManagementServiceV2 } from './services/UserManagementServiceV2';
import { authService, type AuthUser } from './services/AuthServiceV2';

// 🎬 CONFIGURATION: Enable/Disable Splash Screen
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

  const loginModal = useModalState();
  const signupModal = useModalState();
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string>(() => {
    // Try to load from localStorage on initialization
    return localStorage.getItem('userName') || 'Usuário';
  });
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | undefined>(() => {
    // Try to load from localStorage on initialization
    return localStorage.getItem('userAvatarUrl') || undefined;
  });
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<
    'home' | 'dashboard' | 'preview' | 'myeasywebsite' | 'businessguru'
  >('home');
  const onboardingModal = useModalState();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const isInitialLoadRef = useRef(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(() => {
    // If data is already in localStorage, no need to show loading
    return !localStorage.getItem('userName');
  });
  const [dashboardKey, setDashboardKey] = useState(Date.now());
  const [dashboardInitialTab, setDashboardInitialTab] = useState<'overview' | 'subscription' | 'products' | 'usage' | 'settings' | 'profile'>('overview');
  const isUserActionRef = useRef(false); // Track if action is user-initiated
  const wasPageHiddenRef = useRef(false); // Track if page was hidden (tab switch/minimize)
  const ignoreNextAuthEventRef = useRef(false); // Ignore auth events after visibility change

  const openLogin = () => {
    isUserActionRef.current = true; // Mark as user action
    loginModal.open();
  };
  const closeLogin = () => loginModal.close();

  const openSignup = () => {
    isUserActionRef.current = true; // Mark as user action
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

      // Prioritize preferred_name, otherwise use first name
      if (data?.preferred_name) {
        displayName = data.preferred_name;
      } else if (data?.name) {
        // Get only the first name
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

  const handleLogout = async () => {
    // Mark as user-initiated action
    isUserActionRef.current = true;

    // Enable loading bar FIRST
    setIsAuthLoading(true);

    // Use setTimeout to avoid blocking - clear UI immediately but after bar renders
    setTimeout(async () => {
      // Clear React states for UI to update (dropdown menu disappears)
      setUser(null);
      setUserName('Usuário');
      setCurrentView('home');
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

      // Disable loading bar after completion
      setTimeout(() => {
        setIsAuthLoading(false);
      }, 2500);
    }, 50); // Minimum delay for bar to render
  };

  const goToDashboard = () => {
    if (needsOnboarding) {
      onboardingModal.open();
    } else {
      // Go directly to dashboard - loading will be done by Dashboard itself
      setCurrentView('dashboard');
      // Force Dashboard remount to reload data
      setDashboardKey(Date.now());
    }
  };

  const goToHome = () => {
    setCurrentView('home');
  };

  const goToMyEasyWebsite = () => {
    setCurrentView('myeasywebsite');
  };

  const goToBusinessGuru = () => {
    setCurrentView('businessguru');
  };

  const goToSubscription = () => {
    setDashboardInitialTab('subscription');
    setCurrentView('dashboard');
    setDashboardKey(Date.now()); // Force remount to apply new initial tab
  };

  const handleOnboardingComplete = () => {
    onboardingModal.close();
    setNeedsOnboarding(false);

    // Go directly to dashboard - loading will be done by Dashboard itself
    setCurrentView('dashboard');
  };

  const closeOnboarding = () => {
    onboardingModal.close();
    // Keep needsOnboarding as true if user closes without completing
  };

  // Inactivity timer - 10 minutes (600000ms)
  useInactivityTimeout({
    timeout: 10 * 60 * 1000, // 10 minutes
    onTimeout: handleLogout,
    enabled: !!user, // Only enable if there's a logged in user
  });

  useEffect(() => {
    // Monitor page visibility to ignore auth events when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is now hidden (tab switched away or minimized)
        wasPageHiddenRef.current = true;
      } else if (wasPageHiddenRef.current) {
        // Page is now visible again after being hidden
        ignoreNextAuthEventRef.current = true;
        wasPageHiddenRef.current = false;

        // Reset the ignore flag after a short delay to catch the revalidation event
        setTimeout(() => {
          ignoreNextAuthEventRef.current = false;
        }, 2000); // 2 second window to ignore auth events after tab restore
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

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
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);

        // Fetch user data if there's a session
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

    // Safety fallback - ensure loading is false after 5 seconds
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setIsCheckingAuth(false);
    }, 5000);

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

      // Process session restoration silently (without loading bar)
      if (event === 'INITIAL_SESSION') {
        if (session?.user) {
          await userManagementServiceV2.ensureUserInDatabase(session.user);

          // Fetch user data
          if (session.user.email) {
            const userData = await fetchUserData(session.user.email);
            setUserName(userData.name);
          }

          const needsOnboardingCheck = await userManagementServiceV2.checkUserNeedsOnboarding(
            session.user,
          );
          setNeedsOnboarding(needsOnboardingCheck);
        }
        // Mark that initial load was completed
        isInitialLoadRef.current = false;
      }

      // Process intentional login (email, OAuth, etc)
      if (event === 'SIGNED_IN' && !isInitialLoadRef.current) {
        // IGNORE auth events that occur after tab visibility change (revalidation)
        if (ignoreNextAuthEventRef.current) {
          console.log('Ignoring SIGNED_IN event after tab visibility change');
          return; // Exit early, don't process this event at all
        }

        // Enable loading bar ONLY if this is a user-initiated action
        if (isUserActionRef.current) {
          setIsAuthLoading(true);
        }
        loginModal.close();
        signupModal.close();

        // Register user in users table (especially for social login)
        if (session?.user) {
          await userManagementServiceV2.ensureUserInDatabase(session.user);

          // Fetch user data
          if (session.user.email) {
            const userData = await fetchUserData(session.user.email);
            setUserName(userData.name);
          }

          // Check if needs onboarding
          const needsOnboardingCheck = await userManagementServiceV2.checkUserNeedsOnboarding(
            session.user,
          );
          setNeedsOnboarding(needsOnboardingCheck);

          // If needs onboarding, stay on home and show onboarding modal
          // Only go to dashboard after onboarding is completed
          if (needsOnboardingCheck) {
            setCurrentView('home');
            setTimeout(() => {
              onboardingModal.open();
            }, 100);
          } else {
            // Navigate to dashboard after successful login if no onboarding needed
            setCurrentView('dashboard');
          }

          // Disable loading bar after completion (only if it was enabled)
          if (isUserActionRef.current) {
            setTimeout(() => {
              setIsAuthLoading(false);
              isUserActionRef.current = false; // Reset flag
            }, 1500);
          }
        }
      }

      // Clear states after logout
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserName('Usuário');
        setUserAvatarUrl(undefined);
        setCurrentView('home');
        setNeedsOnboarding(false);
        onboardingModal.close();
        loginModal.close();
        signupModal.close();
        setIsAuthLoading(false);
        isInitialLoadRef.current = true; // Reset flag for next login
        isUserActionRef.current = false; // Reset user action flag
      }
    });

    return () => {
      subscription.unsubscribe();
      unsubscribeAuthV2();
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleNavigationClick);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

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
          initialTab={dashboardInitialTab}
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

  if (user && currentView === 'businessguru') {
    return <BusinessGuru onBackToDashboard={goToDashboard} />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black-main to-blue-main">
      {/* Toast Notifications */}
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

      {/* Authentication loading bar */}
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

      {/* Onboarding Modal */}
      {user && (
        <OnboardingModal
          isOpen={onboardingModal.isOpen}
          onClose={closeOnboarding}
          onComplete={handleOnboardingComplete}
          user={user}
          disableClose={needsOnboarding}
        />
      )}

      {/* PWA Installation Banner */}
      <PWAInstallBanner />
    </main>
  );
}

export default App;
