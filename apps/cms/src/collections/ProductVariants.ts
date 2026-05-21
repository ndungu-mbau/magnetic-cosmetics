import type { CollectionConfig } from 'payload'

// Mirrors Medusa's ProductVariant model.
// Each variant is a purchasable SKU — a specific size/concentration of a fragrance.
// e.g. "Oud Noir – 50ml EDP" and "Oud Noir – 100ml EDP" are two variants.

export const ProductVariants: CollectionConfig = {
  slug: 'product-variants',
  admin: {
    group: 'Shop',
    useAsTitle: 'title',
    defaultColumns: ['title', 'product', 'sku', 'price', 'inventoryQuantity'],
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
      admin: { description: 'Variant display name. e.g. "50ml" or "Travel Size – 10ml"' },
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      admin: { position: 'sidebar' },
    },

    // ── Variant-specific image (e.g. a different bottle size) ─────────────────
    {
      name: 'images',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },

    // ── Fragrance variant options ──────────────────────────────────────────────
    {
      // Volume in ml — the primary differentiator for fragrance variants
      name: 'volume',
      type: 'number',
      admin: { description: 'Volume in ml. e.g. 30, 50, 100' },
    },
    {
      // Some brands sell the same scent in different concentrations per size
      name: 'concentration',
      type: 'select',
      options: [
        { label: 'Eau de Parfum (EDP)', value: 'edp' },
        { label: 'Eau de Toilette (EDT)', value: 'edt' },
        { label: 'Eau de Cologne (EDC)', value: 'edc' },
        { label: 'Parfum / Extrait', value: 'parfum' },
        { label: 'Eau Fraîche', value: 'eau-fraiche' },
      ],
    },

    // ── Pricing ───────────────────────────────────────────────────────────────
    {
      // Price in smallest currency unit (cents) — mirrors Medusa's MoneyAmount
      name: 'price',
      type: 'number',
      required: true,
      admin: { description: 'Price in smallest currency unit (e.g. 5000 = $50.00).' },
    },
    {
      // Original/compare-at price for sale items
      name: 'originalPrice',
      type: 'number',
      admin: { description: 'Pre-sale price to show a "was/now" comparison.' },
    },

    // ── Identifiers ───────────────────────────────────────────────────────────
    {
      // Mirrors Medusa's `sku`
      name: 'sku',
      type: 'text',
      unique: true,
      admin: { description: 'Stock Keeping Unit. e.g. "ON-EDP-50"' },
    },
    {
      // Mirrors Medusa's `barcode`
      name: 'barcode',
      type: 'text',
    },
    {
      name: 'ean',
      type: 'text',
      admin: { description: 'European Article Number (EAN-13).' },
    },
    {
      name: 'upc',
      type: 'text',
      admin: { description: 'Universal Product Code (UPC-A).' },
    },

    // ── Inventory ─────────────────────────────────────────────────────────────
    {
      // Mirrors Medusa's `manage_inventory`
      name: 'manageInventory',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Track stock quantity for this variant.',
      },
    },
    {
      // Mirrors Medusa's `inventory_quantity`
      name: 'inventoryQuantity',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
    {
      // Mirrors Medusa's `allow_backorder`
      name: 'allowBackorder',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Allow purchases even when out of stock.',
      },
    },

    // ── Shipping ──────────────────────────────────────────────────────────────
    {
      name: 'weight',
      type: 'number',
      admin: { description: 'Weight in grams.' },
    },
    {
      name: 'height',
      type: 'number',
      admin: { description: 'Height in mm.' },
    },
    {
      name: 'width',
      type: 'number',
      admin: { description: 'Width in mm.' },
    },
    {
      name: 'length',
      type: 'number',
      admin: { description: 'Length in mm.' },
    },
    {
      name: 'originCountry',
      type: 'text',
      admin: { description: 'ISO 3166-1 alpha-2 country code. e.g. "FR"' },
    },
    {
      // Harmonized System code for customs
      name: 'hsCode',
      type: 'text',
      admin: { description: 'HS tariff code for international shipping.' },
    },

    // ── Misc ──────────────────────────────────────────────────────────────────
    {
      // Controls display order in the storefront variant selector
      // Mirrors Medusa's `variant_rank`
      name: 'variantRank',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Display order in the variant selector. Lower = first.',
      },
    },
    {
      name: 'externalId',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Optional ID from an external system (ERP, 3PL).',
      },
    },
  ],
}
