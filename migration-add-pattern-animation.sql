-- Migration: Add pattern and enable_animation columns to collections table

-- Add pattern column if not exists
ALTER TABLE collections ADD COLUMN pattern TEXT DEFAULT 'none';

-- Add enable_animation column if not exists
ALTER TABLE collections ADD COLUMN enable_animation INTEGER DEFAULT 1;

-- Update existing collections to have default values
UPDATE collections SET pattern = 'none' WHERE pattern IS NULL;
UPDATE collections SET enable_animation = 1 WHERE enable_animation IS NULL;
