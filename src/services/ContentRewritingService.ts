// Serviço de reescrita de conteúdo usando IA
// Contém toda a lógica de negócio para geração de textos com Gemini AI

import { geminiClient } from '../lib/api-clients/gemini-client';

/**
 * Serviço responsável por toda a lógica de reescrita e geração de conteúdo
 * usando IA. Orquestra múltiplas chamadas à API e implementa fallbacks.
 */
export class ContentRewritingService {
  /**
   * Reescreve o slogan da empresa (corrige capitalização)
   */
  async rewriteSlogan(originalSlogan?: string): Promise<string> {
    const prompt = `Você é um especialista em gramática e estilo.

TAREFA: Corrija a capitalização do slogan a seguir para o formato "Title Case".

SLOGAN ORIGINAL: "${originalSlogan}"

REQUISITOS:
1. NÃO altere as palavras, apenas a capitalização.
2. Todas as palavras importantes devem começar com letra MAIÚSCULA.
3. Artigos e preposições curtas (a, o, de, em, para) devem ficar em minúsculo, a menos que sejam a primeira palavra.

EXEMPLOS:
- "doces sempre já" -> "Doces Sempre Já"
- "transformando sonhos em realidade" -> "Transformando Sonhos em Realidade"
- "a melhor pizza da cidade" -> "A Melhor Pizza da Cidade"

Retorne APENAS o slogan corrigido, sem aspas ou comentários.`;

    try {
      const corrected = await geminiClient.call(prompt, 0.1);
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
    const prompt = `Você é um especialista em copywriting conciso e impactante.

TAREFA: Reescreva a descrição da empresa de forma ULTRA CONCISA e IMPACTANTE.

INFORMAÇÕES DA EMPRESA:
- Nome: ${businessInfo.name}
- Área: ${businessInfo.area}
${businessInfo.slogan ? `- Slogan: ${businessInfo.slogan}` : ''}
- Descrição atual: ${businessInfo.originalDescription}
${businessInfo.targetAudience ? `- Público-alvo: ${businessInfo.targetAudience}` : ''}
${businessInfo.differentials ? `- Diferenciais: ${businessInfo.differentials}` : ''}

REQUISITOS CRÍTICOS:
1. MÁXIMO de 50 palavras (1-2 frases curtas e impactantes)
2. Focar APENAS no principal benefício
3. Linguagem DIRETA e EMOCIONAL
4. SEM palavras desnecessárias
5. Corrigir ortografia e gramática

ESTRUTURA:
- 1 frase principal (máximo 30 palavras)
- 1 frase complementar OPCIONAL (máximo 20 palavras)

EXEMPLOS DE TAMANHO IDEAL:
- "Transformamos seus sonhos em realidade com qualidade premium e atendimento personalizado."
- "Oferecemos a melhor experiência em [área] com resultados que superam expectativas."

Retorne APENAS o texto reescrito, SEM aspas ou comentários.`;

    return await geminiClient.call(prompt, 0.7);
  }

  /**
   * Reescreve a lista de serviços
   */
  async rewriteServices(businessInfo: {
    name: string;
    area: string;
    originalServices: string[];
  }): Promise<string[]> {
    const prompt = `Você é um especialista em copywriting para serviços e produtos.

TAREFA: Reescreva a lista de serviços de forma ATRATIVA e PROFISSIONAL.

INFORMAÇÕES:
- Empresa: ${businessInfo.name}
- Área: ${businessInfo.area}
- Serviços atuais:
${businessInfo.originalServices.map((s, i) => `${i + 1}. ${s}`).join('\n')}

REQUISITOS:
1. Corrigir ortografia e gramática.
2. Capitalizar cada serviço como um título (Title Case), onde cada palavra importante começa com maiúscula.
3. Ser ESPECÍFICO e DESCRITIVO.
4. Adicionar adjetivos que transmitam QUALIDADE.
5. MÁXIMO de 4-6 palavras por serviço.
6. Evitar repetições.

EXEMPLOS DE TRANSFORMAÇÃO:
"corte" → "Corte Profissional Personalizado"
"barba" → "Design de Barba Masculina"
"unhas" → "Manicure e Pedicure Premium"
"cafe" → "Café Gourmet Selecionado"

Retorne APENAS a lista numerada dos serviços reescritos, um por linha, sem comentários adicionais.
Formato:
1. Serviço 1
2. Serviço 2
etc.`;

    const response = await geminiClient.call(prompt, 0.7);

    // Extrair lista numerada
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
    const prompt = `Você é um especialista em atendimento ao cliente e FAQ.

TAREFA: Crie 5 perguntas frequentes (FAQ) RELEVANTES para esta empresa, com respostas COMPLETAS e ÚTEIS.

INFORMAÇÕES:
- Empresa: ${businessInfo.name}
- Área: ${businessInfo.area}
${businessInfo.services ? `- Serviços: ${businessInfo.services.join(', ')}` : ''}

REQUISITOS:
1. Perguntas devem ser as MAIS COMUNS do setor
2. Respostas devem ser CLARAS, OBJETIVAS e COMPLETAS
3. Incluir informações sobre: agendamento, pagamento, horários, políticas
4. Tom PROFISSIONAL mas ACOLHEDOR
5. Corrigir ortografia e gramática

FORMATO DE RETORNO (exatamente assim):
Q: Pergunta 1?
A: Resposta completa da pergunta 1.

Q: Pergunta 2?
A: Resposta completa da pergunta 2.

(e assim por diante para 5 perguntas)

Retorne APENAS no formato especificado, sem introduções ou comentários adicionais.`;

    const response = await geminiClient.call(prompt, 0.7);

    // Parse do formato Q: / A:
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
    const prompt = `Você é um especialista em copywriting e marketing.

TAREFA: Crie 3 estatísticas IMPACTANTES e REALISTAS para a Hero Section do site.

INFORMAÇÕES:
- Empresa: ${businessInfo.name}
- Área: ${businessInfo.area}

REQUISITOS:
1. Estatísticas devem ser RELEVANTES para o setor
2. Valores devem ser REALISTAS (não exagerar)
3. Labels devem ser CURTOS e IMPACTANTES
4. Focar em: clientes, avaliações, experiência, projetos, etc.

FORMATO DE RETORNO (exatamente assim):
STAT1: [valor]|[label]
STAT2: [valor]|[label]
STAT3: [valor]|[label]

EXEMPLOS:
STAT1: 500+|Clientes Satisfeitos
STAT2: 4.9★|Avaliação Média
STAT3: 8 Anos|de Experiência

Retorne APENAS no formato especificado, sem comentários adicionais.`;

    const response = await geminiClient.call(prompt, 0.7);

    const stats: Array<{ value: string; label: string }> = [];
    const lines = response.split('\n').filter((l) => l.trim().startsWith('STAT'));

    for (const line of lines) {
      const match = line.match(/STAT\d+:\s*(.+)\|(.+)/);
      if (match) {
        stats.push({
          value: match[1].trim(),
          label: match[2].trim(),
        });
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
    const prompt = `Você é um especialista em copywriting e marketing de conversão.

TAREFA: Crie 3 BENEFÍCIOS/FEATURES únicos e persuasivos para esta empresa.

INFORMAÇÕES:
- Empresa: ${businessInfo.name}
- Área: ${businessInfo.area}
${businessInfo.services ? `- Serviços: ${businessInfo.services.join(', ')}` : ''}

REQUISITOS:
1. Focar em BENEFÍCIOS para o cliente, não características técnicas
2. Títulos devem ter MÁXIMO 4 palavras
3. Descrições devem ter MÁXIMO 15 palavras
4. Usar linguagem EMOCIONAL e PERSUASIVA
5. Ser ESPECÍFICO para o setor

FORMATO DE RETORNO (exatamente assim):
FEATURE1: [título]|[descrição]
FEATURE2: [título]|[descrição]
FEATURE3: [título]|[descrição]

EXEMPLO para barbearia:
FEATURE1: Experiência Premium|Muito mais que um corte, uma verdadeira experiência de luxo e conforto
FEATURE2: Mestres da Barbearia|Profissionais altamente treinados com anos de experiência no ofício
FEATURE3: Agendamento Rápido|Agende seu horário em segundos pelo app ou WhatsApp

Retorne APENAS no formato especificado, sem comentários adicionais.`;

    const response = await geminiClient.call(prompt, 0.8);

    const features: Array<{ title: string; description: string }> = [];
    const lines = response
      .split('\n')
      .filter((l) => l.trim().startsWith('FEATURE'));

    for (const line of lines) {
      const match = line.match(/FEATURE\d+:\s*(.+)\|(.+)/);
      if (match) {
        features.push({
          title: match[1].trim(),
          description: match[2].trim(),
        });
      }
    }

    return features.length === 3
      ? features
      : [
          {
            title: 'Experiência Premium',
            description:
              'Muito mais que um serviço, uma verdadeira experiência de qualidade',
          },
          {
            title: 'Profissionais Qualificados',
            description: 'Equipe altamente treinada e experiente no que faz',
          },
          {
            title: 'Atendimento Fácil',
            description: 'Agende com total praticidade e rapidez',
          },
        ];
  }

  /**
   * Gera conteúdo personalizado para a seção About
   */
  async generateAboutContent(businessInfo: {
    name: string;
    area: string;
    description: string;
  }): Promise<{
    title: string;
    subtitle: string;
    checklist: string[];
  }> {
    const prompt = `Você é um especialista em copywriting e storytelling empresarial.

TAREFA: Crie conteúdo PERSUASIVO para a seção "Sobre Nós".

INFORMAÇÕES:
- Empresa: ${businessInfo.name}
- Área: ${businessInfo.area}
- Descrição: ${businessInfo.description}

REQUISITOS:
1. Título: MÁXIMO 3 palavras, IMPACTANTE
2. Subtítulo: 1 frase que complete o título (10-15 palavras)
3. Checklist: 3 itens que destaquem DIFERENCIAIS (máximo 5 palavras cada)

FORMATO DE RETORNO (exatamente assim):
TITLE: [título]
SUBTITLE: [subtítulo]
CHECK1: [item da checklist]
CHECK2: [item da checklist]
CHECK3: [item da checklist]

EXEMPLO para academia:
TITLE: Transforme Seu Corpo
SUBTITLE: Com equipamentos de última geração e personal trainers dedicados
CHECK1: Personal Trainers Certificados
CHECK2: Equipamentos Modernos
CHECK3: Ambiente Motivador

Retorne APENAS no formato especificado.`;

    const response = await geminiClient.call(prompt, 0.8);

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
      checklist.push(
        'Profissionais certificados',
        'Produtos premium',
        'Ambiente climatizado',
      );
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
    const prompt = `Você é um especialista em copywriting de serviços.

TAREFA: Crie descrições PERSUASIVAS para cada serviço.

INFORMAÇÕES:
- Empresa: ${businessInfo.name}
- Área: ${businessInfo.area}
- Serviços:
${businessInfo.services.map((s, i) => `${i + 1}. ${s}`).join('\n')}

REQUISITOS:
1. Cada descrição deve ter MÁXIMO 12 palavras
2. Focar em BENEFÍCIOS e RESULTADOS
3. Usar linguagem PERSUASIVA
4. Ser ESPECÍFICO para o serviço

FORMATO DE RETORNO (uma linha por serviço):
SERVICE1: [descrição do serviço 1]
SERVICE2: [descrição do serviço 2]
etc.

Retorne APENAS no formato especificado.`;

    const response = await geminiClient.call(prompt, 0.7);

    const descriptions: Array<{ name: string; description: string }> = [];
    const lines = response
      .split('\n')
      .filter((l) => l.trim().match(/SERVICE\d+:/));

    for (let i = 0; i < businessInfo.services.length; i++) {
      const line = lines[i];
      let desc = 'Serviço de qualidade premium com resultados excepcionais';

      if (line) {
        const match = line.match(/SERVICE\d+:\s*(.+)/);
        if (match) desc = match[1].trim();
      }

      descriptions.push({
        name: businessInfo.services[i],
        description: desc,
      });
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
    const prompt = `Você é um especialista em marketing de conteúdo e social proof.

TAREFA: Crie 3 depoimentos AUTÊNTICOS e PERSUASIVOS de clientes fictícios.

INFORMAÇÕES:
- Empresa: ${businessInfo.name}
- Área: ${businessInfo.area}
${businessInfo.services ? `- Serviços: ${businessInfo.services.join(', ')}` : ''}

REQUISITOS:
1. Nomes brasileiros REALISTAS e diversos (incluir gêneros diferentes)
2. Depoimentos devem parecer AUTÊNTICOS (linguagem natural)
3. Mencionar BENEFÍCIOS específicos recebidos
4. MÁXIMO 20 palavras por depoimento
5. Variar o tom (formal, informal, entusiasmado)

FORMATO DE RETORNO:
TESTIMONIAL1: [Nome Completo]|[Cargo/Descrição]|[Depoimento]
TESTIMONIAL2: [Nome Completo]|[Cargo/Descrição]|[Depoimento]
TESTIMONIAL3: [Nome Completo]|[Cargo/Descrição]|[Depoimento]

EXEMPLO para restaurante:
TESTIMONIAL1: Ana Beatriz Santos|Cliente desde 2023|A comida é maravilhosa! Ambiente acolhedor e atendimento impecável. Melhor experiência gastronômica da região!
TESTIMONIAL2: Carlos Eduardo Lima|Cliente frequente|Pratos deliciosos e preço justo. Sempre volto e recomendo para amigos e família!
TESTIMONIAL3: Marina Costa Silva|Cliente VIP|Simplesmente perfeito! Da entrada à sobremesa, tudo preparado com muito carinho e qualidade!

Retorne APENAS no formato especificado.`;

    const response = await geminiClient.call(prompt, 0.9);

    const testimonials: Array<{ name: string; role: string; text: string }> = [];
    const lines = response
      .split('\n')
      .filter((l) => l.trim().startsWith('TESTIMONIAL'));

    for (const line of lines) {
      const match = line.match(/TESTIMONIAL\d+:\s*(.+)\|(.+)\|(.+)/);
      if (match) {
        testimonials.push({
          name: match[1].trim(),
          role: match[2].trim(),
          text: match[3].trim(),
        });
      }
    }

    return testimonials.length === 3
      ? testimonials
      : [
          {
            name: 'Ana Silva',
            role: 'Cliente desde 2024',
            text: 'Excelente serviço! Profissionais atenciosos e ambiente incrível. Recomendo muito!',
          },
          {
            name: 'Carlos Santos',
            role: 'Cliente desde 2023',
            text: 'Superou todas as minhas expectativas! Qualidade premium com atendimento impecável.',
          },
          {
            name: 'Maria Costa',
            role: 'Cliente desde 2024',
            text: 'Simplesmente perfeito! A melhor experiência que já tive. Voltarei sempre!',
          },
        ];
  }

  /**
   * Corrige a capitalização de um nome de empresa
   */
  async correctNameCapitalization(name: string): Promise<string> {
    const prompt = `TAREFA: Corrija a capitalização do nome desta empresa. Nomes próprios e palavras importantes devem começar com maiúscula.

NOME ORIGINAL: "${name}"

EXEMPLOS:
- "doces já" -> "Doces Já"
- "barbearia do zé" -> "Barbearia do Zé"
- "myeasyai" -> "MyEasyAI"

Retorne APENAS o nome corrigido, sem aspas ou comentários.`;

    try {
      const corrected = await geminiClient.call(prompt, 0.1);
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
    const prompt = `Você é um especialista em design de cores e paletas profissionais.

TAREFA: Crie 6 paletas de cores PROFISSIONAIS baseadas nesta descrição: "${colorDescription}"

INSTRUÇÕES:
1. Analise as cores mencionadas na descrição
2. Crie 6 variações diferentes mas harmoniosamente relacionadas
3. Cada paleta deve ter: primary, secondary, accent, dark, light
4. Use códigos HEX válidos (ex: #1E40AF)
5. Paletas devem ser adequadas para websites profissionais
6. Nomes criativos e relacionados à descrição

FORMATO DE RETORNO (exatamente assim):
PALETTE1: [Nome]|[primary]|[secondary]|[accent]|[dark]|[light]
PALETTE2: [Nome]|[primary]|[secondary]|[accent]|[dark]|[light]
PALETTE3: [Nome]|[primary]|[secondary]|[accent]|[dark]|[light]
PALETTE4: [Nome]|[primary]|[secondary]|[accent]|[dark]|[light]
PALETTE5: [Nome]|[primary]|[secondary]|[accent]|[dark]|[light]
PALETTE6: [Nome]|[primary]|[secondary]|[accent]|[dark]|[light]

EXEMPLO para "azul e laranja":
PALETTE1: Oceano Vibrante|#1E40AF|#F97316|#60A5FA|#1E293B|#F0F9FF
PALETTE2: Crepúsculo Urbano|#2563EB|#EA580C|#3B82F6|#0F172A|#EFF6FF
PALETTE3: Energia Solar|#0EA5E9|#FB923C|#38BDF8|#1E293B|#F0F9FF
PALETTE4: Horizonte Dourado|#0284C7|#D97706|#0EA5E9|#164E63|#ECFEFF
PALETTE5: Fogo e Gelo|#075985|#C2410C|#0369A1|#0C4A6E|#F0F9FF
PALETTE6: Modernidade Tech|#3B82F6|#F59E0B|#60A5FA|#1E3A8A|#DBEAFE

Retorne APENAS no formato especificado, sem comentários adicionais.`;

    try {
      const response = await geminiClient.call(prompt, 0.8);

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

      const lines = response
        .split('\n')
        .filter((l) => l.trim().startsWith('PALETTE'));

      for (let i = 0; i < lines.length && i < 6; i++) {
        const line = lines[i];
        const match = line.match(
          /PALETTE\d+:\s*(.+)\|(.+)\|(.+)\|(.+)\|(.+)\|(.+)/,
        );

        if (match) {
          const [, name, primary, secondary, accent, dark, light] = match;

          const isValidHex = (color: string) =>
            /^#[0-9A-Fa-f]{6}$/.test(color.trim());

          if (
            isValidHex(primary) &&
            isValidHex(secondary) &&
            isValidHex(accent) &&
            isValidHex(dark) &&
            isValidHex(light)
          ) {
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

      console.log(
        `✅ [CONTENT SERVICE] Geradas ${palettes.length} paletas customizadas para: "${colorDescription}"`,
      );

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
      Array<{
        name: string;
        primary: string;
        secondary: string;
        accent: string;
        dark: string;
        light: string;
      }>
    > = {
      azul: [
        {
          name: 'Azul Oceano',
          primary: '#1E40AF',
          secondary: '#3B82F6',
          accent: '#60A5FA',
          dark: '#1E3A8A',
          light: '#DBEAFE',
        },
        {
          name: 'Azul Celeste',
          primary: '#0EA5E9',
          secondary: '#38BDF8',
          accent: '#7DD3FC',
          dark: '#0C4A6E',
          light: '#E0F2FE',
        },
      ],
      verde: [
        {
          name: 'Verde Esmeralda',
          primary: '#059669',
          secondary: '#10B981',
          accent: '#34D399',
          dark: '#065F46',
          light: '#D1FAE5',
        },
        {
          name: 'Verde Menta',
          primary: '#10B981',
          secondary: '#34D399',
          accent: '#6EE7B7',
          dark: '#047857',
          light: '#ECFDF5',
        },
      ],
      roxo: [
        {
          name: 'Roxo Místico',
          primary: '#7C3AED',
          secondary: '#8B5CF6',
          accent: '#A78BFA',
          dark: '#5B21B6',
          light: '#F5F3FF',
        },
        {
          name: 'Roxo Real',
          primary: '#6B21A8',
          secondary: '#7C3AED',
          accent: '#8B5CF6',
          dark: '#581C87',
          light: '#F3E8FF',
        },
      ],
      rosa: [
        {
          name: 'Rosa Paixão',
          primary: '#E11D48',
          secondary: '#F43F5E',
          accent: '#FB7185',
          dark: '#9F1239',
          light: '#FFE4E6',
        },
        {
          name: 'Rosa Delicado',
          primary: '#EC4899',
          secondary: '#F472B6',
          accent: '#F9A8D4',
          dark: '#BE185D',
          light: '#FCE7F3',
        },
      ],
      vermelho: [
        {
          name: 'Vermelho Rubi',
          primary: '#DC2626',
          secondary: '#EF4444',
          accent: '#F87171',
          dark: '#991B1B',
          light: '#FEE2E2',
        },
        {
          name: 'Vermelho Fogo',
          primary: '#B91C1C',
          secondary: '#DC2626',
          accent: '#EF4444',
          dark: '#7F1D1D',
          light: '#FEF2F2',
        },
      ],
      laranja: [
        {
          name: 'Laranja Sunset',
          primary: '#EA580C',
          secondary: '#F97316',
          accent: '#FB923C',
          dark: '#C2410C',
          light: '#FFEDD5',
        },
        {
          name: 'Laranja Vibrante',
          primary: '#F97316',
          secondary: '#FB923C',
          accent: '#FDBA74',
          dark: '#EA580C',
          light: '#FFF7ED',
        },
      ],
      amarelo: [
        {
          name: 'Amarelo Sol',
          primary: '#EAB308',
          secondary: '#FACC15',
          accent: '#FDE047',
          dark: '#A16207',
          light: '#FEF9C3',
        },
        {
          name: 'Amarelo Dourado',
          primary: '#F59E0B',
          secondary: '#FBBF24',
          accent: '#FCD34D',
          dark: '#D97706',
          light: '#FEF3C7',
        },
      ],
    };

    let selectedPalettes: Array<{
      name: string;
      primary: string;
      secondary: string;
      accent: string;
      dark: string;
      light: string;
    }> = [];

    for (const [color, palettes] of Object.entries(colorMap)) {
      if (desc.includes(color)) {
        selectedPalettes.push(...palettes);
        break;
      }
    }

    if (selectedPalettes.length === 0) {
      selectedPalettes = [
        {
          name: 'Personalizada 1',
          primary: '#3B82F6',
          secondary: '#60A5FA',
          accent: '#93C5FD',
          dark: '#1E3A8A',
          light: '#DBEAFE',
        },
        {
          name: 'Personalizada 2',
          primary: '#10B981',
          secondary: '#34D399',
          accent: '#6EE7B7',
          dark: '#047857',
          light: '#ECFDF5',
        },
        {
          name: 'Personalizada 3',
          primary: '#8B5CF6',
          secondary: '#A78BFA',
          accent: '#C4B5FD',
          dark: '#6B21A8',
          light: '#FAF5FF',
        },
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
   * Orquestra múltiplas chamadas à IA com fallbacks
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
      faq: [],
      heroStats: [
        { value: '500+', label: 'Clientes Satisfeitos' },
        { value: '4.9★', label: 'Avaliação Média' },
        { value: '10+', label: 'Anos de Experiência' },
      ],
      features: [
        {
          title: 'Experiência Premium',
          description:
            'Muito mais que um serviço, uma verdadeira experiência de qualidade',
        },
        {
          title: 'Profissionais Qualificados',
          description: 'Equipe altamente treinada e experiente no que faz',
        },
        {
          title: 'Atendimento Fácil',
          description: 'Agende com total praticidade e rapidez',
        },
      ],
      aboutContent: {
        title: 'Do Sonho à Realidade',
        subtitle: 'Nossa empresa foi projetada para ser referência em qualidade',
        checklist: [
          'Profissionais certificados',
          'Produtos premium',
          'Ambiente climatizado',
        ],
      },
      serviceDescriptions: siteData.services.map((s) => ({
        name: s,
        description: 'Serviço de qualidade premium com resultados excepcionais',
      })),
      testimonials: [
        {
          name: 'Ana Silva',
          role: 'Cliente Satisfeita',
          text: 'Excelente serviço! Profissionais atenciosos e ambiente incrível.',
        },
        {
          name: 'Carlos Santos',
          role: 'Cliente Fiel',
          text: 'Superou todas as minhas expectativas! Qualidade premium.',
        },
        {
          name: 'Maria Costa',
          role: 'Cliente VIP',
          text: 'Simplesmente perfeito! A melhor experiência que já tive.',
        },
      ],
    };

    const getValue = <T>(
      result: PromiseSettledResult<T>,
      fallback: T,
      logName: string,
    ): T => {
      if (result.status === 'fulfilled') {
        if (Array.isArray(result.value) && result.value.length === 0) {
          console.warn(
            `IA retornou array vazio para ${logName}, usando fallback.`,
          );
          return fallback;
        }
        if (typeof result.value === 'string' && !result.value.trim()) {
          console.warn(
            `IA retornou string vazia para ${logName}, usando fallback.`,
          );
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
        name: siteData.name,
        area: siteData.area,
        slogan: siteData.slogan,
        originalDescription: siteData.description,
        targetAudience: siteData.targetAudience,
        differentials: siteData.differentials,
      }),
      this.rewriteServices({
        name: siteData.name,
        area: siteData.area,
        originalServices: siteData.services,
      }),
      this.generateFAQ({
        name: siteData.name,
        area: siteData.area,
        services: siteData.services,
      }),
      this.generateHeroStats({ name: siteData.name, area: siteData.area }),
      this.generateFeatures({
        name: siteData.name,
        area: siteData.area,
        services: siteData.services,
      }),
      this.generateAboutContent({
        name: siteData.name,
        area: siteData.area,
        description: siteData.description,
      }),
      this.generateServiceDescriptions({
        name: siteData.name,
        area: siteData.area,
        services: siteData.services,
      }),
      this.generateTestimonials({
        name: siteData.name,
        area: siteData.area,
        services: siteData.services,
      }),
    ]);

    const slogan = getValue(results[0], fallbacks.slogan, 'slogan');
    const description = getValue(results[1], fallbacks.description, 'descrição');
    const services = getValue(results[2], fallbacks.services, 'serviços');
    const faq = getValue(results[3], fallbacks.faq, 'FAQ');
    const heroStats = getValue(
      results[4],
      fallbacks.heroStats,
      'estatísticas da hero',
    );
    const features = getValue(results[5], fallbacks.features, 'features');
    const aboutContent = getValue(
      results[6],
      fallbacks.aboutContent,
      'conteúdo sobre',
    );
    const serviceDescriptions = getValue(
      results[7],
      fallbacks.serviceDescriptions,
      'descrições de serviços',
    );
    const testimonials = getValue(
      results[8],
      fallbacks.testimonials,
      'depoimentos',
    );

    return {
      slogan,
      description,
      services,
      faq,
      heroStats,
      features,
      aboutContent,
      serviceDescriptions,
      testimonials,
    };
  }
}

// Export singleton instance
export const contentRewritingService = new ContentRewritingService();
