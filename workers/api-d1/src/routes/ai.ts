// AI Proxy Routes
// Proxies AI service calls (Groq/Llama) so API keys never reach the frontend.
// The frontend sends the user message + conversation history,
// and this route calls the Groq API server-side.

import { Hono } from 'hono';
import type { Env, Variables } from '../index';
import { verifyJWT } from '../auth/jwt';

const aiRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// ─── Types ───────────────────────────────────────────────────────────────────

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type AiChatRequest = {
  message: string;
  conversationHistory?: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
};

// ─── System prompt (moved from frontend) ─────────────────────────────────────

const SYSTEM_PROMPT_TEMPLATE = `Você é um assistente virtual da plataforma MyEasyAI, uma plataforma de ferramentas com inteligência artificial para empresas.

Use as seguintes informações para responder às perguntas do usuário:

{{CONTEXT}}

---

Instruções:
- Responda sempre em português brasileiro
- Seja objetivo, útil e amigável
- Se não souber a resposta com base nas informações fornecidas, diga educadamente que não tem essa informação
- Não invente informações que não estão nos documentos
- Use formatação markdown para melhor legibilidade
- Seja conciso nas respostas, mas completo

REGRA IMPORTANTE - Ofertas de Upgrade:
Quando falar sobre planos de assinatura ou quando o contexto sugerir que o usuário pode se beneficiar de um plano superior:
- Sempre ofereça a opção de fazer upgrade
- Use este formato EXATO para criar links clicáveis: [Fazer upgrade agora](/dashboard?tab=subscription)
- Exemplo de uso: "Se quiser mais recursos, você pode [fazer upgrade do seu plano](/dashboard?tab=subscription) a qualquer momento!"
- Seja persuasivo mas não insistente - ofereça naturalmente quando fizer sentido

Links úteis que você pode usar:
- Upgrade/Assinatura: [Fazer upgrade](/dashboard?tab=subscription)
- Ver produtos: [Ver todos os produtos](/dashboard?tab=products)
- MyEasyWebsite: [Acessar MyEasyWebsite](/myeasywebsite)
- MyEasyPricing: [Acessar MyEasyPricing](/pricing)
- MyEasyCRM: [Acessar MyEasyCRM](/crm)
- MyEasyContent: [Acessar MyEasyContent](/myeasycontent)
- MyEasyAvatar: [Acessar MyEasyAvatar](/myeasyavatar)
- MyEasyCode: [Acessar MyEasyCode](/myeasycode)
- Business Guru: [Acessar Business Guru](/businessguru)

REGRA CRÍTICA - Correção automática de erros de digitação:
Os produtos da plataforma MyEasyAI são EXATAMENTE estes:
1. MyEasyPricing - precificação inteligente
2. MyEasyWebsite - criação de sites
3. MyEasyAvatar - garoto propaganda digital / avatar virtual
4. MyEasyCRM - gestão de clientes
5. MyEasyContent - criação de conteúdo
6. MyEasyCode - desenvolvimento de código
7. BusinessGuru - consultoria empresarial com IA

SEMPRE que o usuário digitar QUALQUER palavra que COMECE com "MyEasy" ou "Business" seguido de QUALQUER coisa, você DEVE:
1. Identificar qual dos 7 produtos acima o usuário está tentando mencionar
2. Ignorar completamente quaisquer letras, números ou caracteres extras no final
3. Responder sobre o produto correto como se o usuário tivesse digitado corretamente

Também corrija erros de digitação NO MEIO da palavra:
- MyEasyCRN, MyEasyCRK, MyEasyCRMM = MyEasyCRM
- MyEasyConten, MyEasyContente = MyEasyContent
- MyEasyPricin, MyEasyPriccing = MyEasyPricing
- E assim por diante para TODOS os produtos

NUNCA diga que não conhece um produto se a palavra for similar a qualquer um dos 7 produtos acima.`;

// ─── RAG Document Store (moved from frontend) ───────────────────────────────

type Document = {
  id: string;
  keywords: string;
  content: string;
};

const documents: Document[] = [
  {
    id: 'visao-geral',
    keywords:
      'plataforma sistema software aplicativo app ferramenta solução serviço SaaS inteligência artificial IA AI myeasyai dashboard painel produtos planos preço custo quanto custa assinatura mensal individual plus premium login cadastro entrar acessar pacotes pacote valores mensalidade',
    content: `# MyEasyAI - Visão Geral da Plataforma

MyEasyAI é uma plataforma completa de soluções de inteligência artificial para empresas e empreendedores.

## Produtos Disponíveis (7 produtos):
1. **MyEasyWebsite** - Criador de sites com IA
2. **Business Guru** - Consultoria de negócios com IA
3. **MyEasyPricing** - Ferramenta de precificação inteligente (calcular preços, margem de lucro)
4. **MyEasyCRM** - Sistema de gestão de clientes
5. **MyEasyContent** - Criador de conteúdo para redes sociais
6. **MyEasyAvatar** - Criador de avatares 3D (garoto propaganda digital, mascote)
7. **MyEasyCode** - Ambiente de desenvolvimento com IA

## Planos de Assinatura:
- **Individual**: R$ 29/mês - 1.000 tokens, 1 site, suporte por email
- **Plus**: R$ 49/mês (Mais Popular) - 10.000 tokens, 3 sites, suporte prioritário
- **Premium**: R$ 149/mês - 50.000 tokens, 5 sites, suporte 24/7

## Como Acessar:
1. Faça login na plataforma
2. Acesse o Dashboard
3. Vá para a aba "Produtos"
4. Clique em "Acessar" no produto desejado`,
  },
  {
    id: 'comecando-negocio',
    keywords:
      'começando negócio começar negócio novo negócio abrir empresa iniciar empresa empreender empreendedor primeira vez iniciante MEI microempreendedor pequena empresa startup dicas recomendação recomendar sugestão o que usar qual usar por onde começar primeiros passos',
    content: `# Recomendações para Quem Está Começando um Negócio

Se você está começando um negócio, aqui estão nossas recomendações de produtos na ordem de prioridade:

## 1. MyEasyPricing (ESSENCIAL para iniciantes!)
**Por que?** Antes de vender qualquer coisa, você precisa saber QUANTO COBRAR pelos seus produtos ou serviços.

## 2. MyEasyWebsite
Crie sua presença online com um site profissional em minutos.

## 3. Business Guru
Receba orientações estratégicas personalizadas para seu tipo de negócio.

## 4. MyEasyContent
Comece a divulgar nas redes sociais com conteúdo profissional.

## 5. MyEasyCRM
Organize seus primeiros clientes e acompanhe vendas.

## Dica para MEI e Microempreendedores:
Comece com o plano Individual (R$ 29/mês) e use principalmente o **MyEasyPricing**!`,
  },
  {
    id: 'myeasypricing',
    keywords:
      'myeasypricing precificação calcular preço quanto cobrar markup margem de lucro preço de venda custos impostos tributação MEI simples nacional',
    content: `# MyEasyPricing - Ferramenta de Precificação

Calcule o preço ideal dos seus produtos considerando TODOS os custos.

## O que o MyEasyPricing Calcula:
1. **Custos Diretos**: Matéria-prima, embalagem
2. **Custos Indiretos**: Aluguel, luz, internet, salários
3. **Custos Ocultos**: Taxas de cartão, comissões, frete
4. **Impostos**: Simples Nacional, Lucro Presumido, MEI`,
  },
  {
    id: 'myeasywebsite',
    keywords:
      'myeasywebsite criar site fazer site landing page website construtor de sites',
    content: `# MyEasyWebsite - Criador de Sites com IA

Crie sites profissionais em minutos através de uma conversa guiada com IA.`,
  },
  {
    id: 'myeasycrm',
    keywords:
      'myeasycrm CRM gestão de clientes pipeline de vendas funil de vendas leads',
    content: `# MyEasyCRM - Sistema de Gestão de Clientes

Gerencie contatos, empresas e pipeline de vendas em um só lugar.`,
  },
  {
    id: 'myeasycontent',
    keywords:
      'myeasycontent conteúdo posts redes sociais Instagram Facebook LinkedIn TikTok calendário editorial',
    content: `# MyEasyContent - Criador de Conteúdo para Redes Sociais

Gere posts, legendas e calendários editoriais com IA.`,
  },
  {
    id: 'myeasyavatar',
    keywords:
      'myeasyavatar avatar 3D garoto propaganda digital mascote personagem',
    content: `# MyEasyAvatar - Criador de Avatar 3D

Crie avatares 3D personalizados para uso como garoto propaganda digital ou mascote.`,
  },
  {
    id: 'business-guru',
    keywords:
      'businessguru consultoria empresarial mentor negócios coaching estratégia',
    content: `# Business Guru - Consultoria de Negócios com IA

Seu consultor virtual para orientações estratégicas personalizadas.`,
  },
  {
    id: 'myeasycode',
    keywords:
      'myeasycode programar código IDE editor desenvolvimento web JavaScript TypeScript React',
    content: `# MyEasyCode - IDE de Desenvolvimento com IA

Programe diretamente no navegador com assistente de IA integrado.`,
  },
];

const productNames = [
  'myeasypricing',
  'myeasywebsite',
  'myeasyavatar',
  'myeasycrm',
  'myeasycontent',
  'myeasycode',
  'businessguru',
  'business guru',
];

function cleanProductName(word: string): string {
  const lower = word.toLowerCase();
  for (const product of productNames) {
    if (lower.startsWith(product)) return product;
  }
  for (const product of productNames) {
    if (lower.includes(product.replace(/\s/g, ''))) return product;
  }
  return lower;
}

function searchDocuments(query: string): string[] {
  const cleanedQuery = query
    .split(/\s+/)
    .map((word) => {
      if (
        word.toLowerCase().startsWith('myeasy') ||
        word.toLowerCase().startsWith('business')
      ) {
        return cleanProductName(word);
      }
      return word.toLowerCase();
    })
    .join(' ');

  const queryWords = cleanedQuery.split(/\s+/).filter((w) => w.length > 2);

  const scored = documents.map((doc) => {
    const searchText = (doc.keywords + ' ' + doc.content).toLowerCase();
    let score = 0;
    for (const word of queryWords) {
      const regex = new RegExp(word, 'gi');
      const matches = searchText.match(regex);
      if (matches) {
        score += matches.length * word.length;
      }
      if (word.length > 5 && !matches) {
        const partialWord = word.substring(0, Math.floor(word.length * 0.7));
        const partialRegex = new RegExp(partialWord, 'gi');
        const partialMatches = searchText.match(partialRegex);
        if (partialMatches) {
          score += partialMatches.length * (word.length * 0.5);
        }
      }
    }
    return { doc, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((s) => s.doc.content);
}

function getContext(query: string): string {
  const results = searchDocuments(query);
  if (results.length === 0) return documents[0].content;
  return results.join('\n\n---\n\n');
}

// ─── Auth middleware helper ──────────────────────────────────────────────────

async function requireAuth(c: any): Promise<string | null> {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const payload = await verifyJWT(token, c.env.JWT_SECRET);
  return payload?.sub ?? null;
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * POST /ai/chat
 * Proxies the assistant chat to Groq API.
 * Requires valid JWT. The Groq API key stays server-side.
 */
aiRoutes.post('/chat', async (c) => {
  // 1. Authenticate
  const userId = await requireAuth(c);
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // 2. Parse request
  const body = await c.req.json<AiChatRequest>();
  const { message, conversationHistory = [], temperature = 0.7, maxTokens = 1024 } = body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return c.json({ error: 'message is required' }, 400);
  }

  // 3. Build system prompt with RAG context (server-side)
  const context = getContext(message);
  const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace('{{CONTEXT}}', context);

  // 4. Assemble messages for the LLM
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: message },
  ];

  // 5. Call Groq API (server-side — key never leaves the Worker)
  const groqApiKey = c.env.GROQ_API_KEY;
  if (!groqApiKey) {
    console.error('[AI] GROQ_API_KEY not configured');
    return c.json({ error: 'AI service not configured' }, 503);
  }

  try {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error(`[AI] Groq API error ${groqResponse.status}: ${errorText}`);
      return c.json({ error: 'AI service error' }, 502);
    }

    const data = await groqResponse.json() as {
      choices: Array<{ message: { content: string } }>;
    };
    const content = data.choices?.[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.';

    return c.json({ data: { content }, success: true });
  } catch (error) {
    console.error('[AI] Proxy error:', error);
    return c.json({ error: 'AI service unavailable' }, 502);
  }
});

export { aiRoutes };
