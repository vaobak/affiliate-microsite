// Notifications utility functions

const NOTIFICATIONS_KEY = 'affiliate_notifications';
const MILESTONES = [10, 50, 100, 500, 1000, 5000, 10000];
const LOW_PERFORMANCE_THRESHOLD = 5; // clicks

// Get all notifications
export function getNotifications() {
  const stored = localStorage.getItem(NOTIFICATIONS_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

// Save notifications
function saveNotifications(notifications) {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

// Add notification
export function addNotification(notification) {
  const notifications = getNotifications();
  const newNotification = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    read: false,
    ...notification
  };
  
  notifications.unshift(newNotification);
  
  // Keep only last 50 notifications
  if (notifications.length > 50) {
    notifications.pop();
  }
  
  saveNotifications(notifications);
  return newNotification;
}

// Mark notification as read
export function markAsRead(notificationId) {
  const notifications = getNotifications();
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
    saveNotifications(notifications);
  }
}

// Mark all as read
export function markAllAsRead() {
  const notifications = getNotifications();
  notifications.forEach(n => n.read = true);
  saveNotifications(notifications);
}

// Delete notification
export function deleteNotification(notificationId) {
  const notifications = getNotifications();
  const filtered = notifications.filter(n => n.id !== notificationId);
  saveNotifications(filtered);
}

// Clear all notifications
export function clearAllNotifications() {
  localStorage.removeItem(NOTIFICATIONS_KEY);
}

// Get unread count
export function getUnreadCount() {
  const notifications = getNotifications();
  return notifications.filter(n => !n.read).length;
}

// Check for milestone achievements
export function checkMilestones(productName, oldClicks, newClicks) {
  MILESTONES.forEach(milestone => {
    if (oldClicks < milestone && newClicks >= milestone) {
      addNotification({
        type: 'milestone',
        title: 'Milestone Achieved!',
        message: `"${productName}" reached ${milestone} clicks!`,
        icon: 'trophy',
        color: 'yellow'
      });
    }
  });
}

// Check for low-performing products
export function checkLowPerformance(collections) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  collections.forEach(collection => {
    const products = collection.products || [];
    products.forEach(product => {
      const createdAt = new Date(product.createdAt);
      const clicks = product.clicks || 0;
      
      // Check if product is older than 7 days and has low clicks
      if (createdAt < sevenDaysAgo && clicks < LOW_PERFORMANCE_THRESHOLD) {
        // Check if we already sent notification for this product
        const notifications = getNotifications();
        const alreadyNotified = notifications.some(
          n => n.type === 'low_performance' && 
          n.productId === product.id && 
          new Date(n.timestamp) > sevenDaysAgo
        );
        
        if (!alreadyNotified) {
          addNotification({
            type: 'low_performance',
            title: 'Low Performance Alert',
            message: `"${product.name}" has only ${clicks} clicks in the last 7 days`,
            icon: 'warning',
            color: 'red',
            productId: product.id,
            collectionId: collection.id
          });
        }
      }
    });
  });
}

// Generate sample notifications (for testing)
export function generateSampleNotifications() {
  const samples = [
    {
      type: 'milestone',
      title: 'Milestone Achieved!',
      message: 'Product "Gaming Mouse" reached 100 clicks!',
      icon: 'trophy',
      color: 'yellow'
    },
    {
      type: 'low_performance',
      title: 'Low Performance Alert',
      message: 'Product "Wireless Keyboard" has only 3 clicks in the last 7 days',
      icon: 'warning',
      color: 'red'
    },
    {
      type: 'milestone',
      title: 'Milestone Achieved!',
      message: 'Product "USB Cable" reached 500 clicks!',
      icon: 'trophy',
      color: 'yellow'
    }
  ];
  
  samples.forEach(sample => addNotification(sample));
}
