// Analytics utility functions

const CLICK_HISTORY_KEY = 'affiliate_click_history';
const COLLECTION_VIEWS_KEY = 'affiliate_collection_views';

// Get click history for charts
export function getClickHistory(timeRange = 'week') {
  const stored = localStorage.getItem(CLICK_HISTORY_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

// Save click event
export function trackClick(productId, collectionId) {
  const history = getClickHistory();
  const now = new Date();
  
  history.push({
    productId,
    collectionId,
    timestamp: now.toISOString(),
    date: now.toISOString().split('T')[0],
    hour: now.getHours()
  });
  
  // Keep only last 1000 clicks
  if (history.length > 1000) {
    history.shift();
  }
  
  localStorage.setItem(CLICK_HISTORY_KEY, JSON.stringify(history));
}

// Get aggregated clicks by date
export function getClicksByDate(days = 7) {
  const history = getClickHistory();
  const result = {};
  
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    result[dateStr] = 0;
  }
  
  history.forEach(click => {
    if (result.hasOwnProperty(click.date)) {
      result[click.date]++;
    }
  });
  
  return result;
}

// Get clicks by hour (last 24 hours)
export function getClicksByHour() {
  const history = getClickHistory();
  const result = {};
  
  for (let i = 0; i < 24; i++) {
    result[i] = 0;
  }
  
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);
  
  history.forEach(click => {
    const clickDate = new Date(click.timestamp);
    if (clickDate >= oneDayAgo) {
      result[click.hour]++;
    }
  });
  
  return result;
}

// Collection Views Tracking
export function trackCollectionView(collectionId) {
  const views = getCollectionViews();
  const now = new Date();
  
  views.push({
    collectionId,
    timestamp: now.toISOString(),
    date: now.toISOString().split('T')[0]
  });
  
  // Keep only last 2000 views
  if (views.length > 2000) {
    views.shift();
  }
  
  localStorage.setItem(COLLECTION_VIEWS_KEY, JSON.stringify(views));
}

export function getCollectionViews() {
  const stored = localStorage.getItem(COLLECTION_VIEWS_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function getCollectionViewCount(collectionId) {
  const views = getCollectionViews();
  return views.filter(view => view.collectionId === collectionId).length;
}

export function getCollectionViewsByPeriod(collectionId, days = 7) {
  const views = getCollectionViews();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return views.filter(view => {
    const viewDate = new Date(view.timestamp);
    return view.collectionId === collectionId && viewDate >= cutoffDate;
  }).length;
}

// Cleanup analytics data when collection is deleted
export function cleanupCollectionData(collectionId) {
  // Remove click history for this collection
  const clickHistory = getClickHistory();
  const filteredClicks = clickHistory.filter(click => click.collectionId !== collectionId);
  localStorage.setItem(CLICK_HISTORY_KEY, JSON.stringify(filteredClicks));
  
  // Remove collection views for this collection
  const collectionViews = getCollectionViews();
  const filteredViews = collectionViews.filter(view => view.collectionId !== collectionId);
  localStorage.setItem(COLLECTION_VIEWS_KEY, JSON.stringify(filteredViews));
  
  return {
    clicksRemoved: clickHistory.length - filteredClicks.length,
    viewsRemoved: collectionViews.length - filteredViews.length
  };
}

// Reset all analytics data
export function resetAllAnalytics() {
  // Clear click history
  localStorage.setItem(CLICK_HISTORY_KEY, JSON.stringify([]));
  
  // Clear collection views
  localStorage.setItem(COLLECTION_VIEWS_KEY, JSON.stringify([]));
  
  return true;
}
