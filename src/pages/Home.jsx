import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { trackPageView } from '../utils/storage';
import { getCollectionBySlug, getDefaultCollection, getCollectionProducts } from '../utils/collections';
import { trackCollectionView } from '../utils/analytics';
import ProductCard from '../components/ProductCard';
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
      <header className={`bg-white/80 backdrop-blur-sm shadow-sm border-b-4 ${theme.border} relative z-10`}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className={`text-3xl font-bold bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
            {collection?.name || 'Produk Pilihan'}
          </h1>
          <p className="text-gray-600 mt-2">
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
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Belum Ada Produk
            </h2>
            <p className="text-gray-500">
              Produk akan muncul di sini setelah ditambahkan
            </p>
          </div>
        ) : (
          <>
            {/* Range Navigation - Only show if more than 100 products */}
            {products.length > ITEMS_PER_PAGE && (
              <div className="mb-6">
                <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-700 mr-2">Pilih Range:</span>
                    {getRangeButtons().map((btn) => (
                      <button
                        key={btn.index}
                        onClick={() => goToRange(btn.index)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          currentRange === btn.index
                            ? `bg-gradient-to-r ${theme.gradient} text-white shadow-md`
                            : `bg-white ${theme.text} border ${theme.border} ${theme.hover}`
                        }`}
                      >
                        {btn.start}-{btn.end}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    Menampilkan produk {startIndex + 1}-{Math.min(endIndex, products.length)} dari {products.length} total produk
                  </div>
                </div>
              </div>
            )}

            {/* Products List */}
            <div className="space-y-3">
              {currentProducts.map((product) => (
                <ProductCard key={product.id} product={product} collectionId={collection?.id} theme={collection?.theme || 'blue'} />
              ))}
            </div>

            {/* Bottom Navigation - Only show if more than 100 products */}
            {products.length > ITEMS_PER_PAGE && (
              <div className="mt-8">
                <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <button
                      onClick={() => goToRange(Math.max(0, currentRange - 1))}
                      disabled={currentRange === 0}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                        currentRange === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-blue-400'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>
                    
                    <span className="text-sm text-gray-600 font-medium">
                      Range {currentRange + 1} of {totalRanges}
                    </span>

                    <button
                      onClick={() => goToRange(Math.min(totalRanges - 1, currentRange + 1))}
                      disabled={currentRange === totalRanges - 1}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                        currentRange === totalRanges - 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-blue-400'
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
      <footer className="bg-white border-t border-gray-100 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-600">
          <p>© 2025 Affiliate Microsite. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
