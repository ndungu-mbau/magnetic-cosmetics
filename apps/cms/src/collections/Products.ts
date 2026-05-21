import type { CollectionConfig } from 'payload'

// Mirrors Medusa's Product model.
// A product is a fragrance title (e.g. "Oud Noir").
// The actual purchasable units live in ProductVariants.

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    group: 'Shop',
    useAsTitle: 'title',
    defaultColumns: ['title', 'brand', 'category', 'status'],
  },
  access: {
    read: () => true,
  },
  fields: [
    // ── Identity ──────────────────────────────────────────────────────────────
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'Display name. e.g. "Oud Noir"' },
    },
    {
      // Mirrors Medusa's `handle`
      name: 'handle',
      type: 'text',
      unique: true,
      required: true,
      admin: { description: 'URL slug. e.g. "oud-noir"' },
    },
    {
      name: 'subtitle',
      type: 'text',
      admin: { description: 'Short tagline shown under the product title.' },
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      // Mirrors Medusa's `thumbnail`
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      // Additional product images
      name: 'images',
      type: 'array',
      admin: { description: 'Additional product images shown in the gallery.' },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },

    // ── Fragrance-specific metadata ───────────────────────────────────────────
    {
      name: 'brand',
      type: 'text',
      admin: { description: 'The perfume house or brand. e.g. "Maison Magnetic"' },
    },
    {
      // Perfume type — cologne, perfume, etc.
      name: 'fragranceType',
      type: 'select',
      options: [
        { label: 'Eau de Parfum (EDP)', value: 'edp' },
        { label: 'Eau de Toilette (EDT)', value: 'edt' },
        { label: 'Eau de Cologne (EDC)', value: 'edc' },
        { label: 'Parfum / Extrait', value: 'parfum' },
        { label: 'Eau Fraîche', value: 'eau-fraiche' },
        { label: 'Body Mist', value: 'body-mist' },
        { label: 'Solid Perfume', value: 'solid' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'gender',
      type: 'select',
      options: [
        { label: 'Unisex', value: 'unisex' },
        { label: "Men's", value: 'men' },
        { label: "Women's", value: 'women' },
      ],
      defaultValue: 'unisex',
      admin: { position: 'sidebar' },
    },
    {
      // Fragrance family: Oriental, Floral, Woody, etc.
      name: 'fragranceFamily',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Floral', value: 'floral' },
        { label: 'Oriental / Amber', value: 'oriental' },
        { label: 'Woody', value: 'woody' },
        { label: 'Fresh / Citrus', value: 'fresh' },
        { label: 'Aquatic', value: 'aquatic' },
        { label: 'Gourmand', value: 'gourmand' },
        { label: 'Fougère', value: 'fougere' },
        { label: 'Chypre', value: 'chypre' },
        { label: 'Musk', value: 'musk' },
        { label: 'Oud', value: 'oud' },
      ],
    },
    {
      // Scent notes — top/heart/base
      name: 'scentNotes',
      type: 'group',
      fields: [
        {
          name: 'top',
          type: 'text',
          admin: { description: 'Comma-separated. e.g. "Bergamot, Pink Pepper"' },
        },
        {
          name: 'heart',
          type: 'text',
          admin: { description: 'Comma-separated. e.g. "Rose, Jasmine, Oud"' },
        },
        {
          name: 'base',
          type: 'text',
          admin: { description: 'Comma-separated. e.g. "Sandalwood, Amber, Musk"' },
        },
      ],
    },
    {
      name: 'longevity',
      type: 'select',
      options: [
        { label: 'Very Weak (1-2 hrs)', value: 'very-weak' },
        { label: 'Weak (2-4 hrs)', value: 'weak' },
        { label: 'Moderate (4-6 hrs)', value: 'moderate' },
        { label: 'Long-lasting (6-9 hrs)', value: 'long-lasting' },
        { label: 'Very Long-lasting (9+ hrs)', value: 'very-long-lasting' },
      ],
    },
    {
      name: 'sillage',
      type: 'select',
      admin: { description: 'How far the scent projects from the wearer.' },
      options: [
        { label: 'Intimate (skin-close)', value: 'intimate' },
        { label: 'Soft', value: 'soft' },
        { label: 'Moderate', value: 'moderate' },
        { label: 'Strong', value: 'strong' },
        { label: 'Enormous', value: 'enormous' },
      ],
    },

    // ── Organisation ──────────────────────────────────────────────────────────
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'product-categories',
      admin: { position: 'sidebar' },
    },
    {
      name: 'collection',
      type: 'relationship',
      relationTo: 'product-collections',
      admin: { position: 'sidebar' },
    },

    // ── Commerce metadata ─────────────────────────────────────────────────────
    {
      // Mirrors Medusa's product status: draft | published | rejected
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'draft',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      // Mirrors Medusa's `discountable`
      name: 'discountable',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Allow discount codes to apply to this product.',
      },
    },
    {
      name: 'tags',
      type: 'array',
      admin: { description: 'Used for search and filtering.' },
      fields: [{ name: 'tag', type: 'text' }],
    },
    {
      // Mirrors Medusa's `external_id` — for syncing with an ERP or 3PL
      name: 'externalId',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Optional ID from an external system (ERP, 3PL).',
      },
    },

    // ── SEO ───────────────────────────────────────────────────────────────────
    {
      name: 'seo',
      type: 'group',
      admin: { description: 'Overrides for search engine listings.' },
      fields: [
        { name: 'metaTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
