import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Loader } from 'lucide-react';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        navigate('/');
      } else {
        setError('Identifiants incorrects. Veuillez réessayer.');
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <LogIn className="w-12 h-12 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-bold">Connexion</h2>
        <p className="text-gray-600 mt-2">
          Connectez-vous pour accéder à votre compte
        </p>
      </div>
      
      {error && (
        <div className="bg-error-light/10 text-error border border-error/20 rounded-md p-3 mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            type="email"
            placeholder="votre@email.com"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="label">Mot de passe</label>
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Mot de passe oublié?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="flex items-center">
          <input
            id="remember"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
            Se souvenir de moi
          </label>
        </div>
        
        <button
          type="submit"
          className="btn-primary w-full flex justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader className="animate-spin h-5 w-5" />
          ) : (
            'Se connecter'
          )}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Vous n'avez pas de compte? {' '}
          <Link to="/register" className="text-primary hover:underline font-medium">
            S'inscrire
          </Link>
        </p>
      </div>
      
      <div className="mt-8 border-t border-gray-200 pt-6">
        <p className="text-sm text-center text-gray-500">
          Pour les tests, utilisez les identifiants :<br />
          <span className="font-mono">demo@example.com / password</span> (acheteur)<br />
          <span className="font-mono">seller@example.com / password</span> (vendeur)
        </p>
      </div>
    </div>
  );
};

export default LoginForm;