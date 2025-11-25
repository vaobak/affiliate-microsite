// Cloudflare Pages Function - Collections API

export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      'SELECT * FROM collections ORDER BY is_default DESC, created_at ASC'
    ).all();
    
    // Get products for each collection
    for (const collection of results) {
      const { results: products } = await env.DB.prepare(
        'SELECT * FROM products WHERE collection_id = ? ORDER BY id ASC'
      ).bind(collection.id).all();
      collection.products = products;
    }
    
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
    const collection = await request.json();
    const id = collection.slug || Date.now().toString();
    
    await env.DB.prepare(
      'INSERT INTO collections (id, name, slug, description, theme, is_default) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      collection.name,
      collection.slug || collection.name.toLowerCase().replace(/\s+/g, ''),
      collection.description || '',
      collection.theme || 'blue',
      0
    ).run();
    
    return new Response(JSON.stringify({ id, ...collection }), {
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
      'UPDATE collections SET name = ?, slug = ?, description = ?, theme = ?, updated_at = datetime("now") WHERE id = ?'
    ).bind(
      updates.name,
      updates.slug,
      updates.description || '',
      updates.theme || 'blue',
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
    
    // Prevent deleting home collection
    if (id === 'home') {
      return new Response(JSON.stringify({ error: 'Cannot delete default home collection' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Delete collection (CASCADE will delete related data)
    await env.DB.prepare(
      'DELETE FROM collections WHERE id = ? AND is_default = 0'
    ).bind(id).run();
    
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
