/**
 * Social Content Prompts — MyEasyContent
 * Moved from src/services/SocialContentService.ts
 *
 * TONE_DESCRIPTIONS and NETWORK_CONFIG are also stored here
 * since they are business logic used in prompt construction.
 */

import type { PromptBuilder } from './index';

// Tone descriptions (moved from frontend)
const TONE_DESCRIPTIONS: Record<string, string> = {
  professional: 'profissional e corporativo, com linguagem formal e respeitosa',
  casual: 'casual e amigável, como se estivesse conversando com um amigo',
  funny: 'divertido e bem-humorado, usando memes e referências populares',
  inspirational: 'inspiracional e motivador, que toque o coração das pessoas',
  educational: 'educativo e informativo, ensinando algo valioso',
  promotional: 'promocional focado em vendas, com gatilhos de urgência e escassez',
};

// Network configs (moved from frontend)
const NETWORK_CONFIG: Record<string, { name: string; maxChars: number; features: string }> = {
  instagram: { name: 'Instagram', maxChars: 2200, features: 'emojis, hashtags no final, quebras de linha para legibilidade' },
  facebook: { name: 'Facebook', maxChars: 63206, features: 'texto mais longo, emojis moderados, links são bem-vindos' },
  linkedin: { name: 'LinkedIn', maxChars: 3000, features: 'tom profissional, hashtags no final, storytelling corporativo' },
  twitter: { name: 'Twitter/X', maxChars: 280, features: 'texto curto e impactante, hashtags no texto, threads se necessário' },
  tiktok: { name: 'TikTok', maxChars: 2200, features: 'linguagem jovem e viral, hashtags trending, ganchos fortes' },
  youtube: { name: 'YouTube', maxChars: 5000, features: 'descrição completa, timestamps, links e CTAs' },
};

function getTone(tone: string): string {
  return TONE_DESCRIPTIONS[tone] || TONE_DESCRIPTIONS.professional;
}

function getNet(network: string) {
  return NETWORK_CONFIG[network] || NETWORK_CONFIG.instagram;
}

export const socialContentPrompts: Record<string, PromptBuilder> = {

  'social.generateFeedPost': (p) => {
    const net = getNet(p.network);
    const toneDesc = getTone(p.tone);
    return `Você é um especialista em copywriting para redes sociais, com anos de experiência criando conteúdo viral.

CONTEXTO DO NEGÓCIO:
- Nome da empresa: ${p.businessName}
- Nicho: ${p.niche}
- Público-alvo: ${p.audience}
- Tom de voz desejado: ${toneDesc}

REDE SOCIAL: ${net.name}
- Limite: ${net.maxChars} caracteres
- Características: ${net.features}

TEMA DO POST: ${p.topic}
${p.objective ? `OBJETIVO: ${p.objective}` : ''}

TAREFA: Crie um post COMPLETO e ENVOLVENTE para o feed do ${net.name}.

REQUISITOS:
1. Use o tom de voz ${toneDesc}
2. Comece com um GANCHO poderoso que prenda a atenção
3. Desenvolva o conteúdo de forma envolvente
4. Termine com uma CHAMADA PARA AÇÃO clara
5. Use emojis de forma estratégica (não exagere)
6. Respeite o limite de caracteres
7. Seja ORIGINAL e AUTÊNTICO - evite clichês

${p.includeHashtags === 'true' ? 'INCLUA: Uma seção de hashtags relevantes ao final (5-10 hashtags)' : ''}
${p.includeImageDescription === 'true' ? 'INCLUA: Uma descrição de imagem ideal para acompanhar o post (após as hashtags)' : ''}

FORMATO DE SAÍDA:
POST:
[conteúdo do post]

${p.includeHashtags === 'true' ? 'HASHTAGS:\n[hashtags separadas por espaço]' : ''}
${p.includeImageDescription === 'true' ? 'IMAGEM:\n[descrição da imagem ideal]' : ''}

Seja criativo e gere um post que realmente engaje o público!`;
  },

  'social.generateCaption': (p) => {
    const net = getNet(p.network);
    const toneDesc = getTone(p.tone);
    return `Você é um especialista em legendas virais para redes sociais.

CONTEXTO:
- Empresa: ${p.businessName} (${p.niche})
- Público: ${p.audience}
- Tom: ${toneDesc}
- Rede: ${net.name}

TEMA: ${p.topic}
${p.objective ? `OBJETIVO: ${p.objective}` : ''}

TAREFA: Crie uma LEGENDA envolvente e cativante.

REQUISITOS:
1. Seja CONCISO mas IMPACTANTE
2. Use o tom ${p.tone}
3. Comece com algo que prenda a atenção
4. Inclua emojis estratégicos
5. Termine com pergunta ou CTA para gerar engajamento
6. Máximo 300 caracteres para a legenda principal

${p.includeHashtags === 'true' ? 'INCLUA: 8-15 hashtags relevantes' : ''}

FORMATO:
LEGENDA:
[texto da legenda]

${p.includeHashtags === 'true' ? 'HASHTAGS:\n[hashtags]' : ''}`;
  },

  'social.generateStoryScript': (p) => {
    const toneDesc = getTone(p.tone);
    return `Você é um especialista em conteúdo para Stories de Instagram/Facebook.

CONTEXTO:
- Empresa: ${p.businessName} (${p.niche})
- Público: ${p.audience}
- Tom: ${toneDesc}

TEMA: ${p.topic}
${p.objective ? `OBJETIVO: ${p.objective}` : ''}

TAREFA: Crie um roteiro de SEQUÊNCIA DE STORIES (4-6 stories).

REQUISITOS:
1. Cada story deve ter texto curto (máximo 100 caracteres)
2. Primeira story: GANCHO que gere curiosidade
3. Stories do meio: desenvolva a narrativa
4. Última story: CTA forte (arraste para cima, responda, etc)
5. Indique elementos visuais (stickers, enquetes, perguntas)
6. Use o tom ${p.tone}

FORMATO:
STORY 1:
[Texto do story]
[Elementos visuais: sticker de pergunta, gif, etc]

STORY 2:
[Texto do story]
[Elementos visuais]

... (continue até STORY 6 se necessário)

Crie uma sequência que prenda a atenção do início ao fim!`;
  },

  'social.generateReelScript': (p) => {
    const net = getNet(p.network);
    const toneDesc = getTone(p.tone);
    return `Você é um especialista em vídeos curtos virais (Reels/TikTok).

CONTEXTO:
- Empresa: ${p.businessName} (${p.niche})
- Público: ${p.audience}
- Tom: ${toneDesc}
- Plataforma: ${net.name}

TEMA: ${p.topic}
${p.objective ? `OBJETIVO: ${p.objective}` : ''}

TAREFA: Crie um ROTEIRO COMPLETO para um Reel/TikTok de 30-60 segundos.

ESTRUTURA OBRIGATÓRIA:
1. GANCHO (0-3s): Frase ou ação que prende IMEDIATAMENTE
2. DESENVOLVIMENTO (3-25s): Conteúdo principal
3. CLÍMAX (25-35s): Ponto alto do vídeo
4. CTA (35-60s): Chamada para ação

REQUISITOS:
1. Gancho PODEROSO nos primeiros 3 segundos
2. Ritmo dinâmico, sem enrolação
3. Tom ${p.tone}
4. Indique: falas, texto na tela, ações, transições
5. Sugira áudio/música se relevante

${p.includeHashtags === 'true' ? 'INCLUA: 10-15 hashtags populares da plataforma' : ''}

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

${p.includeHashtags === 'true' ? 'HASHTAGS:\n[hashtags]' : ''}

Crie um roteiro que tenha potencial viral!`;
  },

  'social.generateContentIdeas': (p) =>
`Você é um estrategista de conteúdo criativo para redes sociais.

CONTEXTO:
- Empresa: ${p.businessName}
- Nicho: ${p.niche}
- Público: ${p.audience}
- Redes: ${p.networks}

TAREFA: Gere ${p.count || '10'} IDEIAS CRIATIVAS de conteúdo.

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

Seja criativo e pense fora da caixa!`,

  'social.generateHashtags': (p) => {
    const net = getNet(p.network);
    return `Você é um especialista em hashtags e algoritmos de redes sociais.

CONTEXTO:
- Tema: ${p.topic}
- Nicho: ${p.niche}
- Rede: ${net.name}

TAREFA: Gere ${p.count || '20'} HASHTAGS estratégicas.

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
  },

  'social.generateBestTimes': (p) => {
    const net = getNet(p.network);
    return `Você é um analista de métricas de redes sociais.

CONTEXTO:
- Rede: ${net.name}
- Nicho: ${p.niche}
- Público: ${p.audience}

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
  },

};
