import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Customers } from './collections/Customers'
import { Media } from './collections/Media'
import { Carts } from './collections/Carts'
import { ProductCategories } from './collections/ProductCategories'
import { ProductCollections } from './collections/ProductCollections'
import { Products } from './collections/Products'
import { ProductVariants } from './collections/ProductVariants'
import { Orders } from './collections/Orders'
import { Discounts } from './collections/Discounts'
import { Reviews } from './collections/Reviews'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',

  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— Magnetic Cosmetics',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    // Admin
    Users,

    // Customers (storefront auth)
    Customers,

    // Assets
    Media,

    // Catalogue
    ProductCategories,
    ProductCollections,
    Products,
    ProductVariants,

    // Commerce
    Orders,
    Discounts,
    Reviews,
    Carts,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],

  //Security settings
  cors: [
    process.env.SHOP_URL || 'http://localhost:3001',
  ],

  csrf: [
    process.env.SHOP_URL || 'http://localhost:3001',
  ],
})

