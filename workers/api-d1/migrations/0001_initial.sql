-- Migration: Initial Schema
-- Equivalente ao schema do Supabase PostgreSQL
-- Criado para Cloudflare D1 (SQLite)

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  uuid TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  preferred_name TEXT,
  mobile_phone TEXT,
  country TEXT,
  postal_code TEXT,
  address TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'pt',
  created_at TEXT DEFAULT (datetime('now')),
  last_online TEXT
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Tabela de produtos do usuário
CREATE TABLE IF NOT EXISTS user_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_uuid TEXT NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_type TEXT,
  status TEXT DEFAULT 'active',
  metadata TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_products_user_uuid ON user_products(user_uuid);
CREATE INDEX IF NOT EXISTS idx_user_products_status ON user_products(status);

-- Tabela de sites (MyEasyWebsite)
CREATE TABLE IF NOT EXISTS sites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_uuid TEXT NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  business_type TEXT,
  status TEXT DEFAULT 'active',
  settings TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT,
  published_at TEXT
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_sites_user_uuid ON sites(user_uuid);
CREATE INDEX IF NOT EXISTS idx_sites_slug ON sites(slug);
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);
