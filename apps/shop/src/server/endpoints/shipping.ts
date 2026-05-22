import { cmsRequest } from "../client";

export type ShippingMethod = {
  id: string;
  label: string;
  price: number; // smallest currency unit
  estimatedDays: number;
};

// GET /api/shipping-methods  (custom Payload endpoint)
export async function getShippingMethods(): Promise<ShippingMethod[]> {
  return cmsRequest<ShippingMethod[]>("/shipping-methods");
}
