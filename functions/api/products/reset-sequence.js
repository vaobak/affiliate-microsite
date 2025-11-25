// Cloudflare Pages Function - Reset Product ID Sequence

export async function onRequestPost({ request, env }) {
  try {
    const { collectionId } = await request.json();
    
    // Delete all products in this collection to reset sequence
    await env.DB.prepare(
      'DELETE FROM products WHERE collection_id = ?'
    ).bind(collectionId).run();
    
    // Reset the SQLite sequence for this collection
    // This will make the next insert start from 1
    await env.DB.prepare(
      `DELETE FROM sqlite_sequence WHERE name = 'products'`
    ).run();
    
    return new Response(JSON.stringify({ success: true }), {
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
