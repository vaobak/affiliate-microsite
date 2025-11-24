import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Collections from './pages/Collections';
import CollectionProducts from './pages/CollectionProducts';
import AddCollectionProduct from './pages/AddCollectionProduct';
import EditCollectionProduct from './pages/EditCollectionProduct';
import ProtectedRoute from './components/ProtectedRoute';
import { migrateOldProducts } from './utils/collections';

// Lazy load Settings to avoid build issues
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  useEffect(() => {
    // Migrate old products on first load
    const migrated = migrateOldProducts();
    if (migrated) {
      console.log('Old products migrated to default collection');
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:collection" element={<Home />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collections"
          element={
            <ProtectedRoute>
              <Collections />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collections/:collectionId/products"
          element={
            <ProtectedRoute>
              <CollectionProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collections/:collectionId/add"
          element={
            <ProtectedRoute>
              <AddCollectionProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collections/:collectionId/edit/:productId"
          element={
            <ProtectedRoute>
              <EditCollectionProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
                <Settings />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
