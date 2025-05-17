
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Package, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';
import { deleteProduct } from '../../utils/productService';

interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  stock: number;
  images: string[];
  sellerId: string;
}

const SellerDashboardPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  useEffect(() => {
    const savedProducts = JSON.parse(localStorage.getItem('products') || '[]');

    // 🔑 Récupérer le sellerId dynamique
    const sellerId = localStorage.getItem('sellerId') || 'seller-123';

    // 🎯 Filtrer les produits du vendeur connecté
    const sellerProducts = savedProducts.filter((p: Product) => p.sellerId === sellerId);
    setProducts(sellerProducts);
  }, []);

  const handleDelete = (productId: string) => {
    setSelectedProductId(productId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedProductId) {
      deleteProduct(selectedProductId);
      setProducts(prev => prev.filter(product => product.id !== selectedProductId));
    }
    setShowDeleteModal(false);
    setSelectedProductId(null);
  };

  return (
    <Layout>
      <div className="container-custom py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Package size={24} className="text-primary mr-3" />
            <h1 className="text-2xl font-bold">Tableau de bord vendeur</h1>
          </div>
          <Link
  to="/seller/products/add"
  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-full shadow-lg transition-transform transform hover:scale-105 hover:from-green-600 hover:to-emerald-700"
>
  <Plus size={20} />
  Ajouter un produit
</Link>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-primary-light/10 rounded-full">
              <Package size={32} className="text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Aucun produit</h2>
            <p className="text-gray-600 mb-6">
              Commencez à vendre en ajoutant votre premier produit.
            </p>
            <Link to="/seller/products/add" className="btn-primary">
              Ajouter un produit
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-light/10 text-primary">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatPrice(product.price)} FCFA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/seller/products/edit/${product.id}`}
                          className="text-primary hover:text-primary-dark mr-3"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-error hover:text-error-dark"
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

      {/* Modal de confirmation de suppression */}
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
              <button
                onClick={confirmDelete}
                className="btn bg-error text-white hover:bg-error-dark focus:ring-error"
              >
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
