import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getAllProductsFromSupabase } from '../../utils/productService';
import { Product } from '../../types/types';
import Layout from '../../components/layout/Layout';
import { useCart } from '../../context/CartContext';
import { Heart, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SearchResultsPage = () => {
  const location = useLocation();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Utiliser une clé locale unique par utilisateur
  const LOCAL_STORAGE_KEY = user ? `likedProducts_${user.id}` : 'likedProducts_guest';

  // Initialiser likes depuis localStorage
  const [likedProducts, setLikedProducts] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sauvegarder likes dans localStorage quand ça change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(likedProducts));
    } catch {
      // ignore
    }
  }, [likedProducts, LOCAL_STORAGE_KEY]);

  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get('search')?.toLowerCase() || '';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const allProducts = await getAllProductsFromSupabase();
        const filtered = allProducts.filter(product =>
          product.title.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm)
        );
        setResults(filtered);
      } catch (error) {
        console.error('Erreur lors du chargement des produits :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm]);

  const addToCart = (product: Product) => {
    const adaptedProduct: Product = {
      ...product,
      images: product.images || product.images_urls || [],
      sellerId: (product as any).sellerId || (product as any).seller_id || null,
    };

    if (!adaptedProduct.sellerId) {
      console.error("Produit sans sellerId, impossible d'ajouter au panier");
      return;
    }

    addItem(adaptedProduct, 1);
  };

  const toggleLike = (productId: string) => {
    setLikedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Afficher les résultats dans l'ordre d'origine, sans tri immédiat après un like
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Résultats pour "{searchTerm}"</h1>

        {loading ? (
          <p className="text-gray-500 text-center">Chargement...</p>
        ) : results.length === 0 ? (
          <p className="text-gray-500 text-center">Aucun produit trouvé.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map(product => (
              <div
                key={product.id}
                className="relative group border rounded-xl shadow hover:shadow-lg transition bg-white"
              >
                {/* Icône j’aime */}
                <button
                  onClick={() => toggleLike(product.id)}
                  className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white shadow"
                >
                  <Heart
                    size={20}
                    className={`transition ${
                      likedProducts.includes(product.id)
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-400'
                    }`}
                  />
                </button>

                {/* Image carousel */}
                <div className="w-full aspect-w-1 aspect-h-1 overflow-hidden rounded-t-xl relative">
                  <div className="flex overflow-x-auto snap-x snap-mandatory h-full">
                    {(product.images || product.images_urls || []).map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`${product.title} ${index + 1}`}
                        className="snap-center flex-shrink-0 w-full h-full object-cover"
                        style={{ minWidth: '100%' }}
                      />
                    ))}
                  </div>
                </div>

                {/* Infos produit */}
                <div className="p-4">
                  <h2 className="font-semibold text-lg truncate">{product.title}</h2>

                  {/* Étoiles */}
                  <div className="flex items-center mb-1">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={i < Math.floor(product.rating || 0) ? 'currentColor' : 'none'}
                          className={i < Math.floor(product.rating || 0) ? '' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      ({product.reviewCount || 0})
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                    {product.description}
                  </p>
                  <p className="font-bold text-primary text-lg mb-3">
                    {product.price} FCFA
                  </p>

                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark transition"
                  >
                    Ajouter au panier
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchResultsPage;
