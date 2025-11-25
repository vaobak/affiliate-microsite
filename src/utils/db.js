// Database Abstraction Layer - Auto switch between D1 API and localStorage

import * as api from './api';

// Detect if we should use API (production with D1) or localStorage (development)
const USE_API = import.meta.env.PROD || window.location.hostname !== 'localhost';

// Test if API is available
let apiAvailable = false;
let apiTested = false;

async function testAPI() {
  if (apiTested) return apiAvailable;
  apiTested = true;
  
  if (!USE_API) {
    apiAvailable = false;
    return false;
  }
  
  try {
    const response = await fetch('/api/collections', { method: 'HEAD' });
    apiAvailable = response.ok;
    return apiAvailable;
  } catch {
    apiAvailable = false;
    return false;
  }
}

// Initialize API check
testAPI();

// Default collections
const DEFAULT_COLLECTIONS = [
  { id: 'home', name: 'Halaman Utama', slug: '', description: 'Produk di halaman utama', isDefault: true, products: [] },
  { id: 'barangviral', name: 'Barang Viral', slug: 'barangviral', description: 'Produk yang sedang viral dan trending', products: [] },
  { id: 'listprodukeren', name: 'List Produk Keren', slug: 'listprodukeren', description: 'Kumpulan produk keren pilihan', products: [] },
  { id: 'promo', name: 'Promo', slug: 'promo', description: 'Produk dengan promo spesial', products: [] }
];

// Sync version for backward compatibility
function getCollectionsSync() {
  const stored = localStorage.getItem('affiliate_collections');
  if (!stored) {
    localStorage.setItem('affiliate_collections', JSON.stringify(DEFAULT_COLLECTIONS));
    return DEFAULT_COLLECTIONS;
  }
  return JSON.parse(stored);
}

// Collections - Returns Promise for async, but can be used sync via .then()
export function getCollections() {
  // If API not tested yet or not available, return sync data wrapped in Promise
  if (!apiTested || !apiAvailable) {
    return Promise.resolve(getCollectionsSync());
  }
  
  // Try API first
  return api.fetchCollections()
    .catch(error => {
      console.warn('API failed, using localStorage:', error);
      apiAvailable = false;
      return getCollectionsSync();
    });
}

export async function saveCollections(collections) {
  // Always save to localStorage for backup
  localStorage.setItem('affiliate_collections', JSON.stringify(collections));
  
  // If API available, sync to D1
  if (apiAvailable) {
    // Note: This is for compatibility, actual saves should use specific API calls
    console.log('Collections saved to localStorage, use specific API calls for D1 sync');
  }
}

export async function addCollection(collection) {
  if (apiAvailable) {
    try {
      return await api.createCollection(collection);
    } catch (error) {
      console.warn('API failed, using localStorage:', error);
    }
  }
  
  // localStorage fallback
  const collections = await getCollections();
  const newCollection = {
    id: collection.slug || Date.now().toString(),
    name: collection.name,
    slug: collection.slug || collection.name.toLowerCase().replace(/\s+/g, ''),
    description: collection.description || '',
    isDefault: false,
    products: []
  };
  collections.push(newCollection);
  await saveCollections(collections);
  return newCollection;
}

export async function deleteCollection(id) {
  if (apiAvailable) {
    try {
      await api.deleteCollection(id);
      return true;
    } catch (error) {
      console.warn('API failed, using localStorage:', error);
    }
  }
  
  // localStorage fallback
  const collections = await getCollections();
  const filtered = collections.filter(c => c.id !== id && !c.isDefault);
  await saveCollections(filtered);
  return true;
}

// Products
export async function getCollectionProducts(collectionId) {
  if (apiAvailable) {
    try {
      return await api.fetchProducts(collectionId);
    } catch (error) {
      console.warn('API failed, using localStorage:', error);
    }
  }
  
  // localStorage fallback
  const collections = await getCollections();
  const collection = collections.find(c => c.id === collectionId || c.slug === collectionId);
  return collection ? (collection.products || []) : [];
}

export async function addProductToCollection(collectionId, product) {
  if (apiAvailable) {
    try {
      return await api.createProduct({
        collectionId,
        name: product.name,
        description: product.description,
        price: product.price,
        affiliateLink: product.affiliateLink,
        imageUrl: product.imageUrl,
        category: product.category,
        badge: product.badge
      });
    } catch (error) {
      console.warn('API failed, using localStorage:', error);
    }
  }
  
  // localStorage fallback
  const collections = await getCollections();
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
      createdAt: new Date().toISOString()
    };
    collections[index].products.push(newProduct);
    await saveCollections(collections);
    return newProduct;
  }
  return null;
}

export async function updateProductInCollection(collectionId, productId, updates) {
  if (apiAvailable) {
    try {
      await api.updateProduct(productId, {
        name: updates.name,
        description: updates.description,
        price: updates.price,
        affiliateLink: updates.affiliateLink,
        imageUrl: updates.imageUrl,
        category: updates.category,
        badge: updates.badge
      });
      return true;
    } catch (error) {
      console.warn('API failed, using localStorage:', error);
    }
  }
  
  // localStorage fallback
  const collections = await getCollections();
  const collectionIndex = collections.findIndex(c => c.id === collectionId || c.slug === collectionId);
  if (collectionIndex !== -1) {
    const productIndex = collections[collectionIndex].products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      collections[collectionIndex].products[productIndex] = {
        ...collections[collectionIndex].products[productIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await saveCollections(collections);
      return collections[collectionIndex].products[productIndex];
    }
  }
  return null;
}

export async function deleteProductFromCollection(collectionId, productId) {
  if (apiAvailable) {
    try {
      await api.deleteProduct(productId);
      return true;
    } catch (error) {
      console.warn('API failed, using localStorage:', error);
    }
  }
  
  // localStorage fallback
  const collections = await getCollections();
  const collectionIndex = collections.findIndex(c => c.id === collectionId || c.slug === collectionId);
  if (collectionIndex !== -1) {
    collections[collectionIndex].products = collections[collectionIndex].products.filter(p => p.id !== productId);
    await saveCollections(collections);
    return true;
  }
  return false;
}

// Analytics
export async function trackClick(productId, collectionId) {
  if (apiAvailable) {
    try {
      await api.trackClick(productId, collectionId);
      return;
    } catch (error) {
      console.warn('API failed for tracking:', error);
    }
  }
  
  // localStorage fallback
  const history = JSON.parse(localStorage.getItem('affiliate_click_history') || '[]');
  const now = new Date();
  history.push({
    productId,
    collectionId,
    timestamp: now.toISOString(),
    date: now.toISOString().split('T')[0],
    hour: now.getHours()
  });
  if (history.length > 1000) history.shift();
  localStorage.setItem('affiliate_click_history', JSON.stringify(history));
}

export async function trackCollectionView(collectionId) {
  if (apiAvailable) {
    try {
      await api.trackCollectionView(collectionId);
      return;
    } catch (error) {
      console.warn('API failed for tracking:', error);
    }
  }
  
  // localStorage fallback
  const views = JSON.parse(localStorage.getItem('affiliate_collection_views') || '[]');
  const now = new Date();
  views.push({
    collectionId,
    timestamp: now.toISOString(),
    date: now.toISOString().split('T')[0]
  });
  if (views.length > 2000) views.shift();
  localStorage.setItem('affiliate_collection_views', JSON.stringify(views));
}

export async function trackPageView() {
  if (apiAvailable) {
    try {
      await api.trackPageView();
      return;
    } catch (error) {
      console.warn('API failed for tracking:', error);
    }
  }
  
  // localStorage fallback
  const current = parseInt(localStorage.getItem('page_views') || '0');
  localStorage.setItem('page_views', (current + 1).toString());
}

export async function getPageViews() {
  if (apiAvailable) {
    try {
      return await api.fetchPageViews();
    } catch (error) {
      console.warn('API failed:', error);
    }
  }
  
  // localStorage fallback
  return parseInt(localStorage.getItem('page_views') || '0');
}

export async function getClickHistory() {
  if (apiAvailable) {
    try {
      return await api.fetchClickHistory();
    } catch (error) {
      console.warn('API failed:', error);
    }
  }
  
  // localStorage fallback
  return JSON.parse(localStorage.getItem('affiliate_click_history') || '[]');
}

export async function getCollectionViews() {
  if (apiAvailable) {
    try {
      return await api.fetchCollectionViews();
    } catch (error) {
      console.warn('API failed:', error);
    }
  }
  
  // localStorage fallback
  return JSON.parse(localStorage.getItem('affiliate_collection_views') || '[]');
}

// Helper functions
export function getCollectionBySlug(slug) {
  // This needs to be sync for routing, so we use a workaround
  return getCollections().then(collections => 
    collections.find(c => c.slug === slug)
  );
}

export function getDefaultCollection() {
  return getCollections().then(collections =>
    collections.find(c => c.isDefault) || collections[0]
  );
}

// Export API availability status
export function isUsingAPI() {
  return apiAvailable;
}
