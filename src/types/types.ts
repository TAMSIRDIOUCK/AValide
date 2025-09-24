export interface Order {
  id: string;
  userId: string;
  createdAt: string;
  total: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerEmail: string;
  additionalInfo: string;
  paymentMethod: string;
  status: string;
  items: {
    id: string;
    productId: string;
    sellerId: string;
    title: string;
    image: string[];
    quantity: number;
    price: number;
    status: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
  }[];
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  rating: number;
  reviewCount: number;
  createdAt: string;
  category: string;
  sellerId: string;
  stock: number;
  likes: number;
}