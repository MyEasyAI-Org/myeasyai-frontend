-- Migration 015: Add payment_method_type to users table
-- Tracks how the user paid: 'card' (à vista with card), 'pix' (à vista with PIX), or NULL (recurring subscription)

ALTER TABLE users ADD COLUMN payment_method_type TEXT;
