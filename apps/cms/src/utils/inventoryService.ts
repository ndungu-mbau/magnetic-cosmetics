import type { Payload } from 'payload'

// ── Types ──────────────────────────────────────────────────────────────────────

type MovementInput = {
  variantId: string
  locationId: string
  type: string
  quantity: number // positive = stock in, negative = stock out
  quantityAfter: number
  reason?: string
  orderId?: string
  userId?: string
}

// ── Core read ──────────────────────────────────────────────────────────────────

// Total available stock for a variant across all locations (or one specific location)
export async function getAvailableStock(
  payload: Payload,
  variantId: string,
  locationId?: string,
): Promise<number> {
  const where: any = { 'variant.value': { equals: variantId } }
  if (locationId) where['location.value'] = { equals: locationId }

  const levels = await payload.find({
    collection: 'inventory-levels',
    where,
    limit: 100,
  })

  return levels.docs.reduce((sum, lvl: any) => sum + (lvl.availableQuantity ?? 0), 0)
}

// Best location to fulfil from — returns the location with the most available stock
export async function getBestFulfilmentLocation(
  payload: Payload,
  variantId: string,
): Promise<string | null> {
  const levels = await payload.find({
    collection: 'inventory-levels',
    where: {
      and: [{ 'variant.value': { equals: variantId } }, { availableQuantity: { greater_than: 0 } }],
    },
    sort: '-availableQuantity',
    limit: 1,
  })

  if (!levels.docs.length) return null
  const level = levels.docs[0] as any
  return typeof level.location === 'string' ? level.location : (level.location?.id ?? null)
}

// ── Reservations ───────────────────────────────────────────────────────────────

// Reserve stock when a variant is added to a cart
export async function reserveStock(
  payload: Payload,
  variantId: string,
  quantity: number,
  locationId: string,
  cartId: string,
) {
  const level = await getInventoryLevel(payload, variantId, locationId)

  if (level.availableQuantity < quantity) {
    throw new Error(
      `Insufficient stock. Available: ${level.availableQuantity}, requested: ${quantity}.`,
    )
  }

  const newReserved = level.reservedQuantity + quantity
  const newAvailable = level.stockedQuantity - newReserved

  await payload.update({
    collection: 'inventory-levels',
    id: level.id,
    data: { reservedQuantity: newReserved, availableQuantity: newAvailable },
  })

  await createMovement(payload, {
    variantId,
    locationId,
    type: 'reserved',
    quantity: -quantity,
    quantityAfter: newAvailable,
    reason: `Cart ${cartId}`,
  })
}

// Release a reservation — called on cart abandonment or item removal
export async function releaseReservation(
  payload: Payload,
  variantId: string,
  quantity: number,
  locationId: string,
  cartId: string,
) {
  const level = await getInventoryLevel(payload, variantId, locationId)

  const newReserved = Math.max(0, level.reservedQuantity - quantity)
  const newAvailable = level.stockedQuantity - newReserved

  await payload.update({
    collection: 'inventory-levels',
    id: level.id,
    data: { reservedQuantity: newReserved, availableQuantity: newAvailable },
  })

  await createMovement(payload, {
    variantId,
    locationId,
    type: 'reservation_released',
    quantity: +quantity,
    quantityAfter: newAvailable,
    reason: `Cart abandoned or item removed: ${cartId}`,
  })
}

// ── Order fulfilment ───────────────────────────────────────────────────────────

// Commit stock on order confirmation — converts reservation into a sale
export async function commitStock(
  payload: Payload,
  variantId: string,
  quantity: number,
  locationId: string,
  orderId: string,
) {
  const level = await getInventoryLevel(payload, variantId, locationId)

  const newStocked = level.stockedQuantity - quantity
  const newReserved = Math.max(0, level.reservedQuantity - quantity)
  const newAvailable = newStocked - newReserved

  await payload.update({
    collection: 'inventory-levels',
    id: level.id,
    data: {
      stockedQuantity: newStocked,
      reservedQuantity: newReserved,
      availableQuantity: newAvailable,
    },
  })

  await createMovement(payload, {
    variantId,
    locationId,
    type: 'sale',
    quantity: -quantity,
    quantityAfter: newAvailable,
    reason: `Order ${orderId}`,
    orderId,
  })

  // Fire low-stock alert if we've crossed the threshold
  if (newAvailable <= level.lowStockThreshold) {
    await flagLowStock(payload, variantId, locationId, newAvailable)
  }
}

// ── Returns ────────────────────────────────────────────────────────────────────

export async function returnStock(
  payload: Payload,
  variantId: string,
  quantity: number,
  locationId: string,
  orderId: string,
  userId?: string,
) {
  const level = await getInventoryLevel(payload, variantId, locationId)

  const newStocked = level.stockedQuantity + quantity
  const newAvailable = newStocked - level.reservedQuantity

  await payload.update({
    collection: 'inventory-levels',
    id: level.id,
    data: { stockedQuantity: newStocked, availableQuantity: newAvailable },
  })

  await createMovement(payload, {
    variantId,
    locationId,
    type: 'return',
    quantity: +quantity,
    quantityAfter: newAvailable,
    reason: `Return: Order ${orderId}`,
    orderId,
    userId,
  })
}

// ── Manual operations ──────────────────────────────────────────────────────────

// Restock — goods received from a supplier / purchase order
export async function restockVariant(
  payload: Payload,
  variantId: string,
  quantity: number,
  locationId: string,
  reason: string,
  userId?: string,
) {
  const level = await getInventoryLevel(payload, variantId, locationId)

  const newStocked = level.stockedQuantity + quantity
  const newAvailable = newStocked - level.reservedQuantity

  await payload.update({
    collection: 'inventory-levels',
    id: level.id,
    data: { stockedQuantity: newStocked, availableQuantity: newAvailable },
  })

  await createMovement(payload, {
    variantId,
    locationId,
    type: 'restock',
    quantity: +quantity,
    quantityAfter: newAvailable,
    reason,
    userId,
  })
}

// Manual adjustment — corrects discrepancies after a physical stock count
export async function adjustStock(
  payload: Payload,
  variantId: string,
  newStockedQuantity: number,
  locationId: string,
  reason: string,
  userId?: string,
) {
  const level = await getInventoryLevel(payload, variantId, locationId)

  const delta = newStockedQuantity - level.stockedQuantity
  const newAvailable = Math.max(0, newStockedQuantity - level.reservedQuantity)

  await payload.update({
    collection: 'inventory-levels',
    id: level.id,
    data: {
      stockedQuantity: newStockedQuantity,
      availableQuantity: newAvailable,
    },
  })

  await createMovement(payload, {
    variantId,
    locationId,
    type: 'adjustment',
    quantity: delta,
    quantityAfter: newAvailable,
    reason,
    userId,
  })
}

// Transfer stock between locations (e.g. warehouse → retail store)
export async function transferStock(
  payload: Payload,
  variantId: string,
  quantity: number,
  fromLocationId: string,
  toLocationId: string,
  reason: string,
  userId?: string,
) {
  const from = await getInventoryLevel(payload, variantId, fromLocationId)

  if (from.availableQuantity < quantity) {
    throw new Error(`Insufficient stock at source location for transfer.`)
  }

  // Decrement source
  const fromNewStocked = from.stockedQuantity - quantity
  const fromNewAvailable = fromNewStocked - from.reservedQuantity

  await payload.update({
    collection: 'inventory-levels',
    id: from.id,
    data: { stockedQuantity: fromNewStocked, availableQuantity: fromNewAvailable },
  })

  await createMovement(payload, {
    variantId,
    locationId: fromLocationId,
    type: 'transfer_out',
    quantity: -quantity,
    quantityAfter: fromNewAvailable,
    reason,
    userId,
  })

  // Increment destination — create the level if it doesn't exist yet
  let to: any
  try {
    to = await getInventoryLevel(payload, variantId, toLocationId)
  } catch {
    to = await payload.create({
      collection: 'inventory-levels',
      data: {
        variant: parseInt(variantId),
        location: parseInt(toLocationId),
        stockedQuantity: 0,
        reservedQuantity: 0,
        availableQuantity: 0,
        lowStockThreshold: 5,
      },
    })
  }

  const toNewStocked = to.stockedQuantity + quantity
  const toNewAvailable = toNewStocked - to.reservedQuantity

  await payload.update({
    collection: 'inventory-levels',
    id: to.id,
    data: { stockedQuantity: toNewStocked, availableQuantity: toNewAvailable },
  })

  await createMovement(payload, {
    variantId,
    locationId: toLocationId,
    type: 'transfer_in',
    quantity: +quantity,
    quantityAfter: toNewAvailable,
    reason,
    userId,
  })
}

// ── Private helpers ────────────────────────────────────────────────────────────

async function getInventoryLevel(payload: Payload, variantId: string, locationId: string) {
  const result = await payload.find({
    collection: 'inventory-levels',
    where: {
      and: [
        { 'variant.value': { equals: variantId } },
        { 'location.value': { equals: locationId } },
      ],
    },
    limit: 1,
  })

  if (!result.docs.length) {
    throw new Error(
      `No inventory level found for variant "${variantId}" at location "${locationId}". ` +
        `Create one in the admin panel first.`,
    )
  }

  return result.docs[0] as any
}

type MovementType =
  | 'transfer_out'
  | 'restock'
  | 'sale'
  | 'return'
  | 'adjustment'
  | 'damage'
  | 'transfer_in'
  | 'reserved'
  | 'reservation_released'

async function createMovement(payload: Payload, data: MovementInput) {
  await payload.create({
    collection: 'stock-movements',
    data: {
      variant: parseInt(data.variantId),
      location: parseInt(data.locationId),
      type: data.type as MovementType,
      quantity: data.quantity,
      quantityAfter: data.quantityAfter,
      reason: data.reason,
      order: parseInt(data.orderId ?? ''),
      createdBy: parseInt(data.userId ?? ''),
    },
  })
}

async function flagLowStock(
  payload: Payload,
  variantId: string,
  locationId: string,
  currentStock: number,
) {
  // TODO: wire up to your notification system (email, Slack, etc.)
  // For now, log to console — replace with sendLowStockEmail() or similar.
  console.warn(
    `[LOW STOCK] Variant ${variantId} at location ${locationId}: ${currentStock} units remaining.`,
  )
}
