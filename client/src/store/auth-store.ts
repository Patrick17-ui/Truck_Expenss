import { User } from "@/types";
import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_URL = import.meta.env.VITE_API_URL;

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            toast("Email ou mot de passe invalide");
            set({ error: "Invalid email or password", isLoading: false });
            return Promise.reject("Invalid email or password");
          }

          const data = await response.json();
          localStorage.setItem("token", data.token);
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "An unknown error occurred",
            isLoading: false,
          });
        }
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      isAdmin: () => {
        return get().user?.role === "ADMIN";
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
