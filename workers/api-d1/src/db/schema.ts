// Drizzle ORM Schema para Cloudflare D1
// Equivalente ao schema do Supabase PostgreSQL

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * Tabela de usuários
 * Equivalente à tabela 'users' do Supabase
 */
export const users = sqliteTable('users', {
  uuid: text('uuid').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  preferred_name: text('preferred_name'),
  mobile_phone: text('mobile_phone'),
  country: text('country'),
  postal_code: text('postal_code'),
  address: text('address'),
  avatar_url: text('avatar_url'),
  preferred_language: text('preferred_language').default('pt'),
  subscription_plan: text('subscription_plan').default('individual'),
  subscription_status: text('subscription_status').default('active'),
  created_at: text('created_at').default(sql`(datetime('now'))`),
  last_online: text('last_online'),
});

/**
 * Tabela de produtos do usuário
 * Equivalente à tabela 'user_products' do Supabase
 */
export const userProducts = sqliteTable('user_products', {
  id: text('id').primaryKey(),
  user_uuid: text('user_uuid'),
  product_id: text('product_id'),
  product_type: text('product_type'),
  product_name: text('product_name'),
  product_status: text('product_status'),
  status: text('status').default('active'),
  active: integer('active').default(1),
  metadata: text('metadata'),
  expires_at: text('expires_at'),
  created_at: text('created_at').default(sql`(datetime('now'))`),
  updated_at: text('updated_at'),
  subscribed_at: text('subscribed_at'),
  cancelled_at: text('cancelled_at'),
  sites_created: integer('sites_created').default(0),
  consultations_made: integer('consultations_made').default(0),
  api_calls: integer('api_calls').default(0),
  product_settings: text('product_settings'),
});

/**
 * Tabela de sites criados (MyEasyWebsite)
 * Nova tabela para controle de sites publicados
 */
export const sites = sqliteTable('sites', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_uuid: text('user_uuid')
    .notNull()
    .references(() => users.uuid, { onDelete: 'cascade' }),
  slug: text('slug').notNull().unique(), // subdomínio: slug.myeasyai.com
  name: text('name').notNull(),
  description: text('description'),
  business_type: text('business_type'),
  status: text('status').default('active'), // 'active', 'inactive', 'building'
  settings: text('settings'), // JSON string com configurações do site
  created_at: text('created_at').default(sql`(datetime('now'))`),
  updated_at: text('updated_at'),
  published_at: text('published_at'),
});

// Types inferidos do schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserProduct = typeof userProducts.$inferSelect;
export type NewUserProduct = typeof userProducts.$inferInsert;
export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;
