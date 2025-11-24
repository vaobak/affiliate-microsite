import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addItem } from '../utils/storage';
import CategorySelect from '../components/CategorySelect';
import CollectionSelect from '../components/CollectionSelect';

export default function AddProduct() {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [badge, setBadge] = useState('');
  const [collections, setCollections] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !url.trim()) {
      setError('Product name and URL are required!');
      return;
    }

    try {
      addItem({ 
        name: name.trim(), 
        url: url.trim(),
        category: category.trim() || 'Uncategorized',
        badge: badge.trim(),
        collections: collections
      });
      navigate('/products');
    } catch (err) {
      setError('An error occurred while saving the product.');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-gray-800 dark:text-gray-200">Affiliate</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">Dashboard</span>
            </button>
            
            <button
              onClick={() => navigate('/products')}
              className="w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="font-medium">Products</span>
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span className="font-medium">View Site</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/products')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Add New Product</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fill in the form to add a new product</p>
            </div>
          </div>
        </header>

        <div className="p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="e.g. Baby Clothes"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <CategorySelect value={category} onChange={setCategory} />
                </div>

                <div>
                  <label htmlFor="url" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Affiliate Link
                  </label>
                  <input
                    type="url"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="https://affiliate.link/product"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="badge" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Badge / Label (Optional)
                  </label>
                  <select
                    id="badge"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="">Tidak Ada Badge</option>
                    <option value="PROMO">🔥 PROMO</option>
                    <option value="DISKON">💰 DISKON</option>
                    <option value="NEW">✨ NEW</option>
                    <option value="HOT">🔥 HOT</option>
                    <option value="SALE">🎉 SALE</option>
                    <option value="BEST">⭐ BEST SELLER</option>
                    <option value="LIMITED">⏰ LIMITED</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Badge akan ditampilkan di halaman public untuk menarik perhatian
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Collections (Optional)
                  </label>
                  <CollectionSelect value={collections} onChange={setCollections} />
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/products')}
                    className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
