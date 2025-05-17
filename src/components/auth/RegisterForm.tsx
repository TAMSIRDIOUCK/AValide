import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Loader } from 'lucide-react';

const RegisterForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await register({ name, email, phone, role }, password);
      
      if (success) {
        if (role === 'seller') {
          navigate('/seller/onboarding');
        } else {
          navigate('/');
        }
      } else {
        setError('Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
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
        <UserPlus className="w-12 h-12 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-bold">Créer un compte</h2>
        <p className="text-gray-600 mt-2">
          Rejoignez AValide pour acheter et vendre facilement
        </p>
      </div>
      
      {error && (
        <div className="bg-error-light/10 text-error border border-error/20 rounded-md p-3 mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="label">Nom complet</label>
          <input
            id="name"
            type="text"
            placeholder="Votre nom complet"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
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
          <label htmlFor="phone" className="label">Numéro de téléphone</label>
          <input
            id="phone"
            type="tel"
            placeholder="+221 70 123 4567"
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="label">Mot de passe</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="label">Confirmer le mot de passe</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            className="input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="label">Type de compte</label>
          <div className="grid grid-cols-2 gap-4">
            <div
              className={`p-3 border rounded-md cursor-pointer flex items-center justify-center ${
                role === 'buyer' 
                  ? 'border-primary bg-primary-light/10 text-primary' 
                  : 'border-gray-300 text-gray-700'
              }`}
              onClick={() => setRole('buyer')}
            >
              <span className="font-medium">Acheteur</span>
            </div>
            <div
              className={`p-3 border rounded-md cursor-pointer flex items-center justify-center ${
                role === 'seller' 
                  ? 'border-primary bg-primary-light/10 text-primary' 
                  : 'border-gray-300 text-gray-700'
              }`}
              onClick={() => setRole('seller')}
            >
              <span className="font-medium">Vendeur</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            id="terms"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            required
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
            J'accepte les {' '}
            <Link to="/terms" className="text-primary hover:underline">
              conditions d'utilisation
            </Link>
            {' '} et la {' '}
            <Link to="/privacy" className="text-primary hover:underline">
              politique de confidentialité
            </Link>
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
            'S\'inscrire'
          )}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Vous avez déjà un compte? {' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;