-- Migration: Add user_preferences table for cross-device settings sync
-- Date: 2025-11-25

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_preferences_key ON user_preferences(key);

-- Insert default preferences
INSERT OR IGNORE INTO user_preferences (key, value) VALUES ('showCategory', 'true');

-- Note: Run this migration in Cloudflare D1:
-- wrangler d1 execute affiliate-db --file=migration-add-user-preferences.sql
