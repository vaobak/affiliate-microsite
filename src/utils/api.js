// API Client for Cloudflare D1 Backend

const API_BASE = '/api';

// Collections API
export async function fetchCollections() {
  const response = await fetch(`${API_BASE}/collections`);
  if (!response.ok) throw new Error('Failed to fetch collections');
  return response.json();
}

export async function createCollection(collection) {
  const response = await fetch(`${API_BASE}/collections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(collection)
  });
  if (!response.ok) throw new Error('Failed to create collection');
  return response.json();
}

export async function updateCollection(id, updates) {
  const response = await fetch(`${API_BASE}/collections`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates })
  });
  if (!response.ok) throw new Error('Failed to update collection');
  return response.json();
}

export async function deleteCollection(id) {
  const response = await fetch(`${API_BASE}/collections`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  if (!response.ok) throw new Error('Failed to delete collection');
  return response.json();
}

// Products API
export async function fetchProducts(collectionId = null) {
  const url = collectionId 
    ? `${API_BASE}/products?collectionId=${collectionId}`
    : `${API_BASE}/products`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
}

export async function createProduct(product) {
  const response = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });
  if (!response.ok) throw new Error('Failed to create product');
  return response.json();
}

export async function updateProduct(id, updates) {
  const response = await fetch(`${API_BASE}/products`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates })
  });
  if (!response.ok) throw new Error('Failed to update product');
  return response.json();
}

export async function deleteProduct(id) {
  const response = await fetch(`${API_BASE}/products`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  if (!response.ok) throw new Error('Failed to delete product');
  return response.json();
}

// Analytics API
export async function fetchClickHistory() {
  const response = await fetch(`${API_BASE}/analytics?type=clicks`);
  if (!response.ok) throw new Error('Failed to fetch click history');
  return response.json();
}

export async function fetchCollectionViews() {
  const response = await fetch(`${API_BASE}/analytics?type=views`);
  if (!response.ok) throw new Error('Failed to fetch collection views');
  return response.json();
}

export async function fetchPageViews() {
  const response = await fetch(`${API_BASE}/analytics?type=pageviews`);
  if (!response.ok) throw new Error('Failed to fetch page views');
  const data = await response.json();
  return data.count;
}

export async function trackClick(productId, collectionId) {
  const response = await fetch(`${API_BASE}/analytics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'click', productId, collectionId })
  });
  if (!response.ok) throw new Error('Failed to track click');
  return response.json();
}

export async function trackCollectionView(collectionId) {
  const response = await fetch(`${API_BASE}/analytics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'view', collectionId })
  });
  if (!response.ok) throw new Error('Failed to track view');
  return response.json();
}

export async function trackPageView() {
  const response = await fetch(`${API_BASE}/analytics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'pageview' })
  });
  if (!response.ok) throw new Error('Failed to track page view');
  return response.json();
}
