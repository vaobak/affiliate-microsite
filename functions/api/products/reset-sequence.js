// Cloudflare Pages Function - Reset Product ID Sequence

export async function onRequestPost({ request, env }) {
  try {
    const { collectionId } = await request.json();
    
    // Check total products across all collections
    const { results: totalResults } = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM products'
    ).all();
    
    const totalProducts = totalResults[0]?.count || 0;
    
    // Only reset sequence if NO products exist at all
    if (totalProducts === 0) {
      // Reset the SQLite sequence
      await env.DB.prepare(
        `DELETE FROM sqlite_sequence WHERE name = 'products'`
      ).run();
      
      return new Response(JSON.stringify({ 
        success: true,
        reset: true,
        message: 'Sequence reset to 1'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // If products exist, check if this specific collection is empty
    const { results: collectionResults } = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM products WHERE collection_id = ?'
    ).bind(collectionId).all();
    
    const collectionProducts = collectionResults[0]?.count || 0;
    
    return new Response(JSON.stringify({ 
      success: true,
      reset: false,
      totalProducts,
      collectionProducts,
      message: totalProducts > 0 ? 'Products exist in other collections, sequence not reset' : 'No products found'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error resetting sequence:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
