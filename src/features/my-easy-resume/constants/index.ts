import type { CareerLevel, TemplateStyle, ResumeLanguage, ConversationStep } from '../types';

// Career Levels
export const CAREER_LEVELS: { value: CareerLevel; label: string; description: string }[] = [
  {
    value: 'entry',
    label: 'Iniciante',
    description: '0-2 anos de experiência',
  },
  {
    value: 'mid',
    label: 'Pleno',
    description: '3-5 anos de experiência',
  },
  {
    value: 'senior',
    label: 'Sênior',
    description: '6+ anos de experiência',
  },
  {
    value: 'executive',
    label: 'Executivo',
    description: 'C-Level, VP, Director',
  },
];

// Template Styles
export const TEMPLATE_STYLES: { value: TemplateStyle; label: string; description: string }[] = [
  {
    value: 'ats',
    label: 'ATS-Friendly',
    description: 'Otimizado para sistemas de recrutamento (Recomendado)',
  },
  {
    value: 'modern',
    label: 'Moderno',
    description: 'Design contemporâneo e clean',
  },
  {
    value: 'traditional',
    label: 'Tradicional',
    description: 'Formato clássico e conservador',
  },
  {
    value: 'creative',
    label: 'Criativo',
    description: 'Para áreas criativas e design',
  },
];

// Languages
export const RESUME_LANGUAGES: { value: ResumeLanguage; label: string; flag: string }[] = [
  {
    value: 'pt-BR',
    label: 'Português (Brasil)',
    flag: '🇧🇷',
  },
  {
    value: 'en-US',
    label: 'English (US)',
    flag: '🇺🇸',
  },
  {
    value: 'es-ES',
    label: 'Español',
    flag: '🇪🇸',
  },
];

// Industries
export const INDUSTRIES = [
  'Tecnologia',
  'Finanças',
  'Saúde',
  'Educação',
  'Varejo',
  'Consultoria',
  'Marketing',
  'Vendas',
  'Recursos Humanos',
  'Engenharia',
  'Advocacia',
  'Contabilidade',
  'Design',
  'Mídia',
  'Hotelaria',
  'Logística',
  'Manufatura',
  'Construção',
  'Agricultura',
  'Outro',
];

// Skill Categories
export const SKILL_CATEGORIES = [
  { value: 'technical', label: 'Técnicas' },
  { value: 'soft', label: 'Comportamentais' },
  { value: 'language', label: 'Idiomas' },
  { value: 'tool', label: 'Ferramentas' },
] as const;

// Language Proficiency Levels
export const LANGUAGE_PROFICIENCY = [
  { value: 'basic', label: 'Básico' },
  { value: 'intermediate', label: 'Intermediário' },
  { value: 'advanced', label: 'Avançado' },
  { value: 'fluent', label: 'Fluente' },
  { value: 'native', label: 'Nativo' },
] as const;

// Skill Levels
export const SKILL_LEVELS = [
  { value: 'beginner', label: 'Iniciante' },
  { value: 'intermediate', label: 'Intermediário' },
  { value: 'advanced', label: 'Avançado' },
  { value: 'expert', label: 'Especialista' },
] as const;

// Conversation Steps Configuration
export const CONVERSATION_STEPS: Record<ConversationStep, { order: number; label: string }> = {
  welcome: { order: 0, label: 'Bem-vindo' },
  career_level: { order: 1, label: 'Nível de Carreira' },
  target_role: { order: 2, label: 'Cargo Desejado' },
  industry: { order: 3, label: 'Indústria' },
  template_style: { order: 4, label: 'Estilo do Template' },
  language: { order: 5, label: 'Idioma' },
  personal_info: { order: 6, label: 'Nome Completo' },
  contact_email: { order: 7, label: 'E-mail' },
  contact_phone: { order: 8, label: 'Telefone' },
  contact_location: { order: 9, label: 'Localização' },
  contact_links: { order: 10, label: 'Links Profissionais' },
  experience_input: { order: 11, label: 'Experiências' },
  education_input: { order: 12, label: 'Educação' },
  skills_input: { order: 13, label: 'Habilidades' },
  review: { order: 14, label: 'Revisão' },
  generating: { order: 15, label: 'Gerando' },
  result: { order: 16, label: 'Resultado' },
};

// Default Values
export const DEFAULT_PERSONAL_INFO = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  linkedinUrl: '',
  portfolioUrl: '',
  githubUrl: '',
};

export const DEFAULT_RESUME_DATA = {
  profile: null,
  personalInfo: DEFAULT_PERSONAL_INFO,
  experiences: [],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
  projects: [],
  professionalSummary: '',
  generatedResume: null,
  currentStep: 'welcome' as ConversationStep,
  conversationHistory: [],
};

// Action Verbs for Experience Descriptions (PT-BR)
export const ACTION_VERBS_PT = [
  'Desenvolveu',
  'Implementou',
  'Liderou',
  'Gerenciou',
  'Criou',
  'Otimizou',
  'Aumentou',
  'Reduziu',
  'Melhorou',
  'Coordenou',
  'Planejou',
  'Executou',
  'Analisou',
  'Projetou',
  'Colaborou',
  'Integrou',
  'Automatizou',
  'Estabeleceu',
  'Organizou',
  'Supervisionou',
];

// Action Verbs for Experience Descriptions (EN-US)
export const ACTION_VERBS_EN = [
  'Developed',
  'Implemented',
  'Led',
  'Managed',
  'Created',
  'Optimized',
  'Increased',
  'Reduced',
  'Improved',
  'Coordinated',
  'Planned',
  'Executed',
  'Analyzed',
  'Designed',
  'Collaborated',
  'Integrated',
  'Automated',
  'Established',
  'Organized',
  'Supervised',
];

// Common Tech Skills (for suggestions)
export const COMMON_TECH_SKILLS = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'React',
  'Node.js',
  'SQL',
  'Git',
  'AWS',
  'Docker',
  'Kubernetes',
  'REST API',
  'GraphQL',
  'Agile',
  'Scrum',
  'CI/CD',
  'MongoDB',
  'PostgreSQL',
  'HTML/CSS',
  'Vue.js',
  'Angular',
  'Next.js',
  'Express.js',
  'Django',
  'Flask',
  'Spring Boot',
  '.NET',
  'C#',
  'Go',
  'Rust',
];

// Common Soft Skills (for suggestions)
export const COMMON_SOFT_SKILLS = [
  'Liderança',
  'Comunicação',
  'Trabalho em Equipe',
  'Resolução de Problemas',
  'Pensamento Crítico',
  'Criatividade',
  'Adaptabilidade',
  'Gestão de Tempo',
  'Organização',
  'Atenção aos Detalhes',
  'Proatividade',
  'Negociação',
  'Empatia',
  'Inteligência Emocional',
  'Tomada de Decisão',
];
