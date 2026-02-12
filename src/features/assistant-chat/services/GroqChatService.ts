// Assistant Chat Service
// Calls the backend AI proxy at /ai/chat instead of calling Groq directly.
// The API key and system prompt stay server-side — never shipped to the browser.

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

class GroqChatService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = import.meta.env.VITE_CLOUDFLARE_D1_API_URL || 'https://connect.myeasyai.com';
  }

  /**
   * Get the JWT token from localStorage (same as other API calls)
   */
  private getAuthToken(): string | null {
    try {
      // Try the D1 token first, then fall back to Supabase session
      const d1Token = localStorage.getItem('d1_jwt_token');
      if (d1Token) return d1Token;

      // Fall back to Supabase session token
      const supabaseAuth = localStorage.getItem('sb-abmixlwlizdyvlxrizmi-auth-token');
      if (supabaseAuth) {
        const parsed = JSON.parse(supabaseAuth);
        return parsed?.access_token || null;
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Send a message and get a response via backend proxy
   */
  async sendMessage(
    userMessage: string,
    conversationHistory: ChatMessage[] = [],
    options?: Partial<ChatCompletionOptions>
  ): Promise<string> {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('Não autenticado. Faça login para usar o assistente.');
    }

    try {
      const response = await fetch(`${this.apiUrl}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: conversationHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          temperature: options?.temperature ?? 0.7,
          maxTokens: options?.maxTokens ?? 1024,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = (errorData as { error?: string }).error || `Erro ${response.status}`;
        throw new Error(errorMsg);
      }

      const data = await response.json() as { data: { content: string }; success: boolean };
      return data.data?.content || 'Desculpe, não consegui gerar uma resposta.';
    } catch (error) {
      console.error('[GroqChatService] Error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const groqChatService = new GroqChatService();
