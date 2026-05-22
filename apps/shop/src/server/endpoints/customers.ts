import { cmsRequest } from "../client";
import type { Customer } from "@magnetic/types";

// ── Auth shapes ────────────────────────────────────────────────────────────────

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

export type AuthResponse = {
  token: string;
  exp: number;
  user: Customer;
};

export type CustomerAddress = {
  id?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  postalCode: string;
  countryCode: string;
  phone?: string;
  isDefault?: boolean;
};

export type UpdateCustomerInput = Partial<
  Pick<Customer, "firstName" | "lastName" | "phone">
> & {
  addresses?: CustomerAddress[];
};

// ── Endpoints ──────────────────────────────────────────────────────────────────

// POST /api/customers/login
export async function loginCustomer(input: LoginInput): Promise<AuthResponse> {
  return cmsRequest<AuthResponse>("/customers/login", undefined, {
    method: "POST",
    body: input,
  });
}

// POST /api/customers
export async function registerCustomer(
  input: RegisterInput,
): Promise<AuthResponse> {
  return cmsRequest<AuthResponse>("/customers", undefined, {
    method: "POST",
    body: input,
  });
}

// GET /api/customers/me
export async function getMe(token: string): Promise<{ user: Customer }> {
  return cmsRequest<{ user: Customer }>("/customers/me", undefined, { token });
}

// PATCH /api/customers/:id
export async function updateCustomer(
  id: string,
  data: UpdateCustomerInput,
  token: string,
): Promise<Customer> {
  return cmsRequest<Customer>(`/customers/${id}`, undefined, {
    method: "PATCH",
    body: data,
    token,
  });
}

// POST /api/customers/logout
export async function logoutCustomer(
  token: string,
): Promise<{ message: string }> {
  return cmsRequest<{ message: string }>("/customers/logout", undefined, {
    method: "POST",
    token,
  });
}

// POST /api/customers/forgot-password
export async function forgotPassword(
  email: string,
): Promise<{ message: string }> {
  return cmsRequest<{ message: string }>(
    "/customers/forgot-password",
    undefined,
    {
      method: "POST",
      body: { email },
    },
  );
}

// POST /api/customers/reset-password
export async function resetPassword(input: {
  token: string;
  password: string;
}): Promise<AuthResponse> {
  return cmsRequest<AuthResponse>("/customers/reset-password", undefined, {
    method: "POST",
    body: input,
  });
}
