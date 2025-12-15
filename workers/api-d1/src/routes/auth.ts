// Auth Routes - OAuth completo no Cloudflare
// Substitui Supabase Auth
// COM SYNC BIDIRECIONAL PARA SUPABASE

import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { users, type NewUser } from '../db/schema';
import { createJWT, verifyJWT } from '../auth/jwt';
import {
  getGoogleAuthUrl,
  exchangeCodeForTokens,
  getGoogleUserInfo,
} from '../auth/oauth-google';
import { syncUserToSupabase } from '../utils/supabaseSync';
import type { Env, Variables } from '../index';

// Extend Env para incluir secrets de OAuth
interface AuthEnv extends Env {
  JWT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  FRONTEND_URL: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

export const authRoutes = new Hono<{ Bindings: AuthEnv; Variables: Variables }>();

/**
 * GET /auth/google
 * Inicia fluxo OAuth com Google
 * Query params:
 *   - redirect_to: URL do frontend para redirecionar após login (opcional)
 */
authRoutes.get('/google', async (c) => {
  const redirectUri = `${getWorkerUrl(c.req.url)}/auth/google/callback`;

  // Captura o frontend de origem para redirecionar após login
  const redirectTo = c.req.query('redirect_to') || c.env.FRONTEND_URL;

  // Gerar state com redirect_to embutido (base64)
  const stateData = {
    nonce: crypto.randomUUID(),
    redirect_to: redirectTo,
  };
  const state = btoa(JSON.stringify(stateData));

  const authUrl = getGoogleAuthUrl(
    c.env.GOOGLE_CLIENT_ID,
    redirectUri,
    state
  );

  // Redirecionar para Google
  return c.redirect(authUrl);
});

/**
 * GET /auth/google/callback
 * Callback do OAuth Google
 */
authRoutes.get('/google/callback', async (c) => {
  const db = c.get('db');
  const code = c.req.query('code');
  const error = c.req.query('error');
  const state = c.req.query('state');

  // Extrair redirect_to do state
  let frontendUrl = c.env.FRONTEND_URL;
  if (state) {
    try {
      const stateData = JSON.parse(atob(state));
      if (stateData.redirect_to) {
        frontendUrl = stateData.redirect_to;
      }
    } catch (e) {
      console.warn('Failed to parse state:', e);
    }
  }

  if (error) {
    console.error('Google OAuth error:', error);
    return c.redirect(`${frontendUrl}/login?error=${error}`);
  }

  if (!code) {
    return c.redirect(`${frontendUrl}/login?error=no_code`);
  }

  try {
    const redirectUri = `${getWorkerUrl(c.req.url)}/auth/google/callback`;

    // 1. Trocar código por tokens
    const tokens = await exchangeCodeForTokens(
      code,
      c.env.GOOGLE_CLIENT_ID,
      c.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    // 2. Obter informações do usuário
    const googleUser = await getGoogleUserInfo(tokens.access_token);

    console.log('✅ [AUTH] Google user:', googleUser.email);

    // 3. Criar ou atualizar usuário no D1
    let user = await db.query.users.findFirst({
      where: eq(users.email, googleUser.email),
    });

    const uuid = user?.uuid || crypto.randomUUID();

    if (!user) {
      // Criar novo usuário
      const newUser: NewUser = {
        uuid,
        email: googleUser.email,
        name: googleUser.name,
        preferred_name: googleUser.given_name,
        avatar_url: googleUser.picture,
        preferred_language: 'pt',
        created_at: new Date().toISOString(),
        last_online: new Date().toISOString(),
      };

      await db.insert(users).values(newUser);
      user = newUser as any;

      console.log('✅ [AUTH] New user created:', googleUser.email);

      // 🔄 SYNC: Sincronizar novo usuário para Supabase (não-bloqueante)
      c.executionCtx.waitUntil(syncUserToSupabase(c.env, 'INSERT', newUser));
    } else {
      // Atualizar last_online e avatar
      const updateData = {
        last_online: new Date().toISOString(),
        avatar_url: googleUser.picture,
        name: user.name || googleUser.name,
      };

      await db
        .update(users)
        .set(updateData)
        .where(eq(users.email, googleUser.email));

      console.log('✅ [AUTH] User updated:', googleUser.email);

      // 🔄 SYNC: Sincronizar atualização para Supabase (não-bloqueante)
      c.executionCtx.waitUntil(syncUserToSupabase(c.env, 'UPDATE', { uuid: user.uuid, email: googleUser.email, ...updateData }));
    }

    // 4. Gerar JWT
    const jwt = await createJWT(
      {
        sub: uuid,
        email: googleUser.email,
        name: googleUser.name,
        avatar_url: googleUser.picture,
      },
      c.env.JWT_SECRET
    );

    // 5. Redirecionar para frontend com token
    const frontendCallback = `${frontendUrl}/auth/callback?token=${jwt}`;
    console.log('✅ [AUTH] Redirecting to:', frontendCallback);
    return c.redirect(frontendCallback);

  } catch (err: any) {
    console.error('❌ [AUTH] Google callback error:', err);
    return c.redirect(`${frontendUrl}/login?error=auth_failed`);
  }
});

/**
 * POST /auth/google/token
 * Login com Google usando ID token (para frontend SPA)
 */
authRoutes.post('/google/token', async (c) => {
  const db = c.get('db');
  const { access_token } = await c.req.json();

  if (!access_token) {
    return c.json({ error: 'access_token is required' }, 400);
  }

  try {
    // Obter informações do usuário
    const googleUser = await getGoogleUserInfo(access_token);

    // Criar ou atualizar usuário
    let user = await db.query.users.findFirst({
      where: eq(users.email, googleUser.email),
    });

    const uuid = user?.uuid || crypto.randomUUID();

    if (!user) {
      const newUser: NewUser = {
        uuid,
        email: googleUser.email,
        name: googleUser.name,
        preferred_name: googleUser.given_name,
        avatar_url: googleUser.picture,
        preferred_language: 'pt',
        created_at: new Date().toISOString(),
        last_online: new Date().toISOString(),
      };

      await db.insert(users).values(newUser);
      user = newUser as any;

      // 🔄 SYNC: Sincronizar novo usuário para Supabase
      c.executionCtx.waitUntil(syncUserToSupabase(c.env, 'INSERT', newUser));
    } else {
      const updateData = {
        last_online: new Date().toISOString(),
        avatar_url: googleUser.picture,
      };

      await db
        .update(users)
        .set(updateData)
        .where(eq(users.email, googleUser.email));

      // 🔄 SYNC: Sincronizar atualização para Supabase
      c.executionCtx.waitUntil(syncUserToSupabase(c.env, 'UPDATE', { uuid: user.uuid, ...updateData }));
    }

    // Gerar JWT
    const jwt = await createJWT(
      {
        sub: uuid,
        email: googleUser.email,
        name: googleUser.name,
        avatar_url: googleUser.picture,
      },
      c.env.JWT_SECRET
    );

    return c.json({
      token: jwt,
      user: {
        uuid,
        email: googleUser.email,
        name: googleUser.name,
        avatar_url: googleUser.picture,
      },
    });

  } catch (err: any) {
    console.error('❌ [AUTH] Google token error:', err);
    return c.json({ error: 'Authentication failed', details: err.message }, 401);
  }
});

/**
 * POST /auth/signup
 * Registro com email/senha
 */
authRoutes.post('/signup', async (c) => {
  const db = c.get('db');
  const { email, password, name } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: 'Email and password are required' }, 400);
  }

  // Verificar se email já existe
  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existing) {
    return c.json({ error: 'Email already registered' }, 409);
  }

  // Hash da senha (TODO: armazenar em tabela auth_credentials)
  const _passwordHash = await hashPassword(password);
  const uuid = crypto.randomUUID();

  // Criar usuário
  const newUser: NewUser = {
    uuid,
    email,
    name: name || email.split('@')[0],
    preferred_language: 'pt',
    created_at: new Date().toISOString(),
    last_online: new Date().toISOString(),
  };

  await db.insert(users).values(newUser);

  // 🔄 SYNC: Sincronizar novo usuário para Supabase
  c.executionCtx.waitUntil(syncUserToSupabase(c.env, 'INSERT', newUser));

  // Salvar hash da senha (precisa de tabela separada ou campo adicional)
  // Por agora, vamos armazenar em uma tabela auth_credentials
  // TODO: Implementar tabela auth_credentials

  // Gerar JWT
  const jwt = await createJWT(
    {
      sub: uuid,
      email,
      name: newUser.name || undefined,
    },
    c.env.JWT_SECRET
  );

  console.log('✅ [AUTH] User registered:', email);

  return c.json({
    token: jwt,
    user: {
      uuid,
      email,
      name: newUser.name,
    },
  }, 201);
});

/**
 * POST /auth/login
 * Login com email/senha
 */
authRoutes.post('/login', async (c) => {
  const db = c.get('db');
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: 'Email and password are required' }, 400);
  }

  // Buscar usuário
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  // TODO: Verificar senha (precisa da tabela auth_credentials)
  // Por enquanto, aceita qualquer senha para teste

  // Atualizar last_online
  const updateData = { last_online: new Date().toISOString() };
  await db
    .update(users)
    .set(updateData)
    .where(eq(users.email, email));

  // 🔄 SYNC: Sincronizar atualização para Supabase
  c.executionCtx.waitUntil(syncUserToSupabase(c.env, 'UPDATE', { uuid: user.uuid, ...updateData }));

  // Gerar JWT
  const jwt = await createJWT(
    {
      sub: user.uuid,
      email: user.email,
      name: user.name || undefined,
      avatar_url: user.avatar_url || undefined,
    },
    c.env.JWT_SECRET
  );

  console.log('✅ [AUTH] User logged in:', email);

  return c.json({
    token: jwt,
    user: {
      uuid: user.uuid,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
    },
  });
});

/**
 * GET /auth/me
 * Retorna usuário atual baseado no JWT
 */
authRoutes.get('/me', async (c) => {
  const db = c.get('db');
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No token provided' }, 401);
  }

  const token = authHeader.substring(7);
  const payload = await verifyJWT(token, c.env.JWT_SECRET);

  if (!payload) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  // Buscar usuário atualizado
  const user = await db.query.users.findFirst({
    where: eq(users.uuid, payload.sub),
  });

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({
    user: {
      uuid: user.uuid,
      email: user.email,
      name: user.name,
      preferred_name: user.preferred_name,
      avatar_url: user.avatar_url,
      country: user.country,
      preferred_language: user.preferred_language,
    },
  });
});

/**
 * POST /auth/logout
 * Logout (invalida token no client)
 */
authRoutes.post('/logout', (c) => {
  // JWT é stateless, logout é feito no client removendo o token
  return c.json({ success: true, message: 'Logged out' });
});

/**
 * POST /auth/refresh
 * Renova o JWT
 */
authRoutes.post('/refresh', async (c) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No token provided' }, 401);
  }

  const token = authHeader.substring(7);
  const payload = await verifyJWT(token, c.env.JWT_SECRET);

  if (!payload) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  // Gerar novo JWT
  const newJwt = await createJWT(
    {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      avatar_url: payload.avatar_url,
    },
    c.env.JWT_SECRET
  );

  return c.json({ token: newJwt });
});

// ========== Helpers ==========

function getWorkerUrl(requestUrl: string): string {
  const url = new URL(requestUrl);
  return `${url.protocol}//${url.host}`;
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

async function _verifyPassword(password: string, hash: string): Promise<boolean> {
  const newHash = await hashPassword(password);
  return newHash === hash;
}
