// Cloudflare Pages Function - Renumber Product IDs

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
    
    // Create temporary table to store renumbered products
    await env.DB.prepare(`
      CREATE TEMP TABLE IF NOT EXISTS temp_products AS 
      SELECT * FROM products WHERE 1=0
    `).run();
    
    // Delete all products from this collection
    await env.DB.prepare(
      'DELETE FROM products WHERE collection_id = ?'
    ).bind(collectionId).run();
    
    // Re-insert products with new sequential IDs
    let newId = 1;
    for (const product of products) {
      await env.DB.prepare(`
        INSERT INTO products (id, collection_id, name, description, price, affiliate_link, image_url, category, badge, clicks, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        newId,
        product.collection_id,
        product.name,
        product.description,
        product.price,
        product.affiliate_link,
        product.image_url,
        product.category,
        product.badge,
        product.clicks || 0,
        product.created_at,
        product.updated_at
      ).run();
      newId++;
    }
    
    // Update SQLite sequence to continue from the last ID
    await env.DB.prepare(`
      UPDATE sqlite_sequence SET seq = ? WHERE name = 'products'
    `).bind(newId - 1).run();
    
    return new Response(JSON.stringify({ 
      success: true,
      renumbered: products.length,
      newMaxId: newId - 1,
      message: `Renumbered ${products.length} products from 1 to ${newId - 1}`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error renumbering products:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
