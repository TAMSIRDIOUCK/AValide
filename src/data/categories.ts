// src/data/categories.ts

export interface Category {
  id: string;
  name: string;
  icon: string; // nom d’icône Lucide, en PascalCase (ex: Smartphone, ShoppingBag, etc)
  description: string;
}

export const categories: Category[] = [
  {
    id: 'electronics',
    name: 'Électronique',
    icon: 'Smartphone',
    description: 'Téléphones, ordinateurs, télévisions et autres appareils électroniques',
  },
  {
    id: 'fashion',
    name: 'Mode',
    icon: 'ShoppingBag',
    description: 'Vêtements, chaussures, accessoires et bijoux',
  },
  {
    id: 'home',
    name: 'Maison',
    icon: 'Lamp',
    description: 'Meubles, décoration, électroménager et fournitures',
  },
  {
    id: 'beauty',
    name: 'Beauté & Santé',
    icon: 'Sparkle',
    description: 'Produits de beauté, parfums, soins personnels et santé',
  },
  {
    id: 'services',
    name: 'Services',
    icon: 'Briefcase',
    description: 'Services professionnels, cours, réparations et autres prestations',
  },
  {
    id: 'food',
    name: 'Alimentation',
    icon: 'UtensilsCrossed',
    description: 'Produits alimentaires, boissons et épicerie',
  },
  {
    id: 'vehicles',
    name: 'Véhicules',
    icon: 'Car',
    description: 'Voitures, motos, pièces détachées et accessoires',
  },
  {
    id: 'others',
    name: 'Autres',
    icon: 'Box',
    description: 'Autres catégories de produits et services',
  },
];
