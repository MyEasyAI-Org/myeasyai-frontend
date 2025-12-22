-- Remove remaining NOT NULL constraints for better sync compatibility
-- Date: 2025-12-11

PRAGMA foreign_keys = OFF;

-- ============================================
-- PRICING_HIDDEN_COSTS
-- ============================================
CREATE TABLE pricing_hidden_costs_new (
  id TEXT PRIMARY KEY,
  store_id TEXT,
  user_uuid TEXT,
  name TEXT,
  value REAL,
  type TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT,
  category TEXT,
  is_percentage INTEGER DEFAULT 0,
  amount REAL
);

INSERT INTO pricing_hidden_costs_new SELECT * FROM pricing_hidden_costs;
DROP TABLE pricing_hidden_costs;
ALTER TABLE pricing_hidden_costs_new RENAME TO pricing_hidden_costs;

-- ============================================
-- PRICING_INDIRECT_COSTS
-- ============================================
CREATE TABLE pricing_indirect_costs_new (
  id TEXT PRIMARY KEY,
  store_id TEXT,
  user_uuid TEXT,
  name TEXT,
  value REAL,
  type TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT,
  category TEXT,
  is_percentage INTEGER DEFAULT 0,
  amount REAL
);

INSERT INTO pricing_indirect_costs_new SELECT * FROM pricing_indirect_costs;
DROP TABLE pricing_indirect_costs;
ALTER TABLE pricing_indirect_costs_new RENAME TO pricing_indirect_costs;

-- ============================================
-- PRICING_TAX_CONFIG
-- ============================================
CREATE TABLE pricing_tax_config_new (
  id TEXT PRIMARY KEY,
  store_id TEXT,
  user_uuid TEXT,
  name TEXT,
  rate REAL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT,
  tax_regime TEXT,
  tax_type TEXT,
  is_compound INTEGER DEFAULT 0,
  order_priority INTEGER DEFAULT 0,
  tax_rate REAL
);

INSERT INTO pricing_tax_config_new SELECT * FROM pricing_tax_config;
DROP TABLE pricing_tax_config;
ALTER TABLE pricing_tax_config_new RENAME TO pricing_tax_config;

-- ============================================
-- PRICING_TAX_ITEMS
-- ============================================
CREATE TABLE pricing_tax_items_new (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  tax_config_id TEXT,
  user_uuid TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  store_id TEXT,
  name TEXT,
  tax_name TEXT,
  tax_rate REAL,
  percentage REAL
);

INSERT INTO pricing_tax_items_new SELECT * FROM pricing_tax_items;
DROP TABLE pricing_tax_items;
ALTER TABLE pricing_tax_items_new RENAME TO pricing_tax_items;

PRAGMA foreign_keys = ON;
