import type { Payload } from 'payload'
import type { Cart, Discount } from '../payload-types'

// ── Tax rates ──────────────────────────────────────────────────────────────────
// Extend this map as you sell into more regions.
// Keys are ISO 3166-1 alpha-2 country codes; values are decimal rates.
const TAX_RATES: Record<string, number> = {
  ke: 0.16,   // Kenya VAT 16%
  gb: 0.20,   // UK VAT 20%
  us: 0.00,   // US — no federal VAT; handle at state level if needed
  default: 0.00,
}

// ── Shipping rates ─────────────────────────────────────────────────────────────
// Simple flat-rate table. Replace with a shipping-rate collection or a
// carrier API (Shippo, EasyPost) for production.
export type ShippingMethod = {
  id: string
  label: string
  price: number           // in smallest currency unit (cents / minor unit)
  estimatedDays: number
}

const SHIPPING_METHODS: ShippingMethod[] = [
  { id: 'standard', label: 'Standard Delivery',  price: 50000,  estimatedDays: 5 },
  { id: 'express',  label: 'Express Delivery',    price: 120000, estimatedDays: 2 },
  { id: 'pickup',   label: 'Click & Collect',     price: 0,      estimatedDays: 1 },
]

export function getShippingMethods(): ShippingMethod[] {
  return SHIPPING_METHODS
}

export function getShippingMethod(id: string): ShippingMethod | undefined {
  return SHIPPING_METHODS.find((m) => m.id === id)
}

// ── Core recalculation ─────────────────────────────────────────────────────────

export type CartTotals = {
  subtotal: number
  discountTotal: number
  shippingTotal: number
  taxTotal: number
  total: number
}

export async function recalculateCartTotals(
  payload: Payload,
  cart: Cart,
): Promise<CartTotals> {
  const items = (cart.items as any[]) ?? []

  // 1. Subtotal — sum of (unitPrice × quantity) for all line items
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  )

  // 2. Discount — validate and apply the discount if one is attached
  let discountTotal = 0
  if (cart.discount) {
    const discountId =
      typeof cart.discount === 'string' ? cart.discount : (cart.discount as any).id

    try {
      const discount = await payload.findByID({
        collection: 'discounts',
        id: discountId,
      }) as Discount

      discountTotal = calculateDiscount(discount, subtotal, items)
    } catch {
      // Discount no longer exists — silently zero it out
      discountTotal = 0
    }
  }

  // 3. Shipping
  const shippingMethod = (cart.shippingMethod as any)
  const shippingTotal = shippingMethod?.price ?? 0

  // 4. Tax — applied on (subtotal − discount), not on shipping
  const countryCode = (cart.shippingAddress as any)?.countryCode?.toLowerCase() ?? 'default'
  const taxRate = TAX_RATES[countryCode] ?? TAX_RATES.default
  const taxableAmount = Math.max(0, subtotal - discountTotal)
  const taxTotal = Math.round(taxableAmount * taxRate)

  // 5. Grand total
  const total = Math.max(0, subtotal - discountTotal + shippingTotal + taxTotal)

  return { subtotal, discountTotal, shippingTotal, taxTotal, total }
}

// ── Discount calculation ───────────────────────────────────────────────────────

function calculateDiscount(
  discount: Discount,
  subtotal: number,
  items: any[],
): number {
  const now = new Date()

  // Validity checks
  if (!discount.isActive) return 0
  if (discount.startsAt && new Date(discount.startsAt) > now) return 0
  if (discount.endsAt && new Date(discount.endsAt) < now) return 0
  if (discount.usageLimit && (discount.usageCount ?? 0) >= discount.usageLimit) return 0
  if (discount.minimumAmount && subtotal < discount.minimumAmount) return 0

  switch (discount.type) {
    case 'percentage':
      return Math.round(subtotal * ((discount.value ?? 0) / 100))

    case 'fixed':
      return Math.min(subtotal, discount.value ?? 0)

    case 'free_shipping':
      return 0   // handled by zeroing shippingTotal — not a subtotal discount

    default:
      return 0
  }
}
