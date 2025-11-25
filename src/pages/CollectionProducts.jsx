import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getCollections, getCollectionProducts, deleteProductFromCollection, addProductToCollection, importProductsReplaceToCollection, importProductsNewToCollection } from '../utils/collections';
import { bulkDeleteProducts, bulkUpdateProducts, bulkMoveProducts, bulkDuplicateProducts } from '../utils/bulkOperations';
import { useDarkMode } from '../hooks/useDarkMode';
import Sidebar from '../components/Sidebar';
import * as XLSX from 'xlsx';

export default function CollectionProducts() {
  const { collectionId } = useParams();
  const location = useLocation();
  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDark, toggleDarkMode] = useDarkMode();
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [importMode, setImportMode] = useState('new'); // 'replace' or 'new'
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const fileInputRef = useRef(null);
  const fileInputReplaceRef = useRef(null);
  const fileInputNewRef = useRef(null);
  const navigate = useNavigate();

  // Bulk operations states
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [showBulkMoveModal, setShowBulkMoveModal] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({ category: '', badge: '' });
  const [targetCollectionId, setTargetCollectionId] = useState('');

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
    loadData();
  }, [collectionId]);

  // Handle navigation state from Dashboard
  useEffect(() => {
    if (location.state?.openImport) {
      setShowImportMenu(true);
      if (location.state?.importMode) {
        setImportMode(location.state.importMode);
      }
      // Clear the state after using it
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const loadData = async () => {
    try {
      const collections = await getCollections();
      const currentCollection = collections.find(c => c.id === collectionId);
      if (!currentCollection) {
        navigate('/collections');
        return;
      }
      setCollection(currentCollection);
      const prods = await getCollectionProducts(collectionId);
      setProducts(Array.isArray(prods) ? prods.sort((a, b) => b.id - a.id) : []);
    } catch (error) {
      console.error('Error loading collection products:', error);
      setProducts([]);
    }
  };

  const handleDelete = async (productId) => {
    try {
      await deleteProductFromCollection(collectionId, productId);
      await loadData();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product. Please try again.');
    }
  };

  const applyFilters = (productsToFilter) => {
    return productsToFilter.filter(product => {
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filters.category && product.category !== filters.category) {
        return false;
      }
      if (filters.badge) {
        if (filters.badge === 'NO_BADGE' && product.badge) {
          return false;
        }
        if (filters.badge !== 'NO_BADGE' && product.badge !== filters.badge) {
          return false;
        }
      }
      const clicks = product.clicks || 0;
      if (filters.clicksMin !== '' && clicks < parseInt(filters.clicksMin)) {
        return false;
      }
      if (filters.clicksMax !== '' && clicks > parseInt(filters.clicksMax)) {
        return false;
      }
      if (filters.idMin !== '' && product.id < parseInt(filters.idMin)) {
        return false;
      }
      if (filters.idMax !== '' && product.id > parseInt(filters.idMax)) {
        return false;
      }
      return true;
    });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortProducts = (productsToSort) => {
    const sorted = [...productsToSort].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle different data types
      if (sortConfig.key === 'id' || sortConfig.key === 'clicks') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      } else if (sortConfig.key === 'name' || sortConfig.key === 'category' || sortConfig.key === 'badge') {
        aValue = (aValue || '').toLowerCase();
        bValue = (bValue || '').toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  };

  const filteredProducts = sortProducts(applyFilters(products));

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
  const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();

  const handleExport = () => {
    try {
      const excelData = products.map(product => ({
        'ID': product.id,
        'Product Name': product.name,
        'Category': product.category || 'Uncategorized',
        'Affiliate Link': product.url,
        'Badge': product.badge || '',
        'Clicks': product.clicks || 0,
        'Created At': product.createdAt || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      worksheet['!cols'] = [
        { wch: 8 }, { wch: 30 }, { wch: 20 }, { wch: 50 }, { wch: 15 }, { wch: 10 }, { wch: 25 }
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${collection?.name || 'products'}-${timestamp}.xlsx`;
      XLSX.writeFile(workbook, filename);

      setImportStatus({ type: 'success', message: `Berhasil export ${products.length} produk` });
      setTimeout(() => setImportStatus(null), 3000);
    } catch (error) {
      setImportStatus({ type: 'error', message: 'Gagal export produk' });
      setTimeout(() => setImportStatus(null), 3000);
    }
  };

  const handleImportReplace = () => {
    fileInputReplaceRef.current?.click();
    setShowImportMenu(false);
  };

  const handleImportNew = () => {
    fileInputNewRef.current?.click();
    setShowImportMenu(false);
  };

  const handleFileChangeReplace = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setImportStatus({ type: 'error', message: 'File harus berformat .xlsx atau .xls' });
      setTimeout(() => setImportStatus(null), 5000);
      return;
    }

    try {
      setImportStatus({ type: 'loading', message: 'Mengimport produk (Replace Mode)...' });
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (jsonData.length === 0) {
            setImportStatus({ type: 'error', message: 'File Excel kosong' });
            setTimeout(() => setImportStatus(null), 5000);
            return;
          }

          const result = await importProductsReplaceToCollection(collectionId, jsonData);
          
          await loadData();
          setImportStatus({ 
            type: 'success', 
            message: `Import Replace berhasil! ${result.imported} produk diimport. Total produk: ${result.total}` 
          });
          setTimeout(() => setImportStatus(null), 5000);
        } catch (error) {
          setImportStatus({ type: 'error', message: error.message });
          setTimeout(() => setImportStatus(null), 5000);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      setImportStatus({ type: 'error', message: 'Gagal import produk' });
      setTimeout(() => setImportStatus(null), 5000);
    }

    e.target.value = '';
  };

  const handleFileChangeNew = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setImportStatus({ type: 'error', message: 'File harus berformat .xlsx atau .xls' });
      setTimeout(() => setImportStatus(null), 5000);
      return;
    }

    try {
      setImportStatus({ type: 'loading', message: 'Mengimport produk (New Mode)...' });
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (jsonData.length === 0) {
            setImportStatus({ type: 'error', message: 'File Excel kosong' });
            setTimeout(() => setImportStatus(null), 5000);
            return;
          }

          const result = await importProductsNewToCollection(collectionId, jsonData);
          
          await loadData();
          setImportStatus({ 
            type: 'success', 
            message: `Import New berhasil! ${result.imported} produk baru ditambahkan. Total produk: ${result.total}` 
          });
          setTimeout(() => setImportStatus(null), 5000);
        } catch (error) {
          setImportStatus({ type: 'error', message: error.message });
          setTimeout(() => setImportStatus(null), 5000);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      setImportStatus({ type: 'error', message: 'Gagal import produk' });
      setTimeout(() => setImportStatus(null), 5000);
    }

    e.target.value = '';
  };

  const downloadTemplateReplace = () => {
    const templateData = [
      {
        'ID': 1,
        'Product Name': 'Contoh Produk 1',
        'Category': 'Fashion Pria',
        'Affiliate Link': 'https://example.com/product1',
        'Badge': 'PROMO',
        'Clicks': 0
      },
      {
        'ID': 2,
        'Product Name': 'Contoh Produk 2',
        'Category': 'Elektronik',
        'Affiliate Link': 'https://example.com/product2',
        'Badge': 'DISKON',
        'Clicks': 0
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    worksheet['!cols'] = [{ wch: 8 }, { wch: 30 }, { wch: 20 }, { wch: 50 }, { wch: 15 }, { wch: 10 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    XLSX.writeFile(workbook, 'template-import-replace.xlsx');

    setImportStatus({ type: 'success', message: 'Template Replace berhasil didownload' });
    setTimeout(() => setImportStatus(null), 3000);
    setShowImportMenu(false);
  };

  const downloadTemplateNew = () => {
    const templateData = [
      {
        'Product Name': 'Contoh Produk Baru 1',
        'Category': 'Fashion Pria',
        'Affiliate Link': 'https://example.com/product1',
        'Badge': 'NEW',
        'Clicks': 0
      },
      {
        'Product Name': 'Contoh Produk Baru 2',
        'Category': 'Elektronik',
        'Affiliate Link': 'https://example.com/product2',
        'Badge': 'HOT',
        'Clicks': 0
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    worksheet['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 50 }, { wch: 15 }, { wch: 10 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    XLSX.writeFile(workbook, 'template-import-new.xlsx');

    setImportStatus({ type: 'success', message: 'Template New berhasil didownload' });
    setTimeout(() => setImportStatus(null), 3000);
    setShowImportMenu(false);
  };

  // Bulk Operations Functions
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(filteredProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    
    if (confirm(`Delete ${selectedProducts.length} selected products?`)) {
      try {
        await bulkDeleteProducts(collectionId, selectedProducts);
        setImportStatus({ type: 'success', message: `${selectedProducts.length} products deleted successfully` });
        setSelectedProducts([]);
        await loadData();
        setTimeout(() => setImportStatus(null), 3000);
      } catch (error) {
        setImportStatus({ type: 'error', message: error.message });
        setTimeout(() => setImportStatus(null), 3000);
      }
    }
  };

  const handleBulkEdit = () => {
    if (selectedProducts.length === 0) return;
    setShowBulkEditModal(true);
  };

  const handleBulkEditSubmit = async () => {
    try {
      const updates = {};
      if (bulkEditData.category) updates.category = bulkEditData.category;
      if (bulkEditData.badge) updates.badge = bulkEditData.badge;

      if (Object.keys(updates).length === 0) {
        setImportStatus({ type: 'error', message: 'Please select at least one field to update' });
        setTimeout(() => setImportStatus(null), 3000);
        return;
      }

      await bulkUpdateProducts(collectionId, selectedProducts, updates);
      setImportStatus({ type: 'success', message: `${selectedProducts.length} products updated successfully` });
      setSelectedProducts([]);
      setBulkEditData({ category: '', badge: '' });
      setShowBulkEditModal(false);
      await loadData();
      setTimeout(() => setImportStatus(null), 3000);
    } catch (error) {
      setImportStatus({ type: 'error', message: error.message });
      setTimeout(() => setImportStatus(null), 3000);
    }
  };

  const handleBulkMove = () => {
    if (selectedProducts.length === 0) return;
    setShowBulkMoveModal(true);
  };

  const handleBulkMoveSubmit = async () => {
    if (!targetCollectionId) {
      setImportStatus({ type: 'error', message: 'Please select a target collection' });
      setTimeout(() => setImportStatus(null), 3000);
      return;
    }

    try {
      await bulkMoveProducts(collectionId, targetCollectionId, selectedProducts);
      setImportStatus({ type: 'success', message: `${selectedProducts.length} products moved successfully` });
      setSelectedProducts([]);
      setTargetCollectionId('');
      setShowBulkMoveModal(false);
      await loadData();
      setTimeout(() => setImportStatus(null), 3000);
    } catch (error) {
      setImportStatus({ type: 'error', message: error.message });
      setTimeout(() => setImportStatus(null), 3000);
    }
  };

  const handleBulkDuplicate = async () => {
    if (!targetCollectionId) {
      setImportStatus({ type: 'error', message: 'Please select a target collection' });
      setTimeout(() => setImportStatus(null), 3000);
      return;
    }

    try {
      await bulkDuplicateProducts(collectionId, targetCollectionId, selectedProducts);
      setImportStatus({ type: 'success', message: `${selectedProducts.length} products duplicated successfully` });
      setSelectedProducts([]);
      setTargetCollectionId('');
      setShowBulkMoveModal(false);
      setTimeout(() => setImportStatus(null), 3000);
    } catch (error) {
      setImportStatus({ type: 'error', message: error.message });
      setTimeout(() => setImportStatus(null), 3000);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/collections')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{collection?.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{collection?.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
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
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            {/* Import Status Message */}
            {importStatus && (
              <div className={`mx-6 mt-4 px-4 py-3 rounded-lg ${
                importStatus.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 text-green-700' :
                importStatus.type === 'error' ? 'bg-red-50 dark:bg-red-900/30 border border-red-200 text-red-700' :
                'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 text-blue-700'
              }`}>
                <span className="text-sm font-medium">{importStatus.message}</span>
              </div>
            )}

            {/* Bulk Actions Bar */}
            {selectedProducts.length > 0 && (
              <div className="mx-6 mt-4 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkEdit}
                    className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleBulkMove}
                    className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
                  >
                    Move/Duplicate
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedProducts([])}
                    className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

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
                  {/* Filter Button - Copy from Products.jsx */}
                  <div className="relative">
                    <button
                      onClick={() => setShowFilterMenu(!showFilterMenu)}
                      className={`p-2 rounded-lg transition-colors ${hasActiveFilters ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                      title="Filter"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      {hasActiveFilters && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>}
                    </button>

                    {showFilterMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowFilterMenu(false)}></div>
                        <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Filter Products</h3>
                            {hasActiveFilters && (
                              <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline">Clear All</button>
                            )}
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                              <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 focus:border-blue-500 focus:outline-none">
                                <option value="">All Categories</option>
                                {uniqueCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Badge</label>
                              <select value={filters.badge} onChange={(e) => handleFilterChange('badge', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 focus:border-blue-500 focus:outline-none">
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
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Clicks Range</label>
                              <div className="flex items-center gap-2">
                                <input type="number" placeholder="Min" value={filters.clicksMin} onChange={(e) => handleFilterChange('clicksMin', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 focus:border-blue-500 focus:outline-none" min="0" />
                                <span className="text-gray-500">-</span>
                                <input type="number" placeholder="Max" value={filters.clicksMax} onChange={(e) => handleFilterChange('clicksMax', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 focus:border-blue-500 focus:outline-none" min="0" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product ID Range</label>
                              <div className="flex items-center gap-2">
                                <input type="number" placeholder="From" value={filters.idMin} onChange={(e) => handleFilterChange('idMin', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 focus:border-blue-500 focus:outline-none" min="1" />
                                <span className="text-gray-500">-</span>
                                <input type="number" placeholder="To" value={filters.idMax} onChange={(e) => handleFilterChange('idMax', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 focus:border-blue-500 focus:outline-none" min="1" />
                              </div>
                            </div>
                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-sm text-gray-600 dark:text-gray-400">Showing <span className="font-semibold text-blue-600">{filteredProducts.length}</span> of {products.length} products</p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Export Button */}
                  <button onClick={handleExport} className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors" title="Export">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>

                  {/* Import Button */}
                  <div className="relative">
                    <button onClick={() => setShowImportMenu(!showImportMenu)} className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors" title="Import">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </button>

                    {showImportMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowImportMenu(false)}></div>
                        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20">
                          {/* Import Replace */}
                          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">IMPORT REPLACE</div>
                            <button onClick={handleImportReplace} className="w-full px-3 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3 rounded-lg mb-2">
                              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              <div>
                                <div className="font-medium text-gray-800 dark:text-gray-200 text-sm">Replace All</div>
                                <div className="text-xs text-gray-500">Ganti semua produk</div>
                              </div>
                            </button>
                            <button onClick={downloadTemplateReplace} className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 rounded-lg">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Download Template Replace</div>
                            </button>
                          </div>

                          {/* Import New */}
                          <div className="p-3">
                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">IMPORT NEW</div>
                            <button onClick={handleImportNew} className="w-full px-3 py-2 text-left hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center gap-3 rounded-lg mb-2">
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              <div>
                                <div className="font-medium text-gray-800 dark:text-gray-200 text-sm">Add New</div>
                                <div className="text-xs text-gray-500">Tambah produk baru</div>
                              </div>
                            </button>
                            <button onClick={downloadTemplateNew} className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 rounded-lg">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Download Template New</div>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <input ref={fileInputReplaceRef} type="file" accept=".xlsx,.xls" onChange={handleFileChangeReplace} className="hidden" />
                  <input ref={fileInputNewRef} type="file" accept=".xlsx,.xls" onChange={handleFileChangeNew} className="hidden" />

                  <button
                    onClick={() => navigate(`/collections/${collectionId}/add`)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Product
                  </button>
                </div>
              </div>
            </div>

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
                    onClick={() => navigate(`/collections/${collectionId}/add`)}
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
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </th>
                      <th 
                        onClick={() => handleSort('id')}
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          No
                          {sortConfig.key === 'id' && (
                            <svg className={`w-4 h-4 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('name')}
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          Product Name
                          {sortConfig.key === 'name' && (
                            <svg className={`w-4 h-4 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('category')}
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          Category
                          {sortConfig.key === 'category' && (
                            <svg className={`w-4 h-4 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('badge')}
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          Badge
                          {sortConfig.key === 'badge' && (
                            <svg className={`w-4 h-4 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('clicks')}
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          Clicks
                          {sortConfig.key === 'clicks' && (
                            <svg className={`w-4 h-4 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => handleSelectProduct(product.id)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">#{product.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{product.name}</p>
                            <a href={product.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 truncate block max-w-xs">
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
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white">
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
                              onClick={() => navigate(`/collections/${collectionId}/edit/${product.id}`)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(product.id)}
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
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Edit Modal */}
      {showBulkEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Bulk Edit Products</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Editing {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <input
                  type="text"
                  value={bulkEditData.category}
                  onChange={(e) => setBulkEditData({...bulkEditData, category: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 focus:border-blue-500 focus:outline-none"
                  placeholder="Leave empty to keep current"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Badge</label>
                <select
                  value={bulkEditData.badge}
                  onChange={(e) => setBulkEditData({...bulkEditData, badge: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Keep current</option>
                  <option value="PROMO">PROMO</option>
                  <option value="DISKON">DISKON</option>
                  <option value="NEW">NEW</option>
                  <option value="HOT">HOT</option>
                  <option value="SALE">SALE</option>
                  <option value="BEST">BEST SELLER</option>
                  <option value="LIMITED">LIMITED</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  setShowBulkEditModal(false);
                  setBulkEditData({ category: '', badge: '' });
                }}
                className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkEditSubmit}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Move/Duplicate Modal */}
      {showBulkMoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Move or Duplicate Products</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Collection</label>
                <select
                  value={targetCollectionId}
                  onChange={(e) => setTargetCollectionId(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select collection...</option>
                  {getCollections().filter(c => c.id !== collectionId).map(col => (
                    <option key={col.id} value={col.id}>{col.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  setShowBulkMoveModal(false);
                  setTargetCollectionId('');
                }}
                className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDuplicate}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                Duplicate
              </button>
              <button
                onClick={handleBulkMoveSubmit}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Move
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
