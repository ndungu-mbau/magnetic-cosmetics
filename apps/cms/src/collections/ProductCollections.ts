import type { CollectionConfig } from 'payload'

// Mirrors Medusa's ProductCollection model.
// Used for curated groupings like "Summer Edit", "Bestsellers", "Gift Sets"
// Collections are different from categories — they're editorial, not taxonomic.

export const ProductCollections: CollectionConfig = {
  slug: 'product-collections',
  admin: {
    group: 'Shop',
    useAsTitle: 'title',
    defaultColumns: ['title', 'handle'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      // Mirrors Medusa's `handle` field
      name: 'handle',
      type: 'text',
      unique: true,
      required: true,
      admin: {
        description: 'URL-safe identifier. e.g. "summer-edit"',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
