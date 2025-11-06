import {
  ArrowLeft,
  Briefcase,
  Building2,
  ChevronRight,
  DollarSign,
  Lightbulb,
  Loader2,
  MessageSquare,
  Send,
  Target,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import {
  businessAreas,
  onboardingQuestions,
} from '../../constants/businessQuestions';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  options?: Array<{ label: string; value: string }>;
};

interface BusinessInfo {
  area?: string;
  companyName?: string;
  businessStage?: string;
  teamSize?: string;
  currentRevenue?: string;
  mainGoal?: string;
  challenges?: string;
}

type OnboardingState =
  | 'not_started'
  | 'selecting_area'
  | 'answering_questions'
  | 'completed';

type BusinessGuruProps = {
  onBackToDashboard?: () => void;
};

export function BusinessGuru({ onBackToDashboard }: BusinessGuruProps = {}) {
  const [onboardingState, setOnboardingState] =
    useState<OnboardingState>('not_started');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);

  const quickTopics = [
    { icon: TrendingUp, label: 'Marketing Digital', color: 'blue' },
    { icon: DollarSign, label: 'Finanças', color: 'green' },
    { icon: Users, label: 'Gestão de Pessoas', color: 'purple' },
    { icon: Target, label: 'Estratégia', color: 'orange' },
  ];

  // Handler para seleção de área de negócio
  const handleAreaSelect = (areaId: string) => {
    setBusinessInfo({ ...businessInfo, area: areaId });
    setOnboardingState('answering_questions');
    setCurrentQuestionIndex(0);

    const area = businessAreas[areaId];
    setMessages([
      {
        role: 'assistant',
        content: `Excelente! Você selecionou ${area.name}. 🎯\n\nAgora vou fazer algumas perguntas para conhecer melhor seu negócio e poder te ajudar de forma personalizada.\n\nVamos começar!`,
      },
      {
        role: 'assistant',
        content: onboardingQuestions[0].question,
      },
    ]);
  };

  // Handler para respostas do questionário
  const handleQuestionAnswer = (answer: string) => {
    const currentQuestion = onboardingQuestions[currentQuestionIndex];

    // Salvar resposta
    const updatedInfo = { ...businessInfo };
    switch (currentQuestion.id) {
      case 'companyName':
        updatedInfo.companyName = answer;
        break;
      case 'businessStage':
        updatedInfo.businessStage = answer;
        break;
      case 'teamSize':
        updatedInfo.teamSize = answer;
        break;
      case 'currentRevenue':
        updatedInfo.currentRevenue = answer;
        break;
      case 'mainGoal':
        updatedInfo.mainGoal = answer;
        break;
      case 'challenges':
        updatedInfo.challenges = answer;
        break;
    }
    setBusinessInfo(updatedInfo);

    // Adicionar mensagem do usuário
    const userMessage: Message = {
      role: 'user',
      content: answer,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Próxima pergunta ou finalizar
    if (currentQuestionIndex < onboardingQuestions.length - 1) {
      const nextQuestion = onboardingQuestions[currentQuestionIndex + 1];
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: nextQuestion.question,
            options: nextQuestion.options,
          },
        ]);
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 500);
    } else {
      // Finalizar onboarding
      setTimeout(() => {
        completeOnboarding(updatedInfo);
      }, 500);
    }
  };

  // Completar onboarding
  const completeOnboarding = (info: BusinessInfo) => {
    setOnboardingState('completed');
    setShowOnboarding(false);

    const area = businessAreas[info.area!];
    const welcomeMessage =
      `Perfeito, ${info.companyName}! 🎉\n\n` +
      `Agora conheço melhor seu negócio:\n` +
      `• Área: ${area.name}\n` +
      `• Estágio: ${info.businessStage}\n` +
      `• Equipe: ${info.teamSize}\n` +
      `• Faturamento: ${info.currentRevenue}\n` +
      `• Objetivo: ${info.mainGoal}\n\n` +
      `${area.prompts.planning}\n\n` +
      `Como posso te ajudar hoje?`;

    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: welcomeMessage,
      },
    ]);
  };

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulação de resposta personalizada baseada no businessInfo
    setTimeout(() => {
      const area = businessInfo.area ? businessAreas[businessInfo.area] : null;
      const contextualResponse = area
        ? `Considerando que você está no setor de ${area.name} e seu objetivo é ${businessInfo.mainGoal}, `
        : '';

      const assistantMessage: Message = {
        role: 'assistant',
        content: `${contextualResponse}vou te ajudar com "${inputMessage}". Para seu negócio, recomendo focar em estratégias que priorizem ${businessInfo.mainGoal?.toLowerCase() || 'crescimento sustentável'}...`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleQuickTopic = (topic: string) => {
    if (onboardingState === 'completed') {
      setInputMessage(`Me ajude com ${topic}`);
    }
  };

  // Renderizar onboarding
  if (showOnboarding && onboardingState !== 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black-main to-blue-main">
        <header className="border-b border-slate-800 bg-black-main/50 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src="/bone-logo.png"
                  alt="MyEasyAI Logo"
                  className="h-12 w-12 object-contain"
                />
                <div>
                  <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-xl font-bold text-transparent">
                    Business Guru
                  </span>
                  <p className="text-xs text-slate-400">
                    Consultoria de Negócios com IA
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  onBackToDashboard
                    ? onBackToDashboard()
                    : (window.location.href = '/')
                }
                className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Voltar ao Dashboard</span>
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          {onboardingState === 'not_started' && (
            <div className="text-center">
              <div className="mb-8">
                <Briefcase className="h-20 w-20 mx-auto text-green-400 mb-4" />
                <h1 className="text-4xl font-bold text-white mb-4">
                  Bem-vindo ao Business Guru! 🎯
                </h1>
                <p className="text-xl text-slate-300 mb-2">
                  Seu consultor de negócios especializado com IA
                </p>
                <p className="text-slate-400">
                  Para começar, vou fazer algumas perguntas para conhecer melhor
                  seu negócio
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
                {Object.entries(businessAreas).map(([id, area]) => (
                  <button
                    key={id}
                    onClick={() => handleAreaSelect(id)}
                    className="group relative overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-900/50 p-6 hover:border-green-500 hover:bg-slate-800 transition-all duration-300"
                  >
                    <div className="text-4xl mb-4">{area.icon}</div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {area.name}
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">
                      {area.description}
                    </p>
                    <ChevronRight className="h-5 w-5 text-green-400 mx-auto group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {onboardingState === 'answering_questions' && messages.length > 0 && (
            <div className="space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">
                    Questionário Inicial
                  </h2>
                  <span className="text-sm text-slate-400">
                    Pergunta {currentQuestionIndex + 1} de{' '}
                    {onboardingQuestions.length}
                  </span>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`${
                        message.role === 'user' ? 'ml-auto w-fit' : 'w-full'
                      }`}
                    >
                      <div
                        className={`rounded-lg p-4 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                            : 'bg-slate-800 text-slate-100 border border-slate-700'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex items-center space-x-2 mb-2">
                            <User className="h-4 w-4 text-green-400" />
                            <span className="text-xs font-semibold text-green-400">
                              Business Guru
                            </span>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-line">
                          {message.content}
                        </p>

                        {message.options && index === messages.length - 1 && (
                          <div className="mt-4 grid grid-cols-1 gap-2">
                            {message.options.map((option) => (
                              <button
                                key={option.value}
                                onClick={() =>
                                  handleQuestionAnswer(option.label)
                                }
                                className="text-left px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-green-500 transition-colors text-white"
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {!onboardingQuestions[currentQuestionIndex]?.options && (
                  <div className="mt-6 flex space-x-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === 'Enter' &&
                        inputMessage.trim() &&
                        handleQuestionAnswer(inputMessage)
                      }
                      placeholder="Digite sua resposta..."
                      className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      onClick={() => {
                        if (inputMessage.trim()) {
                          handleQuestionAnswer(inputMessage);
                          setInputMessage('');
                        }
                      }}
                      disabled={!inputMessage.trim()}
                      className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-main to-blue-main">
      {/* Header */}
      <header className="border-b border-slate-800 bg-black-main/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src="/bone-logo.png"
                alt="MyEasyAI Logo"
                className="h-12 w-12 object-contain"
              />
              <div>
                <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-xl font-bold text-transparent">
                  Business Guru
                </span>
                <p className="text-xs text-slate-400">
                  Consultoria de Negócios com IA
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                onBackToDashboard
                  ? onBackToDashboard()
                  : (window.location.href = '/')
              }
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Voltar ao Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar - Business Info + Quick Topics */}
          <div className="md:col-span-1 space-y-6">
            {/* Business Profile */}
            {businessInfo.companyName && (
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Building2 className="h-6 w-6 text-green-400" />
                  <h2 className="text-xl font-bold text-white">Seu Negócio</h2>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-400">Empresa</p>
                    <p className="text-white font-medium">
                      {businessInfo.companyName}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Área</p>
                    <p className="text-white font-medium">
                      {businessInfo.area &&
                        businessAreas[businessInfo.area]?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Estágio</p>
                    <p className="text-white font-medium">
                      {businessInfo.businessStage}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Objetivo Principal</p>
                    <p className="text-white font-medium">
                      {businessInfo.mainGoal}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Lightbulb className="h-6 w-6 text-yellow-400" />
                <h2 className="text-xl font-bold text-white">
                  Tópicos Rápidos
                </h2>
              </div>

              <div className="space-y-3">
                {quickTopics.map((topic) => {
                  const Icon = topic.icon;
                  return (
                    <button
                      key={topic.label}
                      onClick={() => handleQuickTopic(topic.label)}
                      className={`w-full flex items-center space-x-3 rounded-lg border border-slate-700 bg-slate-800 p-4 hover:border-${topic.color}-500 hover:bg-slate-700 transition-colors text-left`}
                    >
                      <Icon className={`h-5 w-5 text-${topic.color}-400`} />
                      <span className="text-white font-medium">
                        {topic.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Suas Estatísticas
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-white">47</p>
                  <p className="text-sm text-slate-400">Consultas Realizadas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">12h</p>
                  <p className="text-sm text-slate-400">Tempo Economizado</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">8</p>
                  <p className="text-sm text-slate-400">
                    Estratégias Implementadas
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-2">
            <div
              className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden flex flex-col"
              style={{ height: 'calc(100vh - 200px)' }}
            >
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                          : 'bg-slate-800 text-slate-100 border border-slate-700'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex items-center space-x-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-green-400" />
                          <span className="text-xs font-semibold text-green-400">
                            Business Guru
                          </span>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-4 bg-slate-800 border border-slate-700">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 text-green-400 animate-spin" />
                        <span className="text-sm text-slate-400">
                          Business Guru está digitando...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-slate-800 bg-slate-900 p-4">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Digite sua pergunta sobre negócios..."
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputMessage.trim() || isTyping}
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Send className="h-5 w-5" />
                    <span>Enviar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
