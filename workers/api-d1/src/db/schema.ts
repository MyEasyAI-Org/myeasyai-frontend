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
  subscription_status: text('subscription_status').default('inactive'), // Changed: inactive until paid
  bio: text('bio'),
  company_name: text('company_name'),
  created_at: text('created_at').default(sql`(datetime('now'))`),
  last_online: text('last_online'),
  // Stripe integration fields
  stripe_customer_id: text('stripe_customer_id'),
  stripe_subscription_id: text('stripe_subscription_id'),
  subscription_period_end: text('subscription_period_end'),
  subscription_cancel_at_period_end: integer('subscription_cancel_at_period_end', { mode: 'boolean' }).default(false),
  billing_cycle: text('billing_cycle'), // 'monthly' | 'annual'
  payment_method_type: text('payment_method_type'), // 'card' | 'pix' | null (for legacy/subscription users)
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

// =============================================================================
// Auth Credentials (Email/Password)
// =============================================================================

/**
 * Tabela de credenciais de autenticação (email/senha)
 * Armazena hash PBKDF2 com salt individual por usuário
 * Separada da tabela users por segurança (princípio de menor privilégio)
 */
export const authCredentials = sqliteTable('auth_credentials', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_uuid: text('user_uuid')
    .notNull()
    .unique()
    .references(() => users.uuid, { onDelete: 'cascade' }),
  password_hash: text('password_hash').notNull(), // PBKDF2-SHA256, base64
  salt: text('salt').notNull(), // Random 16-byte salt, base64
  algorithm: text('algorithm').default('PBKDF2-SHA256'), // For future migration
  iterations: integer('iterations').default(100000),
  created_at: text('created_at').default(sql`(datetime('now'))`),
  updated_at: text('updated_at').default(sql`(datetime('now'))`),
});

// Types inferidos do schema
export type AuthCredential = typeof authCredentials.$inferSelect;
export type NewAuthCredential = typeof authCredentials.$inferInsert;
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

// =============================================================================
// CRM Tables (MyEasyCRM)
// =============================================================================

/**
 * Tabela de empresas do CRM
 */
export const crmCompanies = sqliteTable('crm_companies', {
  id: text('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.uuid, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  cnpj: text('cnpj'),
  industry: text('industry'),
  segment: text('segment'),
  size: text('size'),
  website: text('website'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  phone: text('phone'),
  email: text('email'),
  linkedin: text('linkedin'),
  instagram: text('instagram'),
  facebook: text('facebook'),
  notes: text('notes'),
  created_at: text('created_at').default(sql`(datetime('now'))`),
  updated_at: text('updated_at').default(sql`(datetime('now'))`),
});

/**
 * Tabela de contatos do CRM
 */
export const crmContacts = sqliteTable('crm_contacts', {
  id: text('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.uuid, { onDelete: 'cascade' }),
  company_id: text('company_id').references(() => crmCompanies.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  mobile: text('mobile'),
  position: text('position'),
  role: text('role'),
  tags: text('tags'), // JSON array as text
  notes: text('notes'),
  source: text('source'),
  lead_source: text('lead_source'),
  birth_date: text('birth_date'),
  address: text('address'),
  linkedin: text('linkedin'),
  instagram: text('instagram'),
  created_at: text('created_at').default(sql`(datetime('now'))`),
  updated_at: text('updated_at').default(sql`(datetime('now'))`),
});

/**
 * Tabela de deals/oportunidades do CRM
 */
export const crmDeals = sqliteTable('crm_deals', {
  id: text('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.uuid, { onDelete: 'cascade' }),
  contact_id: text('contact_id').references(() => crmContacts.id, { onDelete: 'set null' }),
  company_id: text('company_id').references(() => crmCompanies.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  value: integer('value').notNull().default(0), // stored as cents
  stage: text('stage').notNull().default('lead'),
  probability: integer('probability').notNull().default(0),
  expected_close_date: text('expected_close_date'),
  actual_close_date: text('actual_close_date'),
  lost_reason: text('lost_reason'),
  source: text('source'),
  notes: text('notes'),
  products: text('products'), // JSON array as text
  created_at: text('created_at').default(sql`(datetime('now'))`),
  updated_at: text('updated_at').default(sql`(datetime('now'))`),
});

/**
 * Tabela de tarefas do CRM
 */
export const crmTasks = sqliteTable('crm_tasks', {
  id: text('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.uuid, { onDelete: 'cascade' }),
  contact_id: text('contact_id').references(() => crmContacts.id, { onDelete: 'set null' }),
  deal_id: text('deal_id').references(() => crmDeals.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  due_date: text('due_date').notNull(),
  type: text('type').notNull().default('other'),
  priority: text('priority').notNull().default('medium'),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  completed_at: text('completed_at'),
  created_at: text('created_at').default(sql`(datetime('now'))`),
});

/**
 * Tabela de atividades do CRM
 */
export const crmActivities = sqliteTable('crm_activities', {
  id: text('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.uuid, { onDelete: 'cascade' }),
  contact_id: text('contact_id').references(() => crmContacts.id, { onDelete: 'set null' }),
  deal_id: text('deal_id').references(() => crmDeals.id, { onDelete: 'set null' }),
  type: text('type').notNull(),
  description: text('description').notNull(),
  metadata: text('metadata'), // JSON as text
  created_at: text('created_at').default(sql`(datetime('now'))`),
});

// CRM types
export type CrmCompany = typeof crmCompanies.$inferSelect;
export type NewCrmCompany = typeof crmCompanies.$inferInsert;
export type CrmContact = typeof crmContacts.$inferSelect;
export type NewCrmContact = typeof crmContacts.$inferInsert;
export type CrmDeal = typeof crmDeals.$inferSelect;
export type NewCrmDeal = typeof crmDeals.$inferInsert;
export type CrmTask = typeof crmTasks.$inferSelect;
export type NewCrmTask = typeof crmTasks.$inferInsert;
export type CrmActivity = typeof crmActivities.$inferSelect;
export type NewCrmActivity = typeof crmActivities.$inferInsert;

// =============================================================================
// Content Tables (MyEasyContent)
// =============================================================================

/**
 * Tabela de perfis de negócio para geração de conteúdo
 * Permite que um usuário tenha múltiplos presets (restaurante, loja, etc.)
 */
export const contentBusinessProfiles = sqliteTable('content_business_profiles', {
  id: text('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.uuid, { onDelete: 'cascade' }),
  name: text('name').notNull(), // "Restaurante do João", "Loja de Instrumentos"
  business_niche: text('business_niche').notNull(), // 'restaurant', 'retail', etc.
  target_audience: text('target_audience'),
  brand_voice: text('brand_voice').default('professional'),
  selected_networks: text('selected_networks'), // JSON array
  preferred_content_types: text('preferred_content_types'), // JSON array
  icon: text('icon'), // Emoji ou identificador de ícone
  is_default: integer('is_default', { mode: 'boolean' }).default(false),
  created_at: text('created_at').default(sql`(datetime('now'))`),
  updated_at: text('updated_at').default(sql`(datetime('now'))`),
});

/**
 * Tabela de biblioteca de conteúdos gerados/salvos
 */
export const contentLibrary = sqliteTable('content_library', {
  id: text('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.uuid, { onDelete: 'cascade' }),
  profile_id: text('profile_id')
    .notNull()
    .references(() => contentBusinessProfiles.id, { onDelete: 'cascade' }),
  content_type: text('content_type').notNull(), // 'feed_post', 'caption', etc.
  network: text('network').notNull(), // 'instagram', 'linkedin', etc.
  title: text('title'),
  content: text('content').notNull(),
  hashtags: text('hashtags'), // JSON array
  image_description: text('image_description'),
  best_time: text('best_time'),
  variations: text('variations'), // JSON array
  is_favorite: integer('is_favorite', { mode: 'boolean' }).default(false),
  tags: text('tags'), // JSON array
  folder: text('folder'),
  created_at: text('created_at').default(sql`(datetime('now'))`),
});

/**
 * Tabela de calendário editorial
 */
export const contentCalendar = sqliteTable('content_calendar', {
  id: text('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.uuid, { onDelete: 'cascade' }),
  profile_id: text('profile_id')
    .notNull()
    .references(() => contentBusinessProfiles.id, { onDelete: 'cascade' }),
  library_content_id: text('library_content_id').references(() => contentLibrary.id, {
    onDelete: 'set null',
  }),
  scheduled_date: text('scheduled_date').notNull(),
  day_of_week: text('day_of_week'),
  network: text('network').notNull(),
  content_type: text('content_type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  hashtags: text('hashtags'), // JSON array
  best_time: text('best_time'),
  status: text('status').default('planned'), // 'planned', 'draft', 'ready', 'published'
  created_at: text('created_at').default(sql`(datetime('now'))`),
  updated_at: text('updated_at').default(sql`(datetime('now'))`),
});

// Content types
export type ContentBusinessProfile = typeof contentBusinessProfiles.$inferSelect;
export type NewContentBusinessProfile = typeof contentBusinessProfiles.$inferInsert;
export type ContentLibraryItem = typeof contentLibrary.$inferSelect;
export type NewContentLibraryItem = typeof contentLibrary.$inferInsert;
export type ContentCalendarEntry = typeof contentCalendar.$inferSelect;
export type NewContentCalendarEntry = typeof contentCalendar.$inferInsert;
