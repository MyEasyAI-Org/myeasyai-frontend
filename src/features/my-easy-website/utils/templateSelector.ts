/**
 * Template Selector - Seleção Inteligente de Templates
 * 
 * Este módulo implementa a lógica de seleção automática de templates
 * baseada nas respostas do usuário durante o chat.
 */

import {
  TEMPLATE_CONFIGS,
  DIRECT_KEYWORD_MAPPING,
  DEFAULT_TEMPLATE_ID,
  getTemplateById,
  type TemplateConfig,
} from '../constants/templateConfig';

/**
 * Interface para os dados coletados do usuário
 */
export interface UserSiteData {
  area: string;
  name: string;
  slogan: string;
  description: string;
  vibe: string;
  services: string[];
  [key: string]: any;
}

/**
 * Interface para o resultado da seleção de template
 */
export interface TemplateSelectionResult {
  templateId: number;
  template: TemplateConfig;
  confidence: number; // 0-100
  matchReasons: string[];
  alternativeTemplates: TemplateConfig[];
}

/**
 * Normaliza texto para comparação (remove acentos, lowercase)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Verifica se há correspondência direta por palavras-chave específicas
 */
function checkDirectKeywordMatch(userData: UserSiteData): number | null {
  const textsToCheck = [
    userData.area,
    userData.name,
    userData.description,
    userData.slogan,
    ...userData.services,
  ].filter(Boolean);

  const combinedText = normalizeText(textsToCheck.join(' '));

  // Verificar cada palavra-chave direta
  for (const [keyword, templateId] of Object.entries(DIRECT_KEYWORD_MAPPING)) {
    const normalizedKeyword = normalizeText(keyword);
    if (combinedText.includes(normalizedKeyword)) {
      return templateId;
    }
  }

  return null;
}

/**
 * Calcula pontuação de correspondência para um template
 */
function calculateTemplateScore(
  template: TemplateConfig,
  userData: UserSiteData
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  const textsToCheck = [
    userData.area,
    userData.name,
    userData.description,
    userData.slogan,
    ...userData.services,
  ].filter(Boolean);

  const combinedText = normalizeText(textsToCheck.join(' '));

  // 1. Verificar correspondência de área (peso: 30)
  if (template.areas.includes(userData.area)) {
    score += 30;
    reasons.push(`Área de atuação compatível: ${userData.area}`);
  }

  // 2. Verificar correspondência de vibe (peso: 20)
  if (userData.vibe && template.vibes.includes(userData.vibe)) {
    score += 20;
    reasons.push(`Estilo visual compatível: ${userData.vibe}`);
  }

  // 3. Verificar palavras-chave do template (peso: 5 cada, máx 30)
  let keywordMatches = 0;
  for (const keyword of template.keywords) {
    const normalizedKeyword = normalizeText(keyword);
    if (combinedText.includes(normalizedKeyword)) {
      keywordMatches++;
      if (keywordMatches <= 6) {
        score += 5;
      }
    }
  }
  if (keywordMatches > 0) {
    reasons.push(`${keywordMatches} palavras-chave correspondentes`);
  }

  // 4. Verificar "bestFor" do template (peso: 10 cada, máx 20)
  let bestForMatches = 0;
  for (const bestFor of template.bestFor) {
    const normalizedBestFor = normalizeText(bestFor);
    if (combinedText.includes(normalizedBestFor)) {
      bestForMatches++;
      if (bestForMatches <= 2) {
        score += 10;
      }
    }
  }
  if (bestForMatches > 0) {
    reasons.push(`Indicado para: ${template.bestFor.slice(0, 2).join(', ')}`);
  }

  return { score, reasons };
}

/**
 * Seleciona o melhor template baseado nos dados do usuário
 */
export function selectBestTemplate(userData: UserSiteData): TemplateSelectionResult {
  // 1. Primeiro, verificar correspondência direta por palavras-chave
  const directMatch = checkDirectKeywordMatch(userData);
  if (directMatch) {
    const template = getTemplateById(directMatch);
    if (template) {
      // Encontrar alternativas
      const alternatives = TEMPLATE_CONFIGS
        .filter(t => t.id !== directMatch && t.areas.includes(userData.area))
        .slice(0, 2);

      return {
        templateId: directMatch,
        template,
        confidence: 95,
        matchReasons: [`Correspondência direta por tipo de negócio`],
        alternativeTemplates: alternatives,
      };
    }
  }

  // 2. Calcular pontuação para todos os templates
  const scoredTemplates = TEMPLATE_CONFIGS.map(template => ({
    template,
    ...calculateTemplateScore(template, userData),
  })).sort((a, b) => b.score - a.score);

  // 3. Selecionar o melhor template
  const best = scoredTemplates[0];
  const alternatives = scoredTemplates.slice(1, 3).map(s => s.template);

  // 4. Calcular confiança baseada na pontuação
  // Pontuação máxima possível: 30 (área) + 20 (vibe) + 30 (keywords) + 20 (bestFor) = 100
  const confidence = Math.min(best.score, 100);

  // 5. Se a pontuação for muito baixa, usar template padrão
  if (best.score < 20) {
    const defaultTemplate = getTemplateById(DEFAULT_TEMPLATE_ID)!;
    return {
      templateId: DEFAULT_TEMPLATE_ID,
      template: defaultTemplate,
      confidence: 50,
      matchReasons: ['Template versátil para seu tipo de negócio'],
      alternativeTemplates: alternatives,
    };
  }

  return {
    templateId: best.template.id,
    template: best.template,
    confidence,
    matchReasons: best.reasons,
    alternativeTemplates: alternatives,
  };
}

/**
 * Obtém sugestões de templates baseado apenas na área
 */
export function getTemplateSuggestionsForArea(area: string): TemplateConfig[] {
  return TEMPLATE_CONFIGS
    .filter(t => t.areas.includes(area))
    .sort((a, b) => {
      // Priorizar templates mais específicos para a área
      const aSpecificity = a.areas.length;
      const bSpecificity = b.areas.length;
      return aSpecificity - bSpecificity;
    });
}

/**
 * Obtém sugestões de templates baseado na área e vibe
 */
export function getTemplateSuggestionsForAreaAndVibe(
  area: string,
  vibe: string
): TemplateConfig[] {
  return TEMPLATE_CONFIGS
    .filter(t => t.areas.includes(area) && t.vibes.includes(vibe))
    .sort((a, b) => {
      // Priorizar templates mais específicos
      const aSpecificity = a.areas.length + a.vibes.length;
      const bSpecificity = b.areas.length + b.vibes.length;
      return aSpecificity - bSpecificity;
    });
}

/**
 * Mapeia área do chat para valor do sistema
 */
export function mapChatAreaToSystem(chatArea: string): string {
  const areaMapping: Record<string, string> = {
    'Tecnologia': 'technology',
    'technology': 'technology',
    'Varejo': 'retail',
    'retail': 'retail',
    'Serviços': 'services',
    'services': 'services',
    'Alimentação': 'food',
    'food': 'food',
    'Saúde': 'health',
    'health': 'health',
    'Educação': 'education',
    'education': 'education',
  };

  return areaMapping[chatArea] || 'services';
}

/**
 * Mapeia vibe do chat para valor do sistema
 */
export function mapChatVibeToSystem(chatVibe: string): string {
  const vibeMapping: Record<string, string> = {
    'light': 'light',
    'dark': 'dark',
    'vibrant': 'vibrant',
    'corporate': 'corporate',
    'fun': 'fun',
    'elegant': 'elegant',
  };

  return vibeMapping[chatVibe] || 'vibrant';
}

/**
 * Gera descrição amigável do template selecionado
 */
export function getTemplateDescription(templateId: number): string {
  const template = getTemplateById(templateId);
  if (!template) return 'Template padrão';

  return `${template.name} - ${template.description}\n\n` +
    `Ideal para: ${template.bestFor.join(', ')}\n` +
    `Fontes: ${template.fonts.heading} + ${template.fonts.body}`;
}

/**
 * Verifica se um template é adequado para uma combinação específica
 */
export function isTemplateGoodFit(
  templateId: number,
  area: string,
  vibe?: string
): boolean {
  const template = getTemplateById(templateId);
  if (!template) return false;

  const areaMatch = template.areas.includes(area);
  const vibeMatch = !vibe || template.vibes.includes(vibe);

  return areaMatch && vibeMatch;
}
