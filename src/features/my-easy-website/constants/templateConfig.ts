/**
 * Configuração de Templates para MyEasyWebsite
 * 
 * Define o mapeamento entre templates e áreas de atuação,
 * permitindo seleção automática baseada nas respostas do usuário.
 */

export interface TemplateConfig {
  id: number;
  name: string;
  theme: string;
  description: string;
  keywords: string[];
  areas: string[];
  vibes: string[];
  fonts: {
    heading: string;
    body: string;
  };
  bestFor: string[];
}

/**
 * Configuração completa de todos os templates disponíveis
 */
export const TEMPLATE_CONFIGS: TemplateConfig[] = [
  {
    id: 1,
    name: 'Original',
    theme: 'classic',
    description: 'Template versátil para qualquer tipo de negócio',
    keywords: ['geral', 'versátil', 'profissional', 'corporativo', 'padrão'],
    areas: ['services', 'retail', 'technology', 'food', 'health', 'education'],
    vibes: ['vibrant', 'corporate', 'dark'],
    fonts: { heading: 'Playfair Display', body: 'Poppins' },
    bestFor: ['Negócios em geral', 'Serviços profissionais', 'Empresas tradicionais'],
  },
  {
    id: 2,
    name: 'Minimalista',
    theme: 'minimal',
    description: 'Design limpo e moderno para serviços profissionais',
    keywords: ['minimalista', 'moderno', 'clean', 'consultoria', 'escritório', 'advogado', 'contador', 'arquitetura'],
    areas: ['services', 'technology'],
    vibes: ['light', 'elegant', 'corporate'],
    fonts: { heading: 'Space Grotesk', body: 'Inter' },
    bestFor: ['Consultoria', 'Advocacia', 'Arquitetura', 'Design', 'Escritórios'],
  },
  {
    id: 3,
    name: 'Natureza',
    theme: 'nature',
    description: 'Perfeito para negócios eco-friendly e sustentáveis',
    keywords: ['natureza', 'eco', 'sustentável', 'orgânico', 'verde', 'plantas', 'jardim', 'floricultura', 'ambiental'],
    areas: ['food', 'health', 'services'],
    vibes: ['light', 'elegant'],
    fonts: { heading: 'Cormorant Garamond', body: 'Nunito' },
    bestFor: ['Produtos orgânicos', 'Floriculturas', 'Jardinagem', 'Alimentos naturais', 'ONGs ambientais'],
  },
  {
    id: 4,
    name: 'Tech',
    theme: 'tech',
    description: 'Moderno e tecnológico para startups e empresas de TI',
    keywords: ['tecnologia', 'tech', 'startup', 'software', 'app', 'desenvolvimento', 'programação', 'digital', 'inovação', 'IA', 'SaaS'],
    areas: ['technology'],
    vibes: ['dark', 'vibrant', 'corporate'],
    fonts: { heading: 'JetBrains Mono', body: 'Inter' },
    bestFor: ['Startups', 'Software houses', 'Agências digitais', 'Desenvolvedores', 'TI'],
  },
  {
    id: 5,
    name: 'Luxo',
    theme: 'luxury',
    description: 'Elegante e sofisticado para marcas premium',
    keywords: ['luxo', 'premium', 'sofisticado', 'elegante', 'alto padrão', 'joias', 'relojoaria', 'moda', 'boutique', 'exclusivo'],
    areas: ['retail', 'services'],
    vibes: ['elegant', 'dark'],
    fonts: { heading: 'Cinzel', body: 'Montserrat' },
    bestFor: ['Joalherias', 'Boutiques', 'Moda de luxo', 'Hotéis premium', 'Restaurantes finos'],
  },
  {
    id: 6,
    name: 'Kids',
    theme: 'kids',
    description: 'Colorido e divertido para negócios infantis',
    keywords: ['infantil', 'crianças', 'kids', 'brinquedos', 'escola', 'creche', 'festas', 'parque', 'diversão', 'educação infantil'],
    areas: ['education', 'services', 'retail'],
    vibes: ['fun', 'vibrant', 'light'],
    fonts: { heading: 'Fredoka One', body: 'Nunito' },
    bestFor: ['Escolas infantis', 'Lojas de brinquedos', 'Buffets infantis', 'Parques', 'Creches'],
  },
  {
    id: 7,
    name: 'Industrial',
    theme: 'industrial',
    description: 'Robusto e profissional para indústria e construção',
    keywords: ['industrial', 'construção', 'indústria', 'fábrica', 'engenharia', 'metal', 'máquinas', 'equipamentos', 'obra'],
    areas: ['services', 'retail'],
    vibes: ['dark', 'corporate'],
    fonts: { heading: 'Bebas Neue', body: 'Roboto' },
    bestFor: ['Construtoras', 'Indústrias', 'Engenharia', 'Metalúrgicas', 'Equipamentos'],
  },
  {
    id: 8,
    name: 'Vintage',
    theme: 'vintage',
    description: 'Clássico e nostálgico para negócios tradicionais',
    keywords: ['vintage', 'retrô', 'clássico', 'tradicional', 'artesanal', 'café', 'padaria', 'antiguidades', 'barbearia'],
    areas: ['food', 'services', 'retail'],
    vibes: ['elegant', 'light'],
    fonts: { heading: 'Playfair Display', body: 'Lora' },
    bestFor: ['Cafeterias', 'Padarias artesanais', 'Barbearias', 'Antiquários', 'Restaurantes tradicionais'],
  },
  {
    id: 9,
    name: 'Fitness',
    theme: 'fitness',
    description: 'Dinâmico e energético para academias e esportes',
    keywords: ['fitness', 'academia', 'esporte', 'gym', 'treino', 'musculação', 'crossfit', 'personal', 'saúde', 'nutrição esportiva'],
    areas: ['health', 'services'],
    vibes: ['vibrant', 'dark', 'fun'],
    fonts: { heading: 'Anton', body: 'Barlow' },
    bestFor: ['Academias', 'Personal trainers', 'CrossFit', 'Esportes', 'Nutrição esportiva'],
  },
  {
    id: 10,
    name: 'Zen',
    theme: 'zen',
    description: 'Tranquilo e relaxante para bem-estar e spa',
    keywords: ['zen', 'spa', 'relaxamento', 'meditação', 'yoga', 'massagem', 'bem-estar', 'terapia', 'holístico', 'estética'],
    areas: ['health', 'services'],
    vibes: ['light', 'elegant'],
    fonts: { heading: 'Cormorant Garamond', body: 'Quicksand' },
    bestFor: ['Spas', 'Clínicas de estética', 'Yoga', 'Meditação', 'Terapias holísticas'],
  },
  {
    id: 11,
    name: 'Criativo',
    theme: 'creative',
    description: 'Ousado e artístico para agências e designers',
    keywords: ['criativo', 'design', 'arte', 'agência', 'publicidade', 'marketing', 'fotografia', 'vídeo', 'branding', 'portfolio'],
    areas: ['services', 'technology'],
    vibes: ['vibrant', 'fun', 'dark'],
    fonts: { heading: 'Space Grotesk', body: 'DM Sans' },
    bestFor: ['Agências de publicidade', 'Estúdios de design', 'Fotógrafos', 'Videomakers', 'Artistas'],
  },
];

/**
 * Mapeamento de áreas do chat para valores do sistema
 */
export const AREA_MAPPING: Record<string, string[]> = {
  technology: ['tecnologia', 'tech', 'software', 'app', 'startup', 'ti', 'desenvolvimento'],
  retail: ['varejo', 'loja', 'comércio', 'vendas', 'e-commerce', 'produtos'],
  services: ['serviços', 'consultoria', 'prestação de serviços', 'profissional'],
  food: ['alimentação', 'restaurante', 'comida', 'gastronomia', 'café', 'padaria', 'bar'],
  health: ['saúde', 'clínica', 'médico', 'dentista', 'academia', 'bem-estar', 'estética'],
  education: ['educação', 'escola', 'curso', 'ensino', 'treinamento', 'capacitação'],
};

/**
 * Mapeamento de vibes para valores do sistema
 */
export const VIBE_MAPPING: Record<string, string[]> = {
  light: ['claro', 'light', 'suave', 'clean'],
  dark: ['escuro', 'dark', 'noturno', 'moderno'],
  vibrant: ['vibrante', 'vibrant', 'colorido', 'energético'],
  corporate: ['corporativo', 'corporate', 'profissional', 'empresarial'],
  fun: ['divertido', 'fun', 'alegre', 'descontraído'],
  elegant: ['elegante', 'elegant', 'sofisticado', 'luxuoso'],
};

/**
 * Palavras-chave específicas que indicam templates diretamente
 */
export const DIRECT_KEYWORD_MAPPING: Record<string, number> = {
  // Template 4 - Tech
  'startup': 4,
  'software': 4,
  'aplicativo': 4,
  'app': 4,
  'saas': 4,
  'tecnologia da informação': 4,
  
  // Template 5 - Luxo
  'joalheria': 5,
  'joias': 5,
  'relojoaria': 5,
  'boutique': 5,
  'alto padrão': 5,
  
  // Template 6 - Kids
  'creche': 6,
  'escola infantil': 6,
  'buffet infantil': 6,
  'brinquedos': 6,
  'parque infantil': 6,
  
  // Template 7 - Industrial
  'construtora': 7,
  'indústria': 7,
  'fábrica': 7,
  'metalúrgica': 7,
  'engenharia civil': 7,
  
  // Template 8 - Vintage
  'barbearia': 8,
  'antiquário': 8,
  'café retrô': 8,
  'padaria artesanal': 8,
  
  // Template 9 - Fitness
  'academia': 9,
  'crossfit': 9,
  'personal trainer': 9,
  'musculação': 9,
  'gym': 9,
  
  // Template 10 - Zen
  'spa': 10,
  'yoga': 10,
  'meditação': 10,
  'terapia holística': 10,
  'massagem': 10,
  'estética': 10,
  
  // Template 11 - Criativo
  'agência de publicidade': 11,
  'estúdio de design': 11,
  'fotógrafo': 11,
  'videomaker': 11,
  'branding': 11,
  
  // Template 3 - Natureza
  'floricultura': 3,
  'jardinagem': 3,
  'produtos orgânicos': 3,
  'sustentável': 3,
  'eco': 3,
  
  // Template 2 - Minimalista
  'advocacia': 2,
  'escritório de advocacia': 2,
  'contabilidade': 2,
  'arquitetura': 2,
  'consultoria empresarial': 2,
};

/**
 * Template padrão quando não houver correspondência clara
 */
export const DEFAULT_TEMPLATE_ID = 1;

/**
 * Obtém a configuração de um template pelo ID
 */
export function getTemplateById(id: number): TemplateConfig | undefined {
  return TEMPLATE_CONFIGS.find(t => t.id === id);
}

/**
 * Obtém todos os templates para uma área específica
 */
export function getTemplatesForArea(area: string): TemplateConfig[] {
  return TEMPLATE_CONFIGS.filter(t => t.areas.includes(area));
}

/**
 * Obtém todos os templates para um vibe específico
 */
export function getTemplatesForVibe(vibe: string): TemplateConfig[] {
  return TEMPLATE_CONFIGS.filter(t => t.vibes.includes(vibe));
}
