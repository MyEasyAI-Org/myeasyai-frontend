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
import { supabase } from './lib/api-clients/supabase-client';
import { ROUTES } from './router';
import { userManagementService } from './services/UserManagementService';

// Configuration: Enable/Disable Splash Screen
// Change to `true` to re-enable the splash screen "Welcome to the future of AI"
const ENABLE_SPLASH_SCREEN = false;

/**
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
  const [dashboardKey, setDashboardKey] = useState(Date.now());
  const isUserActionRef = useRef(false);
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

  const handleLogout = () => {
    isUserActionRef.current = true;
    setIsAuthLoading(true);

    setTimeout(() => {
      setUser(null);
      setUserName('Usuário');
      setNeedsOnboarding(false);
      onboardingModal.close();
      loginModal.close();
      signupModal.close();
      setIsCheckingAuth(false);

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

      supabase.auth.signOut().catch((error) => {
        console.error('Erro ao fazer logout:', error);
      });

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

        setTimeout(() => {
          ignoreNextAuthEventRef.current = false;
        }, 2000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const checkUser = async () => {
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

    checkUser();

    const timeoutId = setTimeout(() => {
      setLoading(false);
      setIsCheckingAuth(false);
    }, 5000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, 'isInitialLoad:', isInitialLoadRef.current);
      setUser(session?.user ?? null);

      if (event === 'INITIAL_SESSION') {
        if (session?.user) {
          await userManagementService.ensureUserInDatabase(session.user);

          if (session.user.email) {
            const userData = await fetchUserData(session.user.email);
            setUserName(userData.name);
          }

          const needsOnboardingCheck = await userManagementService.checkUserNeedsOnboarding(
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
          await userManagementService.ensureUserInDatabase(session.user);

          if (session.user.email) {
            const userData = await fetchUserData(session.user.email);
            setUserName(userData.name);
          }

          const needsOnboardingCheck = await userManagementService.checkUserNeedsOnboarding(
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
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [navigate]);

  if (loading && ENABLE_SPLASH_SCREEN) {
    return <LoadingIntro />;
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
