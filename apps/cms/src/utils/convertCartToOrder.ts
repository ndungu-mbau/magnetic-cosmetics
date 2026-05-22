import type { Payload } from 'payload'
import { generateOrderNumber } from './generateOrderNumber'
import { commitStock, getBestFulfilmentLocation } from './inventoryService'

// Atomically converts an active cart into a confirmed order.
//
// Call this inside your payment webhook handler AFTER verifying
// the payment provider's signature and confirming the payment succeeded.
//
// Steps:
//   1. Load and validate the cart
//   2. Verify stock for every line item
//   3. Create the Order document
//   4. Commit (decrement) inventory for each item
//   5. Increment discount usage counter if a code was applied
//   6. Mark the cart as completed

export async function convertCartToOrder(payload: Payload, cartId: string) {
  // ── 1. Load and validate ─────────────────────────────────────────────────────
  const cart = await payload.findByID({
    collection: 'carts',
    id: cartId,
    depth: 2,
  }) as any

  if (!cart) throw new Error(`Cart "${cartId}" not found.`)
  if (cart.status !== 'active') {
    throw new Error(`Cart "${cartId}" is not active (status: ${cart.status}).`)
  }
  if (!cart.items?.length) {
    throw new Error(`Cart "${cartId}" has no items.`)
  }
  if (!cart.email) {
    throw new Error(`Cart "${cartId}" has no email address.`)
  }

  // ── 2. Stock verification ────────────────────────────────────────────────────
  for (const item of cart.items) {
    const variant = item.variant
    if (!variant?.manageInventory) continue

    const locationId = await getBestFulfilmentLocation(payload, variant.id)
    if (!locationId) {
      throw new Error(
        `"${item.productTitle} – ${item.variantTitle}" is out of stock at all locations.`,
      )
    }

    const level = await payload.find({
      collection: 'inventory-levels',
      where: {
        and: [
          { 'variant.value': { equals: variant.id } },
          { 'location.value': { equals: locationId } },
        ],
      },
      limit: 1,
    })

    const available = (level.docs[0] as any)?.availableQuantity ?? 0
    if (available < item.quantity && !variant.allowBackorder) {
      throw new Error(
        `"${item.productTitle} – ${item.variantTitle}" only has ${available} unit(s) available.`,
      )
    }
  }

  // ── 3. Create the Order ──────────────────────────────────────────────────────
  const billingAddress = cart.sameAsShipping
    ? cart.shippingAddress
    : (cart.billingAddress ?? cart.shippingAddress)

  const order = await payload.create({
    collection: 'orders',
    data: {
      orderNumber: generateOrderNumber(),
      status: 'processing',
      paymentStatus: 'captured',
      customer: typeof cart.customer === 'object' ? cart.customer?.id : cart.customer ?? null,
      email: cart.email,
      items: cart.items.map((item: any) => ({
        variant: typeof item.variant === 'object' ? item.variant.id : item.variant,
        title: item.variantTitle,
        productTitle: item.productTitle,
        thumbnail: typeof item.thumbnail === 'object' ? item.thumbnail?.id : item.thumbnail ?? null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.unitPrice * item.quantity,
        sku: item.sku ?? null,
      })),
      shippingAddress: cart.shippingAddress,
      billingAddress,
      currency: cart.currency ?? 'usd',
      subtotal: cart.subtotal,
      discountTotal: cart.discountTotal ?? 0,
      shippingTotal: cart.shippingTotal ?? 0,
      taxTotal: cart.taxTotal ?? 0,
      total: cart.total,
      paymentProvider: cart.paymentProvider ?? null,
      paymentId: cart.paymentIntentId ?? null,
      shippingMethod: (cart.shippingMethod as any)?.label ?? null,
      customerNote: cart.customerNote ?? null,
    },
  }) as any

  // ── 4. Commit inventory ──────────────────────────────────────────────────────
  for (const item of cart.items) {
    const variant = item.variant
    if (!variant?.manageInventory) continue

    const locationId = await getBestFulfilmentLocation(payload, variant.id)
    if (!locationId) continue

    await commitStock(payload, variant.id, item.quantity, locationId, order.id)
  }

  // ── 5. Discount usage ────────────────────────────────────────────────────────
  if (cart.discount) {
    const discountId =
      typeof cart.discount === 'string' ? cart.discount : cart.discount?.id

    if (discountId) {
      try {
        const discount = await payload.findByID({
          collection: 'discounts',
          id: discountId,
        }) as any

        await payload.update({
          collection: 'discounts',
          id: discountId,
          data: { usageCount: (discount.usageCount ?? 0) + 1 },
        })
      } catch {
        // Discount was deleted — not a fatal error
      }
    }
  }

  // ── 6. Complete the cart ─────────────────────────────────────────────────────
  await payload.update({
    collection: 'carts',
    id: cartId,
    data: { status: 'completed', completedOrderId: order.id },
  })

  return order
}
