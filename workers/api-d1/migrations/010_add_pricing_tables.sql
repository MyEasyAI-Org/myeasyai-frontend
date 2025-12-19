-- Migration 010: Add pricing tables for MyEasyPricing feature
-- D1 primary with Supabase fallback architecture
-- Note: Foreign keys removed for D1 compatibility (managed at application level)

-- =============================================================================
-- Drop existing tables if they exist (clean slate for new schema)
-- =============================================================================
DROP TABLE IF EXISTS pricing_tax_items;
DROP TABLE IF EXISTS pricing_tax_config;
DROP TABLE IF EXISTS pricing_hidden_costs;
DROP TABLE IF EXISTS pricing_indirect_costs;
DROP TABLE IF EXISTS pricing_products;
DROP TABLE IF EXISTS pricing_stores;

-- =============================================================================
-- Pricing Stores Table
-- =============================================================================
CREATE TABLE pricing_stores (
  id TEXT PRIMARY KEY,
  user_uuid TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  currency TEXT DEFAULT 'BRL',
  cost_allocation_method TEXT DEFAULT 'equal',
  is_active INTEGER DEFAULT 1,
  is_demo INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_pricing_stores_user_uuid ON pricing_stores(user_uuid);
CREATE INDEX IF NOT EXISTS idx_pricing_stores_is_active ON pricing_stores(is_active);

-- =============================================================================
-- Pricing Products Table
-- =============================================================================
CREATE TABLE pricing_products (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  direct_cost INTEGER DEFAULT 0,
  unit_type TEXT DEFAULT 'unit',
  desired_margin INTEGER DEFAULT 30,
  positioning TEXT DEFAULT 'intermediate',
  market_price INTEGER,
  weight INTEGER DEFAULT 100,
  monthly_units_estimate INTEGER DEFAULT 100,
  is_active INTEGER DEFAULT 1,
  is_demo INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_pricing_products_store_id ON pricing_products(store_id);
CREATE INDEX IF NOT EXISTS idx_pricing_products_is_active ON pricing_products(is_active);

-- =============================================================================
-- Pricing Indirect Costs Table
-- =============================================================================
CREATE TABLE pricing_indirect_costs (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  amount INTEGER DEFAULT 0,
  frequency TEXT DEFAULT 'monthly',
  amortization_months INTEGER DEFAULT 12,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_pricing_indirect_costs_store_id ON pricing_indirect_costs(store_id);

-- =============================================================================
-- Pricing Hidden Costs Table
-- =============================================================================
CREATE TABLE pricing_hidden_costs (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  amount INTEGER DEFAULT 0,
  frequency TEXT DEFAULT 'monthly',
  amortization_months INTEGER DEFAULT 12,
  is_auto_calculated INTEGER DEFAULT 0,
  auxiliary_data TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_pricing_hidden_costs_store_id ON pricing_hidden_costs(store_id);

-- =============================================================================
-- Pricing Tax Config Table
-- =============================================================================
CREATE TABLE pricing_tax_config (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL UNIQUE,
  tax_regime TEXT DEFAULT 'simples',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_pricing_tax_config_store_id ON pricing_tax_config(store_id);

-- =============================================================================
-- Pricing Tax Items Table
-- =============================================================================
CREATE TABLE pricing_tax_items (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  percentage INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_pricing_tax_items_store_id ON pricing_tax_items(store_id);
