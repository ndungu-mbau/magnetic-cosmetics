// Generates a human-readable, sequential-ish order number.
// Format: MC-<timestamp in base36 uppercase>
// e.g. "MC-LK3M2P"
//
// In production with high order volume, replace this with a database
// sequence (PostgreSQL SEQUENCE) to guarantee strict ordering and
// zero collisions under concurrency.

import randomatic from 'randomatic'

export function generateOrderNumber(): string {
  const random = randomatic('A0', 8)
  return `MC-${random}`
}
