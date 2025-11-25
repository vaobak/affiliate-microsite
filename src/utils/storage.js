// Storage utility - Now using Cloudflare D1 API with localStorage fallback
// Analytics functions are re-exported from db.js

export {
  getPageViews,
  trackPageView
} from './db';

// Recent activity - keeping localStorage for now as it's UI-only
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
  const limited = activities.slice(0, 10);
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(limited));
}

// Legacy functions for compatibility
export function getItems() {
  return [];
}

export function saveItems(items) {
  // No-op, using D1 now
}

export function addItem(item) {
  return item;
}

export function updateItem(id, updatedData) {
  return null;
}

export function deleteItem(id) {
  return true;
}

export function getItemById(id) {
  return null;
}

export function getItemsSorted() {
  return [];
}

export function incrementClicks(id) {
  return null;
}

export function getTotalClicks() {
  return 0;
}

export function incrementPageViews() {
  trackPageView();
}

export function cleanupCollectionActivity(collectionId) {
  const activities = getRecentActivity();
  const filtered = activities.filter(activity => {
    const desc = activity.description?.toLowerCase() || '';
    const collId = collectionId?.toLowerCase() || '';
    return !desc.includes(collId);
  });
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(filtered));
  return activities.length - filtered.length;
}

export function resetAllData() {
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify([]));
  return true;
}

export function hasActiveCollections() {
  return true;
}

export function getItemsByCollection(collectionSlug) {
  return [];
}
