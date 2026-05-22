import { cmsRequest } from "../client";
import type { Cart } from "@magnetic/types";

// ── Input types ────────────────────────────────────────────────────────────────

export type CartItem = {
  variant: string;
  quantity: number;
  unitPrice: number;
  variantTitle: string;
  productTitle: string;
  sku?: string;
  thumbnail?: string;
};

export type CartAddress = {
  firstName?: string;
  lastName?: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  postalCode: string;
  countryCode: string;
  phone?: string;
};

// ── Endpoints ──────────────────────────────────────────────────────────────────

// POST /api/carts
export async function createCart(token?: string): Promise<Cart> {
  return cmsRequest<Cart>("/carts", undefined, {
    method: "POST",
    body: { status: "active" },
    token,
  });
}

// GET /api/carts/:id
export async function getCart(cartId: string, token?: string): Promise<Cart> {
  return cmsRequest<Cart>(`/carts/${cartId}`, { depth: 2 }, { token });
}

// PATCH /api/carts/:id
export async function updateCart(
  cartId: string,
  data: Partial<Cart>,
  token?: string,
): Promise<Cart> {
  return cmsRequest<Cart>(`/carts/${cartId}`, undefined, {
    method: "PATCH",
    body: data,
    token,
  });
}

// POST /api/carts/:id/recalculate  (custom Payload endpoint)
export async function recalculateCart(
  cartId: string,
  token?: string,
): Promise<Cart> {
  return cmsRequest<Cart>(`/carts/${cartId}/recalculate`, undefined, {
    method: "POST",
    token,
  });
}

// POST /api/carts/:id/discount  (custom Payload endpoint)
export async function applyDiscount(
  cartId: string,
  code: string,
  token?: string,
): Promise<Cart> {
  return cmsRequest<Cart>(`/carts/${cartId}/discount`, undefined, {
    method: "POST",
    body: { code },
    token,
  });
}

// DELETE /api/carts/:id/discount  (custom Payload endpoint)
export async function removeDiscount(
  cartId: string,
  token?: string,
): Promise<Cart> {
  return cmsRequest<Cart>(`/carts/${cartId}/discount`, undefined, {
    method: "DELETE",
    token,
  });
}

// POST /api/carts/:id/shipping-method  (custom Payload endpoint)
export async function setShippingMethod(
  cartId: string,
  methodId: string,
  token?: string,
): Promise<Cart> {
  return cmsRequest<Cart>(`/carts/${cartId}/shipping-method`, undefined, {
    method: "POST",
    body: { methodId },
    token,
  });
}

// POST /api/carts/:id/payment-intent  (custom Payload endpoint)
export async function createPaymentIntent(
  cartId: string,
  token?: string,
): Promise<{ clientSecret: string }> {
  return cmsRequest<{ clientSecret: string }>(
    `/carts/${cartId}/payment-intent`,
    undefined,
    { method: "POST", token },
  );
}
