import {
  ArrowLeft,
  Bot,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  HelpCircle,
  MessageSquare,
  Monitor,
  PlayCircle,
  RefreshCcw,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Ticket,
  Wifi,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { useAssistantChat } from '../features/assistant-chat/hooks/useAssistantChat';
import { useConfiguratorStore } from '../features/my-easy-avatar/store';
import { ROUTES } from '../router';
import { ticketService, type Ticket as TicketType } from '../services/TicketService';
import { authService } from '../services/AuthServiceV2';

type SupportPageProps = {
  onBackToDashboard: () => void;
};

type TutorialVideo = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  category: string;
  youtubeUrl: string;
};

type TechSupportItem = {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  steps: string[];
};

type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

export function SupportPage({ onBackToDashboard }: SupportPageProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<TutorialVideo | null>(
    null,
  );
  const [chatInput, setChatInput] = useState('');
  const [isChatFocused, setIsChatFocused] = useState(false);
  const [userTickets, setUserTickets] = useState<TicketType[]>([]);
  const [showTicketBanner, setShowTicketBanner] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Chat hook - same as avatar chat
  const { messages, isLoading, sendMessage, clearMessages } = useAssistantChat();

  // Get avatar selfie for chat display
  const avatarSelfie = useConfiguratorStore((state) => state.avatarSelfie);
  const avatarName = useConfiguratorStore((state) => state.avatarName);
  const loadSavedAvatar = useConfiguratorStore((state) => state.loadSavedAvatar);
  const assets = useConfiguratorStore((state) => state.assets);

  const user = authService.getUser();

  // Load user tickets
  useEffect(() => {
    const loadTickets = async () => {
      if (user?.email) {
        const tickets = await ticketService.getUserTickets(user.email);
        setUserTickets(tickets);
      }
    };
    loadTickets();
  }, [user?.email]);

  // Load saved avatar data
  useEffect(() => {
    if (assets.length > 0) {
      loadSavedAvatar();
    }
  }, [assets.length, loadSavedAvatar]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show ticket banner after 3 user messages
  useEffect(() => {
    const userMessageCount = messages.filter(m => m.role === 'user').length;
    if (userMessageCount >= 3 && !showTicketBanner) {
      setShowTicketBanner(true);
    }
  }, [messages, showTicketBanner]);

  // Open ticket page in new tab
  const openTicketPage = () => {
    window.open(ROUTES.SUPPORT_TICKET, '_blank');
  };

  // Close modal on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedVideo) {
        setSelectedVideo(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedVideo]);

  // Handle chat submit
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;

    const message = chatInput;
    setChatInput('');
    await sendMessage(message);
  };

  // Handle quick suggestion click
  const handleSuggestionClick = async (suggestion: string) => {
    await sendMessage(suggestion);
  };

  // Display name for assistant
  const displayName = avatarName ? avatarName : 'Assistente MyEasyAI';

  const YOUTUBE_VIDEO_URL = 'https://www.youtube.com/watch?v=CJ54eImz88w';

  // Tutorial videos data
  const tutorials: TutorialVideo[] = [
    {
      id: '1',
      title: 'Primeiros Passos com MyEasyAI',
      description:
        'Aprenda o básico da plataforma e como começar a usar todos os recursos.',
      thumbnail: '/bone-logo.png',
      duration: '5:30',
      category: 'Introdução',
      youtubeUrl: YOUTUBE_VIDEO_URL,
    },
    {
      id: '2',
      title: 'Como usar o MyEasyWebsite',
      description: 'Crie seu primeiro site profissional com IA em minutos.',
      thumbnail: '/bone-logo.png',
      duration: '8:45',
      category: 'MyEasyWebsite',
      youtubeUrl: YOUTUBE_VIDEO_URL,
    },
    {
      id: '3',
      title: 'Gerenciando Clientes no MyEasyCRM',
      description: 'Organize seus contatos, empresas e pipeline de vendas.',
      thumbnail: '/bone-logo.png',
      duration: '12:20',
      category: 'MyEasyCRM',
      youtubeUrl: YOUTUBE_VIDEO_URL,
    },
    {
      id: '4',
      title: 'Criando Conteúdo com MyEasyContent',
      description: 'Gere posts incríveis para redes sociais com ajuda da IA.',
      thumbnail: '/bone-logo.png',
      duration: '7:15',
      category: 'MyEasyContent',
      youtubeUrl: YOUTUBE_VIDEO_URL,
    },
    {
      id: '5',
      title: 'MyEasyPricing: Tabelas de Preços Profissionais',
      description: 'Configure e exporte tabelas de preços personalizadas.',
      thumbnail: '/bone-logo.png',
      duration: '6:40',
      category: 'MyEasyPricing',
      youtubeUrl: YOUTUBE_VIDEO_URL,
    },
    {
      id: '6',
      title: 'Currículos Perfeitos com MyEasyJobs',
      description:
        'Crie currículos otimizados para conquistar sua vaga dos sonhos.',
      thumbnail: '/bone-logo.png',
      duration: '9:10',
      category: 'MyEasyJobs',
      youtubeUrl: YOUTUBE_VIDEO_URL,
    },
    {
      id: '7',
      title: 'MyEasyLearning: Cursos Personalizados',
      description:
        'Aprenda novas habilidades com trilhas de aprendizado criadas por IA.',
      thumbnail: '/bone-logo.png',
      duration: '10:25',
      category: 'MyEasyLearning',
      youtubeUrl: YOUTUBE_VIDEO_URL,
    },
    {
      id: '8',
      title: 'Integrações e Automações',
      description:
        'Conecte suas ferramentas e automatize processos repetitivos.',
      thumbnail: '/bone-logo.png',
      duration: '11:50',
      category: 'Avançado',
      youtubeUrl: YOUTUBE_VIDEO_URL,
    },
  ];

  // Tech support items
  const techSupport: TechSupportItem[] = [
    {
      id: '1',
      icon: <Wifi className="h-6 w-6" />,
      title: 'Verifique sua Conexão com a Internet',
      description:
        'Problemas de conexão são a causa mais comum de erros na plataforma.',
      steps: [
        'Verifique se você está conectado à internet',
        'Teste sua conexão abrindo outro site',
        'Reinicie seu roteador se necessário',
        'Tente usar outra rede ou dados móveis',
      ],
    },
    {
      id: '2',
      icon: <Monitor className="h-6 w-6" />,
      title: 'Limpe o Cache do Navegador',
      description: 'Cache antigo pode causar problemas de carregamento.',
      steps: [
        'Pressione Ctrl+Shift+Del (Windows) ou Cmd+Shift+Del (Mac)',
        'Selecione "Cookies e dados de sites" e "Imagens e arquivos em cache"',
        'Escolha "Todo o período"',
        'Clique em "Limpar dados"',
      ],
    },
    {
      id: '3',
      icon: <RefreshCcw className="h-6 w-6" />,
      title: 'Atualize a Página',
      description: 'Um simples refresh pode resolver muitos problemas.',
      steps: [
        'Pressione F5 ou Ctrl+R para atualizar',
        'Para forçar atualização: Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)',
        'Aguarde a página carregar completamente',
      ],
    },
    {
      id: '4',
      icon: <Monitor className="h-6 w-6" />,
      title: 'Use um Navegador Compatível',
      description: 'Recomendamos Chrome, Firefox, Safari ou Edge atualizados.',
      steps: [
        'Verifique se seu navegador está atualizado',
        'Experimente usar outro navegador',
        'Desative extensões que possam causar conflitos',
        'Use modo anônimo para testar sem extensões',
      ],
    },
  ];

  // FAQ items
  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'Como faço para criar minha primeira conta?',
      answer:
        'Para criar sua conta, clique em "Cadastrar-se" no topo da página inicial. Você pode se registrar usando seu email ou fazer login social com Google. Após o cadastro, você terá acesso imediato a todos os produtos da plataforma.',
      category: 'Conta',
    },
    {
      id: '2',
      question: 'Esqueci minha senha. Como recupero?',
      answer:
        'Na tela de login, clique em "Esqueci minha senha". Digite seu email cadastrado e você receberá um link para redefinir sua senha. Verifique também sua caixa de spam.',
      category: 'Conta',
    },
    {
      id: '3',
      question: 'Quais formas de pagamento vocês aceitam?',
      answer:
        'Aceitamos cartões de crédito (Visa, Mastercard, American Express), PIX e boleto bancário. Todas as transações são processadas de forma segura.',
      category: 'Pagamento',
    },
    {
      id: '4',
      question: 'Posso cancelar minha assinatura a qualquer momento?',
      answer:
        'Sim! Você pode cancelar sua assinatura a qualquer momento através do Dashboard, na aba "Assinatura". Não há multas ou taxas de cancelamento.',
      category: 'Assinatura',
    },
    {
      id: '5',
      question: 'Como funciona o período de teste gratuito?',
      answer:
        'Oferecemos 7 dias de teste gratuito para novos usuários. Durante este período, você tem acesso completo a todos os recursos. Não é necessário cadastrar cartão de crédito.',
      category: 'Assinatura',
    },
    {
      id: '6',
      question: 'Meus dados estão seguros na plataforma?',
      answer:
        'Sim! Utilizamos criptografia de ponta a ponta e seguimos as melhores práticas de segurança. Seus dados são armazenados em servidores seguros e nunca compartilhamos suas informações com terceiros.',
      category: 'Segurança',
    },
    {
      id: '7',
      question: 'Posso usar o MyEasyAI em vários dispositivos?',
      answer:
        'Sim! Você pode acessar sua conta de qualquer dispositivo (computador, tablet, celular). Todos os seus dados são sincronizados automaticamente na nuvem.',
      category: 'Acesso',
    },
    {
      id: '8',
      question: 'Como funciona o MyEasyWebsite?',
      answer:
        'O MyEasyWebsite é uma ferramenta de criação de sites com IA. Você descreve o que precisa, e nossa IA gera um site profissional completo. Você pode personalizar cores, textos e imagens facilmente.',
      category: 'Produtos',
    },
    {
      id: '9',
      question: 'Quantos sites posso criar?',
      answer:
        'O número de sites depende do seu plano. O plano Free permite 1 site, o Basic permite 3 sites, o Pro permite 10 sites e o Enterprise oferece sites ilimitados.',
      category: 'Produtos',
    },
    {
      id: '10',
      question: 'Posso exportar meu conteúdo?',
      answer:
        'Sim! Todos os produtos permitem exportação. Você pode exportar sites como HTML, tabelas de preços como PDF/Excel, currículos como PDF, e posts de redes sociais como imagens.',
      category: 'Produtos',
    },
    {
      id: '11',
      question: 'O MyEasyCRM integra com outras ferramentas?',
      answer:
        'No momento, o MyEasyCRM é uma solução standalone. Estamos trabalhando em integrações com ferramentas populares como Google Calendar, WhatsApp e email marketing.',
      category: 'Integrações',
    },
    {
      id: '12',
      question: 'Como funciona o suporte técnico?',
      answer:
        'Oferecemos suporte por chat AI disponível 24/7. Para casos mais complexos, você pode abrir um ticket que será respondido em até 24 horas úteis.',
      category: 'Suporte',
    },
    {
      id: '13',
      question: 'Vocês oferecem treinamento para equipes?',
      answer:
        'Sim! Para planos Enterprise, oferecemos sessões de treinamento personalizadas para sua equipe. Entre em contato com nosso time comercial para mais detalhes.',
      category: 'Empresas',
    },
    {
      id: '14',
      question: 'Posso fazer upgrade do meu plano?',
      answer:
        'Sim! Você pode fazer upgrade a qualquer momento através do Dashboard. A diferença de valor será calculada proporcionalmente.',
      category: 'Assinatura',
    },
    {
      id: '15',
      question: 'A IA entende português brasileiro?',
      answer:
        'Sim! Nossa IA foi treinada especificamente para português brasileiro, entendendo gírias, expressões regionais e o contexto cultural do Brasil.',
      category: 'IA',
    },
  ];

  // Filter FAQ based on search query
  const filteredFAQ = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const openTicketsCount = userTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-main to-blue-main">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-black-main/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBackToDashboard}
                className="flex items-center space-x-2 rounded-lg bg-slate-800 px-4 py-2 text-white transition-colors hover:bg-slate-700"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Voltar para o Dashboard</span>
              </button>
            </div>
            <div className="flex items-center gap-4">
              {/* My Tickets Button */}
              <button
                onClick={() => navigate(ROUTES.SUPPORT_TICKETS)}
                className="relative flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
              >
                <Ticket className="h-5 w-5" />
                <span className="hidden sm:inline">Meus Tickets</span>
                {openTicketsCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white">
                    {openTicketsCount}
                  </span>
                )}
              </button>
              <div className="flex items-center space-x-3">
                <img
                  src="/bone-logo.png"
                  alt="MyEasyAI Logo"
                  className="h-10 w-10 object-contain"
                />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent">
                Central de Suporte
              </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">
            Como podemos te ajudar?
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-slate-400">
            Seja pra aprender algo novo, resolver um probleminha ou só tirar uma dúvida rápida — a gente tá aqui pra você. Assista nossos tutoriais em vídeo, confira dicas pra resolver pepinos comuns, conheça nosso assistente de IA (em breve!) ou dê uma olhada nas perguntas frequentes.
          </p>
        </div>

        {/* Section 1: Video Tutorials */}
        <section className="mb-16">
          <div className="mb-4 flex items-center space-x-3">
            <PlayCircle className="h-8 w-8 text-blue-400" />
            <h2 className="text-3xl font-bold text-white">
              Aprenda no seu ritmo
            </h2>
          </div>
          <p className="mb-6 max-w-3xl text-slate-400">
            A gente sabe que às vezes um vídeo vale mais que mil palavras. Por isso, preparamos tutoriais curtos e direto ao ponto pra você dominar cada ferramenta sem enrolação.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {tutorials.map((video) => (
              <div
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className="group cursor-pointer rounded-lg border border-slate-800 bg-slate-900/50 p-3 transition-all hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20"
              >
                <div className="relative mb-3 overflow-hidden rounded-lg bg-slate-800">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="h-28 w-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-all group-hover:bg-black/50">
                    <PlayCircle className="h-10 w-10 text-white transition-transform group-hover:scale-110" />
                  </div>
                  <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                    {video.duration}
                  </div>
                </div>
                <span className="mb-1 inline-block rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                  {video.category}
                </span>
                <h3 className="mb-1 text-sm font-semibold text-white line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {video.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Quick Tech Support */}
        <section className="mb-16">
          <div className="mb-4 flex items-center space-x-3">
            <HelpCircle className="h-8 w-8 text-green-400" />
            <h2 className="text-3xl font-bold text-white">Deu ruim? Relaxa!</h2>
          </div>
          <p className="mb-6 max-w-3xl text-slate-400">
            Calma que a maioria dos problemas tem solução rápida. Antes de acionar o suporte, dá uma olhada nessas dicas que resolvem 90% dos pepinos mais comuns.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {techSupport.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-slate-800 bg-slate-900/50 p-6"
              >
                <div className="mb-4 flex items-center space-x-3">
                  <div className="rounded-lg bg-green-500/20 p-3 text-green-400">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {item.title}
                  </h3>
                </div>
                <p className="mb-4 text-slate-400">{item.description}</p>
                <ol className="space-y-2">
                  {item.steps.map((step, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-400" />
                      <span className="text-sm text-slate-300">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: AI Chat Support */}
        <section className="mb-16">
          <div className="mb-4 flex items-center space-x-3">
            <Sparkles className="h-8 w-8 text-yellow-400" />
            <h2 className="text-3xl font-bold text-white">
              Converse com seu assistente pessoal
            </h2>
          </div>
          <p className="mb-6 max-w-3xl text-slate-400">
            Precisa de ajuda? Nosso assistente de IA está aqui pra você, 24 horas por dia, 7 dias por semana. Pergunte qualquer coisa sobre a plataforma e receba respostas instantâneas!
          </p>

          {/* Chat Container */}
          <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-slate-900/95 to-purple-900/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <div className="flex items-center gap-3">
                {avatarSelfie ? (
                  <img
                    src={avatarSelfie}
                    alt={displayName}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-purple-500/50"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-white">{displayName}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-slate-400">Online agora</span>
                  </div>
                </div>
              </div>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clearMessages}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-400 transition-all hover:bg-slate-800 hover:text-white"
                  title="Nova conversa"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">Nova conversa</span>
                </button>
              )}
            </div>

            {/* Messages Area */}
            <div className="h-[400px] overflow-y-auto p-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-800/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-purple-500/50">
              {messages.length === 0 ? (
                /* Welcome Screen */
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 animate-pulse rounded-full bg-purple-500/20 blur-xl" />
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500">
                      <MessageSquare className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h4 className="mb-2 text-xl font-bold text-white">
                    Olá! Como posso te ajudar hoje?
                  </h4>
                  <p className="mb-6 max-w-md text-slate-400">
                    Sou seu assistente virtual. Pergunte sobre qualquer recurso da plataforma, dúvidas de uso, planos ou funcionalidades!
                  </p>

                  {/* Quick Suggestions */}
                  <div className="grid w-full max-w-lg gap-2 sm:grid-cols-2">
                    {[
                      { icon: HelpCircle, text: 'Como funciona a plataforma?', color: 'from-violet-500 to-purple-600' },
                      { icon: Sparkles, text: 'Quais são os planos disponíveis?', color: 'from-emerald-500 to-teal-600' },
                      { icon: MessageSquare, text: 'Como criar meu primeiro site?', color: 'from-blue-500 to-cyan-600' },
                      { icon: HelpCircle, text: 'Preciso de ajuda com minha conta', color: 'from-orange-500 to-amber-600' },
                    ].map((suggestion) => (
                      <button
                        type="button"
                        key={suggestion.text}
                        onClick={() => handleSuggestionClick(suggestion.text)}
                        className="group flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2.5 text-left transition-all hover:border-purple-500/50 hover:bg-slate-700/50"
                      >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r ${suggestion.color}`}>
                          <suggestion.icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm text-slate-300 group-hover:text-white">
                          {suggestion.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Chat Messages */
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        avatarSelfie ? (
                          <img
                            src={avatarSelfie}
                            alt={displayName}
                            className="mr-2 mt-0.5 h-8 w-8 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="mr-2 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                        )
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                            : 'border border-slate-700 bg-slate-800/50 text-slate-200'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <div className="prose prose-sm prose-invert max-w-none">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => (
                                  <p className="mb-2 last:mb-0 text-slate-200">{children}</p>
                                ),
                                ul: ({ children }) => (
                                  <ul className="mb-2 list-disc pl-4 last:mb-0">{children}</ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="mb-2 list-decimal pl-4 last:mb-0">{children}</ol>
                                ),
                                li: ({ children }) => (
                                  <li className="text-slate-200">{children}</li>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-semibold text-purple-300">{children}</strong>
                                ),
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p>{message.content}</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Loading */}
                  {isLoading && (
                    <div className="flex justify-start">
                      {avatarSelfie ? (
                        <img
                          src={avatarSelfie}
                          alt={displayName}
                          className="mr-2 mt-0.5 h-8 w-8 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="mr-2 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div className="rounded-2xl border border-slate-700 bg-slate-800/50 px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400" style={{ animationDelay: '0ms' }} />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400" style={{ animationDelay: '150ms' }} />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ticket suggestion banner - appears after 3 messages */}
                  {showTicketBanner && (
                    <div className="mt-4 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
                          <Ticket className="h-5 w-5 text-amber-400" />
                        </div>
                        <div className="flex-1">
                          <p className="mb-2 font-medium text-white">
                            Ainda nao conseguimos resolver?
                          </p>
                          <p className="mb-3 text-sm text-slate-400">
                            Se o assistente nao conseguiu ajudar, nossa equipe de suporte pode analisar seu caso pessoalmente.
                          </p>
                          <button
                            type="button"
                            onClick={openTicketPage}
                            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-amber-500/25"
                          >
                            <Ticket className="h-4 w-4" />
                            Abrir Ticket de Suporte
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-800 p-4">
              <form
                onSubmit={handleChatSubmit}
                className={`flex items-center gap-3 rounded-xl border bg-slate-800/50 px-4 py-3 transition-all ${
                  isChatFocused ? 'border-purple-500/50 ring-2 ring-purple-500/20' : 'border-slate-700'
                }`}
              >
                <input
                  ref={chatInputRef}
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onFocus={() => setIsChatFocused(true)}
                  onBlur={() => setIsChatFocused(false)}
                  placeholder="Digite sua pergunta..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !chatInput.trim()}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all ${
                    chatInput.trim() && !isLoading
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40'
                      : 'bg-slate-700 text-slate-500'
                  }`}
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
              <p className="mt-2 text-center text-xs text-slate-500">
                Pressione Enter para enviar • Respostas instantâneas 24/7
              </p>
            </div>
          </div>

          {/* Features Cards */}
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-center">
              <Sparkles className="mx-auto mb-2 h-8 w-8 text-yellow-400" />
              <h4 className="mb-1 font-semibold text-white">
                Respostas Instantâneas
              </h4>
              <p className="text-sm text-slate-400">
                Sem espera, sem fila. Pergunte e receba ajuda na hora!
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-center">
              <MessageSquare className="mx-auto mb-2 h-8 w-8 text-blue-400" />
              <h4 className="mb-1 font-semibold text-white">
                Disponível 24/7
              </h4>
              <p className="text-sm text-slate-400">
                De madrugada ou no fim de semana, estamos sempre aqui!
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-center">
              <HelpCircle className="mx-auto mb-2 h-8 w-8 text-green-400" />
              <h4 className="mb-1 font-semibold text-white">
                Conhece Tudo
              </h4>
              <p className="text-sm text-slate-400">
                Treinado especialmente sobre todos os recursos da plataforma.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: FAQ */}
        <section id="faq" className="mb-16 scroll-mt-20">
          <div className="mb-4 flex items-center space-x-3">
            <Search className="h-8 w-8 text-purple-400" />
            <h2 className="text-3xl font-bold text-white">
              Tá com dúvida? Bora resolver!
            </h2>
          </div>
          <p className="mb-6 max-w-3xl text-slate-400">
            Reunimos aqui as perguntas que mais recebemos. Spoiler: provavelmente a sua já foi respondida. Dá uma pesquisada e, se não achar, pode contar com a gente.
          </p>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Busque por palavras-chave nas perguntas e respostas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/50 py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            {searchQuery && (
              <p className="mt-2 text-sm text-slate-400">
                {filteredFAQ.length} resultado
                {filteredFAQ.length !== 1 ? 's' : ''} encontrado
                {filteredFAQ.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFAQ.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-slate-800 bg-slate-900/50 transition-all hover:border-purple-500"
              >
                <button
                  onClick={() => toggleFAQ(item.id)}
                  className="flex w-full items-start justify-between p-6 text-left"
                >
                  <div className="flex-1">
                    <span className="mb-2 inline-block rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-400">
                      {item.category}
                    </span>
                    <h3 className="mt-2 text-lg font-semibold text-white">
                      {item.question}
                    </h3>
                  </div>
                  {expandedFAQ === item.id ? (
                    <ChevronUp className="ml-4 h-6 w-6 flex-shrink-0 text-purple-400" />
                  ) : (
                    <ChevronDown className="ml-4 h-6 w-6 flex-shrink-0 text-slate-400" />
                  )}
                </button>
                {expandedFAQ === item.id && (
                  <div className="border-t border-slate-800 px-6 pb-6 pt-4">
                    <p className="text-slate-300">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFAQ.length === 0 && (
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-12 text-center">
              <Search className="mx-auto mb-4 h-12 w-12 text-slate-600" />
              <p className="text-lg text-slate-400">
                Nenhuma pergunta encontrada com "{searchQuery}"
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Tente usar outras palavras-chave ou navegue pelas categorias
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedVideo(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 transition-colors"
            >
              <span className="text-sm">
                Pressione ESC ou clique fora para fechar
              </span>
            </button>
            <div className="relative w-full pt-[56.25%]">
              <iframe
                className="absolute inset-0 w-full h-full rounded-lg"
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeUrl.split('v=')[1]?.split('&')[0]}?autoplay=1`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-xl font-semibold text-white">
                {selectedVideo.title}
              </h3>
              <p className="text-slate-400 mt-1">{selectedVideo.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
