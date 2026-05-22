import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./utils/query-keys";
import {
  createCart,
  getCart,
  updateCart,
  recalculateCart,
  applyDiscount,
  removeDiscount,
  setShippingMethod,
  createPaymentIntent,
  type CartItem,
  type CartAddress,
} from "@/server/endpoints/cart";
import type { Cart } from "@magnetic/types";
import { useAuthStore } from "@/lib/stores/auth";
import { useCartStore } from "@/lib/stores/cart";

// ── Internal helpers ───────────────────────────────────────────────────────────

// Returns a stable function that recalculates server-side totals then
// invalidates the cart query. Used as onSuccess in every cart mutation.
function useRefreshCart() {
  const { cartId } = useCartStore();
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return async () => {
    if (!cartId) return;
    await recalculateCart(cartId, token ?? undefined);
    queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail(cartId) });
  };
}

// ── Read ───────────────────────────────────────────────────────────────────────

export function useCart() {
  const { cartId } = useCartStore();
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: queryKeys.cart.detail(cartId ?? ""),
    queryFn: () => getCart(cartId!, token ?? undefined),
    enabled: Boolean(cartId),
    staleTime: 0, // always revalidate — cart data must be fresh
  });
}

// Derived selector — total item count for the cart icon badge
export function useCartItemCount(): number {
  const { data: cart } = useCart();
  const items = (cart?.items as any[]) ?? [];
  return items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
}

// ── Mutations ──────────────────────────────────────────────────────────────────

// Low-level update — used internally by the hooks below
export function useUpdateCart() {
  const { cartId } = useCartStore();
  const token = useAuthStore((s) => s.token);
  const refreshCart = useRefreshCart();

  return useMutation({
    mutationFn: (data: Partial<Cart>) =>
      updateCart(cartId!, data, token ?? undefined),
    onSuccess: refreshCart,
  });
}

// ── Item management ────────────────────────────────────────────────────────────

export function useAddToCart() {
  const { data: cart } = useCart();
  const { cartId, setCartId } = useCartStore();
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: CartItem) => {
      let activeCartId = cartId;

      // Create a new cart on first add if one doesn't exist yet
      if (!activeCartId) {
        const newCart = await createCart(token ?? undefined);
        setCartId(newCart.id.toString());
        activeCartId = newCart.id.toString();
      }

      const existingItems: any[] = (cart?.items as any[]) ?? [];
      const existingIndex = existingItems.findIndex(
        (i) => i.variant === item.variant || i.variant?.id === item.variant,
      );

      const updatedItems =
        existingIndex >= 0
          ? existingItems.map((i, idx) =>
              idx === existingIndex
                ? { ...i, quantity: i.quantity + item.quantity }
                : i,
            )
          : [
              ...existingItems,
              {
                variant: item.variant,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                variantTitle: item.variantTitle,
                productTitle: item.productTitle,
                sku: item.sku ?? null,
                thumbnail: item.thumbnail ?? null,
              },
            ];

      return updateCart(
        activeCartId,
        { items: updatedItems },
        token ?? undefined,
      );
    },
    onSuccess: async (_, variables) => {
      const activeCartId = cartId;
      if (!activeCartId) return;
      await recalculateCart(activeCartId, token ?? undefined);
      queryClient.invalidateQueries({
        queryKey: queryKeys.cart.detail(activeCartId),
      });
    },
  });
}

export function useRemoveFromCart() {
  const { data: cart } = useCart();
  const { cartId } = useCartStore();
  const token = useAuthStore((s) => s.token);
  const refreshCart = useRefreshCart();

  return useMutation({
    mutationFn: async (variantId: string) => {
      const existingItems: any[] = (cart?.items as any[]) ?? [];
      const updatedItems = existingItems.filter(
        (i) => i.variant !== variantId && i.variant?.id !== variantId,
      );
      return updateCart(cartId!, { items: updatedItems }, token ?? undefined);
    },
    onSuccess: refreshCart,
  });
}

export function useUpdateItemQuantity() {
  const { data: cart } = useCart();
  const { cartId } = useCartStore();
  const token = useAuthStore((s) => s.token);
  const refreshCart = useRefreshCart();

  return useMutation({
    mutationFn: async ({
      variantId,
      quantity,
    }: {
      variantId: string;
      quantity: number;
    }) => {
      const existingItems: any[] = (cart?.items as any[]) ?? [];
      const updatedItems =
        quantity <= 0
          ? existingItems.filter(
              (i) => i.variant !== variantId && i.variant?.id !== variantId,
            )
          : existingItems.map((i) =>
              i.variant === variantId || i.variant?.id === variantId
                ? { ...i, quantity }
                : i,
            );
      return updateCart(cartId!, { items: updatedItems }, token ?? undefined);
    },
    onSuccess: refreshCart,
  });
}

// ── Checkout steps ─────────────────────────────────────────────────────────────

export function useSetCartEmail() {
  const { cartId } = useCartStore();
  const token = useAuthStore((s) => s.token);
  const refreshCart = useRefreshCart();

  return useMutation({
    mutationFn: (email: string) =>
      updateCart(cartId!, { email } as any, token ?? undefined),
    onSuccess: refreshCart,
  });
}

export function useSetShippingAddress() {
  const { cartId } = useCartStore();
  const token = useAuthStore((s) => s.token);
  const refreshCart = useRefreshCart();

  return useMutation({
    mutationFn: ({
      address,
      sameAsShipping = true,
    }: {
      address: CartAddress;
      sameAsShipping?: boolean;
    }) =>
      updateCart(
        cartId!,
        { shippingAddress: address, sameAsShipping } as any,
        token ?? undefined,
      ),
    onSuccess: refreshCart,
  });
}

export function useSetBillingAddress() {
  const { cartId } = useCartStore();
  const token = useAuthStore((s) => s.token);
  const refreshCart = useRefreshCart();

  return useMutation({
    mutationFn: (address: CartAddress) =>
      updateCart(
        cartId!,
        { billingAddress: address, sameAsShipping: false } as any,
        token ?? undefined,
      ),
    onSuccess: refreshCart,
  });
}

export function useSetShippingMethod() {
  const { cartId } = useCartStore();
  const token = useAuthStore((s) => s.token);
  const refreshCart = useRefreshCart();

  return useMutation({
    mutationFn: (methodId: string) =>
      setShippingMethod(cartId!, methodId, token ?? undefined),
    onSuccess: refreshCart,
  });
}

// ── Discounts ──────────────────────────────────────────────────────────────────

export function useApplyDiscount() {
  const { cartId } = useCartStore();
  const token = useAuthStore((s) => s.token);
  const refreshCart = useRefreshCart();

  return useMutation({
    mutationFn: (code: string) =>
      applyDiscount(cartId!, code, token ?? undefined),
    onSuccess: refreshCart,
  });
}

export function useRemoveDiscount() {
  const { cartId } = useCartStore();
  const token = useAuthStore((s) => s.token);
  const refreshCart = useRefreshCart();

  return useMutation({
    mutationFn: () => removeDiscount(cartId!, token ?? undefined),
    onSuccess: refreshCart,
  });
}

// ── Payment ────────────────────────────────────────────────────────────────────

export function useCreatePaymentIntent() {
  const { cartId } = useCartStore();
  const token = useAuthStore((s) => s.token);

  return useMutation({
    mutationFn: () => createPaymentIntent(cartId!, token ?? undefined),
  });
}
