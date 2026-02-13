// Serviço de geração de conteúdo para redes sociais usando IA
// Gera legendas, posts, stories, reels e calendários editoriais via backend proxy

import { geminiProxyClient } from '../lib/api-clients/gemini-proxy-client';
import type {
  BusinessNiche,
  ContentTone,
  ContentType,
  GeneratedContent,
  SocialNetwork,
} from '../features/my-easy-content/types';

/**
 * Serviço responsável por gerar conteúdo de redes sociais usando IA
 *
 * NOTE: TONE_DESCRIPTIONS and NETWORK_CONFIG have been moved to the backend
 * prompt registry (workers/api-d1/src/prompts/socialContent.ts) so that
 * prompt templates are never exposed in the frontend JS bundle.
 * (CyberShield finding 3.E)
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
    const response = await geminiProxyClient.call(
      'social.generateFeedPost',
      {
        topic: params.topic,
        network: params.network,
        businessName: params.businessName,
        niche: params.niche,
        audience: params.audience,
        tone: params.tone,
        objective: params.objective || '',
        includeHashtags: params.includeHashtags ? 'true' : '',
        includeImageDescription: params.includeImageDescription ? 'true' : '',
      },
      0.8,
    );
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
    const response = await geminiProxyClient.call(
      'social.generateCaption',
      {
        topic: params.topic,
        network: params.network,
        businessName: params.businessName,
        niche: params.niche,
        audience: params.audience,
        tone: params.tone,
        objective: params.objective || '',
        includeHashtags: params.includeHashtags ? 'true' : '',
      },
      0.85,
    );
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
    const response = await geminiProxyClient.call(
      'social.generateStoryScript',
      {
        topic: params.topic,
        network: params.network,
        businessName: params.businessName,
        niche: params.niche,
        audience: params.audience,
        tone: params.tone,
        objective: params.objective || '',
      },
      0.85,
    );
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
    const response = await geminiProxyClient.call(
      'social.generateReelScript',
      {
        topic: params.topic,
        network: params.network,
        businessName: params.businessName,
        niche: params.niche,
        audience: params.audience,
        tone: params.tone,
        objective: params.objective || '',
        includeHashtags: params.includeHashtags ? 'true' : '',
      },
      0.9,
    );
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
    const response = await geminiProxyClient.call(
      'social.generateContentIdeas',
      {
        businessName: params.businessName,
        niche: params.niche,
        audience: params.audience,
        networks: params.networks.join(','),
        count: String(params.count || 10),
      },
      0.9,
    );
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
    const response = await geminiProxyClient.call(
      'social.generateHashtags',
      {
        topic: params.topic,
        niche: params.niche,
        network: params.network,
        count: String(params.count || 20),
      },
      0.7,
    );
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
    const response = await geminiProxyClient.call(
      'social.generateBestTimes',
      {
        network: params.network,
        niche: params.niche,
        audience: params.audience,
      },
      0.6,
    );
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
