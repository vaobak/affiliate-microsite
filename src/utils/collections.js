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
    console.log('Adding collection with data:', collection);
    const result = await api.createCollection(collection);
    console.log('Collection added:', result);
    return result;
  } catch (error) {
    console.error('Error adding collection:', error);
    throw error;
  }
}

// Update collection
export async function updateCollection(id, updates) {
  try {
    console.log('Updating collection', id, 'with data:', updates);
    await api.updateCollection(id, updates);
    console.log('Collection updated successfully');
    return true;
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
    
    console.log('Product added, starting renumber...');
    // Auto-renumber products to keep sequential IDs
    const renumberResult = await api.renumberProductIds(collectionId);
    console.log('Renumber result after add:', renumberResult);
    
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
    console.log('Deleting product:', productId, 'from collection:', collectionId);
    await api.deleteProduct(productId);
    
    console.log('Product deleted, starting renumber...');
    // Auto-renumber products to keep sequential IDs
    const renumberResult = await api.renumberProductIds(collectionId);
    console.log('Renumber result:', renumberResult);
    
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
export async function importProductsReplaceToCollection(collectionId, products) {
  try {
    // Delete all existing products in this collection
    const existingProducts = await api.fetchProducts(collectionId);
    for (const product of existingProducts) {
      await api.deleteProduct(product.id);
    }
    
    // Reset ID sequence if collection is now empty
    await api.resetProductIdSequence(collectionId);
    
    // Add all new products
    let imported = 0;
    let errors = [];
    
    for (const product of products) {
      try {
        // Support multiple column name formats
        const name = product['Product Name'] || product.Name || product.name;
        const affiliateLink = product['Affiliate Link'] || product.affiliateLink || product.affiliate_link;
        
        // Skip if no name or affiliate link
        if (!name || !affiliateLink) {
          errors.push(`Skipped product: missing name or affiliate link (Name: "${name || 'empty'}", Link: "${affiliateLink || 'empty'}")`);
          continue;
        }
        
        await api.createProduct({
          collectionId: collectionId,
          name: name,
          description: product.Description || product.description || '',
          price: parseFloat(product.Price || product.price || 0),
          affiliateLink: affiliateLink,
          imageUrl: product['Image URL'] || product.imageUrl || product.image_url || '',
          category: product.Category || product.category || 'Uncategorized',
          badge: product.Badge || product.badge || ''
        });
        imported++;
      } catch (err) {
        errors.push(`Error importing product "${product['Product Name'] || product.Name || product.name}": ${err.message}`);
      }
    }
    
    // Renumber products to ensure sequential IDs (1, 2, 3, ...)
    await api.renumberProductIds(collectionId);
    
    // Get updated products count
    const updatedProducts = await api.fetchProducts(collectionId);
    
    if (errors.length > 0) {
      console.warn('Import warnings:', errors);
    }
    
    return {
      imported: imported,
      total: updatedProducts.length,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    console.error('Error importing products (replace):', error);
    throw new Error('Failed to import products: ' + error.message);
  }
}

export async function importProductsNewToCollection(collectionId, products) {
  try {
    // Check if collection is empty, if so reset ID sequence
    const existingProducts = await api.fetchProducts(collectionId);
    if (existingProducts.length === 0) {
      await api.resetProductIdSequence(collectionId);
    }
    
    // Add new products without deleting existing ones
    let imported = 0;
    let errors = [];
    
    for (const product of products) {
      try {
        // Support multiple column name formats
        const name = product['Product Name'] || product.Name || product.name;
        const affiliateLink = product['Affiliate Link'] || product.affiliateLink || product.affiliate_link;
        
        // Skip if no name or affiliate link
        if (!name || !affiliateLink) {
          errors.push(`Skipped product: missing name or affiliate link (Name: "${name || 'empty'}", Link: "${affiliateLink || 'empty'}")`);
          continue;
        }
        
        await api.createProduct({
          collectionId: collectionId,
          name: name,
          description: product.Description || product.description || '',
          price: parseFloat(product.Price || product.price || 0),
          affiliateLink: affiliateLink,
          imageUrl: product['Image URL'] || product.imageUrl || product.image_url || '',
          category: product.Category || product.category || 'Uncategorized',
          badge: product.Badge || product.badge || ''
        });
        imported++;
      } catch (err) {
        errors.push(`Error importing product "${product['Product Name'] || product.Name || product.name}": ${err.message}`);
      }
    }
    
    // Renumber products to ensure sequential IDs (1, 2, 3, ...)
    await api.renumberProductIds(collectionId);
    
    // Get updated products count
    const updatedProducts = await api.fetchProducts(collectionId);
    
    if (errors.length > 0) {
      console.warn('Import warnings:', errors);
    }
    
    return {
      imported: imported,
      total: updatedProducts.length,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    console.error('Error importing products (new):', error);
    throw new Error('Failed to import products: ' + error.message);
  }
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
