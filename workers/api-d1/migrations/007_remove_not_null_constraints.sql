-- Remove NOT NULL constraints for better sync compatibility
-- Date: 2025-12-11

PRAGMA foreign_keys = OFF;

-- ============================================
-- USER_PRODUCTS: Remove NOT NULL from product_id and user_uuid
-- ============================================
CREATE TABLE user_products_new (
  id TEXT PRIMARY KEY,
  user_uuid TEXT,
  product_id TEXT,
  product_type TEXT,
  product_name TEXT,
  product_status TEXT,
  status TEXT DEFAULT 'active',
  active INTEGER DEFAULT 1,
  metadata TEXT,
  expires_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

INSERT INTO user_products_new SELECT * FROM user_products;
DROP TABLE user_products;
ALTER TABLE user_products_new RENAME TO user_products;

-- ============================================
-- PRICING_PRODUCTS: Remove NOT NULL from user_uuid and name
-- ============================================
CREATE TABLE pricing_products_new (
  id TEXT PRIMARY KEY,
  store_id TEXT,
  user_uuid TEXT,
  name TEXT,
  description TEXT,
  cost_price REAL,
  sale_price REAL,
  margin REAL,
  category TEXT,
  sku TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT,
  direct_cost REAL,
  markup_percentage REAL,
  final_price REAL,
  unit TEXT,
  quantity REAL DEFAULT 1,
  total_cost REAL,
  unit_type TEXT
);

INSERT INTO pricing_products_new SELECT * FROM pricing_products;
DROP TABLE pricing_products;
ALTER TABLE pricing_products_new RENAME TO pricing_products;

PRAGMA foreign_keys = ON;
