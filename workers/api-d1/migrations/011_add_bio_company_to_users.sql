-- Migration: Add bio and company_name columns to users table
-- These fields were missing in the profile update functionality

ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN company_name TEXT;
