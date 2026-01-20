import {
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  MessageSquare,
  Monitor,
  PlayCircle,
  RefreshCcw,
  Search,
  Sparkles,
  Wifi,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<TutorialVideo | null>(
    null,
  );

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
      title: 'Currículos Perfeitos com MyEasyResume',
      description:
        'Crie currículos otimizados para conquistar sua vaga dos sonhos.',
      thumbnail: '/bone-logo.png',
      duration: '9:10',
      category: 'MyEasyResume',
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

        {/* Section 3: AI Chat Support (Placeholder) */}
        <section className="mb-16">
          <div className="mb-4 flex items-center space-x-3">
            <Sparkles className="h-8 w-8 text-yellow-400" />
            <h2 className="text-3xl font-bold text-white">
              Seu assistente pessoal tá chegando
            </h2>
          </div>
          <p className="mb-6 max-w-3xl text-slate-400">
            Imagina ter alguém disponível 24h por dia, 7 dias por semana, só pra tirar suas dúvidas? Pois é, tá quase pronto. Nosso chat com IA vai revolucionar a forma como você recebe suporte.
          </p>
          <div className="rounded-lg border border-slate-800 bg-gradient-to-br from-slate-900/80 to-purple-900/20 p-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 rounded-full bg-yellow-500/20 p-6">
                <MessageSquare className="h-12 w-12 text-yellow-400" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-white">
                Chat com IA Inteligente
              </h3>
              <p className="mb-6 max-w-2xl text-slate-300">
                Em breve você poderá conversar com nossa IA treinada
                especialmente para ajudar com todas as suas dúvidas sobre a
                plataforma. O chat estará disponível 24/7 e oferecerá respostas
                instantâneas e personalizadas.
              </p>
              <div className="mb-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
                  <Sparkles className="mx-auto mb-2 h-8 w-8 text-yellow-400" />
                  <h4 className="mb-1 font-semibold text-white">
                    Respostas Instantâneas
                  </h4>
                  <p className="text-sm text-slate-400">
                    Obtenha ajuda imediata para suas dúvidas
                  </p>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
                  <MessageSquare className="mx-auto mb-2 h-8 w-8 text-blue-400" />
                  <h4 className="mb-1 font-semibold text-white">
                    Disponível 24/7
                  </h4>
                  <p className="text-sm text-slate-400">
                    Suporte a qualquer hora do dia
                  </p>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
                  <HelpCircle className="mx-auto mb-2 h-8 w-8 text-green-400" />
                  <h4 className="mb-1 font-semibold text-white">
                    Abertura de Tickets
                  </h4>
                  <p className="text-sm text-slate-400">
                    Escale para suporte humano se necessário
                  </p>
                </div>
              </div>
              <button
                disabled
                className="cursor-not-allowed rounded-lg bg-slate-700 px-8 py-3 font-semibold text-slate-400"
              >
                Em Desenvolvimento
              </button>
              <p className="mt-4 text-sm text-slate-500">
                Enquanto isso, use o FAQ ou entre em contato através do
                formulário de contato
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
