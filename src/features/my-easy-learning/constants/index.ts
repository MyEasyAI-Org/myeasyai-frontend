import type { SkillLevel, SkillCategory, StudyMotivation, ConversationStep, StudyPlanProfile } from '../types';

// ============================================================================
// SKILL LEVELS
// ============================================================================

export const SKILL_LEVELS: { value: SkillLevel; label: string; description: string }[] = [
  {
    value: 'none',
    label: 'Nenhum',
    description: 'Nunca tive contato com essa habilidade',
  },
  {
    value: 'basic',
    label: 'Básico',
    description: 'Já vi ou usei algumas vezes',
  },
  {
    value: 'intermediate',
    label: 'Intermediário',
    description: 'Uso regularmente, mas quero dominar',
  },
  {
    value: 'advanced',
    label: 'Avançado',
    description: 'Domino bem, quero me aperfeiçoar',
  },
  {
    value: 'expert',
    label: 'Especialista',
    description: 'Sou referência nessa habilidade',
  },
];

export const TARGET_SKILL_LEVELS: { value: SkillLevel; label: string; description: string }[] = [
  {
    value: 'basic',
    label: 'Básico',
    description: 'Entender o essencial para começar',
  },
  {
    value: 'intermediate',
    label: 'Intermediário',
    description: 'Usar com confiança no trabalho',
  },
  {
    value: 'advanced',
    label: 'Avançado',
    description: 'Dominar completamente a habilidade',
  },
  {
    value: 'expert',
    label: 'Especialista',
    description: 'Me tornar referência na área',
  },
];

// ============================================================================
// SKILL CATEGORIES
// ============================================================================

export const SKILL_CATEGORIES: { value: SkillCategory; label: string; icon: string }[] = [
  {
    value: 'technology',
    label: 'Tecnologia',
    icon: '💻',
  },
  {
    value: 'language',
    label: 'Idiomas',
    icon: '🌍',
  },
  {
    value: 'soft_skill',
    label: 'Soft Skills',
    icon: '🧠',
  },
  {
    value: 'tool',
    label: 'Ferramentas',
    icon: '🛠️',
  },
  {
    value: 'business',
    label: 'Negócios',
    icon: '💼',
  },
  {
    value: 'other',
    label: 'Outro',
    icon: '📚',
  },
];

// ============================================================================
// STUDY MOTIVATIONS
// ============================================================================

export const STUDY_MOTIVATIONS: { value: StudyMotivation; label: string; description: string }[] = [
  {
    value: 'career_change',
    label: 'Mudar de carreira',
    description: 'Quero transicionar para uma nova área profissional',
  },
  {
    value: 'promotion',
    label: 'Conseguir promoção',
    description: 'Preciso dessa skill para crescer no trabalho atual',
  },
  {
    value: 'income_increase',
    label: 'Aumentar minha renda',
    description: 'Quero ganhar mais com essa habilidade',
  },
  {
    value: 'personal_project',
    label: 'Projeto pessoal',
    description: 'Preciso para desenvolver um projeto próprio',
  },
  {
    value: 'personal_satisfaction',
    label: 'Satisfação pessoal',
    description: 'Quero aprender por interesse e crescimento pessoal',
  },
];

// ============================================================================
// WEEKLY HOURS OPTIONS
// ============================================================================

export const WEEKLY_HOURS_OPTIONS = [
  { value: 2, label: '2 horas/semana', description: 'Ritmo tranquilo' },
  { value: 4, label: '4 horas/semana', description: 'Ritmo moderado' },
  { value: 6, label: '6 horas/semana', description: 'Ritmo acelerado' },
  { value: 8, label: '8 horas/semana', description: 'Ritmo intenso' },
  { value: 10, label: '10+ horas/semana', description: 'Ritmo muito intenso' },
];

// ============================================================================
// DEADLINE OPTIONS
// ============================================================================

export const DEADLINE_OPTIONS = [
  { value: 4, label: '1 mês', description: '4 semanas' },
  { value: 8, label: '2 meses', description: '8 semanas' },
  { value: 12, label: '3 meses', description: '12 semanas' },
  { value: 24, label: '6 meses', description: '24 semanas' },
  { value: 52, label: '1 ano', description: '52 semanas' },
];

// ============================================================================
// CONVERSATION STEPS CONFIGURATION
// ============================================================================

export const CONVERSATION_STEPS: Record<ConversationStep, { order: number; label: string }> = {
  welcome: { order: 0, label: 'Bem-vindo' },
  skill_selection: { order: 1, label: 'Habilidade' },
  current_level: { order: 2, label: 'Nível Atual' },
  target_level: { order: 3, label: 'Nível Desejado' },
  time_availability: { order: 4, label: 'Tempo Disponível' },
  deadline: { order: 5, label: 'Prazo' },
  motivation: { order: 6, label: 'Motivação' },
  review: { order: 7, label: 'Revisão' },
  generating: { order: 8, label: 'Gerando' },
  result: { order: 9, label: 'Resultado' },
};

// ============================================================================
// POPULAR SKILLS (FOR SUGGESTIONS)
// ============================================================================

export const POPULAR_SKILLS = {
  technology: [
    'Python',
    'JavaScript',
    'React',
    'SQL',
    'Java',
    'Node.js',
    'TypeScript',
    'Git',
    'Docker',
    'AWS',
  ],
  language: [
    'Inglês',
    'Espanhol',
    'Francês',
    'Alemão',
    'Mandarim',
  ],
  soft_skill: [
    'Liderança',
    'Comunicação',
    'Oratória',
    'Gestão de Tempo',
    'Trabalho em Equipe',
    'Negociação',
    'Inteligência Emocional',
  ],
  tool: [
    'Excel Avançado',
    'Power BI',
    'Figma',
    'Photoshop',
    'Google Analytics',
    'Salesforce',
    'AutoCAD',
  ],
  business: [
    'Marketing Digital',
    'Gestão de Projetos',
    'Análise de Dados',
    'Vendas',
    'Empreendedorismo',
  ],
};

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_STUDY_PLAN_PROFILE: Omit<StudyPlanProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  plan_name: '',
  skill_name: '',
  skill_category: 'technology',
  current_level: 'none',
  target_level: 'intermediate',
  weekly_hours: 4,
  deadline_weeks: 12,
  deadline_date: '',
  motivation: 'personal_satisfaction',
  is_active: true,
  is_favorite: false,
};

export const DEFAULT_STUDY_PLAN_DATA = {
  profile: null,
  generatedPlan: null,
  progress: null,
  currentStep: 'welcome' as ConversationStep,
  conversationHistory: [],
};

// ============================================================================
// RESOURCE TYPE LABELS
// ============================================================================

export const RESOURCE_TYPE_LABELS = {
  video: { label: 'Vídeo', icon: '🎥', color: 'text-red-400' },
  article: { label: 'Artigo', icon: '📄', color: 'text-blue-400' },
  practice: { label: 'Prática', icon: '💻', color: 'text-green-400' },
  project: { label: 'Projeto', icon: '🚀', color: 'text-purple-400' },
  book: { label: 'Livro', icon: '📚', color: 'text-yellow-400' },
  course: { label: 'Curso', icon: '🎓', color: 'text-indigo-400' },
};

// ============================================================================
// ACTION VERBS FOR AI PROMPTS
// ============================================================================

export const ACTION_VERBS_PT = [
  'Aprender',
  'Praticar',
  'Dominar',
  'Estudar',
  'Desenvolver',
  'Implementar',
  'Criar',
  'Analisar',
  'Revisar',
  'Aplicar',
];

export const ACTION_VERBS_EN = [
  'Learn',
  'Practice',
  'Master',
  'Study',
  'Develop',
  'Implement',
  'Create',
  'Analyze',
  'Review',
  'Apply',
];
