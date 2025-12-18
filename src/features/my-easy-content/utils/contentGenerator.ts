/**
 * Content Generation Utilities
 *
 * Functions for generating social media content using AI.
 */

import type {
  BusinessNiche,
  CalendarEntry,
  ContentGenerationRequest,
  ContentIdea,
  ContentTone,
  ContentType,
  GeneratedContent,
  SocialNetwork,
} from '../types';
import {
  DEFAULT_BEST_TIMES,
  HASHTAG_SUGGESTIONS,
  SOCIAL_NETWORKS,
} from '../constants';

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get network display name
 */
export function getNetworkName(network: SocialNetwork): string {
  const config = SOCIAL_NETWORKS.find((n) => n.id === network);
  return config?.name || network;
}

/**
 * Get best posting times for a network
 */
export function getBestTimes(network: SocialNetwork) {
  return DEFAULT_BEST_TIMES[network] || [];
}

/**
 * Get suggested hashtags for a niche
 */
export function getHashtagsForNiche(niche: BusinessNiche): string[] {
  return HASHTAG_SUGGESTIONS[niche] || HASHTAG_SUGGESTIONS.other;
}

/**
 * Format content for display
 */
export function formatContentForDisplay(content: GeneratedContent): string {
  let formatted = content.content;

  if (content.hashtags && content.hashtags.length > 0) {
    formatted += '\n\n' + content.hashtags.join(' ');
  }

  return formatted;
}

/**
 * Build prompt for AI content generation
 */
export function buildContentPrompt(
  request: ContentGenerationRequest,
  businessInfo: {
    name: string;
    niche: BusinessNiche;
    audience: string;
    tone: ContentTone;
  },
): string {
  const networkName = getNetworkName(request.network);
  const maxChars =
    SOCIAL_NETWORKS.find((n) => n.id === request.network)?.maxChars || 2000;

  const toneDescriptions: Record<ContentTone, string> = {
    professional: 'profissional e corporativo',
    casual: 'casual e amigavel',
    funny: 'divertido e com humor',
    inspirational: 'inspiracional e motivador',
    educational: 'educativo e informativo',
    promotional: 'promocional focado em vendas',
  };

  const contentTypePrompts: Record<ContentType, string> = {
    feed_post: `Crie um post completo para o feed do ${networkName}`,
    caption: `Crie uma legenda envolvente para ${networkName}`,
    story: `Crie um roteiro de sequencia de stories (3-5 stories) para ${networkName}`,
    reel: `Crie um roteiro de video curto (Reel/TikTok) com gancho, desenvolvimento e CTA`,
    calendar: `Crie um calendario editorial para o mes`,
    ideas: `Sugira 5-10 ideias de conteudo`,
    hashtags: `Sugira 15-20 hashtags relevantes`,
    best_times: `Indique os melhores horarios para postar`,
  };

  let prompt = `Voce e um especialista em marketing de conteudo para redes sociais.

INFORMACOES DO NEGOCIO:
- Nome: ${businessInfo.name}
- Nicho: ${businessInfo.niche}
- Publico-alvo: ${businessInfo.audience}
- Tom de voz: ${toneDescriptions[businessInfo.tone]}

REDE SOCIAL: ${networkName}
LIMITE DE CARACTERES: ${maxChars}

TAREFA: ${contentTypePrompts[request.contentType]}

TEMA/ASSUNTO: ${request.topic}
${request.objective ? `OBJETIVO: ${request.objective}` : ''}

INSTRUCOES:
1. Use o tom de voz especificado
2. Seja relevante para o publico-alvo
3. Respeite o limite de caracteres da rede
4. Use emojis de forma moderada e estrategica
`;

  if (request.includeHashtags) {
    prompt += '5. Inclua hashtags relevantes ao final\n';
  }

  if (request.includeImageDescription) {
    prompt += '6. Descreva a imagem ou visual ideal para acompanhar o post\n';
  }

  if (request.includeBestTime) {
    prompt +=
      '7. Sugira o melhor horario para publicar baseado em dados de engajamento\n';
  }

  if (request.generateVariations && request.variationCount) {
    prompt += `8. Crie ${request.variationCount} variacoes diferentes do conteudo\n`;
  }

  return prompt;
}

/**
 * Parse AI response into GeneratedContent
 */
export function parseGeneratedContent(
  aiResponse: string,
  request: ContentGenerationRequest,
): GeneratedContent {
  // Extract hashtags from response
  const hashtagMatch = aiResponse.match(/#\w+/g);
  const hashtags = hashtagMatch ? [...new Set(hashtagMatch)] : [];

  // Extract image description if present
  let imageDescription: string | undefined;
  const imageMatch = aiResponse.match(
    /(?:IMAGEM|VISUAL|DESCRICAO DA IMAGEM):\s*(.+?)(?:\n\n|\n(?=[A-Z])|$)/is,
  );
  if (imageMatch) {
    imageDescription = imageMatch[1].trim();
  }

  // Extract best time if present
  let bestTime: string | undefined;
  const timeMatch = aiResponse.match(
    /(?:HORARIO|MELHOR HORARIO|POSTAR AS):\s*(.+?)(?:\n|$)/i,
  );
  if (timeMatch) {
    bestTime = timeMatch[1].trim();
  }

  // Extract variations if present
  let variations: string[] | undefined;
  const variationMatches = aiResponse.match(
    /(?:VARIACAO|OPCAO|ALTERNATIVA)\s*\d+:\s*([\s\S]+?)(?=(?:VARIACAO|OPCAO|ALTERNATIVA)\s*\d+:|$)/gi,
  );
  if (variationMatches && variationMatches.length > 1) {
    variations = variationMatches.map((v) =>
      v.replace(/(?:VARIACAO|OPCAO|ALTERNATIVA)\s*\d+:\s*/i, '').trim(),
    );
  }

  // Clean main content (remove metadata sections)
  let cleanContent = aiResponse
    .replace(
      /(?:IMAGEM|VISUAL|DESCRICAO DA IMAGEM):\s*.+?(?:\n\n|\n(?=[A-Z])|$)/gis,
      '',
    )
    .replace(/(?:HORARIO|MELHOR HORARIO|POSTAR AS):\s*.+?(?:\n|$)/gi, '')
    .replace(
      /(?:VARIACAO|OPCAO|ALTERNATIVA)\s*\d+:\s*[\s\S]+?(?=(?:VARIACAO|OPCAO|ALTERNATIVA)\s*\d+:|$)/gi,
      '',
    )
    .trim();

  // If we have variations, use first one as main content
  if (variations && variations.length > 0) {
    cleanContent = variations[0];
    variations = variations.slice(1);
  }

  return {
    id: generateId(),
    type: request.contentType,
    network: request.network,
    title: request.topic,
    content: cleanContent,
    hashtags: hashtags.length > 0 ? hashtags : undefined,
    imageDescription,
    bestTime,
    variations: variations && variations.length > 0 ? variations : undefined,
    createdAt: new Date(),
  };
}

/**
 * Generate editorial calendar entries
 */
export function generateCalendarEntries(
  month: Date,
  networks: SocialNetwork[],
  niche: BusinessNiche,
  postsPerWeek: number = 3,
): CalendarEntry[] {
  const entries: CalendarEntry[] = [];
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();

  const contentTypes: ContentType[] = [
    'feed_post',
    'story',
    'reel',
    'feed_post',
  ];
  const dayNames = [
    'Domingo',
    'Segunda',
    'Terca',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sabado',
  ];

  // Distribute posts across the month
  const postsPerMonth = postsPerWeek * 4;
  const interval = Math.floor(daysInMonth / postsPerMonth);

  let postIndex = 0;
  for (let day = 1; day <= daysInMonth && postIndex < postsPerMonth; day++) {
    if (day % interval === 0 || postIndex === 0) {
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      const dayOfWeek = dayNames[date.getDay()];
      const network = networks[postIndex % networks.length];
      const contentType = contentTypes[postIndex % contentTypes.length];
      const bestTimes = getBestTimes(network);
      const bestTimeForDay = bestTimes.find((t) => t.day === dayOfWeek);

      entries.push({
        id: generateId(),
        date,
        dayOfWeek,
        network,
        contentType,
        title: `Post ${postIndex + 1}`,
        description: '',
        hashtags: getHashtagsForNiche(niche).slice(0, 5),
        bestTime: bestTimeForDay?.time || '10:00',
        status: 'planned',
      });

      postIndex++;
    }
  }

  return entries;
}

/**
 * Generate content ideas based on niche
 */
export function generateContentIdeas(
  niche: BusinessNiche,
  networks: SocialNetwork[],
): ContentIdea[] {
  const ideaTemplates: Record<BusinessNiche, string[]> = {
    restaurant: [
      'Bastidores da cozinha',
      'Receita do dia',
      'Depoimento de cliente',
      'Novidade no cardapio',
      'Historia do prato',
      'Time da cozinha',
      'Promocao especial',
      'Dica de harmonizacao',
    ],
    retail: [
      'Lancamento de produto',
      'Look do dia',
      'Dica de estilo',
      'Promocao relampago',
      'Cliente usando produto',
      'Bastidores da loja',
      'Tendencia da estacao',
      'Guia de compras',
    ],
    consulting: [
      'Dica profissional',
      'Case de sucesso',
      'Erro comum no mercado',
      'Tendencia do setor',
      'Resposta a duvida frequente',
      'Bastidores do trabalho',
      'Ferramenta util',
      'Reflexao do dia',
    ],
    health: [
      'Dica de saude',
      'Mito vs Verdade',
      'Cuidado preventivo',
      'Depoimento de paciente',
      'Novidade na area',
      'Resposta a duvida comum',
      'Dia a dia no consultorio',
      'Campanha de conscientizacao',
    ],
    beauty: [
      'Tutorial rapido',
      'Antes e depois',
      'Dica de cuidado',
      'Tendencia de beleza',
      'Produto favorito',
      'Transformacao do cliente',
      'Rotina de skincare',
      'Promocao do mes',
    ],
    education: [
      'Dica de estudo',
      'Curiosidade da area',
      'Resposta a duvida de aluno',
      'Conquista de aluno',
      'Novidade no curso',
      'Resumo de conteudo',
      'Material gratuito',
      'Live tira-duvidas',
    ],
    technology: [
      'Dica tech',
      'Novidade do setor',
      'Tutorial rapido',
      'Ferramenta util',
      'Bug vs Feature',
      'Dia de desenvolvedor',
      'Lancamento de funcionalidade',
      'Bastidores do time',
    ],
    fitness: [
      'Treino do dia',
      'Dica de execucao',
      'Antes e depois',
      'Mito vs Verdade',
      'Receita fit',
      'Motivacao',
      'Rotina de atleta',
      'Desafio da semana',
    ],
    real_estate: [
      'Imovel em destaque',
      'Dica para compradores',
      'Tour virtual',
      'Tendencia do mercado',
      'Historia de cliente satisfeito',
      'Bairro da semana',
      'Dica de decoracao',
      'Investimento inteligente',
    ],
    services: [
      'Servico em destaque',
      'Dica profissional',
      'Bastidores do trabalho',
      'Cliente satisfeito',
      'Promocao especial',
      'Antes e depois',
      'Equipamento/ferramenta',
      'FAQ respondido',
    ],
    other: [
      'Dica do dia',
      'Bastidores',
      'Cliente em destaque',
      'Novidade',
      'Promocao',
      'Tutorial',
      'Inspiracao',
      'Tendencia',
    ],
  };

  const ideas = ideaTemplates[niche] || ideaTemplates.other;
  const contentTypes: ContentType[] = ['feed_post', 'story', 'reel'];

  return ideas.map((title, index) => ({
    id: generateId(),
    title,
    description: `Conteudo sobre: ${title.toLowerCase()}`,
    networks,
    contentTypes: [contentTypes[index % contentTypes.length]],
    tags: [niche, 'organico'],
  }));
}

/**
 * Copy content to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

/**
 * Export calendar to different formats
 */
export function exportCalendar(
  calendar: CalendarEntry[],
  format: 'csv' | 'json',
): string {
  if (format === 'json') {
    return JSON.stringify(calendar, null, 2);
  }

  // CSV format
  const headers = [
    'Data',
    'Dia',
    'Rede',
    'Tipo',
    'Titulo',
    'Descricao',
    'Hashtags',
    'Horario',
    'Status',
  ];
  const rows = calendar.map((entry) => [
    entry.date.toLocaleDateString('pt-BR'),
    entry.dayOfWeek,
    getNetworkName(entry.network),
    entry.contentType,
    entry.title,
    entry.description,
    entry.hashtags.join(' '),
    entry.bestTime,
    entry.status,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
