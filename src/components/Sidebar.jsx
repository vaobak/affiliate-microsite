import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../utils/auth';
import { getCollections } from '../utils/collections';

export default function Sidebar({ productCount = 0 }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [collections, setCollections] = useState([]);
  const [showCollections, setShowCollections] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const cols = await getCollections();
        setCollections(Array.isArray(cols) ? cols : []);
      } catch (error) {
        console.error('Error loading collections in sidebar:', error);
        setCollections([]);
      }
    };
    loadCollections();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin', { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className={`${
        isExpanded ? 'w-64' : 'w-20'
      } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          {isExpanded && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">Affiliate</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${
              isActive('/dashboard')
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            title={!isExpanded ? 'Dashboard' : ''}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {isExpanded && <span className="font-medium whitespace-nowrap">Dashboard</span>}
          </button>

          {/* Collections with Dropdown */}
          <div>
            <button
              onClick={() => setShowCollections(!showCollections)}
              className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${
                isActive('/collections')
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              title={!isExpanded ? 'Collections' : ''}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {isExpanded && (
                <>
                  <span className="font-medium whitespace-nowrap flex-1">Collections</span>
                  <svg className={`w-4 h-4 transition-transform ${showCollections ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
            
            {isExpanded && showCollections && (
              <div className="ml-4 mt-1 space-y-1">
                <button
                  onClick={() => navigate('/collections')}
                  className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Manage Collections
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                {collections.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => navigate(`/collections/${col.id}/products`)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {col.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Account Section */}
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          {isExpanded && (
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase mb-2">Account</p>
          )}
          <button
            onClick={() => navigate('/settings')}
            className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${
              isActive('/settings')
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            title={!isExpanded ? 'Settings' : ''}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {isExpanded && <span className="font-medium whitespace-nowrap">Settings</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title={!isExpanded ? 'Logout' : ''}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {isExpanded && <span className="font-medium whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </nav>
    </aside>
  );
}
