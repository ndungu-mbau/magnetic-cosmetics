import { cmsRequest, type PaginatedResponse } from "../client";
import type { ProductCategory } from "@magnetic/types";

// GET /api/product-categories — top-level only (no parent)
export async function getCategories(): Promise<
  PaginatedResponse<ProductCategory>
> {
  return cmsRequest<PaginatedResponse<ProductCategory>>("/product-categories", {
    "where[isActive][equals]": true,
    "where[parent][exists]": false,
    sort: "rank",
    limit: 100,
    depth: 1,
  });
}

// GET /api/product-categories?where[handle][equals]=:handle
export async function getCategoryByHandle(
  handle: string,
): Promise<ProductCategory | null> {
  const data = await cmsRequest<PaginatedResponse<ProductCategory>>(
    "/product-categories",
    { "where[handle][equals]": handle, depth: 1, limit: 1 },
  );
  return data.docs[0] ?? null;
}

// GET /api/product-categories?where[parent][equals]=:id — subcategories
export async function getSubcategories(
  parentId: string,
): Promise<PaginatedResponse<ProductCategory>> {
  return cmsRequest<PaginatedResponse<ProductCategory>>("/product-categories", {
    "where[parent][equals]": parentId,
    "where[isActive][equals]": true,
    sort: "rank",
    limit: 100,
    depth: 1,
  });
}
