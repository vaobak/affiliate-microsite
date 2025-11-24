// Utility to manually reset all data
// Run this in browser console: window.resetAllAppData()

export function resetAllAppData() {
  // Clear all localStorage data
  const keysToReset = [
    'affiliate_click_history',
    'affiliate_collection_views',
    'page_views',
    'recent_activity',
    'affiliate_collections',
    'affiliate_items'
  ];
  
  keysToReset.forEach(key => {
    if (key === 'page_views') {
      localStorage.setItem(key, '0');
    } else {
      localStorage.setItem(key, JSON.stringify([]));
    }
  });
  
  console.log('✅ All data has been reset!');
  console.log('Please refresh the page.');
  
  return true;
}

// Make it available globally for console access
if (typeof window !== 'undefined') {
  window.resetAllAppData = resetAllAppData;
}
