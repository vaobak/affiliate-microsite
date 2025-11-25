import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPageViews, getRecentActivity } from '../utils/storage';
import { getCollections, getCollectionProducts } from '../utils/collections';
import { useDarkMode } from '../hooks/useDarkMode';
import Sidebar from '../components/Sidebar';
import NotificationPanel from '../components/NotificationPanel';
import { getUnreadCount } from '../utils/notifications';
import { getClickHistory, getCollectionViewCount } from '../utils/analytics';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeLinks: 0,
    totalClicks: 0,
    pageViews: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [isDark, toggleDarkMode] = useDarkMode();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [timeRange, setTimeRange] = useState('week'); // 'day', 'week', 'month'
  const [collections, setCollections] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'all-products'
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddProductMenu, setShowAddProductMenu] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [hoveredCollection, setHoveredCollection] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [collectionPerformance, setCollectionPerformance] = useState([]);
  const [lowPerformingProducts, setLowPerformingProducts] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 50;
  const clicksPerformanceRef = useRef(null);
  const addProductMenuTimeoutRef = useRef(null);
  const importMenuTimeoutRef = useRef(null);
  const submenuTimeoutRef = useRef(null);

  useEffect(() => {
    loadAllData();
  }, []);

  // Load dependent data when collections change
  useEffect(() => {
    if (collections.length > 0) {
      loadLowPerformingProducts();
      loadCategoryDistribution();
    }
  }, [collections]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load main data
      await loadStats();
      await loadTopProducts();
      loadRecentActivity();
      loadUnreadCount();
      
      // Load chart data
      await loadChartData();
      await loadCollectionPerformanceData();
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err.message || 'Failed to load dashboard data');
      setLoading(false);
    }
  };

  const loadChartData = async () => {
    try {
      const data = await getChartData();
      setChartData(data);
    } catch (error) {
      console.error('Error loading chart data:', error);
      setChartData([]);
    }
  };

  const loadCollectionPerformanceData = async () => {
    try {
      const data = await getCollectionPerformance();
      setCollectionPerformance(data);
    } catch (error) {
      console.error('Error loading collection performance:', error);
      setCollectionPerformance([]);
    }
  };

  const loadLowPerformingProducts = () => {
    try {
      const data = getLowPerformingProducts();
      setLowPerformingProducts(data);
    } catch (error) {
      console.error('Error loading low performing products:', error);
      setLowPerformingProducts([]);
    }
  };

  const loadCategoryDistribution = () => {
    try {
      const data = getCategoryDistribution();
      setCategoryDistribution(data);
    } catch (error) {
      console.error('Error loading category distribution:', error);
      setCategoryDistribution([]);
    }
  };

  const loadUnreadCount = () => {
    setUnreadCount(getUnreadCount());
  };

  const loadStats = async () => {
    try {
      console.log('Loading collections...');
      const cols = await getCollections();
      console.log('Collections loaded:', cols);
      setCollections(cols);
      
      console.log('Loading page views...');
      const pageViews = await getPageViews();
      console.log('Page views loaded:', pageViews);
      
      // Calculate total products and clicks from all collections
      let totalProducts = 0;
      let totalClicks = 0;
      
      cols.forEach(collection => {
        if (collection.products && Array.isArray(collection.products)) {
          totalProducts += collection.products.length;
          collection.products.forEach(product => {
            totalClicks += (product.clicks || 0);
          });
        }
      });

      // Calculate average CTR
      const avgCTR = totalProducts > 0 ? ((totalClicks / totalProducts) * 100).toFixed(2) : 0;
      
      setStats({
        totalProducts: totalProducts,
        totalClicks: totalClicks,
        avgCTR: avgCTR,
        pageViews: pageViews
      });
      
      console.log('Stats loaded successfully');
    } catch (error) {
      console.error('Error loading stats:', error);
      throw error; // Re-throw to be caught by loadAllData
    }
  };

  const loadRecentActivity = () => {
    const activities = getRecentActivity();
    setRecentActivity(activities.slice(0, 10));
  };

  const loadTopProducts = async () => {
    try {
      const collections = await getCollections();
      
      // Collect all products from all collections
      let allProducts = [];
      collections.forEach(collection => {
        if (collection.products && Array.isArray(collection.products)) {
          collection.products.forEach(product => {
            allProducts.push({
              ...product,
              collectionName: collection.name
            });
          });
        }
      });
      
      // Sort by clicks and get top 10
      const sorted = allProducts.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
      setTopProducts(sorted.slice(0, 10));
    } catch (error) {
      console.error('Error loading top products:', error);
    }
  };

  const getChartData = async () => {
    const clickHistory = await getClickHistory();
    const now = new Date();
    
    if (timeRange === 'day') {
      // Last 24 hours
      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        label: `${i}:00`,
        value: 0
      }));
      
      clickHistory.forEach(click => {
        const clickDate = new Date(click.timestamp);
        const hoursDiff = Math.floor((now - clickDate) / (1000 * 60 * 60));
        if (hoursDiff < 24) {
          const hour = clickDate.getHours();
          hourlyData[hour].value++;
        }
      });
      
      return hourlyData;
    } else if (timeRange === 'week') {
      // Last 7 days
      const weekData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
        label: day,
        value: 0,
        dayIndex: i
      }));
      
      clickHistory.forEach(click => {
        const clickDate = new Date(click.timestamp);
        const daysDiff = Math.floor((now - clickDate) / (1000 * 60 * 60 * 24));
        if (daysDiff < 7) {
          const dayOfWeek = clickDate.getDay();
          const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday=0 to Sunday=6
          weekData[adjustedDay].value++;
        }
      });
      
      return weekData;
    } else {
      // Last 30 days
      const monthData = Array.from({ length: 30 }, (_, i) => ({
        label: `${i + 1}`,
        value: 0
      }));
      
      clickHistory.forEach(click => {
        const clickDate = new Date(click.timestamp);
        const daysDiff = Math.floor((now - clickDate) / (1000 * 60 * 60 * 24));
        if (daysDiff < 30) {
          const dayOfMonth = 29 - daysDiff; // Reverse order so most recent is on right
          if (dayOfMonth >= 0 && dayOfMonth < 30) {
            monthData[dayOfMonth].value++;
          }
        }
      });
      
      return monthData;
    }
  };

  // Get low performing products (clicks < 5 and older than 7 days)
  const getLowPerformingProducts = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    let lowPerformers = [];
    collections.forEach(collection => {
      if (collection.products && Array.isArray(collection.products)) {
        collection.products.forEach(product => {
          const createdAt = new Date(product.createdAt);
          const clicks = product.clicks || 0;
          
          if (createdAt < sevenDaysAgo && clicks < 5) {
            lowPerformers.push({
              ...product,
              collectionName: collection.name,
              collectionId: collection.id,
              daysOld: Math.floor((new Date() - createdAt) / (1000 * 60 * 60 * 24))
            });
          }
        });
      }
    });
    
    return lowPerformers.sort((a, b) => a.clicks - b.clicks).slice(0, 5);
  };

  // Get category distribution
  const getCategoryDistribution = () => {
    const categoryMap = {};
    let totalProducts = 0;
    
    collections.forEach(collection => {
      if (collection.products && Array.isArray(collection.products)) {
        collection.products.forEach(product => {
          const category = product.category || 'Uncategorized';
          categoryMap[category] = (categoryMap[category] || 0) + 1;
          totalProducts++;
        });
      }
    });
    
    return Object.entries(categoryMap)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalProducts > 0 ? ((count / totalProducts) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  // Get collection performance data with real growth calculation
  const getCollectionPerformance = async () => {
    const clickHistory = await getClickHistory();
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    return collections.map(collection => {
      const products = Array.isArray(collection.products) ? collection.products : [];
      const totalClicks = products.reduce((sum, p) => sum + (p.clicks || 0), 0);
      
      // Calculate clicks for last 7 days (current period)
      const currentPeriodClicks = clickHistory.filter(click => {
        const clickDate = new Date(click.timestamp);
        return click.collectionId === collection.id && clickDate >= sevenDaysAgo && clickDate <= now;
      }).length;
      
      // Calculate clicks for previous 7 days (7-14 days ago)
      const previousPeriodClicks = clickHistory.filter(click => {
        const clickDate = new Date(click.timestamp);
        return click.collectionId === collection.id && clickDate >= fourteenDaysAgo && clickDate < sevenDaysAgo;
      }).length;
      
      // Calculate average clicks per day (last 7 days)
      const avgClicksPerDay = products.length > 0 ? (currentPeriodClicks / 7).toFixed(1) : 0;
      
      // Calculate total views from real collection view tracking
      const totalViews = getCollectionViewCount(collection.id);
      
      // Calculate growth percentage
      let growth = 0;
      if (previousPeriodClicks > 0) {
        growth = Math.round(((currentPeriodClicks - previousPeriodClicks) / previousPeriodClicks) * 100);
      } else if (currentPeriodClicks > 0) {
        growth = 100; // If no previous data but has current clicks, show 100% growth
      }
      
      return {
        id: collection.id,
        name: collection.name,
        productCount: products.length,
        totalClicks,
        totalViews,
        avgClicksPerDay,
        growth
      };
    }).sort((a, b) => b.totalClicks - a.totalClicks);
  };



  const formatFullDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('id-ID', { 
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    });
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case 'product_click':
        return (
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </div>
        );
      case 'product_added':
        return (
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        );
      case 'product_updated':
        return (
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        );
      case 'product_deleted':
        return (
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar productCount={0} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar productCount={0} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={loadAllData}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar productCount={stats.totalProducts} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
          <div className="flex items-center justify-between">
            {currentView === 'all-products' ? (
              <>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Back to Dashboard"
                  >
                    <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">All Products Performance</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Showing {Math.min(currentPage * ITEMS_PER_PAGE, topProducts.length)} of {topProducts.length} products sorted by clicks
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Dashboard</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back to your dashboard</p>
              </div>
            )}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowNotifications(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative"
                title="Notifications"
              >
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
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

        {/* Dashboard Content */}
        {currentView === 'dashboard' && (
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Clicks</h3>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{stats.totalClicks.toLocaleString()}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">+12.5% from last period</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Products</h3>
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{stats.totalProducts}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Across all collections</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg CTR</h3>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{stats.avgCTR}%</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">+3.2% from last period</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Page Views</h3>
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{stats.pageViews.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Total page visits</p>
            </div>
          </div>

          {/* Quick Actions Panel & Low Performing Products */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Quick Actions Panel */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {/* Add New Product with Dropdown */}
                <div 
                  className="relative"
                  onMouseEnter={() => {
                    if (addProductMenuTimeoutRef.current) {
                      clearTimeout(addProductMenuTimeoutRef.current);
                      addProductMenuTimeoutRef.current = null;
                    }
                  }}
                  onMouseLeave={() => {
                    addProductMenuTimeoutRef.current = setTimeout(() => {
                      setShowAddProductMenu(false);
                    }, 500);
                  }}
                >
                  <button
                    onClick={() => {
                      setShowAddProductMenu(!showAddProductMenu);
                      setShowImportMenu(false);
                      if (addProductMenuTimeoutRef.current) {
                        clearTimeout(addProductMenuTimeoutRef.current);
                        addProductMenuTimeoutRef.current = null;
                      }
                    }}
                    className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-3 text-left transition-colors flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="font-medium">Add New Product</span>
                    <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showAddProductMenu && collections.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 max-h-60 overflow-y-auto">
                      {collections.map(collection => (
                        <button
                          key={collection.id}
                          onClick={() => {
                            navigate(`/collections/${collection.id}/add`);
                            setShowAddProductMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          {collection.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Import Products with Nested Dropdown */}
                <div 
                  className="relative"
                  onMouseEnter={() => {
                    if (importMenuTimeoutRef.current) {
                      clearTimeout(importMenuTimeoutRef.current);
                      importMenuTimeoutRef.current = null;
                    }
                  }}
                  onMouseLeave={() => {
                    importMenuTimeoutRef.current = setTimeout(() => {
                      setShowImportMenu(false);
                      setHoveredCollection(null);
                    }, 500);
                  }}
                >
                  <button
                    onClick={() => {
                      setShowImportMenu(!showImportMenu);
                      setShowAddProductMenu(false);
                      if (importMenuTimeoutRef.current) {
                        clearTimeout(importMenuTimeoutRef.current);
                        importMenuTimeoutRef.current = null;
                      }
                    }}
                    className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-3 text-left transition-colors flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="font-medium">Import Products</span>
                    <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {showImportMenu && collections.length > 0 && (
                    <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-[100] min-w-[200px] max-h-60 overflow-visible">
                      {collections.map(collection => (
                        <div
                          key={collection.id}
                          className="relative"
                          onMouseEnter={() => {
                            if (submenuTimeoutRef.current) {
                              clearTimeout(submenuTimeoutRef.current);
                              submenuTimeoutRef.current = null;
                            }
                            submenuTimeoutRef.current = setTimeout(() => {
                              setHoveredCollection(collection.id);
                            }, 500);
                          }}
                          onMouseLeave={() => {
                            if (submenuTimeoutRef.current) {
                              clearTimeout(submenuTimeoutRef.current);
                              submenuTimeoutRef.current = null;
                            }
                            submenuTimeoutRef.current = setTimeout(() => {
                              setHoveredCollection(null);
                            }, 500);
                          }}
                        >
                          <div className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer flex items-center justify-between">
                            <span>{collection.name}</span>
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                          
                          {hoveredCollection === collection.id && (
                            <div 
                              className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 py-2 min-w-[160px] z-[110]"
                              style={{
                                left: 'calc(100% + 8px)',
                                top: '0',
                                position: 'absolute'
                              }}
                              onMouseEnter={() => {
                                if (submenuTimeoutRef.current) {
                                  clearTimeout(submenuTimeoutRef.current);
                                  submenuTimeoutRef.current = null;
                                }
                              }}
                              onMouseLeave={() => {
                                if (submenuTimeoutRef.current) {
                                  clearTimeout(submenuTimeoutRef.current);
                                  submenuTimeoutRef.current = null;
                                }
                                submenuTimeoutRef.current = setTimeout(() => {
                                  setHoveredCollection(null);
                                }, 500);
                              }}
                            >
                              <button
                                onClick={() => {
                                  navigate(`/collections/${collection.id}/products`, { state: { openImport: true, importMode: 'replace' } });
                                  setShowImportMenu(false);
                                  setHoveredCollection(null);
                                }}
                                className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
                              >
                                Replace All
                              </button>
                              <button
                                onClick={() => {
                                  navigate(`/collections/${collection.id}/products`, { state: { openImport: true, importMode: 'new' } });
                                  setShowImportMenu(false);
                                  setHoveredCollection(null);
                                }}
                                className="w-full px-4 py-2 text-left text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
                              >
                                Add New
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* View Analytics - Scroll to Chart */}
                <button
                  onClick={() => {
                    if (clicksPerformanceRef.current) {
                      clicksPerformanceRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-3 text-left transition-colors flex items-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="font-medium">View Analytics</span>
                </button>

                {/* Manage Collections */}
                <button
                  onClick={() => navigate('/collections')}
                  className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-3 text-left transition-colors flex items-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="font-medium">Manage Collections</span>
                </button>
              </div>
            </div>

            {/* Collection Performance Table */}
            <div className="md:col-span-1 lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Collection Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase pb-3">Collection</th>
                      <th className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase pb-3">Products</th>
                      <th className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase pb-3">Views</th>
                      <th className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase pb-3">Clicks</th>
                      <th className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase pb-3">Avg/Day</th>
                      <th className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase pb-3">Growth</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {collectionPerformance.map((collection) => (
                      <tr key={collection.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="py-3">
                          <p className="font-medium text-gray-800 dark:text-gray-200">{collection.name}</p>
                        </td>
                        <td className="py-3 text-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{collection.productCount}</span>
                        </td>
                        <td className="py-3 text-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{collection.totalViews.toLocaleString()}</span>
                        </td>
                        <td className="py-3 text-center">
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{collection.totalClicks.toLocaleString()}</span>
                        </td>
                        <td className="py-3 text-center">
                          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{collection.avgClicksPerDay}</span>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`inline-flex items-center gap-1 text-sm font-semibold ${
                            collection.growth > 0 ? 'text-green-600 dark:text-green-400' : 
                            collection.growth < 0 ? 'text-red-600 dark:text-red-400' : 
                            'text-gray-600 dark:text-gray-400'
                          }`}>
                            {collection.growth > 0 ? '↑' : collection.growth < 0 ? '↓' : '='} {Math.abs(collection.growth)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Low Performing Products & Category Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Low Performing Products Alert */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Low Performing Products</h3>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Need attention</span>
              </div>
              {lowPerformingProducts.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-gray-600 dark:text-gray-400">All products are performing well!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {lowPerformingProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {product.clicks} clicks • {product.daysOld} days old • {product.collectionName}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/collections/${product.collectionId}/edit/${product.id}`)}
                        className="ml-4 px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Optimize
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Category Distribution</h3>
              <div className="space-y-4">
                {categoryDistribution.map((category, index) => (
                  <div key={category.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{category.name}</span>
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{category.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === 0 ? 'bg-gradient-to-r from-blue-600 to-blue-400' :
                          index === 1 ? 'bg-gradient-to-r from-purple-600 to-purple-400' :
                          index === 2 ? 'bg-gradient-to-r from-green-600 to-green-400' :
                          index === 3 ? 'bg-gradient-to-r from-orange-600 to-orange-400' :
                          'bg-gradient-to-r from-pink-600 to-pink-400'
                        }`}
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{category.count} products</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Clicks Performance Chart */}
          <div ref={clicksPerformanceRef} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Clicks Performance</h3>
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setTimeRange('day')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === 'day'
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  Day
                </button>
                <button
                  onClick={() => setTimeRange('week')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === 'week'
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setTimeRange('month')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === 'month'
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  Month
                </button>
              </div>
            </div>

            {/* Simple Bar Chart */}
            <div className="h-64 flex items-end justify-between gap-2">
              {chartData.map((data, index) => {
                const maxValue = Math.max(...chartData.map(d => d.value), 1);
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-t-lg relative group">
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-500"
                        style={{ height: `${(data.value / maxValue) * 200}px` }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {data.value} clicks
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{data.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Products and CTR by Collection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Performing Products */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Top Performing Products</h3>
                <button
                  onClick={() => {
                    setCurrentView('all-products');
                    setCurrentPage(1);
                  }}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {topProducts.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No products yet</p>
                ) : (
                  topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base ${
                        index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500' :
                        index === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' :
                        index === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-500' :
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{product.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{product.collectionName || 'Uncategorized'}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">#{product.id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                          </svg>
                          <span className="text-lg font-bold text-gray-800 dark:text-gray-200">{product.clicks || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* CTR by Collection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">CTR by Collection</h3>
              <div className="space-y-4">
                {collections.map(col => {
                  const products = getCollectionProducts(col.id);
                  const totalClicks = products.reduce((sum, p) => sum + (p.clicks || 0), 0);
                  const ctr = products.length > 0 ? ((totalClicks / products.length) * 100).toFixed(1) : 0;
                  const percentage = stats.totalClicks > 0 ? (totalClicks / stats.totalClicks) * 100 : 0;

                  return (
                    <div key={col.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{col.name}</span>
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{ctr}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{totalClicks} clicks • {products.length} products</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Recent Activity</h3>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View all</button>
            </div>
            
            {recentActivity.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 dark:text-gray-200">{activity.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{activity.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs text-gray-500 dark:text-gray-400 block whitespace-nowrap">{formatFullDateTime(activity.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}

        {/* All Products Content */}
        {currentView === 'all-products' && (
        <div className="p-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="space-y-3">
              {topProducts
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map((product, index) => {
                  const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
                  return (
                    <div key={product.id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                        globalIndex === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500' :
                        globalIndex === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' :
                        globalIndex === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-500' :
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      }`}>
                        {globalIndex + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 dark:text-gray-200 truncate text-lg">{product.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {product.collectionName || 'Uncategorized'} - {product.category || 'No Category'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <span className="text-base font-bold text-blue-600 dark:text-blue-400">#{product.id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                          </svg>
                          <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">{product.clicks || 0}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Pagination */}
            {topProducts.length > ITEMS_PER_PAGE && (
              <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    currentPage === 1
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page <span className="font-bold text-gray-800 dark:text-gray-200">{currentPage}</span> of{' '}
                  <span className="font-bold text-gray-800 dark:text-gray-200">{Math.ceil(topProducts.length / ITEMS_PER_PAGE)}</span>
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(topProducts.length / ITEMS_PER_PAGE), prev + 1))}
                  disabled={currentPage >= Math.ceil(topProducts.length / ITEMS_PER_PAGE)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    currentPage >= Math.ceil(topProducts.length / ITEMS_PER_PAGE)
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Next
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
        )}
      </main>

      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={showNotifications} 
        onClose={() => {
          setShowNotifications(false);
          loadUnreadCount();
        }} 
      />
    </div>
  );
}
