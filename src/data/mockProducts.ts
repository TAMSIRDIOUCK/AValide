import { Product } from '../types';

export const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Smartphone Samsung Galaxy A54',
    description: 'Samsung Galaxy A54 avec écran 6.4" Super AMOLED, 128GB de stockage, 6GB RAM, triple caméra arrière, batterie 5000mAh, couleur noir.',
    price: 189000,
    images: [
      'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/47261/pexels-photo-47261.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    category: 'electronics',
    sellerId: 'seller1',
    sellerName: 'TechStore Dakar',
    rating: 4.7,
    reviewCount: 128,
    stock: 15,
    createdAt: '2023-12-15T10:30:00Z'
  },
  {
    id: '2',
    title: 'Robe Traditionnelle Brodée',
    description: 'Magnifique robe traditionnelle sénégalaise avec broderies complexes, disponible en plusieurs tailles. Parfaite pour les cérémonies.',
    price: 25000,
    images: [
      'https://images.pexels.com/photos/6045168/pexels-photo-6045168.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    category: 'fashion',
    sellerId: 'seller2',
    sellerName: 'Couture Élégance',
    rating: 4.9,
    reviewCount: 56,
    stock: 8,
    createdAt: '2023-12-20T14:15:00Z'
  },
  {
    id: '3',
    title: 'Table Basse en Bois Massif',
    description: 'Table basse artisanale en bois massif, fabrication locale, dimensions 120x60x45cm. Finition naturelle de haute qualité.',
    price: 85000,
    images: [
      'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    category: 'home',
    sellerId: 'seller3',
    sellerName: 'Artisan Bois Dakar',
    rating: 4.8,
    reviewCount: 32,
    stock: 3,
    createdAt: '2023-11-05T09:45:00Z'
  },
  {
    id: '4',
    title: 'Service de Réparation Électronique',
    description: 'Réparation professionnelle de smartphones, tablettes et ordinateurs. Service rapide et garantie de 3 mois sur les réparations.',
    price: 15000,
    images: [
      'https://images.pexels.com/photos/4792733/pexels-photo-4792733.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    category: 'services',
    sellerId: 'seller4',
    sellerName: 'Technicien Pro',
    rating: 4.6,
    reviewCount: 98,
    stock: 999,
    createdAt: '2024-01-10T13:20:00Z'
  },
  {
    id: '5',
    title: 'Lot de 6 Pots de Miel Local',
    description: 'Miel 100% naturel et local, récolté dans les forêts du Sénégal. Lot de 6 pots de 250g chacun. Goût authentique et délicieux.',
    price: 18000,
    images: [
      'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    category: 'food',
    sellerId: 'seller5',
    sellerName: 'Ferme Naturelle',
    rating: 4.9,
    reviewCount: 45,
    stock: 20,
    createdAt: '2024-02-01T11:10:00Z'
  },
  {
    id: '6',
    title: 'Ensemble de Soins Visage Bio',
    description: 'Ensemble complet de soins visage bio comprenant un nettoyant, un tonique, une crème hydratante et un sérum. Produits naturels fabriqués au Sénégal.',
    price: 35000,
    images: [
      'https://images.pexels.com/photos/3321416/pexels-photo-3321416.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    category: 'beauty',
    sellerId: 'seller6',
    sellerName: 'Beauté Naturelle',
    rating: 4.7,
    reviewCount: 67,
    stock: 12,
    createdAt: '2024-01-25T16:30:00Z'
  },
  {
    id: '7',
    title: 'Scooter Électrique',
    description: 'Scooter électrique écologique, autonomie de 80km, vitesse max 45km/h. Idéal pour se déplacer facilement dans Dakar. Batterie amovible incluse.',
    price: 950000,
    images: [
      'https://images.pexels.com/photos/1213445/pexels-photo-1213445.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    category: 'vehicles',
    sellerId: 'seller7',
    sellerName: 'ÉcoMobilité Sénégal',
    rating: 4.5,
    reviewCount: 23,
    stock: 5,
    createdAt: '2023-12-05T08:45:00Z'
  },
  {
    id: '8',
    title: 'Chaussures en Cuir Artisanales',
    description: 'Chaussures homme en cuir véritable, fabriquées à la main par des artisans locaux. Confortables et élégantes, disponibles en plusieurs tailles.',
    price: 45000,
    images: [
      'https://images.pexels.com/photos/9387/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    category: 'fashion',
    sellerId: 'seller8',
    sellerName: 'Cuir Artisanal',
    rating: 4.8,
    reviewCount: 41,
    stock: 7,
    createdAt: '2024-01-15T10:20:00Z'
  }
];