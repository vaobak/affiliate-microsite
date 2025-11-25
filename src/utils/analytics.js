// Analytics utility - Using D1 with synchronous interface

export {
  trackClick,
  trackCollectionView,
  getClickHistory,
  getCollectionViews,
  getCollectionViewCount
} from './db-sync';

// Get aggregated clicks by date
export function getClicksByDate(days = 7) {
  const { getClickHistory } = require('./db-sync');
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
      result[dateStr]++;
    }
  });
  
  return result;
}

// Get clicks by hour
export function getClicksByHour() {
  const { getClickHistory } = require('./db-sync');
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

// Get collection views by period
export function getCollectionViewsByPeriod(collectionId, days = 7) {
  const { getCollectionViews } = require('./db-sync');
  const views = getCollectionViews();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return views.filter(view => {
    const viewDate = new Date(view.timestamp);
    const matchId = view.collectionId === collectionId || view.collection_id === collectionId;
    return matchId && viewDate >= cutoffDate;
  }).length;
}

// Cleanup functions
export function cleanupCollectionData(collectionId) {
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
