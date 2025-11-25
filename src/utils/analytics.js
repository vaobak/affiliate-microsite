// Analytics utility - Now using Cloudflare D1 API with localStorage fallback

export {
  trackClick,
  trackCollectionView,
  getClickHistory,
  getCollectionViews
} from './db';

// Get aggregated clicks by date
export async function getClicksByDate(days = 7) {
  const { getClickHistory } = await import('./db');
  const history = await getClickHistory();
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
export async function getClicksByHour() {
  const { getClickHistory } = await import('./db');
  const history = await getClickHistory();
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

// Get collection view count
export async function getCollectionViewCount(collectionId) {
  const { getCollectionViews } = await import('./db');
  const views = await getCollectionViews();
  return views.filter(view => view.collectionId === collectionId || view.collection_id === collectionId).length;
}

// Get collection views by period
export async function getCollectionViewsByPeriod(collectionId, days = 7) {
  const { getCollectionViews } = await import('./db');
  const views = await getCollectionViews();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return views.filter(view => {
    const viewDate = new Date(view.timestamp);
    const matchId = view.collectionId === collectionId || view.collection_id === collectionId;
    return matchId && viewDate >= cutoffDate;
  }).length;
}

// Cleanup functions
export async function cleanupCollectionData(collectionId) {
  // D1 handles this with CASCADE DELETE
  // For localStorage fallback:
  const clickHistory = JSON.parse(localStorage.getItem('affiliate_click_history') || '[]');
  const filteredClicks = clickHistory.filter(click => click.collectionId !== collectionId && click.collection_id !== collectionId);
  localStorage.setItem('affiliate_click_history', JSON.stringify(filteredClicks));
  
  const collectionViews = JSON.parse(localStorage.getItem('affiliate_collection_views') || '[]');
  const filteredViews = collectionViews.filter(view => view.collectionId !== collectionId && view.collection_id !== collectionId);
  localStorage.setItem('affiliate_collection_views', JSON.stringify(filteredViews));
  
  return {
    clicksRemoved: clickHistory.length - filteredClicks.length,
    viewsRemoved: collectionViews.length - filteredViews.length
  };
}

export function resetAllAnalytics() {
  localStorage.setItem('affiliate_click_history', JSON.stringify([]));
  localStorage.setItem('affiliate_collection_views', JSON.stringify([]));
  return true;
}
