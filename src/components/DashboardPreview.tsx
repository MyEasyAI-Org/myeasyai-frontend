import {
  ArrowUpCircle,
  BarChart3,
  Check,
  Clock,
  CreditCard,
  ExternalLink,
  LogOut,
  Package,
  Settings,
  TrendingUp,
  User as UserIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PLANS, type SubscriptionPlan } from '../constants/plans';
import { useNotifications } from '../hooks/useNotifications';
import { signOut, supabase } from '../lib/supabase';
import type { Notification } from '../types/notification';
import { Footer } from './Footer';
import NotificationBell from './NotificationBell';
import NotificationDetailModal from './NotificationDetailModal';
import NotificationDropdown from './NotificationDropdown';

type UserProfile = {
  name: string;
  preferred_name?: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  company?: string;
};

type SubscriptionData = {
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

type UserProduct = {
  id: string;
  product_name: string;
  product_status: string;
  subscribed_at: string;
  sites_created: number;
  consultations_made: number;
};

type DashboardPreviewProps = {
  onGoHome?: () => void;
  onGoToMyEasyWebsite?: () => void;
  onGoToBusinessGuru?: () => void;
  onLoadingComplete?: () => void;
};

export function DashboardPreview({
  onGoHome,
  onGoToMyEasyWebsite,
  onGoToBusinessGuru,
  onLoadingComplete,
}: DashboardPreviewProps = {}) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'subscription' | 'products' | 'usage' | 'settings' | 'profile'
  >('overview');
  const [subscription, setSubscription] = useState<SubscriptionData>({
    plan: 'free',
    status: 'active',
    start_date: new Date().toISOString(),
    tokens_used: 0,
    tokens_limit: 1000,
    requests_this_month: 0,
  });
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Carregando...',
    email: '',
    bio: '',
    phone: '',
    company: '',
  });
  const [userProducts, setUserProducts] = useState<UserProduct[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState('Inicializando...');
  const [userUuid, setUserUuid] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cadastralInfo, setCadastralInfo] = useState({
    country: '',
    postal_code: '',
    address: '',
    preferred_language: '',
    created_at: '',
    last_online: '',
  });
  const [isDangerZoneOpen, setIsDangerZoneOpen] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Notifications hook
  const { getUnreadCount, getLatest, markAsRead, markAllAsRead } =
    useNotifications();

  // Load logged in user data
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    let timeoutId: NodeJS.Timeout | undefined;

    try {
      setIsLoading(true);
      setLoadingProgress(20);
      setLoadingStep('Carregando seu perfil...');

      // Safety timeout - force completion after 10 seconds
      timeoutId = setTimeout(() => {
        console.warn(
          '⏰ Timeout no carregamento do dashboard - forçando finalização',
        );
        setLoadingStep('Finalizando carregamento...');
        setLoadingProgress(100);
        setTimeout(() => {
          setIsLoading(false);
          onLoadingComplete?.();
        }, 1000);
      }, 10000);

      // Smaller visual delay to not freeze too long if there's an error
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log('🔄 Iniciando carregamento do dashboard...');

      // Check session with timeout
      const sessionPromise = supabase.auth.getSession();
      const sessionTimeout = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Timeout na verificação de sessão')),
          8000,
        ),
      );

      const {
        data: { session },
        error: sessionError,
      } = (await Promise.race([sessionPromise, sessionTimeout])) as any;

      if (sessionError) {
        console.error('❌ Erro de sessão:', sessionError);
        throw new Error('Erro na sessão do usuário');
      }

      if (!session || !session.user) {
        console.error('❌ Nenhuma sessão ativa');
        alert(
          'Sessão expirada. Você será redirecionado para fazer login novamente.',
        );
        window.location.href = '/';
        return;
      }

      console.log('✅ Sessão válida encontrada para:', session.user.email);
      const user = session.user;
      setUserUuid(user.id);
      setLoadingProgress(40);

      // Fetch user data with timeout
      setLoadingStep('Buscando dados...');
      await new Promise((resolve) => setTimeout(resolve, 300));

      const userDataPromise = supabase
        .from('users')
        .select('*')
        .eq('uuid', user.id)
        .single();

      const userDataTimeout = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Timeout ao buscar dados do usuário')),
          6000,
        ),
      );

      const userDataResult = (await Promise.race([
        userDataPromise,
        userDataTimeout,
      ]).catch((error) => {
        console.warn('⚠️ Erro ao buscar dados do usuário:', error);
        return { data: null, error };
      })) as any;

      setLoadingProgress(60);
      setLoadingStep('Configurando dashboard...');

      // Fetch products with timeout
      const productsPromise = supabase
        .from('user_products')
        .select('*')
        .eq('user_uuid', user.id);

      const productsTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout ao buscar produtos')), 5000),
      );

      const productsResult = (await Promise.race([
        productsPromise,
        productsTimeout,
      ]).catch((error) => {
        console.warn('⚠️ Erro ao buscar produtos:', error);
        return { data: [], error };
      })) as any;

      if (productsResult.data) {
        setUserProducts(productsResult.data || []);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
      setLoadingProgress(80);

      // Configure profile data
      if (userDataResult.error || !userDataResult.data) {
        console.warn('⚠️ Usando dados básicos do usuário');
        setProfile({
          name:
            user.user_metadata?.name ||
            user.user_metadata?.full_name ||
            'Usuário',
          email: user.email || '',
          bio: '',
          phone: '',
          company: '',
        });
      } else {
        const userData = userDataResult.data;
        console.log('✅ Dados do usuário carregados com sucesso');

        // Fill profile with data from users table
        setProfile({
          name: userData.name || user.user_metadata?.name || 'Usuário',
          preferred_name:
            userData.preferred_name ||
            userData.name?.split(' ')[0] ||
            'Usuário',
          email: userData.email || user.email || '',
          bio: userData.bio || '',
          phone: userData.mobile_phone || '',
          company: userData.company_name || '',
          avatar_url: userData.avatar_url,
        });

        // Update subscription data with real data
        setSubscription({
          plan: (userData.subscription_plan || 'free') as SubscriptionPlan,
          status: userData.subscription_status || 'active',
          start_date: userData.subscription_start_date || userData.created_at,
          end_date: userData.subscription_end_date,
          tokens_used: userData.tokens_used || 0,
          tokens_limit: userData.tokens_limit || 1000,
          requests_this_month: userData.requests_this_month || 0,
          next_billing_date: userData.next_billing_date,
          billing_cycle: userData.billing_cycle,
          payment_method: userData.payment_method,
        });

        // Fill registration information
        setCadastralInfo({
          country: userData.country || '',
          postal_code: userData.postal_code || '',
          address: userData.address || '',
          preferred_language: userData.preferred_language || 'pt',
          created_at: userData.created_at || '',
          last_online: userData.last_online || '',
        });
      }

      setLoadingProgress(100);
      setLoadingStep('Pronto!');
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log('🎉 Dashboard carregado com sucesso!');
    } catch (error) {
      console.error('💥 Erro crítico no carregamento:', error);

      // Configure basic profile in case of error
      setProfile({
        name: 'Usuário',
        email: '',
        bio: '',
        phone: '',
        company: '',
      });

      setLoadingStep('Erro no carregamento');
      setLoadingProgress(100);

      // Show error for a moment before finishing
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } finally {
      // Clear safety timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Ensure loading always finishes, even in case of error
      setIsLoading(false);
      onLoadingComplete?.();
      console.log('🏁 Carregamento finalizado');
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Erro ao fazer logout:', error);
      }
      window.location.href = '/';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      window.location.href = '/';
    }
  };

  const handleSaveProfile = async () => {
    if (!userUuid) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: profile.name,
          preferred_name:
            profile.preferred_name || profile.name?.split(' ')[0] || 'Usuário',
          mobile_phone: profile.phone,
          company_name: profile.company,
          bio: profile.bio,
          last_online: new Date().toISOString(),
        })
        .eq('uuid', userUuid);

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        alert('Erro ao salvar perfil. Tente novamente.');
      } else {
        setIsEditingProfile(false);
        alert('Perfil atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar perfil. Tente novamente.');
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };

    if (isDropdownOpen || isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isNotificationOpen]);

  const handleChangePlan = (newPlan: SubscriptionPlan) => {
    alert(`Solicitação de mudança para plano ${newPlan} enviada!`);
  };

  const getPlanColor = (plan: SubscriptionPlan) => {
    const colors = {
      free: 'from-gray-500 to-gray-600',
      basic: 'from-blue-500 to-blue-600',
      pro: 'from-purple-500 to-purple-600',
      enterprise: 'from-amber-500 to-amber-600',
    };
    return colors[plan];
  };

  const calculateTokensPercentage = () => {
    return (subscription.tokens_used / subscription.tokens_limit) * 100;
  };

  const handleAccessProduct = (productName: string) => {
    const name = productName.toLowerCase();

    if (name.includes('website') || name.includes('site')) {
      // Redirect to MyEasyWebsite
      if (onGoToMyEasyWebsite) {
        onGoToMyEasyWebsite();
      } else {
        window.location.href = '/#myeasywebsite';
      }
    } else if (name.includes('guru') || name.includes('business')) {
      // Redirect to BusinessGuru
      if (onGoToBusinessGuru) {
        onGoToBusinessGuru();
      } else {
        window.location.href = '/#businessguru';
      }
    } else {
      // Generic product - go back to home
      if (onGoHome) {
        onGoHome();
      } else {
        window.location.href = '/';
      }
    }
  };

  // Function to generate name initials
  const getInitials = (name: string) => {
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Function to get avatar (photo or initials)
  const getAvatarContent = () => {
    // If has avatar_url, display image
    if (profile.avatar_url) {
      return (
        <img
          src={profile.avatar_url}
          alt={profile.name}
          className="h-full w-full rounded-full object-cover"
        />
      );
    }

    // Otherwise, display initials
    return (
      <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white font-bold">
        {getInitials(profile.name)}
      </div>
    );
  };

  // Notification handlers
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setSelectedNotification(notification);
    setIsNotificationOpen(false);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleViewAllNotifications = () => {
    setIsNotificationOpen(false);
    // Here you can add navigation to a notifications page if it exists
    console.log('Ver todas as notificações');
  };

  // Show loading screen while data is being loaded
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black-main to-blue-main flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background animated particles (stars) */}
        <div className="absolute inset-0">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div className="w-1 h-1 bg-blue-400/40 rounded-full" />
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center space-y-8">
          {/* Logo container with glow effects */}
          <div className="relative">
            {/* Glow effect rings */}
            <div className="absolute inset-0 animate-pulse">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full blur-xl" />
            </div>
            <div
              className="absolute inset-0 animate-ping"
              style={{ animationDuration: '2s' }}
            >
              <div className="w-28 h-28 bg-gradient-to-r from-blue-400/30 to-purple-500/30 rounded-full blur-lg mx-auto my-auto" />
            </div>
            <div
              className="absolute inset-0 animate-pulse"
              style={{ animationDuration: '3s' }}
            >
              <div className="w-36 h-36 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-2xl -mx-2 -my-2" />
            </div>

            {/* Logo icon */}
            <div className="relative animate-pulse">
              <img
                src="/bone-logo.png"
                alt="MyEasyAI Logo"
                className="h-32 w-32 object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Text container with shimmer effect */}
          <div className="relative">
            {/* Text glow background */}
            <div className="absolute inset-0 blur-xl">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent opacity-30 animate-pulse">
                MyEasyAI Dashboard
              </span>
            </div>

            {/* Main text */}
            <h1 className="relative bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent drop-shadow-2xl">
              MyEasyAI Dashboard
            </h1>

            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shimmer" />
          </div>

          {/* Subtitle with dynamic status */}
          <div className="text-center space-y-2">
            <p className="text-slate-200 text-lg font-medium tracking-wide">
              {loadingStep}
            </p>
            <p className="text-slate-400 text-sm">
              {loadingProgress < 50 && '✨ Preparando sua experiência...'}
              {loadingProgress >= 50 &&
                loadingProgress < 100 &&
                '🚀 Quase lá...'}
              {loadingProgress >= 100 && '🎉 Tudo pronto!'}
            </p>
          </div>

          {/* Improved loading dots */}
          <div className="flex space-x-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"
                style={{
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '1.5s',
                }}
              />
            ))}
          </div>

          {/* Dynamic progress indicator */}
          <div className="w-80 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300 font-medium">Progresso</span>
              <span className="text-slate-400">
                {Math.round(loadingProgress)}%
              </span>
            </div>
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${loadingProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-60 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transform -skew-x-12 animate-shimmer"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced animations styles */}
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%) skewX(-12deg); }
            100% { transform: translateX(200%) skewX(-12deg); }
          }
          
          .animate-shimmer {
            animation: shimmer 2.5s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-black-main to-blue-main">
      {/* Header */}
      <header className="border-b border-slate-800 bg-black-main/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() =>
                  onGoHome ? onGoHome() : (window.location.href = '/')
                }
                className="flex items-center gap-3 cursor-pointer"
              >
                <img
                  src="/bone-logo.png"
                  alt="MyEasyAI Logo"
                  className="h-12 w-12 object-contain"
                />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent">
                  MyEasyAI Dashboard
                </span>
              </button>
            </div>
            <div className="flex items-center space-x-3">
              {/* Sino de Notificação */}
              <div className="relative" ref={notificationRef}>
                <NotificationBell
                  unreadCount={getUnreadCount()}
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  isOpen={isNotificationOpen}
                />
                {isNotificationOpen && (
                  <NotificationDropdown
                    notifications={getLatest(10)}
                    onNotificationClick={handleNotificationClick}
                    onMarkAllAsRead={handleMarkAllAsRead}
                    onViewAll={handleViewAllNotifications}
                  />
                )}
              </div>

              {/* Dropdown do Usuário */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 rounded-lg border border-slate-700 bg-slate-700/30 px-3 py-2 transition-all hover:border-slate-600 hover:bg-slate-600/40 hover:shadow-lg hover:shadow-purple-500/20"
                >
                  <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-purple-500/30">
                    {getAvatarContent()}
                  </div>
                  <span className="text-sm font-medium text-slate-200">
                    Olá, {profile.preferred_name || profile.name.split(' ')[0]}
                  </span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200 rounded-xl border border-slate-700 bg-slate-800/99 backdrop-blur-xl shadow-2xl shadow-black/50">
                    <div className="p-4 border-b border-slate-700">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-purple-500/40">
                          {getAvatarContent()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {profile.name}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {profile.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setActiveTab('profile');
                        }}
                        className="flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-left text-slate-200 transition-colors hover:bg-slate-700"
                      >
                        <UserIcon className="h-4 w-4" />
                        <span className="text-sm">Perfil</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setActiveTab('settings');
                        }}
                        className="flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-left text-slate-200 transition-colors hover:bg-slate-700"
                      >
                        <Settings className="h-4 w-4" />
                        <span className="text-sm">Configurações</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-700 p-2">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-left text-red-400 transition-colors hover:bg-red-500/10"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="text-sm font-medium">Sair</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800 bg-black-main/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('subscription')}
              className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === 'subscription'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Assinatura
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Meus Produtos
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === 'usage'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Uso e Tokens
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl flex-1 px-4 py-8 pb-32 sm:px-6 lg:px-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Bem-vindo, {profile.preferred_name || profile.name}!
              </h1>
              <p className="mt-2 text-slate-400">
                Aqui está um resumo da sua conta e atividades recentes.
              </p>
            </div>

            {/* Current Subscription Card */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Assinatura Atual
                  </h2>
                  <div
                    className={`mt-2 inline-block rounded-full bg-gradient-to-r ${getPlanColor(subscription.plan)} px-4 py-1 text-sm font-semibold text-white`}
                  >
                    {subscription.plan.toUpperCase()}
                  </div>
                  <p className="mt-2 text-slate-400">
                    Status:{' '}
                    <span className="text-green-400">
                      {subscription.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </p>
                </div>
                <CreditCard className="h-16 w-16 text-blue-400" />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Tokens Usados</p>
                    <p className="mt-2 text-3xl font-bold text-white">
                      {subscription.tokens_used.toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      de {subscription.tokens_limit.toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-purple-400" />
                </div>
                <div className="mt-4 h-2 w-full rounded-full bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                    style={{ width: `${calculateTokensPercentage()}%` }}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">
                      Requisições este Mês
                    </p>
                    <p className="mt-2 text-3xl font-bold text-white">
                      {subscription.requests_this_month}
                    </p>
                  </div>
                  <BarChart3 className="h-10 w-10 text-blue-400" />
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Membro desde</p>
                    <p className="mt-2 text-xl font-bold text-white">
                      {new Date(subscription.start_date).toLocaleDateString(
                        'pt-BR',
                      )}
                    </p>
                  </div>
                  <Clock className="h-10 w-10 text-amber-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Planos de Assinatura
              </h1>
              <p className="mt-2 text-slate-400">
                Escolha o plano ideal para suas necessidades.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {PLANS.map((plan) => (
                <div
                  key={plan.value}
                  className={`relative rounded-lg border p-6 ${
                    subscription.plan === plan.value
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-slate-800 bg-slate-900/50'
                  } ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                      <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-xs font-semibold text-white">
                        POPULAR
                      </span>
                    </div>
                  )}

                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white">
                      {plan.name}
                    </h3>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-white">
                        {plan.price}
                      </span>
                      {plan.price !== 'Customizado' && (
                        <span className="text-slate-400">/mês</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-slate-400">
                      {plan.tokens} tokens
                    </p>
                  </div>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="mr-2 h-5 w-5 flex-shrink-0 text-green-400" />
                        <span className="text-sm text-slate-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleChangePlan(plan.value)}
                    disabled={subscription.plan === plan.value}
                    className={`mt-6 w-full rounded-lg px-4 py-2 font-semibold transition-colors ${
                      subscription.plan === plan.value
                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                    }`}
                  >
                    {subscription.plan === plan.value
                      ? 'Plano Atual'
                      : 'Selecionar Plano'}
                  </button>
                </div>
              ))}
            </div>

            {/* Change Plan Section */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
              <h2 className="text-xl font-bold text-white">Trocar de Plano</h2>
              <p className="mt-2 text-slate-400">
                Você está atualmente no plano{' '}
                <span className="font-semibold text-blue-400">
                  {subscription.plan.toUpperCase()}
                </span>
                . Selecione um novo plano acima para fazer upgrade ou downgrade.
              </p>
              <div className="mt-4 flex items-center space-x-2 text-sm text-slate-400">
                <ArrowUpCircle className="h-5 w-5 text-green-400" />
                <span>Alterações entram em vigor imediatamente</span>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Meus Produtos</h1>
              <p className="mt-2 text-slate-400">
                Produtos e serviços que você está assinando atualmente.
              </p>
            </div>

            {/* Active Products */}
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-slate-400">Carregando produtos...</p>
              </div>
            ) : userProducts.length > 0 ? (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {userProducts.map((product, index) => {
                    const colors = ['blue', 'purple', 'amber', 'green', 'pink'];
                    const color = colors[index % colors.length];
                    const isActive = product.product_status === 'active';

                    return (
                      <div
                        key={product.id}
                        className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 hover:border-blue-500 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`rounded-lg bg-${color}-500/20 p-3`}
                            >
                              <Package
                                className={`h-6 w-6 text-${color}-400`}
                              />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">
                                {product.product_name}
                              </h3>
                              <span
                                className={`inline-block mt-1 rounded-full ${isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'} px-2 py-1 text-xs font-semibold`}
                              >
                                {isActive ? 'Ativo' : product.product_status}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2 text-sm">
                          <div className="flex justify-between text-slate-400">
                            <span>Assinado em:</span>
                            <span className="text-white">
                              {new Date(
                                product.subscribed_at,
                              ).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          {product.product_name
                            .toLowerCase()
                            .includes('website') && (
                            <div className="flex justify-between text-slate-400">
                              <span>Sites criados:</span>
                              <span className="text-white font-semibold">
                                {product.sites_created || 0}
                              </span>
                            </div>
                          )}
                          {product.product_name
                            .toLowerCase()
                            .includes('guru') && (
                            <div className="flex justify-between text-slate-400">
                              <span>Consultas:</span>
                              <span className="text-white font-semibold">
                                {product.consultations_made || 0}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="mt-6 flex space-x-2">
                          <button
                            onClick={() =>
                              handleAccessProduct(product.product_name)
                            }
                            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>Acessar</span>
                          </button>
                          <button className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors">
                            Gerenciar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary Card */}
                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
                  <h2 className="text-xl font-bold text-white">
                    Resumo de Assinaturas
                  </h2>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">
                        {
                          userProducts.filter(
                            (p) => p.product_status === 'active',
                          ).length
                        }
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Produtos Ativos
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">
                        {userProducts.reduce(
                          (sum, p) =>
                            sum +
                            (p.sites_created || 0) +
                            (p.consultations_made || 0),
                          0,
                        )}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Total de Uso
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-400">
                        {new Date(
                          Math.min(
                            ...userProducts.map((p) =>
                              new Date(p.subscribed_at).getTime(),
                            ),
                          ),
                        ).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Primeiro Produto
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-12 text-center">
                <Package className="mx-auto h-16 w-16 text-slate-600" />
                <h3 className="mt-4 text-xl font-semibold text-white">
                  Nenhum produto ativo
                </h3>
                <p className="mt-2 text-slate-400">
                  Você ainda não possui produtos ativos. Explore os produtos
                  disponíveis abaixo!
                </p>
              </div>
            )}

            {/* Available Products */}
            <div>
              <h2 className="text-2xl font-bold text-white">
                Produtos Disponíveis
              </h2>
              <p className="mt-2 text-slate-400">
                Explore outros produtos que podem ajudar seu negócio.
              </p>

              <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-6 opacity-75">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-slate-700 p-3">
                      <Package className="h-6 w-6 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      Image Generator
                    </h3>
                  </div>
                  <p className="mt-4 text-sm text-slate-400">
                    Gere imagens de alta qualidade usando IA.
                  </p>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-white">
                      R$ 59<span className="text-sm text-slate-400">/mês</span>
                    </p>
                  </div>
                  <button className="mt-4 w-full rounded-lg border border-blue-600 bg-blue-600/10 px-4 py-2 text-sm font-semibold text-blue-400 hover:bg-blue-600/20 transition-colors">
                    Adicionar Produto
                  </button>
                </div>

                <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-6 opacity-75">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-slate-700 p-3">
                      <Package className="h-6 w-6 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      Voice AI
                    </h3>
                  </div>
                  <p className="mt-4 text-sm text-slate-400">
                    Sintetização e reconhecimento de voz avançado.
                  </p>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-white">
                      R$ 89<span className="text-sm text-slate-400">/mês</span>
                    </p>
                  </div>
                  <button className="mt-4 w-full rounded-lg border border-blue-600 bg-blue-600/10 px-4 py-2 text-sm font-semibold text-blue-400 hover:bg-blue-600/20 transition-colors">
                    Adicionar Produto
                  </button>
                </div>

                <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-6 opacity-75">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-slate-700 p-3">
                      <Package className="h-6 w-6 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      Custom Models
                    </h3>
                  </div>
                  <p className="mt-4 text-sm text-slate-400">
                    Treine seus próprios modelos de IA personalizados.
                  </p>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-white">
                      R$ 299<span className="text-sm text-slate-400">/mês</span>
                    </p>
                  </div>
                  <button className="mt-4 w-full rounded-lg border border-blue-600 bg-blue-600/10 px-4 py-2 text-sm font-semibold text-blue-400 hover:bg-blue-600/20 transition-colors">
                    Adicionar Produto
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Usage Tab */}
        {activeTab === 'usage' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Uso e Tokens</h1>
              <p className="mt-2 text-slate-400">
                Acompanhe seu uso de tokens e requisições.
              </p>
            </div>

            {/* Token Usage */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
              <h2 className="text-xl font-bold text-white">Uso de Tokens</h2>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>Tokens usados este mês</span>
                  <span className="font-semibold text-white">
                    {subscription.tokens_used.toLocaleString()} /{' '}
                    {subscription.tokens_limit.toLocaleString()}
                  </span>
                </div>
                <div className="mt-2 h-4 w-full rounded-full bg-slate-800">
                  <div
                    className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                    style={{ width: `${calculateTokensPercentage()}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  {(100 - calculateTokensPercentage()).toFixed(1)}% disponível
                </p>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
                <h3 className="text-lg font-semibold text-white">
                  Requisições
                </h3>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Este mês</span>
                    <span className="text-2xl font-bold text-white">
                      {subscription.requests_this_month}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Média diária</span>
                    <span className="text-2xl font-bold text-white">
                      {Math.round(
                        subscription.requests_this_month / new Date().getDate(),
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
                <h3 className="text-lg font-semibold text-white">
                  Período de Renovação
                </h3>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Início do ciclo</span>
                    <span className="font-semibold text-white">
                      {new Date(subscription.start_date).toLocaleDateString(
                        'pt-BR',
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Próxima renovação</span>
                    <span className="font-semibold text-white">
                      {new Date(
                        new Date().setMonth(new Date().getMonth() + 1),
                      ).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Configurações</h1>
              <p className="mt-2 text-slate-400">
                Gerencie as configurações da sua conta.
              </p>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
                <h2 className="text-xl font-bold text-white">Notificações</h2>
                <div className="mt-4 space-y-4">
                  <label className="flex items-center justify-between">
                    <span className="text-slate-300">
                      Notificações por email
                    </span>
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-slate-700 bg-slate-800"
                      defaultChecked
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-slate-300">
                      Alertas de uso de tokens
                    </span>
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-slate-700 bg-slate-800"
                      defaultChecked
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-slate-300">
                      Atualizações de produto
                    </span>
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-slate-700 bg-slate-800"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
                <h2 className="text-xl font-bold text-white">
                  API e Integrações
                </h2>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-sm text-slate-400">API Key</label>
                    <div className="mt-2 flex space-x-2">
                      <input
                        type="password"
                        value="sk_test_**************************"
                        readOnly
                        className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white"
                      />
                      <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        Copiar
                      </button>
                    </div>
                  </div>
                  <button className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white hover:bg-slate-700">
                    Gerar Nova API Key
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Perfil</h1>
              <p className="mt-2 text-slate-400">
                Gerencie as informações do seu perfil.
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                  {profile.name[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {profile.name}
                  </h2>
                  <p className="text-slate-400">{profile.email}</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    disabled={!isEditingProfile}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white opacity-50"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    O email não pode ser alterado
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400">
                    Biografia
                  </label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile({ ...profile, bio: e.target.value })
                    }
                    disabled={!isEditingProfile}
                    rows={3}
                    placeholder="Conte um pouco sobre você... 😊"
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white disabled:opacity-50 placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    disabled={!isEditingProfile}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400">
                    Empresa
                  </label>
                  <input
                    type="text"
                    value={profile.company}
                    onChange={(e) =>
                      setProfile({ ...profile, company: e.target.value })
                    }
                    disabled={!isEditingProfile}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
                  />
                </div>

                <div className="flex space-x-4">
                  {!isEditingProfile ? (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
                    >
                      Editar Perfil
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSaveProfile}
                        className="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setIsEditingProfile(false)}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-6 py-2 text-white hover:bg-slate-700"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Informações de Cadastro */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
              <h2 className="text-xl font-bold text-white mb-6">
                Informações de Cadastro
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-400">
                    País de Residência
                  </label>
                  <div className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white opacity-50">
                    {cadastralInfo.country || 'Não informado'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400">
                    CEP / Código Postal
                  </label>
                  <div className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white opacity-50">
                    {cadastralInfo.postal_code || 'Não informado'}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-400">
                    Endereço Completo
                  </label>
                  <div className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white opacity-50">
                    {cadastralInfo.address || 'Não informado'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400">
                    Idioma Preferido
                  </label>
                  <div className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white opacity-50">
                    {cadastralInfo.preferred_language === 'pt'
                      ? 'Português'
                      : cadastralInfo.preferred_language === 'en'
                        ? 'English'
                        : cadastralInfo.preferred_language === 'es'
                          ? 'Español'
                          : cadastralInfo.preferred_language === 'fr'
                            ? 'Français'
                            : 'Não informado'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400">
                    Última vez online
                  </label>
                  <div className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white opacity-50">
                    {cadastralInfo.last_online
                      ? new Date(cadastralInfo.last_online).toLocaleString(
                          'pt-BR',
                        )
                      : 'Agora'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400">
                    Membro desde
                  </label>
                  <div className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white opacity-50">
                    {cadastralInfo.created_at
                      ? new Date(cadastralInfo.created_at).toLocaleDateString(
                          'pt-BR',
                        )
                      : 'Não informado'}
                  </div>
                </div>
              </div>

              <p className="mt-6 text-sm text-slate-500">
                💡 Essas informações foram coletadas durante seu cadastro. Para
                atualizar, entre em contato com o suporte.
              </p>

              {/* Zona de Perigo - Acordeão */}
              <div className="mt-6 border-t border-slate-700 pt-6">
                <button
                  onClick={() => setIsDangerZoneOpen(!isDangerZoneOpen)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <div>
                    <h3 className="text-sm font-medium text-rose-300">
                      Zona de Perigo
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Ações irreversíveis que afetam sua conta
                    </p>
                  </div>
                  <svg
                    className={`h-5 w-5 text-rose-300 transition-transform ${isDangerZoneOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isDangerZoneOpen && (
                  <div className="mt-4 rounded-lg border border-rose-900/30 bg-rose-950/20 p-4">
                    <p className="text-sm text-slate-400 mb-4">
                      As ações aqui realizadas são permanentes e não podem ser
                      desfeitas.
                    </p>
                    <button
                      onClick={() => setShowConfirmationModal(true)}
                      className="rounded-lg border border-rose-800/50 bg-rose-900/30 px-4 py-2 text-sm text-rose-300 hover:bg-rose-900/50 transition-colors"
                    >
                      Acessar Zona de Perigo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Confirmação - Digite YES */}
      {showConfirmationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="mx-4 max-w-md rounded-lg border border-rose-900/50 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-rose-300">
              ⚠️ Zona de Perigo
            </h2>
            <p className="mt-4 text-slate-300">
              Você está prestes a acessar a{' '}
              <strong className="text-rose-300">Zona de Perigo</strong>.
            </p>
            <p className="mt-2 text-sm text-slate-400">
              As ações realizadas aqui são{' '}
              <strong className="text-rose-400">
                permanentes e irreversíveis
              </strong>
              . Tenha certeza absoluta antes de prosseguir.
            </p>

            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Digite <strong className="text-rose-300">YES</strong> (em
                maiúsculas) para confirmar:
              </label>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-rose-500 focus:outline-none"
                placeholder="YES"
                autoFocus
              />
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  setShowConfirmationModal(false);
                  setConfirmationText('');
                }}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (confirmationText === 'YES') {
                    setShowConfirmationModal(false);
                    setShowCancelModal(true);
                    setConfirmationText('');
                  }
                }}
                disabled={confirmationText !== 'YES'}
                className={`flex-1 rounded-lg px-4 py-2 text-white transition-colors ${
                  confirmationText === 'YES'
                    ? 'bg-rose-800 hover:bg-rose-700'
                    : 'bg-slate-700 cursor-not-allowed opacity-50'
                }`}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cancelamento - Aviso Final */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="mx-4 max-w-lg rounded-lg border border-rose-900/50 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-rose-400">
              🚨 Cancelar Assinatura
            </h2>

            <div className="mt-4 space-y-3">
              <p className="text-slate-300">
                Tem certeza que deseja cancelar sua assinatura?
              </p>

              <div className="rounded-lg border border-blue-900/50 bg-blue-950/30 p-4">
                <p className="text-sm text-blue-300 font-semibold mb-2">
                  💡 Considere antes de cancelar:
                </p>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Você perderá acesso a todos os recursos premium</li>
                  <li>
                    • Seus dados e projetos serão mantidos por apenas 30 dias
                  </li>
                  <li>• Tokens não utilizados serão perdidos</li>
                  <li>• Esta ação não pode ser desfeita</li>
                </ul>
              </div>

              <div className="rounded-lg border border-amber-900/50 bg-amber-950/30 p-4">
                <p className="text-sm text-amber-300 font-semibold mb-2">
                  ✨ O que você está deixando para trás:
                </p>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>
                    • {subscription.tokens_limit.toLocaleString()} tokens por
                    mês
                  </li>
                  <li>• Suporte prioritário</li>
                  <li>• Analytics avançado</li>
                  <li>• {userProducts.length} produto(s) ativo(s)</li>
                </ul>
              </div>

              <p className="text-xs text-slate-500 italic">
                💬 Que tal conversar com nosso suporte antes? Podemos ajudar com
                qualquer problema que esteja enfrentando.
              </p>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700 transition-colors font-semibold"
              >
                Manter Assinatura
              </button>
              <button
                onClick={() => {
                  alert(
                    'Cancelamento solicitado. Nossa equipe entrará em contato em breve.',
                  );
                  setShowCancelModal(false);
                  setIsDangerZoneOpen(false);
                }}
                className="flex-1 rounded-lg border border-rose-800/50 bg-rose-900/30 px-4 py-2.5 text-rose-300 hover:bg-rose-900/50 transition-colors"
              >
                Cancelar Mesmo Assim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />

      {/* Modal de Detalhes de Notificação */}
      <NotificationDetailModal
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />
    </div>
  );
}
