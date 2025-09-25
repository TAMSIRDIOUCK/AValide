import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Product } from '../../types/types';
import { formatPrice } from '../../utils/formatters';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const FeaturedProducts: React.FC = () => {
  const { addItem, cartItems } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const LOCAL_STORAGE_KEY = user ? `likedProducts_${user.id}` : 'likedProducts_guest';

  const [likedProducts, setLikedProducts] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(likedProducts));
    } catch {}
  }, [likedProducts, LOCAL_STORAGE_KEY]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération produits:', error.message);
      } else {
        const adapted: Product[] = (data || []).map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          price: p.price,
          images: p.images_urls || [],
          rating: p.rating || 0,
          reviewCount: p.review_count || 0,
          createdAt: p.created_at,
          category: p.category || '',
          sellerId: p.seller_id,
          stock: p.stock || 0,
          category_id: p.category_id,
          likes: p.likes || 0,
        }));

        setProducts(adapted);
      }

      setLoading(false);
    };

    fetchProducts();
  }, []);

  const toggleLike = (productId: string) => {
    setLikedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const isAlreadyInCart = (productId: string) => {
    return cartItems.some((item) => item.product.id === productId);
  };

  return (
    <section className="py-16 bg-gray-50">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .dot-indicators {
          display: flex;
          justify-content: center;
          gap: 4px;
          margin-top: 6px;
        }
        .dot-indicator {
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background-color: #d1d5db;
        }
      `}</style>

      <div className="container-custom px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Produits en Vedette</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez les derniers produits ajoutés par nos vendeurs.
          </p>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Chargement des produits...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500">Aucun produit disponible pour le moment.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const inCart = isAlreadyInCart(product.id);

              return (
                <div
                  key={product.id}
                  className="relative group border rounded-xl shadow hover:shadow-lg transition bg-white"
                >
                  {/* Like */}
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

                  {/* Images */}
                  <div className="w-full aspect-w-1 aspect-h-1 overflow-hidden rounded-lg">
                    <div className="flex overflow-x-auto snap-x snap-mandatory h-full scroll-smooth scrollbar-hide">
                      {product.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`${product.title} ${idx + 1}`}
                          className="snap-center flex-shrink-0 w-full h-full object-cover"
                          style={{ minWidth: '100%' }}
                        />
                      ))}
                    </div>

                    {product.images.length > 1 && (
                      <div className="dot-indicators absolute bottom-2 left-1/2 -translate-x-1/2">
                        {product.images.map((_, i) => (
                          <div key={i} className="dot-indicator"></div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Infos produit */}
                  <div className="p-4">
                    <Link to={`/products/${product.id}`} className="block">
                      <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors truncate">
                        {product.title}
                      </h3>
                    </Link>

                    <div className="flex items-center mb-2 text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill="currentColor" />
                      ))}
                    </div>

                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                    <p className="font-bold text-lg text-primary mb-3">
                      {formatPrice(product.price)}
                    </p>

                    <button
                      onClick={() => addItem(product)}
                      className={`w-full py-2 rounded transition ${
                        inCart
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-primary text-white hover:bg-primary-dark'
                      }`}
                      disabled={inCart}
                    >
                      {inCart ? 'Déjà dans le panier' : 'Ajouter au panier'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
