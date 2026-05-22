// Client
export { cmsRequest, CMSError } from "@/server/client";
export type {
  PaginatedResponse,
  CMSRequestOptions,
  QueryParams,
} from "@/server/client";

// Endpoints
export {
  loginCustomer,
  registerCustomer,
  getMe,
  updateCustomer,
  logoutCustomer,
  forgotPassword,
  resetPassword,
} from "./customers";
export { getCategories } from "./categories";
export { getCollections } from "./collections";
export { getProducts, type ProductListParams } from "./products";
export { getProductReviews } from "./reviews";
export { getMyOrders, getOrderByNumber } from "./orders";
export {
  createCart,
  getCart,
  updateCart,
  recalculateCart,
  applyDiscount,
  removeDiscount,
  setShippingMethod,
  createPaymentIntent,
} from "./cart";
export { getShippingMethods } from "./shipping";
