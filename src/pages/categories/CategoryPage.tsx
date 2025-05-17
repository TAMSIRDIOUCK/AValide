
import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getProductsByCategory, searchProducts } from '../../utils/productService';
import { useCart } from '../../context/CartContext';
import { Product } from '../../types';
import Layout from '../../components/layout/Layout';

const CategoryPage = () => {
  const { id: categoryId } = useParams<{ id: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search');

  const [products, setProducts] = useState<Product[]>([]);
  const { addItem } = useCart();

  useEffect(() => {
    if (searchQuery) {
      const results = searchProducts(searchQuery);
      setProducts(results);
    } else if (categoryId) {
      const data = getProductsByCategory(categoryId);
      setProducts(data);
    }
  }, [categoryId, searchQuery]);

  const addToCart = (product: Product) => {
    addItem(product);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">
          {searchQuery
            ? `Résultats pour "${searchQuery}"`
            : `Produits de la catégorie`}
        </h1>

        {products.length === 0 ? (
          <p>Aucun produit trouvé.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="border p-2 rounded shadow">
                <div className="relative w-full h-48 overflow-x-auto whitespace-nowrap scroll-smooth rounded mb-2">
                  {product.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="inline-block h-48 w-full object-cover rounded mr-2"
                      style={{ width: '100%', maxWidth: '100%' }}
                    />
                  ))}
                </div>

                <h2 className="font-semibold">{product.title}</h2>
                <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                <p className="font-bold mt-2">{product.price} FCFA</p>
                <button
                  onClick={() => addToCart(product)}
                  className="mt-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition"
                >
                  Ajouter au panier
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CategoryPage;
