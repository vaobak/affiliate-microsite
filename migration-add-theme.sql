-- Migration: Add theme column to collections table

-- Add theme column if not exists
ALTER TABLE collections ADD COLUMN theme TEXT DEFAULT 'blue';

-- Update existing collections to have blue theme
UPDATE collections SET theme = 'blue' WHERE theme IS NULL;
