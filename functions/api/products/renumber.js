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
    
    // Get min ID from this collection to start renumbering from there
    const minId = products[0].id;
    
    // Store products data temporarily
    const productsData = products.map(p => ({
      collection_id: p.collection_id,
      name: p.name,
      description: p.description,
      price: p.price,
      affiliate_link: p.affiliate_link,
      image_url: p.image_url,
      category: p.category,
      badge: p.badge,
      clicks: p.clicks || 0,
      created_at: p.created_at,
      updated_at: p.updated_at
    }));
    
    // Delete all products from this collection
    await env.DB.prepare(
      'DELETE FROM products WHERE collection_id = ?'
    ).bind(collectionId).run();
    
    // Re-insert products with new sequential IDs starting from minId
    let newId = minId;
    for (const product of productsData) {
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
        product.clicks,
        product.created_at,
        product.updated_at
      ).run();
      newId++;
    }
    
    // Update SQLite sequence to continue from the last ID
    const { results: maxResults } = await env.DB.prepare(
      'SELECT MAX(id) as maxId FROM products'
    ).all();
    const maxId = maxResults[0]?.maxId || newId - 1;
    
    await env.DB.prepare(`
      INSERT OR REPLACE INTO sqlite_sequence (name, seq) VALUES ('products', ?)
    `).bind(maxId).run();
    
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
