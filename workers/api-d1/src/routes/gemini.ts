/**
 * Gemini AI Proxy Routes
 *
 * Proxies ALL Gemini AI calls so the API key never reaches the frontend.
 * Prompt templates are stored server-side in the prompt registry.
 *
 * Fixes CyberShield findings:
 *   3.E — AI prompt exposure in frontend JS bundle
 *   3.F — Gemini API key exposure via VITE_ env var
 */

import { Hono } from 'hono';
import type { Env, Variables } from '../index';
import { verifyJWT } from '../auth/jwt';
import { buildPrompt } from '../prompts';
import { CODE_SYSTEM_PROMPT, CODE_CONTINUE_PROMPT } from '../prompts/code';

const geminiRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// ─── Constants ────────────────────────────────────────────────────────────────

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function requireAuth(c: any): Promise<string | null> {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const payload = await verifyJWT(token, c.env.JWT_SECRET);
  return payload?.sub ?? null;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type GeminiGenerateRequest = {
  contents: Array<{
    role?: string;
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
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
};

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * POST /ai/gemini
 * Non-streaming Gemini proxy.
 *
 * Body:
 *   promptKey: string          — registered prompt template key
 *   params: Record<string,string> — parameters for the template
 *   temperature?: number       — generation temperature (default 0.7)
 *   maxTokens?: number         — max output tokens (default 8192)
 */
geminiRoutes.post('/', async (c) => {
  // 1. Auth
  const userId = await requireAuth(c);
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // 2. Parse body
  const body = await c.req.json<{
    promptKey: string;
    params: Record<string, string>;
    temperature?: number;
    maxTokens?: number;
  }>();

  const { promptKey, params, temperature = 0.7, maxTokens = 8192 } = body;

  if (!promptKey || typeof promptKey !== 'string') {
    return c.json({ error: 'promptKey is required' }, 400);
  }

  // 3. Build prompt from registry
  const prompt = buildPrompt(promptKey, params || {});
  if (!prompt) {
    return c.json({ error: `Unknown prompt key: ${promptKey}` }, 400);
  }

  // 4. Call Gemini
  const apiKey = c.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[GEMINI] GEMINI_API_KEY not configured');
    return c.json({ error: 'AI service not configured' }, 503);
  }

  try {
    const geminiUrl = `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent`;
    const geminiBody: GeminiGenerateRequest = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        topK: 40,
        topP: 0.95,
      },
    };

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(geminiBody),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error(`[GEMINI] API error ${geminiResponse.status}: ${errorText}`);
      return c.json({ error: 'AI service error' }, 502);
    }

    const data = await geminiResponse.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return c.json({ data: { content }, success: true });
  } catch (error) {
    console.error('[GEMINI] Proxy error:', error);
    return c.json({ error: 'AI service unavailable' }, 502);
  }
});

/**
 * POST /ai/gemini/stream
 * Streaming Gemini proxy for MyEasyCode.
 *
 * Body:
 *   messages: Array<{ role: string; content: string }>
 *   useSystemPrompt?: boolean  — inject CODE_SYSTEM_PROMPT server-side (default true)
 *   isContinuation?: boolean   — use CONTINUE_PROMPT wrapper
 *   temperature?: number
 *   maxTokens?: number
 *
 * Returns: SSE stream (text/event-stream)
 */
geminiRoutes.post('/stream', async (c) => {
  // 1. Auth
  const userId = await requireAuth(c);
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // 2. Parse body
  const body = await c.req.json<{
    messages: Array<{ role: string; content: string }>;
    useSystemPrompt?: boolean;
    isContinuation?: boolean;
    temperature?: number;
    maxTokens?: number;
  }>();

  const {
    messages,
    useSystemPrompt = true,
    isContinuation = false,
    temperature = 0.7,
    maxTokens = 65536,
  } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return c.json({ error: 'messages array is required' }, 400);
  }

  // 3. API key check
  const apiKey = c.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[GEMINI STREAM] GEMINI_API_KEY not configured');
    return c.json({ error: 'AI service not configured' }, 503);
  }

  // 4. Build Gemini request
  const geminiBody: GeminiGenerateRequest = {
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

  // Inject system prompt server-side (never sent from frontend)
  if (useSystemPrompt) {
    const systemPrompt = isContinuation ? CODE_CONTINUE_PROMPT : CODE_SYSTEM_PROMPT;
    geminiBody.systemInstruction = {
      parts: [{ text: systemPrompt }],
    };
  }

  // 5. Call Gemini streaming API and pipe through
  try {
    const streamUrl = `${GEMINI_BASE}/${GEMINI_MODEL}:streamGenerateContent?key=${apiKey}&alt=sse`;

    const geminiResponse = await fetch(streamUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error(`[GEMINI STREAM] API error ${geminiResponse.status}: ${errorText}`);
      return c.json({ error: 'AI service error' }, 502);
    }

    // Pipe the SSE stream through to the client
    return new Response(geminiResponse.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[GEMINI STREAM] Proxy error:', error);
    return c.json({ error: 'AI service unavailable' }, 502);
  }
});

export { geminiRoutes };
