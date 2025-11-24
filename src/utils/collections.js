import { cleanupCollectionData, resetAllAnalytics } from './analytics';
import { cleanupCollectionActivity, resetAllData } from './storage';

const COLLECTIONS_KEY = 'affiliate_collections';

// Default collections - Each collection has its own products
const DEFAULT_COLLECTIONS = [
  {
    id: 'home',
    name: 'Halaman Utama',
    slug: '',
    description: 'Produk di halaman utama',
    isDefault: true,
    products: []
  },
  {
    id: 'barangviral',
    name: 'Barang Viral',
    slug: 'barangviral',
    description: 'Produk yang sedang viral dan trending',
    products: []
  },
  {
    id: 'listprodukeren',
    name: 'List Produk Keren',
    slug: 'listprodukeren',
    description: 'Kumpulan produk keren pilihan',
    products: []
  },
  {
    id: 'promo',
    name: 'Promo',
    slug: 'promo',
    description: 'Produk dengan promo spesial',
    products: []
  }
];

// Get all collections
export function getCollections() {
  const stored = localStorage.getItem(COLLECTIONS_KEY);
  if (!stored) {
    // Initialize with default collections
    saveCollections(DEFAULT_COLLECTIONS);
    return DEFAULT_COLLECTIONS;
  }
  return JSON.parse(stored);
}

// Save collections
export function saveCollections(collections) {
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
}

// Add new collection
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
  return newCollection;
}

// Get products from a collection
export function getCollectionProducts(collectionId) {
  const collections = getCollections();
  const collection = collections.find(c => c.id === collectionId || c.slug === collectionId);
  return collection ? (collection.products || []) : [];
}

// Add product to collection
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
      createdAt: new Date().toISOString()
    };
    collections[index].products.push(newProduct);
    saveCollections(collections);
    return newProduct;
  }
  return null;
}

// Update product in collection
export function updateProductInCollection(collectionId, productId, updates) {
  const collections = getCollections();
  const collectionIndex = collections.findIndex(c => c.id === collectionId || c.slug === collectionId);
  if (collectionIndex !== -1) {
    const productIndex = collections[collectionIndex].products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      collections[collectionIndex].products[productIndex] = {
        ...collections[collectionIndex].products[productIndex],
        ...updates
      };
      saveCollections(collections);
      return collections[collectionIndex].products[productIndex];
    }
  }
  return null;
}

// Delete product from collection
export function deleteProductFromCollection(collectionId, productId) {
  const collections = getCollections();
  const collectionIndex = collections.findIndex(c => c.id === collectionId || c.slug === collectionId);
  if (collectionIndex !== -1) {
    collections[collectionIndex].products = collections[collectionIndex].products.filter(
      p => p.id !== productId
    );
    saveCollections(collections);
    return true;
  }
  return false;
}

// Get product by ID from collection
export function getProductFromCollection(collectionId, productId) {
  const collections = getCollections();
  const collection = collections.find(c => c.id === collectionId || c.slug === collectionId);
  if (collection && collection.products) {
    return collection.products.find(p => p.id === parseInt(productId));
  }
  return null;
}

// Increment clicks for product in collection
export function incrementClicksInCollection(collectionId, productId) {
  const collections = getCollections();
  const collectionIndex = collections.findIndex(c => c.id === collectionId || c.slug === collectionId);
  if (collectionIndex !== -1) {
    const productIndex = collections[collectionIndex].products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      collections[collectionIndex].products[productIndex].clicks = 
        (collections[collectionIndex].products[productIndex].clicks || 0) + 1;
      saveCollections(collections);
      return collections[collectionIndex].products[productIndex];
    }
  }
  return null;
}

// Update collection
export function updateCollection(id, updates) {
  const collections = getCollections();
  const index = collections.findIndex(c => c.id === id);
  if (index !== -1) {
    collections[index] = { ...collections[index], ...updates };
    saveCollections(collections);
    return collections[index];
  }
  return null;
}

// Delete collection
export function deleteCollection(id) {
  const collections = getCollections();
  
  // Remove collection (keep default collections)
  const filtered = collections.filter(c => c.id !== id && !c.isDefault);
  
  // Check if this is the last collection being deleted
  if (filtered.length === 0) {
    // Reset all data when all collections are deleted
    resetAllAnalytics();
    resetAllData();
  } else {
    // Cleanup analytics data for this specific collection (clicks, views)
    cleanupCollectionData(id);
    
    // Cleanup recent activity for this collection
    cleanupCollectionActivity(id);
  }
  
  saveCollections(filtered);
  
  return true;
}

// Get collection by slug
export function getCollectionBySlug(slug) {
  const collections = getCollections();
  return collections.find(c => c.slug === slug);
}

// Get default collection
export function getDefaultCollection() {
  const collections = getCollections();
  return collections.find(c => c.isDefault) || collections[0];
}

// Migrate old products from localStorage to default collection
export function migrateOldProducts() {
  const oldProducts = localStorage.getItem('affiliate_items');
  if (!oldProducts) return false;

  try {
    const products = JSON.parse(oldProducts);
    if (!Array.isArray(products) || products.length === 0) return false;

    const collections = getCollections();
    const defaultCollection = collections.find(c => c.isDefault);
    
    if (!defaultCollection) return false;

    // Check if already migrated
    if (defaultCollection.products && defaultCollection.products.length > 0) {
      return false; // Already has products, skip migration
    }

    // Migrate products to default collection
    const collectionIndex = collections.findIndex(c => c.isDefault);
    if (collectionIndex !== -1) {
      collections[collectionIndex].products = products.map(p => ({
        ...p,
        clicks: p.clicks || 0,
        category: p.category || 'Uncategorized',
        badge: p.badge || '',
        createdAt: p.createdAt || new Date().toISOString()
      }));
      saveCollections(collections);
      
      // Backup old data and clear it
      localStorage.setItem('affiliate_items_backup', oldProducts);
      localStorage.removeItem('affiliate_items');
      
      return true;
    }
  } catch (error) {
    console.error('Migration error:', error);
  }
  
  return false;
}

// Import products to collection - REPLACE MODE
export function importProductsReplaceToCollection(collectionId, productsData) {
  const collections = getCollections();
  const collectionIndex = collections.findIndex(c => c.id === collectionId || c.slug === collectionId);
  
  if (collectionIndex === -1) {
    throw new Error('Collection tidak ditemukan');
  }

  const errors = [];
  const newProducts = [];

  productsData.forEach((row, index) => {
    const productId = row['ID'] || row['id'];
    const productName = row['Product Name'] || row['product name'] || row['name'];
    const affiliateLink = row['Affiliate Link'] || row['affiliate link'] || row['url'] || row['link'];
    
    if (!productId || !productName || !affiliateLink) {
      errors.push(`Baris ${index + 2}: ID, Product Name, dan Affiliate Link wajib diisi`);
      return;
    }

    newProducts.push({
      id: parseInt(productId),
      name: productName.trim(),
      url: affiliateLink.trim(),
      category: (row['Category'] || row['category'] || 'Uncategorized').trim(),
      badge: (row['Badge'] || row['badge'] || '').trim(),
      clicks: parseInt(row['Clicks'] || row['clicks'] || 0),
      createdAt: new Date().toISOString()
    });
  });

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }

  // REPLACE all products in collection
  collections[collectionIndex].products = newProducts;
  saveCollections(collections);

  return {
    success: true,
    mode: 'replace',
    imported: newProducts.length,
    total: newProducts.length
  };
}

// Import products to collection - NEW MODE
export function importProductsNewToCollection(collectionId, productsData) {
  const collections = getCollections();
  const collectionIndex = collections.findIndex(c => c.id === collectionId || c.slug === collectionId);
  
  if (collectionIndex === -1) {
    throw new Error('Collection tidak ditemukan');
  }

  const existingProducts = collections[collectionIndex].products || [];
  const maxId = existingProducts.length > 0 
    ? Math.max(...existingProducts.map(p => p.id)) 
    : 0;

  const errors = [];
  const newProducts = [];

  productsData.forEach((row, index) => {
    const productName = row['Product Name'] || row['product name'] || row['name'];
    const affiliateLink = row['Affiliate Link'] || row['affiliate link'] || row['url'] || row['link'];
    
    if (!productName || !affiliateLink) {
      errors.push(`Baris ${index + 2}: Product Name dan Affiliate Link wajib diisi`);
      return;
    }

    newProducts.push({
      id: maxId + newProducts.length + 1,
      name: productName.trim(),
      url: affiliateLink.trim(),
      category: (row['Category'] || row['category'] || 'Uncategorized').trim(),
      badge: (row['Badge'] || row['badge'] || '').trim(),
      clicks: parseInt(row['Clicks'] || row['clicks'] || 0),
      createdAt: new Date().toISOString()
    });
  });

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }

  // ADD new products to existing
  collections[collectionIndex].products = [...existingProducts, ...newProducts];
  saveCollections(collections);

  return {
    success: true,
    mode: 'new',
    imported: newProducts.length,
    total: collections[collectionIndex].products.length
  };
}
