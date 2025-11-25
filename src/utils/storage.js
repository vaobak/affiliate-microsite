// Storage utility - Using D1 with synchronous interface

export {
  getPageViews,
  trackPageView
} from './db-sync';

// Recent activity - localStorage only (UI state)
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

// Legacy compatibility
export function getItems() {
  return [];
}

export function saveItems(items) {
  // No-op
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
