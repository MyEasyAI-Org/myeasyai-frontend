-- Add missing columns to user_products to match Supabase schema
-- Date: 2025-12-11

ALTER TABLE user_products ADD COLUMN subscribed_at TEXT;
ALTER TABLE user_products ADD COLUMN cancelled_at TEXT;
ALTER TABLE user_products ADD COLUMN sites_created INTEGER DEFAULT 0;
ALTER TABLE user_products ADD COLUMN consultations_made INTEGER DEFAULT 0;
ALTER TABLE user_products ADD COLUMN api_calls INTEGER DEFAULT 0;
ALTER TABLE user_products ADD COLUMN product_settings TEXT;
