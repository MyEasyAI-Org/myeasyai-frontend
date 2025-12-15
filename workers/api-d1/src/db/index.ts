// Database client setup para Cloudflare D1 com Drizzle ORM

import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export type Database = ReturnType<typeof createDb>;

/**
 * Cria uma instância do Drizzle conectada ao D1
 * Usado em cada request do Worker
 */
export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

// Re-export schema types
export * from './schema';
