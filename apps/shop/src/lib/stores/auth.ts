import { create } from "zustand";
import { persist } from "zustand/middleware";

// Persists the customer JWT in localStorage so sessions survive page reloads.
// Token is passed per-request to cmsRequest() — never stored in a cookie
// so it's safe for a Vite/React SPA. For SSR, use httpOnly cookies instead.

type AuthStore = {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
  isAuthenticated: () => boolean;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      setToken: (token) => set({ token }),
      clearToken: () => set({ token: null }),
      isAuthenticated: () => Boolean(get().token),
    }),
    { name: "magnetic-auth" },
  ),
);
