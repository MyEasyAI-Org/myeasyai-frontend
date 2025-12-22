/**
 * MyEasyContent Constants
 *
 * Configuration and constant values for the content creation module.
 */

import type {
  BusinessNiche,
  ContentTone,
  ContentType,
  SocialNetwork,
} from '../types';

/**
 * Social network configurations
 */
export const SOCIAL_NETWORKS: Array<{
  id: SocialNetwork;
  name: string;
  icon: string;
  color: string;
  maxChars?: number;
  features: string[];
}> = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'Instagram',
    color: '#E4405F',
    maxChars: 2200,
    features: ['feed', 'stories', 'reels', 'carrossel'],
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'Facebook',
    color: '#1877F2',
    maxChars: 63206,
    features: ['feed', 'stories', 'reels', 'grupos'],
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'Linkedin',
    color: '#0A66C2',
    maxChars: 3000,
    features: ['feed', 'artigos', 'newsletter'],
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: 'Twitter',
    color: '#000000',
    maxChars: 280,
    features: ['tweets', 'threads', 'spaces'],
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: 'Music',
    color: '#000000',
    maxChars: 2200,
    features: ['videos', 'duetos', 'trends'],
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: 'Youtube',
    color: '#FF0000',
    maxChars: 5000,
    features: ['videos', 'shorts', 'community'],
  },
];

/**
 * Content type configurations
 */
export const CONTENT_TYPES: Array<{
  id: ContentType;
  name: string;
  description: string;
  icon: string;
}> = [
  {
    id: 'feed_post',
    name: 'Post para Feed',
    description: 'Conteudo completo para publicar no feed',
    icon: 'FileText',
  },
  {
    id: 'caption',
    name: 'Legenda',
    description: 'Texto para acompanhar suas imagens e videos',
    icon: 'MessageSquare',
  },
  {
    id: 'story',
    name: 'Roteiro de Story',
    description: 'Sequencia de stories com texto e orientacoes',
    icon: 'Smartphone',
  },
  {
    id: 'reel',
    name: 'Roteiro de Reel/TikTok',
    description: 'Script para videos curtos com gancho e CTA',
    icon: 'Video',
  },
  {
    id: 'calendar',
    name: 'Calendario Editorial',
    description: 'Planejamento mensal de conteudos',
    icon: 'Calendar',
  },
  {
    id: 'ideas',
    name: 'Ideias e Pautas',
    description: 'Sugestoes de temas e conteudos para criar',
    icon: 'Lightbulb',
  },
  {
    id: 'hashtags',
    name: 'Hashtags',
    description: 'Conjunto de hashtags relevantes para seu nicho',
    icon: 'Hash',
  },
  {
    id: 'best_times',
    name: 'Horarios Ideais',
    description: 'Melhores horarios para postar em cada rede',
    icon: 'Clock',
  },
];

/**
 * Business niche options
 */
export const BUSINESS_NICHES: Array<{
  id: BusinessNiche;
  name: string;
  icon: string;
  examples: string[];
}> = [
  {
    id: 'restaurant',
    name: 'Restaurante/Alimentacao',
    icon: 'Utensils',
    examples: ['Restaurantes', 'Cafeterias', 'Delivery', 'Food Truck'],
  },
  {
    id: 'retail',
    name: 'Varejo/Loja',
    icon: 'Store',
    examples: ['Roupas', 'Acessorios', 'Eletronicos', 'Decoracao'],
  },
  {
    id: 'consulting',
    name: 'Consultoria',
    icon: 'Briefcase',
    examples: ['Marketing', 'Financeira', 'RH', 'Juridica'],
  },
  {
    id: 'health',
    name: 'Saude',
    icon: 'Heart',
    examples: ['Clinicas', 'Dentistas', 'Psicologos', 'Nutricionistas'],
  },
  {
    id: 'beauty',
    name: 'Beleza/Estetica',
    icon: 'Sparkles',
    examples: ['Saloes', 'Barbearias', 'SPAs', 'Manicures'],
  },
  {
    id: 'education',
    name: 'Educacao',
    icon: 'GraduationCap',
    examples: ['Escolas', 'Cursos', 'Mentorias', 'Treinamentos'],
  },
  {
    id: 'technology',
    name: 'Tecnologia',
    icon: 'Laptop',
    examples: ['Software', 'Apps', 'TI', 'Startups'],
  },
  {
    id: 'fitness',
    name: 'Fitness/Esportes',
    icon: 'Dumbbell',
    examples: ['Academias', 'Personal Trainers', 'CrossFit', 'Yoga'],
  },
  {
    id: 'real_estate',
    name: 'Imobiliario',
    icon: 'Home',
    examples: ['Imobiliarias', 'Corretores', 'Construtoras'],
  },
  {
    id: 'services',
    name: 'Servicos Gerais',
    icon: 'Wrench',
    examples: ['Manutencao', 'Limpeza', 'Transporte', 'Eventos'],
  },
  {
    id: 'other',
    name: 'Outro',
    icon: 'MoreHorizontal',
    examples: ['Personalize para seu negocio'],
  },
];

/**
 * Content tone options
 */
export const CONTENT_TONES: Array<{
  id: ContentTone;
  name: string;
  description: string;
  icon: string;
}> = [
  {
    id: 'professional',
    name: 'Profissional',
    description: 'Tom serio e corporativo',
    icon: 'Briefcase',
  },
  {
    id: 'casual',
    name: 'Casual',
    description: 'Tom descontraido e amigavel',
    icon: 'Smile',
  },
  {
    id: 'funny',
    name: 'Divertido',
    description: 'Com humor e leveza',
    icon: 'Laugh',
  },
  {
    id: 'inspirational',
    name: 'Inspiracional',
    description: 'Motivacional e positivo',
    icon: 'Sparkles',
  },
  {
    id: 'educational',
    name: 'Educativo',
    description: 'Informativo e didatico',
    icon: 'BookOpen',
  },
  {
    id: 'promotional',
    name: 'Promocional',
    description: 'Focado em vendas e ofertas',
    icon: 'Tag',
  },
];

/**
 * Best posting times by network (general recommendations)
 */
export const DEFAULT_BEST_TIMES: Record<
  SocialNetwork,
  Array<{ day: string; time: string; engagement: 'high' | 'medium' | 'low' }>
> = {
  instagram: [
    { day: 'Segunda', time: '11:00 - 13:00', engagement: 'high' },
    { day: 'Terca', time: '10:00 - 14:00', engagement: 'high' },
    { day: 'Quarta', time: '11:00 - 13:00', engagement: 'high' },
    { day: 'Quinta', time: '12:00 - 14:00', engagement: 'medium' },
    { day: 'Sexta', time: '10:00 - 11:00', engagement: 'medium' },
    { day: 'Sabado', time: '10:00 - 13:00', engagement: 'medium' },
    { day: 'Domingo', time: '17:00 - 19:00', engagement: 'low' },
  ],
  facebook: [
    { day: 'Segunda', time: '13:00 - 16:00', engagement: 'medium' },
    { day: 'Terca', time: '09:00 - 14:00', engagement: 'high' },
    { day: 'Quarta', time: '09:00 - 15:00', engagement: 'high' },
    { day: 'Quinta', time: '09:00 - 14:00', engagement: 'high' },
    { day: 'Sexta', time: '09:00 - 11:00', engagement: 'medium' },
    { day: 'Sabado', time: '12:00 - 13:00', engagement: 'low' },
    { day: 'Domingo', time: '15:00 - 16:00', engagement: 'low' },
  ],
  linkedin: [
    { day: 'Segunda', time: '07:00 - 08:00', engagement: 'medium' },
    { day: 'Terca', time: '10:00 - 12:00', engagement: 'high' },
    { day: 'Quarta', time: '07:00 - 08:00', engagement: 'high' },
    { day: 'Quinta', time: '09:00 - 14:00', engagement: 'high' },
    { day: 'Sexta', time: '09:00 - 11:00', engagement: 'medium' },
    { day: 'Sabado', time: '10:00 - 11:00', engagement: 'low' },
    { day: 'Domingo', time: '18:00 - 19:00', engagement: 'low' },
  ],
  twitter: [
    { day: 'Segunda', time: '08:00 - 10:00', engagement: 'medium' },
    { day: 'Terca', time: '09:00 - 15:00', engagement: 'high' },
    { day: 'Quarta', time: '09:00 - 15:00', engagement: 'high' },
    { day: 'Quinta', time: '09:00 - 15:00', engagement: 'high' },
    { day: 'Sexta', time: '09:00 - 12:00', engagement: 'medium' },
    { day: 'Sabado', time: '08:00 - 11:00', engagement: 'low' },
    { day: 'Domingo', time: '09:00 - 16:00', engagement: 'low' },
  ],
  tiktok: [
    { day: 'Segunda', time: '06:00 - 10:00', engagement: 'medium' },
    { day: 'Terca', time: '09:00 - 12:00', engagement: 'high' },
    { day: 'Quarta', time: '07:00 - 08:00', engagement: 'high' },
    { day: 'Quinta', time: '09:00 - 12:00', engagement: 'high' },
    { day: 'Sexta', time: '17:00 - 19:00', engagement: 'high' },
    { day: 'Sabado', time: '11:00 - 19:00', engagement: 'high' },
    { day: 'Domingo', time: '15:00 - 19:00', engagement: 'medium' },
  ],
  youtube: [
    { day: 'Segunda', time: '14:00 - 16:00', engagement: 'medium' },
    { day: 'Terca', time: '14:00 - 16:00', engagement: 'medium' },
    { day: 'Quarta', time: '14:00 - 16:00', engagement: 'medium' },
    { day: 'Quinta', time: '12:00 - 15:00', engagement: 'high' },
    { day: 'Sexta', time: '12:00 - 15:00', engagement: 'high' },
    { day: 'Sabado', time: '09:00 - 11:00', engagement: 'high' },
    { day: 'Domingo', time: '09:00 - 11:00', engagement: 'high' },
  ],
};

/**
 * Initial messages for the conversation
 */
export const INITIAL_MESSAGES = [
  {
    role: 'assistant' as const,
    content:
      'Ola! Sou seu assistente de criacao de conteudo para redes sociais.\n\nVou te ajudar a criar posts incriveis, legendas envolventes, roteiros de videos e muito mais!\n\nPrimeiro, me conta: qual e o nicho do seu negocio?',
    showNicheSelector: true,
  },
];

/**
 * Conversation steps
 */
export const CONVERSATION_STEPS = {
  NICHE_SELECTION: 0,
  BUSINESS_NAME: 1,
  TARGET_AUDIENCE: 2,
  TONE_SELECTION: 3,
  NETWORK_SELECTION: 4,
  CONTENT_TYPE_SELECTION: 5,
  TOPIC_INPUT: 6,
  OBJECTIVE_INPUT: 7,
  GENERATING: 8,
  RESULT: 9,
  LIBRARY: 10,
} as const;

/**
 * Default content data
 */
export const DEFAULT_CONTENT_DATA = {
  businessName: '',
  businessNiche: 'other' as BusinessNiche,
  targetAudience: '',
  brandVoice: 'casual' as ContentTone,
  selectedNetworks: [] as SocialNetwork[],
  selectedContentTypes: [] as ContentType[],
  generatedContents: [],
  calendar: [],
  ideas: [],
  savedContents: [],
  currentTopic: '',
  currentObjective: '',
};

/**
 * Hashtag categories by niche
 */
export const HASHTAG_SUGGESTIONS: Record<BusinessNiche, string[]> = {
  restaurant: [
    '#gastronomia',
    '#comidaboa',
    '#foodporn',
    '#restaurante',
    '#delivery',
    '#sabor',
    '#chef',
    '#culinaria',
  ],
  retail: [
    '#loja',
    '#compras',
    '#moda',
    '#tendencia',
    '#estilo',
    '#novidades',
    '#promocao',
    '#desconto',
  ],
  consulting: [
    '#consultoria',
    '#negocios',
    '#empreendedorismo',
    '#gestao',
    '#estrategia',
    '#resultados',
    '#sucesso',
  ],
  health: [
    '#saude',
    '#bemestar',
    '#qualidadedevida',
    '#saudavel',
    '#medicina',
    '#cuidados',
    '#prevencao',
  ],
  beauty: [
    '#beleza',
    '#estetica',
    '#skincare',
    '#makeup',
    '#cabelo',
    '#autocuidado',
    '#beauty',
  ],
  education: [
    '#educacao',
    '#aprendizado',
    '#conhecimento',
    '#curso',
    '#ensino',
    '#desenvolvimento',
    '#estudo',
  ],
  technology: [
    '#tecnologia',
    '#tech',
    '#inovacao',
    '#digital',
    '#software',
    '#startup',
    '#futuro',
  ],
  fitness: [
    '#fitness',
    '#treino',
    '#academia',
    '#saude',
    '#musculacao',
    '#workout',
    '#vidasaudavel',
  ],
  real_estate: [
    '#imoveis',
    '#casapropria',
    '#imobiliaria',
    '#apartamento',
    '#investimento',
    '#moradia',
    '#lar',
  ],
  services: [
    '#servicos',
    '#qualidade',
    '#profissional',
    '#atendimento',
    '#solucoes',
    '#trabalho',
    '#cliente',
  ],
  other: [
    '#negocio',
    '#empreendedor',
    '#marca',
    '#brasil',
    '#sucesso',
    '#inspiracao',
    '#motivacao',
  ],
};
