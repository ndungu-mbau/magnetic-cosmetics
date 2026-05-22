import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./utils/query-keys";
import { getMyOrders, getOrderByNumber } from "@/server/endpoints/orders";
import { useAuthStore } from "@/lib/stores/auth";

// Paginated list of the authenticated customer's orders
export function useMyOrders(page = 1) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: queryKeys.customer.orders(token ?? "", page),
    queryFn: () => getMyOrders(token!, page),
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  });
}

// Single order by order number — for the order confirmation and detail pages
export function useOrder(orderNumber: string) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: queryKeys.customer.order(token ?? "", orderNumber),
    queryFn: () => getOrderByNumber(orderNumber, token!),
    enabled: Boolean(token) && Boolean(orderNumber),
    staleTime: 1000 * 60 * 2,
  });
}
