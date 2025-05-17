import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  const { user, isAuthenticated, logout } = useAuth();
  const { cartItems } = useCart();
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const stored = localStorage.getItem('products');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAllProducts(parsed);
      } catch (err) {
        console.error('Erreur parsing produits :', err);
      }
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSuggestions([]);
      return;
    }
    const filtered = allProducts.filter((product: any) =>
      product.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSuggestions(filtered.slice(0, 5));
  }, [searchQuery, allProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      navigate(`/categories?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (title: string) => {
    setSearchQuery(title);
    navigate(`/categories?search=${encodeURIComponent(title)}`);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
    }`}>
      <div className="container-custom flex items-center justify-between">
        <Link to="/" className="flex items-center text-primary">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor" className="mr-2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <span className="text-2xl font-bold">AValide</span>
        </Link>

        {/* Recherche desktop */}
        <div className="hidden md:block flex-1 max-w-md mx-4 relative">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Rechercher des produits..."
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary">
              <Search size={18} />
            </button>
          </form>
          {suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded shadow-md max-h-60 overflow-y-auto">
              {suggestions.map((product) => (
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

        {/* Navigation desktop */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="nav-link">Accueil</Link>
          <a href="#categories" className="nav-link"></a>
          <Link to={isAuthenticated && user?.role === 'seller' ? '/seller/dashboard' : '/login'} className="nav-link">Vendre</Link>

          {isAuthenticated ? (
  <div className="relative group">
    <button className="flex items-center space-x-2 focus:outline-none">
      <User size={20} />
      <span className="text-sm font-medium capitalize">{user?.name?.split(' ')[0]}</span>
    </button>

    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-xs text-gray-500">Connecté en tant que</p>
        <p className="text-sm font-medium text-gray-800 truncate">{user?.email}</p>
      </div>

      <div className="py-2">
        <Link
          to="/orders"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Mes commandes
        </Link>
        {user?.role === 'seller' && (
          <Link
            to="/seller/dashboard"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Tableau de bord vendeur
          </Link>
        )}
      </div>

      <div className="py-2 border-t border-gray-100">
        <button
          onClick={logout}
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
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

        {/* Mobile menu toggle */}
        <div className="flex items-center space-x-4 md:hidden">
          <Link to="/cart" className="relative">
            <ShoppingCart size={22} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-800 focus:outline-none">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
{isMobileMenuOpen && (
  <div className="md:hidden bg-white border-t border-gray-200">
    <div className="px-4 pt-2 pb-3">
      {/* Champ de recherche mobile */}
      <form onSubmit={handleSearch} className="relative mb-2">
        <input
          type="text"
          placeholder="Rechercher..."
          className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary"
        >
          <Search size={18} />
        </button>
      </form>

      {/* Suggestions (autocomplétion) */}
      {suggestions.length > 0 && (
        <div className="z-50 w-full mt-1 bg-white border border-gray-200 rounded shadow-md max-h-60 overflow-y-auto">
          {suggestions.map((product) => (
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

      {/* Liens de navigation */}
      <Link to="/" className="block py-2">Accueil</Link>

      <Link
        to={isAuthenticated && user?.role === 'seller' ? '/seller/dashboard' : '/login'}
        className="block py-2"
      >
        Vendre
      </Link>

      {/* Liens utilisateur */}
      {isAuthenticated ? (
        <>
          <Link to="/orders" className="block py-2">Mes commandes</Link>
          {user?.role === 'seller' && (
            <Link to="/seller/dashboard" className="block py-2">
              Tableau de bord vendeur
            </Link>
          )}
          <button
            onClick={logout}
            className="block w-full text-left py-2 text-red-600 hover:bg-red-50"
          >
            Se déconnecter
          </button>
        </>
      ) : (
        <Link to="/login" className="block py-2">Connexion</Link>
      )}
    </div>
  </div>
)}
</header>
  );
}
export default Header;
