import { create } from 'zustand';
import { STORAGE_KEYS } from '@/services/db';
import type { MenuItem, PaymentMethod } from '@/types';

export interface CartLine {
  item_id: string;
  name: string;
  price: number; // effective (discounted) price at the moment of adding
  image_url: string | null;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  lastAddedAt: number | null;
  open: () => void;
  close: () => void;
  add: (item: MenuItem, quantity?: number) => void;
  setQuantity: (itemId: string, quantity: number) => void;
  remove: (itemId: string) => void;
  clear: () => void;
}

function readStoredLines(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.cart);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (line): line is CartLine =>
        typeof line === 'object' &&
        line !== null &&
        typeof line.item_id === 'string' &&
        typeof line.name === 'string' &&
        Number.isFinite(Number(line.price)) &&
        Number.isFinite(Number(line.quantity)),
    );
  } catch {
    return [];
  }
}

function persist(lines: CartLine[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(lines));
  } catch {
    // cart is non-critical — ignore storage failures
  }
}

export const useCartStore = create<CartState>((set, get) => ({
  lines: readStoredLines(),
  isOpen: false,
  lastAddedAt: null,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),

  add: (item, quantity = 1) => {
    const price = Math.round(
      item.price * (100 - Math.min(90, Math.max(0, item.discount_percent ?? 0))) / 100,
    );
    const existing = get().lines.find((line) => line.item_id === item.id);
    const lines = existing
      ? get().lines.map((line) =>
          line.item_id === item.id
            ? { ...line, quantity: Math.min(99, line.quantity + quantity), price }
            : line,
        )
      : [
          ...get().lines,
          {
            item_id: item.id,
            name: item.name_ru || item.name_uz,
            price,
            image_url: item.image_url,
            quantity: Math.min(99, quantity),
          },
        ];
    persist(lines);
    set({ lines, lastAddedAt: Date.now() });
  },

  setQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().remove(itemId);
      return;
    }
    const lines = get().lines.map((line) =>
      line.item_id === itemId ? { ...line, quantity: Math.min(99, quantity) } : line,
    );
    persist(lines);
    set({ lines });
  },

  remove: (itemId) => {
    const lines = get().lines.filter((line) => line.item_id !== itemId);
    persist(lines);
    set({ lines });
  },

  clear: () => {
    persist([]);
    set({ lines: [] });
  },
}));

export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

export type { PaymentMethod };
