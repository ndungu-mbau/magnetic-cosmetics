import type { CollectionConfig } from 'payload'

// Mirrors Medusa's Order + OrderItem models.
// Orders are created programmatically from the storefront (not via the admin form).
// The admin panel is used to manage, update status, and fulfil them.

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    group: 'Commerce',
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'customer', 'status', 'total', 'createdAt'],
  },
  access: {
    // Admins can read all; customers can only read their own
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.collection === 'users') return true  // admin
      return { 'customer.value': { equals: user.id } }
    },
    create: () => true,   // created by storefront checkout flow
    update: ({ req: { user } }) => {
      if (!user) return false
      return user.collection === 'users'  // admins only
    },
    delete: () => false,
  },
  fields: [
    // ── Identity ──────────────────────────────────────────────────────────────
    {
      name: 'orderNumber',
      type: 'text',
      unique: true,
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Human-readable order ID. e.g. "MC-00123"',
      },
    },

    // ── Status ────────────────────────────────────────────────────────────────
    {
      // Mirrors Medusa's order fulfillment + payment status in a single field
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Requires Action', value: 'requires_action' },
      ],
      defaultValue: 'pending',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      // Mirrors Medusa's `payment_status`
      name: 'paymentStatus',
      type: 'select',
      options: [
        { label: 'Awaiting', value: 'awaiting' },
        { label: 'Captured', value: 'captured' },
        { label: 'Partially Refunded', value: 'partially_refunded' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Not Paid', value: 'not_paid' },
      ],
      defaultValue: 'awaiting',
      required: true,
      admin: { position: 'sidebar' },
    },

    // ── Customer ──────────────────────────────────────────────────────────────
    {
      // polymorphicRelationship — supports both registered customers + guests
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      admin: { position: 'sidebar' },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Always stored — covers guest checkouts too.',
      },
    },

    // ── Line items ────────────────────────────────────────────────────────────
    // Mirrors Medusa's OrderItem model.
    // Data is denormalised at time of purchase (title, price) to survive
    // future product edits without corrupting order history.
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'variant',
          type: 'relationship',
          relationTo: 'product-variants',
          required: true,
        },
        {
          // Snapshot of variant title at purchase time
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          // Snapshot of product title at purchase time
          name: 'productTitle',
          type: 'text',
          required: true,
        },
        {
          name: 'thumbnail',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
        },
        {
          // Unit price in smallest currency unit at time of purchase
          name: 'unitPrice',
          type: 'number',
          required: true,
        },
        {
          // Subtotal = unitPrice × quantity (after any line-level discounts)
          name: 'subtotal',
          type: 'number',
          required: true,
        },
        {
          name: 'sku',
          type: 'text',
        },
      ],
    },

    // ── Addresses ─────────────────────────────────────────────────────────────
    // Inlined at time of purchase — mirrors Medusa's address snapshots on orders
    {
      name: 'shippingAddress',
      type: 'group',
      fields: [
        { name: 'firstName', type: 'text' },
        { name: 'lastName', type: 'text' },
        { name: 'company', type: 'text' },
        { name: 'address1', type: 'text', required: true },
        { name: 'address2', type: 'text' },
        { name: 'city', type: 'text', required: true },
        { name: 'province', type: 'text' },
        { name: 'postalCode', type: 'text', required: true },
        { name: 'countryCode', type: 'text', required: true },
        { name: 'phone', type: 'text' },
      ],
    },
    {
      name: 'billingAddress',
      type: 'group',
      fields: [
        { name: 'firstName', type: 'text' },
        { name: 'lastName', type: 'text' },
        { name: 'company', type: 'text' },
        { name: 'address1', type: 'text', required: true },
        { name: 'address2', type: 'text' },
        { name: 'city', type: 'text', required: true },
        { name: 'province', type: 'text' },
        { name: 'postalCode', type: 'text', required: true },
        { name: 'countryCode', type: 'text', required: true },
        { name: 'phone', type: 'text' },
      ],
    },

    // ── Totals ────────────────────────────────────────────────────────────────
    // All amounts in smallest currency unit (cents)
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'usd',
      required: true,
      admin: { description: 'ISO 4217 currency code. e.g. "kes", "usd"' },
    },
    {
      name: 'subtotal',
      type: 'number',
      required: true,
      admin: { description: 'Sum of line item subtotals before discounts and shipping.' },
    },
    {
      name: 'discountTotal',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'shippingTotal',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'taxTotal',
      type: 'number',
      defaultValue: 0,
    },
    {
      // Final amount charged to the customer
      name: 'total',
      type: 'number',
      required: true,
    },

    // ── Payment ───────────────────────────────────────────────────────────────
    {
      name: 'paymentProvider',
      type: 'text',
      admin: { description: 'e.g. "stripe", "mpesa", "paystack"' },
    },
    {
      name: 'paymentId',
      type: 'text',
      admin: { description: 'Provider-side transaction/payment intent ID.' },
    },

    // ── Shipping / Fulfillment ────────────────────────────────────────────────
    {
      name: 'shippingMethod',
      type: 'text',
      admin: { description: 'e.g. "Standard Delivery", "Express"' },
    },
    {
      name: 'trackingNumber',
      type: 'text',
    },
    {
      name: 'trackingUrl',
      type: 'text',
    },
    {
      name: 'shippedAt',
      type: 'date',
    },
    {
      name: 'deliveredAt',
      type: 'date',
    },

    // ── Notes ─────────────────────────────────────────────────────────────────
    {
      name: 'customerNote',
      type: 'textarea',
      admin: { description: 'Note left by the customer at checkout.' },
    },
    {
      name: 'internalNote',
      type: 'textarea',
      admin: { description: 'Internal note visible to admins only.' },
    },
  ],
}
