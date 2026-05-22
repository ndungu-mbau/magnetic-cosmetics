import { cmsRequest, type PaginatedResponse } from "../client";
import type { Order } from "@magnetic/types";

// GET /api/orders — returns only the authenticated customer's orders
// (Payload access control enforces this server-side)
export async function getMyOrders(
  token: string,
  page = 1,
): Promise<PaginatedResponse<Order>> {
  return cmsRequest<PaginatedResponse<Order>>(
    "/orders",
    { depth: 2, page, limit: 10, sort: "-createdAt" },
    { token },
  );
}

// GET /api/orders?where[orderNumber][equals]=:orderNumber
export async function getOrderByNumber(
  orderNumber: string,
  token: string,
): Promise<Order | null> {
  const data = await cmsRequest<PaginatedResponse<Order>>(
    "/orders",
    { "where[orderNumber][equals]": orderNumber, depth: 2, limit: 1 },
    { token },
  );
  return data.docs[0] ?? null;
}
