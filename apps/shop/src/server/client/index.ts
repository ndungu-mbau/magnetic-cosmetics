// ── Base fetch client for the Payload CMS REST API ────────────────────────────
//
// All requests go through cmsRequest(). It handles:
//   - Base URL resolution from VITE_CMS_URL
//   - Authorization header injection (JWT)
//   - Consistent error shaping via CMSError
//   - Query string serialisation

import { env } from "@/env";

const CMS_URL = env.VITE_CMS_URL;

// ── Shared response types ──────────────────────────────────────────────────────

export type PaginatedResponse<T> = {
  docs: T[];
  totalDocs: number;
  totalPages: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
};

// Typed error — TanStack Query exposes this from useQuery().error
export class CMSError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "CMSError";
    this.status = status;
  }
}

// ── Request config ─────────────────────────────────────────────────────────────

export type CMSRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
};

// Payload accepts these as query param value types
export type QueryParams = Record<
  string,
  string | number | boolean | undefined | null
>;

// ── Core request function ──────────────────────────────────────────────────────

export async function cmsRequest<T>(
  path: string,
  params?: QueryParams,
  options: CMSRequestOptions = {},
): Promise<T> {
  const url = new URL(`/api${path}`, CMS_URL);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value != null) url.searchParams.set(key, String(value));
    });
  }

  const headers: HeadersInit = { "Content-Type": "application/json" };

  if (options.token) {
    headers["Authorization"] = `JWT ${options.token}`;
  }

  const res = await fetch(url.toString(), {
    method: options.method ?? "GET",
    headers,
    body: options.body != null ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const errBody = await res.json();
      message =
        errBody.errors?.[0]?.message ??
        errBody.message ??
        errBody.error ??
        message;
    } catch {
      // keep statusText
    }
    throw new CMSError(message, res.status);
  }

  // 204 No Content — nothing to parse
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}
