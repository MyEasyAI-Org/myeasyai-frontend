// Serviço de geração de conteúdo para redes sociais usando IA
// Gera legendas, posts, stories, reels e calendários editoriais com Gemini AI

import { geminiClient } from '../lib/api-clients/gemini-client';
import type {
  BusinessNiche,
  ContentTone,
  ContentType,
  GeneratedContent,
  SocialNetwork,
} from '../features/my-easy-content/types';

/**
 * Descrições de tom para usar nos prompts
 */
const TONE_DESCRIPTIONS: Record<ContentTone, string> = {
  professional: 'profissional e corporativo, com linguagem formal e respeitosa',
  casual: 'casual e amigável, como se estivesse conversando com um amigo',
  funny: 'divertido e bem-humorado, usando memes e referências populares',
  inspirational: 'inspiracional e motivador, que toque o coração das pessoas',
  educational: 'educativo e informativo, ensinando algo valioso',
  promotional: 'promocional focado em vendas, com gatilhos de urgência e escassez',
};

/**
 * Configurações de cada rede social
 */
const NETWORK_CONFIG: Record<
  SocialNetwork,
  { name: string; maxChars: number; features: string }
> = {
  instagram: {
    name: 'Instagram',
    maxChars: 2200,
    features: 'emojis, hashtags no final, quebras de linha para legibilidade',
  },
  facebook: {
    name: 'Facebook',
    maxChars: 63206,
    features: 'texto mais longo, emojis moderados, links são bem-vindos',
  },
  linkedin: {
    name: 'LinkedIn',
    maxChars: 3000,
    features: 'tom profissional, hashtags no final, storytelling corporativo',
  },
  twitter: {
    name: 'Twitter/X',
    maxChars: 280,
    features: 'texto curto e impactante, hashtags no texto, threads se necessário',
  },
  tiktok: {
    name: 'TikTok',
    maxChars: 2200,
    features: 'linguagem jovem e viral, hashtags trending, ganchos fortes',
  },
  youtube: {
    name: 'YouTube',
    maxChars: 5000,
    features: 'descrição completa, timestamps, links e CTAs',
  },
};

/**
 * Serviço responsável por gerar conteúdo de redes sociais usando IA
 */
export class SocialContentService {
  /**
   * Gera um post para o feed
   */
  async generateFeedPost(params: {
    topic: string;
    network: SocialNetwork;
    businessName: string;
    niche: BusinessNiche;
    audience: string;
    tone: ContentTone;
    objective?: string;
    includeHashtags?: boolean;
    includeImageDescription?: boolean;
  }): Promise<{ content: string; hashtags?: string[]; imageDescription?: string }> {
    const networkConfig = NETWORK_CONFIG[params.network];
    const toneDesc = TONE_DESCRIPTIONS[params.tone];

    const prompt = `Você é um especialista em copywriting para redes sociais, com anos de experiência criando conteúdo viral.

CONTEXTO DO NEGÓCIO:
- Nome da empresa: ${params.businessName}
- Nicho: ${params.niche}
- Público-alvo: ${params.audience}
- Tom de voz desejado: ${toneDesc}

REDE SOCIAL: ${networkConfig.name}
- Limite: ${networkConfig.maxChars} caracteres
- Características: ${networkConfig.features}

TEMA DO POST: ${params.topic}
${params.objective ? `OBJETIVO: ${params.objective}` : ''}

TAREFA: Crie um post COMPLETO e ENVOLVENTE para o feed do ${networkConfig.name}.

REQUISITOS:
1. Use o tom de voz ${toneDesc}
2. Comece com um GANCHO poderoso que prenda a atenção
3. Desenvolva o conteúdo de forma envolvente
4. Termine com uma CHAMADA PARA AÇÃO clara
5. Use emojis de forma estratégica (não exagere)
6. Respeite o limite de caracteres
7. Seja ORIGINAL e AUTÊNTICO - evite clichês

${params.includeHashtags ? 'INCLUA: Uma seção de hashtags relevantes ao final (5-10 hashtags)' : ''}
${params.includeImageDescription ? 'INCLUA: Uma descrição de imagem ideal para acompanhar o post (após as hashtags)' : ''}

FORMATO DE SAÍDA:
POST:
[conteúdo do post]

${params.includeHashtags ? 'HASHTAGS:\n[hashtags separadas por espaço]' : ''}
${params.includeImageDescription ? 'IMAGEM:\n[descrição da imagem ideal]' : ''}

Seja criativo e gere um post que realmente engaje o público!`;

    const response = await geminiClient.call(prompt, 0.8);
    return this.parseContentResponse(response, params.includeHashtags, params.includeImageDescription);
  }

  /**
   * Gera uma legenda para foto/vídeo
   */
  async generateCaption(params: {
    topic: string;
    network: SocialNetwork;
    businessName: string;
    niche: BusinessNiche;
    audience: string;
    tone: ContentTone;
    objective?: string;
    includeHashtags?: boolean;
  }): Promise<{ content: string; hashtags?: string[] }> {
    const networkConfig = NETWORK_CONFIG[params.network];
    const toneDesc = TONE_DESCRIPTIONS[params.tone];

    const prompt = `Você é um especialista em legendas virais para redes sociais.

CONTEXTO:
- Empresa: ${params.businessName} (${params.niche})
- Público: ${params.audience}
- Tom: ${toneDesc}
- Rede: ${networkConfig.name}

TEMA: ${params.topic}
${params.objective ? `OBJETIVO: ${params.objective}` : ''}

TAREFA: Crie uma LEGENDA envolvente e cativante.

REQUISITOS:
1. Seja CONCISO mas IMPACTANTE
2. Use o tom ${params.tone}
3. Comece com algo que prenda a atenção
4. Inclua emojis estratégicos
5. Termine com pergunta ou CTA para gerar engajamento
6. Máximo 300 caracteres para a legenda principal

${params.includeHashtags ? 'INCLUA: 8-15 hashtags relevantes' : ''}

FORMATO:
LEGENDA:
[texto da legenda]

${params.includeHashtags ? 'HASHTAGS:\n[hashtags]' : ''}`;

    const response = await geminiClient.call(prompt, 0.85);
    return this.parseContentResponse(response, params.includeHashtags, false);
  }

  /**
   * Gera roteiro para stories
   */
  async generateStoryScript(params: {
    topic: string;
    network: SocialNetwork;
    businessName: string;
    niche: BusinessNiche;
    audience: string;
    tone: ContentTone;
    objective?: string;
  }): Promise<{ content: string }> {
    const toneDesc = TONE_DESCRIPTIONS[params.tone];

    const prompt = `Você é um especialista em conteúdo para Stories de Instagram/Facebook.

CONTEXTO:
- Empresa: ${params.businessName} (${params.niche})
- Público: ${params.audience}
- Tom: ${toneDesc}

TEMA: ${params.topic}
${params.objective ? `OBJETIVO: ${params.objective}` : ''}

TAREFA: Crie um roteiro de SEQUÊNCIA DE STORIES (4-6 stories).

REQUISITOS:
1. Cada story deve ter texto curto (máximo 100 caracteres)
2. Primeira story: GANCHO que gere curiosidade
3. Stories do meio: desenvolva a narrativa
4. Última story: CTA forte (arraste para cima, responda, etc)
5. Indique elementos visuais (stickers, enquetes, perguntas)
6. Use o tom ${params.tone}

FORMATO:
STORY 1:
[Texto do story]
[Elementos visuais: sticker de pergunta, gif, etc]

STORY 2:
[Texto do story]
[Elementos visuais]

... (continue até STORY 6 se necessário)

Crie uma sequência que prenda a atenção do início ao fim!`;

    const response = await geminiClient.call(prompt, 0.85);
    return { content: this.cleanContent(response) };
  }

  /**
   * Gera roteiro para Reels/TikTok
   */
  async generateReelScript(params: {
    topic: string;
    network: SocialNetwork;
    businessName: string;
    niche: BusinessNiche;
    audience: string;
    tone: ContentTone;
    objective?: string;
    includeHashtags?: boolean;
  }): Promise<{ content: string; hashtags?: string[] }> {
    const networkConfig = NETWORK_CONFIG[params.network];
    const toneDesc = TONE_DESCRIPTIONS[params.tone];

    const prompt = `Você é um especialista em vídeos curtos virais (Reels/TikTok).

CONTEXTO:
- Empresa: ${params.businessName} (${params.niche})
- Público: ${params.audience}
- Tom: ${toneDesc}
- Plataforma: ${networkConfig.name}

TEMA: ${params.topic}
${params.objective ? `OBJETIVO: ${params.objective}` : ''}

TAREFA: Crie um ROTEIRO COMPLETO para um Reel/TikTok de 30-60 segundos.

ESTRUTURA OBRIGATÓRIA:
1. GANCHO (0-3s): Frase ou ação que prende IMEDIATAMENTE
2. DESENVOLVIMENTO (3-25s): Conteúdo principal
3. CLÍMAX (25-35s): Ponto alto do vídeo
4. CTA (35-60s): Chamada para ação

REQUISITOS:
1. Gancho PODEROSO nos primeiros 3 segundos
2. Ritmo dinâmico, sem enrolação
3. Tom ${params.tone}
4. Indique: falas, texto na tela, ações, transições
5. Sugira áudio/música se relevante

${params.includeHashtags ? 'INCLUA: 10-15 hashtags populares da plataforma' : ''}

FORMATO:
ROTEIRO DO REEL:

[GANCHO - 0 a 3s]
Texto na tela: "..."
Fala: "..."
Ação: ...

[DESENVOLVIMENTO - 3 a 25s]
...

[CLÍMAX - 25 a 35s]
...

[CTA - 35 a 60s]
...

LEGENDA:
[legenda para o post]

${params.includeHashtags ? 'HASHTAGS:\n[hashtags]' : ''}

Crie um roteiro que tenha potencial viral!`;

    const response = await geminiClient.call(prompt, 0.9);
    return this.parseContentResponse(response, params.includeHashtags, false);
  }

  /**
   * Gera ideias de conteúdo
   */
  async generateContentIdeas(params: {
    businessName: string;
    niche: BusinessNiche;
    audience: string;
    networks: SocialNetwork[];
    count?: number;
  }): Promise<Array<{ title: string; description: string; contentType: string }>> {
    const networksStr = params.networks.map((n) => NETWORK_CONFIG[n].name).join(', ');

    const prompt = `Você é um estrategista de conteúdo criativo para redes sociais.

CONTEXTO:
- Empresa: ${params.businessName}
- Nicho: ${params.niche}
- Público: ${params.audience}
- Redes: ${networksStr}

TAREFA: Gere ${params.count || 10} IDEIAS CRIATIVAS de conteúdo.

REQUISITOS:
1. Ideias ORIGINAIS e ATUAIS
2. Variedade de formatos (posts, reels, stories, carrosséis)
3. Mix de conteúdo educativo, entretenimento e promocional
4. Considere tendências atuais
5. Cada ideia deve ter potencial de engajamento

FORMATO (exatamente assim, uma ideia por linha):
IDEIA1: [Título curto]|[Descrição de 1-2 frases]|[Tipo: post/reel/story/carrossel]
IDEIA2: [Título curto]|[Descrição]|[Tipo]
...

Seja criativo e pense fora da caixa!`;

    const response = await geminiClient.call(prompt, 0.9);
    return this.parseIdeasResponse(response);
  }

  /**
   * Gera hashtags relevantes
   */
  async generateHashtags(params: {
    topic: string;
    niche: BusinessNiche;
    network: SocialNetwork;
    count?: number;
  }): Promise<string[]> {
    const networkConfig = NETWORK_CONFIG[params.network];

    const prompt = `Você é um especialista em hashtags e algoritmos de redes sociais.

CONTEXTO:
- Tema: ${params.topic}
- Nicho: ${params.niche}
- Rede: ${networkConfig.name}

TAREFA: Gere ${params.count || 20} HASHTAGS estratégicas.

REQUISITOS:
1. Mix de hashtags: populares (alto alcance) + nichadas (alta conversão)
2. Hashtags em português brasileiro
3. Relevantes para o tema e nicho
4. Evite hashtags banidas ou com baixo desempenho
5. Ordene por relevância

FORMATO:
Retorne APENAS as hashtags, uma por linha, começando com #
Exemplo:
#exemplo1
#exemplo2
...

Gere hashtags que realmente funcionam!`;

    const response = await geminiClient.call(prompt, 0.7);
    return this.parseHashtagsResponse(response);
  }

  /**
   * Gera melhores horários para postar
   */
  async generateBestTimes(params: {
    network: SocialNetwork;
    niche: BusinessNiche;
    audience: string;
  }): Promise<Array<{ day: string; time: string; reason: string }>> {
    const networkConfig = NETWORK_CONFIG[params.network];

    const prompt = `Você é um analista de métricas de redes sociais.

CONTEXTO:
- Rede: ${networkConfig.name}
- Nicho: ${params.niche}
- Público: ${params.audience}

TAREFA: Sugira os MELHORES HORÁRIOS para postar.

REQUISITOS:
1. Considere o comportamento do público-alvo
2. Baseie-se em dados gerais de engajamento da plataforma
3. Considere fuso horário brasileiro
4. Forneça razões para cada sugestão

FORMATO (exatamente assim):
HORARIO1: [Dia da semana]|[Horário HH:MM]|[Razão breve]
HORARIO2: [Dia]|[Horário]|[Razão]
...

Sugira 7-10 horários ótimos!`;

    const response = await geminiClient.call(prompt, 0.6);
    return this.parseBestTimesResponse(response);
  }

  /**
   * Método principal de geração que roteia para o tipo correto
   */
  async generateContent(params: {
    contentType: ContentType;
    network: SocialNetwork;
    topic: string;
    businessName: string;
    niche: BusinessNiche;
    audience: string;
    tone: ContentTone;
    objective?: string;
    includeHashtags?: boolean;
    includeImageDescription?: boolean;
  }): Promise<GeneratedContent> {
    let result: { content: string; hashtags?: string[]; imageDescription?: string };

    switch (params.contentType) {
      case 'feed_post':
        result = await this.generateFeedPost(params);
        break;
      case 'caption':
        result = await this.generateCaption(params);
        break;
      case 'story':
        result = await this.generateStoryScript(params);
        break;
      case 'reel':
        result = await this.generateReelScript(params);
        break;
      case 'hashtags':
        const hashtags = await this.generateHashtags({
          topic: params.topic,
          niche: params.niche,
          network: params.network,
        });
        result = { content: hashtags.join(' '), hashtags };
        break;
      case 'best_times':
        const times = await this.generateBestTimes({
          network: params.network,
          niche: params.niche,
          audience: params.audience,
        });
        result = {
          content: times
            .map((t) => `${t.day} às ${t.time}: ${t.reason}`)
            .join('\n'),
        };
        break;
      case 'ideas':
        const ideas = await this.generateContentIdeas({
          businessName: params.businessName,
          niche: params.niche,
          audience: params.audience,
          networks: [params.network],
        });
        result = {
          content: ideas
            .map((i, idx) => `${idx + 1}. ${i.title}\n   ${i.description} (${i.contentType})`)
            .join('\n\n'),
        };
        break;
      default:
        result = await this.generateFeedPost(params);
    }

    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: params.contentType,
      network: params.network,
      title: params.topic,
      content: result.content,
      hashtags: result.hashtags,
      imageDescription: result.imageDescription,
      createdAt: new Date(),
    };
  }

  // --- Métodos auxiliares de parsing ---

  private parseContentResponse(
    response: string,
    includeHashtags?: boolean,
    includeImageDescription?: boolean,
  ): { content: string; hashtags?: string[]; imageDescription?: string } {
    let content = response;
    let hashtags: string[] | undefined;
    let imageDescription: string | undefined;

    // Extrair hashtags
    if (includeHashtags) {
      const hashtagMatch = response.match(/HASHTAGS?:\s*\n?([\s\S]*?)(?=IMAGEM:|$)/i);
      if (hashtagMatch) {
        const hashtagText = hashtagMatch[1];
        hashtags = hashtagText.match(/#\w+/g) || [];
        content = content.replace(/HASHTAGS?:\s*\n?[\s\S]*?(?=IMAGEM:|$)/i, '').trim();
      }
    }

    // Extrair descrição de imagem
    if (includeImageDescription) {
      const imageMatch = response.match(/IMAGEM:\s*\n?([\s\S]*?)$/i);
      if (imageMatch) {
        imageDescription = imageMatch[1].trim();
        content = content.replace(/IMAGEM:\s*\n?[\s\S]*$/i, '').trim();
      }
    }

    // Limpar prefixos
    content = content
      .replace(/^(POST|LEGENDA|ROTEIRO[^:]*|CAPTION):\s*\n?/i, '')
      .trim();

    return { content, hashtags, imageDescription };
  }

  private parseIdeasResponse(
    response: string,
  ): Array<{ title: string; description: string; contentType: string }> {
    const ideas: Array<{ title: string; description: string; contentType: string }> = [];
    const lines = response.split('\n').filter((l) => l.trim().match(/^IDEIA\d+:/i));

    for (const line of lines) {
      const match = line.match(/IDEIA\d+:\s*(.+)\|(.+)\|(.+)/i);
      if (match) {
        ideas.push({
          title: match[1].trim(),
          description: match[2].trim(),
          contentType: match[3].trim(),
        });
      }
    }

    return ideas.length > 0
      ? ideas
      : [
          { title: 'Post educativo', description: 'Ensine algo valioso ao seu público', contentType: 'post' },
          { title: 'Bastidores', description: 'Mostre o dia a dia da empresa', contentType: 'story' },
          { title: 'Dica rápida', description: 'Compartilhe uma dica prática', contentType: 'reel' },
        ];
  }

  private parseHashtagsResponse(response: string): string[] {
    const hashtags = response.match(/#[\w\u00C0-\u017F]+/g) || [];
    return [...new Set(hashtags)].slice(0, 25);
  }

  private parseBestTimesResponse(
    response: string,
  ): Array<{ day: string; time: string; reason: string }> {
    const times: Array<{ day: string; time: string; reason: string }> = [];
    const lines = response.split('\n').filter((l) => l.trim().match(/^HORARIO\d+:/i));

    for (const line of lines) {
      const match = line.match(/HORARIO\d+:\s*(.+)\|(.+)\|(.+)/i);
      if (match) {
        times.push({
          day: match[1].trim(),
          time: match[2].trim(),
          reason: match[3].trim(),
        });
      }
    }

    return times.length > 0
      ? times
      : [
          { day: 'Segunda', time: '12:00', reason: 'Pausa do almoço' },
          { day: 'Quarta', time: '19:00', reason: 'Final do expediente' },
          { day: 'Sábado', time: '10:00', reason: 'Manhã de lazer' },
        ];
  }

  private cleanContent(content: string): string {
    return content
      .replace(/^(POST|LEGENDA|ROTEIRO[^:]*|CAPTION):\s*\n?/i, '')
      .trim();
  }
}

// Export singleton instance
export const socialContentService = new SocialContentService();
