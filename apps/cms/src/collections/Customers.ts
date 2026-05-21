import type { CollectionConfig } from 'payload'

// Mirrors Medusa's Customer model.
// Uses Payload's built-in auth so customers can register, log in, and
// access their order history from the storefront.

export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: {
    group: 'Commerce',
    useAsTitle: 'email',
    defaultColumns: ['firstName', 'lastName', 'email', 'hasAccount', 'createdAt'],
  },
  // Payload's built-in auth — handles hashing, sessions, JWT, password reset
  auth: {
    tokenExpiration: 7 * 24 * 60 * 60, // 7 days
    verify: false,                       // set true to require email verification
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,           // 10-minute lockout after max attempts
  },
  access: {
    // Customers can only read their own document
    read: ({ req: { user } }) => {
      if (!user) return false
      return { id: { equals: user.id } }
    },
    create: () => true,       // allow public registration
    update: ({ req: { user } }) => {
      if (!user) return false
      return { id: { equals: user.id } }
    },
    delete: () => false,      // soft-delete only — handle via admin
  },
  fields: [
    // ── Personal details ──────────────────────────────────────────────────────
    {
      name: 'firstName',
      type: 'text',
    },
    {
      name: 'lastName',
      type: 'text',
    },
    {
      // Mirrors Medusa's `phone`
      name: 'phone',
      type: 'text',
    },

    // ── Commerce flags ────────────────────────────────────────────────────────
    {
      // Mirrors Medusa's `has_account`
      // True when the guest has created a full account
      name: 'hasAccount',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },

    // ── Addresses ─────────────────────────────────────────────────────────────
    // Stored as an array so customers can save multiple delivery addresses.
    // Mirrors Medusa's Address model.
    {
      name: 'addresses',
      type: 'array',
      fields: [
        { name: 'firstName', type: 'text' },
        { name: 'lastName', type: 'text' },
        { name: 'company', type: 'text' },
        { name: 'address1', type: 'text', required: true },
        { name: 'address2', type: 'text' },
        { name: 'city', type: 'text', required: true },
        { name: 'province', type: 'text', admin: { description: 'State / Province / County' } },
        { name: 'postalCode', type: 'text', required: true },
        { name: 'countryCode', type: 'text', required: true, admin: { description: 'ISO 3166-1 alpha-2. e.g. "KE"' } },
        { name: 'phone', type: 'text' },
        { name: 'isDefault', type: 'checkbox', defaultValue: false },
      ],
    },

    // ── Metadata ──────────────────────────────────────────────────────────────
    {
      name: 'externalId',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Optional ID from an external CRM or loyalty system.',
      },
    },
  ],
}
