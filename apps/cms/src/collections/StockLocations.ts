import type { CollectionConfig } from 'payload'

export const StockLocations: CollectionConfig = {
  slug: 'stock-locations',
  admin: {
    group: 'Inventory',
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'isActive'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'e.g. "Nairobi Warehouse", "Westgate Pop-Up"' },
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Warehouse', value: 'warehouse' },
        { label: 'Retail Store', value: 'store' },
        { label: '3PL / Fulfillment Centre', value: '3pl' },
      ],
      defaultValue: 'warehouse',
      admin: { position: 'sidebar' },
    },
    {
      name: 'address',
      type: 'group',
      fields: [
        { name: 'address1', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'countryCode', type: 'text' },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
