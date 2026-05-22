import type { PayloadHandler } from 'payload'
import { validateDiscountCode } from './validateDiscount'
import { recalculateCartTotals } from './cartTotals'
import {
  ok,
  badRequest,
  notFound,
  serverError,
  parseBody,
  getCustomerFromRequest,
} from './endpointHelpers'

// POST /api/carts/:id/discount
// Body: { code: string }
//
// Validates the discount code against the cart and customer, attaches it
// to the cart, then recalculates and returns the updated cart totals.

export const applyDiscountHandler: PayloadHandler = async (req) => {
  try {
    const { payload, routeParams } = req
    const cartId = routeParams?.id as string
    const body = await parseBody<{ code?: string }>(req)

    if (!body.code?.trim()) {
      return badRequest('A discount code is required.')
    }

    const cart = await payload.findByID({
      collection: 'carts',
      id: cartId,
      depth: 1,
    }).catch(() => null)

    if (!cart) return notFound('Cart')

    const customer = getCustomerFromRequest(req)
    const code = body.code.trim().toUpperCase()

    const validation = await validateDiscountCode(
      payload,
      code,
      (cart as any).subtotal ?? 0,
      customer?.id,
    )

    if (!validation.valid) {
      return badRequest(validation.reason)
    }

    // Attach the discount and recalculate
    await payload.update({
      collection: 'carts',
      id: cartId,
      data: { discount: validation.discount.id },
    })

    const freshCart = await payload.findByID({
      collection: 'carts',
      id: cartId,
      depth: 2,
    })

    const totals = await recalculateCartTotals(payload, freshCart as any)

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

// DELETE /api/carts/:id/discount
//
// Removes the discount from the cart and recalculates totals.

export const removeDiscountHandler: PayloadHandler = async (req) => {
  try {
    const { payload, routeParams } = req
    const cartId = routeParams?.id as string

    const cart = await payload.findByID({
      collection: 'carts',
      id: cartId,
      depth: 2,
    }).catch(() => null)

    if (!cart) return notFound('Cart')

    await payload.update({
      collection: 'carts',
      id: cartId,
      data: { discount: null, discountTotal: 0 },
    })

    const freshCart = await payload.findByID({
      collection: 'carts',
      id: cartId,
      depth: 2,
    })

    const totals = await recalculateCartTotals(payload, freshCart as any)

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
