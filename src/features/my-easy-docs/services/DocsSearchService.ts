// =============================================
// MyEasyDocs - Search Service
// Handles document search and context retrieval
// =============================================

import { d1Client, type D1DocsSearchResult } from '../../../lib/api-clients/d1-client';
import { authService } from '../../../services/AuthServiceV2';
import { geminiClient } from '../../../lib/api-clients/gemini-client';

/**
 * Search result with relevance scoring
 */
export interface SearchResult {
  chunkId: string;
  documentId: string;
  documentName: string;
  content: string;
  chunkIndex: number;
  relevanceScore: number;
}

/**
 * Document context for AI
 */
export interface DocumentContext {
  text: string;
  sources: Array<{
    documentId: string;
    documentName: string;
  }>;
}

/**
 * Gets the current authenticated user ID.
 */
async function getCurrentUserId(): Promise<string> {
  await authService.waitForInit();
  const authUser = authService.getUser();

  if (authUser?.uuid) {
    return authUser.uuid;
  }

  throw new Error('[DocsSearchService] User not authenticated');
}

/**
 * Prompt para expandir a query com sinônimos e termos relacionados
 */
const QUERY_EXPANSION_PROMPT = `Você é um assistente de busca. Dada uma pergunta do usuário, gere termos de busca adicionais que ajudariam a encontrar informações relevantes em documentos.

REGRAS:
1. Retorne APENAS uma lista de termos separados por vírgula
2. Inclua sinônimos, termos relacionados e variações
3. Máximo de 5 termos adicionais
4. Não repita a pergunta original
5. Foque em palavras-chave importantes

EXEMPLO:
Pergunta: "qual é o prazo de entrega?"
Resposta: entrega, prazo, dias úteis, envio, tempo de envio

Pergunta: "como cancelar minha assinatura?"
Resposta: cancelamento, assinatura, cancelar, desistir, encerrar conta`;

export const DocsSearchService = {
  /**
   * Expande a query usando IA para gerar termos relacionados
   * @param query - Query original do usuário
   * @returns Array com a query original + termos expandidos
   */
  async expandQuery(query: string): Promise<string[]> {
    try {
      const prompt = `${QUERY_EXPANSION_PROMPT}\n\nPergunta: "${query}"\nResposta:`;
      const response = await geminiClient.call(prompt, 0.3);

      // Parse the comma-separated terms
      const expandedTerms = response
        .split(',')
        .map(term => term.trim().toLowerCase())
        .filter(term => term.length > 2);

      // Return original query + expanded terms
      return [query, ...expandedTerms];
    } catch (error) {
      console.warn('[DocsSearchService] Query expansion failed, using original:', error);
      return [query];
    }
  },

  /**
   * Busca chunks relevantes para uma query
   * @param query - Texto de busca
   * @param limit - Limite de resultados (default: 10)
   */
  async searchChunks(query: string, limit = 10): Promise<SearchResult[]> {
    const userId = await getCurrentUserId();

    const response = await d1Client.searchDocsChunks(userId, query, limit);

    if (!response.data || !Array.isArray(response.data)) {
      return [];
    }

    // Map and rank results
    return this.rankResults(response.data, query);
  },

  /**
   * Busca chunks usando query expansion para melhor cobertura
   * Faz múltiplas buscas com termos expandidos e combina resultados
   * @param query - Query original do usuário
   * @param limit - Limite total de resultados
   */
  async searchWithExpansion(query: string, limit = 25): Promise<SearchResult[]> {
    const userId = await getCurrentUserId();

    // Expand the query
    const queries = await this.expandQuery(query);

    // Search with all queries in parallel
    const searchPromises = queries.map(q =>
      d1Client.searchDocsChunks(userId, q, Math.ceil(limit / queries.length) + 5)
    );

    const results = await Promise.all(searchPromises);

    // Combine and deduplicate results
    const seenChunks = new Set<string>();
    const combinedResults: D1DocsSearchResult[] = [];

    for (const response of results) {
      if (response.data && Array.isArray(response.data)) {
        for (const chunk of response.data) {
          if (!seenChunks.has(chunk.chunk_id)) {
            seenChunks.add(chunk.chunk_id);
            combinedResults.push(chunk);
          }
        }
      }
    }

    // Rank all combined results against the original query
    const ranked = this.rankResults(combinedResults, query);

    // Return top results
    return ranked.slice(0, limit);
  },

  /**
   * Rankeia resultados por relevância
   * Usa uma pontuação simples baseada em correspondência de termos
   * @param chunks - Chunks retornados pela busca
   * @param query - Query original
   */
  rankResults(chunks: D1DocsSearchResult[], query: string): SearchResult[] {
    const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);

    const scored = chunks.map((chunk) => {
      const contentLower = chunk.content.toLowerCase();
      let score = 0;

      // Score por termo encontrado
      for (const term of queryTerms) {
        const regex = new RegExp(term, 'gi');
        const matches = contentLower.match(regex);
        if (matches) {
          score += matches.length;
        }
      }

      // Bonus para correspondência exata da query completa
      if (contentLower.includes(query.toLowerCase())) {
        score += 5;
      }

      return {
        chunkId: chunk.chunk_id,
        documentId: chunk.document_id,
        documentName: chunk.document_name,
        content: chunk.content,
        chunkIndex: chunk.chunk_index,
        relevanceScore: score,
      };
    });

    // Ordena por relevância (maior primeiro)
    return scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
  },

  /**
   * Obtém contexto dos chunks para uso no prompt da IA
   * @param results - Resultados da busca
   * @param maxTokens - Limite aproximado de tokens (default: 3000)
   */
  getDocumentContext(results: SearchResult[], maxTokens = 3000): DocumentContext {
    if (results.length === 0) {
      return { text: '', sources: [] };
    }

    // Aproximação: 1 token ≈ 4 caracteres
    const maxChars = maxTokens * 4;

    let contextText = '';
    const sourcesMap = new Map<string, string>();

    for (const result of results) {
      const chunkText = `[Documento: ${result.documentName}]\n${result.content}\n\n`;

      // Check if adding this chunk would exceed limit
      if (contextText.length + chunkText.length > maxChars) {
        break;
      }

      contextText += chunkText;
      sourcesMap.set(result.documentId, result.documentName);
    }

    // Build unique sources array
    const sources = Array.from(sourcesMap.entries()).map(([documentId, documentName]) => ({
      documentId,
      documentName,
    }));

    return {
      text: contextText.trim(),
      sources,
    };
  },

  /**
   * Busca e retorna contexto formatado para a IA
   * Combina busca + ranking + formatação em uma chamada
   * @param query - Texto de busca
   * @param limit - Limite de chunks (default: 10)
   * @param maxTokens - Limite de tokens no contexto (default: 3000)
   */
  async searchAndGetContext(
    query: string,
    limit = 10,
    maxTokens = 3000
  ): Promise<DocumentContext> {
    const results = await this.searchChunks(query, limit);
    return this.getDocumentContext(results, maxTokens);
  },

  /**
   * Busca com query expansion e retorna contexto expandido para a IA
   * Usa IA para expandir termos de busca e busca mais agressivamente
   * @param query - Texto de busca
   * @param limit - Limite de chunks (default: 25)
   * @param maxTokens - Limite de tokens no contexto (default: 5000)
   */
  async searchWithExpansionAndGetContext(
    query: string,
    limit = 25,
    maxTokens = 5000
  ): Promise<DocumentContext & { expandedQueries: string[] }> {
    // Get expanded queries for transparency
    const expandedQueries = await this.expandQuery(query);

    // Search with expansion
    const results = await this.searchWithExpansion(query, limit);

    // Get context with higher token limit
    const context = this.getDocumentContext(results, maxTokens);

    return {
      ...context,
      expandedQueries,
    };
  },
};
