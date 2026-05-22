import type { Payload } from 'payload'
import { releaseReservation, getBestFulfilmentLocation } from './inventoryService'

// Releases inventory reservations for carts that have been idle for
// longer than RESERVATION_TTL_MINUTES, then marks them as abandoned.
//
// Run this on a schedule — every 15–30 minutes is typical:
//
//   Option A: Vercel / Netlify Cron
//     GET /api/tasks/release-abandoned-carts  (protected with CRON_SECRET)
//
//   Option B: node-cron inside a long-running server
//     cron.schedule('*/30 * * * *', () => releaseAbandonedCarts(payload))
//
//   Option C: Payload's built-in scheduled tasks (v3.x task queue)

const RESERVATION_TTL_MINUTES = 30

export async function releaseAbandonedCarts(payload: Payload): Promise<{
  processed: number
  errors: number
}> {
  const cutoff = new Date(Date.now() - RESERVATION_TTL_MINUTES * 60 * 1000).toISOString()

  const abandonedCarts = await payload.find({
    collection: 'carts',
    where: {
      and: [{ status: { equals: 'active' } }, { updatedAt: { less_than: cutoff } }],
    },
    depth: 2,
    limit: 100,
  })

  let processed = 0
  let errors = 0

  for (const cart of abandonedCarts.docs as any[]) {
    try {
      // Release reservations for each line item
      for (const item of cart.items ?? []) {
        const variant = item.variant
        if (!variant?.manageInventory) continue

        const locationId = await getBestFulfilmentLocation(payload, variant.id)
        if (!locationId) continue

        await releaseReservation(payload, variant.id, item.quantity, locationId, cart.id)
      }

      await payload.update({
        collection: 'carts',
        id: cart.id,
        data: { status: 'abandoned' },
      })

      processed++
    } catch (err) {
      console.error(`[releaseAbandonedCarts] Error processing cart ${cart.id}:`, err)
      errors++
    }
  }

  console.log(
    `[releaseAbandonedCarts] Processed ${processed} carts, ${errors} errors. ` +
      `(TTL: ${RESERVATION_TTL_MINUTES}min, cutoff: ${cutoff})`,
  )

  return { processed, errors }
}
