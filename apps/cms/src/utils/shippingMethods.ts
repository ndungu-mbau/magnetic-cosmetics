import type { PayloadHandler } from 'payload'
import { getShippingMethods, getShippingMethod } from './cartTotals'
import { recalculateCartTotals } from './cartTotals'
import { ok, badRequest, notFound, serverError, parseBody } from './endpointHelpers'

// GET /api/shipping-methods
//
// Returns all available shipping methods.
// The storefront uses this to render the shipping method selector at checkout.

export const getShippingMethodsHandler: PayloadHandler = async (_req) => {
  try {
    return ok(getShippingMethods())
  } catch (err) {
    return serverError(err)
  }
}

// POST /api/carts/:id/shipping-method
// Body: { methodId: string }
//
// Sets the shipping method on the cart and recalculates totals.

export const setShippingMethodHandler: PayloadHandler = async (req) => {
  try {
    const { payload, routeParams } = req
    const cartId = routeParams?.id as string
    const body = await parseBody<{ methodId?: string }>(req)

    if (!body.methodId) {
      return badRequest('A shipping method ID is required.')
    }

    const method = getShippingMethod(body.methodId)
    if (!method) {
      return badRequest(`Unknown shipping method "${body.methodId}".`)
    }

    const cart = await payload
      .findByID({
        collection: 'carts',
        id: cartId,
        depth: 2,
      })
      .catch(() => null)

    if (!cart) return notFound('Cart')

    await payload.update({
      collection: 'carts',
      id: cartId,
      data: {
        shippingMethod: {
          id: method.id,
          label: method.label,
          price: method.price,
          estimatedDays: method.estimatedDays,
        },
        shippingTotal: method.price,
      },
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
