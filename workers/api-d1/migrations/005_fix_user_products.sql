-- Migration: Fix user_products id type to TEXT (UUID)
-- Date: 2025-12-11

-- Backup dos dados existentes
CREATE TABLE user_products_backup AS SELECT * FROM user_products;

-- Dropar tabela antiga
DROP TABLE user_products;

-- Recriar com id TEXT (para UUIDs)
CREATE TABLE user_products (
  id TEXT PRIMARY KEY,
  user_uuid TEXT NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
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

-- Restaurar dados existentes (convertendo id para texto)
INSERT INTO user_products (id, user_uuid, product_id, product_type, status, metadata, created_at, updated_at)
SELECT CAST(id AS TEXT), user_uuid, product_id, product_type, status, metadata, created_at, updated_at
FROM user_products_backup;

-- Limpar backup
DROP TABLE user_products_backup;
