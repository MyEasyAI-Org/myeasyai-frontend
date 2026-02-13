// MyEasyAI API Worker - Cloudflare D1
// API REST completa com Hono framework
// Com sync automático bidirecional D1 ↔ Supabase

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createDb } from './db';
import { usersRoutes } from './routes/users';
import { productsRoutes } from './routes/products';
import { sitesRoutes } from './routes/sites';
import { healthRoutes } from './routes/health';
import { authRoutes } from './routes/auth';
import { syncRoutes } from './routes/sync';
import { pricingRoutes } from './routes/pricing';
import { crmRoutes } from './routes/crm';
import { contentRoutes } from './routes/content';
import { stripeRoutes } from './routes/stripe';
import { aiRoutes } from './routes/ai';
import { geminiRoutes } from './routes/gemini';
import { runAutoSync } from './scheduled/autoSync';

// Tipagem do ambiente Cloudflare
export type Env = {
  DB: D1Database;
  ENVIRONMENT: string;
  CORS_ORIGIN: string;
  JWT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  FRONTEND_URL: string;
  // Supabase sync credentials
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  // AI service keys (server-side only)
  GROQ_API_KEY: string;
  GEMINI_API_KEY: string;
};

// Contexto customizado com DB
export type Variables = {
  db: ReturnType<typeof createDb>;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Middleware: Logger
app.use('*', logger());

// Middleware: CORS dinâmico
app.use('*', async (c, next) => {
  const corsMiddleware = cors({
    origin: (origin) => {
      // Lista de origens exatas permitidas
      const allowedOrigins = [
        c.env.CORS_ORIGIN,
        'http://localhost:5173',
        'http://localhost:3000',
        'https://myeasyai.com',
        'https://www.myeasyai.com',
        'https://staging.myeasyai.com',
      ];

      // Permitir origens exatas
      if (allowedOrigins.includes(origin)) {
        return origin;
      }

      // Permitir QUALQUER subdomínio de myeasyai.com (para sites hospedados no R2)
      if (origin && /^https:\/\/[a-z0-9-]+\.myeasyai\.com$/.test(origin)) {
        return origin;
      }

      return allowedOrigins[0];
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposeHeaders: ['X-Request-ID'],
    maxAge: 86400,
    credentials: true,
  });
  return corsMiddleware(c, next);
});

// Middleware: Injetar DB em cada request
app.use('*', async (c, next) => {
  const db = createDb(c.env.DB);
  c.set('db', db);
  await next();
});

// Rotas
app.route('/health', healthRoutes);
app.route('/auth', authRoutes);
app.route('/users', usersRoutes);
app.route('/products', productsRoutes);
app.route('/sites', sitesRoutes);
app.route('/sync', syncRoutes);
app.route('/pricing', pricingRoutes);
app.route('/crm', crmRoutes);
app.route('/content', contentRoutes);
app.route('/stripe', stripeRoutes);
app.route('/ai', aiRoutes);
app.route('/ai/gemini', geminiRoutes);

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'MyEasyAI API',
    version: '1.0.0',
    environment: c.env.ENVIRONMENT,
    endpoints: {
      health: '/health',
      auth: '/auth',
      users: '/users',
      products: '/products',
      sites: '/sites',
      sync: '/sync',
      pricing: '/pricing',
      crm: '/crm',
      content: '/content',
      stripe: '/stripe',
      ai: '/ai',
      gemini: '/ai/gemini',
    },
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', path: c.req.path }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json(
    {
      error: 'Internal Server Error',
      message: c.env.ENVIRONMENT === 'development' ? err.message : undefined,
    },
    500
  );
});

// Export worker com suporte a HTTP e Scheduled events
export default {
  // HTTP requests
  fetch: app.fetch,

  // Scheduled events (cron)
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    console.log(`⏰ [CRON] Auto-sync triggered at ${new Date().toISOString()}`);
    ctx.waitUntil(runAutoSync(env));
  },
};
