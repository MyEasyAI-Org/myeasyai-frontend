/**
 * Streaming text generation using Gemini API
 * Adapted for browser-only usage with WebContainer
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_STREAM_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent`;

export interface StreamMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamOptions {
  messages: StreamMessage[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  onToken?: (token: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

interface GeminiStreamRequest {
  contents: Array<{
    role: string;
    parts: Array<{ text: string }>;
  }>;
  systemInstruction?: {
    parts: Array<{ text: string }>;
  };
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    topK?: number;
    topP?: number;
  };
}

/**
 * Stream text generation from Gemini API
 */
export async function streamText(options: StreamOptions): Promise<string> {
  const {
    messages,
    systemPrompt,
    temperature = 0.7,
    maxTokens = 65536, // Large limit for complete projects
    onToken,
    onComplete,
    onError,
  } = options;

  console.log('[streamText] Starting with model:', GEMINI_MODEL);
  console.log('[streamText] API URL:', GEMINI_STREAM_URL);
  console.log('[streamText] Messages count:', messages.length);

  if (!GEMINI_API_KEY) {
    const error = new Error('VITE_GEMINI_API_KEY não está configurada');
    onError?.(error);
    throw error;
  }

  // Build request body
  const requestBody: GeminiStreamRequest = {
    contents: messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })),
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
      topK: 40,
      topP: 0.95,
    },
  };

  // Add system instruction if provided
  if (systemPrompt) {
    requestBody.systemInstruction = {
      parts: [{ text: systemPrompt }],
    };
  }

  try {
    const response = await fetch(
      `${GEMINI_STREAM_URL}?key=${GEMINI_API_KEY}&alt=sse`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log('[streamText] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[streamText] API Error:', response.status, errorText);
      const error = new Error(`Gemini API error: ${response.status} - ${errorText}`);
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

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // Process SSE events
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();

          if (jsonStr === '[DONE]') {
            continue;
          }

          try {
            const data = JSON.parse(jsonStr);
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

            // Check for finish reason
            const candidateFinishReason = data.candidates?.[0]?.finishReason;
            if (candidateFinishReason) {
              finishReason = candidateFinishReason;
              console.log('[streamText] Finish reason:', finishReason);
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

    // Process any remaining buffer content
    if (buffer.trim()) {
      console.log('[streamText] Processing remaining buffer:', buffer.substring(0, 100));
      if (buffer.startsWith('data: ')) {
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
    }

    // Check if response was truncated
    if (finishReason === 'MAX_TOKENS') {
      console.warn('[streamText] WARNING: Response was truncated due to max tokens!');
    }

    console.log('[streamText] Complete. Total length:', fullText.length, 'Finish reason:', finishReason);

    onComplete?.(fullText);
    return fullText;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    onError?.(err);
    throw err;
  }
}

/**
 * Non-streaming text generation (for simpler use cases)
 */
export async function generateText(
  prompt: string,
  systemPrompt?: string,
  temperature = 0.7
): Promise<string> {
  return streamText({
    messages: [{ role: 'user', content: prompt }],
    systemPrompt,
    temperature,
  });
}
