// Cliente HTTP para integração com Google Gemini AI API
// Este arquivo contém APENAS o wrapper da API, sem lógica de negócio

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent';

export interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

/**
 * Cliente HTTP genérico para chamar a API do Gemini
 * Esta função NÃO contém lógica de negócio, apenas faz a chamada HTTP
 */
export class GeminiClient {
  /**
   * Chama a API do Gemini com um prompt e configurações
   * @param prompt - O texto do prompt a ser enviado
   * @param temperature - Temperatura de geração (0-1)
   * @returns A resposta de texto da API
   */
  async call(prompt: string, temperature: number = 0.9): Promise<string> {
    try {
      console.log('🤖 [GEMINI CLIENT] Enviando prompt para o Gemini 2.0 Flash...');
      console.log('📝 Prompt:', prompt.substring(0, 150) + '...');

      const requestBody: GeminiRequest = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      };

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [GEMINI CLIENT] Erro da API:', response.status, errorText);
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data: GeminiResponse = await response.json();
      const result = data.candidates[0]?.content?.parts[0]?.text || '';

      console.log('✅ [GEMINI CLIENT] Resposta recebida!');
      console.log('📄 Conteúdo:', result.substring(0, 200) + '...');

      return result;
    } catch (error) {
      console.error('❌ [GEMINI CLIENT] Erro ao chamar Gemini API:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const geminiClient = new GeminiClient();
