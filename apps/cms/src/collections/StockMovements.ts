import type { CollectionConfig } from 'payload'

export const StockMovements: CollectionConfig = {
  slug: 'stock-movements',
  admin: {
    group: 'Inventory',
    useAsTitle: 'id',
    defaultColumns: ['variant', 'location', 'type', 'quantity', 'createdAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => false, // movements are immutable
    delete: () => false,
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
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Purchase (Restock)', value: 'restock' }, // stock arrived
        { label: 'Sale', value: 'sale' }, // order confirmed
        { label: 'Return', value: 'return' }, // customer returned
        { label: 'Manual Adjustment', value: 'adjustment' }, // admin correction
        { label: 'Damage / Loss', value: 'damage' }, // written off
        { label: 'Transfer Out', value: 'transfer_out' }, // moved to another location
        { label: 'Transfer In', value: 'transfer_in' }, // received from another location
        { label: 'Reserved', value: 'reserved' }, // cart hold
        { label: 'Reservation Released', value: 'reservation_released' }, // cart abandoned
      ],
    },
    {
      // Positive = stock in, Negative = stock out
      name: 'quantity',
      type: 'number',
      required: true,
      admin: {
        description: 'Use positive numbers for stock in, negative for stock out.',
      },
    },
    {
      // Running total of stockedQuantity after this movement
      name: 'quantityAfter',
      type: 'number',
      required: true,
      admin: { readOnly: true },
    },
    {
      // What triggered this movement
      name: 'reason',
      type: 'text',
      admin: { description: 'e.g. "PO-2025-041", "Order MC-00123", "Damaged in transit"' },
    },
    {
      // Reference to the order that caused this movement (if applicable)
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true },
    },
  ],
}
