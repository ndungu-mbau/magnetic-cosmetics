import type { PayloadRequest } from 'payload'
import type { NextResponse } from 'next/server'

// ── Response helpers ───────────────────────────────────────────────────────────
// Consistent JSON response shapes used across all custom endpoints.

export function ok<T>(data: T, status = 200): Response {
  return Response.json(data, { status })
}

export function created<T>(data: T): Response {
  return Response.json(data, { status: 201 })
}

export function badRequest(message: string): Response {
  return Response.json({ error: message }, { status: 400 })
}

export function unauthorized(message = 'Unauthorized'): Response {
  return Response.json({ error: message }, { status: 401 })
}

export function forbidden(message = 'Forbidden'): Response {
  return Response.json({ error: message }, { status: 403 })
}

export function notFound(resource = 'Resource'): Response {
  return Response.json({ error: `${resource} not found.` }, { status: 404 })
}

export function conflict(message: string): Response {
  return Response.json({ error: message }, { status: 409 })
}

export function serverError(error: unknown): Response {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred.'
  console.error('[Endpoint Error]', error)
  return Response.json({ error: message }, { status: 500 })
}

// ── Request parsing ────────────────────────────────────────────────────────────

export async function parseBody<T = Record<string, unknown>>(
  req: PayloadRequest,
): Promise<T> {
  if (req.json) return req.json() as Promise<T>
  const text = await req.text?.()
  if (!text) return {} as T
  try {
    return JSON.parse(text) as T
  } catch {
    return {} as T
  }
}

// ── Auth helpers ───────────────────────────────────────────────────────────────

// Returns the authenticated customer from the request, or null.
// Payload populates req.user from the Authorization: JWT <token> header.
export function getCustomerFromRequest(req: PayloadRequest) {
  const user = req.user as any
  if (!user || user.collection !== 'customers') return null
  return user
}

// Returns the authenticated admin user from the request, or null.
export function getAdminFromRequest(req: PayloadRequest) {
  const user = req.user as any
  if (!user || user.collection !== 'users') return null
  return user
}
