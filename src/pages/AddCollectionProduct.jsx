import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addProductToCollection, getCollections } from '../utils/collections';
import CategorySelect from '../components/CategorySelect';

export default function AddCollectionProduct() {
  const { collectionId } = useParams();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [badge, setBadge] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const collections = getCollections();
  const collection = collections.find(c => c.id === collectionId);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !url.trim()) {
      setError('Product name and URL are required!');
      return;
    }

    try {
      addProductToCollection(collectionId, {
        name: name.trim(),
        url: url.trim(),
        category: category.trim() || 'Uncategorized',
        badge: badge.trim()
      });
      navigate(`/collections/${collectionId}/products`);
    } catch (err) {
      setError('An error occurred while saving the product.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate(`/collections/${collectionId}/products`)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to {collection?.name}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Add Product to {collection?.name}</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Product Name</label>
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
              <label htmlFor="category" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <CategorySelect value={category} onChange={setCategory} />
            </div>

            <div>
              <label htmlFor="url" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Affiliate Link</label>
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
              <label htmlFor="badge" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Badge / Label (Optional)</label>
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
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(`/collections/${collectionId}/products`)}
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
  );
}
