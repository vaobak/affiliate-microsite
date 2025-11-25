// Synchronous wrapper for D1 API - Makes async D1 calls appear synchronous
// This allows existing components to work without changes

import * as api from './api';

// Cache for data
let cache = {
  collections: null,
  clickHistory: null,
  collectionViews: null,
  pageViews: 0,
  lastUpdate: 0
};

const CACHE_DURATION = 5000; // 5 seconds

// Check if API is available
let apiAvailable = false;
let apiChecked = false;

// Test API availability
async function checkAPI() {
  if (apiChecked) return apiAvailable;
  apiChecked = true;
  
  try {
    const response = await fetch('/api/collections', { method: 'HEAD' });
    apiAvailable = response.ok;
  } catch {
    apiAvailable = false;
  }
  
  return apiAvailable;
}

// Initialize - check API and load initial data
export async function initializeDB() {
  await checkAPI();
  if (apiAvailable) {
    // Preload data
    await refreshCache();
  }
}

// Refresh cache from API
async function refreshCache() {
  if (!apiAvailable) return;
  
  try {
    const [collections, clicks, views, pageViews] = await Promise.all([
      api.fetchCollections().catch(() => []),
      api.fetchClickHistory().catch(() => []),
      api.fetchCollectionViews().catch(() => []),
      api.fetchPageViews().catch(() => 0)
    ]);
    
    cache.collections = collections;
    cache.clickHistory = clicks;
    cache.collectionViews = views;
    cache.pageViews = pageViews;
    cache.lastUpdate = Date.now();
  } catch (error) {
    console.error('Error refreshing cache:', error);
  }
}

// Auto-refresh cache periodically
setInterval(() => {
  if (apiAvailable && Date.now() - cache.lastUpdate > CACHE_DURATION) {
    refreshCache();
  }
}, CACHE_DURATION);

// Default collections
const DEFAULT_COLLECTIONS = [
  { id: 'home', name: 'Halaman Utama', slug: '', description: 'Produk di halaman utama', isDefault: true, products: [] },
  { id: 'barangviral', name: 'Barang Viral', slug: 'barangviral', description: 'Produk yang sedang viral dan trending', products: [] },
  { id: 'listprodukeren', name: 'List Produk Keren', slug: 'listprodukeren', description: 'Kumpulan produk keren pilihan', products: [] },
  { id: 'promo', name: 'Promo', slug: 'promo', description: 'Produk dengan promo spesial', products: [] }
];

// Get from localStorage
function getFromLocalStorage(key, defaultValue) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

// Save to localStorage
function saveToLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

// Collections - Synchronous interface
export function getCollections() {
  if (apiAvailable && cache.collections) {
    return cache.collections;
  }
  
  // Fallback to localStorage
  const stored = getFromLocalStorage('affiliate_collections', DEFAULT_COLLECTIONS);
  
  // If API available but cache not ready, trigger refresh
  if (apiAvailable && !cache.collections) {
    refreshCache();
  }
  
  return stored;
}

export function saveCollections(collections) {
  saveToLocalStorage('affiliate_collections', collections);
  
  if (apiAvailable) {
    // Sync to API in background
    cache.collections = collections;
  }
}

export function addCollection(collection) {
  const collections = getCollections();
  const newCollection = {
    id: collection.slug || Date.now().toString(),
    name: collection.name,
    slug: collection.slug || collection.name.toLowerCase().replace(/\s+/g, ''),
    description: collection.description || '',
    isDefault: false,
    products: []
  };
  
  collections.push(newCollection);
  saveCollections(collections);
  
  if (apiAvailable) {
    // Sync to API
    api.createCollection(newCollection).then(() => refreshCache());
  }
  
  return newCollection;
}

export function deleteCollection(id) {
  const collections = getCollections();
  const filtered = collections.filter(c => c.id !== id && !c.isDefault);
  saveCollections(filtered);
  
  if (apiAvailable) {
    // Sync to API
    api.deleteCollection(id).then(() => refreshCache());
  }
  
  return true;
}

export function getCollectionProducts(collectionId) {
  const collections = getCollections();
  const collection = collections.find(c => c.id === collectionId || c.slug === collectionId);
  return collection ? (collection.products || []) : [];
}

export function addProductToCollection(collectionId, product) {
  const collections = getCollections();
  const index = collections.findIndex(c => c.id === collectionId || c.slug === collectionId);
  
  if (index !== -1) {
    if (!collections[index].products) {
      collections[index].products = [];
    }
    
    const maxId = collections[index].products.length > 0 
      ? Math.max(...collections[index].products.map(p => p.id)) 
      : 0;
    
    const newProduct = {
      ...product,
      id: maxId + 1,
      clicks: 0,
      views: 0,
      createdAt: new Date().toISOString()
    };
    
    collections[index].products.push(newProduct);
    saveCollections(collections);
    
    if (apiAvailable) {
      // Sync to API
      api.createProduct({
        collectionId,
        ...product
      }).then(() => refreshCache());
    }
    
    return newProduct;
  }
  
  return null;
}

export function updateProductInCollection(collectionId, productId, updates) {
  const collections = getCollections();
  const collectionIndex = collections.findIndex(c => c.id === collectionId || c.slug === collectionId);
  
  if (collectionIndex !== -1) {
    const productIndex = collections[collectionIndex].products.findIndex(p => p.id === productId);
    
    if (productIndex !== -1) {
      collections[collectionIndex].products[productIndex] = {
        ...collections[collectionIndex].products[productIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      saveCollections(collections);
      
      if (apiAvailable) {
        // Sync to API
        api.updateProduct(productId, updates).then(() => refreshCache());
      }
      
      return collections[collectionIndex].products[productIndex];
    }
  }
  
  return null;
}

export function deleteProductFromCollection(collectionId, productId) {
  const collections = getCollections();
  const collectionIndex = collections.findIndex(c => c.id === collectionId || c.slug === collectionId);
  
  if (collectionIndex !== -1) {
    collections[collectionIndex].products = collections[collectionIndex].products.filter(p => p.id !== productId);
    saveCollections(collections);
    
    if (apiAvailable) {
      // Sync to API
      api.deleteProduct(productId).then(() => refreshCache());
    }
    
    return true;
  }
  
  return false;
}

// Helper functions
export function getCollectionBySlug(slug) {
  const collections = getCollections();
  return collections.find(c => c.slug === slug);
}

export function getDefaultCollection() {
  const collections = getCollections();
  return collections.find(c => c.isDefault) || collections[0];
}

export function getProductFromCollection(collectionId, productId) {
  const products = getCollectionProducts(collectionId);
  return products.find(p => p.id === parseInt(productId));
}

// Analytics
export function trackClick(productId, collectionId) {
  const history = getFromLocalStorage('affiliate_click_history', []);
  const now = new Date();
  
  history.push({
    productId,
    collectionId,
    timestamp: now.toISOString(),
    date: now.toISOString().split('T')[0],
    hour: now.getHours()
  });
  
  if (history.length > 1000) history.shift();
  saveToLocalStorage('affiliate_click_history', history);
  
  if (apiAvailable) {
    // Sync to API
    api.trackClick(productId, collectionId);
  }
}

export function trackCollectionView(collectionId) {
  const views = getFromLocalStorage('affiliate_collection_views', []);
  const now = new Date();
  
  views.push({
    collectionId,
    timestamp: now.toISOString(),
    date: now.toISOString().split('T')[0]
  });
  
  if (views.length > 2000) views.shift();
  saveToLocalStorage('affiliate_collection_views', views);
  
  if (apiAvailable) {
    // Sync to API
    api.trackCollectionView(collectionId);
  }
}

export function trackPageView() {
  const current = parseInt(localStorage.getItem('page_views') || '0');
  localStorage.setItem('page_views', (current + 1).toString());
  
  if (apiAvailable) {
    // Sync to API
    api.trackPageView();
  }
}

export function getPageViews() {
  if (apiAvailable && cache.pageViews) {
    return cache.pageViews;
  }
  return parseInt(localStorage.getItem('page_views') || '0');
}

export function getClickHistory() {
  if (apiAvailable && cache.clickHistory) {
    return cache.clickHistory;
  }
  return getFromLocalStorage('affiliate_click_history', []);
}

export function getCollectionViews() {
  if (apiAvailable && cache.collectionViews) {
    return cache.collectionViews;
  }
  return getFromLocalStorage('affiliate_collection_views', []);
}

export function getCollectionViewCount(collectionId) {
  const views = getCollectionViews();
  return views.filter(v => v.collectionId === collectionId || v.collection_id === collectionId).length;
}

// Update collection
export function updateCollection(id, updates) {
  const collections = getCollections();
  const collection = collections.find(c => c.id === id);
  
  if (collection) {
    Object.assign(collection, updates);
    saveCollections(collections);
  }
  
  return collection;
}

// Increment clicks
export function incrementClicksInCollection(collectionId, productId) {
  trackClick(productId, collectionId);
  
  // Update product clicks count
  const collections = getCollections();
  const collection = collections.find(c => c.id === collectionId);
  
  if (collection && collection.products) {
    const product = collection.products.find(p => p.id === productId);
    if (product) {
      product.clicks = (product.clicks || 0) + 1;
      saveCollections(collections);
    }
  }
}

// Export API availability status
export function isUsingAPI() {
  return apiAvailable;
}

// Initialize on load
if (typeof window !== 'undefined') {
  initializeDB();
}
