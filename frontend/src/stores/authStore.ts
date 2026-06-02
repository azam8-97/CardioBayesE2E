import { create } from "zustand";

type AuthState = {
  token: string | null;
  refreshToken: string | null;
  user: { email?: string; full_name?: string; role?: string } | null;
  setToken: (t: string | null) => void;
  setRefreshToken: (t: string | null) => void;
  setUser: (u: AuthState["user"]) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  refreshToken: null,
  user: null,
  setToken: (t) => set({ token: t }),
  setRefreshToken: (t) => set({ refreshToken: t }),
  setUser: (u) => set({ user: u }),
  logout: () => set({ token: null, refreshToken: null, user: null }),
}));

export default useAuthStore;
