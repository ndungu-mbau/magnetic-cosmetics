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
import { InventoryLevels } from './collections/InventoryLevels'
import { StockLocations } from './collections/StockLocations'
import { StockMovements } from './collections/StockMovements'

// ── Endpoints ──────────────────────────────────────────────────────────────────
import { recalculateCartHandler } from './utils/recalculateCart'
import { applyDiscountHandler, removeDiscountHandler } from './utils/cartDiscount'
import { getShippingMethodsHandler, setShippingMethodHandler } from './utils/shippingMethods'
import { createPaymentIntentHandler } from './utils/createPaymentIntent'
import {
  adjustStockHandler,
  restockHandler,
  transferStockHandler,
} from './utils/inventoryManagement'
import { fulfilOrderHandler, cancelOrderHandler, returnOrderHandler } from './utils/orderManagement'
import { releaseAbandonedCartsHandler } from './utils/cronTasks'

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

    // Inventory
    InventoryLevels,
    StockLocations,
    StockMovements,
  ],

  // ── Custom endpoints ─────────────────────────────────────────────────────────
  endpoints: [
    // Cart
    {
      path: '/carts/:id/recalculate',
      method: 'post',
      handler: recalculateCartHandler,
    },
    {
      path: '/carts/:id/discount',
      method: 'post',
      handler: applyDiscountHandler,
    },
    {
      path: '/carts/:id/discount',
      method: 'delete',
      handler: removeDiscountHandler,
    },
    {
      path: '/carts/:id/shipping-method',
      method: 'post',
      handler: setShippingMethodHandler,
    },
    {
      path: '/carts/:id/payment-intent',
      method: 'post',
      handler: createPaymentIntentHandler,
    },

    // Shipping
    {
      path: '/shipping-methods',
      method: 'get',
      handler: getShippingMethodsHandler,
    },

    // Payment webhooks (no auth — signature verified internally)
    // {
    //   path: '/payment-webhook/stripe',
    //   method: 'post',
    //   handler: stripeWebhookHandler,
    // },

    // Orders
    {
      path: '/orders/:id/fulfil',
      method: 'post',
      handler: fulfilOrderHandler,
    },
    {
      path: '/orders/:id/cancel',
      method: 'post',
      handler: cancelOrderHandler,
    },
    {
      path: '/orders/:id/return',
      method: 'post',
      handler: returnOrderHandler,
    },

    // Inventory (admin only — enforced inside each handler)
    {
      path: '/inventory/adjust',
      method: 'post',
      handler: adjustStockHandler,
    },
    {
      path: '/inventory/restock',
      method: 'post',
      handler: restockHandler,
    },
    {
      path: '/inventory/transfer',
      method: 'post',
      handler: transferStockHandler,
    },

    // Cron tasks
    {
      path: '/tasks/release-abandoned-carts',
      method: 'get',
      handler: releaseAbandonedCartsHandler,
    },
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
  cors: [process.env.SHOP_URL || 'http://localhost:3001'],

  csrf: [process.env.SHOP_URL || 'http://localhost:3001'],
})
