import type { CollectionConfig } from 'payload'

// Mirrors Medusa's Discount + DiscountRule models.
// Supports percentage, fixed amount, and free shipping discounts.

export const Discounts: CollectionConfig = {
  slug: 'discounts',
  admin: {
    group: 'Commerce',
    useAsTitle: 'code',
    defaultColumns: ['code', 'type', 'value', 'isActive', 'endsAt'],
  },
  access: {
    read: () => true,  // storefront needs to validate codes
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      unique: true,
      required: true,
      admin: { description: 'Coupon code. e.g. "SUMMER20"' },
    },
    {
      // Mirrors Medusa's DiscountRule `type`
      name: 'type',
      type: 'select',
      options: [
        { label: 'Percentage', value: 'percentage' },
        { label: 'Fixed Amount', value: 'fixed' },
        { label: 'Free Shipping', value: 'free_shipping' },
      ],
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'value',
      type: 'number',
      admin: {
        description: 'For percentage: 0–100. For fixed: amount in smallest currency unit.',
      },
    },
    {
      // Minimum cart value required for the discount to apply
      name: 'minimumAmount',
      type: 'number',
      admin: { description: 'Minimum order total (in smallest currency unit).' },
    },
    {
      // Total number of times this code can be used
      name: 'usageLimit',
      type: 'number',
    },
    {
      // How many times it's been used — auto-incremented by the storefront
      name: 'usageCount',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
    },
    {
      // Restrict to a single use per customer
      name: 'isOncePerCustomer',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'startsAt',
      type: 'date',
      admin: { position: 'sidebar' },
    },
    {
      name: 'endsAt',
      type: 'date',
      admin: { position: 'sidebar' },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      // Optionally restrict the discount to specific products
      name: 'applicableProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      admin: {
        description: 'Leave empty to apply to all products.',
      },
    },
  ],
}
