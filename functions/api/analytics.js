// Cloudflare Pages Function - Analytics API

export async function onRequestGet({ env, request }) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    
    if (type === 'clicks') {
      const { results } = await env.DB.prepare(
        'SELECT * FROM click_history ORDER BY timestamp DESC LIMIT 1000'
      ).all();
      return new Response(JSON.stringify(results), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (type === 'views') {
      const { results } = await env.DB.prepare(
        'SELECT * FROM collection_views ORDER BY timestamp DESC LIMIT 2000'
      ).all();
      return new Response(JSON.stringify(results), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (type === 'pageviews') {
      const { count } = await env.DB.prepare(
        'SELECT count FROM page_views WHERE id = 1'
      ).first();
      return new Response(JSON.stringify({ count: count || 0 }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ error: 'Invalid type' }), {
      status: 400,
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
    const data = await request.json();
    
    if (data.type === 'click') {
      const now = new Date();
      await env.DB.prepare(
        'INSERT INTO click_history (product_id, collection_id, date, hour) VALUES (?, ?, ?, ?)'
      ).bind(
        data.productId,
        data.collectionId,
        now.toISOString().split('T')[0],
        now.getHours()
      ).run();
      
      // Increment product clicks
      await env.DB.prepare(
        'UPDATE products SET clicks = clicks + 1 WHERE id = ?'
      ).bind(data.productId).run();
    }
    
    if (data.type === 'view') {
      const now = new Date();
      await env.DB.prepare(
        'INSERT INTO collection_views (collection_id, date) VALUES (?, ?)'
      ).bind(
        data.collectionId,
        now.toISOString().split('T')[0]
      ).run();
    }
    
    if (data.type === 'pageview') {
      await env.DB.prepare(
        'UPDATE page_views SET count = count + 1, updated_at = datetime(\'now\') WHERE id = 1'
      ).run();
    }
    
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
