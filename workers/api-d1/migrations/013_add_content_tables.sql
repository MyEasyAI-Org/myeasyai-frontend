-- =============================================
-- MyEasyContent Tables Migration
-- Multi-profile business system for content generation
-- =============================================

-- Content Business Profiles (Presets)
CREATE TABLE IF NOT EXISTS content_business_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,                    -- "Restaurante do João", "Loja de Instrumentos"
  business_niche TEXT NOT NULL,          -- 'restaurant', 'retail', 'consulting', etc.
  target_audience TEXT,                  -- "Jovens 18-35, amantes de hambúrguer"
  brand_voice TEXT DEFAULT 'professional', -- 'professional', 'casual', 'funny', etc.
  selected_networks TEXT,                -- JSON array: ["instagram", "linkedin"]
  preferred_content_types TEXT,          -- JSON array: ["feed_post", "reel", "story"]
  icon TEXT,                             -- Emoji or icon identifier
  is_default INTEGER DEFAULT 0,          -- 1 = default profile for user
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(uuid) ON DELETE CASCADE
);

-- Content Library (Saved/Generated Content)
CREATE TABLE IF NOT EXISTS content_library (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  profile_id TEXT NOT NULL,              -- FK to content_business_profiles
  content_type TEXT NOT NULL,            -- 'feed_post', 'caption', 'reel', 'story', etc.
  network TEXT NOT NULL,                 -- 'instagram', 'linkedin', etc.
  title TEXT,
  content TEXT NOT NULL,                 -- The main generated text
  hashtags TEXT,                         -- JSON array of hashtags
  image_description TEXT,                -- AI-suggested image description
  best_time TEXT,                        -- Recommended posting time
  variations TEXT,                       -- JSON array of content variations
  is_favorite INTEGER DEFAULT 0,
  tags TEXT,                             -- JSON array of user tags
  folder TEXT,                           -- User folder organization
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(uuid) ON DELETE CASCADE,
  FOREIGN KEY (profile_id) REFERENCES content_business_profiles(id) ON DELETE CASCADE
);

-- Content Calendar (Editorial Planning)
CREATE TABLE IF NOT EXISTS content_calendar (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  profile_id TEXT NOT NULL,              -- FK to content_business_profiles
  library_content_id TEXT,               -- Optional FK to content_library
  scheduled_date TEXT NOT NULL,          -- YYYY-MM-DD
  day_of_week TEXT,                      -- 'monday', 'tuesday', etc.
  network TEXT NOT NULL,
  content_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  hashtags TEXT,                         -- JSON array
  best_time TEXT,
  status TEXT DEFAULT 'planned',         -- 'planned', 'draft', 'ready', 'published'
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(uuid) ON DELETE CASCADE,
  FOREIGN KEY (profile_id) REFERENCES content_business_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (library_content_id) REFERENCES content_library(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_profiles_user_id ON content_business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_content_profiles_is_default ON content_business_profiles(is_default);
CREATE INDEX IF NOT EXISTS idx_content_library_user_id ON content_library(user_id);
CREATE INDEX IF NOT EXISTS idx_content_library_profile_id ON content_library(profile_id);
CREATE INDEX IF NOT EXISTS idx_content_library_is_favorite ON content_library(is_favorite);
CREATE INDEX IF NOT EXISTS idx_content_library_created_at ON content_library(created_at);
CREATE INDEX IF NOT EXISTS idx_content_calendar_user_id ON content_calendar(user_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_profile_id ON content_calendar(profile_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_scheduled_date ON content_calendar(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_content_calendar_status ON content_calendar(status);
