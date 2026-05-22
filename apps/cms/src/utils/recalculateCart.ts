import type { PayloadHandler } from 'payload'
import { recalculateCartTotals } from './cartTotals'
import { ok, notFound, serverError } from './endpointHelpers'

// POST /api/carts/:id/recalculate
//
// Recomputes subtotal, discountTotal, shippingTotal, taxTotal, and total
// server-side and persists the updated figures on the cart document.
// Call this after any cart mutation: item add/remove, address change,
// shipping method selection, or discount application.

export const recalculateCartHandler: PayloadHandler = async (req) => {
  try {
    const { payload, routeParams } = req
    const cartId = routeParams?.id as string

    const cart = await payload
      .findByID({
        collection: 'carts',
        id: cartId,
        depth: 2,
      })
      .catch(() => null)

    if (!cart) return notFound('Cart')

    const totals = await recalculateCartTotals(payload, cart as any)

    const updated = await payload.update({
      collection: 'carts',
      id: cartId,
      data: totals,
    })

    return ok(updated)
  } catch (err) {
    return serverError(err)
  }
}
