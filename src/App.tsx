import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useAuth } from "./context/AuthContext";
import {
  registerServiceWorker,
  requestNotificationPermission,
  getFcmToken,
  listenForegroundNotifications
} from "./lib/firebaseMessaging"; // Assurez-vous que ces 2 fonctions sont exportées

// --- Components & Pages ---
import Header from "./components/layout/Header";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import SellerDashboardPage from "./pages/seller/SellerDashboardPage";
import AddProductPage from "./pages/seller/AddProductPage";
import EditProductPage from "./pages/seller/EditProductPage";
import CategoryPage from "./pages/categories/CategoryPage";
import SearchResultsPage from "./pages/categories/SearchResultsPage";
import MyOrdersPage from "./pages/account/MyOrdersPage";
import FaqPage from "./pages/FaqPage";
import ShippingPage from "./pages/ShippingPage";
import ReturnsPage from "./pages/ReturnsPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import AddServicePage from "./pages/seller/AddServicePage";
import ServiceDetailPage from "./pages/services/ServiceDetailPage";
import ProductDetailPageWrapper from "./pages/products/ProductDetailPageWrapper";

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

// --- Composant principal App ---
const App: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    const initFirebase = async () => {
      try {
        // 1️⃣ Enregistrer le service worker
        await registerServiceWorker();

        // 2️⃣ Demander la permission notifications (Android / Desktop)
        const permissionGranted = await requestNotificationPermission();
        if (!permissionGranted) {
          console.warn("[FCM] L'utilisateur n'a pas autorisé les notifications");
          return;
        }

        // 3️⃣ Récupérer le token FCM et envoyer au serveur
        const token = await getFcmToken();
        if (token) {
          console.log("[FCM] Token récupéré :", token);
          // Ici tu peux l'envoyer à ton backend
        }

        // 4️⃣ Écoute notifications en premier plan (Android / Desktop)
        listenForegroundNotifications();
      } catch (err) {
        console.error("[FCM] Erreur initialisation Firebase :", err);
      }
    };

    initFirebase();
  }, [user]);

  return (
    <>
      <Helmet>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#4f46e5" />
        <title>AValide - Marketplace Sénégal</title>
      </Helmet>

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