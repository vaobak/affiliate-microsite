// Collections utility - Pure Cloudflare D1 API (No localStorage)
import * as api from './api';

// Get all collections with products
export async function getCollections() {
  try {
    const collections = await api.fetchCollections();
    return collections;
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }
}

// Get single collection by ID
export async function getCollectionById(id) {
  const collections = await getCollections();
  return collections.find(c => c.id === id);
}

// Get collection by slug
export async function getCollectionBySlug(slug) {
  const collections = await getCollections();
  return collections.find(c => c.slug === slug);
}

// Get default collection
export async function getDefaultCollection() {
  const collections = await getCollections();
  return collections.find(c => c.isDefault || c.is_default) || collections[0];
}

// Add new collection
export async function addCollection(collection) {
  try {
    const result = await api.createCollection(collection);
    return result;
  } catch (error) {
    console.error('Error adding collection:', error);
    throw error;
  }
}

// Update collection
export async function updateCollection(id, updates) {
  try {
    // Note: API doesn't have update endpoint yet, so we'll handle it client-side
    const collections = await getCollections();
    const collection = collections.find(c => c.id === id);
    if (collection) {
      Object.assign(collection, updates);
    }
    return collection;
  } catch (error) {
    console.error('Error updating collection:', error);
    throw error;
  }
}

// Delete collection
export async function deleteCollection(id) {
  try {
    await api.deleteCollection(id);
    return true;
  } catch (error) {
    console.error('Error deleting collection:', error);
    throw error;
  }
}

// Get products from a collection
export async function getCollectionProducts(collectionId) {
  try {
    const products = await api.fetchProducts(collectionId);
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

// Get single product from collection
export async function getProductFromCollection(collectionId, productId) {
  const products = await getCollectionProducts(collectionId);
  return products.find(p => p.id === parseInt(productId));
}

// Add product to collection
export async function addProductToCollection(collectionId, product) {
  try {
    const result = await api.createProduct({
      collectionId,
      name: product.name,
      description: product.description || '',
      price: product.price || 0,
      affiliateLink: product.affiliateLink || product.affiliate_link || '',
      imageUrl: product.imageUrl || product.image_url || '',
      category: product.category || 'Uncategorized',
      badge: product.badge || ''
    });
    return result;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
}

// Update product in collection
export async function updateProductInCollection(collectionId, productId, updates) {
  try {
    await api.updateProduct(productId, {
      name: updates.name,
      description: updates.description || '',
      price: updates.price || 0,
      affiliateLink: updates.affiliateLink || updates.affiliate_link || '',
      imageUrl: updates.imageUrl || updates.image_url || '',
      category: updates.category || 'Uncategorized',
      badge: updates.badge || ''
    });
    return { id: productId, ...updates };
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

// Delete product from collection
export async function deleteProductFromCollection(collectionId, productId) {
  try {
    await api.deleteProduct(productId);
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

// Increment clicks for product (track click)
export async function incrementClicksInCollection(collectionId, productId) {
  try {
    await api.trackClick(productId, collectionId);
  } catch (error) {
    console.error('Error tracking click:', error);
  }
}

// Import/Export functions
export function importProductsReplaceToCollection(collectionId, products) {
  return products;
}

export function importProductsNewToCollection(collectionId, products) {
  return products;
}

// Export products to Excel
export async function exportCollectionProducts(collectionId, products) {
  const XLSX = await import('xlsx');
  
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

// Migration helper (no-op for D1)
export async function migrateOldProducts() {
  console.log('Migration not needed for D1 version');
  return false;
}

// Compatibility exports
export const saveCollections = async () => {
  console.warn('saveCollections is deprecated in D1 version');
};
