// src/App.tsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { registerServiceWorker, requestNotificationPermission } from "./lib/firebaseMessaging";
import { listenForegroundNotifications } from "./lib/firebase";

// --- Components & Pages ---
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
import AddServicePage from './pages/seller/AddServicePage';
import ServiceDetailPage from './pages/services/ServiceDetailPage';
import ProductDetailPageWrapper from './pages/products/ProductDetailPageWrapper';

// --- Composant route protégée ---
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Chargement...
      </div>
    );

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

const App: React.FC = () => {
  const { user } = useAuth(); // récupère l’utilisateur connecté

  useEffect(() => {
    const initFirebase = async () => {
      // 1️⃣ Enregistrer le service worker
      await registerServiceWorker();

      // 2️⃣ Demander la permission et enregistrer le token
      await requestNotificationPermission();

      // 3️⃣ Écoute des notifications en premier plan
      if ("Notification" in window && Notification.permission === "granted") {
        listenForegroundNotifications();
      }
    };

    initFirebase();
  }, [user]);

  return (
    <>
      <Header />
      <Routes>
        {/* Pages publiques */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/categories" element={<SearchResultsPage />} />
        <Route path="/category/:id" element={<CategoryPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/shipping" element={<ShippingPage />} />
        <Route path="/returns" element={<ReturnsPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/services/:id" element={<ServiceDetailPage />} />

        {/* Détail produit */}
        <Route path="/products/:id" element={<ProductDetailPageWrapper />} />

        {/* Achat accessible sans connexion */}
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />

        {/* Pages nécessitant une connexion */}
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <MyOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/dashboard"
          element={
            <ProtectedRoute>
              <SellerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/products/add"
          element={
            <ProtectedRoute>
              <AddProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/products/edit/:id"
          element={
            <ProtectedRoute>
              <EditProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/services/add"
          element={
            <ProtectedRoute>
              <AddServicePage />
            </ProtectedRoute>
          }
        />

        {/* Redirection si route non trouvée */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
