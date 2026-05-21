import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  slug: string;
  name: string;
  image: string;
  size: number; // ml
  price: number; // unit price
  qty: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (slug: string, size: number) => void;
  setQty: (slug: string, size: number, qty: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item, qty = 1) =>
        set((s) => {
          const i = s.items.findIndex(
            (x) => x.slug === item.slug && x.size === item.size,
          );
          if (i >= 0) {
            const next = [...s.items];
            next[i] = { ...next[i], qty: next[i].qty + qty };
            return { items: next };
          }
          return { items: [...s.items, { ...item, qty }] };
        }),
      remove: (slug, size) =>
        set((s) => ({
          items: s.items.filter((x) => !(x.slug === slug && x.size === size)),
        })),
      setQty: (slug, size, qty) =>
        set((s) => ({
          items: s.items
            .map((x) =>
              x.slug === slug && x.size === size
                ? { ...x, qty: Math.max(1, qty) }
                : x,
            )
            .filter((x) => x.qty > 0),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "mc-cart" },
  ),
);

export const cartSelectors = {
  count: (s: { items: CartItem[] }) =>
    s.items.reduce((n, i) => n + i.qty, 0),
  subtotal: (s: { items: CartItem[] }) =>
    s.items.reduce((n, i) => n + i.price * i.qty, 0),
};
