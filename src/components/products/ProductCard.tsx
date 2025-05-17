import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatters';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart(); // ✅ Utilisation correcte ici

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product); // ✅ Appel correct de la méthode du contexte
  };

  return (
    <div className="card group h-full flex flex-col">
      <div className="relative overflow-hidden h-48 bg-gray-200">
        <img 
          src={product.images[0]} 
          alt={product.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Link 
            to={`/products/${product.id}`} 
            className="bg-white text-primary font-medium py-2 px-4 rounded-md transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
          >
            Voir les détails
          </Link>
        </div>
      </div>

      <div className="p-4 flex-grow flex flex-col">
        <div className="flex-grow">
          <Link to={`/products/${product.id}`} className="block">
            <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors line-clamp-1">
              {product.title}
            </h3>
          </Link>
          
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={16} 
                  fill={i < Math.floor(product.rating) ? "currentColor" : "none"} 
                  className={i < Math.floor(product.rating) ? "" : "text-gray-300"} 
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
          </div>
          
          <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg">{formatPrice(product.price)}</span>
          <button 
            onClick={handleAddToCart}
            className="flex items-center text-sm bg-primary text-white py-1 px-3 rounded-md hover:bg-primary-dark transition-colors"
          >
            <ShoppingCart size={16} className="mr-1" />
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
