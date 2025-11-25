// Analytics utility - Pure Cloudflare D1 API
import * as api from './api';

// Track click
export async function trackClick(productId, collectionId) {
  try {
    await api.trackClick(productId, collectionId);
  } catch (error) {
    console.error('Error tracking click:', error);
  }
}

// Track collection view
export async function trackCollectionView(collectionId) {
  try {
    await api.trackCollectionView(collectionId);
  } catch (error) {
    console.error('Error tracking collection view:', error);
  }
}

// Get click history
export async function getClickHistory() {
  try {
    const history = await api.fetchClickHistory();
    return history;
  } catch (error) {
    console.error('Error fetching click history:', error);
    return [];
  }
}

// Get collection views
export async function getCollectionViews() {
  try {
    const views = await api.fetchCollectionViews();
    return views;
  } catch (error) {
    console.error('Error fetching collection views:', error);
    return [];
  }
}

// Get collection view count
export async function getCollectionViewCount(collectionId) {
  try {
    const views = await getCollectionViews();
    return views.filter(view => 
      view.collectionId === collectionId || view.collection_id === collectionId
    ).length;
  } catch (error) {
    console.error('Error getting collection view count:', error);
    return 0;
  }
}

// Get collection views by period
export async function getCollectionViewsByPeriod(collectionId, days = 7) {
  try {
    const views = await getCollectionViews();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return views.filter(view => {
      const viewDate = new Date(view.timestamp);
      const matchId = view.collectionId === collectionId || view.collection_id === collectionId;
      return matchId && viewDate >= cutoffDate;
    }).length;
  } catch (error) {
    console.error('Error getting collection views by period:', error);
    return 0;
  }
}

// Get aggregated clicks by date
export async function getClicksByDate(days = 7) {
  try {
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
      const clickDate = click.date || click.timestamp?.split('T')[0];
      if (result.hasOwnProperty(clickDate)) {
        result[clickDate]++;
      }
    });
    
    return result;
  } catch (error) {
    console.error('Error getting clicks by date:', error);
    return {};
  }
}

// Get clicks by hour (last 24 hours)
export async function getClicksByHour() {
  try {
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
        const hour = click.hour || clickDate.getHours();
        result[hour]++;
      }
    });
    
    return result;
  } catch (error) {
    console.error('Error getting clicks by hour:', error);
    return {};
  }
}

// Cleanup functions (D1 handles with CASCADE DELETE)
export async function cleanupCollectionData(collectionId) {
  console.log('Cleanup handled by D1 CASCADE DELETE');
  return { clicksRemoved: 0, viewsRemoved: 0 };
}

export function resetAllAnalytics() {
  console.log('Reset handled by D1');
  return true;
}
