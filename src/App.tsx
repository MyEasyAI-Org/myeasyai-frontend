import { useEffect, useRef, useState } from 'react';
import './App.css';
import type { User } from '@supabase/supabase-js';
import { Courses } from './components/Courses';
import { DashboardPreview } from './components/DashboardPreview';
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
import { supabase } from './lib/api-clients/supabase-client';
import { userManagementService } from './services/UserManagementService';

// 🎬 CONFIGURATION: Enable/Disable Splash Screen
// Change to `true` to re-enable the splash screen "Welcome to the future of AI"
const ENABLE_SPLASH_SCREEN = false;

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
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
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const isInitialLoadRef = useRef(true);
  const isUserInitiatedLoginRef = useRef(false); // Track if user clicked login/signup
  const [isCheckingAuth, setIsCheckingAuth] = useState(() => {
    // If data is already in localStorage, no need to show loading
    return !localStorage.getItem('userName');
  });
  const [dashboardKey, setDashboardKey] = useState(0);

  const openLogin = () => {
    isUserInitiatedLoginRef.current = true; // Mark as user-initiated
    setIsLoginOpen(true);
  };
  const closeLogin = () => {
    isUserInitiatedLoginRef.current = false; // Reset if user closes modal
    setIsLoginOpen(false);
  };

  const openSignup = () => {
    isUserInitiatedLoginRef.current = true; // Mark as user-initiated
    setIsSignupOpen(true);
  };
  const closeSignup = () => {
    isUserInitiatedLoginRef.current = false; // Reset if user closes modal
    setIsSignupOpen(false);
  };

  // Function to fetch user data from database
  const fetchUserData = async (userEmail: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('name, preferred_name, avatar_url')
        .eq('email', userEmail)
        .single();

      if (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        return { name: 'Usuário', avatarUrl: undefined };
      }

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

  const handleLogout = () => {
    // Enable loading bar FIRST
    setIsAuthLoading(true);

    // Reset login flag
    isUserInitiatedLoginRef.current = false;

    // Use setTimeout to avoid blocking - clear UI immediately but after bar renders
    setTimeout(() => {
      // Clear React states for UI to update (dropdown menu disappears)
      setUser(null);
      setUserName('Usuário');
      setCurrentView('home');
      setNeedsOnboarding(false);
      setIsOnboardingOpen(false);
      setIsLoginOpen(false);
      setIsSignupOpen(false);
      setIsCheckingAuth(false);

      // Clear localStorage
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

      // Sign out from Supabase
      supabase.auth.signOut().catch((error) => {
        console.error('Erro ao fazer logout:', error);
      });

      // Disable loading bar after completion
      setTimeout(() => {
        setIsAuthLoading(false);
      }, 2500);
    }, 50); // Minimum delay for bar to render
  };

  const goToDashboard = () => {
    if (needsOnboarding) {
      setIsOnboardingOpen(true);
    } else {
      // ALWAYS force Dashboard remount to reload FRESH data from Supabase
      console.log('🔄 Navegando para Dashboard - forçando recarregamento completo');
      setDashboardKey(prev => prev + 1); // Increment to force remount
      setCurrentView('dashboard');
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

  const handleOnboardingComplete = () => {
    setIsOnboardingOpen(false);
    setNeedsOnboarding(false);

    // Go directly to dashboard with fresh data
    setDashboardKey(prev => prev + 1);
    setCurrentView('dashboard');
  };

  const closeOnboarding = () => {
    setIsOnboardingOpen(false);
    // Keep needsOnboarding as true if user closes without completing
  };

  // Inactivity timer - 10 minutes (600000ms)
  useInactivityTimeout({
    timeout: 10 * 60 * 1000, // 10 minutes
    onTimeout: handleLogout,
    enabled: !!user, // Only enable if there's a logged in user
  });

  useEffect(() => {
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

    // Check current session
    const checkUser = async () => {
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

    checkUser();

    // Safety fallback - ensure loading is false after 5 seconds
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setIsCheckingAuth(false);
    }, 5000);

    // Listen for authentication changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, 'isInitialLoad:', isInitialLoadRef.current);
      setUser(session?.user ?? null);

      // Process session restoration silently (without loading bar)
      if (event === 'INITIAL_SESSION') {
        if (session?.user) {
          await userManagementService.ensureUserInDatabase(session.user);

          // Fetch user data
          if (session.user.email) {
            const userData = await fetchUserData(session.user.email);
            setUserName(userData.name);
          }

          const needsOnboardingCheck = await userManagementService.checkUserNeedsOnboarding(
            session.user,
          );
          setNeedsOnboarding(needsOnboardingCheck);
        }
        // Mark that initial load was completed
        isInitialLoadRef.current = false;
      }

      // Process intentional login (email, OAuth, etc)
      // ONLY process if this is a user-initiated login, not a background session refresh
      if (event === 'SIGNED_IN' && !isInitialLoadRef.current && isUserInitiatedLoginRef.current) {
        console.log('✅ Login iniciado pelo usuário - processando...');

        // Reset the flag since we're processing the login now
        isUserInitiatedLoginRef.current = false;

        // Enable loading bar only on intentional login
        setIsAuthLoading(true);
        setIsLoginOpen(false);
        setIsSignupOpen(false);

        // Register user in users table (especially for social login)
        if (session?.user) {
          await userManagementService.ensureUserInDatabase(session.user);

          // Fetch user data
          if (session.user.email) {
            const userData = await fetchUserData(session.user.email);
            setUserName(userData.name);
          }

          // Check if needs onboarding
          const needsOnboardingCheck = await userManagementService.checkUserNeedsOnboarding(
            session.user,
          );
          setNeedsOnboarding(needsOnboardingCheck);

          // If needs onboarding, stay on home and show onboarding modal
          // Only go to dashboard after onboarding is completed
          if (needsOnboardingCheck) {
            setCurrentView('home');
            setTimeout(() => {
              setIsOnboardingOpen(true);
            }, 100);
          } else {
            // Navigate to dashboard after successful login if no onboarding needed
            // Only navigate if not already on dashboard to avoid unnecessary remounts
            setCurrentView((currentView) => {
              if (currentView === 'dashboard') {
                console.log('⚠️ Já no Dashboard - ignorando navegação');
                return currentView; // Stay on dashboard without remounting
              }
              // Force fresh data load on login
              setDashboardKey(prev => prev + 1);
              return 'dashboard';
            });
          }

          // Disable loading bar after completion
          setTimeout(() => {
            setIsAuthLoading(false);
          }, 1500);
        }
      }

      // Clear states after logout
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserName('Usuário');
        setUserAvatarUrl(undefined);
        setCurrentView('home');
        setNeedsOnboarding(false);
        setIsOnboardingOpen(false);
        setIsLoginOpen(false);
        setIsSignupOpen(false);
        setIsAuthLoading(false);
        isInitialLoadRef.current = true; // Reset flag for next login
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleNavigationClick);
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
        <DashboardPreview
          key={dashboardKey}
          onGoHome={goToHome}
          onGoToMyEasyWebsite={goToMyEasyWebsite}
          onGoToBusinessGuru={goToBusinessGuru}
          onLoadingComplete={() => {
            // Callback when dashboard loading finishes
            console.log('Dashboard loaded successfully!');
          }}
        />
      </>
    );
  }

  if (user && currentView === 'myeasywebsite') {
    return <MyEasyWebsite onBackToDashboard={goToDashboard} />;
  }

  if (user && currentView === 'businessguru') {
    return <BusinessGuru onBackToDashboard={goToDashboard} />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black-main to-blue-main">
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
        isLoginOpen={isLoginOpen}
        onOpenLogin={openLogin}
        onCloseLogin={closeLogin}
        isSignupOpen={isSignupOpen}
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
          isOpen={isOnboardingOpen}
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
