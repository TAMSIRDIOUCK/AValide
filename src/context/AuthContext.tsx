import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

// Définition du type de contexte
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Partial<User>, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

// Création du contexte sans l'utiliser immédiatement
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Vérification du localStorage au chargement
  useEffect(() => {
    const storedUser = localStorage.getItem('avalideUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      if (email === 'demo@example.com' && password === 'password') {
        const mockUser: User = {
          id: 'user1',
          name: 'Demo User',
          email: 'demo@example.com',
          phone: '+221 70 123 4567',
          address: 'Dakar, Sénégal',
          role: 'buyer',
          createdAt: new Date().toISOString(),
        };
        setUser(mockUser);
        localStorage.setItem('avalideUser', JSON.stringify(mockUser));
        return true;
      }

      if (email === 'seller@example.com' && password === 'password') {
        const mockSeller: User = {
          id: 'seller1',
          name: 'Demo Seller',
          email: 'seller@example.com',
          phone: '+221 70 987 6543',
          address: 'Dakar, Sénégal',
          role: 'seller',
          createdAt: new Date().toISOString(),
        };
        setUser(mockSeller);
        localStorage.setItem('avalideUser', JSON.stringify(mockSeller));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fonction d'inscription
  const register = async (userData: Partial<User>, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: userData.name || 'New User',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        role: userData.role || 'buyer',
        createdAt: new Date().toISOString(),
      };
      setUser(newUser);
      localStorage.setItem('avalideUser', JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const logout = () => {
    setUser(null);
    localStorage.removeItem('avalideUser');
  };
// 👉 Affiche un écran de chargement pendant l'init
if (loading) {
  return (
    <div className="flex items-center justify-center min-h-screen text-gray-600">
      Chargement...
    </div>
  );
}
  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour consommer le contexte (à utiliser ailleurs)
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
