import { addActivity } from '../utils/storage';
import { incrementClicksInCollection, getProductFromCollection } from '../utils/collections';
import { trackClick } from '../utils/analytics';
import { checkMilestones } from '../utils/notifications';

const BADGE_STYLES = {
  'PROMO': 'bg-gradient-to-r from-red-500 to-orange-500 text-white',
  'DISKON': 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
  'NEW': 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
  'HOT': 'bg-gradient-to-r from-red-600 to-pink-600 text-white',
  'SALE': 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
  'BEST': 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
  'LIMITED': 'bg-gradient-to-r from-gray-700 to-gray-900 text-white'
};

export default function ProductCard({ product, collectionId }) {
  const handleClick = async () => {
    const oldClicks = product.clicks || 0;
    
    // Increment clicks in collection
    if (collectionId) {
      incrementClicksInCollection(collectionId, product.id);
      
      // Track click for analytics
      trackClick(product.id, collectionId);
      
      // Check for milestone achievements
      const updatedProduct = getProductFromCollection(collectionId, product.id);
      if (updatedProduct) {
        checkMilestones(product.name, oldClicks, updatedProduct.clicks);
      }
    }
    
    // Get user IP address
    let userIP = 'Unknown';
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      userIP = data.ip;
    } catch (error) {
      // Fallback to local IP indicator
      userIP = 'Local User';
    }
    
    // Add activity
    addActivity(
      'product_click',
      `${userIP} clicked`,
      product.name
    );
    
    window.open(product.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative">
      {product.badge && (
        <div className={`absolute -top-2 -right-2 z-10 px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse ${BADGE_STYLES[product.badge] || 'bg-red-500 text-white'}`}>
          {product.badge}
        </div>
      )}
      <button
        onClick={handleClick}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold">#{product.id}</span>
          <span className="text-base flex-1">{product.name}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
    </div>
  );
}
