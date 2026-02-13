/**
 * Prompt Registry — Server-side prompt template storage
 *
 * All AI prompt templates live here on the backend so they are never
 * shipped to the frontend JavaScript bundle (CyberShield finding 3.E).
 *
 * Each entry maps a promptKey to a builder function that receives
 * user-supplied params and returns the fully interpolated prompt string.
 */

import { contentRewritingPrompts } from './contentRewriting';
import { socialContentPrompts } from './socialContent';
import { resumePrompts } from './resume';
import { learningPrompts } from './learning';
import { codePrompts } from './code';

export type PromptBuilder = (params: Record<string, string>) => string;

const PROMPT_REGISTRY: Record<string, PromptBuilder> = {
  ...contentRewritingPrompts,
  ...socialContentPrompts,
  ...resumePrompts,
  ...learningPrompts,
  ...codePrompts,
};

/**
 * Build a prompt by key, substituting the given params.
 * Returns null if the key is not found.
 */
export function buildPrompt(key: string, params: Record<string, string>): string | null {
  const builder = PROMPT_REGISTRY[key];
  if (!builder) return null;
  return builder(params);
}

/** List all registered prompt keys (useful for debugging). */
export function getPromptKeys(): string[] {
  return Object.keys(PROMPT_REGISTRY);
}
