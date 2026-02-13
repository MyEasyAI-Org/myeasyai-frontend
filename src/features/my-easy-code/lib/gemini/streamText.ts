/**
 * Streaming text generation — now routed through the backend proxy.
 *
 * The system prompt (CODE_SYSTEM_PROMPT) is injected server-side so it never
 * appears in the frontend JS bundle. Fixes CyberShield findings 3.E and 3.F.
 */

import {
  streamTextViaProxy,
  type StreamMessage,
} from '../../../../lib/api-clients/gemini-proxy-client';

export type { StreamMessage };

export interface StreamOptions {
  messages: StreamMessage[];
  /** @deprecated System prompt is now injected server-side. This parameter is ignored. */
  systemPrompt?: string;
  isContinuation?: boolean;
  temperature?: number;
  maxTokens?: number;
  onToken?: (token: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Stream text generation via the backend Gemini proxy.
 * Drop-in replacement for the old direct-call streamText.
 */
export async function streamText(options: StreamOptions): Promise<string> {
  const {
    messages,
    isContinuation = false,
    temperature = 0.7,
    maxTokens = 65536,
    onToken,
    onComplete,
    onError,
  } = options;

  console.log('[streamText] Starting via backend proxy');

  return streamTextViaProxy({
    messages,
    useSystemPrompt: true,
    isContinuation,
    temperature,
    maxTokens,
    onToken,
    onComplete,
    onError,
  });
}

/**
 * Non-streaming text generation (for simpler use cases)
 */
export async function generateText(
  prompt: string,
  _systemPrompt?: string,
  temperature = 0.7
): Promise<string> {
  return streamText({
    messages: [{ role: 'user', content: prompt }],
    temperature,
  });
}
