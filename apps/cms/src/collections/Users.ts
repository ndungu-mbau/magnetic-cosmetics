import type { CollectionConfig } from 'payload'

// Admin/staff users — separate from Customers.
// These are the people who manage the shop via the Payload admin panel.

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    group: 'Settings',
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
    },
    {
      name: 'lastName',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Super Admin', value: 'super_admin' },
        { label: 'Admin', value: 'admin' },
        { label: 'Staff', value: 'staff' },
      ],
      defaultValue: 'staff',
      required: true,
      admin: { position: 'sidebar' },
    },
  ],
}
