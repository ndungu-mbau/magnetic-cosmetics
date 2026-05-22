import type { CollectionConfig } from 'payload'

export const InventoryLevels: CollectionConfig = {
  slug: 'inventory-levels',
  admin: {
    group: 'Inventory',
    useAsTitle: 'id',
    defaultColumns: [
      'variant',
      'location',
      'stockedQuantity',
      'reservedQuantity',
      'availableQuantity',
    ],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'variant',
      type: 'relationship',
      relationTo: 'product-variants',
      required: true,
    },
    {
      name: 'location',
      type: 'relationship',
      relationTo: 'stock-locations',
      required: true,
    },

    // ── Quantities ─────────────────────────────────────────────────────────
    {
      // Total physical units on the shelf
      // Mirrors Medusa's `stocked_quantity`
      name: 'stockedQuantity',
      type: 'number',
      defaultValue: 0,
      required: true,
      min: 0,
    },
    {
      // Units held by active carts (not yet purchased)
      // Mirrors Medusa's `reserved_quantity`
      // Incremented when an item is added to cart; decremented on order or cart abandonment
      name: 'reservedQuantity',
      type: 'number',
      defaultValue: 0,
      required: true,
      min: 0,
      admin: {
        readOnly: true,
        description: 'Managed automatically. Units held by active carts.',
      },
    },
    {
      // Computed: stockedQuantity − reservedQuantity
      // Mirrors Medusa's `available_quantity`
      // Stored for fast reads — kept in sync by inventory hooks
      name: 'availableQuantity',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Computed automatically. stockedQuantity − reservedQuantity.',
      },
    },

    // ── Thresholds ────────────────────────────────────────────────────────
    {
      // When availableQuantity drops to or below this, trigger a low-stock alert
      name: 'lowStockThreshold',
      type: 'number',
      defaultValue: 5,
    },
    {
      // Reorder point — useful for purchasing/procurement workflows
      name: 'reorderPoint',
      type: 'number',
      admin: { description: 'Trigger a restock when stock falls to this level.' },
    },
    {
      name: 'reorderQuantity',
      type: 'number',
      admin: { description: 'How many units to reorder when reorderPoint is hit.' },
    },
  ],
}
