-- Migration: Add missing columns to match Supabase schema
-- Date: 2025-12-11

-- Users: add subscription_plan
ALTER TABLE users ADD COLUMN subscription_plan TEXT;

-- User Products: add product_name, active, expires_at
ALTER TABLE user_products ADD COLUMN product_name TEXT;
ALTER TABLE user_products ADD COLUMN active INTEGER DEFAULT 1;
ALTER TABLE user_products ADD COLUMN expires_at TEXT;

-- Pricing Stores: add currency, settings
ALTER TABLE pricing_stores ADD COLUMN currency TEXT DEFAULT 'BRL';
ALTER TABLE pricing_stores ADD COLUMN settings TEXT;

-- Pricing Products: add direct_cost, markup_percentage, final_price, unit, quantity, total_cost
ALTER TABLE pricing_products ADD COLUMN direct_cost REAL;
ALTER TABLE pricing_products ADD COLUMN markup_percentage REAL;
ALTER TABLE pricing_products ADD COLUMN final_price REAL;
ALTER TABLE pricing_products ADD COLUMN unit TEXT;
ALTER TABLE pricing_products ADD COLUMN quantity REAL DEFAULT 1;
ALTER TABLE pricing_products ADD COLUMN total_cost REAL;

-- Pricing Hidden Costs: add category, is_percentage
ALTER TABLE pricing_hidden_costs ADD COLUMN category TEXT;
ALTER TABLE pricing_hidden_costs ADD COLUMN is_percentage INTEGER DEFAULT 0;

-- Pricing Indirect Costs: add category, is_percentage
ALTER TABLE pricing_indirect_costs ADD COLUMN category TEXT;
ALTER TABLE pricing_indirect_costs ADD COLUMN is_percentage INTEGER DEFAULT 0;

-- Pricing Tax Config: add tax_regime, tax_type, is_compound, order_priority
ALTER TABLE pricing_tax_config ADD COLUMN tax_regime TEXT;
ALTER TABLE pricing_tax_config ADD COLUMN tax_type TEXT;
ALTER TABLE pricing_tax_config ADD COLUMN is_compound INTEGER DEFAULT 0;
ALTER TABLE pricing_tax_config ADD COLUMN order_priority INTEGER DEFAULT 0;

-- Pricing Tax Items: add store_id, name, tax_name, tax_rate
ALTER TABLE pricing_tax_items ADD COLUMN store_id TEXT;
ALTER TABLE pricing_tax_items ADD COLUMN name TEXT;
ALTER TABLE pricing_tax_items ADD COLUMN tax_name TEXT;
ALTER TABLE pricing_tax_items ADD COLUMN tax_rate REAL;
