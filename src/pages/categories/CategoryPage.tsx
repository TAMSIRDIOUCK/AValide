import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Product } from '../../types/types';
import Layout from '../../components/layout/Layout';
import { supabase } from '../../lib/supabaseClient';
import { Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CategoryPage = () => {
  const { id: categoryId } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { addItem } = useCart();

  const LOCAL_STORAGE_KEY = user ? `likedProducts_${user.id}` : 'likedProducts_guest';

  const [likedProducts, setLikedProducts] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // ✅ Restaurer position de scroll si sauvegardée
  useEffect(() => {
    const savedPosition = sessionStorage.getItem('categoryScrollPos');
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition, 10));
      sessionStorage.removeItem('categoryScrollPos');
    }
  }, []);

  // ✅ Sauvegarder position scroll avant navigation
  const saveScrollPosition = () => {
    sessionStorage.setItem('categoryScrollPos', window.scrollY.toString());
  };

  // Scroll top au changement de catégorie ou recherche
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [categoryId, searchQuery]);

  // Sync likes localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(likedProducts));
    } catch {}
  }, [likedProducts, LOCAL_STORAGE_KEY]);

  // Récupérer les produits
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let query = supabase.from('products').select('*');

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      } else if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération produits:', error.message);
        setProducts([]);
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
          category: p.category_id || '',
          sellerId: p.seller_id,
          stock: p.stock || 0,
          likes: typeof p.likes === 'number' ? p.likes : 0,
        }));

        setProducts(adapted);
      }

      setLoading(false);
    };

    fetchProducts();
  }, [categoryId, searchQuery]);

  const addToCart = (product: Product) => {
    addItem(product);
  };

  const updateLikesInSupabase = async (productId: string, increment: boolean) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const currentLikes = product.likes ?? 0;
    const newLikes = increment ? currentLikes + 1 : Math.max(currentLikes - 1, 0);

    const { error } = await supabase
      .from('products')
      .update({ likes: newLikes })
      .eq('id', productId);

    if (error) {
      console.error('Erreur mise à jour likes:', error.message);
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, likes: newLikes } : p))
      );
    }
  };

  const toggleLike = (productId: string) => {
    const isLiked = likedProducts.includes(productId);

    if (isLiked) {
      setLikedProducts((prev) => prev.filter((id) => id !== productId));
      updateLikesInSupabase(productId, false);
    } else {
      setLikedProducts((prev) => [...prev, productId]);
      updateLikesInSupabase(productId, true);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          {searchQuery
            ? `Résultats pour "${searchQuery}"`
            : `Produits de la catégorie`}
        </h1>

        {loading ? (
          <p>Chargement des produits...</p>
        ) : products.length === 0 ? (
          <p>Aucun produit trouvé.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="relative group border rounded-xl shadow hover:shadow-lg transition bg-white flex flex-col"
              >
                {/* Bouton J’aime */}
                <button
                  onClick={() => toggleLike(product.id)}
                  className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white shadow hover:scale-110 transition-transform"
                  aria-label={`J'aime ${product.title}`}
                >
                  <Heart
                    size={24}
                    className={`transition ${
                      likedProducts.includes(product.id)
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-400'
                    }`}
                  />
                </button>

                {/* Carousel d’image */}
                <div className="w-full aspect-w-1 aspect-h-1 overflow-hidden rounded-t-xl relative">
                  <div className="flex overflow-x-auto snap-x snap-mandatory h-full">
                    {product.images.map((img: string, idx: number) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${product.title} ${idx + 1}`}
                        loading="lazy"
                        className="snap-center flex-shrink-0 w-full h-full object-cover"
                        style={{ minWidth: '100%' }}
                      />
                    ))}
                  </div>
                </div>

                {/* Infos produit */}
                <div className="p-4 flex flex-col flex-grow">
                  <h2 className="font-semibold text-lg truncate">{product.title}</h2>
                  <p className="text-sm text-gray-500 line-clamp-2 flex-grow">
                    {product.description}
                  </p>
                  <p className="mt-2 font-bold text-primary">{product.price} FCFA</p>

                  <button
                    onClick={() => addToCart(product)}
                    className="mt-3 w-full bg-primary text-white py-2 rounded hover:bg-primary-dark transition"
                  >
                    Ajouter au panier
                  </button>

                  {/* Exemple lien détail produit */}
                  {/* 
                  <button
                    onClick={() => {
                      saveScrollPosition();
                      navigate(`/product/${product.id}`);
                    }}
                    className="mt-2 text-sm underline text-primary"
                  >
                    Voir détails
                  </button>
                  */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CategoryPage;
