// Cloudflare Pages Function - User Preferences API

export async function onRequestGet({ env, request }) {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');
    
    if (key) {
      // Get specific preference
      const { results } = await env.DB.prepare(
        'SELECT value FROM user_preferences WHERE key = ?'
      ).bind(key).all();
      
      if (results.length > 0) {
        return new Response(JSON.stringify({ 
          key, 
          value: results[0].value 
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({ 
          key, 
          value: null 
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else {
      // Get all preferences
      const { results } = await env.DB.prepare(
        'SELECT key, value FROM user_preferences'
      ).all();
      
      const preferences = {};
      results.forEach(row => {
        preferences[row.key] = row.value;
      });
      
      return new Response(JSON.stringify(preferences), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const { key, value } = await request.json();
    
    if (!key) {
      return new Response(JSON.stringify({ error: 'Key is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Upsert preference
    await env.DB.prepare(
      `INSERT INTO user_preferences (key, value, updated_at) 
       VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET 
       value = excluded.value,
       updated_at = datetime('now')`
    ).bind(key, String(value)).run();
    
    return new Response(JSON.stringify({ 
      success: true, 
      key, 
      value 
    }), {
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
    const { key } = await request.json();
    
    if (!key) {
      return new Response(JSON.stringify({ error: 'Key is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    await env.DB.prepare(
      'DELETE FROM user_preferences WHERE key = ?'
    ).bind(key).run();
    
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
