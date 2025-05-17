export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const categories: Category[] = [
  {
    id: 'electronics',
    name: 'Électronique',
    icon: 'smartphone',
    description: 'Téléphones, ordinateurs, télévisions et autres appareils électroniques'
  },
  {
    id: 'fashion',
    name: 'Mode',
    icon: 'shirt',
    description: 'Vêtements, chaussures, accessoires et bijoux'
  },
  {
    id: 'home',
    name: 'Maison',
    icon: 'sofa',
    description: 'Meubles, décoration, électroménager et fournitures'
  },
  {
    id: 'beauty',
    name: 'Beauté & Santé',
    icon: 'sparkles',
    description: 'Produits de beauté, parfums, soins personnels et santé'
  },
  {
    id: 'services',
    name: 'Services',
    icon: 'briefcase',
    description: 'Services professionnels, cours, réparations et autres prestations'
  },
  {
    id: 'food',
    name: 'Alimentation',
    icon: 'utensils',
    description: 'Produits alimentaires, boissons et épicerie'
  },
  {
    id: 'vehicles',
    name: 'Véhicules',
    icon: 'car',
    description: 'Voitures, motos, pièces détachées et accessoires'
  },
  {
    id: 'others',
    name: 'Autres',
    icon: 'more-horizontal',
    description: 'Autres catégories de produits et services'
  }
];