import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MockUser = {
  email: string;
  name: string;
};

type AuthState = {
  user: MockUser | null;
  login: (email: string, name?: string) => void;
  logout: () => void;
};

// Static, client-only mock auth. Replace with Lovable Cloud auth later.
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (email, name) =>
        set({ user: { email, name: name || email.split("@")[0] } }),
      logout: () => set({ user: null }),
    }),
    { name: "mc-auth" },
  ),
);
