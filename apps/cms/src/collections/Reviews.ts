import type { CollectionConfig } from 'payload'

// Product reviews — not in Medusa core but standard for a fragrance shop.
// Tied to both a Product and optionally a verified Order for trust signals.

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    group: 'Commerce',
    useAsTitle: 'headline',
    defaultColumns: ['product', 'customer', 'rating', 'status', 'createdAt'],
  },
  access: {
    read: ({ doc }) => doc?.status === 'approved',  // only show approved reviews
    create: () => true,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      admin: { position: 'sidebar' },
    },
    {
      // Link to a verified order for "Verified Purchase" badge
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      admin: { position: 'sidebar' },
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      admin: { position: 'sidebar' },
    },
    {
      name: 'headline',
      type: 'text',
      required: true,
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
    },
    {
      // Admin-moderated status
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
      defaultValue: 'pending',
      required: true,
      admin: { position: 'sidebar' },
    },
  ],
}
