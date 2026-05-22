import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { queryKeys } from "./utils/query-keys";
import {
  getProducts,
  getProductByHandle,
  getVariantsByProduct,
  type ProductListParams,
} from "@/server/endpoints/products";

// ── Paginated product list ─────────────────────────────────────────────────────
// Use this for a grid with numbered pagination controls.

export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => getProducts(params),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev, // keeps old data visible during page transitions
  });
}

// ── Infinite scroll ────────────────────────────────────────────────────────────
// Use this for a "Load more" product grid.
// Flatten pages: data.pages.flatMap(p => p.docs)

export function useInfiniteProducts(
  params: Omit<ProductListParams, "page"> = {},
) {
  return useInfiniteQuery({
    queryKey: queryKeys.products.infiniteList(params),
    queryFn: ({ pageParam }) => getProducts({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60 * 5,
  });
}

// ── Single product by URL handle ───────────────────────────────────────────────
// depth=2 means variants and their images are already populated —
// no need for useProductVariants on the PDP unless you need live stock.

export function useProduct(handle: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(handle),
    queryFn: () => getProductByHandle(handle),
    enabled: Boolean(handle),
    staleTime: 1000 * 60 * 10,
  });
}

// ── All variants for a product ────────────────────────────────────────────────
// Useful when you need live inventory data separate from the product fetch,
// or when the product was fetched at depth=1.

export function useProductVariants(productId: string) {
  return useQuery({
    queryKey: queryKeys.products.variants(productId),
    queryFn: () => getVariantsByProduct(productId),
    enabled: Boolean(productId),
    staleTime: 1000 * 60 * 5,
  });
}
