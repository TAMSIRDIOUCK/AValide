import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import {
  Package, Plus, Edit, Trash2, AlertCircle, MessageSquare,
} from 'lucide-react';
import { formatPrice } from '../../utils/formatters';
import { deleteProduct } from '../../utils/productService';
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
  const [showModal, setShowModal] = useState(false); // ✅ Ajout pour l'alerte

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchData();
  }, [user, selectedPeriod]);

  const fetchData = async () => {
    if (!user?.id) return;

    const { data: productsData, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (productError) {
      console.error('❌ Erreur récupération produits :', productError.message);
      return;
    }

    setProducts(productsData || []);

    const items = await getOrderItemsBySeller(user.id);

    const now = new Date();
    const ordersMap = new Map<string, any[]>();
    let total = 0;
    let count = 0;
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

    count = ordersMap.size;
    setOrderStats({ count, total });
    setTodayOrdersCount(todayCount);
  };

  const isInPeriod = (date: Date, period: Period) => {
    const now = new Date();
    switch (period) {
      case 'today':
        return date.toDateString() === now.toDateString();
      case 'week': {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        return date >= startOfWeek && date <= now;
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
    if (selectedProductId) {
      const { error } = await deleteProduct(selectedProductId);
      if (error) {
        console.error("❌ Erreur lors de la suppression :", error.message);
      } else {
        setProducts((prev) => prev.filter((p) => p.id !== selectedProductId));
      }
      setShowDeleteModal(false);
      setSelectedProductId(null);
    }
  };

  const handleAddProductClick = () => {
    if (!user) return;

    if (user.can_sell) {
      navigate('/seller/products/add');
    } else {
      setShowModal(true);
    }
  };

  return (
    <Layout>
      <div className="container-custom py-16">
        {/* FILTRES */}
        <div className="mb-4 flex flex-wrap justify-between items-center">
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
            <span>Total : <span className="text-green-600 font-bold">{formatPrice(orderStats.total)} </span></span>
          </div>
        </div>

        {/* EN-TÊTE */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package /> Tableau de bord vendeur
          </h1>
          <div className="flex items-center gap-4">
            <Link to="/orders" className="relative w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow hover:bg-primary-dark transition">
              <MessageSquare size={20} />
              <span className={`absolute -top-1 -right-1 text-xs font-bold rounded-full px-1 ${
                todayOrdersCount > 0 ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-700'
              }`}>
                {todayOrdersCount}
              </span>
            </Link>
            <button
              onClick={handleAddProductClick}
              className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-full flex items-center gap-2 shadow-md transition"
            >
              <Plus size={20} /> Ajouter un produit
            </button>
          </div>
        </div>

        {/* PRODUITS */}
        {products.length === 0 ? (
          <div className="text-center bg-white p-8 rounded shadow">
            <Package size={48} className="mx-auto mb-4 text-primary" />
            <p className="text-lg font-semibold mb-2">Aucun produit</p>
            <p className="text-gray-500 mb-4">Ajoutez un produit pour commencer à vendre.</p>
            <button onClick={handleAddProductClick} className="btn-primary">Ajouter un produit</button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3">Produit</th>
                  <th className="text-left px-6 py-3">Catégorie</th>
                  <th className="text-left px-6 py-3">Prix</th>
                  <th className="text-left px-6 py-3">Stock</th>
                  <th className="text-right px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 flex items-center">
                      <img src={product.images_urls?.[0] || ''} className="w-10 h-10 object-cover rounded mr-3" />
                      <span>{product.title}</span>
                    </td>
                    <td className="px-6 py-4">{product.category}</td>
                    <td className="px-6 py-4">{formatPrice(product.price)} FCFA</td>
                    <td className="px-6 py-4">{product.stock}</td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/seller/products/edit/${product.id}`} className="text-primary mr-3">
                        <Edit size={18} />
                      </Link>
                      <button onClick={() => handleDelete(product.id)} className="text-red-600">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MODAL DE SUPPRESSION */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <AlertCircle size={24} className="text-error mr-2" />
                <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
              </p>
              <div className="flex justify-end space-x-3">
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

        {/* MODAL DE RESTRICTION DE VENTE */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-sm">
              <p className="text-lg font-semibold mb-4">
                Pour vendre sur AValide, veuillez contacter l’équipe.
              </p>
              <div className="flex justify-end gap-3">
                <a
                  href="https://wa.me/221704776258"
                  target="_blank"
                  className="btn bg-green-600 text-white"
                >
                  Contacter via WhatsApp
                </a>
                <button
                  onClick={() => setShowModal(false)}
                  className="btn bg-gray-300 text-black"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SellerDashboardPage;
