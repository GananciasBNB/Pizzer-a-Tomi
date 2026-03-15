import { create } from 'zustand';
import type { Product } from '../data/products';

export interface CartItem {
  cartItemId: string; // ID único generado para esta configuración exacta
  productId: string;
  name: string;
  price: number;
  size?: 'Mediana' | 'Familiar';
  removedIngredients: string[];
  quantity: number;
  imageUrl: string;
}

interface CartStore {
  // Lógica de Carrito
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  
  // UI: Modal de Personalización (Añadir a carrito)
  selectedProduct: Product | null;
  isModalOpen: boolean;
  openModal: (product: Product) => void;
  closeModal: () => void;
  
  // UI: Sidebar de Carrito
  isCartOpen: boolean;
  toggleCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  
  addToCart: (item) => set((state) => {
    // Si la pizza es exactamente igual (Mismos ingredientes removidos, mismo tamaño, mismo ID) agrupamos.
    const existingIndex = state.items.findIndex(
      (i) => i.productId === item.productId 
             && i.size === item.size 
             && JSON.stringify(i.removedIngredients) === JSON.stringify(item.removedIngredients)
    );

    if (existingIndex !== -1) {
      const newItems = [...state.items];
      newItems[existingIndex].quantity += item.quantity;
      return { items: newItems };
    }

    return { items: [...state.items, item] };
  }),

  removeFromCart: (cartItemId) => set((state) => ({
    items: state.items.filter((item) => item.cartItemId !== cartItemId)
  })),

  updateQuantity: (cartItemId, quantity) => set((state) => ({
    items: state.items.map((item) => 
      item.cartItemId === cartItemId ? { ...item, quantity } : item
    )
  })),

  clearCart: () => set({ items: [] }),

  selectedProduct: null,
  isModalOpen: false,
  openModal: (product) => set({ selectedProduct: product, isModalOpen: true }),
  closeModal: () => set({ selectedProduct: null, isModalOpen: false }),

  isCartOpen: false,
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
}));
