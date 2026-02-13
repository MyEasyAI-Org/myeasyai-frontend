// Serviço de reescrita de conteúdo usando IA
// Contém toda a lógica de negócio para geração de textos via proxy backend
// Prompts ficam no servidor (CyberShield 3.E)

import { geminiProxyClient } from '../lib/api-clients/gemini-proxy-client';

/**
 * Serviço responsável por toda a lógica de reescrita e geração de conteúdo
 * usando IA. Orquestra múltiplas chamadas à API e implementa fallbacks.
 */
export class ContentRewritingService {
  /**
   * Reescreve o slogan da empresa (corrige capitalização)
   */
  async rewriteSlogan(originalSlogan?: string): Promise<string> {
    try {
      const corrected = await geminiProxyClient.call(
        'content.rewriteSlogan',
        { originalSlogan: originalSlogan || '' },
        0.1,
      );
      return corrected.trim() || originalSlogan || '';
    } catch (error) {
      console.error('Erro ao corrigir capitalização do slogan:', error);
      return originalSlogan || '';
    }
  }

  /**
   * Reescreve a descrição da empresa
   */
  async rewriteDescription(businessInfo: {
    name: string;
    area: string;
    slogan?: string;
    originalDescription: string;
    targetAudience?: string;
    differentials?: string;
  }): Promise<string> {
    return await geminiProxyClient.call(
      'content.rewriteDescription',
      {
        name: businessInfo.name,
        area: businessInfo.area,
        slogan: businessInfo.slogan || '',
        originalDescription: businessInfo.originalDescription,
        targetAudience: businessInfo.targetAudience || '',
        differentials: businessInfo.differentials || '',
      },
      0.7,
    );
  }

  /**
   * Reescreve a lista de serviços
   */
  async rewriteServices(businessInfo: {
    name: string;
    area: string;
    originalServices: string[];
  }): Promise<string[]> {
    const response = await geminiProxyClient.call(
      'content.rewriteServices',
      {
        name: businessInfo.name,
        area: businessInfo.area,
        servicesFormatted: businessInfo.originalServices
          .map((s, i) => `${i + 1}. ${s}`)
          .join('\n'),
      },
      0.7,
    );

    const services = response
      .split('\n')
      .filter((line) => line.trim().match(/^\d+\./))
      .map((line) => line.replace(/^\d+\.\s*/, '').trim())
      .filter((s) => s.length > 0);

    return services.length > 0 ? services : businessInfo.originalServices;
  }

  /**
   * Gera perguntas e respostas de FAQ personalizadas
   */
  async generateFAQ(businessInfo: {
    name: string;
    area: string;
    services?: string[];
  }): Promise<Array<{ question: string; answer: string }>> {
    const response = await geminiProxyClient.call(
      'content.generateFAQ',
      {
        name: businessInfo.name,
        area: businessInfo.area,
        services: businessInfo.services?.join(', ') || '',
      },
      0.7,
    );

    const faqItems: Array<{ question: string; answer: string }> = [];
    const lines = response.split('\n');
    let currentQuestion = '';
    let currentAnswer = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('Q:')) {
        if (currentQuestion && currentAnswer) {
          faqItems.push({ question: currentQuestion, answer: currentAnswer });
        }
        currentQuestion = trimmed.replace(/^Q:\s*/, '');
        currentAnswer = '';
      } else if (trimmed.startsWith('A:')) {
        currentAnswer = trimmed.replace(/^A:\s*/, '');
      } else if (trimmed && currentAnswer) {
        currentAnswer += ' ' + trimmed;
      }
    }

    if (currentQuestion && currentAnswer) {
      faqItems.push({ question: currentQuestion, answer: currentAnswer });
    }

    return faqItems.length > 0
      ? faqItems.slice(0, 5)
      : [
          {
            question: 'Como posso agendar um horário?',
            answer: 'Você pode agendar através do nosso site, WhatsApp ou telefone.',
          },
          {
            question: 'Quais formas de pagamento são aceitas?',
            answer: 'Aceitamos dinheiro, cartão de crédito, débito e PIX.',
          },
          {
            question: 'Qual o horário de funcionamento?',
            answer: 'Atendemos de segunda a sábado, das 9h às 18h.',
          },
        ];
  }

  /**
   * Gera estatísticas personalizadas para a Hero Section
   */
  async generateHeroStats(businessInfo: {
    name: string;
    area: string;
  }): Promise<Array<{ value: string; label: string }>> {
    const response = await geminiProxyClient.call(
      'content.generateHeroStats',
      { name: businessInfo.name, area: businessInfo.area },
      0.7,
    );

    const stats: Array<{ value: string; label: string }> = [];
    const lines = response.split('\n').filter((l) => l.trim().startsWith('STAT'));

    for (const line of lines) {
      const match = line.match(/STAT\d+:\s*(.+)\|(.+)/);
      if (match) {
        stats.push({ value: match[1].trim(), label: match[2].trim() });
      }
    }

    return stats.length === 3
      ? stats
      : [
          { value: '500+', label: 'Clientes Satisfeitos' },
          { value: '4.9★', label: 'Avaliação Média' },
          { value: '10+', label: 'Anos de Experiência' },
        ];
  }

  /**
   * Gera features/benefícios personalizados
   */
  async generateFeatures(businessInfo: {
    name: string;
    area: string;
    services?: string[];
  }): Promise<Array<{ title: string; description: string }>> {
    const response = await geminiProxyClient.call(
      'content.generateFeatures',
      {
        name: businessInfo.name,
        area: businessInfo.area,
        services: businessInfo.services?.join(', ') || '',
      },
      0.8,
    );

    const features: Array<{ title: string; description: string }> = [];
    const lines = response.split('\n').filter((l) => l.trim().startsWith('FEATURE'));

    for (const line of lines) {
      const match = line.match(/FEATURE\d+:\s*(.+)\|(.+)/);
      if (match) {
        features.push({ title: match[1].trim(), description: match[2].trim() });
      }
    }

    return features.length === 3
      ? features
      : [
          { title: 'Experiência Premium', description: 'Muito mais que um serviço, uma verdadeira experiência de qualidade' },
          { title: 'Profissionais Qualificados', description: 'Equipe altamente treinada e experiente no que faz' },
          { title: 'Atendimento Fácil', description: 'Agende com total praticidade e rapidez' },
        ];
  }

  /**
   * Gera conteúdo personalizado para a seção About
   */
  async generateAboutContent(businessInfo: {
    name: string;
    area: string;
    description: string;
  }): Promise<{ title: string; subtitle: string; checklist: string[] }> {
    const response = await geminiProxyClient.call(
      'content.generateAboutContent',
      { name: businessInfo.name, area: businessInfo.area, description: businessInfo.description },
      0.8,
    );

    const lines = response.split('\n').filter((l) => l.trim());
    let title = 'Do Sonho à Realidade';
    let subtitle = 'Nossa empresa foi projetada para ser referência em qualidade';
    const checklist: string[] = [];

    for (const line of lines) {
      if (line.startsWith('TITLE:')) {
        title = line.replace('TITLE:', '').trim();
      } else if (line.startsWith('SUBTITLE:')) {
        subtitle = line.replace('SUBTITLE:', '').trim();
      } else if (line.match(/CHECK\d+:/)) {
        const item = line.replace(/CHECK\d+:/, '').trim();
        if (item) checklist.push(item);
      }
    }

    if (checklist.length === 0) {
      checklist.push('Profissionais certificados', 'Produtos premium', 'Ambiente climatizado');
    }

    return { title, subtitle, checklist: checklist.slice(0, 3) };
  }

  /**
   * Gera descrições personalizadas para cada serviço
   */
  async generateServiceDescriptions(businessInfo: {
    name: string;
    area: string;
    services: string[];
  }): Promise<Array<{ name: string; description: string }>> {
    const response = await geminiProxyClient.call(
      'content.generateServiceDescriptions',
      {
        name: businessInfo.name,
        area: businessInfo.area,
        servicesFormatted: businessInfo.services.map((s, i) => `${i + 1}. ${s}`).join('\n'),
      },
      0.7,
    );

    const descriptions: Array<{ name: string; description: string }> = [];
    const lines = response.split('\n').filter((l) => l.trim().match(/SERVICE\d+:/));

    for (let i = 0; i < businessInfo.services.length; i++) {
      const line = lines[i];
      let desc = 'Serviço de qualidade premium com resultados excepcionais';

      if (line) {
        const match = line.match(/SERVICE\d+:\s*(.+)/);
        if (match) desc = match[1].trim();
      }

      descriptions.push({ name: businessInfo.services[i], description: desc });
    }

    return descriptions;
  }

  /**
   * Gera depoimentos fictícios mas realistas
   */
  async generateTestimonials(businessInfo: {
    name: string;
    area: string;
    services?: string[];
  }): Promise<Array<{ name: string; role: string; text: string }>> {
    const response = await geminiProxyClient.call(
      'content.generateTestimonials',
      {
        name: businessInfo.name,
        area: businessInfo.area,
        services: businessInfo.services?.join(', ') || '',
      },
      0.9,
    );

    const testimonials: Array<{ name: string; role: string; text: string }> = [];
    const lines = response.split('\n').filter((l) => l.trim().startsWith('TESTIMONIAL'));

    for (const line of lines) {
      const match = line.match(/TESTIMONIAL\d+:\s*(.+)\|(.+)\|(.+)/);
      if (match) {
        testimonials.push({ name: match[1].trim(), role: match[2].trim(), text: match[3].trim() });
      }
    }

    return testimonials.length === 3
      ? testimonials
      : [
          { name: 'Ana Silva', role: 'Cliente desde 2024', text: 'Excelente serviço! Profissionais atenciosos e ambiente incrível. Recomendo muito!' },
          { name: 'Carlos Santos', role: 'Cliente desde 2023', text: 'Superou todas as minhas expectativas! Qualidade premium com atendimento impecável.' },
          { name: 'Maria Costa', role: 'Cliente desde 2024', text: 'Simplesmente perfeito! A melhor experiência que já tive. Voltarei sempre!' },
        ];
  }

  /**
   * Corrige a capitalização de um nome de empresa
   */
  async correctNameCapitalization(name: string): Promise<string> {
    try {
      const corrected = await geminiProxyClient.call(
        'content.correctNameCapitalization',
        { name },
        0.1,
      );
      return corrected.trim() || name;
    } catch (error) {
      console.error('Erro ao corrigir capitalização do nome:', error);
      return name;
    }
  }

  /**
   * Gera paletas de cores personalizadas usando IA
   */
  async generateCustomColorPalettes(
    colorDescription: string,
  ): Promise<
    Array<{
      id: string;
      name: string;
      category: 'custom';
      primary: string;
      secondary: string;
      accent: string;
      dark: string;
      light: string;
    }>
  > {
    try {
      const response = await geminiProxyClient.call(
        'content.generateCustomColorPalettes',
        { colorDescription },
        0.8,
      );

      const palettes: Array<{
        id: string;
        name: string;
        category: 'custom';
        primary: string;
        secondary: string;
        accent: string;
        dark: string;
        light: string;
      }> = [];

      const lines = response.split('\n').filter((l) => l.trim().startsWith('PALETTE'));

      for (let i = 0; i < lines.length && i < 6; i++) {
        const line = lines[i];
        const match = line.match(/PALETTE\d+:\s*(.+)\|(.+)\|(.+)\|(.+)\|(.+)\|(.+)/);

        if (match) {
          const [, name, primary, secondary, accent, dark, light] = match;
          const isValidHex = (color: string) => /^#[0-9A-Fa-f]{6}$/.test(color.trim());

          if (isValidHex(primary) && isValidHex(secondary) && isValidHex(accent) && isValidHex(dark) && isValidHex(light)) {
            palettes.push({
              id: `custom-${Date.now()}-${i}`,
              name: name.trim(),
              category: 'custom',
              primary: primary.trim(),
              secondary: secondary.trim(),
              accent: accent.trim(),
              dark: dark.trim(),
              light: light.trim(),
            });
          }
        }
      }

      console.log(`✅ [CONTENT SERVICE] Geradas ${palettes.length} paletas customizadas para: "${colorDescription}"`);

      if (palettes.length === 0) {
        console.warn('⚠️ [CONTENT SERVICE] Falha ao gerar paletas, usando fallbacks');
        return this.generateFallbackPalettes(colorDescription);
      }

      return palettes;
    } catch (error) {
      console.error('❌ [CONTENT SERVICE] Erro ao gerar paletas customizadas:', error);
      return this.generateFallbackPalettes(colorDescription);
    }
  }

  /**
   * Gera paletas de fallback quando a IA falha
   */
  private generateFallbackPalettes(description: string): Array<{
    id: string;
    name: string;
    category: 'custom';
    primary: string;
    secondary: string;
    accent: string;
    dark: string;
    light: string;
  }> {
    const desc = description.toLowerCase();

    const colorMap: Record<
      string,
      Array<{ name: string; primary: string; secondary: string; accent: string; dark: string; light: string }>
    > = {
      azul: [
        { name: 'Azul Oceano', primary: '#1E40AF', secondary: '#3B82F6', accent: '#60A5FA', dark: '#1E3A8A', light: '#DBEAFE' },
        { name: 'Azul Celeste', primary: '#0EA5E9', secondary: '#38BDF8', accent: '#7DD3FC', dark: '#0C4A6E', light: '#E0F2FE' },
      ],
      verde: [
        { name: 'Verde Esmeralda', primary: '#059669', secondary: '#10B981', accent: '#34D399', dark: '#065F46', light: '#D1FAE5' },
        { name: 'Verde Menta', primary: '#10B981', secondary: '#34D399', accent: '#6EE7B7', dark: '#047857', light: '#ECFDF5' },
      ],
      roxo: [
        { name: 'Roxo Místico', primary: '#7C3AED', secondary: '#8B5CF6', accent: '#A78BFA', dark: '#5B21B6', light: '#F5F3FF' },
        { name: 'Roxo Real', primary: '#6B21A8', secondary: '#7C3AED', accent: '#8B5CF6', dark: '#581C87', light: '#F3E8FF' },
      ],
      rosa: [
        { name: 'Rosa Paixão', primary: '#E11D48', secondary: '#F43F5E', accent: '#FB7185', dark: '#9F1239', light: '#FFE4E6' },
        { name: 'Rosa Delicado', primary: '#EC4899', secondary: '#F472B6', accent: '#F9A8D4', dark: '#BE185D', light: '#FCE7F3' },
      ],
      vermelho: [
        { name: 'Vermelho Rubi', primary: '#DC2626', secondary: '#EF4444', accent: '#F87171', dark: '#991B1B', light: '#FEE2E2' },
        { name: 'Vermelho Fogo', primary: '#B91C1C', secondary: '#DC2626', accent: '#EF4444', dark: '#7F1D1D', light: '#FEF2F2' },
      ],
      laranja: [
        { name: 'Laranja Sunset', primary: '#EA580C', secondary: '#F97316', accent: '#FB923C', dark: '#C2410C', light: '#FFEDD5' },
        { name: 'Laranja Vibrante', primary: '#F97316', secondary: '#FB923C', accent: '#FDBA74', dark: '#EA580C', light: '#FFF7ED' },
      ],
      amarelo: [
        { name: 'Amarelo Sol', primary: '#EAB308', secondary: '#FACC15', accent: '#FDE047', dark: '#A16207', light: '#FEF9C3' },
        { name: 'Amarelo Dourado', primary: '#F59E0B', secondary: '#FBBF24', accent: '#FCD34D', dark: '#D97706', light: '#FEF3C7' },
      ],
    };

    let selectedPalettes: Array<{ name: string; primary: string; secondary: string; accent: string; dark: string; light: string }> = [];

    for (const [color, palettes] of Object.entries(colorMap)) {
      if (desc.includes(color)) {
        selectedPalettes.push(...palettes);
        break;
      }
    }

    if (selectedPalettes.length === 0) {
      selectedPalettes = [
        { name: 'Personalizada 1', primary: '#3B82F6', secondary: '#60A5FA', accent: '#93C5FD', dark: '#1E3A8A', light: '#DBEAFE' },
        { name: 'Personalizada 2', primary: '#10B981', secondary: '#34D399', accent: '#6EE7B7', dark: '#047857', light: '#ECFDF5' },
        { name: 'Personalizada 3', primary: '#8B5CF6', secondary: '#A78BFA', accent: '#C4B5FD', dark: '#6B21A8', light: '#FAF5FF' },
      ];
    }

    return selectedPalettes.slice(0, 6).map((palette, index) => ({
      id: `fallback-${Date.now()}-${index}`,
      name: palette.name,
      category: 'custom' as const,
      primary: palette.primary,
      secondary: palette.secondary,
      accent: palette.accent,
      dark: palette.dark,
      light: palette.light,
    }));
  }

  /**
   * Reescreve TODOS os textos do site de uma vez, de forma resiliente
   */
  async rewriteAllContent(siteData: {
    name: string;
    area: string;
    slogan: string;
    description: string;
    services: string[];
    targetAudience?: string;
    differentials?: string;
  }): Promise<{
    slogan: string;
    description: string;
    services: string[];
    faq: Array<{ question: string; answer: string }>;
    heroStats: Array<{ value: string; label: string }>;
    features: Array<{ title: string; description: string }>;
    aboutContent: { title: string; subtitle: string; checklist: string[] };
    serviceDescriptions: Array<{ name: string; description: string }>;
    testimonials: Array<{ name: string; role: string; text: string }>;
  }> {
    const fallbacks = {
      slogan: siteData.slogan,
      description: siteData.description,
      services: siteData.services,
      faq: [] as Array<{ question: string; answer: string }>,
      heroStats: [
        { value: '500+', label: 'Clientes Satisfeitos' },
        { value: '4.9★', label: 'Avaliação Média' },
        { value: '10+', label: 'Anos de Experiência' },
      ],
      features: [
        { title: 'Experiência Premium', description: 'Muito mais que um serviço, uma verdadeira experiência de qualidade' },
        { title: 'Profissionais Qualificados', description: 'Equipe altamente treinada e experiente no que faz' },
        { title: 'Atendimento Fácil', description: 'Agende com total praticidade e rapidez' },
      ],
      aboutContent: {
        title: 'Do Sonho à Realidade',
        subtitle: 'Nossa empresa foi projetada para ser referência em qualidade',
        checklist: ['Profissionais certificados', 'Produtos premium', 'Ambiente climatizado'],
      },
      serviceDescriptions: siteData.services.map((s) => ({
        name: s,
        description: 'Serviço de qualidade premium com resultados excepcionais',
      })),
      testimonials: [
        { name: 'Ana Silva', role: 'Cliente Satisfeita', text: 'Excelente serviço! Profissionais atenciosos e ambiente incrível.' },
        { name: 'Carlos Santos', role: 'Cliente Fiel', text: 'Superou todas as minhas expectativas! Qualidade premium.' },
        { name: 'Maria Costa', role: 'Cliente VIP', text: 'Simplesmente perfeito! A melhor experiência que já tive.' },
      ],
    };

    const getValue = <T>(result: PromiseSettledResult<T>, fallback: T, logName: string): T => {
      if (result.status === 'fulfilled') {
        if (Array.isArray(result.value) && result.value.length === 0) {
          console.warn(`IA retornou array vazio para ${logName}, usando fallback.`);
          return fallback;
        }
        if (typeof result.value === 'string' && !result.value.trim()) {
          console.warn(`IA retornou string vazia para ${logName}, usando fallback.`);
          return fallback;
        }
        return result.value;
      }
      console.error(`Falha ao gerar ${logName}:`, result.reason);
      return fallback;
    };

    const results = await Promise.allSettled([
      this.rewriteSlogan(siteData.slogan),
      this.rewriteDescription({
        name: siteData.name, area: siteData.area, slogan: siteData.slogan,
        originalDescription: siteData.description,
        targetAudience: siteData.targetAudience, differentials: siteData.differentials,
      }),
      this.rewriteServices({ name: siteData.name, area: siteData.area, originalServices: siteData.services }),
      this.generateFAQ({ name: siteData.name, area: siteData.area, services: siteData.services }),
      this.generateHeroStats({ name: siteData.name, area: siteData.area }),
      this.generateFeatures({ name: siteData.name, area: siteData.area, services: siteData.services }),
      this.generateAboutContent({ name: siteData.name, area: siteData.area, description: siteData.description }),
      this.generateServiceDescriptions({ name: siteData.name, area: siteData.area, services: siteData.services }),
      this.generateTestimonials({ name: siteData.name, area: siteData.area, services: siteData.services }),
    ]);

    return {
      slogan: getValue(results[0], fallbacks.slogan, 'slogan'),
      description: getValue(results[1], fallbacks.description, 'descrição'),
      services: getValue(results[2], fallbacks.services, 'serviços'),
      faq: getValue(results[3], fallbacks.faq, 'FAQ'),
      heroStats: getValue(results[4], fallbacks.heroStats, 'estatísticas da hero'),
      features: getValue(results[5], fallbacks.features, 'features'),
      aboutContent: getValue(results[6], fallbacks.aboutContent, 'conteúdo sobre'),
      serviceDescriptions: getValue(results[7], fallbacks.serviceDescriptions, 'descrições de serviços'),
      testimonials: getValue(results[8], fallbacks.testimonials, 'depoimentos'),
    };
  }
}

// Export singleton instance
export const contentRewritingService = new ContentRewritingService();
