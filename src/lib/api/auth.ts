import { apiFetch } from "@/lib/api/client";
import type { AuthUserResponse } from "@/types/api";

export const authApi = {
  signup: (email: string, password: string) =>
    apiFetch<AuthUserResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    apiFetch<AuthUserResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => apiFetch<{ ok: boolean }>("/api/auth/logout", { method: "POST" }),
  me: () => apiFetch<AuthUserResponse>("/api/auth/me"),
};
