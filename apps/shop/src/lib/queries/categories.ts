import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./utils/query-keys";
import {
  getCategories,
  getCategoryByHandle,
  getSubcategories,
} from "@/server/endpoints/categories";

// All active top-level categories — used in nav and filter UI
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: getCategories,
    staleTime: 1000 * 60 * 60, // 1 hour — categories rarely change
  });
}

// Single category by handle — used on category landing pages
export function useCategory(handle: string) {
  return useQuery({
    queryKey: queryKeys.categories.detail(handle),
    queryFn: () => getCategoryByHandle(handle),
    enabled: Boolean(handle),
    staleTime: 1000 * 60 * 60,
  });
}

// Child categories of a given parent — used for sub-nav dropdowns
export function useSubcategories(parentId: string) {
  return useQuery({
    queryKey: [...queryKeys.categories.all, "subcategories", parentId] as const,
    queryFn: () => getSubcategories(parentId),
    enabled: Boolean(parentId),
    staleTime: 1000 * 60 * 60,
  });
}
