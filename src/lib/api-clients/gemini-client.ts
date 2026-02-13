/**
 * @deprecated — This file is DEPRECATED.
 *
 * All Gemini calls now go through the backend proxy (gemini-proxy-client.ts).
 * The VITE_GEMINI_API_KEY env var has been removed from the frontend.
 *
 * This file is kept temporarily for backwards compatibility but will be
 * removed in a future cleanup. Any remaining imports should be migrated
 * to gemini-proxy-client.ts.
 *
 * See: CyberShield findings 3.E (prompt exposure) and 3.F (API key exposure).
 */

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
 * @deprecated Use geminiProxyClient from gemini-proxy-client.ts instead.
 *
 * This class now delegates to the proxy client. It accepts a raw prompt
 * (for any remaining callers) and sends it as a 'legacy.rawPrompt' key.
 * NOTE: This will NOT work unless a 'legacy.rawPrompt' key is registered
 * in the backend prompt registry. Migrate all callers to use prompt keys.
 */
export class GeminiClient {
  async call(_prompt: string, _temperature: number = 0.9): Promise<string> {
    console.warn(
      '⚠️ [GEMINI CLIENT] DEPRECATED: Use geminiProxyClient instead. ' +
      'Direct Gemini calls are no longer supported.',
    );
    // This will fail unless the caller is migrated to use prompt keys.
    // Kept as a safety net to avoid silent breakage.
    throw new Error(
      'GeminiClient is deprecated. Use geminiProxyClient with prompt keys instead. ' +
      'See gemini-proxy-client.ts.',
    );
  }
}

// Export singleton instance (deprecated — use geminiProxyClient instead)
export const geminiClient = new GeminiClient();
