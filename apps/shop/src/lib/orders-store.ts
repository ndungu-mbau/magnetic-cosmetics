import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "./cart-store";

export type ShippingAddress = {
  fullName: string;
  email: string;
  address1: string;
  address2?: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
};

export type Order = {
  id: string;
  createdAt: string;
  email: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  address: ShippingAddress;
  status: "pending" | "paid" | "shipped";
};

type OrdersState = {
  orders: Order[];
  place: (o: Omit<Order, "id" | "createdAt" | "status">) => Order;
  get: (id: string) => Order | undefined;
};

const id = () =>
  "MC-" +
  Math.random().toString(36).slice(2, 6).toUpperCase() +
  Math.random().toString(36).slice(2, 6).toUpperCase();

export const useOrders = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      place: (o) => {
        const order: Order = {
          ...o,
          id: id(),
          createdAt: new Date().toISOString(),
          status: "pending",
        };
        set((s) => ({ orders: [order, ...s.orders] }));
        return order;
      },
      get: (id) => get().orders.find((o) => o.id === id),
    }),
    { name: "mc-orders" },
  ),
);
