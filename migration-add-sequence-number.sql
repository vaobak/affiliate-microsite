-- Migration: Add sequence_number field for per-collection numbering
-- Date: 2025-11-25
-- Version: 2.5

-- Add sequence_number column to products table
ALTER TABLE products ADD COLUMN sequence_number INTEGER;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_collection_sequence ON products(collection_id, sequence_number);

-- Update existing products with sequence numbers per collection
-- This uses a subquery to calculate row numbers within each collection
UPDATE products 
SET sequence_number = (
  SELECT COUNT(*) 
  FROM products p2 
  WHERE p2.collection_id = products.collection_id 
    AND p2.id <= products.id
);

-- Verify migration
-- Run this to check: SELECT collection_id, id, sequence_number, name FROM products ORDER BY collection_id, sequence_number;
