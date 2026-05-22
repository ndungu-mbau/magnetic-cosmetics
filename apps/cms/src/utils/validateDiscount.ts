import type { Payload } from 'payload'
import type { Discount } from '../payload-types'

export type DiscountValidationResult =
  | { valid: true; discount: Discount }
  | { valid: false; reason: string }

// Validates a discount code against the current cart state.
// Returns either the valid discount or a human-readable rejection reason.

export async function validateDiscountCode(
  payload: Payload,
  code: string,
  cartSubtotal: number,
  customerId?: string,
): Promise<DiscountValidationResult> {
  // Find the discount by code (case-insensitive)
  const result = await payload.find({
    collection: 'discounts',
    where: { code: { equals: code.toUpperCase() } },
    limit: 1,
  })

  if (!result.docs.length) {
    return { valid: false, reason: 'This discount code does not exist.' }
  }

  const discount = result.docs[0] as Discount
  const now = new Date()

  if (!discount.isActive) {
    return { valid: false, reason: 'This discount code is no longer active.' }
  }

  if (discount.startsAt && new Date(discount.startsAt) > now) {
    return { valid: false, reason: 'This discount code is not yet valid.' }
  }

  if (discount.endsAt && new Date(discount.endsAt) < now) {
    return { valid: false, reason: 'This discount code has expired.' }
  }

  if (
    discount.usageLimit != null &&
    (discount.usageCount ?? 0) >= discount.usageLimit
  ) {
    return { valid: false, reason: 'This discount code has reached its usage limit.' }
  }

  if (discount.minimumAmount != null && cartSubtotal < discount.minimumAmount) {
    const formatted = (discount.minimumAmount / 100).toFixed(2)
    return {
      valid: false,
      reason: `A minimum order of ${formatted} is required for this code.`,
    }
  }

  // Per-customer usage check
  if (discount.isOncePerCustomer && customerId) {
    const previousOrder = await payload.find({
      collection: 'orders',
      where: {
        and: [
          { 'customer.value': { equals: customerId } },
          { 'discount.value': { equals: discount.id } },
        ],
      },
      limit: 1,
    })

    if (previousOrder.docs.length > 0) {
      return {
        valid: false,
        reason: 'You have already used this discount code.',
      }
    }
  }

  return { valid: true, discount }
}
