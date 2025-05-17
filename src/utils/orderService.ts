const ORDERS_KEY = 'orders';

export interface OrderItem {
  productId: string;
  title: string;
  quantity: number;
  price: number;
  sellerId: string; // ✅ Pour filtrer les commandes par vendeur
  isProcessed?: boolean; 
}

export interface Order {
  id: string;
  userId: string;
  createdAt: string;
  items: OrderItem[];
  total: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  status: string; 
}

// ✅ Enregistrer une commande
export function saveOrder(order: Order): void {
  const existingOrders = getOrders();
  const updatedOrders = [...existingOrders, order];
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
}

// ✅ Récupérer toutes les commandes
export function getOrders(): Order[] {
  try {
    const data = localStorage.getItem(ORDERS_KEY);
    return data ? JSON.parse(data) as Order[] : [];
  } catch (error) {
    console.error('Erreur lors du chargement des commandes :', error);
    return [];
  }
}

// ✅ Récupérer les commandes d’un utilisateur (connecté ou invité)
export function getOrdersByUser(userId: string): Order[] {
  return getOrders().filter(order => order.userId === userId);
}

// ✅ Récupérer les commandes d’un vendeur
export function getOrdersBySeller(sellerId: string): Order[] {
  return getOrders().filter(order =>
    order.items.some(item => item.sellerId === sellerId)
  );
}
