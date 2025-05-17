import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-800 text-white pt-12 pb-6">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <div className="flex items-center text-white mb-4">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className="mr-2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
              <span className="text-xl font-bold">AValide</span>
            </div>
            <p className="text-neutral-300 mb-4">
              La plateforme de commerce électronique qui permet aux Sénégalais d'acheter et de vendre facilement des produits et services, avec paiement par WAV ou à la livraison.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens Rapides</h3>
            <ul className="space-y-2 text-neutral-300">
              <li><Link to="/" className="hover:text-primary transition-colors">Accueil</Link></li>
              <li><Link to="/categories" className="hover:text-primary transition-colors">Catégories</Link></li>
              <li><Link to="/sell" className="hover:text-primary transition-colors">Vendre sur AValide</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">À propos de nous</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Service Client</h3>
            <ul className="space-y-2 text-neutral-300">
              <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="/shipping" className="hover:text-primary transition-colors">Livraison</Link></li>
              <li><Link to="/returns" className="hover:text-primary transition-colors">Retours & Remboursements</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Conditions d'utilisation</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Politique de confidentialité</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-neutral-300">
              <li className="flex items-start">
                <MapPin size={18} className="mr-2 mt-1 flex-shrink-0" />
                <span>Rue 10 x Corniche, Dakar, Sénégal</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-2 flex-shrink-0" />
                <span>+221 33 123 4567</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2 flex-shrink-0" />
                <a href="mailto:contact@avalide.sn" className="hover:text-primary transition-colors">
                  contact@avalide.sn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-neutral-700 pt-6 pb-4">
          <div className="flex flex-wrap justify-center">
            <p className="text-neutral-400 text-sm mb-2 w-full text-center">Modes de paiement acceptés</p>
            <div className="flex space-x-4 justify-center">
              <div className="bg-white text-primary font-bold rounded-md px-3 py-1">WAV</div>
              <div className="bg-white text-primary font-bold rounded-md px-3 py-1">À la livraison</div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-neutral-400 text-sm pt-4 border-t border-neutral-700">
          <p>&copy; {currentYear} AValide. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;