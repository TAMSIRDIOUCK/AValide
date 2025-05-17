import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getProducts } from '../../utils/productService';
import { Product } from '../../types';
import Layout from '../../components/layout/Layout';
import { useCart } from '../../context/CartContext';

const SearchResultsPage = () => {
  const location = useLocation();
  const { addItem } = useCart();
  const [results, setResults] = useState<Product[]>([]);
  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get('search')?.toLowerCase() || '';

  useEffect(() => {
    const allProducts = getProducts();
    const filtered = allProducts.filter(product =>
      product.title.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm)
    );
    setResults(filtered);
  }, [searchTerm]);

  const addToCart = (product: Product) => {
    addItem(product);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Résultats pour "{searchTerm}"</h1>
        {results.length === 0 ? (
          <p>Aucun produit trouvé.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {results.map(product => (
              <div key={product.id} className="border p-2 rounded shadow">
                <div className="relative w-full h-48 overflow-hidden rounded mb-2">
                  {product.images[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-48 object-cover rounded"
                    />
                  )}
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

export default SearchResultsPage;
