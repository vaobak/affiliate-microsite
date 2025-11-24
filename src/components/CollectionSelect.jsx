import { useState, useEffect } from 'react';
import { getCollections } from '../utils/collections';

export default function CollectionSelect({ value = [], onChange }) {
  const [collections, setCollections] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState(value);

  useEffect(() => {
    const cols = getCollections().filter(c => !c.isDefault); // Exclude "All" collection
    setCollections(cols);
  }, []);

  useEffect(() => {
    setSelectedCollections(value);
  }, [value]);

  const handleToggle = (slug) => {
    let updated;
    if (selectedCollections.includes(slug)) {
      updated = selectedCollections.filter(s => s !== slug);
    } else {
      updated = [...selectedCollections, slug];
    }
    setSelectedCollections(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      {collections.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tidak ada collection. Produk akan muncul di halaman utama.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {collections.map((collection) => (
            <label
              key={collection.id}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selectedCollections.includes(collection.slug)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedCollections.includes(collection.slug)}
                onChange={() => handleToggle(collection.slug)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {collection.name}
                </p>
                {collection.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {collection.description}
                  </p>
                )}
              </div>
            </label>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Pilih collection dimana produk ini akan ditampilkan. Bisa pilih lebih dari satu.
      </p>
    </div>
  );
}
