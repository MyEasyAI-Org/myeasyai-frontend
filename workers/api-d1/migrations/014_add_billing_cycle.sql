-- Add billing_cycle column to users table
-- Stores 'monthly' or 'annual' to track user's billing preference

ALTER TABLE users ADD COLUMN billing_cycle TEXT;
