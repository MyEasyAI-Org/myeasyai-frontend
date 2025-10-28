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
import { MyEasyWebsite } from "./features/myeasywebsite/MyEasyWebsite";
import { BusinessGuru } from "./features/businessguru/BusinessGuru";
import { supabase, ensureUserInDatabase, checkUserNeedsOnboarding } from "./lib/supabase";
import { useInactivityTimeout } from "./hooks/useInactivityTimeout";
import type { User } from "@supabase/supabase-js";

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'preview' | 'myeasywebsite' | 'businessguru'>('home');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

  const openSignup = () => setIsSignupOpen(true);
  const closeSignup = () => setIsSignupOpen(false);

  const handleLogout = async () => {
    console.log('🔄 Iniciando processo de logout...');
    
    // Primeiro, limpar estados imediatamente para UI responsiva
    console.log('🧹 Limpando estados locais IMEDIATAMENTE...');
    setUser(null);
    setCurrentView('home');
    setNeedsOnboarding(false);
    setIsOnboardingOpen(false);
    setIsLoginOpen(false);
    setIsSignupOpen(false);
    console.log('🏠 Estados limpos, interface atualizada');
    
    // Garantir signOut do Supabase com tentativas múltiplas
    const forceSignOut = async () => {
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          console.log(`📤 Tentativa ${attempts + 1} de signOut no Supabase...`);
          await supabase.auth.signOut({ scope: 'local' }); // Forçar logout local
          console.log('✅ SignOut realizado com sucesso');
          break;
        } catch (error) {
          attempts++;
          console.error(`❌ Tentativa ${attempts} falhou:`, error);
          if (attempts >= maxAttempts) {
            console.log('🔧 Forçando limpeza local da sessão...');
            // Forçar limpeza manual do localStorage se necessário
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            if (supabaseUrl) {
              const urlKey = supabaseUrl.split('//')[1].split('.')[0];
              localStorage.removeItem(`sb-${urlKey}-auth-token`);
            }
            sessionStorage.clear();
          }
        }
      }
    };
    
    // Executar signOut sem bloquear a UI mas garantindo que aconteça
    forceSignOut();
  };

  const goToDashboard = () => {
    if (needsOnboarding) {
      setIsOnboardingOpen(true);
    } else {
      setCurrentView('dashboard');
    }
  };
  const goToHome = () => setCurrentView('home');

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
        console.log('🔍 Verificando sessão inicial...');
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        
        if (currentUser) {
          console.log('✅ SESSÃO ENCONTRADA! Usuário:', currentUser.email);
          console.log('📧 Email:', currentUser.email);
          console.log('🆔 ID:', currentUser.id);
          
          setUser(currentUser);
          
          // Fechar modais que possam estar abertos
          console.log('🔐 Fechando modais de login/signup (se abertos)...');
          setIsLoginOpen(false);
          setIsSignupOpen(false);
          
          console.log('💾 Registrando usuário no banco...');
          await ensureUserInDatabase(currentUser);
          
          console.log('🔍 Verificando necessidade de onboarding...');
          const needsOnboardingCheck = await checkUserNeedsOnboarding(currentUser);
          setNeedsOnboarding(needsOnboardingCheck);
          console.log('📋 Precisa onboarding?', needsOnboardingCheck);
          
          // Abrir modal de onboarding automaticamente se necessário
          if (needsOnboardingCheck) {
            console.log('✅ Abrindo modal de onboarding...');
            setIsOnboardingOpen(true);
          }
          
          console.log('✨ Sessão carregada com sucesso! NavBar deve mostrar Dashboard/Sair');
        } else {
          console.log('❌ Nenhuma sessão encontrada');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Erro ao verificar sessão:', error);
        setUser(null);
      } finally {
        setLoading(false);
        console.log('✅ Carregamento inicial completo');
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
        console.log('🔔 Auth State Change:', event, 'User:', session?.user?.email);
        
        // Atualizar estado do usuário IMEDIATAMENTE
        const newUser = session?.user ?? null;
        setUser(newUser);
        console.log('👤 Estado do usuário atualizado:', newUser?.email || 'nenhum usuário');

        // Fechar modais após login bem-sucedido
        if (event === 'SIGNED_IN') {
          console.log('🔑 ✅ Evento SIGNED_IN detectado - Usuário:', session?.user?.email);
          console.log('🔐 Fechando modais de login/signup...');
          setIsLoginOpen(false);
          setIsSignupOpen(false);

          // Registrar usuário na tabela users (especialmente para login social)
          if (session?.user) {
            console.log('💾 Registrando usuário no banco...');
            await ensureUserInDatabase(session.user);

            // Verificar se precisa de onboarding
            console.log('🔍 Verificando necessidade de onboarding...');
            const needsOnboardingCheck = await checkUserNeedsOnboarding(session.user);
            setNeedsOnboarding(needsOnboardingCheck);
            console.log('📋 Precisa onboarding?', needsOnboardingCheck);

            // Se precisar de onboarding, abrir modal automaticamente
            if (needsOnboardingCheck) {
              console.log('✅ Abrindo modal de onboarding...');
              setIsOnboardingOpen(true);
            }
          }
          
          console.log('✨ Login completo! Interface deve atualizar agora.');
        }

        // Limpar estados após logout
        if (event === 'SIGNED_OUT') {
          console.log('🚪 ✅ Evento SIGNED_OUT detectado');
          setUser(null);
          setCurrentView('home');
          setNeedsOnboarding(false);
          setIsOnboardingOpen(false);
          setIsLoginOpen(false);
          setIsSignupOpen(false);
          console.log('🏠 Estados limpos pelo listener de auth');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
      window.removeEventListener('hashchange', handleHashChange);
      document.removeEventListener('click', handleNavigationClick);
    };
  }, []);

  if (loading) {
    return <LoadingIntro />;
  }

  // Renderização baseada na view atual e estado do usuário
  if (user && currentView === 'dashboard') {
    return <DashboardPreview />;
  }

  if (user && currentView === 'myeasywebsite') {
    return <MyEasyWebsite />;
  }

  if (user && currentView === 'businessguru') {
    return <BusinessGuru />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black-main to-blue-main">
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
