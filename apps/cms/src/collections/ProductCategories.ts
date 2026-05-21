import type { CollectionConfig } from 'payload'

// Mirrors Medusa's ProductCategory model.
// Supports nested categories (e.g. Fragrance → Cologne → Aquatic Cologne)

export const ProductCategories: CollectionConfig = {
  slug: 'product-categories',
  admin: {
    group: 'Shop',
    useAsTitle: 'name',
    defaultColumns: ['name', 'handle', 'parent', 'isActive'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      // URL-safe identifier — e.g. "eau-de-parfum"
      // Mirrors Medusa's `handle` field
      name: 'handle',
      type: 'text',
      unique: true,
      required: true,
      admin: {
        description: 'URL-safe identifier. e.g. "eau-de-parfum"',
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
    {
      // Self-referential relationship for nested categories
      name: 'parent',
      type: 'relationship',
      relationTo: 'product-categories',
      admin: {
        description: 'Leave empty for a top-level category.',
      },
    },
    {
      name: 'rank',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Controls display order. Lower numbers appear first.',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'isInternal',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Internal categories are hidden from the storefront.',
      },
    },
  ],
}
