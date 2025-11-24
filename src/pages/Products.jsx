import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getItemsSorted, deleteItem } from '../utils/storage';
import { useDarkMode } from '../hooks/useDarkMode';
import Sidebar from '../components/Sidebar';
import { exportProductsToExcel, importProductsReplace, importProductsNew, downloadTemplateReplace, downloadTemplateNew } from '../utils/excel';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');
  const [isDark, toggleDarkMode] = useDarkMode();
  const [importStatus, setImportStatus] = useState(null);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    badge: '',
    clicksMin: '',
    clicksMax: '',
    idMin: '',
    idMax: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const items = getItemsSorted();
    setProducts(items);
  };

  const handleDelete = (id) => {
    setDeleteConfirm(id);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedProducts = (productsToSort) => {
    const sorted = [...productsToSort].sort((a, b) => {
      let aVal, bVal;
      
      switch(sortField) {
        case 'id':
          aVal = a.id;
          bVal = b.id;
          break;
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'category':
          aVal = (a.category || 'Uncategorized').toLowerCase();
          bVal = (b.category || 'Uncategorized').toLowerCase();
          break;
        case 'clicks':
          aVal = a.clicks || 0;
          bVal = b.clicks || 0;
          break;
        default:
          return 0;
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteItem(deleteConfirm);
      loadProducts();
      setDeleteConfirm(null);
    }
  };

  const handleExport = () => {
    try {
      const result = exportProductsToExcel();
      setImportStatus({ type: 'success', message: `Berhasil export ${products.length} produk ke ${result.filename}` });
      setTimeout(() => setImportStatus(null), 5000);
    } catch (error) {
      setImportStatus({ type: 'error', message: 'Gagal export produk: ' + error.message });
      setTimeout(() => setImportStatus(null), 5000);
    }
  };

  const handleImportReplace = () => {
    setImportStatus(null);
    fileInputRef.current?.setAttribute('data-mode', 'replace');
    fileInputRef.current?.click();
  };

  const handleImportNew = () => {
    setImportStatus(null);
    fileInputRef.current?.setAttribute('data-mode', 'new');
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setImportStatus({ type: 'error', message: 'File harus berformat .xlsx atau .xls' });
      setTimeout(() => setImportStatus(null), 5000);
      return;
    }

    const mode = e.target.getAttribute('data-mode') || 'new';

    try {
      setImportStatus({ type: 'loading', message: 'Mengimport produk...' });
      
      let result;
      if (mode === 'replace') {
        result = await importProductsReplace(file);
        setImportStatus({ 
          type: 'success', 
          message: `✅ Import Replace berhasil!\n${result.imported} produk telah menggantikan semua produk lama.\nTotal produk sekarang: ${result.total}` 
        });
      } else {
        result = await importProductsNew(file);
        setImportStatus({ 
          type: 'success', 
          message: `✅ Import New berhasil!\n${result.imported} produk baru ditambahkan.\nTotal produk sekarang: ${result.total}` 
        });
      }
      
      loadProducts();
      setTimeout(() => setImportStatus(null), 7000);
    } catch (error) {
      setImportStatus({ type: 'error', message: '❌ ' + error.message });
      setTimeout(() => setImportStatus(null), 7000);
    }

    // Reset file input
    e.target.value = '';
    e.target.removeAttribute('data-mode');
    setShowImportMenu(false);
  };

  const handleDownloadTemplateReplace = () => {
    try {
      downloadTemplateReplace();
      setImportStatus({ type: 'success', message: 'Template Import Replace berhasil didownload' });
      setTimeout(() => setImportStatus(null), 3000);
    } catch (error) {
      setImportStatus({ type: 'error', message: 'Gagal download template' });
      setTimeout(() => setImportStatus(null), 3000);
    }
    setShowImportMenu(false);
  };

  const handleDownloadTemplateNew = () => {
    try {
      downloadTemplateNew();
      setImportStatus({ type: 'success', message: 'Template Import New berhasil didownload' });
      setTimeout(() => setImportStatus(null), 3000);
    } catch (error) {
      setImportStatus({ type: 'error', message: 'Gagal download template' });
      setTimeout(() => setImportStatus(null), 3000);
    }
    setShowImportMenu(false);
  };

  const applyFilters = (productsToFilter) => {
    return productsToFilter.filter(product => {
      // Search filter
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Category filter
      if (filters.category && product.category !== filters.category) {
        return false;
      }

      // Badge filter
      if (filters.badge) {
        if (filters.badge === 'NO_BADGE' && product.badge) {
          return false;
        }
        if (filters.badge !== 'NO_BADGE' && product.badge !== filters.badge) {
          return false;
        }
      }

      // Clicks range filter
      const clicks = product.clicks || 0;
      if (filters.clicksMin !== '' && clicks < parseInt(filters.clicksMin)) {
        return false;
      }
      if (filters.clicksMax !== '' && clicks > parseInt(filters.clicksMax)) {
        return false;
      }

      // ID range filter
      if (filters.idMin !== '' && product.id < parseInt(filters.idMin)) {
        return false;
      }
      if (filters.idMax !== '' && product.id > parseInt(filters.idMax)) {
        return false;
      }

      return true;
    });
  };

  const filteredProducts = applyFilters(products);
  const sortedAndFilteredProducts = getSortedProducts(filteredProducts);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      badge: '',
      clicksMin: '',
      clicksMax: '',
      idMin: '',
      idMax: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  // Get unique categories from products
  const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar productCount={products.length} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Products</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your affiliate products</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative">
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button 
                onClick={toggleDarkMode}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
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
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <div className="p-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            {/* Import Status Message */}
            {importStatus && (
              <div className={`mx-6 mt-4 px-4 py-3 rounded-lg ${
                importStatus.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' :
                importStatus.type === 'error' ? 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400' :
                'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
              }`}>
                <div className="flex items-center gap-2">
                  {importStatus.type === 'loading' && (
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span className="text-sm font-medium whitespace-pre-line">{importStatus.message}</span>
                </div>
              </div>
            )}

            {/* Search and Add Button */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="flex items-center gap-2">
                  {/* Filter Button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowFilterMenu(!showFilterMenu)}
                      className={`p-2 rounded-lg transition-colors relative ${
                        hasActiveFilters 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                      title="Filter Products"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      {hasActiveFilters && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                      )}
                    </button>

                    {/* Filter Dropdown Menu */}
                    {showFilterMenu && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowFilterMenu(false)}
                        ></div>
                        <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Filter Products</h3>
                            {hasActiveFilters && (
                              <button
                                onClick={clearFilters}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                Clear All
                              </button>
                            )}
                          </div>

                          <div className="space-y-4">
                            {/* Category Filter */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                              <select
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 focus:border-blue-500 focus:outline-none"
                              >
                                <option value="">All Categories</option>
                                {uniqueCategories.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>

                            {/* Badge Filter */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Badge</label>
                              <select
                                value={filters.badge}
                                onChange={(e) => handleFilterChange('badge', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 focus:border-blue-500 focus:outline-none"
                              >
                                <option value="">All Badges</option>
                                <option value="NO_BADGE">No Badge</option>
                                <option value="PROMO">🔥 PROMO</option>
                                <option value="DISKON">💰 DISKON</option>
                                <option value="NEW">✨ NEW</option>
                                <option value="HOT">🔥 HOT</option>
                                <option value="SALE">🎉 SALE</option>
                                <option value="BEST">⭐ BEST SELLER</option>
                                <option value="LIMITED">⏰ LIMITED</option>
                              </select>
                            </div>

                            {/* Clicks Range */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Clicks Range</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  placeholder="Min"
                                  value={filters.clicksMin}
                                  onChange={(e) => handleFilterChange('clicksMin', e.target.value)}
                                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 focus:border-blue-500 focus:outline-none"
                                  min="0"
                                />
                                <span className="text-gray-500">-</span>
                                <input
                                  type="number"
                                  placeholder="Max"
                                  value={filters.clicksMax}
                                  onChange={(e) => handleFilterChange('clicksMax', e.target.value)}
                                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 focus:border-blue-500 focus:outline-none"
                                  min="0"
                                />
                              </div>
                            </div>

                            {/* ID Range */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product ID Range</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  placeholder="From"
                                  value={filters.idMin}
                                  onChange={(e) => handleFilterChange('idMin', e.target.value)}
                                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 focus:border-blue-500 focus:outline-none"
                                  min="1"
                                />
                                <span className="text-gray-500">-</span>
                                <input
                                  type="number"
                                  placeholder="To"
                                  value={filters.idMax}
                                  onChange={(e) => handleFilterChange('idMax', e.target.value)}
                                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 focus:border-blue-500 focus:outline-none"
                                  min="1"
                                />
                              </div>
                            </div>

                            {/* Results Count */}
                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Showing <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredProducts.length}</span> of {products.length} products
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Export Button */}
                  <button
                    onClick={handleExport}
                    className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    title="Export to Excel"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>

                  {/* Import Button with Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowImportMenu(!showImportMenu)}
                      className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                      title="Import from Excel"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </button>

                    {/* Import Dropdown Menu */}
                    {showImportMenu && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowImportMenu(false)}
                        ></div>
                        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20">
                          {/* Import Replace */}
                          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1">IMPORT REPLACE</div>
                            <button
                              onClick={handleImportReplace}
                              className="w-full px-3 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3 rounded-lg"
                            >
                              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              <div className="flex-1">
                                <div className="font-medium text-gray-800 dark:text-gray-200 text-sm">Replace All Products</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Ganti semua produk</div>
                              </div>
                            </button>
                            <button
                              onClick={handleDownloadTemplateReplace}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 rounded-lg mt-1"
                            >
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Download Template Replace</div>
                            </button>
                          </div>

                          {/* Import New */}
                          <div className="p-2">
                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1">IMPORT NEW</div>
                            <button
                              onClick={handleImportNew}
                              className="w-full px-3 py-2 text-left hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center gap-3 rounded-lg"
                            >
                              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              <div className="flex-1">
                                <div className="font-medium text-gray-800 dark:text-gray-200 text-sm">Add New Products</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Tambah produk baru</div>
                              </div>
                            </button>
                            <button
                              onClick={handleDownloadTemplateNew}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 rounded-lg mt-1"
                            >
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Download Template New</div>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Add Product Button */}
                  <button
                    onClick={() => navigate('/add')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Product</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Products Table */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {searchTerm ? 'No products found' : 'No products yet'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {searchTerm ? 'Try different keywords' : 'Start by adding your first product'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => navigate('/add')}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Product
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        <button 
                          onClick={() => handleSort('id')}
                          className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <span>No</span>
                          <SortIcon field="id" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        <button 
                          onClick={() => handleSort('name')}
                          className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <span>Product Name</span>
                          <SortIcon field="name" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        <button 
                          onClick={() => handleSort('category')}
                          className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <span>Category</span>
                          <SortIcon field="category" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        <span>Badge</span>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        <button 
                          onClick={() => handleSort('clicks')}
                          className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <span>Clicks</span>
                          <SortIcon field="clicks" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedAndFilteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">#{product.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{product.name}</p>
                            <a 
                              href={product.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 truncate block max-w-xs"
                            >
                              {product.url}
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                            {product.category || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {product.badge ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              product.badge === 'PROMO' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' :
                              product.badge === 'DISKON' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                              product.badge === 'NEW' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                              product.badge === 'HOT' ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white' :
                              product.badge === 'SALE' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                              product.badge === 'BEST' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                              product.badge === 'LIMITED' ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white' :
                              'bg-red-500 text-white'
                            }`}>
                              {product.badge}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                            </svg>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{product.clicks || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/edit/${product.id}`)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2 text-center">Confirm Delete</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
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
