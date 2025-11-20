import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Product, ProductVariant } from '../../types/types';
import { formatPrice } from '../../utils/formatters';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const FeaturedProducts: React.FC = () => {
  const { addItem, cartItems } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('tous');

  // Clé locale pour les produits likés
  const LOCAL_STORAGE_KEY = user ? `likedProducts_${user.id}` : 'likedProducts_guest';
  const [likedProducts, setLikedProducts] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sauvegarder les likes dans localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(likedProducts));
  }, [likedProducts, LOCAL_STORAGE_KEY]);

  // Charger les produits depuis Supabase
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
          category: p.category || 'autre',
          sellerId: p.seller_id,
          stock: p.stock || 0,
          likes: p.likes || 0,
          isFromChina: Boolean(p.is_from_china),
          // ✅ Parsing sécurisé des variants
          variants: (() => {
            try {
              if (typeof p.variants === 'string') {
                return JSON.parse(p.variants) as ProductVariant[];
              } else if (Array.isArray(p.variants)) {
                return p.variants as ProductVariant[];
              } else {
                return [];
              }
            } catch (err) {
              console.error('Erreur parsing variants:', err);
              return [];
            }
          })(),
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

  const isAlreadyInCart = (productId: string) =>
    cartItems.some((item) => item.product.id === productId);

  const categoryNames: Record<string, string> = {
    vetement: 'Vêtements 👕',
    accessoire: 'Accessoires 💍',
    meuble: 'Meubles 🪑',
    enfant: 'Enfants 🧸',
    chine: 'Produits de Chine 🇨🇳',
    autre: 'Autres 🛍️',
  };

  const categoriesList = ['vetement', 'accessoire', 'meuble', 'enfant', 'chine', 'autre'];

  const filteredProducts =
    selectedCategory === 'tous'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <section id="featured-products" className="py-16 bg-gray-50">
      <div className="container-custom px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Produits en Vedette</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez les produits populaires de chaque catégorie.
          </p>
        </div>

        {/* Boutons de catégories */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            onClick={() => setSelectedCategory('tous')}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
              selectedCategory === 'tous'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Tous les produits 🌍
          </button>

          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                selectedCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {categoryNames[cat] || cat}
            </button>
          ))}
        </div>

        {/* Affichage produits */}
        {loading ? (
          <p className="text-center text-gray-500">Chargement des produits...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-gray-500">Aucun produit dans cette catégorie.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const inCart = isAlreadyInCart(product.id);
              return (
                <div
                  key={product.id}
                  className="relative group border rounded-xl shadow hover:shadow-lg transition bg-white"
                >
                  {product.isFromChina && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow">
                      🇨🇳 Chine
                    </div>
                  )}

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

                  <div className="w-full aspect-w-1 aspect-h-1 overflow-hidden rounded-lg">
                    <div className="flex overflow-x-auto snap-x snap-mandatory h-full scroll-smooth">
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
                  </div>

                  <div className="p-4">
                    <Link to={`/products/${product.id}`} className="block">
                      <h3 className="font-semibold text-lg mb-1 truncate">{product.title}</h3>
                    </Link>

                    <div className="flex items-center mb-2 text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill="currentColor" />
                      ))}
                    </div>

                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {product.description}
                    </p>
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
