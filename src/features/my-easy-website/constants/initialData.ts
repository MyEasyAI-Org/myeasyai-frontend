import {
  GraduationCap,
  Handshake,
  Heart,
  Laptop,
  Store,
  Utensils,
} from 'lucide-react';
import type { Message } from '../hooks/useConversationFlow';
import type { SiteData } from '../hooks/useSiteData';

export const INITIAL_MESSAGES: Message[] = [
  {
    role: 'assistant',
    content:
      '👋 Olá! Sou seu assistente de criação de sites.\n\nVamos criar um site profissional para sua empresa!\n\nPara começar, escolha a área de atuação do seu negócio:',
    options: [
      { label: 'Tecnologia', value: 'technology', icon: Laptop },
      { label: 'Varejo', value: 'retail', icon: Store },
      { label: 'Serviços', value: 'services', icon: Handshake },
      { label: 'Alimentação', value: 'food', icon: Utensils },
      { label: 'Saúde', value: 'health', icon: Heart },
      { label: 'Educação', value: 'education', icon: GraduationCap },
    ],
  },
];

export const INITIAL_SITE_DATA: Partial<SiteData> = {
  area: '',
  name: '',
  slogan: '',
  description: '',
  vibe: '',
  colors: '',
  selectedPaletteId: undefined,
  sections: [],
  services: [],
  gallery: [],
  appPlayStore: '',
  appAppStore: '',
  showPlayStore: false,
  showAppStore: false,
  testimonials: [],
  address: '',
  phone: '',
  email: '',
  faq: [
    {
      question: 'Como posso agendar um horário?',
      answer: 'Você pode agendar através do nosso site, app ou WhatsApp.',
    },
    {
      question: 'Quais são as formas de pagamento?',
      answer: 'Aceitamos dinheiro, cartão de crédito/débito e PIX.',
    },
    {
      question: 'Vocês atendem aos finais de semana?',
      answer: 'Sim, atendemos de segunda a sábado, das 9h às 18h.',
    },
  ],
  pricing: [
    {
      name: 'Básico',
      price: 'R$ 99',
      features: ['Atendimento básico', 'Produtos padrão', 'Sem agendamento'],
    },
    {
      name: 'Premium',
      price: 'R$ 199',
      features: [
        'Atendimento premium',
        'Produtos premium',
        'Agendamento prioritário',
        'Brindes exclusivos',
        ],
    },
  ],
  heroStats: [
    { label: 'Anos de experiência', value: '10+' },
    { label: 'Clientes satisfeitos', value: '500+' },
    { label: 'Projetos concluídos', value: '1000+' },
  ],
  features: [
    {
      title: 'Qualidade Garantida',
      description: 'Produtos e serviços de alta qualidade',
    },
    {
      title: 'Atendimento Personalizado',
      description: 'Cada cliente é único para nós',
    },
    {
      title: 'Entrega Rápida',
      description: 'Cumprimos nossos prazos',
    },
  ],
  aboutContent: {
    title: 'Sobre Nós',
    subtitle: 'Nossa História',
    checklist: ['Compromisso com qualidade', 'Atendimento personalizado', 'Resultados garantidos'],
  },
  serviceDescriptions: [],
};
