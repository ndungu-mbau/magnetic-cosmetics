import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries/utils/query-keys";
import { getShippingMethods } from "@/server/endpoints/shipping";

// Available shipping methods — fetched once and cached for the session.
// Displayed in the checkout shipping step.
export function useShippingMethods() {
  return useQuery({
    queryKey: queryKeys.shipping.methods,
    queryFn: getShippingMethods,
    staleTime: 1000 * 60 * 60, // shipping methods change infrequently
  });
}
