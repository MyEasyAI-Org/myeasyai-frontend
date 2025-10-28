import { useEffect, useState } from 'react';
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
import { Preview } from './components/Preview';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { useInactivityTimeout } from './hooks/useInactivityTimeout';
import {
  checkUserNeedsOnboarding,
  ensureUserInDatabase,
  supabase,
} from './lib/supabase';

// 🎬 CONFIGURAÇÃO: Ativar/Desativar Splash Screen
// Mude para `true` para reativar a splash screen "Welcome to the future of AI"
const ENABLE_SPLASH_SCREEN = false;

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string>(() => {
    // Tentar carregar do localStorage na inicialização
    return localStorage.getItem('userName') || 'Usuário';
  });
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'preview' | 'myeasywebsite' | 'businessguru'>('home');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(() => {
    // Se já tem dados no localStorage, não precisa mostrar loading
    return !localStorage.getItem('userName');
  });

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

  const openSignup = () => setIsSignupOpen(true);
  const closeSignup = () => setIsSignupOpen(false);

  // Função para buscar nome do usuário do banco
  const fetchUserName = async (userEmail: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('name, preferred_name')
        .eq('email', userEmail)
        .single();

      if (error) {
        console.error('Erro ao buscar nome do usuário:', error);
        return 'Usuário';
      }

      let displayName = 'Usuário';

      // Priorizar preferred_name, senão usar o primeiro nome
      if (data?.preferred_name) {
        displayName = data.preferred_name;
      } else if (data?.name) {
        // Pegar apenas o primeiro nome
        displayName = data.name.split(' ')[0];
      }

      // Salvar no localStorage para persistir entre recarregamentos
      localStorage.setItem('userName', displayName);
      return displayName;
    } catch (error) {
      console.error('Erro ao buscar nome do usuário:', error);
      return 'Usuário';
    }
  };

  const handleLogout = () => {
    // Ativar barra de carregamento PRIMEIRO
    setIsAuthLoading(true);

    // Usar setTimeout para não bloquear - limpar UI imediatamente mas depois da barra renderizar
    setTimeout(() => {
      // Limpar estados React para UI atualizar (menu dropdown desaparece)
      setUser(null);
      setUserName('Usuário');
      setCurrentView('home');
      setNeedsOnboarding(false);
      setIsOnboardingOpen(false);
      setIsLoginOpen(false);
      setIsSignupOpen(false);
      setIsCheckingAuth(false);

      // Limpar localStorage
      const localKeys = Object.keys(localStorage);
      localKeys.forEach((key) => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });
      // Limpar dados do perfil do usuário
      localStorage.removeItem('userName');
      localStorage.removeItem('userProfile');

      // Limpar sessionStorage
      const sessionKeys = Object.keys(sessionStorage);
      sessionKeys.forEach((key) => {
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
      // Mostrar splash screen antes de ir para o dashboard
      setIsLoadingDashboard(true);

      // Após 3 segundos, ir para o dashboard
      setTimeout(() => {
        setCurrentView('dashboard');
        setIsLoadingDashboard(false);
      }, 3000);
    }
  };

  const goToHome = () => {
    setCurrentView('home');
  };

  const handleOnboardingComplete = () => {
    setIsOnboardingOpen(false);
    setNeedsOnboarding(false);

    // Mostrar splash screen antes de ir para o dashboard
    setIsLoadingDashboard(true);

    // Após 3 segundos, ir para o dashboard
    setTimeout(() => {
      setCurrentView('dashboard');
      setIsLoadingDashboard(false);
    }, 3000);
  };

  const closeOnboarding = () => {
    setIsOnboardingOpen(false);
    // Manter needsOnboarding como true se o usuário fechar sem completar
  };

  // Timer de inatividade - 10 minutos (600000ms)
  useInactivityTimeout({
    timeout: 10 * 60 * 1000, // 10 minutos
    onTimeout: handleLogout,
    enabled: !!user, // Só ativar se houver usuário logado
  });

  useEffect(() => {
    // Interceptar clicks em links de navegação
    const handleNavigationClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href) {
        const url = new URL(link.href);
        if (url.pathname === '/myeasywebsite') {
          e.preventDefault();
          setCurrentView('myeasywebsite');
        } else if (url.pathname === '/businessguru') {
          e.preventDefault();
          setCurrentView('businessguru');
        } else if (url.pathname === '/') {
          e.preventDefault();
          setCurrentView('home');
        }
      }
    };

    // Verificar hash para preview mode
    const handleHashChange = () => {
      if (window.location.hash === '#dashboard-preview') {
        setCurrentView('preview');
      }
    };

    // Verificar no carregamento inicial
    handleHashChange();

    // Escutar mudanças no hash e clicks
    window.addEventListener('hashchange', handleHashChange);
    document.addEventListener('click', handleNavigationClick);

    // Verificar sessão atual
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);

        // Buscar nome do usuário se houver sessão
        if (session?.user?.email) {
          const name = await fetchUserName(session.user.email);
          setUserName(name);
        }
      } catch (error) {
        console.error('❌ Erro ao verificar sessão:', error);
        setUser(null);
      } finally {
        setLoading(false);
        setIsCheckingAuth(false);
      }
    };

    checkUser();

    // Fallback de segurança - garantir que loading seja false após 5 segundos
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setIsCheckingAuth(false);
    }, 5000);

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
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

          // Buscar nome do usuário
          if (session.user.email) {
            const name = await fetchUserName(session.user.email);
            setUserName(name);
          }

          // Verificar se precisa de onboarding
          const needsOnboardingCheck = await checkUserNeedsOnboarding(
            session.user,
          );
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
      if (
        event === 'INITIAL_SESSION' ||
        (event === 'SIGNED_IN' && isInitialLoad)
      ) {
        if (session?.user) {
          await ensureUserInDatabase(session.user);

          // Buscar nome do usuário
          if (session.user.email) {
            const name = await fetchUserName(session.user.email);
            setUserName(name);
          }

          const needsOnboardingCheck = await checkUserNeedsOnboarding(
            session.user,
          );
          setNeedsOnboarding(needsOnboardingCheck);
        }
        // Marcar que a carga inicial foi completada
        setIsInitialLoad(false);
      }

      // Limpar estados após logout
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserName('Usuário');
        setCurrentView('home');
        setNeedsOnboarding(false);
        setIsOnboardingOpen(false);
        setIsLoginOpen(false);
        setIsSignupOpen(false);
        setIsAuthLoading(false);
        setIsInitialLoad(true); // Resetar flag para próximo login
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
      window.removeEventListener('hashchange', handleHashChange);
      document.removeEventListener('click', handleNavigationClick);
    };
  }, []);

  if (loading && ENABLE_SPLASH_SCREEN) {
    return <LoadingIntro />;
  }

  // Mostrar splash screen ao carregar dashboard
  if (isLoadingDashboard) {
    return <LoadingIntro />;
  }

  // Renderização baseada na view atual e estado do usuário
  if (user && currentView === 'dashboard') {
    return (
      <>
        {/* Barra de carregamento de autenticação */}
        <LoadingBar isLoading={isAuthLoading} duration={2300} />
        <DashboardPreview
          onLogout={handleLogout}
          onGoHome={goToHome}
          userName={userName}
        />
      </>
    );
  }

  if (user && currentView === 'myeasywebsite') {
    return <MyEasyWebsite />;
  }

  if (user && currentView === 'businessguru') {
    return <BusinessGuru />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black-main to-blue-main">
      {/* Barra de carregamento de autenticação */}
      <LoadingBar isLoading={isAuthLoading} duration={2300} />

      <NavBar
        onLoginClick={openLogin}
        onSignupClick={openSignup}
        user={user}
        userName={userName}
        onDashboardClick={goToDashboard}
        onLogout={handleLogout}
        onLogoClick={goToHome}
        isCheckingAuth={isCheckingAuth}
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
