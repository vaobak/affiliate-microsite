// Bulk operations utility functions for products

import * as api from './api';

// Bulk delete products from a collection
export async function bulkDeleteProducts(collectionId, productIds) {
  try {
    let deleted = 0;
    for (const productId of productIds) {
      await api.deleteProduct(productId);
      deleted++;
    }
    
    return {
      success: true,
      deleted: deleted
    };
  } catch (error) {
    console.error('Error bulk deleting products:', error);
    throw new Error('Failed to delete products: ' + error.message);
  }
}

// Bulk update products (category, badge)
export async function bulkUpdateProducts(collectionId, productIds, updates) {
  try {
    let updated = 0;
    for (const productId of productIds) {
      await api.updateProduct(productId, updates);
      updated++;
    }
    
    return {
      success: true,
      updated: updated
    };
  } catch (error) {
    console.error('Error bulk updating products:', error);
    throw new Error('Failed to update products: ' + error.message);
  }
}

// Bulk move products to another collection
export async function bulkMoveProducts(sourceCollectionId, targetCollectionId, productIds) {
  try {
    let moved = 0;
    
    // Get source products
    const sourceProducts = await api.fetchProducts(sourceCollectionId);
    
    for (const productId of productIds) {
      const product = sourceProducts.find(p => p.id === productId);
      if (!product) continue;
      
      // Create product in target collection
      await api.createProduct({
        collectionId: targetCollectionId,
        name: product.name,
        description: product.description || '',
        price: product.price || 0,
        affiliateLink: product.affiliate_link || product.affiliateLink,
        imageUrl: product.image_url || product.imageUrl || '',
        category: product.category || 'Uncategorized',
        badge: product.badge || ''
      });
      
      // Delete from source collection
      await api.deleteProduct(productId);
      moved++;
    }
    
    return {
      success: true,
      moved: moved
    };
  } catch (error) {
    console.error('Error bulk moving products:', error);
    throw new Error('Failed to move products: ' + error.message);
  }
}

// Bulk duplicate products to another collection
export async function bulkDuplicateProducts(sourceCollectionId, targetCollectionId, productIds) {
  try {
    let duplicated = 0;
    
    // Get source products
    const sourceProducts = await api.fetchProducts(sourceCollectionId);
    
    for (const productId of productIds) {
      const product = sourceProducts.find(p => p.id === productId);
      if (!product) continue;
      
      // Create duplicate in target collection
      await api.createProduct({
        collectionId: targetCollectionId,
        name: product.name,
        description: product.description || '',
        price: product.price || 0,
        affiliateLink: product.affiliate_link || product.affiliateLink,
        imageUrl: product.image_url || product.imageUrl || '',
        category: product.category || 'Uncategorized',
        badge: product.badge || ''
      });
      
      duplicated++;
    }
    
    return {
      success: true,
      duplicated: duplicated
    };
  } catch (error) {
    console.error('Error bulk duplicating products:', error);
    throw new Error('Failed to duplicate products: ' + error.message);
  }
}
