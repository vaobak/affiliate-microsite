import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCollections, addCollection, deleteCollection, updateCollection } from '../utils/collections';
import { useDarkMode } from '../hooks/useDarkMode';
import Sidebar from '../components/Sidebar';

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [newCollection, setNewCollection] = useState({ name: '', slug: '', description: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [isDark, toggleDarkMode] = useDarkMode();
  const navigate = useNavigate();

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const cols = await getCollections();
      setCollections(Array.isArray(cols) ? cols : []);
    } catch (error) {
      console.error('Error loading collections:', error);
      setCollections([]);
    }
  };

  const handleAddCollection = async () => {
    if (!newCollection.name.trim()) return;
    
    try {
      const slug = newCollection.slug.trim() || newCollection.name.toLowerCase().replace(/\s+/g, '');
      await addCollection({
        name: newCollection.name.trim(),
        slug: slug,
        description: newCollection.description.trim()
      });
      
      setNewCollection({ name: '', slug: '', description: '' });
      setShowAddModal(false);
      await loadCollections();
    } catch (error) {
      console.error('Error adding collection:', error);
      alert('Error adding collection. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCollection(id);
      await loadCollections();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Error deleting collection. Please try again.');
    }
  };

  const handleEdit = (collection) => {
    setEditingCollection({
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      description: collection.description
    });
    setShowEditModal(true);
  };

  const handleUpdateCollection = async () => {
    if (!editingCollection.name.trim()) return;
    
    try {
      await updateCollection(editingCollection.id, {
        name: editingCollection.name.trim(),
        slug: editingCollection.slug.trim() || editingCollection.name.toLowerCase().replace(/\s+/g, ''),
        description: editingCollection.description.trim()
      });
      
      setEditingCollection(null);
      setShowEditModal(false);
      await loadCollections();
    } catch (error) {
      console.error('Error updating collection:', error);
      alert('Error updating collection. Please try again.');
    }
  };

  const getTotalProducts = (collection) => {
    return collection.products ? collection.products.length : 0;
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Collections</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your product collections</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative">
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button onClick={toggleDarkMode} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                {isDark ? (
                  <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </header>

        <div className="p-8">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Collection
            </button>

            {/* Grid/List Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                title="Grid View"
              >
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                title="List View"
              >
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {collections.map((collection) => (
              <div key={collection.id} className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow ${viewMode === 'grid' ? 'p-6' : 'p-4'}`}>
                <div className={`flex items-start justify-between ${viewMode === 'grid' ? 'mb-4' : 'mb-0'}`}>
                  <div className="flex-1">
                    <h3 className={`font-bold text-gray-800 dark:text-gray-200 ${viewMode === 'grid' ? 'text-lg mb-1' : 'text-base'}`}>
                      {collection.name}
                      {collection.isDefault && (
                        <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </h3>
                    {viewMode === 'grid' && <p className="text-sm text-gray-500 dark:text-gray-400">{collection.description}</p>}
                  </div>
                </div>

                <div className={`flex items-center justify-between ${viewMode === 'grid' ? 'pt-4 border-t border-gray-200 dark:border-gray-700' : 'mt-2'}`}>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{getTotalProducts(collection)}</span> products
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(collection)}
                      className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                      title="Edit Collection"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => navigate(`/collections/${collection.id}/products`)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Manage Products"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </button>
                    <a
                      href={collection.slug ? `/${collection.slug}` : '/'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                      title="View Page"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    {!collection.isDefault && (
                      <button
                        onClick={() => setDeleteConfirm(collection.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Edit Collection Modal */}
      {showEditModal && editingCollection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Edit Collection</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Collection Name</label>
                <input
                  type="text"
                  value={editingCollection.name}
                  onChange={(e) => setEditingCollection({...editingCollection, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. Barang Viral"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={editingCollection.slug}
                  onChange={(e) => setEditingCollection({...editingCollection, slug: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 focus:border-blue-500 focus:outline-none"
                  placeholder="barangviral"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={editingCollection.description}
                  onChange={(e) => setEditingCollection({...editingCollection, description: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 focus:border-blue-500 focus:outline-none"
                  rows="3"
                  placeholder="Description..."
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCollection(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCollection}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Collection Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Add New Collection</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Collection Name</label>
                <input
                  type="text"
                  value={newCollection.name}
                  onChange={(e) => setNewCollection({...newCollection, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. Barang Viral"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={newCollection.slug}
                  onChange={(e) => setNewCollection({...newCollection, slug: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 focus:border-blue-500 focus:outline-none"
                  placeholder="barangviral (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={newCollection.description}
                  onChange={(e) => setNewCollection({...newCollection, description: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 focus:border-blue-500 focus:outline-none"
                  rows="3"
                  placeholder="Description..."
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCollection}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2 text-center">Delete Collection?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
              All products in this collection will be deleted. This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
