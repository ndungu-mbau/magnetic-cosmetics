import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./utils/query-keys";
import {
  getCollections,
  getCollectionByHandle,
} from "@/server/endpoints/collections";

// All collections — used in editorial nav sections like "Featured Collections"
export function useCollections() {
  return useQuery({
    queryKey: queryKeys.collections.list(),
    queryFn: getCollections,
    staleTime: 1000 * 60 * 60,
  });
}

// Single collection by handle — used on collection landing pages
export function useCollection(handle: string) {
  return useQuery({
    queryKey: queryKeys.collections.detail(handle),
    queryFn: () => getCollectionByHandle(handle),
    enabled: Boolean(handle),
    staleTime: 1000 * 60 * 60,
  });
}
