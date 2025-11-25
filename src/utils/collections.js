// Collections utility - Now using Cloudflare D1 API with localStorage fallback
// All functions are re-exported from db.js which handles the abstraction

import {
  getCollections,
  saveCollections,
  addCollection,
  deleteCollection,
  getCollectionProducts,
  addProductToCollection,
  updateProductInCollection,
  deleteProductFromCollection,
  getCollectionBySlug,
  getDefaultCollection,
  trackClick
} from './db';

// Re-export for compatibility
export {
  getCollections,
  saveCollections,
  addCollection,
  deleteCollection,
  getCollectionProducts,
  addProductToCollection,
  updateProductInCollection,
  deleteProductFromCollection,
  getCollectionBySlug,
  getDefaultCollection
};

// Additional helper functions
export async function getProductFromCollection(collectionId, productId) {
  const products = await getCollectionProducts(collectionId);
  return products.find(p => p.id === parseInt(productId));
}

export async function incrementClicksInCollection(collectionId, productId) {
  const { trackClick } = await import('./db');
  await trackClick(productId, collectionId);
}

export async function updateCollection(id, updates) {
  // For now, collections don't have update endpoint
  // This is a placeholder for compatibility
  const collections = await getCollections();
  const collection = collections.find(c => c.id === id);
  if (collection) {
    Object.assign(collection, updates);
    await saveCollections(collections);
  }
  return collection;
}

export async function migrateOldProducts() {
  // Migration from old localStorage structure
  // Check if old data exists
  const oldData = localStorage.getItem('affiliate_items');
  if (!oldData) return false;
  
  try {
    const oldItems = JSON.parse(oldData);
    if (oldItems.length === 0) return false;
    
    // Get default collection
    const collections = await getCollections();
    const defaultCollection = collections.find(c => c.isDefault) || collections[0];
    
    // Migrate each product
    for (const item of oldItems) {
      await addProductToCollection(defaultCollection.id, {
        name: item.name,
        description: item.description || '',
        price: item.price || 0,
        affiliateLink: item.affiliateLink || item.link || '',
        imageUrl: item.imageUrl || item.image || '',
        category: item.category || 'Uncategorized',
        badge: item.badge || '',
        clicks: item.clicks || 0
      });
    }
    
    // Backup old data
    localStorage.setItem('affiliate_items_backup', oldData);
    // Clear old data
    localStorage.removeItem('affiliate_items');
    
    return true;
  } catch (error) {
    console.error('Migration error:', error);
    return false;
  }
}

// Import/Export functions for Excel
import * as XLSX from 'xlsx';

export function importProductsReplaceToCollection(collectionId, products) {
  // This will be handled by the component using db.js functions
  return products;
}

export function importProductsNewToCollection(collectionId, products) {
  // This will be handled by the component using db.js functions
  return products;
}

export function exportCollectionProducts(collectionId, products) {
  const worksheet = XLSX.utils.json_to_sheet(products.map(p => ({
    ID: p.id,
    Name: p.name,
    Description: p.description || '',
    Price: p.price || 0,
    'Affiliate Link': p.affiliateLink || p.affiliate_link || '',
    'Image URL': p.imageUrl || p.image_url || '',
    Category: p.category || '',
    Badge: p.badge || '',
    Clicks: p.clicks || 0
  })));
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
  
  const fileName = `products-${collectionId}-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
