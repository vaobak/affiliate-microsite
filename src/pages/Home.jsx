import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { trackPageView } from '../utils/storage';
import { getCollectionBySlug, getDefaultCollection, getCollectionProducts } from '../utils/collections';
import { trackCollectionView } from '../utils/analytics';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import { getTheme, getPatternStyle } from '../utils/themes';

export default function Home() {
  const { collection: collectionSlug } = useParams();
  const [products, setProducts] = useState([]);
  const [currentRange, setCurrentRange] = useState(0);
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasTrackedView = useRef(false);
  const ITEMS_PER_PAGE = 100;

  useEffect(() => {
    loadProducts();
    
    // Track page view only once per mount
    if (!hasTrackedView.current) {
      trackPageView();
      hasTrackedView.current = true;
    }
  }, [collectionSlug]);

  useEffect(() => {
    // Track collection view when collection changes
    if (collection && collection.id) {
      trackCollectionView(collection.id);
    }
  }, [collection]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Get collection info
      let currentCollection;
      if (collectionSlug) {
        currentCollection = await getCollectionBySlug(collectionSlug);
        if (!currentCollection) {
          // Collection not found, use default
          currentCollection = await getDefaultCollection();
        }
      } else {
        currentCollection = await getDefaultCollection();
      }
      setCollection(currentCollection);

      // Get products from this collection
      const items = await getCollectionProducts(currentCollection.id);
      // Sort ascending by ID (1, 2, 3, ...)
      const sortedAsc = items.sort((a, b) => a.id - b.id);
      setProducts(sortedAsc);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination calculations
  const totalRanges = Math.ceil(products.length / ITEMS_PER_PAGE);
  const startIndex = currentRange * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = products.slice(startIndex, endIndex);

  const goToRange = (rangeIndex) => {
    setCurrentRange(rangeIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate range buttons (1-100, 101-200, etc)
  const getRangeButtons = () => {
    const buttons = [];
    for (let i = 0; i < totalRanges; i++) {
      const start = i * ITEMS_PER_PAGE + 1;
      const end = Math.min((i + 1) * ITEMS_PER_PAGE, products.length);
      buttons.push({ index: i, start, end });
    }
    return buttons;
  };

  const theme = getTheme(collection?.theme || 'blue');
  const patternStyle = getPatternStyle(collection?.pattern || 'none');
  const enableAnimation = collection?.enable_animation !== 0;

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br ${theme.bg} via-white to-gray-50 relative overflow-hidden`}
      style={patternStyle}
    >
      {/* Decorative floating shapes - only if animation enabled */}
      {enableAnimation && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-20 left-10 w-72 h-72 bg-gradient-to-br ${theme.gradient} rounded-full opacity-5 blur-3xl animate-pulse`}></div>
          <div className={`absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br ${theme.gradient} rounded-full opacity-5 blur-3xl animate-pulse delay-1000`}></div>
          <div className={`absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br ${theme.gradient} rounded-full opacity-5 blur-3xl animate-pulse delay-500`}></div>
        </div>
      )}

      {/* Header */}
      <header className={`bg-white/80 backdrop-blur-md shadow-sm border-b-4 ${theme.border} relative z-10 animate-slide-up`}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className={`text-4xl font-display font-bold bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent tracking-tight leading-tight mb-3`}>
            {collection?.name || 'Produk Pilihan'}
          </h1>
          <p className="text-gray-600 text-lg font-sans leading-relaxed">
            {collection?.description || 'Temukan produk terbaik untuk kebutuhan Anda'}
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <EmptyState 
            theme={collection?.theme || 'blue'}
            message="Belum Ada Produk"
            description="Produk akan muncul di sini setelah ditambahkan"
          />
        ) : (
          <>
            {/* Range Navigation - Only show if more than 100 products */}
            {products.length > ITEMS_PER_PAGE && (
              <div className="mb-8 animate-fade-in">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-5 border border-gray-200">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-display font-semibold text-gray-700 mr-2">Pilih Range:</span>
                    {getRangeButtons().map((btn) => (
                      <button
                        key={btn.index}
                        onClick={() => goToRange(btn.index)}
                        className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                          currentRange === btn.index
                            ? `bg-gradient-to-r ${theme.gradient} text-white shadow-md hover:shadow-lg transform hover:scale-105`
                            : `bg-white ${theme.text} border ${theme.border} ${theme.hover} hover:shadow-md`
                        }`}
                      >
                        {btn.start}-{btn.end}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-gray-500 font-sans">
                    Menampilkan produk {startIndex + 1}-{Math.min(endIndex, products.length)} dari {products.length} total produk
                  </div>
                </div>
              </div>
            )}

            {/* Products List */}
            <div className="space-y-4">
              {currentProducts.map((product, index) => (
                <div 
                  key={product.id}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ProductCard 
                    product={product}
                    displayNumber={startIndex + index + 1}
                    collectionId={collection?.id} 
                    theme={collection?.theme || 'blue'}
                    showCategory={false}
                  />
                </div>
              ))}
            </div>

            {/* Bottom Navigation - Only show if more than 100 products */}
            {products.length > ITEMS_PER_PAGE && (
              <div className="mt-10 animate-fade-in">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-5 border border-gray-200">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <button
                      onClick={() => goToRange(Math.max(0, currentRange - 1))}
                      disabled={currentRange === 0}
                      className={`px-5 py-2.5 rounded-xl font-display font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                        currentRange === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-blue-400 hover:shadow-md transform hover:scale-105'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>
                    
                    <span className="text-sm text-gray-600 font-display font-semibold">
                      Range {currentRange + 1} of {totalRanges}
                    </span>

                    <button
                      onClick={() => goToRange(Math.min(totalRanges - 1, currentRange + 1))}
                      disabled={currentRange === totalRanges - 1}
                      className={`px-5 py-2.5 rounded-xl font-display font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                        currentRange === totalRanges - 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-blue-400 hover:shadow-md transform hover:scale-105'
                      }`}
                    >
                      Next
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-600 font-sans text-sm">© 2025 Affiliate Microsite. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
