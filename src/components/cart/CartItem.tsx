import React from 'react';
import { Link } from 'react-router-dom';
import { Trash, Plus, Minus } from 'lucide-react';
import { CartItem as CartItemType } from '../../types';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatters';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();
  const { product, quantity } = item;

  const handleIncrement = () => {
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1);
    } else {
      removeItem(product.id);
    }
  };

  const handleRemove = () => {
    removeItem(product.id);
  };

  return (
    <div className="flex items-center py-4 border-b border-gray-200">
      <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-md overflow-hidden">
        <img 
          src={product.images[0]} 
          alt={product.title} 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="ml-4 flex-grow">
        <Link 
          to={`/products/${product.id}`}
          className="font-medium text-gray-800 hover:text-primary transition-colors line-clamp-1"
        >
          {product.title}
        </Link>
        <p className="text-sm text-gray-500 line-clamp-1">
          Vendeur: {product.sellerName}
        </p>
        <div className="mt-1 text-primary font-semibold">
          {formatPrice(product.price)}
        </div>
      </div>
      
      <div className="flex items-center ml-4">
        <button 
          onClick={handleDecrement}
          className="p-1 rounded-full border border-gray-300 hover:bg-gray-100"
        >
          <Minus size={16} />
        </button>
        
        <input
          type="text"
          value={quantity}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (!isNaN(val) && val > 0) {
              updateQuantity(product.id, val);
            }
          }}
          className="w-12 mx-2 text-center border border-gray-300 rounded-md p-1"
        />
        
        <button 
          onClick={handleIncrement}
          className="p-1 rounded-full border border-gray-300 hover:bg-gray-100"
        >
          <Plus size={16} />
        </button>
      </div>
      
      <div className="ml-4 font-semibold text-right w-24">
        {formatPrice(product.price * quantity)}
      </div>
      
      <button 
        onClick={handleRemove}
        className="ml-4 text-gray-400 hover:text-error transition-colors"
      >
        <Trash size={18} />
      </button>
    </div>
  );
};

export default CartItem;