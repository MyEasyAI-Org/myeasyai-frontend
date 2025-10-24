import {
  ArrowUpCircle,
  BarChart3,
  Check,
  Clock,
  CreditCard,
  ExternalLink,
  Package,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'enterprise';

type UserProfile = {
  name: string;
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
};

const PLANS = [
  {
    name: 'Free',
    value: 'free' as SubscriptionPlan,
    price: 'R$ 0',
    tokens: '1.000',
    features: [
      'Acesso básico à plataforma',
      '1.000 tokens por mês',
      'Suporte por email',
      'Documentação completa',
    ],
  },
  {
    name: 'Basic',
    value: 'basic' as SubscriptionPlan,
    price: 'R$ 49',
    tokens: '10.000',
    features: [
      'Tudo do plano Free',
      '10.000 tokens por mês',
      'Suporte prioritário',
      'API Access',
      'Analytics básico',
    ],
    popular: true,
  },
  {
    name: 'Pro',
    value: 'pro' as SubscriptionPlan,
    price: 'R$ 149',
    tokens: '50.000',
    features: [
      'Tudo do plano Basic',
      '50.000 tokens por mês',
      'Suporte 24/7',
      'Analytics avançado',
      'Integrações customizadas',
      'Acesso a modelos premium',
    ],
  },
  {
    name: 'Enterprise',
    value: 'enterprise' as SubscriptionPlan,
    price: 'Customizado',
    tokens: 'Ilimitado',
    features: [
      'Tudo do plano Pro',
      'Tokens ilimitados',
      'Suporte dedicado',
      'SLA garantido',
      'Treinamento personalizado',
      'Deploy on-premise',
    ],
  },
];

type DashboardPreviewProps = {
  onLogout?: () => void;
  onGoHome?: () => void;
  userName?: string;
};

export function DashboardPreview({
  onLogout,
  onGoHome,
  userName = 'Usuário',
}: DashboardPreviewProps = {}) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'subscription' | 'products' | 'usage' | 'settings' | 'profile'
  >('overview');
  const [subscription] = useState<SubscriptionData>({
    plan: 'basic',
    status: 'active',
    start_date: new Date().toISOString(),
    tokens_used: 2500,
    tokens_limit: 10000,
    requests_this_month: 145,
  });
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Usuário Demo',
    email: 'demo@myeasyai.com',
    bio: 'Esta é uma conta de demonstração',
    phone: '+55 11 98765-4321',
    company: 'MyEasyAI Demo',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-main to-blue-main">
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
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center justify-center space-x-2 border border-slate-600 bg-slate-700/80 px-4 py-2.5 text-slate-100 transition-colors hover:border-slate-500 hover:bg-slate-600 whitespace-nowrap ${
                  isDropdownOpen
                    ? 'rounded-t-2xl border-b-transparent'
                    : 'rounded-2xl'
                }`}
              >
                <svg
                  className="h-4 w-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>Oi, {userName}!</span>
                <svg
                  className={`h-3.5 w-3.5 flex-shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
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

              {isDropdownOpen && (
                <div className="absolute right-0 min-w-full rounded-b-2xl border border-t-0 border-slate-600 bg-slate-700/80 shadow-xl whitespace-nowrap">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onLogout
                        ? onLogout()
                        : alert('Esta é uma versão de demonstração');
                    }}
                    className="block w-full rounded-b-2xl px-4 py-2.5 text-left text-slate-100 transition-colors hover:bg-slate-600 hover:text-red-400"
                  >
                    Sair
                  </button>
                </div>
              )}
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
            <button
              onClick={() => setActiveTab('settings')}
              className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Configurações
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Perfil
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Bem-vindo, {profile.name}!
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Product 1 - AI Assistant */}
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 hover:border-blue-500 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-blue-500/20 p-3">
                      <Package className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        AI Assistant Pro
                      </h3>
                      <span className="inline-block mt-1 rounded-full bg-green-500/20 px-2 py-1 text-xs font-semibold text-green-400">
                        Ativo
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-sm text-slate-400">
                  Assistente de IA com capacidades avançadas de processamento de
                  linguagem natural.
                </p>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Assinado em:</span>
                    <span className="text-white">01/01/2025</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Próxima renovação:</span>
                    <span className="text-white">01/02/2025</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Valor:</span>
                    <span className="text-white font-semibold">R$ 149/mês</span>
                  </div>
                </div>

                <div className="mt-6 flex space-x-2">
                  <button className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                    <ExternalLink className="h-4 w-4" />
                    <span>Acessar</span>
                  </button>
                  <button className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors">
                    Gerenciar
                  </button>
                </div>
              </div>

              {/* Product 2 - API Access */}
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 hover:border-blue-500 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-purple-500/20 p-3">
                      <Package className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        API Premium
                      </h3>
                      <span className="inline-block mt-1 rounded-full bg-green-500/20 px-2 py-1 text-xs font-semibold text-green-400">
                        Ativo
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-sm text-slate-400">
                  Acesso completo à API com 50.000 requisições por mês.
                </p>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Assinado em:</span>
                    <span className="text-white">15/12/2024</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Próxima renovação:</span>
                    <span className="text-white">15/01/2025</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Valor:</span>
                    <span className="text-white font-semibold">R$ 99/mês</span>
                  </div>
                </div>

                <div className="mt-6 flex space-x-2">
                  <button className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                    <ExternalLink className="h-4 w-4" />
                    <span>Acessar</span>
                  </button>
                  <button className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors">
                    Gerenciar
                  </button>
                </div>
              </div>

              {/* Product 3 - Data Analytics */}
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 hover:border-blue-500 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-amber-500/20 p-3">
                      <Package className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Analytics Dashboard
                      </h3>
                      <span className="inline-block mt-1 rounded-full bg-green-500/20 px-2 py-1 text-xs font-semibold text-green-400">
                        Ativo
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-sm text-slate-400">
                  Dashboard completo de analytics com relatórios customizados.
                </p>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Assinado em:</span>
                    <span className="text-white">20/11/2024</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Próxima renovação:</span>
                    <span className="text-white">20/12/2024</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Valor:</span>
                    <span className="text-white font-semibold">R$ 79/mês</span>
                  </div>
                </div>

                <div className="mt-6 flex space-x-2">
                  <button className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                    <ExternalLink className="h-4 w-4" />
                    <span>Acessar</span>
                  </button>
                  <button className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors">
                    Gerenciar
                  </button>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
              <h2 className="text-xl font-bold text-white">
                Resumo de Assinaturas
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">3</p>
                  <p className="mt-1 text-sm text-slate-400">Produtos Ativos</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">R$ 327</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Gasto Mensal Total
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-400">R$ 73</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Economia vs. Separado
                  </p>
                </div>
              </div>
            </div>

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

              <div className="rounded-lg border border-red-900 bg-red-950/30 p-6">
                <h2 className="text-xl font-bold text-red-400">
                  Zona de Perigo
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Ações irreversíveis que afetam sua conta.
                </p>
                <button className="mt-4 rounded-lg border border-red-600 bg-red-600/20 px-4 py-2 text-red-400 hover:bg-red-600/30">
                  Cancelar Assinatura
                </button>
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
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
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
                        onClick={() => {
                          setIsEditingProfile(false);
                          alert('Perfil atualizado com sucesso! (modo demo)');
                        }}
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
          </div>
        )}
      </div>
    </div>
  );
}
