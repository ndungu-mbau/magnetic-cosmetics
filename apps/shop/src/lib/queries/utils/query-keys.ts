// ── Central query key factory ─────────────────────────────────────────────────
//
// Every useQuery() and invalidateQueries() call uses keys from this object.
// Keeps cache invalidation predictable and refactoring painless —
// changing a key shape is a one-line edit here, not a grep across the codebase.

import type { ProductListParams } from "@/server/endpoints/products";

export const queryKeys = {
  // ── Products ───────────────────────────────────────────────────────────────
  products: {
    all: ["products"] as const,
    lists: () => [...queryKeys.products.all, "list"] as const,
    list: (params: ProductListParams) =>
      [...queryKeys.products.lists(), params] as const,
    infiniteLists: () => [...queryKeys.products.all, "infinite"] as const,
    infiniteList: (params: Omit<ProductListParams, "page">) =>
      [...queryKeys.products.infiniteLists(), params] as const,
    details: () => [...queryKeys.products.all, "detail"] as const,
    detail: (handle: string) =>
      [...queryKeys.products.details(), handle] as const,
    variants: (productId: string) =>
      [...queryKeys.products.all, "variants", productId] as const,
  },

  // ── Categories ─────────────────────────────────────────────────────────────
  categories: {
    all: ["categories"] as const,
    list: () => [...queryKeys.categories.all, "list"] as const,
    detail: (handle: string) =>
      [...queryKeys.categories.all, "detail", handle] as const,
  },

  // ── Collections ────────────────────────────────────────────────────────────
  collections: {
    all: ["collections"] as const,
    list: () => [...queryKeys.collections.all, "list"] as const,
    detail: (handle: string) =>
      [...queryKeys.collections.all, "detail", handle] as const,
  },

  // ── Reviews ────────────────────────────────────────────────────────────────
  reviews: {
    all: ["reviews"] as const,
    byProduct: (productId: string, page: number) =>
      [...queryKeys.reviews.all, "product", productId, page] as const,
  },

  // ── Customer ───────────────────────────────────────────────────────────────
  customer: {
    all: ["customer"] as const,
    me: (token: string) => [...queryKeys.customer.all, "me", token] as const,
    orders: (token: string, page: number) =>
      [...queryKeys.customer.all, "orders", token, page] as const,
    order: (token: string, orderNumber: string) =>
      [...queryKeys.customer.all, "order", token, orderNumber] as const,
  },

  // ── Cart ───────────────────────────────────────────────────────────────────
  cart: {
    all: ["cart"] as const,
    detail: (cartId: string) => [...queryKeys.cart.all, cartId] as const,
  },

  // ── Shipping ───────────────────────────────────────────────────────────────
  shipping: {
    methods: ["shipping", "methods"] as const,
  },
};
