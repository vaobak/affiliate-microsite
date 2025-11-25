// Cloudflare Pages Function - Resequence Products in Collection
// Ensures sequential numbering (1, 2, 3, ...) within a collection

export async function onRequestPost({ request, env }) {
  try {
    const { collectionId } = await request.json();
    
    if (!collectionId) {
      return new Response(JSON.stringify({ error: 'Collection ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get all products in this collection ordered by current sequence_number
    const { results: products } = await env.DB.prepare(
      'SELECT id FROM products WHERE collection_id = ? ORDER BY sequence_number ASC, id ASC'
    ).bind(collectionId).all();
    
    if (products.length === 0) {
      return new Response(JSON.stringify({ 
        success: true,
        resequenced: 0,
        message: 'No products to resequence'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Update sequence numbers to be 1, 2, 3, ...
    let newSequence = 1;
    for (const product of products) {
      await env.DB.prepare(
        'UPDATE products SET sequence_number = ?, updated_at = datetime("now") WHERE id = ?'
      ).bind(newSequence, product.id).run();
      newSequence++;
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      resequenced: products.length,
      collectionId,
      message: `Resequenced ${products.length} products from 1 to ${products.length}`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error resequencing products:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
