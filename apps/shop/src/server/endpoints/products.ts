import { cmsRequest, type PaginatedResponse } from "../client";
import type { Product, ProductVariant } from "@magnetic/types";

// ── Params ─────────────────────────────────────────────────────────────────────

export type ProductListParams = {
  page?: number;
  limit?: number;
  category?: string; // category handle
  collection?: string; // collection handle
  fragranceType?: string; // edp | edt | edc | parfum | etc.
  gender?: string; // unisex | men | women
  search?: string;
  sort?: "createdAt" | "-createdAt" | "title" | "-title" | "price" | "-price";
};

// ── Endpoints ──────────────────────────────────────────────────────────────────

// GET /api/products
export async function getProducts(
  params: ProductListParams = {},
): Promise<PaginatedResponse<Product>> {
  const query: Record<string, string | number | boolean> = {
    depth: 1,
    limit: params.limit ?? 12,
    page: params.page ?? 1,
    "where[status][equals]": "published",
  };

  if (params.sort) query.sort = params.sort;
  if (params.search) query.search = params.search;
  if (params.category)
    query["where[category.handle][equals]"] = params.category;
  if (params.collection)
    query["where[collection.handle][equals]"] = params.collection;
  if (params.fragranceType)
    query["where[fragranceType][equals]"] = params.fragranceType;
  if (params.gender) query["where[gender][in]"] = `${params.gender},unisex`;

  return cmsRequest<PaginatedResponse<Product>>("/products", query);
}

// GET /api/products?where[handle][equals]=:handle
// depth=2 so variants and their images are populated inline
export async function getProductByHandle(
  handle: string,
): Promise<Product | null> {
  const data = await cmsRequest<PaginatedResponse<Product>>("/products", {
    "where[handle][equals]": handle,
    "where[status][equals]": "published",
    depth: 2,
    limit: 1,
  });
  return data.docs[0] ?? null;
}

// GET /api/product-variants?where[product][equals]=:id
export async function getVariantsByProduct(
  productId: string,
): Promise<PaginatedResponse<ProductVariant>> {
  return cmsRequest<PaginatedResponse<ProductVariant>>("/product-variants", {
    "where[product][equals]": productId,
    sort: "variantRank",
    limit: 50,
    depth: 1,
  });
}
