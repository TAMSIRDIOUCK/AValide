// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Header from './components/layout/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import SellerDashboardPage from './pages/seller/SellerDashboardPage';
import AddProductPage from './pages/seller/AddProductPage';
import EditProductPage from './pages/seller/EditProductPage';
import CategoryPage from './pages/categories/CategoryPage';
import SearchResultsPage from './pages/categories/SearchResultsPage';
import MyOrdersPage from './pages/account/MyOrdersPage';
import FaqPage from './pages/FaqPage';
import ShippingPage from './pages/ShippingPage';
import ReturnsPage from './pages/ReturnsPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';

// Composant de route protégée
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresSeller?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiresSeller = false }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiresSeller && user?.role !== 'seller') return <Navigate to="/" replace />;

  return <>{children}</>;
};

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/categories" element={<SearchResultsPage />} />
        <Route path="/category/:id" element={<CategoryPage />} />
        <Route path="/orders" element={<MyOrdersPage />} />
        <Route path="/faq" element={<FaqPage />} />
    <Route path="/shipping" element={<ShippingPage />} />
    <Route path="/returns" element={<ReturnsPage />} />
    <Route path="/terms" element={<TermsPage />} />
    <Route path="/privacy" element={<PrivacyPage />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success"
          element={
            <ProtectedRoute>
              <OrderSuccessPage />
            </ProtectedRoute>
          }
        />

        {/* Routes Vendeur */}
        <Route
          path="/seller/dashboard"
          element={
            <ProtectedRoute requiresSeller>
              <SellerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/products/add"
          element={
            <ProtectedRoute requiresSeller>
              <AddProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/products/edit/:id"
          element={
            <ProtectedRoute requiresSeller>
              <EditProductPage />
            </ProtectedRoute>
          }
        />

        {/* Redirection si route non trouvée */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
