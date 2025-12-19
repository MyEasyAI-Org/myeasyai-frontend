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
  bio: text('bio'),
  company_name: text('company_name'),
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

// =============================================================================
// Pricing Tables (MyEasyPricing)
// =============================================================================

/**
 * Tabela de lojas de precificação
 * Equivalente à tabela 'pricing_stores' do Supabase
 */
export const pricingStores = sqliteTable('pricing_stores', {
  id: text('id').primaryKey(),
  user_uuid: text('user_uuid')
    .notNull()
    .references(() => users.uuid, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  currency: text('currency').default('BRL'),
  cost_allocation_method: text('cost_allocation_method').default('equal'), // 'equal' | 'weighted' | 'revenue_based'
  is_active: integer('is_active', { mode: 'boolean' }).default(true),
  is_demo: integer('is_demo', { mode: 'boolean' }).default(false),
  created_at: text('created_at').default(sql`(datetime('now'))`),
  updated_at: text('updated_at'),
});

/**
 * Tabela de produtos de precificação
 * Equivalente à tabela 'pricing_products' do Supabase
 */
export const pricingProducts = sqliteTable('pricing_products', {
  id: text('id').primaryKey(),
  store_id: text('store_id')
    .notNull()
    .references(() => pricingStores.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'),
  direct_cost: integer('direct_cost').default(0), // stored as cents
  unit_type: text('unit_type').default('unit'), // 'unit' | 'hour' | 'kg' | 'meter' | 'service'
  desired_margin: integer('desired_margin').default(30), // stored as percentage * 100
  positioning: text('positioning').default('intermediate'), // 'premium' | 'intermediate' | 'economy'
  market_price: integer('market_price'), // stored as cents, nullable
  weight: integer('weight').default(100), // stored as weight * 100
  monthly_units_estimate: integer('monthly_units_estimate').default(100),
  is_active: integer('is_active', { mode: 'boolean' }).default(true),
  is_demo: integer('is_demo', { mode: 'boolean' }).default(false),
  created_at: text('created_at').default(sql`(datetime('now'))`),
  updated_at: text('updated_at'),
});

/**
 * Tabela de custos indiretos
 * Equivalente à tabela 'pricing_indirect_costs' do Supabase
 */
export const pricingIndirectCosts = sqliteTable('pricing_indirect_costs', {
  id: text('id').primaryKey(),
  store_id: text('store_id')
    .notNull()
    .references(() => pricingStores.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  category: text('category').notNull(), // IndirectCostCategory
  amount: integer('amount').default(0), // stored as cents
  frequency: text('frequency').default('monthly'), // 'monthly' | 'yearly' | 'one_time'
  amortization_months: integer('amortization_months').default(12),
  notes: text('notes'),
  created_at: text('created_at').default(sql`(datetime('now'))`),
  updated_at: text('updated_at'),
});

/**
 * Tabela de custos ocultos
 * Equivalente à tabela 'pricing_hidden_costs' do Supabase
 */
export const pricingHiddenCosts = sqliteTable('pricing_hidden_costs', {
  id: text('id').primaryKey(),
  store_id: text('store_id')
    .notNull()
    .references(() => pricingStores.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  category: text('category').notNull(), // HiddenCostCategory
  amount: integer('amount').default(0), // stored as cents
  frequency: text('frequency').default('monthly'),
  amortization_months: integer('amortization_months').default(12),
  is_auto_calculated: integer('is_auto_calculated', { mode: 'boolean' }).default(false),
  auxiliary_data: text('auxiliary_data'), // JSON string
  notes: text('notes'),
  created_at: text('created_at').default(sql`(datetime('now'))`),
  updated_at: text('updated_at'),
});

/**
 * Tabela de configuração de impostos
 * Equivalente à tabela 'pricing_tax_config' do Supabase
 */
export const pricingTaxConfig = sqliteTable('pricing_tax_config', {
  id: text('id').primaryKey(),
  store_id: text('store_id')
    .notNull()
    .unique()
    .references(() => pricingStores.id, { onDelete: 'cascade' }),
  tax_regime: text('tax_regime').default('simples'), // 'simples' | 'mei' | 'lucro_presumido' | 'lucro_real'
  created_at: text('created_at').default(sql`(datetime('now'))`),
  updated_at: text('updated_at'),
});

/**
 * Tabela de itens de impostos/taxas
 * Equivalente à tabela 'pricing_tax_items' do Supabase
 */
export const pricingTaxItems = sqliteTable('pricing_tax_items', {
  id: text('id').primaryKey(),
  store_id: text('store_id')
    .notNull()
    .references(() => pricingStores.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  category: text('category').notNull(), // 'tax_rate' | 'card_fee' | 'marketplace_fee' | 'commission' | 'other'
  percentage: integer('percentage').default(0), // stored as percentage * 100
  created_at: text('created_at').default(sql`(datetime('now'))`),
  updated_at: text('updated_at'),
});

// Types inferidos do schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserProduct = typeof userProducts.$inferSelect;
export type NewUserProduct = typeof userProducts.$inferInsert;
export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;

// Pricing types
export type PricingStore = typeof pricingStores.$inferSelect;
export type NewPricingStore = typeof pricingStores.$inferInsert;
export type PricingProduct = typeof pricingProducts.$inferSelect;
export type NewPricingProduct = typeof pricingProducts.$inferInsert;
export type PricingIndirectCost = typeof pricingIndirectCosts.$inferSelect;
export type NewPricingIndirectCost = typeof pricingIndirectCosts.$inferInsert;
export type PricingHiddenCost = typeof pricingHiddenCosts.$inferSelect;
export type NewPricingHiddenCost = typeof pricingHiddenCosts.$inferInsert;
export type PricingTaxConfig = typeof pricingTaxConfig.$inferSelect;
export type NewPricingTaxConfig = typeof pricingTaxConfig.$inferInsert;
export type PricingTaxItem = typeof pricingTaxItems.$inferSelect;
export type NewPricingTaxItem = typeof pricingTaxItems.$inferInsert;
