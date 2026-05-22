import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./utils/query-keys";
import {
  loginCustomer,
  registerCustomer,
  getMe,
  updateCustomer,
  logoutCustomer,
  forgotPassword,
  resetPassword,
  type LoginInput,
  type RegisterInput,
  type UpdateCustomerInput,
} from "@/server/endpoints/customers";
import { useAuthStore } from "@/lib/stores/auth";
import { useCartStore } from "@/lib/stores/cart";

// ── Read ───────────────────────────────────────────────────────────────────────

// Returns the authenticated customer, or null data when not logged in.
// Components can use isAuthenticated from the auth store to gate rendering
// without waiting for this query.
export function useMe() {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: queryKeys.customer.me(token ?? ""),
    queryFn: () => getMe(token!),
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 10,
    retry: false, // don't retry auth failures
  });
}

// Convenience selector — just the customer object
export function useCurrentCustomer() {
  const { data, ...rest } = useMe();
  return { customer: data?.user ?? null, ...rest };
}

// ── Auth mutations ─────────────────────────────────────────────────────────────

export function useLogin() {
  const { setToken } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => loginCustomer(input),
    onSuccess: (data) => {
      setToken(data.token);
      // Seed the cache so useMe() resolves instantly without a second request
      queryClient.setQueryData(queryKeys.customer.me(data.token), {
        user: data.user,
      });
    },
  });
}

export function useRegister() {
  const { setToken } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegisterInput) => registerCustomer(input),
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(queryKeys.customer.me(data.token), {
        user: data.user,
      });
    },
  });
}

export function useLogout() {
  const { token, clearToken } = useAuthStore();
  const { clearCartId } = useCartStore();
  const queryClient = useQueryClient();

  const clear = () => {
    clearToken();
    clearCartId();
    queryClient.clear();
  };

  return useMutation({
    mutationFn: () => logoutCustomer(token!),
    onSuccess: clear,
    // Clear locally even if the server-side logout call fails
    onError: clear,
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
  });
}

export function useResetPassword() {
  const { setToken } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { token: string; password: string }) =>
      resetPassword(input),
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(queryKeys.customer.me(data.token), {
        user: data.user,
      });
    },
  });
}

// ── Profile mutations ──────────────────────────────────────────────────────────

export function useUpdateProfile() {
  const token = useAuthStore((s) => s.token);
  const { customer } = useCurrentCustomer();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCustomerInput) =>
      updateCustomer(customer!.id.toString(), data, token!),
    onSuccess: (updatedCustomer) => {
      // Update cache directly — no refetch needed
      queryClient.setQueryData(queryKeys.customer.me(token!), {
        user: updatedCustomer,
      });
    },
  });
}

// Convenience wrapper — only updates addresses
export function useUpdateAddresses() {
  const { customer } = useCurrentCustomer();
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addresses: NonNullable<UpdateCustomerInput["addresses"]>) =>
      updateCustomer(customer!.id.toString(), { addresses }, token!),
    onSuccess: (updatedCustomer) => {
      queryClient.setQueryData(queryKeys.customer.me(token!), {
        user: updatedCustomer,
      });
    },
  });
}
