-- Migration: Create users table in public schema for D1 sync
-- This mirrors the D1 users table structure
-- Run this in Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id BIGSERIAL,
  uuid TEXT PRIMARY KEY,  -- Using TEXT instead of UUID for flexibility with D1
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  preferred_name TEXT,
  mobile_phone TEXT,
  country TEXT,
  postal_code TEXT,
  address TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'pt',
  subscription_plan TEXT DEFAULT 'individual',
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_online TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_uuid ON public.users(uuid);

-- Disable RLS for service_role access (sync from D1)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- Comments
COMMENT ON TABLE public.users IS 'User profiles - synced from D1 (Cloudflare)';
