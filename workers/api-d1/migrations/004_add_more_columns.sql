-- Migration: Add remaining missing columns
-- Date: 2025-12-11

-- Users
ALTER TABLE users ADD COLUMN subscription_status TEXT;

-- User Products
ALTER TABLE user_products ADD COLUMN product_status TEXT;

-- Pricing Stores
ALTER TABLE pricing_stores ADD COLUMN cost_allocation_method TEXT;

-- Pricing Products
ALTER TABLE pricing_products ADD COLUMN unit_type TEXT;

-- Pricing Hidden Costs
ALTER TABLE pricing_hidden_costs ADD COLUMN amount REAL;

-- Pricing Indirect Costs
ALTER TABLE pricing_indirect_costs ADD COLUMN amount REAL;

-- Pricing Tax Config
ALTER TABLE pricing_tax_config ADD COLUMN tax_rate REAL;

-- Pricing Tax Items
ALTER TABLE pricing_tax_items ADD COLUMN percentage REAL;
