import { cmsRequest, type PaginatedResponse } from "../client";
import type { ProductCollection } from "@magnetic/types";

// GET /api/product-collections
export async function getCollections(): Promise<
  PaginatedResponse<ProductCollection>
> {
  return cmsRequest<PaginatedResponse<ProductCollection>>(
    "/product-collections",
    {
      limit: 100,
      depth: 1,
    },
  );
}

// GET /api/product-collections?where[handle][equals]=:handle
export async function getCollectionByHandle(
  handle: string,
): Promise<ProductCollection | null> {
  const data = await cmsRequest<PaginatedResponse<ProductCollection>>(
    "/product-collections",
    { "where[handle][equals]": handle, depth: 1, limit: 1 },
  );
  return data.docs[0] ?? null;
}
