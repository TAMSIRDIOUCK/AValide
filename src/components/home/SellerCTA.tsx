import React from 'react';
import { Link } from 'react-router-dom';
import { Store, ChevronRight } from 'lucide-react';

const SellerCTA: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-accent-dark to-accent">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-8 md:mb-0 md:mr-8 text-white max-w-2xl">
            <div className="text-white opacity-90 mb-4 flex items-center">
              <Store size={28} className="mr-2" />
              <span className="font-medium">POUR LES VENDEURS</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Développez votre entreprise avec AValide
            </h2>
            <p className="text-lg opacity-90 mb-6">
              Rejoignez des milliers de vendeurs qui utilisent AValide pour atteindre de nouveaux clients, augmenter leurs ventes et faire croître leur entreprise. Notre plateforme vous offre tous les outils nécessaires pour réussir.
            </p>
            <ul className="mb-8 space-y-3">
              {[
                "Accès à des milliers d'acheteurs potentiels",
                "Outil de gestion simple et intuitif",
                "Statistiques de vente en temps réel",
                "Support dédié pour les vendeurs"
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link 
              to="/sell" 
              className="btn bg-white text-accent hover:bg-gray-100 focus:ring-white inline-flex items-center"
            >
              Commencer à vendre
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4 text-center">Pourquoi vendre sur AValide ?</h3>
            <div className="space-y-4">
              <div className="flex p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-primary text-white mr-4">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Inscription Gratuite</h4>
                  <p className="text-sm text-gray-600">Créez votre compte vendeur gratuitement et facilement</p>
                </div>
              </div>
              <div className="flex p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-primary text-white mr-4">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Ajoutez vos produits</h4>
                  <p className="text-sm text-gray-600">Listez facilement vos produits ou services</p>
                </div>
              </div>
              <div className="flex p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-primary text-white mr-4">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Commencez à vendre</h4>
                  <p className="text-sm text-gray-600">Recevez des commandes et développez votre entreprise</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SellerCTA;