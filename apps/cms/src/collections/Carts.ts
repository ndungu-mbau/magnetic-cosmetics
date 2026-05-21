import type { CollectionConfig } from 'payload'

import { Customers } from './Customers'
import { Media } from './Media'
import { Users } from './Users'
import { Orders } from './Orders'
import { Discounts } from './Discounts'
import { ProductVariants } from './ProductVariants'

// A Cart is a pre-order in progress. It mirrors Medusa's Cart model.
// On successful payment, the storefront calls a Payload endpoint that
// converts the cart into an Order and deletes (or archives) the cart.

export const Carts: CollectionConfig = {
  slug: 'carts',
  admin: {
    group: 'Commerce',
    useAsTitle: 'id',
    defaultColumns: ['id', 'customer', 'email', 'status', 'total', 'updatedAt'],
  },
  access: {
    read: () => true,   // validated server-side by cart token or session
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    // ── Status ──────────────────────────────────────────────────────────────
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },   // converted to order
        { label: 'Abandoned', value: 'abandoned' },
      ],
      defaultValue: 'active',
      required: true,
      admin: { position: 'sidebar' },
    },

    // ── Customer (optional — guests have no customer doc yet) ────────────────
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      admin: { position: 'sidebar' },
    },
    {
      // Always collected — covers guest carts too
      name: 'email',
      type: 'email',
      admin: { position: 'sidebar' },
    },

    // ── Line items ───────────────────────────────────────────────────────────
    {
      name: 'items',
      type: 'array',
      fields: [
        {
          name: 'variant',
          type: 'relationship',
          relationTo: 'product-variants',
          required: true,
        },
        { name: 'quantity', type: 'number', required: true, min: 1 },
        // Snapshot price at time of adding to cart
        { name: 'unitPrice', type: 'number', required: true },
        // Denormalised for display without extra fetches
        { name: 'variantTitle', type: 'text' },
        { name: 'productTitle', type: 'text' },
        { name: 'thumbnail', type: 'upload', relationTo: 'media' },
        { name: 'sku', type: 'text' },
      ],
    },

    // ── Addresses ────────────────────────────────────────────────────────────
    {
      name: 'shippingAddress',
      type: 'group',
      fields: [
        { name: 'firstName', type: 'text' },
        { name: 'lastName', type: 'text' },
        { name: 'address1', type: 'text' },
        { name: 'address2', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'province', type: 'text' },
        { name: 'postalCode', type: 'text' },
        { name: 'countryCode', type: 'text' },
        { name: 'phone', type: 'text' },
      ],
    },
    {
      name: 'billingAddress',
      type: 'group',
      fields: [
        { name: 'firstName', type: 'text' },
        { name: 'lastName', type: 'text' },
        { name: 'address1', type: 'text' },
        { name: 'address2', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'province', type: 'text' },
        { name: 'postalCode', type: 'text' },
        { name: 'countryCode', type: 'text' },
        { name: 'phone', type: 'text' },
      ],
    },
    {
      name: 'sameAsShipping',
      type: 'checkbox',
      defaultValue: true,
    },

    // ── Shipping method ──────────────────────────────────────────────────────
    {
      name: 'shippingMethod',
      type: 'group',
      fields: [
        { name: 'label', type: 'text' },         // e.g. "Standard Delivery"
        { name: 'price', type: 'number' },        // in smallest currency unit
        { name: 'estimatedDays', type: 'number' },
      ],
    },

    // ── Discount ─────────────────────────────────────────────────────────────
    {
      name: 'discount',
      type: 'relationship',
      relationTo: 'discounts',
    },
    {
      name: 'discountTotal',
      type: 'number',
      defaultValue: 0,
    },

    // ── Totals (recomputed server-side on every cart update) ─────────────────
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'usd',
      required: true,
    },
    {
      name: 'subtotal', type: 'number', defaultValue: 0,
    },
    {
      name: 'shippingTotal', type: 'number', defaultValue: 0,
    },
    {
      name: 'taxTotal', type: 'number', defaultValue: 0,
    },
    {
      name: 'total', type: 'number', defaultValue: 0,
    },

    // ── Payment intent (created before final confirmation) ───────────────────
    {
      name: 'paymentProvider',
      type: 'text',
      admin: { description: 'e.g. "stripe", "mpesa", "paystack"' },
    },
    {
      // Stripe PaymentIntent ID / Paystack reference / M-Pesa checkout request ID
      name: 'paymentIntentId',
      type: 'text',
    },

    // ── Metadata ─────────────────────────────────────────────────────────────
    {
      // Cart token stored in a cookie for anonymous/guest carts
      name: 'cartToken',
      type: 'text',
      unique: true,
    },
    {
      name: 'completedOrderId',
      type: 'relationship',
      relationTo: 'orders',
      admin: {
        description: 'Populated once the cart converts to an order.',
        readOnly: true,
      },
    },
    {
      name: 'customerNote',
      type: 'textarea',
    },
  ],
}