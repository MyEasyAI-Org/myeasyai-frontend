/**
 * MyEasyCode prompt helpers.
 *
 * The actual SYSTEM_PROMPT and CONTINUE_PROMPT have been moved to the backend
 * prompt registry (workers/api-d1/src/prompts/code.ts) so they never appear
 * in the frontend JS bundle. Fixes CyberShield finding 3.E.
 *
 * Only wrapUserMessage remains on the frontend since it's a simple UI helper
 * that wraps user input before sending to the proxy.
 */

/**
 * @deprecated System prompt is now injected server-side. Returns empty string.
 */
export const SYSTEM_PROMPT = '';

/**
 * @deprecated Continue prompt is now injected server-side. Returns empty string.
 */
export const CONTINUE_PROMPT = '';

/**
 * Wrap user message to enforce XML output.
 * This stays on the frontend as it's a simple UX hint, not prompt IP.
 */
export function wrapUserMessage(message: string): string {
  return `${message}

[REMINDER: Respond ONLY with <boltArtifact> XML. No explanations. Start immediately with <boltArtifact>]`;
}

/**
 * @deprecated System prompt is now injected server-side. Returns empty string.
 */
export function getSystemPrompt(): string {
  return '';
}
