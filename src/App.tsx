import { useState, useEffect } from "react";
import "./App.css";
import { Courses } from "./components/Courses";
import { Features } from "./components/Features";
import { FinalCta } from "./components/FinalCTA";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { MidStats } from "./components/MidStats";
import NavBar from "./components/NavBar";
import { Preview } from "./components/Preview";
import { DashboardPreview } from "./components/DashboardPreview";
import { OnboardingModal } from "./components/OnboardingModal";
import { LoadingIntro } from "./components/LoadingIntro";
import { PWAInstallBanner } from "./components/PWAInstallBanner";
import { LoadingBar } from "./components/LoadingBar";
import { supabase, ensureUserInDatabase, checkUserNeedsOnboarding } from "./lib/supabase";
import { useInactivityTimeout } from "./hooks/useInactivityTimeout";
import type { User } from "@supabase/supabase-js";

// 🎬 CONFIGURAÇÃO: Ativar/Desativar Splash Screen
// Mude para `true` para reativar a splash screen "Welcome to the future of AI"
const ENABLE_SPLASH_SCREEN = false;

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'dashboard'>('home');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

  const openSignup = () => setIsSignupOpen(true);
  const closeSignup = () => setIsSignupOpen(false);

  const handleLogout = () => {
    // Ativar barra de carregamento PRIMEIRO
    setIsAuthLoading(true);

    // Usar setTimeout para não bloquear - limpar UI imediatamente mas depois da barra renderizar
    setTimeout(() => {
      // Limpar estados React para UI atualizar (menu dropdown desaparece)
      setUser(null);
      setCurrentView('home');
      setNeedsOnboarding(false);
      setIsOnboardingOpen(false);
      setIsLoginOpen(false);
      setIsSignupOpen(false);

      // Limpar localStorage
      const localKeys = Object.keys(localStorage);
      localKeys.forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });

      // Limpar sessionStorage
      const sessionKeys = Object.keys(sessionStorage);
      sessionKeys.forEach(key => {
        if (key.startsWith('sb-')) {
          sessionStorage.removeItem(key);
        }
      });

      // Fazer signOut do Supabase
      supabase.auth.signOut().catch((error) => {
        console.error('Erro ao fazer logout:', error);
      });

      // Desativar barra de carregamento após completar
      setTimeout(() => {
        setIsAuthLoading(false);
      }, 2500);
    }, 50); // Delay mínimo para barra renderizar
  };

  const goToDashboard = () => {
    if (needsOnboarding) {
      setIsOnboardingOpen(true);
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleOnboardingComplete = () => {
    setIsOnboardingOpen(false);
    setNeedsOnboarding(false);
    setCurrentView('dashboard');
  };

  const closeOnboarding = () => {
    setIsOnboardingOpen(false);
    // Manter needsOnboarding como true se o usuário fechar sem completar
  };

  // Timer de inatividade - 10 minutos (600000ms)
  useInactivityTimeout({
    timeout: 10 * 60 * 1000, // 10 minutos
    onTimeout: handleLogout,
    enabled: !!user // Só ativar se houver usuário logado
  });

  useEffect(() => {
    // Verificar sessão atual
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Fallback de segurança - garantir que loading seja false após 5 segundos
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 5000);

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);

        // Apenas processar login quando NÃO for a carga inicial da sessão
        if (event === 'SIGNED_IN' && !isInitialLoad) {
          // Ativar barra de carregamento apenas em login intencional
          setIsAuthLoading(true);
          setIsLoginOpen(false);
          setIsSignupOpen(false);

          // Registrar usuário na tabela users (especialmente para login social)
          if (session?.user) {
            await ensureUserInDatabase(session.user);

            // Verificar se precisa de onboarding
            const needsOnboardingCheck = await checkUserNeedsOnboarding(session.user);
            setNeedsOnboarding(needsOnboardingCheck);

            // Se precisar de onboarding, abrir modal automaticamente
            if (needsOnboardingCheck) {
              setIsOnboardingOpen(true);
            }

            // Desativar barra de carregamento após completar (tempo maior para ser visível)
            setTimeout(() => {
              setIsAuthLoading(false);
            }, 1500);
          }
        }

        // Processar restauração de sessão silenciosamente (sem barra)
        if (event === 'INITIAL_SESSION' || (event === 'SIGNED_IN' && isInitialLoad)) {
          if (session?.user) {
            await ensureUserInDatabase(session.user);
            const needsOnboardingCheck = await checkUserNeedsOnboarding(session.user);
            setNeedsOnboarding(needsOnboardingCheck);
          }
          // Marcar que a carga inicial foi completada
          setIsInitialLoad(false);
        }

        // Limpar estados após logout
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setCurrentView('home');
          setNeedsOnboarding(false);
          setIsOnboardingOpen(false);
          setIsLoginOpen(false);
          setIsSignupOpen(false);
          setIsAuthLoading(false);
          setIsInitialLoad(true); // Resetar flag para próximo login
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  if (loading && ENABLE_SPLASH_SCREEN) {
    return <LoadingIntro />;
  }

  // Renderização baseada na view atual e estado do usuário
  if (user && currentView === 'dashboard') {
    return (
      <>
        {/* Barra de carregamento de autenticação */}
        <LoadingBar isLoading={isAuthLoading} duration={2300} />
        <DashboardPreview />
      </>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black-main to-blue-main">
      {/* Barra de carregamento de autenticação */}
      <LoadingBar isLoading={isAuthLoading} duration={2300} />

      <NavBar
        onLoginClick={openLogin}
        onSignupClick={openSignup}
        user={user}
        onDashboardClick={goToDashboard}
        onLogout={handleLogout}
      />

      {/* Botão de Debug para Onboarding Modal */}
      {user && (
        <button
          onClick={() => setIsOnboardingOpen(true)}
          className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg font-semibold text-sm transition-colors"
          title="Debug: Abrir Onboarding Modal"
        >
          🧪 Debug Onboarding
        </button>
      )}
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
      <MidStats />
      <Courses />
      <FinalCta />
      <Footer />

      {/* Modal de Onboarding */}
      {user && (
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={closeOnboarding}
          onComplete={handleOnboardingComplete}
          user={user}
        />
      )}

      {/* Banner de Instalação PWA */}
      <PWAInstallBanner />
    </main>
  );
}

export default App;
