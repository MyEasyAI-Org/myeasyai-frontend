// =============================================
// MyEasyDocs - AI Service
// Handles AI-powered document Q&A
// =============================================

import { geminiClient } from '../../../lib/api-clients/gemini-client';
import { DocsSearchService, type DocumentContext } from './DocsSearchService';
import type { DocsChatMessage, DocumentSource } from '../types';

/**
 * AI response with sources
 */
export interface AIResponse {
  answer: string;
  sources: DocumentSource[];
}

/**
 * System prompt for the document assistant
 */
const SYSTEM_PROMPT = `Você é um assistente de documentos inteligente e proativo. Sua função é ajudar os usuários a encontrar e entender informações nos documentos deles.

DIRETRIZES:
1. **Priorize o contexto dos documentos**, mas seja inteligente ao interpretar
2. **Faça inferências razoáveis** quando a informação não estiver explícita, mas houver dados relacionados
3. **Conecte informações** de diferentes partes dos documentos para dar respostas mais completas
4. Se encontrar informação **parcialmente relacionada**, apresente-a e explique como se relaciona com a pergunta
5. **Cite o documento** quando mencionar informações específicas (ex: "Segundo o documento X...")
6. Se **não encontrar informação relevante**, sugira:
   - Perguntas alternativas que podem ser respondidas com os documentos disponíveis
   - Quais tipos de informação você encontrou nos documentos
7. Responda sempre em **português brasileiro**
8. Use **formatação markdown** (listas, negrito, etc.) para melhorar a legibilidade
9. Se a pergunta for vaga, tente responder com o que tem disponível E peça esclarecimentos adicionais
10. Seja **proativo**: se notar informações úteis relacionadas, mencione-as

RACIOCÍNIO LÓGICO E DEDUTIVO:
Quando os documentos contiverem proposições lógicas, pistas, regras ou enigmas:

1. **Identifique TODAS as proposições/regras** em cada documento
2. **Liste as variáveis e restrições** do problema
3. **Aplique lógica dedutiva passo a passo:**
   - Se A implica B, e temos A, então B é verdade
   - Se X não pode ser Y, elimine essa possibilidade
   - Use eliminação e dedução para resolver
4. **Mostre seu raciocínio completo** antes da conclusão
5. **Verifique a consistência** da solução com todas as regras

TRANSPARÊNCIA NAS INFERÊNCIAS:
Quando fizer inferências ou conexões lógicas, seja EXPLÍCITO sobre isso:

1. **Diferencie informação direta de inferência:**
   - Informação direta: "O documento X afirma que..."
   - Inferência: "**Inferência:** Com base em [dado A] e [dado B], posso concluir que..."

2. **Mostre o raciocínio passo a passo:**
   - "📋 **Dados encontrados:** [liste os dados relevantes]"
   - "🔗 **Conexão lógica:** [explique como os dados se relacionam]"
   - "💡 **Conclusão:** [sua resposta final]"

3. **Indique o nível de confiança:**
   - Alta confiança: informação explícita no documento
   - Média confiança: inferência baseada em dados relacionados
   - Baixa confiança: suposição que precisa de mais informações

EXEMPLO DE RESPOSTA COM RACIOCÍNIO LÓGICO:
"📋 **Dados encontrados:**
- Documento 'casas.txt': 'Existem 4 casas: vermelha, azul, verde, amarela'
- Documento 'besouro.txt': 'O besouro não mora na casa vermelha nem na azul'
- Documento 'abelha.txt': 'A abelha mora na casa amarela'

🔗 **Raciocínio dedutivo:**
1. A abelha mora na casa amarela (dado direto)
2. O besouro não pode morar na vermelha, azul ou amarela (regras)
3. Portanto, o besouro mora na casa verde (única opção restante)

💡 **Conclusão:**
- Abelha → Casa Amarela
- Besouro → Casa Verde"

EXEMPLO DE RESPOSTA COM INFERÊNCIA:
"📋 **Dados encontrados:**
- No documento 'Contrato.pdf': 'O prazo de processamento é de 3 dias úteis'
- No documento 'FAQ.pdf': 'Após o processamento, o envio leva 2 dias úteis'

🔗 **Conexão lógica:**
O prazo total seria a soma do processamento + envio.

💡 **Conclusão (inferência):**
O prazo total estimado é de **5 dias úteis** (3 de processamento + 2 de envio).

⚠️ *Esta é uma inferência baseada na combinação de informações. O documento não menciona explicitamente o prazo total.*"`;


export const DocsAIService = {
  /**
   * Constrói o prompt completo para a IA
   * @param question - Pergunta do usuário
   * @param context - Contexto dos documentos
   * @param history - Histórico de mensagens (últimas 5)
   * @param expandedTerms - Termos expandidos usados na busca (opcional)
   */
  buildPrompt(
    question: string,
    context: DocumentContext,
    history: DocsChatMessage[] = [],
    expandedTerms: string[] = []
  ): string {
    let prompt = SYSTEM_PROMPT + '\n\n';

    // Add document context
    if (context.text) {
      prompt += '## CONTEXTO DOS DOCUMENTOS:\n\n';
      prompt += context.text;
      prompt += '\n\n';
    } else {
      prompt += '## CONTEXTO DOS DOCUMENTOS:\n\n';
      prompt += 'Nenhum documento relevante foi encontrado para esta pergunta.\n\n';
    }

    // Show expanded search terms for transparency
    if (expandedTerms.length > 0) {
      prompt += '## TERMOS DE BUSCA EXPANDIDOS:\n\n';
      prompt += `Além da pergunta original, também busquei por: ${expandedTerms.join(', ')}\n\n`;
    }

    // Add conversation history (last 5 messages)
    if (history.length > 0) {
      prompt += '## HISTÓRICO DA CONVERSA:\n\n';
      const recentHistory = history.slice(-5);
      for (const msg of recentHistory) {
        const role = msg.role === 'user' ? 'Usuário' : 'Assistente';
        prompt += `${role}: ${msg.content}\n\n`;
      }
    }

    // Add current question
    prompt += '## PERGUNTA ATUAL:\n\n';
    prompt += question;
    prompt += '\n\n';
    prompt += '## SUA RESPOSTA:';

    return prompt;
  },

  /**
   * Faz uma pergunta sobre os documentos
   * @param question - Pergunta do usuário
   * @param history - Histórico de mensagens
   * @param useExpansion - Se deve usar query expansion (default: true)
   */
  async askQuestion(
    question: string,
    history: DocsChatMessage[] = [],
    useExpansion = true
  ): Promise<AIResponse> {
    try {
      // Search for relevant document chunks (with or without expansion)
      let context;
      let expandedTerms: string[] = [];

      if (useExpansion) {
        // Use query expansion for better coverage
        const expandedContext = await DocsSearchService.searchWithExpansionAndGetContext(
          question,
          25, // More chunks for better context
          5000 // More context for complex queries
        );
        context = expandedContext;
        expandedTerms = expandedContext.expandedQueries.slice(1); // Remove original query
      } else {
        context = await DocsSearchService.searchAndGetContext(question, 15, 4000);
      }

      // Build the prompt with expansion info
      const prompt = this.buildPrompt(question, context, history, expandedTerms);

      // Call the AI with slightly higher temperature for more creative responses
      const answer = await geminiClient.call(prompt, 0.75);

      // Map sources to the expected format
      const sources: DocumentSource[] = context.sources.map((source) => ({
        document_id: source.documentId,
        document_name: source.documentName,
      }));

      return {
        answer: answer.trim(),
        sources,
      };
    } catch (error) {
      console.error('[DocsAIService] Error:', error);
      throw new Error('Não foi possível processar sua pergunta. Tente novamente.');
    }
  },

  /**
   * Gera uma resposta quando não há documentos
   */
  getNoDocumentsResponse(): AIResponse {
    return {
      answer:
        'Você ainda não tem documentos enviados. Faça upload de alguns arquivos para que eu possa ajudá-lo a encontrar informações neles.',
      sources: [],
    };
  },

  /**
   * Gera sugestões de perguntas baseadas nos documentos
   * @param documentNames - Nomes dos documentos do usuário
   */
  async getSuggestions(documentNames: string[]): Promise<string[]> {
    if (documentNames.length === 0) {
      return [
        'Como posso usar o assistente de documentos?',
        'Quais tipos de arquivos posso enviar?',
        'Como fazer upload de documentos?',
      ];
    }

    // Simple suggestions based on document types
    const suggestions: string[] = [];

    for (const name of documentNames.slice(0, 3)) {
      suggestions.push(`O que contém o documento "${name}"?`);
    }

    if (documentNames.length > 3) {
      suggestions.push('Resuma os principais temas dos meus documentos');
    }

    return suggestions;
  },
};
