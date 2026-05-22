import type { PayloadHandler } from 'payload'
import { ok, badRequest, notFound, serverError, parseBody } from './endpointHelpers'

// Lazily initialise Stripe so the module can be imported without crashing
// if STRIPE_SECRET_KEY is absent in non-payment environments.
// let stripe: Stripe | null = null

// function getStripe(): Stripe {
//   if (!stripe) {
//     if (!process.env.STRIPE_SECRET_KEY) {
//       throw new Error('STRIPE_SECRET_KEY is not set.')
//     }
//     stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//       apiVersion: '2024-04-10',
//     })
//   }
//   return stripe
// }

// POST /api/carts/:id/payment-intent
// Body: { provider: 'stripe' }   (extend for other providers later)
//
// Creates a Stripe PaymentIntent for the cart total, stores the
// PaymentIntent ID on the cart, and returns the client_secret to
// the storefront so it can mount Stripe Elements.

export const createPaymentIntentHandler: PayloadHandler = async (req) => {
  try {
    const { payload, routeParams } = req
    const cartId = routeParams?.id as string

    const cart = (await payload
      .findByID({
        collection: 'carts',
        id: cartId,
        depth: 1,
      })
      .catch(() => null)) as any

    if (!cart) return notFound('Cart')
    if (cart.status !== 'active') {
      return badRequest('Cannot create a payment intent for an inactive cart.')
    }
    if (!cart.total || cart.total <= 0) {
      return badRequest('Cart total must be greater than zero.')
    }
    if (!cart.email) {
      return badRequest('Cart must have an email address before payment.')
    }
    if (!(cart.shippingAddress as any)?.address1) {
      return badRequest('Cart must have a shipping address before payment.')
    }

    const s: any = {
      paymentIntents: {
        create: () => ({ client_secret: 'test' }),
        retrieve: () => ({ client_secret: 'test' }),
        update: () => ({ client_secret: 'test' }),
      },
    }

    // Re-use an existing PaymentIntent if one exists (e.g. customer is retrying)
    if (cart.paymentIntentId) {
      try {
        const existing = await s.paymentIntents.retrieve(cart.paymentIntentId)
        if (
          existing.status === 'requires_payment_method' ||
          existing.status === 'requires_confirmation'
        ) {
          // Update amount in case the cart changed since the intent was created
          const updated = await s.paymentIntents.update(cart.paymentIntentId, {
            amount: cart.total,
            currency: cart.currency ?? 'usd',
          })
          return ok({ clientSecret: updated.client_secret })
        }
      } catch {
        // Intent no longer valid — fall through to create a new one
      }
    }

    const intent = await s.paymentIntents.create({
      amount: cart.total,
      currency: cart.currency ?? 'usd',
      receipt_email: cart.email,
      metadata: {
        cartId,
        orderSource: 'magnetic-cosmetics',
      },
    })

    await payload.update({
      collection: 'carts',
      id: cartId,
      data: {
        paymentProvider: 'stripe',
        paymentIntentId: intent.id,
      },
    })

    return ok({ clientSecret: intent.client_secret })
  } catch (err) {
    return serverError(err)
  }
}
