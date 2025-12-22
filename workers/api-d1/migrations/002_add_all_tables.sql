-- Migration: Add all tables from Supabase
-- Date: 2025-12-11

-- Billing History
CREATE TABLE IF NOT EXISTS billing_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_uuid TEXT NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  amount REAL,
  currency TEXT DEFAULT 'BRL',
  description TEXT,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  invoice_url TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

-- Pricing Stores
CREATE TABLE IF NOT EXISTS pricing_stores (
  id TEXT PRIMARY KEY,
  user_uuid TEXT NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

-- Pricing Products
CREATE TABLE IF NOT EXISTS pricing_products (
  id TEXT PRIMARY KEY,
  store_id TEXT REFERENCES pricing_stores(id) ON DELETE CASCADE,
  user_uuid TEXT NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cost_price REAL,
  sale_price REAL,
  margin REAL,
  category TEXT,
  sku TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

-- Pricing Hidden Costs
CREATE TABLE IF NOT EXISTS pricing_hidden_costs (
  id TEXT PRIMARY KEY,
  store_id TEXT REFERENCES pricing_stores(id) ON DELETE CASCADE,
  user_uuid TEXT NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value REAL,
  type TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

-- Pricing Indirect Costs
CREATE TABLE IF NOT EXISTS pricing_indirect_costs (
  id TEXT PRIMARY KEY,
  store_id TEXT REFERENCES pricing_stores(id) ON DELETE CASCADE,
  user_uuid TEXT NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value REAL,
  type TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

-- Pricing Tax Config
CREATE TABLE IF NOT EXISTS pricing_tax_config (
  id TEXT PRIMARY KEY,
  store_id TEXT REFERENCES pricing_stores(id) ON DELETE CASCADE,
  user_uuid TEXT NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rate REAL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

-- Pricing Tax Items
CREATE TABLE IF NOT EXISTS pricing_tax_items (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES pricing_products(id) ON DELETE CASCADE,
  tax_config_id TEXT REFERENCES pricing_tax_config(id) ON DELETE CASCADE,
  user_uuid TEXT NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Usage Logs
CREATE TABLE IF NOT EXISTS usage_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_uuid TEXT NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource TEXT,
  metadata TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- CRM Companies
CREATE TABLE IF NOT EXISTS crm_companies (
  id TEXT PRIMARY KEY,
  user_uuid TEXT NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT,
  industry TEXT,
  size TEXT,
  website TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

-- CRM Contacts
CREATE TABLE IF NOT EXISTS crm_contacts (
  id TEXT PRIMARY KEY,
  user_uuid TEXT NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  company_id TEXT REFERENCES crm_companies(id) ON DELETE SET NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  job_title TEXT,
  department TEXT,
  linkedin TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

-- CRM Deals
CREATE TABLE IF NOT EXISTS crm_deals (
  id TEXT PRIMARY KEY,
  user_uuid TEXT NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  company_id TEXT REFERENCES crm_companies(id) ON DELETE SET NULL,
  contact_id TEXT REFERENCES crm_contacts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  value REAL,
  currency TEXT DEFAULT 'BRL',
  stage TEXT DEFAULT 'lead',
  probability INTEGER DEFAULT 0,
  expected_close_date TEXT,
  actual_close_date TEXT,
  lost_reason TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

-- CRM Activities
CREATE TABLE IF NOT EXISTS crm_activities (
  id TEXT PRIMARY KEY,
  user_uuid TEXT NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  deal_id TEXT REFERENCES crm_deals(id) ON DELETE CASCADE,
  contact_id TEXT REFERENCES crm_contacts(id) ON DELETE SET NULL,
  company_id TEXT REFERENCES crm_companies(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  subject TEXT,
  description TEXT,
  scheduled_at TEXT,
  completed_at TEXT,
  duration INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

-- CRM Tasks
CREATE TABLE IF NOT EXISTS crm_tasks (
  id TEXT PRIMARY KEY,
  user_uuid TEXT NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  deal_id TEXT REFERENCES crm_deals(id) ON DELETE CASCADE,
  contact_id TEXT REFERENCES crm_contacts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  completed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

-- CRM Deal Metrics (for analytics)
CREATE TABLE IF NOT EXISTS crm_deal_metrics (
  id TEXT PRIMARY KEY,
  user_uuid TEXT NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  deal_id TEXT REFERENCES crm_deals(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value REAL,
  period TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
