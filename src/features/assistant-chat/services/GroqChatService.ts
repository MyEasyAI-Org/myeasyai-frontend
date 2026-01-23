import Groq from 'groq-sdk';
import { getContext } from '../data/docs';

// Types
export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type ChatCompletionOptions = {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
};

// System prompt for the assistant
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

Exemplos de correção (mas NÃO se limite a estes - corrija QUALQUER variação):
- MyEasyCRM + qualquer coisa (MyEasyCRMabc, MyEasyCRM123, MyEasyCRMxyz) = MyEasyCRM
- MyEasyContent + qualquer coisa = MyEasyContent
- MyEasyPricing + qualquer coisa = MyEasyPricing
- MyEasyWebsite + qualquer coisa = MyEasyWebsite
- MyEasyAvatar + qualquer coisa = MyEasyAvatar
- MyEasyCode + qualquer coisa = MyEasyCode
- BusinessGuru + qualquer coisa = BusinessGuru

Também corrija erros de digitação NO MEIO da palavra:
- MyEasyCRN, MyEasyCRK, MyEasyCRMM = MyEasyCRM
- MyEasyConten, MyEasyContente = MyEasyContent
- MyEasyPricin, MyEasyPriccing = MyEasyPricing
- E assim por diante para TODOS os produtos

NUNCA diga que não conhece um produto se a palavra for similar a qualquer um dos 7 produtos acima.`;

class GroqChatService {
  private client: Groq | null = null;
  private model = 'llama-3.3-70b-versatile';

  private getClient(): Groq {
    if (!this.client) {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) {
        throw new Error('VITE_GROQ_API_KEY not configured');
      }
      this.client = new Groq({
        apiKey,
        dangerouslyAllowBrowser: true,
      });
    }
    return this.client;
  }

  /**
   * Build the system prompt with RAG context
   */
  private buildSystemPrompt(userMessage: string): string {
    const context = getContext(userMessage);
    return SYSTEM_PROMPT_TEMPLATE.replace('{{CONTEXT}}', context);
  }

  /**
   * Send a message and get a response
   */
  async sendMessage(
    userMessage: string,
    conversationHistory: ChatMessage[] = [],
    options?: Partial<ChatCompletionOptions>
  ): Promise<string> {
    try {
      const client = this.getClient();
      const systemPrompt = this.buildSystemPrompt(userMessage);

      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user', content: userMessage },
      ];

      const completion = await client.chat.completions.create({
        messages,
        model: this.model,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1024,
      });

      return (
        completion.choices[0]?.message?.content ||
        'Desculpe, não consegui gerar uma resposta.'
      );
    } catch (error) {
      console.error('[GroqChatService] Error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const groqChatService = new GroqChatService();
