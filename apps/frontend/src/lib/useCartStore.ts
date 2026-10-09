import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  _id: string;
  title: string;
  author: string;
  price: number;
  coverUrl?: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (book: any) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (book) => set((state) => {
        const existingItem = state.items.find(item => item._id === book._id);
        if (existingItem) {
          return {
            items: state.items.map(item =>
              item._id === book._id ? { ...item, quantity: item.quantity + 1 } : item
            )
          };
        }
        return { items: [...state.items, { ...book, quantity: 1 }] };
      }),
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item._id !== id)
      })),
      updateQuantity: (id, quantity) => set((state) => ({
        items: quantity <= 0 
          ? state.items.filter(item => item._id !== id)
          : state.items.map(item => item._id === id ? { ...item, quantity } : item)
      })),
      clearCart: () => set({ items: [] }),
      getCartTotal: () => {
        const items = get().items;
        return items.reduce((total, item) => total + ((item.price || 4000) * item.quantity), 0);
      },
      getCartCount: () => {
        const items = get().items;
        return items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: 'eyelight-cart-storage',
    }
  )
);
