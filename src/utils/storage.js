const STORAGE_KEY = 'affiliate_items';

// Get all items
export function getItems() {
  const items = localStorage.getItem(STORAGE_KEY);
  return items ? JSON.parse(items) : [];
}

// Save items
export function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// Add item
export function addItem(item) {
  const items = getItems();
  const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
  const newItem = { 
    ...item, 
    id: newId,
    clicks: 0,
    category: item.category || 'Uncategorized',
    collections: item.collections || [],
    createdAt: new Date().toISOString()
  };
  items.push(newItem);
  saveItems(items);
  return newItem;
}

// Update item
export function updateItem(id, updatedData) {
  const items = getItems();
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updatedData };
    saveItems(items);
    return items[index];
  }
  return null;
}

// Delete item
export function deleteItem(id) {
  const items = getItems();
  const filteredItems = items.filter(item => item.id !== id);
  saveItems(filteredItems);
  return true;
}

// Get item by ID
export function getItemById(id) {
  const items = getItems();
  return items.find(item => item.id === parseInt(id));
}

// Get items sorted (descending by ID - newest first)
export function getItemsSorted() {
  const items = getItems();
  return items.sort((a, b) => b.id - a.id);
}

// Increment click count
export function incrementClicks(id) {
  const items = getItems();
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index].clicks = (items[index].clicks || 0) + 1;
    saveItems(items);
    return items[index];
  }
  return null;
}

// Get total clicks
export function getTotalClicks() {
  const items = getItems();
  return items.reduce((total, item) => total + (item.clicks || 0), 0);
}

// Page views tracking
const PAGE_VIEWS_KEY = 'page_views';

export function getPageViews() {
  const views = localStorage.getItem(PAGE_VIEWS_KEY);
  return views ? parseInt(views) : 0;
}

export function incrementPageViews() {
  const currentViews = getPageViews();
  localStorage.setItem(PAGE_VIEWS_KEY, (currentViews + 1).toString());
}

// Recent activity
const ACTIVITY_KEY = 'recent_activity';

export function getRecentActivity() {
  const activity = localStorage.getItem(ACTIVITY_KEY);
  return activity ? JSON.parse(activity) : [];
}

export function addActivity(type, title, description) {
  const activities = getRecentActivity();
  const newActivity = {
    id: Date.now(),
    type,
    title,
    description,
    timestamp: new Date().toISOString()
  };
  activities.unshift(newActivity);
  // Keep only last 10 activities
  const limited = activities.slice(0, 10);
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(limited));
}

// Get items by collection
export function getItemsByCollection(collectionSlug) {
  const items = getItems();
  if (!collectionSlug || collectionSlug === '') {
    // Return all items for default/all collection
    return items.sort((a, b) => b.id - a.id);
  }
  // Filter items that have this collection
  return items.filter(item => 
    item.collections && item.collections.includes(collectionSlug)
  ).sort((a, b) => b.id - a.id);
}

// Cleanup recent activity when collection is deleted
export function cleanupCollectionActivity(collectionId) {
  const activities = getRecentActivity();
  // Remove activities related to this collection
  // This assumes activities might have collectionId or collection name in description
  const filtered = activities.filter(activity => {
    // Check if activity description contains collection reference
    const desc = activity.description?.toLowerCase() || '';
    const collId = collectionId?.toLowerCase() || '';
    return !desc.includes(collId);
  });
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(filtered));
  return activities.length - filtered.length;
}

// Reset all data when all collections are deleted
export function resetAllData() {
  // Reset page views
  localStorage.setItem(PAGE_VIEWS_KEY, '0');
  
  // Clear all activities
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify([]));
  
  return true;
}

// Check if there are any active collections
export function hasActiveCollections() {
  const collections = JSON.parse(localStorage.getItem('affiliate_collections') || '[]');
  return collections.length > 0;
}
