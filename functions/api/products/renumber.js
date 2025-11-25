// Cloudflare Pages Function - Renumber Product IDs
// This uses a different approach: create temp table, renumber, swap

export async function onRequestPost({ request, env }) {
  try {
    const { collectionId } = await request.json();
    
    if (!collectionId) {
      return new Response(JSON.stringify({ error: 'Collection ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get all products from this collection, ordered by current ID
    const { results: products } = await env.DB.prepare(
      'SELECT * FROM products WHERE collection_id = ? ORDER BY id ASC'
    ).bind(collectionId).all();
    
    if (products.length === 0) {
      return new Response(JSON.stringify({ 
        success: true,
        renumbered: 0,
        message: 'No products to renumber'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get the starting ID (first product's ID)
    const startId = products[0].id;
    
    // Create a mapping of old ID to new ID
    const idMapping = {};
    let newId = startId;
    for (const product of products) {
      idMapping[product.id] = newId;
      newId++;
    }
    
    // Update each product's ID using a temporary negative ID first to avoid conflicts
    // Step 1: Move to negative IDs
    for (const product of products) {
      await env.DB.prepare(
        'UPDATE products SET id = ? WHERE id = ? AND collection_id = ?'
      ).bind(-product.id, product.id, collectionId).run();
    }
    
    // Step 2: Move from negative IDs to new sequential IDs
    for (const product of products) {
      const newProductId = idMapping[product.id];
      await env.DB.prepare(
        'UPDATE products SET id = ? WHERE id = ? AND collection_id = ?'
      ).bind(newProductId, -product.id, collectionId).run();
    }
    
    // Update SQLite sequence
    const { results: maxResults } = await env.DB.prepare(
      'SELECT MAX(id) as maxId FROM products'
    ).all();
    const maxId = maxResults[0]?.maxId || 0;
    
    if (maxId > 0) {
      await env.DB.prepare(`
        INSERT OR REPLACE INTO sqlite_sequence (name, seq) VALUES ('products', ?)
      `).bind(maxId).run();
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      renumbered: products.length,
      startId: startId,
      endId: newId - 1,
      message: `Renumbered ${products.length} products from ${startId} to ${newId - 1}`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error renumbering products:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
