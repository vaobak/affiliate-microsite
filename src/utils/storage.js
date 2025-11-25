// Storage utility - Pure Cloudflare D1 API (No localStorage except for UI state)
import * as api from './api';

// Page Views
export async function getPageViews() {
  try {
    const count = await api.fetchPageViews();
    return count;
  } catch (error) {
    console.error('Error fetching page views:', error);
    return 0;
  }
}

export async function trackPageView() {
  try {
    await api.trackPageView();
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
}

// Legacy compatibility
export const incrementPageViews = trackPageView;

// Recent Activity (localStorage for UI only - not critical data)
const ACTIVITY_KEY = 'recent_activity';

export function getRecentActivity() {
  try {
    const activity = localStorage.getItem(ACTIVITY_KEY);
    return activity ? JSON.parse(activity) : [];
  } catch {
    return [];
  }
}

export function addActivity(type, title, description) {
  try {
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
  } catch (error) {
    console.error('Error adding activity:', error);
  }
}

// Legacy functions (no-op for D1)
export function getItems() {
  return [];
}

export function saveItems() {
  // No-op
}

export function addItem(item) {
  return item;
}

export function updateItem(id, data) {
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

export function getItemsByCollection() {
  return [];
}

// Cleanup functions
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
