import { addActivity } from '../utils/storage';
import { incrementClicksInCollection, getProductFromCollection } from '../utils/collections';
import { trackClick } from '../utils/analytics';
import { checkMilestones } from '../utils/notifications';
import { getTheme } from '../utils/themes';

const BADGE_STYLES = {
  'PROMO': 'bg-gradient-to-r from-red-500 to-orange-500 text-white',
  'DISKON': 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
  'NEW': 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
  'HOT': 'bg-gradient-to-r from-red-600 to-pink-600 text-white',
  'SALE': 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
  'BEST': 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
  'LIMITED': 'bg-gradient-to-r from-gray-700 to-gray-900 text-white'
};

export default function ProductCard({ product, collectionId, theme = 'blue', showCategory = true }) {
  const handleClick = async () => {
    const oldClicks = product.clicks || 0;
    
    // Increment clicks in collection
    if (collectionId) {
      await incrementClicksInCollection(collectionId, product.id);
      
      // Track click for analytics
      await trackClick(product.id, collectionId);
      
      // Check for milestone achievements
      try {
        const updatedProduct = await getProductFromCollection(collectionId, product.id);
        if (updatedProduct) {
          checkMilestones(product.name, oldClicks, updatedProduct.clicks);
        }
      } catch (error) {
        console.error('Error checking milestones:', error);
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

  const themeColors = getTheme(theme);
  const hasImage = product.image_url || product.imageUrl;
  const clicks = product.clicks || 0;

  return (
    <div className="relative group animate-slide-up">
      {product.badge && (
        <div className={`absolute -top-2 -right-2 z-10 px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse ${BADGE_STYLES[product.badge] || 'bg-red-500 text-white'}`}>
          {product.badge}
        </div>
      )}
      
      {/* Social Proof - Clicks Counter */}
      {clicks > 0 && (
        <div className="absolute -top-2 -left-2 z-10 px-2 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-md flex items-center gap-1 animate-scale-in">
          <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
          </svg>
          {clicks}
        </div>
      )}

      <button
        onClick={handleClick}
        className={`w-full bg-gradient-to-r ${themeColors.gradient} hover:scale-[1.02] active:scale-[0.98] text-white font-display font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl text-left overflow-hidden backdrop-blur-sm bg-opacity-95 relative`}
        style={{
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="flex items-center gap-4 p-4 relative z-10">
          {/* Image Thumbnail */}
          {hasImage && (
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white/20 backdrop-blur-sm ring-2 ring-white/30 group-hover:ring-white/50 transition-all duration-300">
              <img 
                src={product.image_url || product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          )}
          
          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <span className="text-base font-semibold block truncate tracking-tight leading-snug">
              #{product.id} {product.name}
            </span>
          </div>
          
          {/* Arrow Icon with glow effect */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </button>
    </div>
  );
}
