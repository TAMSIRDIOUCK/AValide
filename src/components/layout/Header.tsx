import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabaseClient';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [showOrderMessage, setShowOrderMessage] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();
  const { cartItems } = useCart();
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        console.error('Erreur chargement produits :', error.message);
      } else {
        setAllProducts(data || []);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchUserName = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Erreur récupération nom :', error.message);
        } else if (data) {
          setUserName(data.name);
        }
      }
    };
    fetchUserName();
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSuggestions([]);
      return;
    }

    const filtered = allProducts.filter(product =>
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSuggestions(filtered.slice(0, 5));
  }, [searchQuery, allProducts]);

  useEffect(() => {
    const lastOrderTime = localStorage.getItem('lastOrderTime');
    if (lastOrderTime) {
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      if (now - parseInt(lastOrderTime) < oneHour) {
        setShowOrderMessage(true);
        const timeout = setTimeout(() => {
          setShowOrderMessage(false);
          localStorage.removeItem('lastOrderTime');
        }, oneHour - (now - parseInt(lastOrderTime)));
        return () => clearTimeout(timeout);
      }
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/categories?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (title: string) => {
    setSearchQuery(title);
    navigate(`/categories?search=${encodeURIComponent(title)}`);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
      {showOrderMessage && (
        <div
          className="fixed z-50 bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-full shadow-md flex items-center space-x-2 max-w-xs w-fit
          left-1/2 transform -translate-x-1/2
          md:top-20 md:left-2/3 md:translate-x-0 md:transform-none
          bottom-4 md:bottom-auto text-center"
        >
          <AlertCircle size={14} className="text-white" />
          <span>🚚 Reste joignable. Merci</span>
        </div>
      )}

      <div className="container-custom flex items-center justify-between">
        <Link to="/" className="flex items-center text-primary">
          <img src="/videos/IMG_1696.jpg" alt="Logo AValide" className="w-10 h-10 rounded-full mr-2 object-cover" />
          <span className="text-2xl font-bold">AValide</span>
        </Link>

        <div className="hidden md:block flex-1 max-w-md mx-4 relative">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Rechercher des produits..."
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <Search size={18} />
            </button>
          </form>

          {suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded shadow max-h-60 overflow-y-auto">
              {suggestions.map(product => (
                <div
                  key={product.id}
                  onClick={() => handleSuggestionClick(product.title)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {product.title}
                </div>
              ))}
            </div>
          )}
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="nav-link">Accueil</Link>

          {isAuthenticated ? (
            <div className="relative group">
              <button className="flex items-center space-x-2">
                <User size={20} />
                <span className="text-sm">{userName || ''}</span>
              </button>
              <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="px-4 py-3 border-b">
                  <p className="text-xs text-gray-500">Connecté en tant que</p>
                  <p className="text-sm text-gray-800">{userName || user?.email}</p>
                </div>
                <div className="py-2">
                  <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-gray-100">Mes commandes</Link>
                  <Link to="/seller/dashboard" className="block px-4 py-2 text-sm hover:bg-gray-100">Tableau de bord</Link>
                </div>
                <div className="py-2 border-t">
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    Se déconnecter
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link to="/login" className="flex items-center space-x-1">
              <User size={20} />
              <span className="text-sm">Connexion</span>
            </Link>
          )}

          <Link to="/cart" className="relative">
            <ShoppingCart size={22} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </nav>

        <div className="md:hidden flex items-center space-x-4">
          <Link to="/cart" className="relative" aria-label="Voir le panier">
            <ShoppingCart size={22} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu mobile"
            className="focus:outline-none"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4 shadow z-50">
          <form onSubmit={handleSearch} className="relative mb-3">
            <input
              type="text"
              placeholder="Rechercher un produit..."
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" aria-label="Rechercher">
              <Search size={18} />
            </button>
          </form>

          {suggestions.length > 0 && (
            <div className="bg-white border border-gray-300 rounded-md shadow-md max-h-60 overflow-y-auto">
              {suggestions.map(product => (
                <div
                  key={product.id}
                  onClick={() => {
                    handleSuggestionClick(product.title);
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                >
                  {product.title}
                </div>
              ))}
            </div>
          )}

          <Link to="/" className="block py-2">Accueil</Link>
          {isAuthenticated ? (
            <>
              <Link to="/orders" className="block py-2">Mes commandes</Link>
              <Link to="/seller/dashboard" className="block py-2">Tableau de bord</Link>
              <button onClick={logout} className="block w-full text-left py-2 text-red-600 hover:bg-red-50">
                Se déconnecter
              </button>
            </>
          ) : (
            <Link to="/login" className="block py-2">Connexion</Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
