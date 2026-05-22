import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./utils/query-keys";
import {
  getProductReviews,
  createReview,
  type CreateReviewInput,
} from "@/server/endpoints/reviews";
import { useAuthStore } from "@/lib/stores/auth";

// Paginated approved reviews for a product
export function useProductReviews(productId: string, page = 1) {
  return useQuery({
    queryKey: queryKeys.reviews.byProduct(productId, page),
    queryFn: () => getProductReviews(productId, page),
    enabled: Boolean(productId),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });
}

// Submit a new review — pending admin approval before it appears
export function useCreateReview(productId: string) {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReviewInput) =>
      createReview(input, token ?? undefined),
    onSuccess: () => {
      // Invalidate all pages of reviews for this product
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.byProduct(productId, 1),
      });
    },
  });
}
