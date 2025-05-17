import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Product } from '../../types';
import { formatPrice } from '../../utils/formatters';

const FeaturedProducts: React.FC = () => {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem('products');
    if (raw) {
      try {
        const parsed: Product[] = JSON.parse(raw);
        const sorted = parsed
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 8);
        setProducts(sorted);
      } catch (err) {
        console.error('Erreur de parsing des produits:', err);
      }
    }
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Produits en Vedette</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez les derniers produits ajoutés par nos vendeurs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.id} className="border rounded-lg shadow bg-white">
              {/* Carrousel horizontal d'images */}
              <div className="relative bg-gray-200 h-48 overflow-hidden">
                <div className="flex overflow-x-auto h-full scroll-smooth space-x-2 scrollbar-hide px-2">
                  {product.images.map((imgUrl, index) => (
                    <img
                      key={index}
                      src={imgUrl}
                      alt={`${product.title} image ${index + 1}`}
                      className="h-full w-64 flex-shrink-0 object-cover rounded"
                    />
                  ))}
                </div>
              </div>

              {/* Infos produit */}
              <div className="p-4">
                <Link to={`/products/${product.id}`} className="block">
                  <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors line-clamp-1">
                    {product.title}
                  </h3>
                </Link>

                {/* Étoiles & avis */}
                <div className="flex items-center mb-2">
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
                  <span className="text-xs text-gray-500 ml-1">({product.reviewCount || 0})</span>
                </div>

                {/* Description */}
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>

                {/* Prix + bouton */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">{formatPrice(product.price)}</span>
                  <button
                    onClick={() => addItem(product)}
                    className="text-sm bg-primary text-white py-1 px-3 rounded-md hover:bg-primary-dark transition-colors"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
