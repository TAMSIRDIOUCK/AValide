import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import {
  Package, Plus, Edit, Trash2, AlertCircle, MessageSquare,
} from 'lucide-react';
import { formatPrice } from '../../utils/formatters';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { getOrderItemsBySeller } from '../../utils/orderService';

interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  stock: number;
  images_urls: string[];
  seller_id: string;
  created_at?: string;
}

type Period = 'today' | 'week' | 'month' | 'year';

const SellerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [orderStats, setOrderStats] = useState({ count: 0, total: 0 });
  const [todayOrdersCount, setTodayOrdersCount] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('week');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Scroll automatique en haut
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Charger les produits du vendeur
  const fetchProducts = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur chargement produits :', error.message);
      return;
    }

    setProducts(data || []);
  };

  // Charger les commandes du vendeur
  const fetchOrders = async () => {
    if (!user?.id) return;

    try {
      const items = await getOrderItemsBySeller(user.id);
      if (!items || !Array.isArray(items)) return;

      const now = new Date();
      const ordersMap = new Map<string, any[]>();
      let total = 0;
      let todayCount = 0;

      items.forEach((item) => {
        const createdAt = new Date(item.created_at);
        const isToday = createdAt.toDateString() === now.toDateString();

        if (isToday) todayCount++;

        if (isInPeriod(createdAt, selectedPeriod)) {
          if (!ordersMap.has(item.order_id)) {
            ordersMap.set(item.order_id, []);
          }
          ordersMap.get(item.order_id)?.push(item);
          total += (item.price || 0) * (item.quantity || 0);
        }
      });

      setOrderStats({ count: ordersMap.size, total });
      setTodayOrdersCount(todayCount);
    } catch (error) {
      console.error('Erreur chargement commandes :', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, [user, selectedPeriod]);

  const isInPeriod = (date: Date, period: Period) => {
    const now = new Date();

    switch (period) {
      case 'today':
        return date.toDateString() === now.toDateString();
      case 'week': {
        const day = now.getDay();
        const start = new Date(now);
        start.setDate(now.getDate() - day);
        start.setHours(0, 0, 0, 0);
        return date >= start && date <= now;
      }
      case 'month':
        return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
      case 'year':
        return date.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  };

  const handleDelete = (productId: string) => {
    setSelectedProductId(productId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedProductId) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', selectedProductId);

    if (error) {
      alert("Erreur lors de la suppression.");
      console.error('Erreur suppression :', error.message);
      return;
    }

    setProducts((prev) => prev.filter((p) => p.id !== selectedProductId));
    setShowDeleteModal(false);
    setSelectedProductId(null);
  };

  const handleAddProductClick = () => {
    navigate('/seller/products/add');
  };

  return (
    <Layout>
      <div className="container-custom py-16">
        {/* Filtres de période */}
        <div className="mb-4 flex flex-wrap gap-4 justify-between items-center">
          <div className="flex gap-2 items-center">
            <label htmlFor="period" className="font-medium">Période :</label>
            <select
              id="period"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as Period)}
              className="border px-3 py-1 rounded-md text-sm"
            >
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois-ci</option>
              <option value="year">Cette année</option>
            </select>
          </div>
          <div className="flex gap-4 font-semibold">
            <span>Commandes : <span className="text-primary font-bold">{orderStats.count}</span></span>
            <span>Total : <span className="text-green-600 font-bold">{formatPrice(orderStats.total)} FCFA</span></span>
          </div>
        </div>

        {/* En-tête */}
        <div className="flex justify-between flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <div className="flex items-center">
            <Package size={24} className="text-primary mr-3" />
            <h1 className="text-2xl font-bold">Tableau de bord vendeur</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/orders"
              className="relative w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full hover:bg-primary-dark"
              title="Mes commandes"
            >
              <MessageSquare size={20} />
              {todayOrdersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 text-xs bg-error text-white w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {todayOrdersCount}
                </span>
              )}
            </Link>
            <button
              onClick={handleAddProductClick}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-medium shadow-lg hover:scale-105 transition"
            >
              <Plus size={20} />
              Ajouter un produit
            </button>
          </div>
        </div>

        {/* Produits */}
        {products.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-primary-light/10 rounded-full">
              <Package size={32} className="text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Aucun produit</h2>
            <p className="text-gray-600 mb-6">Commencez à vendre en ajoutant un produit.</p>
            <button onClick={handleAddProductClick} className="btn-primary">
              Ajouter un produit
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 flex items-center">
                        <img
                          src={product.images_urls?.[0] || '/placeholder.png'}
                          alt={product.title}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                        <span className="ml-4 text-sm font-medium text-gray-900">{product.title}</span>
                      </td>
                      <td className="px-6 py-4 text-sm">{product.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatPrice(product.price)} FCFA</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{product.stock}</td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/seller/products/edit/${product.id}`} className="text-primary hover:text-primary-dark mr-3">
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-error hover:text-error-dark"
                          aria-label={`Supprimer ${product.title}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertCircle size={24} className="text-error mr-2" />
              <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                Annuler
              </button>
              <button onClick={confirmDelete} className="btn bg-error text-white hover:bg-error-dark">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SellerDashboardPage;
