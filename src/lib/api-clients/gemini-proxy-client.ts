/**
 * Gemini Proxy Client — calls the backend /ai/gemini route
 *
 * Replaces the old gemini-client.ts which called Gemini directly from
 * the frontend (exposing the API key and all prompt templates).
 *
 * Now the frontend sends only { promptKey, params } and the backend
 * resolves the prompt template and calls Gemini with the server-side key.
 *
 * Fixes CyberShield findings 3.E (prompt exposure) and 3.F (key exposure).
 */

const D1_API_URL =
  import.meta.env.VITE_CLOUDFLARE_D1_API_URL || 'https://connect.myeasyai.com';

/**
 * Read JWT token from localStorage (same logic as d1-client.ts).
 */
function getAuthToken(): string | null {
  try {
    const d1Token = localStorage.getItem('d1_jwt_token');
    if (d1Token) return d1Token;

    const supabaseAuth = localStorage.getItem(
      'sb-abmixlwlizdyvlxrizmi-auth-token',
    );
    if (supabaseAuth) {
      const parsed = JSON.parse(supabaseAuth);
      return parsed?.access_token || null;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Non-streaming client ─────────────────────────────────────────────────────

export class GeminiProxyClient {
  /**
   * Call a registered prompt on the backend.
   *
   * @param promptKey - The prompt template key (e.g. "content.rewriteSlogan")
   * @param params    - Parameters to interpolate into the template
   * @param temperature - Generation temperature (0-1)
   * @param maxTokens - Maximum output tokens
   * @returns The raw text response from Gemini
   */
  async call(
    promptKey: string,
    params: Record<string, string>,
    temperature: number = 0.7,
    maxTokens: number = 8192,
  ): Promise<string> {
    console.log(`🤖 [GEMINI PROXY] ${promptKey}`);

    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${D1_API_URL}/ai/gemini`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ promptKey, params, temperature, maxTokens }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ [GEMINI PROXY] Error ${response.status}: ${errorText}`,
      );
      throw new Error(`Gemini proxy error: ${response.status}`);
    }

    const data = (await response.json()) as {
      data?: { content?: string };
      error?: string;
    };

    if (data.error) {
      throw new Error(data.error);
    }

    const content = data.data?.content || '';
    console.log('✅ [GEMINI PROXY] Response received');
    return content;
  }
}

// ─── Streaming client (for MyEasyCode) ────────────────────────────────────────

export interface StreamMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamOptions {
  messages: StreamMessage[];
  useSystemPrompt?: boolean;
  isContinuation?: boolean;
  temperature?: number;
  maxTokens?: number;
  onToken?: (token: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Stream text generation through the backend proxy.
 * The system prompt is injected server-side (never sent from frontend).
 */
export async function streamTextViaProxy(
  options: StreamOptions,
): Promise<string> {
  const {
    messages,
    useSystemPrompt = true,
    isContinuation = false,
    temperature = 0.7,
    maxTokens = 65536,
    onToken,
    onComplete,
    onError,
  } = options;

  console.log('[streamTextProxy] Starting via backend proxy');

  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${D1_API_URL}/ai/gemini/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messages,
        useSystemPrompt,
        isContinuation,
        temperature,
        maxTokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        '[streamTextProxy] API Error:',
        response.status,
        errorText,
      );
      const error = new Error(
        `Gemini proxy error: ${response.status} - ${errorText}`,
      );
      onError?.(error);
      throw error;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      const error = new Error('Response body is not readable');
      onError?.(error);
      throw error;
    }

    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';
    let finishReason = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process SSE events
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const data = JSON.parse(jsonStr);
            const text =
              data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const candidateFinishReason =
              data.candidates?.[0]?.finishReason;
            if (candidateFinishReason) {
              finishReason = candidateFinishReason;
            }
            if (text) {
              fullText += text;
              onToken?.(text);
            }
          } catch {
            // Ignore parse errors for incomplete JSON
          }
        }
      }
    }

    // Process remaining buffer
    if (buffer.trim() && buffer.startsWith('data: ')) {
      const jsonStr = buffer.slice(6).trim();
      try {
        const data = JSON.parse(jsonStr);
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (text) {
          fullText += text;
          onToken?.(text);
        }
      } catch {
        // Ignore
      }
    }

    if (finishReason === 'MAX_TOKENS') {
      console.warn(
        '[streamTextProxy] WARNING: Response was truncated due to max tokens!',
      );
    }

    console.log(
      '[streamTextProxy] Complete. Length:',
      fullText.length,
      'Finish:',
      finishReason,
    );

    onComplete?.(fullText);
    return fullText;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    onError?.(err);
    throw err;
  }
}

// Export singleton instance (drop-in replacement for old geminiClient)
export const geminiProxyClient = new GeminiProxyClient();
