-- Migration 016: Add auth_credentials table
-- Fix for CyberShield finding 3.C: Authentication bypass
-- Stores PBKDF2-SHA256 password hashes with individual salts

CREATE TABLE IF NOT EXISTS auth_credentials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_uuid TEXT NOT NULL UNIQUE REFERENCES users(uuid) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  algorithm TEXT DEFAULT 'PBKDF2-SHA256',
  iterations INTEGER DEFAULT 100000,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Index for fast lookup by user_uuid
CREATE INDEX IF NOT EXISTS idx_auth_credentials_user_uuid ON auth_credentials(user_uuid);
