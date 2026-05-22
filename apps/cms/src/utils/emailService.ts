// Email notification stubs.
//
// Wire up a real provider by installing one of:
//   - @payloadcms/email-nodemailer  (SMTP / SendGrid / Mailgun)
//   - @payloadcms/email-resend      (Resend)
//
// Each function here is called by the relevant endpoint or utility.
// Replace the console.log stubs with your actual send logic.

export type OrderConfirmationData = {
  to: string
  orderNumber: string
  firstName?: string
  items: Array<{
    productTitle: string
    variantTitle: string
    quantity: number
    unitPrice: number
    subtotal: number
  }>
  subtotal: number
  discountTotal: number
  shippingTotal: number
  taxTotal: number
  total: number
  currency: string
  shippingAddress: Record<string, string | undefined>
}

export type ShipmentData = {
  to: string
  orderNumber: string
  firstName?: string
  trackingNumber?: string
  trackingUrl?: string
  shippingMethod?: string
}

export type PasswordResetData = {
  to: string
  resetUrl: string
}

export type LowStockData = {
  to: string
  variantTitle: string
  productTitle: string
  locationName: string
  availableQuantity: number
}

// ── Transactional emails ───────────────────────────────────────────────────────

export async function sendOrderConfirmationEmail(
  data: OrderConfirmationData,
): Promise<void> {
  // TODO: replace with your email provider
  console.log(`[EMAIL] Order confirmation → ${data.to} (Order ${data.orderNumber})`)
}

export async function sendShipmentNotificationEmail(
  data: ShipmentData,
): Promise<void> {
  console.log(
    `[EMAIL] Shipment notification → ${data.to} (Order ${data.orderNumber}, tracking: ${data.trackingNumber ?? 'N/A'})`,
  )
}

export async function sendPasswordResetEmail(
  data: PasswordResetData,
): Promise<void> {
  console.log(`[EMAIL] Password reset → ${data.to}`)
}

// ── Internal / operational emails ─────────────────────────────────────────────

export async function sendLowStockAlert(data: LowStockData): Promise<void> {
  console.warn(
    `[EMAIL] Low stock alert: ${data.productTitle} – ${data.variantTitle} ` +
      `at ${data.locationName}: ${data.availableQuantity} units remaining.`,
  )
}

export async function sendNewOrderAlert(
  orderNumber: string,
  total: number,
  currency: string,
): Promise<void> {
  console.log(
    `[EMAIL] New order alert: ${orderNumber} — ${(total / 100).toFixed(2)} ${currency.toUpperCase()}`,
  )
}
