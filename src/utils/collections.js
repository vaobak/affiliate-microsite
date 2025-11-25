// Collections utility - Using D1 with synchronous interface
// All functions work synchronously but sync to D1 in background

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
  getDefaultCollection,
  getProductFromCollection,
  updateCollection,
  incrementClicksInCollection,
  isUsingAPI
} from './db-sync';

// Import/Export functions for Excel
import * as XLSX from 'xlsx';

export function importProductsReplaceToCollection(collectionId, products) {
  return products;
}

export function importProductsNewToCollection(collectionId, products) {
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

// Migration function
export function migrateOldProducts() {
  const oldData = localStorage.getItem('affiliate_items');
  if (!oldData) return false;
  
  try {
    const oldItems = JSON.parse(oldData);
    if (oldItems.length === 0) return false;
    
    const { getCollections, addProductToCollection } = require('./db-sync');
    const collections = getCollections();
    const defaultCollection = collections.find(c => c.isDefault) || collections[0];
    
    oldItems.forEach(item => {
      addProductToCollection(defaultCollection.id, {
        name: item.name,
        description: item.description || '',
        price: item.price || 0,
        affiliateLink: item.affiliateLink || item.link || '',
        imageUrl: item.imageUrl || item.image || '',
        category: item.category || 'Uncategorized',
        badge: item.badge || '',
        clicks: item.clicks || 0
      });
    });
    
    localStorage.setItem('affiliate_items_backup', oldData);
    localStorage.removeItem('affiliate_items');
    
    return true;
  } catch (error) {
    console.error('Migration error:', error);
    return false;
  }
}
