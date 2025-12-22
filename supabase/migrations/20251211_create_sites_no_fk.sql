-- Migration: Create sites table WITHOUT foreign key to auth.users
-- This allows sync from D1 where we have our own UUID system
-- Run this in Supabase SQL Editor

-- Drop existing table if exists (careful in production!)
-- DROP TABLE IF EXISTS public.sites;

-- Create sites table without FK constraint
CREATE TABLE IF NOT EXISTS public.sites (
  id BIGSERIAL PRIMARY KEY,
  user_uuid TEXT NOT NULL,  -- Changed from UUID with FK to TEXT for flexibility
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  business_type TEXT,
  status TEXT DEFAULT 'building',
  settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sites_user_uuid ON public.sites(user_uuid);
CREATE INDEX IF NOT EXISTS idx_sites_slug ON public.sites(slug);
CREATE INDEX IF NOT EXISTS idx_sites_status ON public.sites(status);

-- Disable RLS for service_role access (sync)
ALTER TABLE public.sites DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.sites TO authenticated;
GRANT ALL ON public.sites TO service_role;
GRANT ALL ON SEQUENCE public.sites_id_seq TO service_role;

-- Comments
COMMENT ON TABLE public.sites IS 'User websites created with MyEasyWebsite - synced from D1';
