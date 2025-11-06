// Sistema de Questionário Detalhado para Business Guru
export interface BusinessArea {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  prompts: {
    planning: string;
    parameters: string[];
  };
}

export const businessAreas: Record<string, BusinessArea> = {
  technology: {
    id: 'technology',
    name: 'Tecnologia',
    description:
      'Empresas de software, hardware, desenvolvimento web/mobile, SaaS',
    icon: '💻',
    color: '#3B82F6',
    prompts: {
      planning:
        'Como especialista em negócios de tecnologia, vou te ajudar a criar um plano estratégico detalhado para sua empresa de tecnologia. Considerando aspectos como desenvolvimento de produto, escalabilidade técnica, aquisição de usuários, monetização e crescimento sustentável.',
      parameters: [
        'Modelo de negócio',
        'Stack tecnológica',
        'Target audience',
        'Estratégia de monetização',
        'Roadmap de produto',
        'Time e recursos',
        'Investimento necessário',
        'Concorrência',
        'Go-to-market strategy',
      ],
    },
  },
  retail: {
    id: 'retail',
    name: 'Varejo',
    description: 'Lojas físicas, e-commerce, marketplace, produtos de consumo',
    icon: '🛒',
    color: '#10B981',
    prompts: {
      planning:
        'Como especialista em varejo, vou desenvolver uma estratégia completa para sua empresa de varejo. Focando em experiência do cliente, gestão de estoque, canais de venda, marketing e crescimento sustentável.',
      parameters: [
        'Categoria de produtos',
        'Canal de vendas',
        'Público-alvo',
        'Estratégia de precificação',
        'Gestão de estoque',
        'Fornecedores',
        'Marketing e branding',
        'Experiência do cliente',
        'Análise de mercado',
      ],
    },
  },
  services: {
    id: 'services',
    name: 'Serviços',
    description: 'Consultoria, educação, saúde, serviços profissionais',
    icon: '🤝',
    color: '#8B5CF6',
    prompts: {
      planning:
        'Como especialista em negócios de serviços, vou criar um plano estratégico para sua empresa de serviços. Considerando especialização, precificação de valor, aquisição de clientes, escalabilidade e diferenciação no mercado.',
      parameters: [
        'Tipo de serviço',
        'Especialização',
        'Modelo de precificação',
        'Aquisição de clientes',
        'Processos operacionais',
        'Time e competências',
        'Escalabilidade',
        'Diferenciação',
        'Parcerias estratégicas',
      ],
    },
  },
  food: {
    id: 'food',
    name: 'Alimentação',
    description: 'Restaurantes, food trucks, delivery, produtos alimentícios',
    icon: '🍔',
    color: '#F59E0B',
    prompts: {
      planning:
        'Como especialista no setor alimentício, vou desenvolver uma estratégia abrangente para seu negócio de alimentação. Incluindo conceito gastronômico, operações, marketing local, sustentabilidade e crescimento.',
      parameters: [
        'Conceito gastronômico',
        'Localização',
        'Cardápio e custos',
        'Fornecedores',
        'Operações e logística',
        'Marketing local',
        'Experiência do cliente',
        'Regulamentações',
        'Expansão e franchising',
      ],
    },
  },
  manufacturing: {
    id: 'manufacturing',
    name: 'Indústria',
    description: 'Manufatura, produção, distribuição, B2B',
    icon: '🏭',
    color: '#EF4444',
    prompts: {
      planning:
        'Como especialista em negócios industriais, vou criar um plano estratégico para sua empresa industrial. Focando em eficiência operacional, cadeia de suprimentos, qualidade, inovação e expansão de mercado.',
      parameters: [
        'Produto/processo industrial',
        'Cadeia de suprimentos',
        'Capacidade produtiva',
        'Controle de qualidade',
        'Automação e tecnologia',
        'Mercados B2B',
        'Regulamentações',
        'Sustentabilidade',
        'Distribuição e logística',
      ],
    },
  },
  finance: {
    id: 'finance',
    name: 'Finanças',
    description: 'Fintech, investimentos, seguros, serviços financeiros',
    icon: '💰',
    color: '#EC4899',
    prompts: {
      planning:
        'Como especialista em negócios financeiros, vou desenvolver uma estratégia para sua empresa do setor financeiro. Considerando regulamentações, gestão de risco, produtos financeiros, tecnologia e compliance.',
      parameters: [
        'Produtos financeiros',
        'Público-alvo',
        'Regulamentações',
        'Gestão de risco',
        'Tecnologia financeira',
        'Compliance',
        'Partnerships bancárias',
        'Segurança e dados',
        'Estratégia de crescimento',
      ],
    },
  },
};

export interface OnboardingQuestion {
  id: string;
  question: string;
  type: 'select' | 'text' | 'number';
  options?: Array<{ value: string; label: string }>;
  required: boolean;
}

export const onboardingQuestions: OnboardingQuestion[] = [
  {
    id: 'companyName',
    question: 'Qual é o nome da sua empresa?',
    type: 'text',
    required: true,
  },
  {
    id: 'businessStage',
    question: 'Em que momento está seu negócio?',
    type: 'select',
    required: true,
    options: [
      { value: 'idea', label: '💡 Ideia/Conceito' },
      { value: 'startup', label: '🚀 Startup (0-2 anos)' },
      { value: 'growth', label: '📈 Crescimento (2-5 anos)' },
      { value: 'established', label: '🏢 Estabelecida (5+ anos)' },
    ],
  },
  {
    id: 'teamSize',
    question: 'Quantas pessoas trabalham no seu negócio?',
    type: 'select',
    required: true,
    options: [
      { value: 'solo', label: '👤 Apenas eu' },
      { value: 'small', label: '👥 2-10 pessoas' },
      { value: 'medium', label: '👨‍👩‍👧‍👦 11-50 pessoas' },
      { value: 'large', label: '🏢 50+ pessoas' },
    ],
  },
  {
    id: 'currentRevenue',
    question: 'Qual é o faturamento mensal aproximado?',
    type: 'select',
    required: true,
    options: [
      { value: 'pre-revenue', label: '🌱 Pré-faturamento' },
      { value: 'low', label: '💵 R$ 0 - R$ 10k/mês' },
      { value: 'medium', label: '💰 R$ 10k - R$ 100k/mês' },
      { value: 'high', label: '💎 R$ 100k - R$ 1M/mês' },
      { value: 'enterprise', label: '🏆 R$ 1M+/mês' },
    ],
  },
  {
    id: 'mainGoal',
    question: 'Qual é seu objetivo principal agora?',
    type: 'select',
    required: true,
    options: [
      { value: 'launch', label: '🚀 Lançar o negócio' },
      { value: 'grow', label: '📈 Crescer vendas' },
      { value: 'scale', label: '⚡ Escalar operações' },
      { value: 'optimize', label: '🎯 Otimizar processos' },
      { value: 'expand', label: '🌍 Expandir mercado' },
      { value: 'exit', label: '💼 Preparar para venda/IPO' },
    ],
  },
  {
    id: 'challenges',
    question: 'Quais são os principais desafios que você enfrenta?',
    type: 'text',
    required: true,
  },
];

export const getBusinessAreaById = (id: string): BusinessArea | undefined => {
  return businessAreas[id];
};

export const getAllBusinessAreas = (): BusinessArea[] => {
  return Object.values(businessAreas);
};
