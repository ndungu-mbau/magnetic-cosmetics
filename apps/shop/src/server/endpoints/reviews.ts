import { cmsRequest, type PaginatedResponse } from "../client";
import type { Review } from "@magnetic/types";

// GET /api/reviews?where[product][equals]=:id
export async function getProductReviews(
  productId: string,
  page = 1,
): Promise<PaginatedResponse<Review>> {
  return cmsRequest<PaginatedResponse<Review>>("/reviews", {
    "where[product][equals]": productId,
    "where[status][equals]": "approved",
    sort: "-createdAt",
    depth: 1,
    limit: 10,
    page,
  });
}

export type CreateReviewInput = {
  product: string;
  rating: number;
  headline: string;
  body: string;
  order?: string; // optional — links to verified purchase
};

// POST /api/reviews — submitted from the storefront
export async function createReview(
  data: CreateReviewInput,
  token?: string,
): Promise<Review> {
  return cmsRequest<Review>("/reviews", undefined, {
    method: "POST",
    body: data,
    token,
  });
}
