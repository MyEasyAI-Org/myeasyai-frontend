// =============================================
// MyEasyCRM - Constantes
// =============================================

import type {
  DealStage,
  TaskType,
  TaskPriority,
  ActivityType,
  LeadSource,
  IndustryType,
  CompanySize,
  CRMView,
} from '../types';

// =============================================
// ESTÁGIOS DO PIPELINE
// =============================================
export const DEAL_STAGES: Record<DealStage, { label: string; color: string; probability: number }> = {
  lead: {
    label: 'Lead',
    color: 'bg-slate-500',
    probability: 10,
  },
  qualification: {
    label: 'Qualificação',
    color: 'bg-blue-500',
    probability: 25,
  },
  proposal: {
    label: 'Proposta',
    color: 'bg-yellow-500',
    probability: 50,
  },
  negotiation: {
    label: 'Negociação',
    color: 'bg-orange-500',
    probability: 75,
  },
  closed_won: {
    label: 'Fechado (Ganho)',
    color: 'bg-green-500',
    probability: 100,
  },
  closed_lost: {
    label: 'Fechado (Perdido)',
    color: 'bg-red-500',
    probability: 0,
  },
};

export const DEAL_STAGES_ORDER: DealStage[] = [
  'lead',
  'qualification',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
];

// Array version for iteration (with value property for forms)
export const DEAL_STAGES_LIST: { value: DealStage; label: string; color: string; probability: number }[] =
  (Object.keys(DEAL_STAGES) as DealStage[]).map(key => ({ value: key, ...DEAL_STAGES[key] }));

export const OPEN_DEAL_STAGES: DealStage[] = [
  'lead',
  'qualification',
  'proposal',
  'negotiation',
];

// =============================================
// TIPOS DE TAREFA
// =============================================
export const TASK_TYPES: Record<TaskType, { label: string; icon: string; color: string }> = {
  call: {
    label: 'Ligação',
    icon: 'Phone',
    color: 'text-blue-400',
  },
  email: {
    label: 'Email',
    icon: 'Mail',
    color: 'text-purple-400',
  },
  meeting: {
    label: 'Reunião',
    icon: 'Calendar',
    color: 'text-green-400',
  },
  visit: {
    label: 'Visita',
    icon: 'MapPin',
    color: 'text-orange-400',
  },
  follow_up: {
    label: 'Follow-up',
    icon: 'RefreshCw',
    color: 'text-cyan-400',
  },
  other: {
    label: 'Outro',
    icon: 'MoreHorizontal',
    color: 'text-slate-400',
  },
};

// Array version for iteration
export const TASK_TYPES_LIST: { key: TaskType; label: string; icon: string; color: string }[] =
  (Object.keys(TASK_TYPES) as TaskType[]).map(key => ({ key, ...TASK_TYPES[key] }));

// =============================================
// PRIORIDADES DE TAREFA
// =============================================
export const TASK_PRIORITIES: Record<TaskPriority, { label: string; color: string; bgColor: string }> = {
  low: {
    label: 'Baixa',
    color: 'text-slate-400',
    bgColor: 'bg-slate-400/20',
  },
  medium: {
    label: 'Média',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/20',
  },
  high: {
    label: 'Alta',
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/20',
  },
  urgent: {
    label: 'Urgente',
    color: 'text-red-400',
    bgColor: 'bg-red-400/20',
  },
};

// Array version for iteration
export const TASK_PRIORITIES_LIST: { key: TaskPriority; label: string; color: string; bgColor: string }[] =
  (Object.keys(TASK_PRIORITIES) as TaskPriority[]).map(key => ({ key, ...TASK_PRIORITIES[key] }));

// =============================================
// TIPOS DE ATIVIDADE
// =============================================
export const ACTIVITY_TYPES: Record<ActivityType, { label: string; icon: string; color: string; bgColor?: string }> = {
  call: {
    label: 'Ligação',
    icon: 'Phone',
    color: 'text-blue-400',
    bgColor: 'bg-blue-100',
  },
  email: {
    label: 'Email',
    icon: 'Mail',
    color: 'text-purple-400',
    bgColor: 'bg-purple-100',
  },
  call_made: {
    label: 'Ligação realizada',
    icon: 'PhoneOutgoing',
    color: 'text-blue-400',
    bgColor: 'bg-blue-100',
  },
  call_received: {
    label: 'Ligação recebida',
    icon: 'PhoneIncoming',
    color: 'text-blue-300',
    bgColor: 'bg-blue-100',
  },
  email_sent: {
    label: 'Email enviado',
    icon: 'Send',
    color: 'text-purple-400',
    bgColor: 'bg-purple-100',
  },
  email_received: {
    label: 'Email recebido',
    icon: 'Inbox',
    color: 'text-purple-300',
    bgColor: 'bg-purple-100',
  },
  meeting: {
    label: 'Reunião',
    icon: 'Users',
    color: 'text-green-400',
    bgColor: 'bg-green-100',
  },
  note: {
    label: 'Nota',
    icon: 'FileText',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-100',
  },
  deal_created: {
    label: 'Deal criado',
    icon: 'Plus',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-100',
  },
  deal_moved: {
    label: 'Deal movido',
    icon: 'ArrowRight',
    color: 'text-orange-400',
    bgColor: 'bg-orange-100',
  },
  deal_won: {
    label: 'Deal ganho',
    icon: 'Trophy',
    color: 'text-green-500',
    bgColor: 'bg-green-100',
  },
  deal_lost: {
    label: 'Deal perdido',
    icon: 'XCircle',
    color: 'text-red-400',
    bgColor: 'bg-red-100',
  },
  task_completed: {
    label: 'Tarefa concluída',
    icon: 'CheckCircle',
    color: 'text-green-400',
    bgColor: 'bg-green-100',
  },
};

// Array version for iteration
export const ACTIVITY_TYPES_LIST: { key: ActivityType; label: string; icon: string; color: string }[] =
  (Object.keys(ACTIVITY_TYPES) as ActivityType[]).map(key => ({ key, ...ACTIVITY_TYPES[key] }));

// User-creatable activity types (excluding system-generated ones)
export const USER_ACTIVITY_TYPES: ActivityType[] = [
  'call_made',
  'call_received',
  'email_sent',
  'email_received',
  'meeting',
  'note',
];

// =============================================
// ORIGENS DE LEAD
// =============================================
export const LEAD_SOURCES: Record<LeadSource, { label: string; icon: string }> & { map?: never } = {
  website: {
    label: 'Website',
    icon: 'Globe',
  },
  referral: {
    label: 'Indicação',
    icon: 'Users',
  },
  linkedin: {
    label: 'LinkedIn',
    icon: 'Linkedin',
  },
  instagram: {
    label: 'Instagram',
    icon: 'Instagram',
  },
  facebook: {
    label: 'Facebook',
    icon: 'Facebook',
  },
  google: {
    label: 'Google',
    icon: 'Search',
  },
  event: {
    label: 'Evento',
    icon: 'Calendar',
  },
  cold_call: {
    label: 'Cold Call',
    icon: 'Phone',
  },
  email_campaign: {
    label: 'Campanha de Email',
    icon: 'Mail',
  },
  other: {
    label: 'Outro',
    icon: 'MoreHorizontal',
  },
};

// Array version for iteration (with value property for forms)
export const LEAD_SOURCES_LIST: { value: LeadSource; label: string; icon: string }[] =
  (Object.keys(LEAD_SOURCES) as LeadSource[]).map(key => ({ value: key, ...LEAD_SOURCES[key] }));

// =============================================
// SEGMENTOS DE INDÚSTRIA
// =============================================
export const INDUSTRY_TYPES: Record<IndustryType, string> = {
  technology: 'Tecnologia',
  healthcare: 'Saúde',
  finance: 'Finanças',
  education: 'Educação',
  retail: 'Varejo',
  manufacturing: 'Manufatura',
  services: 'Serviços',
  construction: 'Construção',
  food: 'Alimentação',
  logistics: 'Logística',
  marketing: 'Marketing',
  legal: 'Jurídico',
  consulting: 'Consultoria',
  real_estate: 'Imobiliário',
  other: 'Outro',
};

// Array version for iteration
export const INDUSTRY_TYPES_LIST: { key: IndustryType; label: string }[] =
  (Object.keys(INDUSTRY_TYPES) as IndustryType[]).map(key => ({ key, label: INDUSTRY_TYPES[key] }));

// =============================================
// TAMANHOS DE EMPRESA
// =============================================
export const COMPANY_SIZES: Record<CompanySize, { label: string; description: string }> = {
  micro: {
    label: 'Micro',
    description: '1-9 funcionários',
  },
  small: {
    label: 'Pequena',
    description: '10-49 funcionários',
  },
  medium: {
    label: 'Média',
    description: '50-249 funcionários',
  },
  large: {
    label: 'Grande',
    description: '250-999 funcionários',
  },
  enterprise: {
    label: 'Enterprise',
    description: '1000+ funcionários',
  },
};

// =============================================
// NAVEGAÇÃO DO CRM
// =============================================
export const CRM_NAVIGATION: { id: CRMView; label: string; icon: string }[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
  },
  {
    id: 'contacts',
    label: 'Contatos',
    icon: 'Users',
  },
  {
    id: 'companies',
    label: 'Empresas',
    icon: 'Building2',
  },
  {
    id: 'deals',
    label: 'Pipeline',
    icon: 'TrendingUp',
  },
  {
    id: 'tasks',
    label: 'Tarefas',
    icon: 'CheckSquare',
  },
  {
    id: 'activities',
    label: 'Atividades',
    icon: 'Activity',
  },
];

// =============================================
// FORMATAÇÃO DE MOEDA
// =============================================
export const CURRENCY_CONFIG = {
  locale: 'pt-BR',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

// =============================================
// PAGINAÇÃO PADRÃO
// =============================================
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// =============================================
// CORES PARA TAGS
// =============================================
export const TAG_COLORS = [
  'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'bg-green-500/20 text-green-300 border-green-500/30',
  'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'bg-pink-500/20 text-pink-300 border-pink-500/30',
  'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'bg-red-500/20 text-red-300 border-red-500/30',
];

// Função para obter cor da tag baseada no nome
export function getTagColor(tag: string): string {
  const index = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return TAG_COLORS[index % TAG_COLORS.length];
}
