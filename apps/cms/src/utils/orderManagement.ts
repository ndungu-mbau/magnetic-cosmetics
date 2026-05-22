import type { PayloadHandler } from 'payload'
import { returnStock, getBestFulfilmentLocation } from './inventoryService'
import { sendShipmentNotificationEmail } from './emailService'
import {
  ok,
  badRequest,
  forbidden,
  notFound,
  conflict,
  serverError,
  parseBody,
  getAdminFromRequest,
} from './endpointHelpers'

// POST /api/orders/:id/fulfil
// Body: { trackingNumber?: string, trackingUrl?: string }
//
// Admin-only. Marks the order as shipped and fires the shipment
// notification email to the customer.

export const fulfilOrderHandler: PayloadHandler = async (req) => {
  try {
    const admin = getAdminFromRequest(req)
    if (!admin) return forbidden('Admin access required.')

    const { payload, routeParams } = req
    const orderId = routeParams?.id as string

    const order = (await payload
      .findByID({
        collection: 'orders',
        id: orderId,
        depth: 1,
      })
      .catch(() => null)) as any

    if (!order) return notFound('Order')

    if (order.status === 'shipped' || order.status === 'delivered') {
      return conflict(`Order is already ${order.status}.`)
    }

    if (order.status === 'cancelled') {
      return badRequest('Cannot fulfil a cancelled order.')
    }

    const body = await parseBody<{
      trackingNumber?: string
      trackingUrl?: string
    }>(req)

    const updated = (await payload.update({
      collection: 'orders',
      id: orderId,
      data: {
        status: 'shipped',
        shippedAt: new Date().toISOString(),
        trackingNumber: body.trackingNumber ?? null,
        trackingUrl: body.trackingUrl ?? null,
      },
    })) as any

    // Non-blocking notification
    sendShipmentNotificationEmail({
      to: order.email,
      orderNumber: order.orderNumber,
      firstName: order.customer?.firstName,
      trackingNumber: body.trackingNumber,
      trackingUrl: body.trackingUrl,
      shippingMethod: order.shippingMethod,
    }).catch(console.error)

    return ok(updated)
  } catch (err) {
    return serverError(err)
  }
}

// POST /api/orders/:id/cancel
//
// Admin-only. Cancels an order that has not yet shipped.
// Does NOT currently refund the payment — handle refunds in your
// payment provider's dashboard or extend this with a Stripe refund call.

export const cancelOrderHandler: PayloadHandler = async (req) => {
  try {
    const admin = getAdminFromRequest(req)
    if (!admin) return forbidden('Admin access required.')

    const { payload, routeParams } = req
    const orderId = routeParams?.id as string

    const order = (await payload
      .findByID({
        collection: 'orders',
        id: orderId,
        depth: 2,
      })
      .catch(() => null)) as any

    if (!order) return notFound('Order')

    if (['shipped', 'delivered'].includes(order.status)) {
      return conflict('Cannot cancel an order that has already shipped.')
    }

    if (order.status === 'cancelled') {
      return conflict('Order is already cancelled.')
    }

    // Return inventory for each managed variant
    for (const item of order.items ?? []) {
      const variant = item.variant
      if (!variant?.manageInventory) continue

      const locationId = await getBestFulfilmentLocation(payload, variant.id)
      if (!locationId) continue

      await returnStock(payload, variant.id, item.quantity, locationId, orderId, admin.id)
    }

    const updated = await payload.update({
      collection: 'orders',
      id: orderId,
      data: {
        status: 'cancelled',
        paymentStatus: 'cancelled',
      },
    })

    return ok(updated)
  } catch (err) {
    return serverError(err)
  }
}

// POST /api/orders/:id/return
// Body: { items: Array<{ variantId: string, quantity: number }>, reason?: string }
//
// Admin-only. Processes a partial or full return.
// Restocks the returned items and updates the order payment status.

export const returnOrderHandler: PayloadHandler = async (req) => {
  try {
    const admin = getAdminFromRequest(req)
    if (!admin) return forbidden('Admin access required.')

    const { payload, routeParams } = req
    const orderId = routeParams?.id as string

    const order = (await payload
      .findByID({
        collection: 'orders',
        id: orderId,
        depth: 2,
      })
      .catch(() => null)) as any

    if (!order) return notFound('Order')

    if (!['shipped', 'delivered', 'processing'].includes(order.status)) {
      return badRequest(`Cannot process a return for an order with status "${order.status}".`)
    }

    const body = await parseBody<{
      items?: Array<{ variantId: string; quantity: number }>
      reason?: string
    }>(req)

    if (!body.items?.length) {
      return badRequest('At least one item is required for a return.')
    }

    // Validate quantities against the original order
    for (const returnItem of body.items) {
      const orderItem = order.items?.find(
        (i: any) => i.variant === returnItem.variantId || i.variant?.id === returnItem.variantId,
      )

      if (!orderItem) {
        return badRequest(`Variant "${returnItem.variantId}" is not in this order.`)
      }

      if (returnItem.quantity > orderItem.quantity) {
        return badRequest(
          `Cannot return more units than ordered for variant "${returnItem.variantId}".`,
        )
      }
    }

    // Restock each returned item
    for (const returnItem of body.items) {
      const orderItem = order.items?.find(
        (i: any) => i.variant === returnItem.variantId || i.variant?.id === returnItem.variantId,
      )

      const variant = orderItem?.variant
      if (!variant?.manageInventory) continue

      const locationId = await getBestFulfilmentLocation(payload, variant.id)
      if (!locationId) continue

      await returnStock(payload, variant.id, returnItem.quantity, locationId, orderId, admin.id)
    }

    const isFullReturn =
      body.items.length === order.items?.length &&
      body.items.every((ri: any) => {
        const oi = order.items?.find(
          (i: any) => i.variant === ri.variantId || i.variant?.id === ri.variantId,
        )
        return oi && ri.quantity === oi.quantity
      })

    const updated = await payload.update({
      collection: 'orders',
      id: orderId,
      data: {
        status: isFullReturn ? 'refunded' : order.status,
        paymentStatus: isFullReturn ? 'refunded' : 'partially_refunded',
        internalNote: body.reason ? `Return processed: ${body.reason}` : 'Return processed.',
      },
    })

    return ok(updated)
  } catch (err) {
    return serverError(err)
  }
}
