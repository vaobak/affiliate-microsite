// Collections utility - Now using Cloudflare D1 API with localStorage fallback
// All functions are re-exported from db.js which handles the abstraction

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
} from './db';

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
