// Bulk operations utility functions for products

import { getCollections, saveCollections } from './collections';

// Bulk delete products from a collection
export function bulkDeleteProducts(collectionId, productIds) {
  const collections = getCollections();
  const collectionIndex = collections.findIndex(c => c.id === collectionId || c.slug === collectionId);
  
  if (collectionIndex === -1) {
    throw new Error('Collection not found');
  }

  collections[collectionIndex].products = collections[collectionIndex].products.filter(
    p => !productIds.includes(p.id)
  );

  saveCollections(collections);
  return {
    success: true,
    deleted: productIds.length
  };
}

// Bulk update products (category, badge)
export function bulkUpdateProducts(collectionId, productIds, updates) {
  const collections = getCollections();
  const collectionIndex = collections.findIndex(c => c.id === collectionId || c.slug === collectionId);
  
  if (collectionIndex === -1) {
    throw new Error('Collection not found');
  }

  let updatedCount = 0;
  collections[collectionIndex].products = collections[collectionIndex].products.map(product => {
    if (productIds.includes(product.id)) {
      updatedCount++;
      return {
        ...product,
        ...updates
      };
    }
    return product;
  });

  saveCollections(collections);
  return {
    success: true,
    updated: updatedCount
  };
}

// Bulk move products to another collection
export function bulkMoveProducts(sourceCollectionId, targetCollectionId, productIds) {
  const collections = getCollections();
  const sourceIndex = collections.findIndex(c => c.id === sourceCollectionId || c.slug === sourceCollectionId);
  const targetIndex = collections.findIndex(c => c.id === targetCollectionId || c.slug === targetCollectionId);
  
  if (sourceIndex === -1 || targetIndex === -1) {
    throw new Error('Collection not found');
  }

  // Get products to move
  const productsToMove = collections[sourceIndex].products.filter(p => productIds.includes(p.id));
  
  // Get max ID in target collection
  const targetProducts = collections[targetIndex].products || [];
  const maxId = targetProducts.length > 0 
    ? Math.max(...targetProducts.map(p => p.id)) 
    : 0;

  // Assign new IDs to moved products
  const movedProducts = productsToMove.map((product, index) => ({
    ...product,
    id: maxId + index + 1
  }));

  // Remove from source
  collections[sourceIndex].products = collections[sourceIndex].products.filter(
    p => !productIds.includes(p.id)
  );

  // Add to target
  collections[targetIndex].products = [...targetProducts, ...movedProducts];

  saveCollections(collections);
  return {
    success: true,
    moved: movedProducts.length
  };
}

// Bulk duplicate products to another collection
export function bulkDuplicateProducts(sourceCollectionId, targetCollectionId, productIds) {
  const collections = getCollections();
  const sourceIndex = collections.findIndex(c => c.id === sourceCollectionId || c.slug === sourceCollectionId);
  const targetIndex = collections.findIndex(c => c.id === targetCollectionId || c.slug === targetCollectionId);
  
  if (sourceIndex === -1 || targetIndex === -1) {
    throw new Error('Collection not found');
  }

  // Get products to duplicate
  const productsToDuplicate = collections[sourceIndex].products.filter(p => productIds.includes(p.id));
  
  // Get max ID in target collection
  const targetProducts = collections[targetIndex].products || [];
  const maxId = targetProducts.length > 0 
    ? Math.max(...targetProducts.map(p => p.id)) 
    : 0;

  // Create duplicates with new IDs
  const duplicatedProducts = productsToDuplicate.map((product, index) => ({
    ...product,
    id: maxId + index + 1,
    createdAt: new Date().toISOString()
  }));

  // Add to target (source remains unchanged)
  collections[targetIndex].products = [...targetProducts, ...duplicatedProducts];

  saveCollections(collections);
  return {
    success: true,
    duplicated: duplicatedProducts.length
  };
}
