import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../hooks/useDarkMode';
import Sidebar from '../components/Sidebar';
import { getCollections, getCollectionProducts } from '../utils/collections';
import { getClickHistory } from '../utils/analytics';

export default function Analytics() {
  const [isDark, toggleDarkMode] = useDarkMode();
  const [timeRange, setTimeRange] = useState('week'); // 'day', 'week', 'month'
  const [collections, setCollections] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [clicksData, setClicksData] = useState([]);
  const [stats, setStats] = useState({
    totalClicks: 0,
    totalProducts: 0,
    avgCTR: 0,
    estimatedRevenue: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = () => {
    const cols = getCollections();
    setCollections(cols);

    // Aggregate all products from all collections
    let allProducts = [];
    cols.forEach(col => {
      const products = getCollectionProducts(col.id);
      allProducts = [...allProducts, ...products.map(p => ({ ...p, collectionName: col.name }))];
    });

    // Calculate stats
    const totalClicks = allProducts.reduce((sum, p) => sum + (p.clicks || 0), 0);
    const totalProducts = allProducts.length;
    const avgCTR = totalProducts > 0 ? ((totalClicks / totalProducts) * 100).toFixed(2) : 0;
    const estimatedRevenue = (totalClicks * 0.5).toFixed(2); // Assume $0.5 per click

    setStats({
      totalClicks,
      totalProducts,
      avgCTR,
      estimatedRevenue
    });

    // Top 10 products by clicks
    const sorted = [...allProducts].sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
    setTopProducts(sorted.slice(0, 10));

    // Generate clicks data for chart (mock data for now)
    const history = getClickHistory(timeRange);
    setClicksData(history);
  };

  const getChartData = () => {
    if (timeRange === 'day') {
      return Array.from({ length: 24 }, (_, i) => ({
        label: `${i}:00`,
        value: Math.floor(Math.random() * 50)
      }));
    } else if (timeRange === 'week') {
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
        label: day,
        value: Math.floor(Math.random() * 200)
      }));
    } else {
      return Array.from({ length: 30 }, (_, i) => ({
        label: `${i + 1}`,
        value: Math.floor(Math.random() * 300)
      }));
    }
  };

  const chartData = getChartData();
  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Analytics</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your performance and insights</p>
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
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

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
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

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
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

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Est. Revenue</h3>
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">${stats.estimatedRevenue}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Based on avg commission</p>
            </div>
          </div>

          {/* Clicks Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
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
              {chartData.map((data, index) => (
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
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Products */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Top Performing Products</h3>
              <div className="space-y-3">
                {topProducts.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No products yet</p>
                ) : (
                  topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-yellow-100 text-yellow-600' :
                        index === 1 ? 'bg-gray-100 text-gray-600' :
                        index === 2 ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{product.collectionName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800 dark:text-gray-200">{product.clicks || 0}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">clicks</p>
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
        </div>
      </main>
    </div>
  );
}
