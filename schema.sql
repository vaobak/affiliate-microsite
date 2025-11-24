-- Cloudflare D1 Database Schema for Affiliate Microsite

-- Collections Table
CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  is_default INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  collection_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price REAL,
  affiliate_link TEXT NOT NULL,
  image_url TEXT,
  category TEXT,
  badge TEXT,
  clicks INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
);

-- Click History Table
CREATE TABLE IF NOT EXISTS click_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  collection_id TEXT NOT NULL,
  timestamp TEXT DEFAULT (datetime('now')),
  date TEXT NOT NULL,
  hour INTEGER NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
);

-- Collection Views Table
CREATE TABLE IF NOT EXISTS collection_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  collection_id TEXT NOT NULL,
  timestamp TEXT DEFAULT (datetime('now')),
  date TEXT NOT NULL,
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
);

-- Page Views Table (Global counter)
CREATE TABLE IF NOT EXISTS page_views (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  count INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Recent Activity Table
CREATE TABLE IF NOT EXISTS recent_activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  collection_id TEXT,
  product_id INTEGER,
  timestamp TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection_id);
CREATE INDEX IF NOT EXISTS idx_click_history_collection ON click_history(collection_id);
CREATE INDEX IF NOT EXISTS idx_click_history_date ON click_history(date);
CREATE INDEX IF NOT EXISTS idx_collection_views_collection ON collection_views(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_views_date ON collection_views(date);
CREATE INDEX IF NOT EXISTS idx_recent_activity_timestamp ON recent_activity(timestamp DESC);

-- Insert default page views counter
INSERT OR IGNORE INTO page_views (id, count) VALUES (1, 0);

-- Insert default collections
INSERT OR IGNORE INTO collections (id, name, slug, description, is_default) VALUES
  ('home', 'Halaman Utama', '', 'Produk di halaman utama', 1),
  ('barangviral', 'Barang Viral', 'barangviral', 'Produk yang sedang viral dan trending', 0),
  ('listprodukeren', 'List Produk Keren', 'listprodukeren', 'Kumpulan produk keren pilihan', 0),
  ('promo', 'Promo', 'promo', 'Produk dengan promo spesial', 0);
