-- Remove FK constraint from user_products for better sync compatibility
-- Date: 2025-12-11

PRAGMA foreign_keys = OFF;

-- Backup
CREATE TABLE user_products_temp AS SELECT * FROM user_products;

-- Drop
DROP TABLE user_products;

-- Recreate without FK
CREATE TABLE user_products (
  id TEXT PRIMARY KEY,
  user_uuid TEXT NOT NULL,
  product_id TEXT NOT NULL,
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

-- Restore
INSERT INTO user_products SELECT * FROM user_products_temp;

-- Cleanup
DROP TABLE user_products_temp;

PRAGMA foreign_keys = ON;
