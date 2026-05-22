import { create } from "zustand";
import { persist } from "zustand/middleware";

// Persists only the cart ID in localStorage.
// The cart document itself lives in Payload — this just tracks which cart
// belongs to this browser session.
//
// On customer login, the server can optionally merge the guest cart into
// the authenticated customer's account cart.

type CartStore = {
  cartId: string | null;
  setCartId: (id: string) => void;
  clearCartId: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cartId: null,
      setCartId: (cartId) => set({ cartId }),
      clearCartId: () => set({ cartId: null }),
    }),
    { name: "magnetic-cart" },
  ),
);
