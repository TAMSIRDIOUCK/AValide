import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../../data/categories';
import * as LucideIcons from 'lucide-react';

const CategorySection: React.FC = () => {
  // Map icon names to Lucide icons
  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName.charAt(0).toUpperCase() + iconName.slice(1)];
    return Icon ? <Icon size={32} /> : null;
  };

  return (
    <section id="categories" className="py-24 bg-white">

      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Parcourir par Catégorie</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explorez notre large sélection de produits et services répartis par catégorie pour faciliter votre recherche.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id}
              to={`/category/${category.id}`} 
              className="bg-neutral-50 rounded-lg p-6 text-center transition duration-300 hover:shadow-md hover:bg-neutral-100 hover:scale-105"
            >
              <div className="text-primary mb-3 mx-auto w-16 h-16 flex items-center justify-center bg-primary-light/10 rounded-full">
                {getIcon(category.icon)}
              </div>
              <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{category.description}</p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          
        </div>
      </div>
    </section>
  );
};

export default CategorySection;