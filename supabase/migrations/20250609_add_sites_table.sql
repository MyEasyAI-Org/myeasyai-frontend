-- Migration: Add sites table for MyEasyWebsite
-- This table mirrors the D1 sites table for fallback/backup

-- Create sites table
CREATE TABLE IF NOT EXISTS public.sites (
  id BIGSERIAL PRIMARY KEY,
  user_uuid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  business_type TEXT,
  status TEXT DEFAULT 'building' CHECK (status IN ('building', 'active', 'inactive')),
  settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sites_user_uuid ON public.sites(user_uuid);
CREATE INDEX IF NOT EXISTS idx_sites_slug ON public.sites(slug);
CREATE INDEX IF NOT EXISTS idx_sites_status ON public.sites(status);

-- Enable Row Level Security
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own sites
CREATE POLICY "Users can view own sites"
  ON public.sites FOR SELECT
  USING (auth.uid() = user_uuid);

-- Users can insert their own sites
CREATE POLICY "Users can insert own sites"
  ON public.sites FOR INSERT
  WITH CHECK (auth.uid() = user_uuid);

-- Users can update their own sites
CREATE POLICY "Users can update own sites"
  ON public.sites FOR UPDATE
  USING (auth.uid() = user_uuid);

-- Users can delete their own sites
CREATE POLICY "Users can delete own sites"
  ON public.sites FOR DELETE
  USING (auth.uid() = user_uuid);

-- Grant permissions
GRANT ALL ON public.sites TO authenticated;
GRANT ALL ON public.sites TO service_role;

-- Comments
COMMENT ON TABLE public.sites IS 'User websites created with MyEasyWebsite - mirrors D1 for fallback';
COMMENT ON COLUMN public.sites.slug IS 'Unique subdomain slug (e.g., my-business for my-business.myeasyai.com)';
COMMENT ON COLUMN public.sites.settings IS 'JSON with all site configuration including generatedHtml';
COMMENT ON COLUMN public.sites.status IS 'building = in progress, active = published, inactive = disabled';
