import type { PayloadHandler } from 'payload'
import { adjustStock, restockVariant, transferStock } from './inventoryService'
import {
  ok,
  badRequest,
  forbidden,
  notFound,
  serverError,
  parseBody,
  getAdminFromRequest,
} from './endpointHelpers'

// POST /api/inventory/adjust
// Body: { variantId, locationId, newQuantity, reason }
//
// Admin-only. Sets the stocked quantity to an absolute figure —
// used after a physical stocktake to correct discrepancies.

export const adjustStockHandler: PayloadHandler = async (req) => {
  try {
    const admin = getAdminFromRequest(req)
    if (!admin) return forbidden('Admin access required.')

    const body = await parseBody<{
      variantId?: string
      locationId?: string
      newQuantity?: number
      reason?: string
    }>(req)

    if (!body.variantId) return badRequest('variantId is required.')
    if (!body.locationId) return badRequest('locationId is required.')
    if (body.newQuantity == null || body.newQuantity < 0) {
      return badRequest('newQuantity must be a non-negative number.')
    }
    if (!body.reason?.trim()) return badRequest('A reason is required for stock adjustments.')

    await adjustStock(
      req.payload,
      body.variantId,
      body.newQuantity,
      body.locationId,
      body.reason.trim(),
      admin.id,
    )

    const level = await req.payload.find({
      collection: 'inventory-levels',
      where: {
        and: [
          { 'variant.value': { equals: body.variantId } },
          { 'location.value': { equals: body.locationId } },
        ],
      },
      limit: 1,
    })

    return ok({ success: true, inventoryLevel: level.docs[0] ?? null })
  } catch (err) {
    return serverError(err)
  }
}

// POST /api/inventory/restock
// Body: { variantId, locationId, quantity, reason }
//
// Admin-only. Adds incoming stock (purchase order received, supplier delivery, etc.)

export const restockHandler: PayloadHandler = async (req) => {
  try {
    const admin = getAdminFromRequest(req)
    if (!admin) return forbidden('Admin access required.')

    const body = await parseBody<{
      variantId?: string
      locationId?: string
      quantity?: number
      reason?: string
    }>(req)

    if (!body.variantId) return badRequest('variantId is required.')
    if (!body.locationId) return badRequest('locationId is required.')
    if (!body.quantity || body.quantity <= 0) {
      return badRequest('quantity must be a positive number.')
    }
    if (!body.reason?.trim()) return badRequest('A reason is required (e.g. PO number).')

    await restockVariant(
      req.payload,
      body.variantId,
      body.quantity,
      body.locationId,
      body.reason.trim(),
      admin.id,
    )

    return ok({ success: true })
  } catch (err) {
    return serverError(err)
  }
}

// POST /api/inventory/transfer
// Body: { variantId, fromLocationId, toLocationId, quantity, reason }
//
// Admin-only. Moves stock between locations.

export const transferStockHandler: PayloadHandler = async (req) => {
  try {
    const admin = getAdminFromRequest(req)
    if (!admin) return forbidden('Admin access required.')

    const body = await parseBody<{
      variantId?: string
      fromLocationId?: string
      toLocationId?: string
      quantity?: number
      reason?: string
    }>(req)

    if (!body.variantId) return badRequest('variantId is required.')
    if (!body.fromLocationId) return badRequest('fromLocationId is required.')
    if (!body.toLocationId) return badRequest('toLocationId is required.')
    if (body.fromLocationId === body.toLocationId) {
      return badRequest('fromLocationId and toLocationId must be different.')
    }
    if (!body.quantity || body.quantity <= 0) {
      return badRequest('quantity must be a positive number.')
    }
    if (!body.reason?.trim()) return badRequest('A reason is required.')

    await transferStock(
      req.payload,
      body.variantId,
      body.quantity,
      body.fromLocationId,
      body.toLocationId,
      body.reason.trim(),
      admin.id,
    )

    return ok({ success: true })
  } catch (err) {
    return serverError(err)
  }
}
