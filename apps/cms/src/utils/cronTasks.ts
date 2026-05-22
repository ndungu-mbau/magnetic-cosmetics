import type { PayloadHandler } from 'payload'
import { releaseAbandonedCarts } from './releaseAbandonedCarts'
import { ok, forbidden, serverError } from './endpointHelpers'

// GET /api/tasks/release-abandoned-carts
//
// Triggered by a cron job (Vercel Cron, GitHub Actions, etc.)
// Protected by a shared secret in the Authorization header:
//
//   Authorization: Bearer <CRON_SECRET>
//
// Vercel Cron example (vercel.json):
//   {
//     "crons": [{
//       "path": "/api/tasks/release-abandoned-carts",
//       "schedule": "*/30 * * * *"
//     }]
//   }

export const releaseAbandonedCartsHandler: PayloadHandler = async (req) => {
  try {
    const cronSecret = process.env.CRON_SECRET
    const authHeader = req.headers.get('authorization')

    if (cronSecret) {
      if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
        return forbidden('Invalid or missing cron secret.')
      }
    }

    const result = await releaseAbandonedCarts(req.payload)

    return ok({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    return serverError(err)
  }
}
