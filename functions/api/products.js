// Cloudflare Pages Function - Products API

export async function onRequestGet({ env, request }) {
  try {
    const url = new URL(request.url);
    const collectionId = url.searchParams.get('collectionId');
    
    let query = 'SELECT * FROM products';
    let params = [];
    
    if (collectionId) {
      query += ' WHERE collection_id = ?';
      params.push(collectionId);
    }
    
    // Order by sequence_number for proper per-collection numbering
    query += ' ORDER BY sequence_number ASC, id ASC';
    
    const { results } = await env.DB.prepare(query).bind(...params).all();
    
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const product = await request.json();
    
    // Get next sequence number for this collection
    const { results: seqResults } = await env.DB.prepare(
      'SELECT MAX(sequence_number) as max_seq FROM products WHERE collection_id = ?'
    ).bind(product.collectionId).all();
    
    const nextSequence = (seqResults[0]?.max_seq || 0) + 1;
    
    const result = await env.DB.prepare(
      `INSERT INTO products (collection_id, name, description, price, affiliate_link, image_url, category, badge, sequence_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      product.collectionId,
      product.name,
      product.description || '',
      product.price || 0,
      product.affiliateLink,
      product.imageUrl || '',
      product.category || 'Uncategorized',
      product.badge || '',
      nextSequence
    ).run();
    
    return new Response(JSON.stringify({ id: result.meta.last_row_id, sequence_number: nextSequence, ...product }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPut({ request, env }) {
  try {
    const { id, ...updates } = await request.json();
    
    await env.DB.prepare(
      `UPDATE products SET 
       name = ?, description = ?, price = ?, affiliate_link = ?, 
       image_url = ?, category = ?, badge = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).bind(
      updates.name,
      updates.description || '',
      updates.price || 0,
      updates.affiliateLink,
      updates.imageUrl || '',
      updates.category || 'Uncategorized',
      updates.badge || '',
      id
    ).run();
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestDelete({ request, env }) {
  try {
    const { id } = await request.json();
    
    await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
